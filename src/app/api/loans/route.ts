import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateLoanRequest } from '@/lib/domain/rules';
import { analyzeExposure } from '@/lib/domain/exposure';
import { calculateLoanSchedule } from '@/lib/domain/emi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circleId = searchParams.get('circleId');
    const borrowerId = searchParams.get('borrowerId');
    const status = searchParams.get('status');

    const where: any = {};
    if (circleId) where.circleId = circleId;
    if (borrowerId) where.borrowerId = borrowerId;
    if (status) where.status = status;

    const requests = await prisma.loanRequest.findMany({
      where,
      include: {
        circle: true,
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
        },
        loan: {
          include: {
            instalments: { orderBy: { instalmentNumber: 'asc' } },
            repayments: true,
            disbursements: { include: { lender: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ loanRequests: requests });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      circleId,
      borrowerId,
      amountPaise,
      purpose,
      tenureMonths,
      proposedInterestPct,
      isExternal = false,
    } = body;

    // 1. Validate rules
    const ruleCheck = validateLoanRequest({
      amountPaise: Number(amountPaise),
      tenureMonths: Number(tenureMonths),
      proposedInterestPct: Number(proposedInterestPct),
    });

    if (!ruleCheck.isValid) {
      return NextResponse.json({ error: ruleCheck.error }, { status: 400 });
    }

    // 2. Validate user identity & KYC
    const borrower = await prisma.user.findUnique({
      where: { id: borrowerId },
      include: { kycRecords: true },
    });

    if (!borrower || !borrower.isVerified) {
      return NextResponse.json(
        { error: 'Unverified users cannot request loans. Please complete simulated eKYC.' },
        { status: 403 }
      );
    }

    // 3. Circle check & compliance
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        memberships: true,
        loans: { where: { status: { in: ['ACTIVE', 'OVERDUE'] } } },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    if (isExternal && circle.complianceMode === 'CLOSED_CIRCLES') {
      return NextResponse.json(
        {
          error:
            'External lending is disabled in Mode C (Closed Circles). Only internal circle members may borrow.',
        },
        { status: 400 }
      );
    }

    // 4. Exposure & liquidity analysis
    const borrowerActiveLoans = circle.loans.filter((l) => l.borrowerId === borrowerId);
    const borrowerExistingOutstanding = borrowerActiveLoans.reduce(
      (sum, l) => sum + l.outstandingBalance,
      0
    );

    const exposure = analyzeExposure({
      poolBalancePaise: circle.poolBalance,
      circleMaxLoanPaise: circle.maxLoanAmount,
      requestedAmountPaise: Number(amountPaise),
      borrowerExistingOutstandingPaise: borrowerExistingOutstanding,
      totalCircleOutstandingPaise: circle.loans.reduce((sum, l) => sum + l.outstandingBalance, 0),
    });

    // 5. Create loan request with 48h voting deadline
    const votingDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const loanRequest = await prisma.loanRequest.create({
      data: {
        circleId,
        borrowerId,
        amount: Number(amountPaise),
        purpose,
        tenureMonths: Number(tenureMonths),
        proposedInterestPct: Number(proposedInterestPct),
        status: 'VOTING',
        isExternal: Boolean(isExternal),
        externalVetted: Boolean(isExternal),
        votingDeadline,
      },
    });

    // Notify other circle members to vote
    const otherMembers = circle.memberships.filter((m) => m.userId !== borrowerId);
    for (const m of otherMembers) {
      await prisma.notification.create({
        data: {
          userId: m.userId,
          circleId,
          title: `New Loan Request: ${borrower.name}`,
          message: `${borrower.name} requested ₹${(Number(amountPaise) / 100).toLocaleString('en-IN')} for ${purpose}. Cast your vote.`,
          type: 'VOTE_REQUEST',
          linkUrl: `/loans/${loanRequest.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      loanRequest,
      exposure,
      message: 'Loan request submitted successfully and opened for circle voting (48h window).',
    });
  } catch (error) {
    console.error('Error creating loan request:', error);
    return NextResponse.json({ error: 'Failed to create loan request' }, { status: 500 });
  }
}
