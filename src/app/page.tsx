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
  Vote as VoteIcon,
  BarChart3,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
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
  const [loadError, setLoadError] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  // Modals state
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedCircleForContribution, setSelectedCircleForContribution] = useState<any>(null);
  const [isUpiPayOpen, setIsUpiPayOpen] = useState(false);
  const [activeDuePayment, setActiveDuePayment] = useState<any>(null);
  const [isRiskExplainerOpen, setIsRiskExplainerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    fetch(`/api/bootstrap?userId=${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        return res.json();
      })
      .then((res) => {
        if (res && res.user && res.myPosition) {
          setData(res);
        } else {
          setLoadError(true);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching home data:', err);
        setLoadError(true);
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

  // ─── Loading skeleton ───
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        {/* Hero skeleton */}
        <div className="hero-gradient-groww px-4 pt-4 pb-6">
          <div className="skeleton h-4 w-28 mb-3 opacity-30" />
          <div className="skeleton h-10 w-40 mb-2 opacity-30" />
          <div className="skeleton h-3 w-52 opacity-20" />
        </div>
        <div className="px-4 pt-4 space-y-3">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-28 w-full" />
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (!data && loadError) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--accent-red-light)] text-[var(--accent-red)] flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Unable to load data</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Could not retrieve circle data for {currentUser.name}.
          </p>
        </div>
        <button
          onClick={() => triggerRefresh()}
          className="px-5 py-2.5 bg-g-500 hover:bg-g-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.user || !data.myPosition) return null;

  const { myPosition, upcomingDues = [], pendingVotes = [], circles = [], user } = data;
  const primaryCircle = circles?.[0];

  // Determine P&L sign
  const netPos = myPosition.netPositionPaise;
  const isPositive = netPos >= 0;

  return (
    <div className="animate-fade-in">

      {/* ─── HERO SECTION (Groww portfolio header style) ─── */}
      <div className="hero-gradient-groww px-4 pt-4 pb-8 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-g-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-g-500/5 blur-2xl pointer-events-none" />

        {/* User greeting */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[var(--text-muted)] text-xs font-medium">Good morning,</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h1 className="text-lg font-bold text-white tracking-tight">{user?.name}</h1>
              {user?.isVerified && (
                <ShieldCheck className="w-4 h-4 text-g-500 shrink-0" />
              )}
            </div>
          </div>
          <Link
            href="/profile/risk"
            id="risk-score-link"
            className="flex flex-col items-end gap-0.5"
          >
            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide">Score</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-g-500 tabular-nums">
                {user.riskSnapshots?.[0]?.score || 85}
              </span>
              <span className="text-xs text-[var(--text-muted)]">/100</span>
            </div>
          </Link>
        </div>

        {/* Net Position — big Groww-style number */}
        <div className="mb-1 flex items-center gap-2">
          <p className="text-xs text-[var(--text-muted)] font-medium">Net Position in Circles</p>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`amount-large text-white ${hideBalance ? 'blur-md select-none' : ''}`}>
            {hideBalance ? '₹ ••••••' : formatPaise(netPos)}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isPositive ? 'bg-g-500/20 text-g-400' : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'}`}>
            {isPositive ? '▲' : '▼'} {user.segment?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* 3-metric row */}
        <div className="grid grid-cols-3 gap-0 bg-white/5 rounded-xl overflow-hidden border border-white/10">
          {[
            { label: 'Total Lent', value: formatPaise(myPosition.totalLentPaise), color: 'text-g-400' },
            { label: 'Active Dues', value: formatPaise(myPosition.totalOutstandingPaise), color: 'text-amber-400' },
            { label: 'Est. Yield', value: '+' + formatPaise(myPosition.estimatedEarningsPaise), color: 'text-g-400' },
          ].map((m, i) => (
            <div key={i} className={`px-3 py-3 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{m.label}</p>
              <p className={`text-xs font-bold tabular-nums ${m.color} ${hideBalance ? 'blur-sm' : ''}`}>{hideBalance ? '••••' : m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div className="px-4 py-4 bg-[var(--bg-primary)]">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            {
              id: 'quick-contribute',
              label: 'Contribute',
              icon: PiggyBank,
              color: 'text-g-500',
              bg: 'bg-g-500/10',
              onClick: () => {
                if (primaryCircle) {
                  setSelectedCircleForContribution(primaryCircle);
                  setIsContributeOpen(true);
                }
              },
            },
            {
              id: 'quick-request',
              label: 'Request',
              icon: ArrowUpRight,
              color: 'text-[var(--accent-blue)]',
              bg: 'bg-[var(--accent-blue)]/10',
              href: '/loans/new',
            },
            {
              id: 'quick-new-circle',
              label: 'New Circle',
              icon: PlusCircle,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              href: '/circles/new',
            },
            {
              id: 'quick-join',
              label: 'Join Circle',
              icon: Users,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              href: '/circles/join',
            },
          ].map((action) =>
            action.href ? (
              <Link key={action.id} id={action.id} href={action.href} className="quick-action-btn shrink-0">
                <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] whitespace-nowrap">{action.label}</span>
              </Link>
            ) : (
              <button key={action.id} id={action.id} onClick={action.onClick} className="quick-action-btn shrink-0">
                <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] whitespace-nowrap">{action.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── UPCOMING EMIs ─── */}
      {upcomingDues && upcomingDues.length > 0 && (
        <>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Upcoming EMIs</h2>
              <span className="badge bg-amber-500/10 text-amber-500">
                {upcomingDues.length} due
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingDues.map((due: any) => (
                <div
                  key={due.id}
                  className="surface-card p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Instalment #{due.instalmentNumber}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {due.loan?.circle?.name} · Due{' '}
                        {new Date(due.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                        {formatPaise(due.totalDue + (due.penaltyDue || 0))}
                      </p>
                      {due.penaltyDue > 0 && (
                        <p className="text-[10px] text-[var(--accent-red)]">
                          +{formatPaise(due.penaltyDue)} penalty
                        </p>
                      )}
                    </div>
                    <button
                      id={`pay-due-${due.id}`}
                      onClick={() => handlePayDue(due)}
                      className="py-1.5 px-3.5 bg-g-500 hover:bg-g-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section-divider" />
        </>
      )}

      {/* ─── PENDING VOTES ─── */}
      {pendingVotes && pendingVotes.length > 0 && (
        <>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <VoteIcon className="w-4 h-4 text-[var(--accent-blue)]" />
                Loan Votes
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">70% threshold</span>
            </div>

            <div className="space-y-3">
              {pendingVotes.map((req: any) => (
                <div
                  key={req.id}
                  className="surface-card p-3.5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{req.borrower?.name}</p>
                        <span className="badge bg-amber-500/10 text-amber-500">VOTING</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {req.purpose} · {req.tenureMonths}mo @ {req.proposedInterestPct}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                        {formatPaise(req.amount)}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">{req.circle?.name}</p>
                    </div>
                  </div>

                  {/* Vote progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
                      <span>{req.votes?.length || 0} approvals</span>
                      <span className="text-[var(--accent-blue)] font-semibold">Need 70% consensus</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(100, ((req.votes?.length || 0) / 3) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`approve-${req.id}`}
                      onClick={() => handleQuickVote(req.id, 'APPROVE')}
                      className="flex-1 py-2 bg-g-500 hover:bg-g-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      id={`reject-${req.id}`}
                      onClick={() => handleQuickVote(req.id, 'REJECT')}
                      className="flex-1 py-2 bg-[var(--bg-surface)] hover:bg-[var(--border)] text-[var(--text-secondary)] rounded-lg text-xs font-bold transition-all"
                    >
                      Reject
                    </button>
                    <Link
                      href={`/loans/detail?id=${req.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section-divider" />
        </>
      )}

      {/* ─── PRIMARY CIRCLE GAUGE (Zerodha kite instrument style) ─── */}
      {primaryCircle && (
        <>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Circle Health</h2>
              <Link
                href={`/circles/detail?id=${primaryCircle.id}`}
                className="text-xs font-semibold text-g-500 flex items-center gap-0.5"
              >
                {primaryCircle.name}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="surface-card p-4">
              <CircleDonutGauge
                totalPoolPaise={primaryCircle.poolBalance}
                lentOutPaise={Math.round(primaryCircle.poolBalance * 0.45)}
                availableLiquidityPaise={Math.round(primaryCircle.poolBalance * 0.55)}
                size={176}
              />

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <span className="w-2 h-2 rounded-full bg-g-500" />
                  <span>Liquidity</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">
                  {primaryCircle.interestRatePct}% p.a. · {primaryCircle.approvalThresholdPct}% threshold
                </span>
              </div>
            </div>
          </div>
          <div className="section-divider" />
        </>
      )}

      {/* ─── EDUCATION & ADMIN BANNERS ─── */}
      <div className="px-4 py-4 space-y-2.5 pb-6">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Explore</h2>

        <button
          id="risk-explainer-btn"
          onClick={() => setIsRiskExplainerOpen(true)}
          className="w-full flex items-center justify-between p-3.5 surface-card hover:bg-[var(--bg-surface)] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-g-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-g-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">How Risk-Sharing Works</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Losses are distributed proportionally</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        </button>

        <Link
          href="/admin"
          id="admin-link"
          className="w-full flex items-center justify-between p-3.5 surface-card hover:bg-[var(--bg-surface)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center shrink-0 border border-[var(--border)]">
              <BarChart3 className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Pilot Metrics & Revenue</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">100 Circles target · AUM · 3yr projections</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        </Link>
      </div>

      {/* ─── MODALS ─── */}
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
