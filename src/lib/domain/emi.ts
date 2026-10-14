/**
 * EMI & Repayment Schedule Generator
 * Uses simple annual interest as per Community Credit Circles specification:
 * Total Interest = Principal * (Annual Rate / 100) * (Tenure in months / 12)
 * Total Repayable = Principal + Total Interest
 * Exact integer paise calculations with final-instalment remainder adjustment.
 */

export interface InstalmentPlanItem {
  instalmentNumber: number;
  dueDate: Date;
  principalDue: number; // in paise
  interestDue: number;  // in paise
  totalDue: number;     // in paise
}

export interface LoanScheduleSummary {
  principalAmount: number;     // in paise
  interestRatePct: number;     // e.g. 10.0
  tenureMonths: number;        // e.g. 3
  totalInterest: number;       // in paise
  totalRepayable: number;      // in paise
  monthlyEmiBase: number;      // in paise
  platformFee: number;         // in paise (default 1.5%)
  instalments: InstalmentPlanItem[];
}

export function calculateLoanSchedule(
  principalAmount: number, // in paise
  annualRatePct: number,   // e.g. 10 for 10% p.a.
  tenureMonths: number,    // 1 to 6
  startDate: Date = new Date(),
  platformFeePct: number = 1.5
): LoanScheduleSummary {
  if (tenureMonths <= 0) {
    throw new Error('Tenure must be at least 1 month');
  }
  if (principalAmount <= 0) {
    throw new Error('Principal amount must be positive');
  }

  // Simple interest calculation: P * (R / 100) * (T / 12)
  const totalInterest = Math.round(principalAmount * (annualRatePct / 100) * (tenureMonths / 12));
  const totalRepayable = principalAmount + totalInterest;

  // Platform fee (1.0 - 2.5%, default 1.5%)
  const platformFee = Math.round(principalAmount * (platformFeePct / 100));

  const basePrincipalPerMonth = Math.floor(principalAmount / tenureMonths);
  const baseInterestPerMonth = Math.floor(totalInterest / tenureMonths);

  let accumulatedPrincipal = 0;
  let accumulatedInterest = 0;

  const instalments: InstalmentPlanItem[] = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const isFinal = i === tenureMonths;
    const principalDue = isFinal
      ? principalAmount - accumulatedPrincipal
      : basePrincipalPerMonth;
    const interestDue = isFinal
      ? totalInterest - accumulatedInterest
      : baseInterestPerMonth;

    accumulatedPrincipal += principalDue;
    accumulatedInterest += interestDue;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    instalments.push({
      instalmentNumber: i,
      dueDate,
      principalDue,
      interestDue,
      totalDue: principalDue + interestDue,
    });
  }

  const monthlyEmiBase = instalments[0]?.totalDue ?? 0;

  return {
    principalAmount,
    interestRatePct: annualRatePct,
    tenureMonths,
    totalInterest,
    totalRepayable,
    monthlyEmiBase,
    platformFee,
    instalments,
  };
}
