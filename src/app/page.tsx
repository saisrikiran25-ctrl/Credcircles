'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Users,
  CreditCard,
  Vote as VoteIcon,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';
import { CircleDonutGauge } from '@/components/ui/CircleDonutGauge';
import { ContributeModal } from '@/components/modals/ContributeModal';
import { UpiPaymentModal } from '@/components/modals/UpiPaymentModal';
import { RiskSharingExplainerModal } from '@/components/modals/RiskSharingExplainerModal';

export default function HomePage() {
  const { currentUser, refreshTrigger, triggerRefresh } = useApp();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedCircleForContribution, setSelectedCircleForContribution] = useState<any>(null);
  const [isUpiPayOpen, setIsUpiPayOpen] = useState(false);
  const [activeDuePayment, setActiveDuePayment] = useState<any>(null);
  const [isRiskExplainerOpen, setIsRiskExplainerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/bootstrap?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching home data:', err);
        setIsLoading(false);
      });
  }, [currentUser.id, refreshTrigger]);

  const handleQuickVote = async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await fetch(`/api/loans/${requestId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: currentUser.id,
          decision,
          comment: `Quick ${decision.toLowerCase()} from home dashboard`,
        }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayDue = (due: any) => {
    setActiveDuePayment(due);
    setIsUpiPayOpen(true);
  };

  const handleDuePaymentSuccess = async (utr: string) => {
    if (!activeDuePayment) return;
    try {
      await fetch(`/api/loans/${activeDuePayment.loanId}/repay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instalmentId: activeDuePayment.id,
          payerId: currentUser.id,
          paymentMethod: 'MANUAL_UPI',
        }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        <div className="h-60 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  const { myPosition, upcomingDues, pendingVotes, circles, user } = data;
  const primaryCircle = circles?.[0];

  return (
    <div className="p-4 space-y-5">
      {/* Greeting & Persona Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Welcome back,
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            {user.name}
            {user.isVerified && (
              <span title="eKYC Verified" className="inline-flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 inline" />
              </span>
            )}
          </h2>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {user.segment.replace(/_/g, ' ')} • {user.city}
          </span>
        </div>

        <Link
          href="/profile/risk"
          className="p-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 hover:bg-slate-200 transition-all text-right"
        >
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400">Risk Score</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {user.riskSnapshots?.[0]?.score || 85}/100
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* "My Position" Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            My Position
          </span>
          <span className="text-[10px] bg-indigo-800/60 px-2 py-0.5 rounded-full text-indigo-200 font-mono">
            VPA: {user.upiVpa}
          </span>
        </div>

        <div className="mb-4">
          <span className="text-xs text-indigo-200/80">Net Position in Circles</span>
          <div className="text-3xl font-black tracking-tight tabular-nums mt-0.5">
            {formatPaise(myPosition.netPositionPaise)}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-indigo-800/50 text-center">
          <div>
            <span className="text-[10px] text-indigo-300 block">Total Lent</span>
            <span className="text-xs font-bold tabular-nums text-emerald-400">
              {formatPaise(myPosition.totalLentPaise)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block">Active Dues</span>
            <span className="text-xs font-bold tabular-nums text-amber-400">
              {formatPaise(myPosition.totalOutstandingPaise)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block">Est. Yield</span>
            <span className="text-xs font-bold tabular-nums text-indigo-300">
              +{formatPaise(myPosition.estimatedEarningsPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            if (primaryCircle) {
              setSelectedCircleForContribution(primaryCircle);
              setIsContributeOpen(true);
            }
          }}
          className="p-3 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col items-center text-center shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <PiggyBank className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Contribute</span>
        </button>

        <Link
          href="/loans/new"
          className="p-3 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col items-center text-center shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Request</span>
        </Link>

        <Link
          href="/circles/new"
          className="p-3 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col items-center text-center shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">New Circle</span>
        </Link>

        <Link
          href="/circles/join"
          className="p-3 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col items-center text-center shadow-subtle transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Join Circle</span>
        </Link>
      </div>

      {/* Upcoming Dues Section */}
      {upcomingDues && upcomingDues.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upcoming EMIs Due
            </h3>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {upcomingDues.length} pending
            </span>
          </div>

          {upcomingDues.map((due: any) => (
            <div
              key={due.id}
              className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between shadow-subtle"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Instalment #{due.instalmentNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    {due.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {due.loan?.circle?.name} • Due:{' '}
                  {new Date(due.dueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatPaise(due.totalDue + (due.penaltyDue || 0))}
                  </div>
                  {due.penaltyDue > 0 && (
                    <span className="text-[10px] text-rose-600 block">
                      +{formatPaise(due.penaltyDue)} penalty
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handlePayDue(due)}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Pay UPI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Votes Section */}
      {pendingVotes && pendingVotes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <VoteIcon className="w-3.5 h-3.5 text-indigo-500" />
              Circle Loan Voting Needed
            </h3>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              70% threshold
            </span>
          </div>

          {pendingVotes.map((req: any) => (
            <div
              key={req.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {req.borrower?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {req.purpose} • {req.tenureMonths} mo @ {req.proposedInterestPct}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatPaise(req.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400">{req.circle?.name}</span>
                </div>
              </div>

              {/* Progress bar towards 70% threshold */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Current Approvals: {req.votes?.length || 0}</span>
                  <span className="font-semibold text-indigo-600">Requires 70% peer votes</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((req.votes?.length || 0) / 3) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleQuickVote(req.id, 'APPROVE')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => handleQuickVote(req.id, 'REJECT')}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Reject
                </button>
                <Link
                  href={`/loans/${req.id}`}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary Circle Spotlight Gauge */}
      {primaryCircle && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                Active Circle Gauge
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {primaryCircle.name}
              </h3>
            </div>
            <Link
              href={`/circles/${primaryCircle.id}`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5"
            >
              View Circle
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CircleDonutGauge
            totalPoolPaise={primaryCircle.poolBalance}
            lentOutPaise={Math.round(primaryCircle.poolBalance * 0.45)}
            availableLiquidityPaise={Math.round(primaryCircle.poolBalance * 0.55)}
            size={180}
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Rules & Policy</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {primaryCircle.interestRatePct}% p.a. • {primaryCircle.approvalThresholdPct}% threshold
            </span>
          </div>
        </div>
      )}

      {/* Trust & Education Banners */}
      <div className="space-y-2">
        <button
          onClick={() => setIsRiskExplainerOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-left transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                How Risk-Sharing Works
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Default losses are distributed proportionally, not borne by one member.
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0" />
        </button>

        <Link
          href="/admin"
          className="w-full p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-left transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Admin: Pilot Metrics & Revenue Model
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                100 Circles target, AUM, take rates & 3-year projections.
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </Link>
      </div>

      {/* Modals */}
      {selectedCircleForContribution && (
        <ContributeModal
          isOpen={isContributeOpen}
          onClose={() => setIsContributeOpen(false)}
          circleId={selectedCircleForContribution.id}
          circleName={selectedCircleForContribution.name}
          userId={currentUser.id}
          onSuccess={triggerRefresh}
        />
      )}

      {activeDuePayment && (
        <UpiPaymentModal
          isOpen={isUpiPayOpen}
          onClose={() => setIsUpiPayOpen(false)}
          payeeVpa="circle.repay@circlo"
          payeeName={activeDuePayment.loan?.circle?.name || 'Credit Circle'}
          amountPaise={activeDuePayment.totalDue + (activeDuePayment.penaltyDue || 0)}
          note={`EMI #${activeDuePayment.instalmentNumber} Repayment`}
          onPaymentSuccess={handleDuePaymentSuccess}
          title="Pay Instalment via UPI"
          actionLabel="Simulate UPI Pay"
        />
      )}

      <RiskSharingExplainerModal
        isOpen={isRiskExplainerOpen}
        onClose={() => setIsRiskExplainerOpen(false)}
      />
    </div>
  );
}
