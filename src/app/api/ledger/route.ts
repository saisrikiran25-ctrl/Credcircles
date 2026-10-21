export const dynamic = 'force-static'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circleId = searchParams.get('circleId');
    const type = searchParams.get('type');

    const where: any = {};
    if (circleId && circleId !== 'all') where.circleId = circleId;
    if (type && type !== 'all') where.type = type;

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        circle: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
