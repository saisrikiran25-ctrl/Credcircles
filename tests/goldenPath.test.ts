import { describe, it, expect } from 'vitest';
import { prisma } from '../src/lib/db';
import { calculateLoanSchedule } from '../src/lib/domain/emi';
import { evaluateLoanVotes } from '../src/lib/domain/voting';
import { UpiService } from '../src/lib/services/upiService';
import { KycService } from '../src/lib/services/kycService';

describe('Golden Path End-to-End Simulation Test', () => {
  const testPhone = `999000${Date.now().toString().slice(-4)}`;
  let testUserId: string;
  let testCircleId: string;
  let testLoanRequestId: string;
  let testLoanId: string;

  it('Step 1: Sign up & Simulated eKYC Verification', async () => {
    // 1. Verify PAN formatting and simulated OTP
    const kycResult = KycService.verifyDocument('PAN', 'ABCDE9876Z', '123456');
    expect(kycResult.success).toBe(true);
    expect(kycResult.maskedNumber).toBe('ABCDE****Z');

    // 2. Create user with verified status
    const user = await prisma.user.create({
      data: {
        name: 'Dev Test User',
        phone: testPhone,
        city: 'Hyderabad',
        segment: 'COLLEGE_STUDENT',
        upiVpa: 'dev.test@upi',
        isVerified: true,
        kycRecords: {
          create: {
            documentType: 'PAN',
            maskedNumber: kycResult.maskedNumber,
            status: 'VERIFIED',
          },
        },
      },
    });

    expect(user.id).toBeDefined();
    expect(user.isVerified).toBe(true);
    testUserId = user.id;
  });

  it('Step 2: Create a Credit Circle with Rules & Invite Code', async () => {
    const circle = await prisma.circle.create({
      data: {
        name: 'Golden Path Test Circle',
        type: 'College group',
        city: 'Hyderabad',
        createdById: testUserId,
        maxLoanAmount: 2000000, // ₹20,000
        interestRatePct: 10.0,
        approvalThresholdPct: 70.0,
        poolBalance: 0,
        memberships: {
          createMany: {
            data: [
              { userId: testUserId, role: 'ADMIN', status: 'ACTIVE' },
              { userId: 'demo-user-aarav', role: 'MEMBER', status: 'ACTIVE' },
              { userId: 'demo-user-rohan', role: 'MEMBER', status: 'ACTIVE' },
            ],
          },
        },
      },
    });

    expect(circle.id).toBeDefined();
    expect(circle.poolBalance).toBe(0);
    testCircleId = circle.id;
  });

  it('Step 3: Contribute ₹2,000 to Circle Pool & Verify Ledger Invariant', async () => {
    const upiResult = UpiService.simulateTransaction('SUCCESS');
    expect(upiResult.success).toBe(true);

    const amountPaise = 200000; // ₹2,000

    // Record contribution
    await prisma.contribution.create({
      data: {
        circleId: testCircleId,
        userId: testUserId,
        amount: amountPaise,
        simulatedUpiRef: upiResult.utr,
        status: 'COMPLETED',
      },
    });

    // Increment circle pool
    const updatedCircle = await prisma.circle.update({
      where: { id: testCircleId },
      data: { poolBalance: { increment: amountPaise } },
    });

    // Append to ledger
    const ledger = await prisma.ledgerEntry.create({
      data: {
        circleId: testCircleId,
        actorId: testUserId,
        actorName: 'Dev Test User',
        type: 'CONTRIBUTION',
        amount: amountPaise,
        balanceAfter: updatedCircle.poolBalance,
        referenceId: upiResult.utr,
        description: 'Test member pool contribution',
      },
    });

    expect(updatedCircle.poolBalance).toBe(200000);
    expect(ledger.balanceAfter).toBe(200000);
  });

  it('Step 4: Request Loan for ₹10,000 with 3-Month Tenure at 10% p.a.', async () => {
    const amountPaise = 1000000; // ₹10,000

    const loanRequest = await prisma.loanRequest.create({
      data: {
        circleId: testCircleId,
        borrowerId: testUserId,
        amount: amountPaise,
        purpose: 'Education & Semester Fees',
        tenureMonths: 3,
        proposedInterestPct: 10.0,
        status: 'VOTING',
        votingDeadline: new Date(Date.now() + 48 * 3600000),
      },
    });

    expect(loanRequest.status).toBe('VOTING');
    testLoanRequestId = loanRequest.id;
  });

  it('Step 5: Peer Voting Reaches 70% Threshold -> Transitions to APPROVED', async () => {
    // 3 eligible members in circle: Aarav, Rohan, and Test User
    // 70% of 3 members = Math.ceil(3 * 0.7) = 3 approvals needed!
    const members = ['demo-user-aarav', 'demo-user-rohan', testUserId];

    for (const memberId of members) {
      await prisma.vote.create({
        data: {
          loanRequestId: testLoanRequestId,
          voterId: memberId,
          decision: 'APPROVE',
          comment: 'Approved in smoke test',
        },
      });
    }

    const votes = await prisma.vote.findMany({ where: { loanRequestId: testLoanRequestId } });
    const evaluation = evaluateLoanVotes({
      totalEligibleMembers: 3,
      thresholdPct: 70,
      approvals: votes.length,
      rejections: 0,
      deadline: new Date(Date.now() + 100000),
    });

    expect(evaluation.isApproved).toBe(true);

    const approvedRequest = await prisma.loanRequest.update({
      where: { id: testLoanRequestId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });

    expect(approvedRequest.status).toBe('APPROVED');
  });

  it('Step 6: Disburse Loan via UPI & Create EMI Repayment Schedule', async () => {
    const upiResult = UpiService.simulateTransaction('SUCCESS');
    expect(upiResult.success).toBe(true);

    const schedule = calculateLoanSchedule(1000000, 10.0, 3);
    expect(schedule.totalRepayable).toBe(1025000);
    expect(schedule.instalments.length).toBe(3);

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        loanRequestId: testLoanRequestId,
        circleId: testCircleId,
        borrowerId: testUserId,
        principalAmount: 1000000,
        interestRatePct: 10.0,
        platformFeeAmount: schedule.platformFee,
        tenureMonths: 3,
        status: 'ACTIVE',
        totalRepayable: schedule.totalRepayable,
        outstandingBalance: schedule.totalRepayable,
      },
    });

    // Create instalments
    for (const item of schedule.instalments) {
      await prisma.instalment.create({
        data: {
          loanId: loan.id,
          instalmentNumber: item.instalmentNumber,
          dueDate: item.dueDate,
          principalDue: item.principalDue,
          interestDue: item.interestDue,
          totalDue: item.totalDue,
          status: 'UPCOMING',
        },
      });
    }

    testLoanId = loan.id;
    expect(loan.id).toBeDefined();
    expect(loan.outstandingBalance).toBe(1025000);
  });

  it('Step 7: Repay Instalment #1 via UPI & Update Loan & Pool Balances', async () => {
    const instalments = await prisma.instalment.findMany({
      where: { loanId: testLoanId },
      orderBy: { instalmentNumber: 'asc' },
    });
    const inst1 = instalments[0];

    const upiResult = UpiService.simulateTransaction('SUCCESS');
    expect(upiResult.success).toBe(true);

    // Record repayment
    await prisma.repayment.create({
      data: {
        loanId: testLoanId,
        instalmentId: inst1.id,
        payerId: testUserId,
        principalAmount: inst1.principalDue,
        interestAmount: inst1.interestDue,
        totalAmount: inst1.totalDue,
        paymentMethod: 'MANUAL_UPI',
        simulatedUpiRef: upiResult.utr,
        status: 'SUCCESS',
      },
    });

    // Mark instalment paid
    await prisma.instalment.update({
      where: { id: inst1.id },
      data: {
        principalPaid: inst1.principalDue,
        interestPaid: inst1.interestDue,
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Decrement loan balance
    const updatedLoan = await prisma.loan.update({
      where: { id: testLoanId },
      data: {
        outstandingBalance: { decrement: inst1.totalDue },
      },
    });

    expect(updatedLoan.outstandingBalance).toBe(1025000 - inst1.totalDue);

    // Increment pool balance
    const updatedCircle = await prisma.circle.update({
      where: { id: testCircleId },
      data: { poolBalance: { increment: inst1.totalDue } },
    });

    expect(updatedCircle.poolBalance).toBeGreaterThan(0);
  });
});
