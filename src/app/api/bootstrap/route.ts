import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user-rohan';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycRecords: true,
        memberships: {
          include: {
            circle: true,
          },
        },
        riskSnapshots: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all circles where user is a member
    const userCircleIds = user.memberships.map((m) => m.circleId);

    const circles = await prisma.circle.findMany({
      where: {
        id: { in: userCircleIds },
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    // Compute "My Position"
    // Total lent: sum of disbursements by this user
    const disbursements = await prisma.disbursement.findMany({
      where: { lenderId: userId, status: 'SUCCESS' },
    });
    const totalLentPaise = disbursements.reduce((sum, d) => sum + d.amount, 0);

    // Total borrowed: active loans where user is borrower
    const myLoans = await prisma.loan.findMany({
      where: { borrowerId: userId },
      include: {
        instalments: true,
      },
    });
    const totalBorrowedPaise = myLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalOutstandingPaise = myLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

    // Upcoming dues for user
    const upcomingInstalments = await prisma.instalment.findMany({
      where: {
        loan: { borrowerId: userId, status: { in: ['ACTIVE', 'OVERDUE'] } },
        status: { in: ['UPCOMING', 'DUE', 'OVERDUE'] },
      },
      include: {
        loan: {
          include: { circle: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Pending votes for circles user belongs to
    const pendingVotingRequests = await prisma.loanRequest.findMany({
      where: {
        circleId: { in: userCircleIds },
        status: 'VOTING',
        borrowerId: { not: userId },
        votes: {
          none: { voterId: userId },
        },
      },
      include: {
        borrower: true,
        circle: true,
        votes: true,
      },
    });

    // Recent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Lifetime contributions
    const userContributions = await prisma.contribution.findMany({
      where: { userId, status: 'COMPLETED' },
    });
    const totalContributedPaise = userContributions.reduce((sum, c) => sum + c.amount, 0);

    // Estimated earnings (share of circle interest)
    const estimatedEarningsPaise = Math.round(totalContributedPaise * 0.08); // modest ~8-10% return

    return NextResponse.json({
      user,
      circles,
      myPosition: {
        totalLentPaise,
        totalBorrowedPaise,
        totalOutstandingPaise,
        totalContributedPaise,
        netPositionPaise: totalLentPaise + totalContributedPaise - totalOutstandingPaise,
        estimatedEarningsPaise,
      },
      upcomingDues: upcomingInstalments,
      pendingVotes: pendingVotingRequests,
      notifications,
    });
  } catch (error) {
    console.error('Error in bootstrap API:', error);
    return NextResponse.json({ error: 'Failed to fetch bootstrap data' }, { status: 500 });
  }
}
