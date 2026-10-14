/**
 * Transparent Append-Only Ledger Domain & Reconciliation
 * Invariant: Ledger entries are never modified or deleted.
 * Pool balance = Sum of contributions - Disbursed principal + Repaid principal + Repaid interest (group share) - Platform fees.
 */

export interface LedgerEntryItem {
  id: string;
  type: string; // 'CONTRIBUTION' | 'DISBURSEMENT' | 'REPAYMENT_PRINCIPAL' | 'REPAYMENT_INTEREST' | 'LATE_PENALTY' | 'PLATFORM_FEE' | 'REVERSAL'
  amount: number; // in paise
  balanceAfter: number;
  status: string;
}

export interface LedgerReconciliationResult {
  isReconciled: boolean;
  computedPoolBalancePaise: number;
  recordedPoolBalancePaise: number;
  totalContributionsPaise: number;
  totalDisbursementsPaise: number;
  totalPrincipalRepaidPaise: number;
  totalInterestRepaidPaise: number;
  totalPenaltiesCollectedPaise: number;
  differencePaise: number;
}

export function reconcileLedger(
  entries: LedgerEntryItem[],
  currentCirclePoolBalancePaise: number
): LedgerReconciliationResult {
  let totalContributionsPaise = 0;
  let totalDisbursementsPaise = 0;
  let totalPrincipalRepaidPaise = 0;
  let totalInterestRepaidPaise = 0;
  let totalPenaltiesCollectedPaise = 0;

  for (const entry of entries) {
    if (entry.status === 'REVERSED') continue;

    switch (entry.type) {
      case 'CONTRIBUTION':
        totalContributionsPaise += entry.amount;
        break;
      case 'DISBURSEMENT':
        totalDisbursementsPaise += entry.amount;
        break;
      case 'REPAYMENT_PRINCIPAL':
        totalPrincipalRepaidPaise += entry.amount;
        break;
      case 'REPAYMENT_INTEREST':
        totalInterestRepaidPaise += entry.amount;
        break;
      case 'LATE_PENALTY':
        totalPenaltiesCollectedPaise += entry.amount;
        break;
      default:
        break;
    }
  }

  // Net logical pool balance calculation:
  // Inflows: Contributions + Repaid Principal + Repaid Interest + Penalties
  // Outflows: Disbursed Principal
  const computedPoolBalancePaise =
    totalContributionsPaise -
    totalDisbursementsPaise +
    totalPrincipalRepaidPaise +
    totalInterestRepaidPaise +
    totalPenaltiesCollectedPaise;

  const differencePaise = computedPoolBalancePaise - currentCirclePoolBalancePaise;
  const isReconciled = differencePaise === 0;

  return {
    isReconciled,
    computedPoolBalancePaise,
    recordedPoolBalancePaise: currentCirclePoolBalancePaise,
    totalContributionsPaise,
    totalDisbursementsPaise,
    totalPrincipalRepaidPaise,
    totalInterestRepaidPaise,
    totalPenaltiesCollectedPaise,
    differencePaise,
  };
}
