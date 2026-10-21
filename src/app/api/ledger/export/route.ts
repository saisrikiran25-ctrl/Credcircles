import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { paiseToRupees } from '@/lib/domain/currency';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circleId = searchParams.get('circleId');

    const where: any = {};
    if (circleId && circleId !== 'all') where.circleId = circleId;

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: { circle: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Timestamp',
      'Reference ID',
      'Circle',
      'Actor',
      'Entry Type',
      'Amount (INR)',
      'Pool Balance After (INR)',
      'Status',
      'Description',
    ];

    const rows = entries.map((e) => [
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${e.referenceId}"`,
      `"${e.circle?.name || 'N/A'}"`,
      `"${e.actorName || 'System'}"`,
      `"${e.type}"`,
      paiseToRupees(e.amount).toFixed(2),
      paiseToRupees(e.balanceAfter).toFixed(2),
      `"${e.status}"`,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="circlo_ledger_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting ledger CSV:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
