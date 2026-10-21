export const dynamic = 'force-static'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UpiService } from '@/lib/services/upiService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { instalmentId, payerId, paymentMethod = 'MANUAL_UPI' } = await request.json();

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        circle: true,
        borrower: true,
        instalments: { orderBy: { instalmentNumber: 'asc' } },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const instalment = loan.instalments.find((i) => i.id === instalmentId);
    if (!instalment) {
      return NextResponse.json({ error: 'Instalment not found' }, { status: 404 });
    }

    if (instalment.status === 'PAID') {
      return NextResponse.json({ error: 'Instalment is already paid' }, { status: 400 });
    }

    // Simulate UPI transaction
    const upiResult = UpiService.simulateTransaction('SUCCESS');
    const totalPayment = instalment.totalDue + (instalment.penaltyDue || 0);

    // Atomic update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Repayment record
      const repayment = await tx.repayment.create({
        data: {
          loanId: loan.id,
          instalmentId: instalment.id,
          payerId,
          principalAmount: instalment.principalDue,
          interestAmount: instalment.interestDue,
          penaltyAmount: instalment.penaltyDue || 0,
          totalAmount: totalPayment,
          paymentMethod,
          simulatedUpiRef: upiResult.utr,
          status: 'SUCCESS',
        },
      });

      // 2. Mark Instalment PAID
      await tx.instalment.update({
        where: { id: instalment.id },
        data: {
          principalPaid: instalment.principalDue,
          interestPaid: instalment.interestDue,
          penaltyPaid: instalment.penaltyDue || 0,
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // 3. Decrement loan outstanding balance
      const newOutstanding = Math.max(0, loan.outstandingBalance - instalment.totalDue);
      const remainingUnpaid = loan.instalments.filter(
        (i) => i.id !== instalment.id && i.status !== 'PAID'
      );
      const isFullyRepaid = remainingUnpaid.length === 0;

      await tx.loan.update({
        where: { id: loan.id },
        data: {
          outstandingBalance: newOutstanding,
          status: isFullyRepaid ? 'REPAID' : loan.status === 'OVERDUE' ? 'ACTIVE' : loan.status,
        },
      });

      // 4. Update circle pool balance (repaid principal + interest + penalty returns to pool!)
      const updatedCircle = await tx.circle.update({
        where: { id: loan.circleId },
        data: {
          poolBalance: { increment: totalPayment },
        },
      });

      // 5. Append Ledger Entries
      // Principal entry
      await tx.ledgerEntry.create({
        data: {
          circleId: loan.circleId,
          actorId: payerId,
          actorName: loan.borrower.name,
          type: 'REPAYMENT_PRINCIPAL',
          amount: instalment.principalDue,
          balanceAfter: updatedCircle.poolBalance - instalment.interestDue - (instalment.penaltyDue || 0),
          referenceId: upiResult.utr,
          description: `EMI instalment #${instalment.instalmentNumber} principal repayment`,
        },
      });

      // Interest entry
      await tx.ledgerEntry.create({
        data: {
          circleId: loan.circleId,
          actorId: payerId,
          actorName: loan.borrower.name,
          type: 'REPAYMENT_INTEREST',
          amount: instalment.interestDue,
          balanceAfter: updatedCircle.poolBalance - (instalment.penaltyDue || 0),
          referenceId: upiResult.utr,
          description: `EMI instalment #${instalment.instalmentNumber} accrued interest returned to pool`,
        },
      });

      // Penalty entry if any
      if (instalment.penaltyDue && instalment.penaltyDue > 0) {
        await tx.ledgerEntry.create({
          data: {
            circleId: loan.circleId,
            actorId: payerId,
            actorName: loan.borrower.name,
            type: 'LATE_PENALTY',
            amount: instalment.penaltyDue,
            balanceAfter: updatedCircle.poolBalance,
            referenceId: upiResult.utr,
            description: `Late payment penalty settled`,
          },
        });
      }

      return { repayment, isFullyRepaid, newOutstanding, updatedCircle };
    });

    return NextResponse.json({
      success: true,
      message: result.isFullyRepaid
        ? 'Final instalment cleared! Loan is fully settled and closed.'
        : 'Instalment successfully repaid via UPI.',
      utr: upiResult.utr,
      isFullyRepaid: result.isFullyRepaid,
      outstandingBalance: result.newOutstanding,
      newPoolBalance: result.updatedCircle.poolBalance,
    });
  } catch (error) {
    console.error('Error recording repayment:', error);
    return NextResponse.json({ error: 'Failed to record repayment' }, { status: 500 });
  }
}
