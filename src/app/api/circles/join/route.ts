import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json({ error: 'Invite code and user are required' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { circle: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'Only verified members can join a circle. Please complete simulated eKYC first.' },
        { status: 403 }
      );
    }

    // Check if already a member
    const existing = await prisma.membership.findUnique({
      where: {
        circleId_userId: {
          circleId: invite.circleId,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You are already a member of this circle', circleId: invite.circleId });
    }

    // Add membership
    await prisma.membership.create({
      data: {
        circleId: invite.circleId,
        userId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      circleId: invite.circleId,
      circleName: invite.circle.name,
      message: `Successfully joined ${invite.circle.name}!`,
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
  }
}
