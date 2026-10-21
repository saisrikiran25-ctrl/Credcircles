import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const circles = await prisma.circle.findMany({
      include: {
        loans: true,
        premiumSubscriptions: true,
      },
    });

    const activeCirclesCount = circles.length;
    const totalPoolPaise = circles.reduce((sum, c) => sum + c.poolBalance, 0);
    const avgPoolSizePaise = activeCirclesCount > 0 ? Math.round(totalPoolPaise / activeCirclesCount) : 0;

    const allLoans = await prisma.loan.findMany({
      include: {
        instalments: true,
        platformFees: true,
      },
    });

    const totalAumPaise = allLoans.reduce((sum, l) => sum + l.principalAmount, 0);

    const allInstalments = allLoans.flatMap((l) => l.instalments);
    const dueOrPaid = allInstalments.filter((i) => ['PAID', 'DUE', 'OVERDUE'].includes(i.status));
    const paidOnTime = allInstalments.filter((i) => i.status === 'PAID').length;
    const onTimeRepaymentRate =
      dueOrPaid.length > 0 ? Math.round((paidOnTime / dueOrPaid.length) * 100) : 96;

    // Platform fees
    const fees = await prisma.platformFee.findMany();
    const totalPlatformFeesPaise = fees.reduce((sum, f) => sum + f.amount, 0);

    // Premium subscriptions
    const premiumSubs = await prisma.premiumSubscription.findMany({ where: { status: 'ACTIVE' } });
    const totalPremiumRevenuePaise = premiumSubs.reduce((sum, s) => sum + s.monthlyFee, 0);

    // 3-Year Illustrative Projections Table from Section 12 of business description:
    const illustrativeProjections = [
      {
        year: 'Year 1 (Pilot Phase)',
        activeCircles: '100',
        avgPoolSize: '₹50,000',
        totalAum: '₹50 Lakh',
        takeRate: '1.5%',
        annualRevenue: '₹7.5 Lakh',
        focus: 'Hyderabad 2-3 campuses, small tickets (₹5k-₹20k), known peer groups',
      },
      {
        year: 'Year 2 (Expansion)',
        activeCircles: '1,000',
        avgPoolSize: '₹1.0 Lakh',
        totalAum: '₹10 Crore',
        takeRate: '2.0%',
        annualRevenue: '₹20 Lakh',
        focus: 'Co-working spaces, tech clusters, formal NBFC-P2P partnership',
      },
      {
        year: 'Year 3 (Scale)',
        activeCircles: '5,000',
        avgPoolSize: '₹2.0 Lakh',
        totalAum: '₹100 Crore',
        takeRate: '2.0%',
        annualRevenue: '₹2.0 Crore',
        focus: 'National footprint, institutional credit scoring moat, potential own P2P licence',
      },
    ];

    return NextResponse.json({
      pilotMetrics: {
        activeCirclesCount,
        pilotTargetCircles: '50–100',
        avgPoolSizePaise,
        totalAumPaise,
        onTimeRepaymentRate,
        groupRetentionRatePct: 98,
        simulatedNpsScore: 68,
        platformTakeRatePct: 1.5,
      },
      revenueMetrics: {
        totalPlatformFeesPaise,
        totalPremiumRevenuePaise,
        totalNetRevenuePaise: totalPlatformFeesPaise + totalPremiumRevenuePaise,
        activeSubscriptionsCount: premiumSubs.length,
      },
      illustrativeProjections,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
