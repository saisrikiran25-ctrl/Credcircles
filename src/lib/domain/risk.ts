/**
 * Risk Scoring Engine (0 - 100)
 * Transparent, explainable, pure function.
 * Factors:
 * 1. On-time repayment history (40%)
 * 2. Circle approval ratio & community standing (20%)
 * 3. Platform tenure (15%)
 * 4. Contribution vs. outstanding ratio (15%)
 * 5. Identity verification (10%)
 */

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactorDetail {
  factor: string;
  weightPct: number;
  score: number; // 0 - 100
  weightedPoints: number; // weightPct * score / 100
  description: string;
}

export interface RiskScoreResult {
  score: number; // 0 - 100
  riskBand: RiskBand;
  hasHistory: boolean;
  factors: RiskFactorDetail[];
  summary: string;
}

export interface RiskInputParams {
  totalInstalmentsDue: number;
  onTimeInstalmentsPaid: number;
  lateInstalments: number;
  platformAgeDays: number;
  totalVotesReceived: number;
  positiveVotesReceived: number;
  lifetimeContributionsPaise: number;
  currentOutstandingPaise: number;
  isVerified: boolean;
}

export function computeRiskScore(params: RiskInputParams): RiskScoreResult {
  const {
    totalInstalmentsDue,
    onTimeInstalmentsPaid,
    lateInstalments,
    platformAgeDays,
    totalVotesReceived,
    positiveVotesReceived,
    lifetimeContributionsPaise,
    currentOutstandingPaise,
    isVerified,
  } = params;

  const hasHistory = totalInstalmentsDue > 0 || platformAgeDays > 30;

  // 1. Repayment history (40%)
  let repaymentScore = 70; // baseline for new users
  let repaymentDesc = 'No prior loan repayments recorded (baseline assigned)';
  if (totalInstalmentsDue > 0) {
    const onTimeRate = onTimeInstalmentsPaid / totalInstalmentsDue;
    const penaltyDeduction = (lateInstalments / totalInstalmentsDue) * 50;
    repaymentScore = Math.max(0, Math.min(100, Math.round(onTimeRate * 100 - penaltyDeduction)));
    repaymentDesc = `${onTimeInstalmentsPaid}/${totalInstalmentsDue} instalments cleared on time (${Math.round(onTimeRate * 100)}%)`;
  }

  // 2. Circle approval ratio (20%)
  let approvalScore = 75;
  let approvalDesc = 'Initial peer trust baseline';
  if (totalVotesReceived > 0) {
    const approvalRate = positiveVotesReceived / totalVotesReceived;
    approvalScore = Math.round(approvalRate * 100);
    approvalDesc = `${positiveVotesReceived}/${totalVotesReceived} peer approvals in circle votes`;
  }

  // 3. Platform tenure (15%)
  // 0 to 180 days maps to 40 to 100
  const tenureRatio = Math.min(1, platformAgeDays / 180);
  const tenureScore = Math.round(40 + tenureRatio * 60);
  const tenureDesc = `Active for ${platformAgeDays} days on platform`;

  // 4. Contribution vs. Outstanding exposure (15%)
  let exposureScore = 80;
  let exposureDesc = 'Healthy contribution balance';
  if (currentOutstandingPaise > 0) {
    const coverageRatio = lifetimeContributionsPaise / currentOutstandingPaise;
    if (coverageRatio >= 1.0) {
      exposureScore = 95;
      exposureDesc = `Contributions cover ${(coverageRatio * 100).toFixed(0)}% of current dues`;
    } else if (coverageRatio >= 0.5) {
      exposureScore = 75;
      exposureDesc = `Moderate exposure: ${(coverageRatio * 100).toFixed(0)}% coverage of dues`;
    } else {
      exposureScore = Math.max(20, Math.round(coverageRatio * 100));
      exposureDesc = `High borrowing compared to savings (${(coverageRatio * 100).toFixed(0)}% coverage)`;
    }
  } else if (lifetimeContributionsPaise > 0) {
    exposureScore = 90;
    exposureDesc = 'Active contributor with zero outstanding debt';
  }

  // 5. Verification status (10%)
  const verificationScore = isVerified ? 100 : 20;
  const verificationDesc = isVerified ? 'Full eKYC (PAN/Aadhaar) verified' : 'Incomplete KYC verification';

  const factors: RiskFactorDetail[] = [
    {
      factor: 'Repayment Track Record',
      weightPct: 40,
      score: repaymentScore,
      weightedPoints: Number((repaymentScore * 0.4).toFixed(1)),
      description: repaymentDesc,
    },
    {
      factor: 'Circle Approval Ratio',
      weightPct: 20,
      score: approvalScore,
      weightedPoints: Number((approvalScore * 0.2).toFixed(1)),
      description: approvalDesc,
    },
    {
      factor: 'Platform Tenure & Stability',
      weightPct: 15,
      score: tenureScore,
      weightedPoints: Number((tenureScore * 0.15).toFixed(1)),
      description: tenureDesc,
    },
    {
      factor: 'Savings vs. Debt Exposure',
      weightPct: 15,
      score: exposureScore,
      weightedPoints: Number((exposureScore * 0.15).toFixed(1)),
      description: exposureDesc,
    },
    {
      factor: 'Identity & eKYC Verification',
      weightPct: 10,
      score: verificationScore,
      weightedPoints: Number((verificationScore * 0.1).toFixed(1)),
      description: verificationDesc,
    },
  ];

  const totalPoints = factors.reduce((sum, f) => sum + f.weightedPoints, 0);
  const score = Math.max(0, Math.min(100, Math.round(totalPoints)));

  let riskBand: RiskBand = 'MEDIUM';
  let summary = 'Moderate credit standing. Eligible for standard circle loans.';

  if (score >= 75) {
    riskBand = 'LOW';
    summary = 'Excellent community standing with strong peer trust and repayment history.';
  } else if (score < 50) {
    riskBand = 'HIGH';
    summary = 'High credit risk profile. Higher peer scrutiny recommended.';
  }

  return {
    score,
    riskBand,
    hasHistory,
    factors,
    summary,
  };
}
