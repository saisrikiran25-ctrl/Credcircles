export const dynamic = 'force-static'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, docType, maskedNumber } = await request.json();

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    await prisma.kycRecord.create({
      data: {
        userId,
        documentType: docType,
        maskedNumber,
        status: 'VERIFIED',
      },
    });

    return NextResponse.json({ success: true, message: 'KYC record updated to VERIFIED.' });
  } catch (error) {
    console.error('Error updating KYC record:', error);
    return NextResponse.json({ error: 'Failed to update KYC' }, { status: 500 });
  }
}
