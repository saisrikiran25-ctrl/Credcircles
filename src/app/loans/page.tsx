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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';

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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Community Credit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tickets ₹5k–₹20k • 8–12% p.a. • 1–6 months
          </p>
        </div>

        <Link
          href="/loans/new"
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Request Loan
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'VOTING', label: 'In Voting' },
          { id: 'ACTIVE', label: 'Active EMIs' },
          { id: 'CLOSED', label: 'Settled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
              filter === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loans List */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <VoteIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Loans Found</h3>
          <p className="text-xs text-slate-500">No loan records match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((req) => {
            const isVoting = req.status === 'VOTING';
            const isOverdue = req.status === 'OVERDUE' || req.loan?.status === 'OVERDUE';
            const isApproved = req.status === 'APPROVED';

            return (
              <Link
                key={req.id}
                href={`/loans/detail?id=${req.id}`}
                className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-subtle hover:shadow-card transition-all block space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {req.borrower?.name}
                      </span>
                      {req.isExternal && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          External Vetted
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isVoting
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : isApproved
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {req.purpose}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {req.circle?.name} • {req.tenureMonths} mo @ {req.proposedInterestPct}% p.a.
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums block">
                      {formatPaise(req.amount)}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {isVoting && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      Votes: {req.votes?.length || 0} cast
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      Target: {req.circle?.approvalThresholdPct}% threshold
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
