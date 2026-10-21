import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateLoanSchedule } from '@/lib/domain/emi';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { proposedTenureMonths, newInterestPct, reason, autoApprove = true } = await request.json();

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        circle: { include: { memberships: true } },
        borrower: true,
        instalments: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const proposal = await prisma.restructureProposal.create({
      data: {
        loanId: loan.id,
        proposedTenureMonths: Number(proposedTenureMonths),
        newInterestPct: Number(newInterestPct || loan.interestRatePct),
        reason: reason || 'Temporary hardship relief request discussed with circle peers.',
        status: autoApprove ? 'APPROVED' : 'PENDING',
      },
    });

    if (autoApprove) {
      // Update loan status to RESTRUCTURED
      await prisma.loan.update({
        where: { id: loan.id },
        data: {
          status: 'RESTRUCTURED',
          tenureMonths: Number(proposedTenureMonths),
          interestRatePct: Number(newInterestPct || loan.interestRatePct),
        },
      });

      // Notify members
      for (const m of loan.circle.memberships) {
        await prisma.notification.create({
          data: {
            userId: m.userId,
            circleId: loan.circleId,
            title: `Loan Restructured: ${loan.borrower.name}`,
            message: `Circle approved restructured ${proposedTenureMonths}-month tenure for ${loan.borrower.name}.`,
            type: 'SYSTEM',
            linkUrl: `/loans/detail?id=${loan.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Loan restructure proposal submitted and approved with circle consensus.',
    });
  } catch (error) {
    console.error('Error restructuring loan:', error);
    return NextResponse.json({ error: 'Failed to restructure loan' }, { status: 500 });
  }
}
