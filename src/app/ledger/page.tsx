'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatPaise } from '@/lib/domain/currency';
import { useApp } from '@/context/AppContext';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string; direction: '+' | '-' }> = {
  CONTRIBUTION:          { icon: ArrowDownLeft,  color: 'text-g-500',             bg: 'bg-g-500/10',           label: 'Contribution',   direction: '+' },
  DISBURSEMENT:          { icon: ArrowUpRight,   color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10', label: 'Disbursement',   direction: '-' },
  REPAYMENT_PRINCIPAL:   { icon: CheckCircle2,   color: 'text-g-500',             bg: 'bg-g-500/10',           label: 'Principal Repay', direction: '+' },
  REPAYMENT_INTEREST:    { icon: TrendingUp,     color: 'text-amber-500',          bg: 'bg-amber-500/10',       label: 'Interest',       direction: '+' },
  LATE_PENALTY:          { icon: AlertCircle,    color: 'text-red-500',            bg: 'bg-red-500/10',         label: 'Late Penalty',   direction: '-' },
};

export default function GlobalLedgerPage() {
  const { currentUser, refreshTrigger } = useApp();
  const [entries, setEntries] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    { id: 'REPAYMENT_PRINCIPAL', label: 'Principal' },
    { id: 'REPAYMENT_INTEREST', label: 'Interest' },
    { id: 'LATE_PENALTY', label: 'Penalties' },
  ];

  return (
    <div className="animate-fade-in">

      {/* ─── Header ─── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Ledger</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Append-only · Immutable record
          </p>
        </div>
        <a
          href={`/api/ledger/export?circleId=${selectedCircle}`}
          id="export-csv-btn"
          className="py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[var(--border)] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </a>
      </div>

      {/* ─── Invariant Banner (Groww-style trust badge) ─── */}
      <div className="mx-4 mb-3 p-3 bg-g-500/10 border border-g-500/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-g-500">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Append-Only Invariant — entries cannot be edited or deleted</span>
        </div>
        <span className="text-[10px] font-bold text-g-500 font-mono shrink-0 ml-2">✓ Verified</span>
      </div>

      {/* ─── Filter bar ─── */}
      <div className="px-4 pb-3 space-y-2">
        {/* Circle filter pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSelectedCircle('all')}
            className={`filter-pill ${selectedCircle === 'all' ? 'active' : ''}`}
          >
            All Circles
          </button>
          {circles.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCircle(c.id)}
              className={`filter-pill ${selectedCircle === c.id ? 'active' : ''}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {entryTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`filter-pill ${selectedType === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── Entry list (Zerodha kite transaction style) ─── */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No Entries Found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">No events match the selected filters.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const typeKey = entry.type as string;
              const cfg = TYPE_CONFIG[typeKey] || {
                icon: BookOpen,
                color: 'text-[var(--text-secondary)]',
                bg: 'bg-[var(--bg-surface)]',
                label: typeKey.replace(/_/g, ' '),
                direction: '+',
              };
              const Icon = cfg.icon;
              const isOutflow = cfg.direction === '-';

              return (
                <div
                  key={entry.id}
                  className="surface-card flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-surface)] transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{cfg.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono border border-[var(--border)]">
                        {entry.circle?.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                      {entry.actorName || 'System'} · {entry.description}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 opacity-60">
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}Ref: …{entry.referenceId.slice(-8)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${isOutflow ? 'text-[var(--accent-red)]' : 'text-g-500'}`}>
                      {isOutflow ? '−' : '+'}
                      {formatPaise(entry.amount)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formatPaise(entry.balanceAfter)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
