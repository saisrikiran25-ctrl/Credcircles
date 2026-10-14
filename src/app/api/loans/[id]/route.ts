import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateLoanVotes } from '@/lib/domain/voting';
import { calculateLoanSchedule } from '@/lib/domain/emi';
import { PartnerEscrowService } from '@/lib/services/partnerEscrowService';
import { analyzeExposure } from '@/lib/domain/exposure';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const loanRequest = await prisma.loanRequest.findUnique({
      where: { id },
      include: {
        circle: {
          include: {
            memberships: { include: { user: true } },
          },
        },
        borrower: {
          include: {
            kycRecords: true,
            riskSnapshots: {
              orderBy: { calculatedAt: 'desc' },
              take: 1,
            },
          },
        },
        votes: {
          include: { voter: true },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
        loan: {
          include: {
            instalments: { orderBy: { instalmentNumber: 'asc' } },
            repayments: { include: { payer: true }, orderBy: { paidAt: 'desc' } },
            disbursements: { include: { lender: true } },
            mandates: true,
            restructureProposals: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Evaluate voting metrics
    const eligibleMembers = loanRequest.circle.memberships.length;
    const approvals = loanRequest.votes.filter((v) => v.decision === 'APPROVE').length;
    const rejections = loanRequest.votes.filter((v) => v.decision === 'REJECT').length;

    const voteEvaluation = evaluateLoanVotes({
      totalEligibleMembers: eligibleMembers,
      thresholdPct: loanRequest.circle.approvalThresholdPct,
      approvals,
      rejections,
      deadline: loanRequest.votingDeadline,
    });

    // Schedule calculation
    const schedule = calculateLoanSchedule(
      loanRequest.amount,
      loanRequest.proposedInterestPct,
      loanRequest.tenureMonths
    );

    // Exposure analysis
    const exposure = analyzeExposure({
      poolBalancePaise: loanRequest.circle.poolBalance,
      circleMaxLoanPaise: loanRequest.circle.maxLoanAmount,
      requestedAmountPaise: loanRequest.amount,
      borrowerExistingOutstandingPaise: 0,
      totalCircleOutstandingPaise: 0,
    });

    // Agreement template
    const maskedKyc =
      loanRequest.borrower.kycRecords[0]?.maskedNumber || 'eKYC Verified (Simulated)';
    const agreementText = PartnerEscrowService.generateLoanAgreementTemplate({
      loanId: loanRequest.id,
      borrowerName: loanRequest.borrower.name,
      borrowerMaskedKyc: maskedKyc,
      circleName: loanRequest.circle.name,
      principalRupees: loanRequest.amount / 100,
      interestRatePct: loanRequest.proposedInterestPct,
      tenureMonths: loanRequest.tenureMonths,
      totalRepayableRupees: schedule.totalRepayable / 100,
      monthlyEmiRupees: schedule.monthlyEmiBase / 100,
      mode: loanRequest.circle.complianceMode as any,
    });

    const complianceDetails = PartnerEscrowService.getComplianceDetails(
      loanRequest.circle.complianceMode as any
    );

    return NextResponse.json({
      loanRequest,
      voteEvaluation,
      schedule,
      exposure,
      agreementText,
      complianceDetails,
    });
  } catch (error) {
    console.error('Error fetching loan detail:', error);
    return NextResponse.json({ error: 'Failed to fetch loan detail' }, { status: 500 });
  }
}
