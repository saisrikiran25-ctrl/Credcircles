export const dynamic = 'force-static'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { reconcileLedger } from '@/lib/domain/ledger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: {
              include: {
                kycRecords: true,
                riskSnapshots: {
                  orderBy: { calculatedAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        contributions: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
        loanRequests: {
          include: {
            borrower: true,
            votes: {
              include: { voter: true },
            },
            loan: {
              include: {
                instalments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        loans: {
          include: {
            borrower: true,
            instalments: true,
            repayments: true,
            disbursements: {
              include: { lender: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
        },
        invites: true,
        premiumSubscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Ledger reconciliation check
    const reconciliation = reconcileLedger(circle.ledgerEntries, circle.poolBalance);

    // Compute portfolio analytics for this circle:
    const activeLoans = circle.loans.filter((l) =>
      ['ACTIVE', 'OVERDUE', 'RESTRUCTURED', 'DISBURSED'].includes(l.status)
    );
    const totalOutstandingPaise = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

    const overdueLoans = circle.loans.filter((l) => l.status === 'OVERDUE');
    const totalOverduePaise = overdueLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

    // Repayment rate calculation
    const allInstalments = circle.loans.flatMap((l) => l.instalments);
    const dueOrPaidInstalments = allInstalments.filter((i) =>
      ['PAID', 'DUE', 'OVERDUE'].includes(i.status)
    );
    const paidOnTimeCount = allInstalments.filter((i) => i.status === 'PAID').length;
    const repaymentRatePct =
      dueOrPaidInstalments.length > 0
        ? Math.round((paidOnTimeCount / dueOrPaidInstalments.length) * 100)
        : 100;

    // Per-member contribution summary
    const memberContributionsMap: Record<string, { totalPaise: number; count: number }> = {};
    for (const c of circle.contributions) {
      if (!memberContributionsMap[c.userId]) {
        memberContributionsMap[c.userId] = { totalPaise: 0, count: 0 };
      }
      memberContributionsMap[c.userId].totalPaise += c.amount;
      memberContributionsMap[c.userId].count += 1;
    }

    // Exposure by borrower
    const borrowerExposureMap: Record<string, { name: string; outstandingPaise: number }> = {};
    for (const l of activeLoans) {
      if (!borrowerExposureMap[l.borrowerId]) {
        borrowerExposureMap[l.borrowerId] = {
          name: l.borrower?.name || 'Unknown',
          outstandingPaise: 0,
        };
      }
      borrowerExposureMap[l.borrowerId].outstandingPaise += l.outstandingBalance;
    }

    const exposureList = Object.entries(borrowerExposureMap).map(([borrowerId, val]) => ({
      borrowerId,
      name: val.name,
      outstandingPaise: val.outstandingPaise,
      percentageOfPool:
        circle.poolBalance > 0
          ? Math.round((val.outstandingPaise / circle.poolBalance) * 100)
          : 0,
    }));

    // Circle Position Metrics
    const circlePosition = {
      poolBalancePaise: circle.poolBalance,
      totalOutstandingPaise,
      totalOverduePaise,
      availableLiquidityPaise: Math.max(0, circle.poolBalance - totalOutstandingPaise),
      repaymentRatePct,
      interestYieldPct: circle.interestRatePct,
      activeBorrowersCount: Object.keys(borrowerExposureMap).length,
      memberCount: circle.memberships.length,
    };

    return NextResponse.json({
      circle,
      circlePosition,
      reconciliation,
      memberContributionsMap,
      exposureList,
    });
  } catch (error) {
    console.error('Error fetching circle detail:', error);
    return NextResponse.json({ error: 'Failed to fetch circle detail' }, { status: 500 });
  }
}
