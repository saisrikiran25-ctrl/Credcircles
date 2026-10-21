export const dynamic = 'force-static'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateLoanVotes } from '@/lib/domain/voting';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { voterId, decision, comment, forceClose = false } = await request.json();

    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id },
      include: {
        circle: {
          include: { memberships: true },
        },
        votes: true,
      },
    });

    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    if (loanRequest.status !== 'VOTING' && !forceClose) {
      return NextResponse.json(
        { error: `Voting is closed for this loan (current status: ${loanRequest.status})` },
        { status: 400 }
      );
    }

    if (voterId) {
      // Upsert vote
      await prisma.vote.upsert({
        where: {
          loanRequestId_voterId: {
            loanRequestId: id,
            voterId,
          },
        },
        update: {
          decision,
          comment,
        },
        create: {
          loanRequestId: id,
          voterId,
          decision,
          comment,
        },
      });

      if (comment && comment.trim()) {
        await prisma.comment.create({
          data: {
            loanRequestId: id,
            userId: voterId,
            message: comment,
          },
        });
      }
    }

    // Refresh votes and evaluate threshold
    const updatedVotes = await prisma.vote.findMany({ where: { loanRequestId: id } });
    const eligibleMembers = loanRequest.circle.memberships.length;
    const approvals = updatedVotes.filter((v) => v.decision === 'APPROVE').length;
    const rejections = updatedVotes.filter((v) => v.decision === 'REJECT').length;

    const evaluation = evaluateLoanVotes({
      totalEligibleMembers: eligibleMembers,
      thresholdPct: loanRequest.circle.approvalThresholdPct,
      approvals,
      rejections,
      deadline: forceClose ? new Date(0) : loanRequest.votingDeadline,
    });

    let newStatus = loanRequest.status;
    if (evaluation.isApproved) {
      newStatus = 'APPROVED';
      await prisma.loanRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
      });

      // Notify borrower that their loan was approved!
      await prisma.notification.create({
        data: {
          userId: loanRequest.borrowerId,
          circleId: loanRequest.circleId,
          title: 'Loan Request Approved!',
          message: `Your request for ₹${(loanRequest.amount / 100).toLocaleString('en-IN')} achieved the circle approval threshold (${loanRequest.circle.approvalThresholdPct}%). Ready for disbursement.`,
          type: 'DISBURSEMENT_SUCCESS',
          linkUrl: `/loans/detail?id=${loanRequest.id}`,
        },
      });
    } else if (evaluation.isRejected || (forceClose && !evaluation.isApproved)) {
      newStatus = 'REJECTED';
      await prisma.loanRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      decision,
      status: newStatus,
      evaluation,
      message: evaluation.isApproved
        ? 'Vote cast! Approval threshold met. The loan is approved!'
        : 'Vote recorded successfully.',
    });
  } catch (error) {
    console.error('Error voting on loan:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
