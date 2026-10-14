'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { formatPaise } from '@/lib/domain/currency';
import { useApp } from '@/context/AppContext';

export default function GlobalLedgerPage() {
  const { currentUser, refreshTrigger } = useApp();
  const [entries, setEntries] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch circles for filter
    fetch('/api/circles')
      .then((res) => res.json())
      .then((data) => setCircles(data.circles || []));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (selectedCircle !== 'all') query.set('circleId', selectedCircle);
    if (selectedType !== 'all') query.set('type', selectedType);

    fetch(`/api/ledger?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedCircle, selectedType, refreshTrigger]);

  const entryTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'CONTRIBUTION', label: 'Contributions' },
    { id: 'DISBURSEMENT', label: 'Disbursements' },
    { id: 'REPAYMENT_PRINCIPAL', label: 'Principal Repayments' },
    { id: 'REPAYMENT_INTEREST', label: 'Interest Accrued' },
    { id: 'LATE_PENALTY', label: 'Penalties' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparent Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable, append-only record of all circle transactions
          </p>
        </div>

        <a
          href={`/api/ledger/export?circleId=${selectedCircle}`}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </a>
      </div>

      {/* Invariant Guarantee Banner */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Append-Only Invariant: No entries can be edited or deleted.</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 font-mono">
          Verified
        </span>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Circle Filter
          </label>
          <select
            value={selectedCircle}
            onChange={(e) => setSelectedCircle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">All Circles</option>
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Entry Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            {entryTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table / List */}
      {isLoading ? (
        <div className="space-y-2.5">
          <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Ledger Entries</h3>
          <p className="text-xs text-slate-500">No events found for this filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => {
            const isOutflow = entry.type.includes('DISBURSEMENT');

            return (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-subtle flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-100 dark:bg-slate-700 text-slate-500">
                      {entry.circle?.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {entry.actorName || 'System'} • {entry.description}
                  </p>

                  <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Ref: {entry.referenceId.slice(-10)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black tabular-nums text-sm ${
                      isOutflow ? 'text-indigo-600' : 'text-emerald-600'
                    }`}
                  >
                    {isOutflow ? '-' : '+'}
                    {formatPaise(entry.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Balance: {formatPaise(entry.balanceAfter)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
