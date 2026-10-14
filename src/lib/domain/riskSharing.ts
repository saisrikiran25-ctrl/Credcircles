/**
 * Proportional Risk-Sharing Engine
 * Demonstrates transparent loss allocation among participating circle lenders on default.
 * Each lender/contributor absorbs a loss directly proportional to their share in the funded loan.
 */

export interface ContributorShare {
  memberId: string;
  memberName: string;
  fundedAmountPaise: number;
}

export interface MemberLossAllocation {
  memberId: string;
  memberName: string;
  fundedAmountPaise: number;
  sharePct: number;
  lossBornePaise: number;
  recoveredPrincipalPaise: number;
}

export interface RiskSharingReport {
  totalLoanPrincipalPaise: number;
  defaultedAmountPaise: number;
  totalRecoveredPaise: number;
  allocations: MemberLossAllocation[];
  explainer: string;
}

export function computeProportionalRiskSharing(
  contributors: ContributorShare[],
  defaultedAmountPaise: number
): RiskSharingReport {
  const totalLoanPrincipalPaise = contributors.reduce(
    (sum, c) => sum + c.fundedAmountPaise,
    0
  );

  if (totalLoanPrincipalPaise <= 0) {
    throw new Error('Total funded principal must be positive');
  }

  const cappedDefaultLoss = Math.min(totalLoanPrincipalPaise, Math.max(0, defaultedAmountPaise));
  const totalRecoveredPaise = totalLoanPrincipalPaise - cappedDefaultLoss;

  let accumulatedLoss = 0;
  const allocations: MemberLossAllocation[] = contributors.map((c, index) => {
    const isFinal = index === contributors.length - 1;
    const shareRatio = c.fundedAmountPaise / totalLoanPrincipalPaise;
    const sharePct = Number((shareRatio * 100).toFixed(2));

    const lossBornePaise = isFinal
      ? cappedDefaultLoss - accumulatedLoss
      : Math.round(cappedDefaultLoss * shareRatio);

    accumulatedLoss += lossBornePaise;

    const recoveredPrincipalPaise = Math.max(0, c.fundedAmountPaise - lossBornePaise);

    return {
      memberId: c.memberId,
      memberName: c.memberName,
      fundedAmountPaise: c.fundedAmountPaise,
      sharePct,
      lossBornePaise,
      recoveredPrincipalPaise,
    };
  });

  const explainer =
    `Losses on defaulted loans are distributed proportionally based on each member's capital contribution to the loan pool. No single member bears an unfair burden, adhering to core Self-Help Group (SHG) collective security principles.`;

  return {
    totalLoanPrincipalPaise,
    defaultedAmountPaise: cappedDefaultLoss,
    totalRecoveredPaise,
    allocations,
    explainer,
  };
}
