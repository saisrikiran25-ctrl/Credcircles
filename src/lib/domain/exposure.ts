/**
 * Exposure & Diversification Nudge Engine
 * Calculates recommended maximum loan exposure per borrower and diversification warnings.
 */

export interface ExposureAnalysisInput {
  poolBalancePaise: number;
  circleMaxLoanPaise: number;
  requestedAmountPaise: number;
  borrowerExistingOutstandingPaise: number;
  totalCircleOutstandingPaise: number;
}

export interface ExposureAnalysisResult {
  recommendedMaxExposurePaise: number;
  isLiquiditySufficient: boolean;
  availableLiquidityPaise: number;
  exposurePercentageOfPool: number;
  totalBorrowerExposurePaise: number;
  nudges: Array<{
    type: 'WARNING' | 'INFO' | 'CRITICAL';
    title: string;
    message: string;
  }>;
}

export function analyzeExposure(input: ExposureAnalysisInput): ExposureAnalysisResult {
  const {
    poolBalancePaise,
    circleMaxLoanPaise,
    requestedAmountPaise,
    borrowerExistingOutstandingPaise,
  } = input;

  // Recommended exposure rule: Up to 30% of circle pool balance, capped by circle max loan setting
  const poolCapPaise = Math.round(poolBalancePaise * 0.30);
  const recommendedMaxExposurePaise = Math.min(
    circleMaxLoanPaise,
    Math.max(500000, poolCapPaise) // minimum ₹5,000 allowance if pool is small
  );

  const availableLiquidityPaise = poolBalancePaise;
  const isLiquiditySufficient = poolBalancePaise >= requestedAmountPaise;

  const exposurePercentageOfPool =
    poolBalancePaise > 0
      ? Math.round((requestedAmountPaise / poolBalancePaise) * 100)
      : 100;

  const totalBorrowerExposurePaise = borrowerExistingOutstandingPaise + requestedAmountPaise;

  const nudges: ExposureAnalysisResult['nudges'] = [];

  if (!isLiquiditySufficient) {
    nudges.push({
      type: 'CRITICAL',
      title: 'Insufficient Group Liquidity',
      message: `The circle currently has ₹${(poolBalancePaise / 100).toLocaleString('en-IN')} available, but ₹${(requestedAmountPaise / 100).toLocaleString('en-IN')} is requested. Members must contribute to fulfill this loan.`,
    });
  }

  if (exposurePercentageOfPool > 35) {
    nudges.push({
      type: 'WARNING',
      title: 'High Pool Concentration',
      message: `This loan would commit ${exposurePercentageOfPool}% of your circle's total pool to a single borrower. Diversifying across smaller loans reduces default risk.`,
    });
  }

  if (borrowerExistingOutstandingPaise > 0) {
    nudges.push({
      type: 'WARNING',
      title: 'Existing Debt Outstanding',
      message: `Borrower already holds ₹${(borrowerExistingOutstandingPaise / 100).toLocaleString('en-IN')} in active circle dues. Total exposure would rise to ₹${(totalBorrowerExposurePaise / 100).toLocaleString('en-IN')}.`,
    });
  }

  if (totalBorrowerExposurePaise > circleMaxLoanPaise) {
    nudges.push({
      type: 'CRITICAL',
      title: 'Exceeds Circle Loan Limit',
      message: `Combined exposure of ₹${(totalBorrowerExposurePaise / 100).toLocaleString('en-IN')} exceeds the circle limit of ₹${(circleMaxLoanPaise / 100).toLocaleString('en-IN')}.`,
    });
  }

  if (nudges.length === 0) {
    nudges.push({
      type: 'INFO',
      title: 'Well-Diversified Exposure',
      message: `This request represents a healthy ${exposurePercentageOfPool}% allocation of your group's current liquidity.`,
    });
  }

  return {
    recommendedMaxExposurePaise,
    isLiquiditySufficient,
    availableLiquidityPaise,
    exposurePercentageOfPool,
    totalBorrowerExposurePaise,
    nudges,
  };
}
