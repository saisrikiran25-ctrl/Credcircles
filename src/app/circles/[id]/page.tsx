'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  PiggyBank,
  ArrowUpRight,
  ShieldCheck,
  Share2,
  FileText,
  Sliders,
  TrendingUp,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';
import { CircleDonutGauge } from '@/components/ui/CircleDonutGauge';
import { ContributeModal } from '@/components/modals/ContributeModal';
import { RiskSharingExplainerModal } from '@/components/modals/RiskSharingExplainerModal';

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, refreshTrigger, triggerRefresh } = useApp();

  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MEMBERS' | 'LOANS' | 'LEDGER' | 'RULES' | 'PERFORMANCE' | 'INVITE'
  >('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isRiskExplainerOpen, setIsRiskExplainerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/circles/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id, currentUser.id, refreshTrigger]);

  if (isLoading || !data?.circle) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  const { circle, circlePosition, reconciliation, memberContributionsMap, exposureList } = data;
  const isUserAdmin = circle.createdById === currentUser.id;

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'MEMBERS', label: `Members (${circle.memberships?.length || 0})` },
    { id: 'LOANS', label: `Loans (${circle.loans?.length || 0})` },
    { id: 'LEDGER', label: 'Ledger' },
    { id: 'RULES', label: 'Rules' },
    { id: 'PERFORMANCE', label: 'Performance' },
    { id: 'INVITE', label: 'Invite' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/circles"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {circle.type}
              </span>
              {circle.isPremium && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Circle Pro
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {circle.name}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsContributeOpen(true)}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <PiggyBank className="w-3.5 h-3.5" />
          Contribute
        </button>
      </div>

      {/* Tabs Navigation (Horizontal scrollable) */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4 animate-fade-in">
          {/* Circle Position Gauge Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Circle Position
              </span>
              {reconciliation?.isReconciled && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ledger Reconciled
                </span>
              )}
            </div>

            <CircleDonutGauge
              totalPoolPaise={circlePosition.poolBalancePaise}
              lentOutPaise={circlePosition.totalOutstandingPaise}
              availableLiquidityPaise={circlePosition.availableLiquidityPaise}
              size={190}
            />

            {/* Invariant Banner */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-[11px] text-slate-500 text-center font-medium">
              Money stays in members bank accounts. The pool balance is an append-only ledger commitment.
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Active Dues</span>
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
                  {formatPaise(circlePosition.totalOutstandingPaise)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Repayment Rate</span>
                <span className="font-bold tabular-nums text-emerald-600">
                  {circlePosition.repaymentRatePct}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Annual Yield</span>
                <span className="font-bold tabular-nums text-indigo-600">
                  {circle.interestRatePct}% p.a.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href="/loans/new"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Circle Loan
            </Link>
            <button
              onClick={() => setIsRiskExplainerOpen(true)}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Risk Sharing
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Circle Peers
            </h3>
            <span className="text-xs text-slate-500">
              {circle.memberships?.length} members
            </span>
          </div>

          <div className="space-y-2">
            {circle.memberships?.map((m: any) => {
              const u = m.user;
              const contrib = memberContributionsMap?.[u.id]?.totalPaise || 0;
              const riskScore = u.riskSnapshots?.[0]?.score || 80;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {u.name}
                        </span>
                        {m.role === 'ADMIN' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            ADMIN
                          </span>
                        )}
                        {u.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.institution || u.city} • VPA: {u.upiVpa}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatPaise(contrib)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Score: {riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: LOANS */}
      {activeTab === 'LOANS' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Circle Loans & Requests
            </h3>
            <Link
              href="/loans/new"
              className="text-xs font-bold text-indigo-600 flex items-center gap-0.5"
            >
              + New Request
            </Link>
          </div>

          <div className="space-y-2.5">
            {circle.loanRequests?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active loans in this circle.</p>
            ) : (
              circle.loanRequests?.map((req: any) => (
                <Link
                  key={req.id}
                  href={`/loans/${req.id}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 block hover:border-indigo-500 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {req.borrower?.name}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            req.status === 'VOTING'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : req.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : req.status === 'DISBURSED' || req.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {req.purpose} • {req.tenureMonths} mo @ {req.proposedInterestPct}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {formatPaise(req.amount)}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-medium">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Append-Only Ledger
            </h3>
            <a
              href={`/api/ledger/export?circleId=${circle.id}`}
              className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-200"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </a>
          </div>

          <div className="space-y-2">
            {circle.ledgerEntries?.map((entry: any) => (
              <div
                key={entry.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      Ref: {entry.referenceId.slice(-8)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {entry.actorName || 'System'} • {entry.description}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black tabular-nums text-xs ${
                      entry.type.includes('DISBURSEMENT')
                        ? 'text-indigo-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {entry.type.includes('DISBURSEMENT') ? '-' : '+'}
                    {formatPaise(entry.amount)}
                  </div>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Pool: {formatPaise(entry.balanceAfter)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: RULES */}
      {activeTab === 'RULES' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Circle Charter & Rules
              </h3>
              <p className="text-[11px] text-slate-500">
                Created by {circle.createdBy?.name} • Governed by members
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Active Charter
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Max Loan Size
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                {formatPaise(circle.maxLoanAmount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Interest Rate
              </span>
              <span className="font-extrabold text-indigo-600 tabular-nums text-sm">
                {circle.interestRatePct}% p.a.
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Approval Threshold
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                {circle.approvalThresholdPct}% of peers
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Late Penalty
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                {circle.latePenaltyType === 'FLAT'
                  ? formatPaise(circle.latePenaltyValue) + ' flat'
                  : `${circle.latePenaltyValue}% / EMI`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Compliance Posture
            </span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {circle.complianceMode === 'PARTNERED_ESCROW'
                ? 'Option A: Licensed NBFC-P2P Partnered'
                : 'Option C: Strictly Closed Circles'}
            </div>
            <p className="text-[11px] text-slate-500">
              {circle.complianceMode === 'PARTNERED_ESCROW'
                ? 'External cross-group lending allowed via simulated LSP escrow partner.'
                : 'Lending strictly restricted to known members of this group.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: PERFORMANCE */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Portfolio Performance
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block">On-Time Repayment</span>
                <span className="text-lg font-black text-emerald-600 tabular-nums">
                  {circlePosition.repaymentRatePct}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block">Modest Yield</span>
                <span className="text-lg font-black text-indigo-600 tabular-nums">
                  {circle.interestRatePct}%
                </span>
              </div>
            </div>

            {/* Borrower Exposure Breakdown */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Exposure by Borrower
              </span>

              {exposureList?.length === 0 ? (
                <p className="text-slate-400 text-center py-2">No active debt exposure.</p>
              ) : (
                exposureList?.map((exp: any) => (
                  <div
                    key={exp.borrowerId}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exp.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.percentageOfPool}% of circle pool
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatPaise(exp.outstandingPaise)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: INVITE */}
      {activeTab === 'INVITE' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
            <Share2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Invite Trusted Friends
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Give this code to roommates or classmates to onboard them into this circle.
            </p>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="text-3xl font-black tracking-widest text-indigo-700 dark:text-indigo-300 font-mono">
              {circle.invites?.[0]?.code || 'GACHI70'}
            </div>
          </div>

          <button
            onClick={() => {
              const code = circle.invites?.[0]?.code || 'GACHI70';
              navigator.clipboard?.writeText(code);
              alert(`Code ${code} copied to clipboard!`);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            Copy Invite Code
          </button>
        </div>
      )}

      {/* Modals */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        circleId={circle.id}
        circleName={circle.name}
        userId={currentUser.id}
        onSuccess={triggerRefresh}
      />

      <RiskSharingExplainerModal
        isOpen={isRiskExplainerOpen}
        onClose={() => setIsRiskExplainerOpen(false)}
      />
    </div>
  );
}
