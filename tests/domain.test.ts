import { describe, it, expect } from 'vitest';
import { calculateLoanSchedule } from '../src/lib/domain/emi';
import { computeRiskScore } from '../src/lib/domain/risk';
import { evaluateLoanVotes } from '../src/lib/domain/voting';
import {
  validateLoanRequest,
  validateContributionAmount,
  validatePanFormat,
  validateAadhaarFormat,
  validateUpiVpaFormat,
  SYSTEM_LIMITS,
} from '../src/lib/domain/rules';
import { reconcileLedger } from '../src/lib/domain/ledger';
import { calculateLatePenalty, determineInstalmentStatus } from '../src/lib/domain/penalties';
import { computeProportionalRiskSharing } from '../src/lib/domain/riskSharing';
import { analyzeExposure } from '../src/lib/domain/exposure';

describe('1. EMI & Interest Calculation', () => {
  it('correctly calculates simple interest for ₹10,000 at 10% p.a. for 3 months', () => {
    // Principal = ₹10,000 = 1,000,000 paise
    // Interest = 1,000,000 * 0.10 * (3 / 12) = 25,000 paise (₹250)
    // Total = 1,025,000 paise (₹10,250)
    const schedule = calculateLoanSchedule(1000000, 10.0, 3);
    expect(schedule.totalInterest).toBe(25000);
    expect(schedule.totalRepayable).toBe(1025000);
    expect(schedule.instalments.length).toBe(3);

    // Verify exact integer paise reconciliation across all instalments
    const sumPrincipal = schedule.instalments.reduce((acc, i) => acc + i.principalDue, 0);
    const sumInterest = schedule.instalments.reduce((acc, i) => acc + i.interestDue, 0);
    const sumTotal = schedule.instalments.reduce((acc, i) => acc + i.totalDue, 0);

    expect(sumPrincipal).toBe(1000000);
    expect(sumInterest).toBe(25000);
    expect(sumTotal).toBe(1025000);
  });

  it('handles rounding remainders cleanly in final instalment', () => {
    // Principal ₹10,000 (1,000,000 paise), 3 months: 1,000,000 / 3 = 333333.33...
    const schedule = calculateLoanSchedule(1000000, 12.0, 3);
    const sumPrincipal = schedule.instalments.reduce((acc, i) => acc + i.principalDue, 0);
    expect(sumPrincipal).toBe(1000000);
    expect(schedule.instalments[0].principalDue).toBe(333333);
    expect(schedule.instalments[1].principalDue).toBe(333333);
    expect(schedule.instalments[2].principalDue).toBe(333334); // final adjustment
  });

  it('calculates default 1.5% platform fee accurately', () => {
    // 1.5% of ₹10,000 = ₹150 (15,000 paise)
    const schedule = calculateLoanSchedule(1000000, 10.0, 3);
    expect(schedule.platformFee).toBe(15000);
  });
});

describe('2. Risk Score Engine', () => {
  it('computes LOW risk for verified user with perfect on-time record', () => {
    const result = computeRiskScore({
      totalInstalmentsDue: 10,
      onTimeInstalmentsPaid: 10,
      lateInstalments: 0,
      platformAgeDays: 90,
      totalVotesReceived: 10,
      positiveVotesReceived: 9,
      lifetimeContributionsPaise: 2000000,
      currentOutstandingPaise: 500000,
      isVerified: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.riskBand).toBe('LOW');
    expect(result.hasHistory).toBe(true);
    expect(result.factors.length).toBe(5);
  });

  it('computes HIGH risk for unverified user with late instalments', () => {
    const result = computeRiskScore({
      totalInstalmentsDue: 4,
      onTimeInstalmentsPaid: 1,
      lateInstalments: 3,
      platformAgeDays: 10,
      totalVotesReceived: 5,
      positiveVotesReceived: 2,
      lifetimeContributionsPaise: 50000,
      currentOutstandingPaise: 1500000,
      isVerified: false,
    });

    expect(result.score).toBeLessThan(50);
    expect(result.riskBand).toBe('HIGH');
  });
});

describe('3. Voting & Approval Threshold Logic', () => {
  it('enforces 70% threshold with exact ceiling on 4 members (needs 3 approvals)', () => {
    const deadline = new Date(Date.now() + 1000000);

    // 2 approvals out of 4 is 50% -> not yet approved
    const partial = evaluateLoanVotes({
      totalEligibleMembers: 4,
      thresholdPct: 70,
      approvals: 2,
      rejections: 0,
      deadline,
    });
    expect(partial.requiredApprovals).toBe(3);
    expect(partial.isApproved).toBe(false);
    expect(partial.isVotingOpen).toBe(true);

    // 3 approvals out of 4 is 75% >= 70% -> approved!
    const approved = evaluateLoanVotes({
      totalEligibleMembers: 4,
      thresholdPct: 70,
      approvals: 3,
      rejections: 0,
      deadline,
    });
    expect(approved.isApproved).toBe(true);
    expect(approved.status).toBe('APPROVED');
  });

  it('detects early rejection when impossible to reach threshold', () => {
    const deadline = new Date(Date.now() + 1000000);
    // 4 members, needs 3 approvals. 2 reject -> max possible approvals is 2 < 3 -> rejected!
    const rejected = evaluateLoanVotes({
      totalEligibleMembers: 4,
      thresholdPct: 70,
      approvals: 1,
      rejections: 2,
      deadline,
    });
    expect(rejected.isRejected).toBe(true);
    expect(rejected.status).toBe('REJECTED');
  });
});

describe('4. Rule & Parameter Validation', () => {
  it('validates interest rate strictly within 8% - 12% p.a.', () => {
    expect(validateLoanRequest({ amountPaise: 1000000, tenureMonths: 3, proposedInterestPct: 10 }).isValid).toBe(true);
    expect(validateLoanRequest({ amountPaise: 1000000, tenureMonths: 3, proposedInterestPct: 7.5 }).isValid).toBe(false);
    expect(validateLoanRequest({ amountPaise: 1000000, tenureMonths: 3, proposedInterestPct: 13 }).isValid).toBe(false);
  });

  it('validates ticket size between ₹5,000 and ₹20,000', () => {
    expect(validateLoanRequest({ amountPaise: 400000, tenureMonths: 3, proposedInterestPct: 10 }).isValid).toBe(false); // ₹4,000
    expect(validateLoanRequest({ amountPaise: 2500000, tenureMonths: 3, proposedInterestPct: 10 }).isValid).toBe(false); // ₹25,000
    expect(validateLoanRequest({ amountPaise: 1500000, tenureMonths: 3, proposedInterestPct: 10 }).isValid).toBe(true); // ₹15,000
  });

  it('validates contribution between ₹500 and ₹5,000', () => {
    expect(validateContributionAmount(40000).isValid).toBe(false); // ₹400
    expect(validateContributionAmount(50000).isValid).toBe(true);  // ₹500
    expect(validateContributionAmount(500000).isValid).toBe(true); // ₹5,000
    expect(validateContributionAmount(600000).isValid).toBe(false); // ₹6,000
  });

  it('validates PAN and Aadhaar formats correctly', () => {
    expect(validatePanFormat('ABCDE1234F')).toBe(true);
    expect(validatePanFormat('12345ABCDE')).toBe(false);
    expect(validateAadhaarFormat('123456789012')).toBe(true);
    expect(validateAadhaarFormat('12345')).toBe(false);
    expect(validateUpiVpaFormat('student@okhdfcbank')).toBe(true);
    expect(validateUpiVpaFormat('invalid-vpa')).toBe(false);
  });
});

describe('5. Append-Only Ledger Reconciliation', () => {
  it('reconciles balanced pool transactions', () => {
    const entries = [
      { id: '1', type: 'CONTRIBUTION', amount: 500000, balanceAfter: 500000, status: 'RECORDED' }, // +5000
      { id: '2', type: 'CONTRIBUTION', amount: 500000, balanceAfter: 1000000, status: 'RECORDED' }, // +5000
      { id: '3', type: 'DISBURSEMENT', amount: 600000, balanceAfter: 400000, status: 'RECORDED' }, // -6000
      { id: '4', type: 'REPAYMENT_PRINCIPAL', amount: 200000, balanceAfter: 600000, status: 'RECORDED' }, // +2000
      { id: '5', type: 'REPAYMENT_INTEREST', amount: 15000, balanceAfter: 615000, status: 'RECORDED' }, // +150
    ];

    const currentCirclePool = 615000;
    const result = reconcileLedger(entries, currentCirclePool);

    expect(result.isReconciled).toBe(true);
    expect(result.differencePaise).toBe(0);
    expect(result.computedPoolBalancePaise).toBe(615000);
  });

  it('flags discrepancies if recorded balance deviates from append-only events', () => {
    const entries = [
      { id: '1', type: 'CONTRIBUTION', amount: 500000, balanceAfter: 500000, status: 'RECORDED' },
    ];
    const tamperedPool = 700000;
    const result = reconcileLedger(entries, tamperedPool);

    expect(result.isReconciled).toBe(false);
    expect(result.differencePaise).toBe(-200000);
  });
});

describe('6. Late Penalty Calculation', () => {
  it('calculates flat penalty correctly', () => {
    const penalty = calculateLatePenalty(340000, { type: 'FLAT', value: 5000 }, 5);
    expect(penalty).toBe(5000); // ₹50 flat
  });

  it('calculates percentage penalty correctly', () => {
    // 2% on ₹3,400 (340,000 paise) = 6,800 paise (₹68)
    const penalty = calculateLatePenalty(340000, { type: 'PERCENTAGE', value: 2.0 }, 5);
    expect(penalty).toBe(6800);
  });

  it('determines status transitions across grace period', () => {
    const now = new Date('2026-10-15T12:00:00Z');
    const upcoming = new Date('2026-10-20T12:00:00Z');
    const due = new Date('2026-10-14T12:00:00Z'); // 1 day ago -> within 3-day grace
    const overdue = new Date('2026-10-10T12:00:00Z'); // 5 days ago -> overdue

    expect(determineInstalmentStatus(upcoming, false, now)).toBe('UPCOMING');
    expect(determineInstalmentStatus(due, false, now)).toBe('DUE');
    expect(determineInstalmentStatus(overdue, false, now)).toBe('OVERDUE');
    expect(determineInstalmentStatus(overdue, true, now)).toBe('PAID');
  });
});

describe('7. Proportional Risk-Sharing on Default', () => {
  it('distributes default losses proportionally among contributors', () => {
    const contributors = [
      { memberId: 'm1', memberName: 'Aarav (Admin)', fundedAmountPaise: 600000 }, // 60%
      { memberId: 'm2', memberName: 'Priya (Lender)', fundedAmountPaise: 400000 }, // 40%
    ];

    // Total principal = ₹10,000 (1,000,000 paise)
    // Loss on default = ₹3,000 (300,000 paise)
    const report = computeProportionalRiskSharing(contributors, 300000);

    expect(report.defaultedAmountPaise).toBe(300000);
    expect(report.totalRecoveredPaise).toBe(700000);

    const m1Alloc = report.allocations.find((a) => a.memberId === 'm1')!;
    const m2Alloc = report.allocations.find((a) => a.memberId === 'm2')!;

    expect(m1Alloc.lossBornePaise).toBe(180000); // 60% of 300,000
    expect(m1Alloc.recoveredPrincipalPaise).toBe(420000);

    expect(m2Alloc.lossBornePaise).toBe(120000); // 40% of 300,000
    expect(m2Alloc.recoveredPrincipalPaise).toBe(280000);

    // Sum of losses matches total default loss exactly
    const totalLoss = report.allocations.reduce((sum, a) => sum + a.lossBornePaise, 0);
    expect(totalLoss).toBe(300000);
  });
});

describe('8. Exposure & Diversification Analysis', () => {
  it('triggers liquidity warning when requested amount exceeds pool', () => {
    const analysis = analyzeExposure({
      poolBalancePaise: 400000, // ₹4,000 pool
      circleMaxLoanPaise: 2000000,
      requestedAmountPaise: 1000000, // ₹10,000 requested
      borrowerExistingOutstandingPaise: 0,
      totalCircleOutstandingPaise: 0,
    });

    expect(analysis.isLiquiditySufficient).toBe(false);
    expect(analysis.nudges.some((n) => n.title === 'Insufficient Group Liquidity')).toBe(true);
  });

  it('triggers concentration warning when loan exceeds 35% of pool', () => {
    const analysis = analyzeExposure({
      poolBalancePaise: 1000000, // ₹10,000 pool
      circleMaxLoanPaise: 2000000,
      requestedAmountPaise: 500000, // 50% of pool
      borrowerExistingOutstandingPaise: 0,
      totalCircleOutstandingPaise: 0,
    });

    expect(analysis.isLiquiditySufficient).toBe(true);
    expect(analysis.exposurePercentageOfPool).toBe(50);
    expect(analysis.nudges.some((n) => n.title === 'High Pool Concentration')).toBe(true);
  });
});
