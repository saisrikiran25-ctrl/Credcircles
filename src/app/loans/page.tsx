'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Vote as VoteIcon,
  ChevronRight,
  ShieldCheck,
  Calendar,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  VOTING:      { label: 'Voting',    bg: 'bg-amber-500/10',   text: 'text-amber-500' },
  APPROVED:    { label: 'Approved',  bg: 'bg-blue-500/10',    text: 'text-blue-500' },
  DISBURSED:   { label: 'Active',    bg: 'bg-g-500/10',       text: 'text-g-500' },
  ACTIVE:      { label: 'Active',    bg: 'bg-g-500/10',       text: 'text-g-500' },
  OVERDUE:     { label: 'Overdue',   bg: 'bg-red-500/10',     text: 'text-red-500' },
  RESTRUCTURED:{ label: 'Restructd', bg: 'bg-purple-500/10',  text: 'text-purple-500' },
  REPAID:      { label: 'Repaid',    bg: 'bg-g-500/10',       text: 'text-g-500' },
  DEFAULTED:   { label: 'Defaulted', bg: 'bg-red-500/10',     text: 'text-red-500' },
  REJECTED:    { label: 'Rejected',  bg: 'bg-slate-500/10',   text: 'text-[var(--text-muted)]' },
};

export default function LoansPage() {
  const { currentUser, refreshTrigger } = useApp();
  const [loans, setLoans] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VOTING' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/loans')
      .then((res) => res.json())
      .then((data) => {
        setLoans(data.loanRequests || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [currentUser.id, refreshTrigger]);

  const filteredLoans = loans.filter((l) => {
    if (filter === 'VOTING') return l.status === 'VOTING' || l.status === 'APPROVED';
    if (filter === 'ACTIVE') return ['DISBURSED', 'ACTIVE', 'OVERDUE', 'RESTRUCTURED'].includes(l.status);
    if (filter === 'CLOSED') return l.status === 'REPAID' || l.status === 'DEFAULTED' || l.status === 'REJECTED';
    return true;
  });

  const filterTabs = [
    { id: 'ALL',    label: `All (${loans.length})` },
    { id: 'VOTING', label: `Voting (${loans.filter(l => l.status === 'VOTING' || l.status === 'APPROVED').length})` },
    { id: 'ACTIVE', label: `Active` },
    { id: 'CLOSED', label: `Settled` },
  ];

  return (
    <div className="animate-fade-in">

      {/* ─── Header ─── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Community Credit</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            ₹5k–₹20k · 8–12% p.a. · 1–6 months
          </p>
        </div>
        <Link
          href="/loans/new"
          id="request-loan-btn"
          className="py-2 px-3 bg-g-500 hover:bg-g-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Request
        </Link>
      </div>

      {/* ─── Filter tabs ─── */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              id={`loan-filter-${tab.id.toLowerCase()}`}
              onClick={() => setFilter(tab.id as any)}
              className={`filter-pill ${filter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── Loans list ─── */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center">
              <VoteIcon className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No Loans Found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">No loan records match this filter.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLoans.map((req) => {
              const isVoting = req.status === 'VOTING';
              const isOverdue = req.status === 'OVERDUE' || req.loan?.status === 'OVERDUE';
              const statusKey = isOverdue ? 'OVERDUE' : req.status;
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG['VOTING'];

              return (
                <Link
                  key={req.id}
                  href={`/loans/detail?id=${req.id}`}
                  id={`loan-${req.id}`}
                  className="surface-card block p-4 hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isVoting ? 'bg-amber-500/10' : isOverdue ? 'bg-red-500/10' : 'bg-g-500/10'
                      }`}>
                        {isVoting ? (
                          <VoteIcon className="w-5 h-5 text-amber-500" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-g-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-sm font-bold text-[var(--text-primary)]">
                            {req.borrower?.name}
                          </span>
                          {req.isExternal && (
                            <span className="badge bg-purple-500/10 text-purple-500">External</span>
                          )}
                          <span className={`badge ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-1">{req.purpose}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                          {req.circle?.name} · {req.tenureMonths}mo @ {req.proposedInterestPct}%
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                        {formatPaise(req.amount)}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-0.5 mt-0.5">
                        Details <ChevronRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>

                  {/* Voting progress (Zerodha kite style) */}
                  {isVoting && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
                        <span>{req.votes?.length || 0} approvals cast</span>
                        <span className="text-[var(--accent-blue)] font-semibold">
                          {req.circle?.approvalThresholdPct}% threshold
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(100, ((req.votes?.length || 0) / 3) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
