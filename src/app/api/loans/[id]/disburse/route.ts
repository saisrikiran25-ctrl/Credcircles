import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateLoanSchedule } from '@/lib/domain/emi';
import { UpiService } from '@/lib/services/upiService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { lenderId, outcome = 'SUCCESS' } = await request.json();

    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id },
      include: {
        circle: true,
        borrower: true,
      },
    });

    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    if (loanRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `Loan is not in approved state (current status: ${loanRequest.status})` },
        { status: 400 }
      );
    }

    const lender = await prisma.user.findUnique({ where: { id: lenderId } });
    if (!lender) {
      return NextResponse.json({ error: 'Lender not found' }, { status: 404 });
    }

    // Simulate UPI direct transfer
    const upiResult = UpiService.simulateTransaction(outcome as any);
    if (!upiResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: upiResult.errorMessage || 'UPI payment failed. Please retry.',
        },
        { status: 400 }
      );
    }

    const schedule = calculateLoanSchedule(
      loanRequest.amount,
      loanRequest.proposedInterestPct,
      loanRequest.tenureMonths
    );

    // Atomic transaction: Create Loan + Disbursement + Instalments + Platform Fee + Ledger + Update Pool
    const created = await prisma.$transaction(async (tx) => {
      // 1. Create Loan
      const loan = await tx.loan.create({
        data: {
          loanRequestId: id,
          circleId: loanRequest.circleId,
          borrowerId: loanRequest.borrowerId,
          principalAmount: loanRequest.amount,
          interestRatePct: loanRequest.proposedInterestPct,
          platformFeeAmount: schedule.platformFee,
          tenureMonths: loanRequest.tenureMonths,
          status: 'ACTIVE',
          disbursedAt: new Date(),
          totalRepayable: schedule.totalRepayable,
          outstandingBalance: schedule.totalRepayable,
        },
      });

      // 2. Create Disbursement record
      const disbursement = await tx.disbursement.create({
        data: {
          loanId: loan.id,
          lenderId,
          amount: loanRequest.amount,
          upiTransactionRef: upiResult.utr,
          status: 'SUCCESS',
        },
      });

      // 3. Create Instalment records
      for (const item of schedule.instalments) {
        await tx.instalment.create({
          data: {
            loanId: loan.id,
            instalmentNumber: item.instalmentNumber,
            dueDate: item.dueDate,
            principalDue: item.principalDue,
            interestDue: item.interestDue,
            totalDue: item.totalDue,
            status: item.instalmentNumber === 1 ? 'UPCOMING' : 'UPCOMING',
          },
        });
      }

      // 4. Create Platform Fee record (1.5%)
      await tx.platformFee.create({
        data: {
          loanId: loan.id,
          amount: schedule.platformFee,
          percentage: 1.5,
          status: 'COLLECTED',
        },
      });

      // 5. Update circle pool balance (deduct disbursed principal)
      const updatedCircle = await tx.circle.update({
        where: { id: loanRequest.circleId },
        data: {
          poolBalance: { decrement: loanRequest.amount },
        },
      });

      // 6. Append typed Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          circleId: loanRequest.circleId,
          actorId: lenderId,
          actorName: lender.name,
          type: 'DISBURSEMENT',
          amount: loanRequest.amount,
          balanceAfter: updatedCircle.poolBalance,
          referenceId: upiResult.utr,
          description: `Direct UPI loan disbursement to ${loanRequest.borrower.name} (${loanRequest.purpose})`,
        },
      });

      // 7. Update loan request status
      await tx.loanRequest.update({
        where: { id },
        data: { status: 'DISBURSED' },
      });

      // 8. Create default simulated AutoPay mandate
      await tx.mandate.create({
        data: {
          loanId: loan.id,
          borrowerId: loanRequest.borrowerId,
          vpa: loanRequest.borrower.upiVpa,
          maxAmount: schedule.monthlyEmiBase + 50000,
          status: 'ACTIVE',
          umrn: `UMRN${Date.now().toString().slice(-6)}IN`,
        },
      });

      return { loan, disbursement, updatedCircle };
    });

    return NextResponse.json({
      success: true,
      message: 'Loan successfully disbursed via UPI and recorded in ledger!',
      utr: upiResult.utr,
      loan: created.loan,
      newPoolBalance: created.updatedCircle.poolBalance,
    });
  } catch (error) {
    console.error('Error disbursing loan:', error);
    return NextResponse.json({ error: 'Failed to disburse loan' }, { status: 500 });
  }
}
