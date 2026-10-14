'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  FileText,
  Vote as VoteIcon,
  MessageSquare,
  QrCode,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';
import { UpiPaymentModal } from '@/components/modals/UpiPaymentModal';
import { LoanAgreementModal } from '@/components/modals/LoanAgreementModal';

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, refreshTrigger, triggerRefresh } = useApp();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Voting state
  const [commentText, setCommentText] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  // Modals state
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [activeInstalmentForRepay, setActiveInstalmentForRepay] = useState<any>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // Restructure state
  const [isRestructureModalOpen, setIsRestructureModalOpen] = useState(false);
  const [restructureTenure, setRestructureTenure] = useState(6);
  const [restructureReason, setRestructureReason] = useState('Temporary hardship relief discussed with circle peers.');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/loans/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id, currentUser.id, refreshTrigger]);

  if (isLoading || !data?.loanRequest) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  const { loanRequest, voteEvaluation, schedule, agreementText, complianceDetails } = data;
  const isBorrower = loanRequest.borrowerId === currentUser.id;
  const hasVoted = loanRequest.votes?.some((v: any) => v.voterId === currentUser.id);
  const isLoanActiveOrDisbursed =
    loanRequest.status === 'DISBURSED' ||
    loanRequest.status === 'ACTIVE' ||
    loanRequest.status === 'OVERDUE' ||
    loanRequest.status === 'RESTRUCTURED';

  const loanRecord = loanRequest.loan;
  const instalments = loanRecord?.instalments || schedule?.instalments || [];

  const handleCastVote = async (decision: 'APPROVE' | 'REJECT', forceClose: boolean = false) => {
    setIsVoting(true);
    try {
      await fetch(`/api/loans/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: currentUser.id,
          decision,
          comment: commentText,
          forceClose,
        }),
      });
      setCommentText('');
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDisbursementSuccess = async (utr: string) => {
    try {
      await fetch(`/api/loans/${id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lenderId: currentUser.id,
          outcome: 'SUCCESS',
        }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRepaymentSuccess = async (utr: string) => {
    if (!activeInstalmentForRepay || !loanRecord) return;
    try {
      await fetch(`/api/loans/${loanRecord.id}/repay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instalmentId: activeInstalmentForRepay.id,
          payerId: currentUser.id,
          paymentMethod: 'MANUAL_UPI',
        }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestructureSubmit = async () => {
    if (!loanRecord) return;
    try {
      await fetch(`/api/loans/${loanRecord.id}/restructure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedTenureMonths: restructureTenure,
          reason: restructureReason,
          autoApprove: true,
        }),
      });
      setIsRestructureModalOpen(false);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/loans"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {loanRequest.circle?.name}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  loanRequest.status === 'VOTING'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : loanRequest.status === 'APPROVED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : loanRequest.status === 'OVERDUE' || loanRecord?.status === 'OVERDUE'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {loanRecord?.status === 'OVERDUE' ? 'OVERDUE' : loanRequest.status}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {loanRequest.purpose}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsAgreementModalOpen(true)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
          title="View Loan Agreement"
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          Agreement
        </button>
      </div>

      {/* Compliance Badge */}
      <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-medium">{complianceDetails?.badgeText}</span>
        </div>
        <span className="text-[10px] text-indigo-600 font-mono font-bold">Verified</span>
      </div>

      {/* Primary Loan Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Principal Amount
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatPaise(loanRequest.amount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Borrower
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {loanRequest.borrower?.name}
            </div>
            <span className="text-[10px] text-slate-400">
              VPA: {loanRequest.borrower?.upiVpa}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Tenure</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {loanRecord?.tenureMonths || loanRequest.tenureMonths} mo
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Rate</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {loanRecord?.interestRatePct || loanRequest.proposedInterestPct}% p.a.
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Total Due</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatPaise(loanRecord?.totalRepayable || schedule?.totalRepayable || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Voting Section (If in VOTING state) */}
      {loanRequest.status === 'VOTING' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <VoteIcon className="w-3.5 h-3.5 text-indigo-500" />
              Circle Approval Vote
            </h3>
            <span className="text-xs font-bold text-indigo-600 tabular-nums">
              {voteEvaluation.currentApprovals} / {voteEvaluation.requiredApprovals} needed
            </span>
          </div>

          {/* Progress bar towards 70% threshold */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Approval Progress: {voteEvaluation.approvalProgressPct}%</span>
              <span>Target: {voteEvaluation.targetThresholdPct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${voteEvaluation.approvalProgressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Vote Buttons (if not borrower) */}
          {!isBorrower ? (
            <div className="space-y-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a peer review comment (optional)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleCastVote('APPROVE')}
                  disabled={isVoting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Loan
                </button>
                <button
                  onClick={() => handleCastVote('REJECT')}
                  disabled={isVoting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleCastVote('APPROVE', true)}
                  disabled={isVoting}
                  className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all"
                  title="Demo Close Vote (instantly finalize approval)"
                >
                  Close Vote
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-500 text-center">
              Your request is actively being voted on by circle peers (48h window).
            </div>
          )}

          {/* Votes cast list */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Peer Votes ({loanRequest.votes?.length || 0}):
            </span>
            {loanRequest.votes?.map((v: any) => (
              <div
                key={v.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {v.voter?.name}
                  </span>
                  {v.comment && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.comment}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.decision === 'APPROVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {v.decision}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disbursement Action (If in APPROVED state) */}
      {loanRequest.status === 'APPROVED' && (
        <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                Threshold Reached! Ready for UPI Disbursement
              </h3>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300">
                Direct peer transfer from lender VPA ({currentUser.upiVpa}) to borrower VPA ({loanRequest.borrower?.upiVpa}).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDisbursementModalOpen(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Smartphone className="w-4 h-4" />
            Disburse via UPI ({formatPaise(loanRequest.amount)})
          </button>
        </div>
      )}

      {/* Active Repayment & Schedule Section (If Disbursed or Active) */}
      {isLoanActiveOrDisbursed && (
        <div className="space-y-4">
          {/* Outstanding Balance Banner */}
          <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Outstanding Balance
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {formatPaise(loanRecord?.outstandingBalance || 0)}
              </div>
            </div>
            <button
              onClick={() => setIsRestructureModalOpen(true)}
              className="py-1.5 px-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
            >
              Restructure EMI
            </button>
          </div>

          {/* AutoPay Mandate Status Card */}
          {loanRecord?.mandates?.[0] && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    UPI AutoPay Active
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    UMRN: {loanRecord.mandates[0].umrn}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>
          )}

          {/* Repayment Schedule (EMI Table) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Repayment Schedule (EMI Table)
            </h3>

            <div className="space-y-2">
              {instalments.map((inst: any) => {
                const isPaid = inst.status === 'PAID';
                const isOverdue = inst.status === 'OVERDUE';

                return (
                  <div
                    key={inst.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isPaid
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        : isOverdue
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 shadow-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Instalment #{inst.instalmentNumber}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Due:{' '}
                        {new Date(inst.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      {inst.penaltyDue > 0 && (
                        <span className="text-[10px] text-rose-600 block">
                          +{formatPaise(inst.penaltyDue)} late penalty
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {formatPaise(inst.totalDue + (inst.penaltyDue || 0))}
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          P: {formatPaise(inst.principalDue)} | I: {formatPaise(inst.interestDue)}
                        </span>
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => {
                            setActiveInstalmentForRepay(inst);
                            setIsRepayModalOpen(true);
                          }}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                        >
                          Pay UPI
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UpiPaymentModal
        isOpen={isDisbursementModalOpen}
        onClose={() => setIsDisbursementModalOpen(false)}
        payeeVpa={loanRequest.borrower?.upiVpa}
        payeeName={loanRequest.borrower?.name}
        amountPaise={loanRequest.amount}
        note={`Loan Disbursement: ${loanRequest.purpose}`}
        onPaymentSuccess={handleDisbursementSuccess}
        title="Disburse Loan to Borrower"
        actionLabel="Simulate UPI Disbursement"
      />

      {activeInstalmentForRepay && (
        <UpiPaymentModal
          isOpen={isRepayModalOpen}
          onClose={() => setIsRepayModalOpen(false)}
          payeeVpa="circle.pool@circlo"
          payeeName={`${loanRequest.circle?.name} (Pool)`}
          amountPaise={
            activeInstalmentForRepay.totalDue + (activeInstalmentForRepay.penaltyDue || 0)
          }
          note={`EMI #${activeInstalmentForRepay.instalmentNumber} Repayment`}
          onPaymentSuccess={handleRepaymentSuccess}
          title="Repay Loan Instalment"
          actionLabel="Simulate EMI UPI Payment"
        />
      )}

      <LoanAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        agreementText={agreementText}
        loanId={loanRequest.id}
      />

      {/* Restructure Modal */}
      {isRestructureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Restructure Loan Terms
            </h3>
            <p className="text-xs text-slate-500">
              Social accountability allows flexible tenure extensions with circle agreement.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Extended Tenure
              </label>
              <select
                value={restructureTenure}
                onChange={(e) => setRestructureTenure(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value={4}>4 Months</option>
                <option value={5}>5 Months</option>
                <option value={6}>6 Months (Pilot Maximum)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mediation Note for Circle
              </label>
              <textarea
                rows={3}
                value={restructureReason}
                onChange={(e) => setRestructureReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsRestructureModalOpen(false)}
                className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRestructureSubmit}
                className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Submit Restructure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
