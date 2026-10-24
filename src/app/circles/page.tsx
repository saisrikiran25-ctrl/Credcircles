'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  ShieldCheck,
  ChevronRight,
  PiggyBank,
  MapPin,
  Lock,
  TrendingUp,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';
import { ContributeModal } from '@/components/modals/ContributeModal';

export default function CirclesListPage() {
  const { currentUser, refreshTrigger, triggerRefresh } = useApp();
  const [circles, setCircles] = useState<any[]>([]);
  const [filter, setFilter] = useState<'MY' | 'ALL'>('MY');
  const [isLoading, setIsLoading] = useState(true);

  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/circles?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCircles(data.circles || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [currentUser.id, refreshTrigger]);

  const displayedCircles =
    filter === 'MY' ? circles.filter((c) => c.isUserMember) : circles;

  const myCount = circles.filter((c) => c.isUserMember).length;

  return (
    <div className="animate-fade-in">

      {/* ─── Header ─── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Credit Circles</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Digital Self-Help Groups · India
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/circles/join"
            id="circles-join-btn"
            className="py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] font-semibold rounded-lg text-xs transition-all hover:bg-[var(--border)]"
          >
            Enter Code
          </Link>
          <Link
            href="/circles/new"
            id="circles-create-btn"
            className="py-2 px-3 bg-g-500 hover:bg-g-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </Link>
        </div>
      </div>

      {/* ─── Filter tabs (Groww segment control) ─── */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            id="filter-my-circles"
            onClick={() => setFilter('MY')}
            className={`filter-pill ${filter === 'MY' ? 'active' : ''}`}
          >
            My Circles ({myCount})
          </button>
          <button
            id="filter-all-circles"
            onClick={() => setFilter('ALL')}
            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          >
            All Pilot Circles ({circles.length})
          </button>
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── Circle list ─── */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 w-full" />
            ))}
          </div>
        ) : displayedCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center">
              <Users className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No Circles Found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[240px]">
                Create a circle or enter an invite code to get started.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/circles/new" className="py-2 px-4 bg-g-500 text-white rounded-lg text-xs font-semibold">
                Create Circle
              </Link>
              <Link href="/circles/join" className="py-2 px-4 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold">
                Enter Code
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCircles.map((circle) => {
              const poolFill = circle.poolBalance > 0 ? Math.min(100, (circle.poolBalance / 5000000) * 100) : 0;
              return (
                <div
                  key={circle.id}
                  className="surface-card overflow-hidden"
                >
                  {/* Circle header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          {circle.isUserMember && (
                            <span className="badge bg-g-500/10 text-g-500">Member</span>
                          )}
                          <span className="badge bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]">
                            {circle.type}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {circle.city}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {circle.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                          {circle.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Pool</p>
                        <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                          {formatPaise(circle.poolBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Pool progress bar */}
                    <div className="progress-bar mb-3">
                      <div className="progress-bar-fill" style={{ width: `${poolFill}%` }} />
                    </div>

                    {/* Metric chips */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1 bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5">
                        <Users className="w-3 h-3 text-[var(--text-muted)]" />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{circle.memberCount}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">members</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-1 bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5">
                        <TrendingUp className="w-3 h-3 text-g-500" />
                        <span className="text-xs font-semibold text-g-500">{circle.interestRatePct}% p.a.</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-1 bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5">
                        <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{circle.approvalThresholdPct}% thr.</span>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="border-t border-[var(--border)] flex">
                    {circle.isUserMember && (
                      <button
                        id={`contribute-${circle.id}`}
                        onClick={() => {
                          setSelectedCircle(circle);
                          setIsContributeOpen(true);
                        }}
                        className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-g-500 hover:bg-g-500/5 transition-colors border-r border-[var(--border)]"
                      >
                        <PiggyBank className="w-3.5 h-3.5" />
                        Contribute
                      </button>
                    )}
                    <Link
                      href={`/circles/detail?id=${circle.id}`}
                      id={`view-circle-${circle.id}`}
                      className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedCircle && (
        <ContributeModal
          isOpen={isContributeOpen}
          onClose={() => setIsContributeOpen(false)}
          circleId={selectedCircle.id}
          circleName={selectedCircle.name}
          userId={currentUser.id}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
}
