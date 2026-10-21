import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CIRCLE_TYPES, SUPPORTED_CITIES } from '@/lib/domain/rules';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const circles = await prisma.circle.findMany({
      include: {
        memberships: {
          include: { user: true },
        },
        loans: true,
        contributions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = circles.map((c) => {
      const activeLoans = c.loans.filter((l) => ['ACTIVE', 'OVERDUE', 'RESTRUCTURED'].includes(l.status));
      const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
      const isUserMember = userId ? c.memberships.some((m) => m.userId === userId) : false;

      return {
        ...c,
        memberCount: c.memberships.length,
        totalOutstandingPaise: totalOutstanding,
        availableLiquidityPaise: c.poolBalance,
        isUserMember,
      };
    });

    return NextResponse.json({ circles: enriched });
  } catch (error) {
    console.error('Error fetching circles:', error);
    return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      city,
      createdById,
      maxLoanAmountPaise = 2000000,
      interestRatePct = 10.0,
      approvalThresholdPct = 70.0,
      latePenaltyType = 'FLAT',
      latePenaltyValue = 5000,
      complianceMode = 'PARTNERED_ESCROW',
    } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Circle name must be at least 3 characters' }, { status: 400 });
    }

    if (interestRatePct < 8 || interestRatePct > 12) {
      return NextResponse.json({ error: 'Interest rate must be between 8% and 12% p.a.' }, { status: 400 });
    }

    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        type: type || 'College group',
        city: city || 'Hyderabad',
        createdById,
        maxLoanAmount: Number(maxLoanAmountPaise),
        interestRatePct: Number(interestRatePct),
        approvalThresholdPct: Number(approvalThresholdPct),
        latePenaltyType,
        latePenaltyValue: Number(latePenaltyValue),
        complianceMode,
        poolBalance: 0,
        memberships: {
          create: {
            userId: createdById,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
    });

    // Create default invite code
    const inviteCode = `${name.substring(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    await prisma.invite.create({
      data: {
        circleId: circle.id,
        code: inviteCode,
        inviterId: createdById,
      },
    });

    return NextResponse.json({ circle, inviteCode });
  } catch (error) {
    console.error('Error creating circle:', error);
    return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 });
  }
}
