import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateContributionAmount } from '@/lib/domain/rules';
import { UpiService } from '@/lib/services/upiService';

export async function POST(request: Request) {
  try {
    const { circleId, userId, amountPaise, note } = await request.json();

    const validation = validateContributionAmount(Number(amountPaise));
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        circleId_userId: { circleId, userId },
      },
      include: { user: true, circle: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'User is not a member of this circle' }, { status: 403 });
    }

    // Simulate UPI direct transfer confirmation
    const upiResult = UpiService.simulateTransaction('SUCCESS');

    // Atomic update: Contribution + LedgerEntry + Circle Pool Balance
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.contribution.create({
        data: {
          circleId,
          userId,
          amount: Number(amountPaise),
          simulatedUpiRef: upiResult.utr,
          status: 'COMPLETED',
          note: note || 'Monthly pool contribution',
        },
      });

      const updatedCircle = await tx.circle.update({
        where: { id: circleId },
        data: {
          poolBalance: { increment: Number(amountPaise) },
        },
      });

      const ledger = await tx.ledgerEntry.create({
        data: {
          circleId,
          actorId: userId,
          actorName: membership.user.name,
          type: 'CONTRIBUTION',
          amount: Number(amountPaise),
          balanceAfter: updatedCircle.poolBalance,
          referenceId: upiResult.utr,
          description: `Member monthly contribution recorded via UPI`,
        },
      });

      return { contribution, updatedCircle, ledger };
    });

    return NextResponse.json({
      success: true,
      message: 'Contribution successfully recorded in circle ledger!',
      utr: upiResult.utr,
      poolBalance: result.updatedCircle.poolBalance,
      reminderNote: 'Your money stays in your bank account; tracked logically in-app.',
    });
  } catch (error) {
    console.error('Error recording contribution:', error);
    return NextResponse.json({ error: 'Failed to record contribution' }, { status: 500 });
  }
}
