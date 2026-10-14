/**
 * Voting & Approval Threshold Engine
 * Enforces circle approval rules (e.g. 70% of members must approve).
 * Handles edge cases (small circles, rounding, borrower exclusion, timeouts).
 */

export interface VotingEvaluationInput {
  totalEligibleMembers: number;
  thresholdPct: number; // default 70
  approvals: number;
  rejections: number;
  deadline: Date;
  now?: Date;
}

export interface VotingEvaluationResult {
  isApproved: boolean;
  isRejected: boolean;
  isVotingOpen: boolean;
  requiredApprovals: number;
  currentApprovals: number;
  currentRejections: number;
  totalEligibleMembers: number;
  approvalProgressPct: number;
  targetThresholdPct: number;
  remainingApprovalsNeeded: number;
  status: 'VOTING_ACTIVE' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export function evaluateLoanVotes(input: VotingEvaluationInput): VotingEvaluationResult {
  const {
    totalEligibleMembers,
    thresholdPct,
    approvals,
    rejections,
    deadline,
    now = new Date(),
  } = input;

  if (totalEligibleMembers <= 0) {
    return {
      isApproved: false,
      isRejected: true,
      isVotingOpen: false,
      requiredApprovals: 1,
      currentApprovals: 0,
      currentRejections: 0,
      totalEligibleMembers: 0,
      approvalProgressPct: 0,
      targetThresholdPct: thresholdPct,
      remainingApprovalsNeeded: 1,
      status: 'REJECTED',
    };
  }

  // Exact ceil calculation: e.g. 70% of 4 members = 2.8 -> 3 approvals required
  const requiredApprovals = Math.ceil(totalEligibleMembers * (thresholdPct / 100));
  const maxPossibleApprovals = totalEligibleMembers - rejections;
  const isExpired = now.getTime() > deadline.getTime();

  const isApproved = approvals >= requiredApprovals;
  const isRejected = maxPossibleApprovals < requiredApprovals || (isExpired && !isApproved);
  const isVotingOpen = !isApproved && !isRejected && !isExpired;

  const approvalProgressPct = Math.min(
    100,
    Math.round((approvals / totalEligibleMembers) * 100)
  );

  const remainingApprovalsNeeded = Math.max(0, requiredApprovals - approvals);

  let status: VotingEvaluationResult['status'] = 'VOTING_ACTIVE';
  if (isApproved) {
    status = 'APPROVED';
  } else if (isRejected) {
    status = isExpired ? 'EXPIRED' : 'REJECTED';
  }

  return {
    isApproved,
    isRejected,
    isVotingOpen,
    requiredApprovals,
    currentApprovals: approvals,
    currentRejections: rejections,
    totalEligibleMembers,
    approvalProgressPct,
    targetThresholdPct: thresholdPct,
    remainingApprovalsNeeded,
    status,
  };
}
