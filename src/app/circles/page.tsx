'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  ShieldCheck,
  ChevronRight,
  PiggyBank,
  Sparkles,
  MapPin,
  Lock,
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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Credit Circles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Digital Self-Help Groups for India’s youth
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/circles/join"
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            Join Code
          </Link>
          <Link
            href="/circles/new"
            className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          onClick={() => setFilter('MY')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filter === 'MY'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          My Circles ({circles.filter((c) => c.isUserMember).length})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filter === 'ALL'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          All Pilot Circles ({circles.length})
        </button>
      </div>

      {/* Circles List */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        </div>
      ) : displayedCircles.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Circles Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You have not joined any circles yet. Create a circle or enter an invite code to begin.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link
              href="/circles/new"
              className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Create Circle
            </Link>
            <Link
              href="/circles/join"
              className="py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold"
            >
              Enter Code
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedCircles.map((circle) => (
            <div
              key={circle.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-subtle hover:shadow-card transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                      {circle.type}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {circle.city}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {circle.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {circle.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Pool Balance
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatPaise(circle.poolBalance)}
                  </span>
                </div>
              </div>

              {/* Metrics Pill Row */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Members</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {circle.memberCount} peers
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Interest</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {circle.interestRatePct}% p.a.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Threshold</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {circle.approvalThresholdPct}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {circle.isUserMember && (
                  <button
                    onClick={() => {
                      setSelectedCircle(circle);
                      setIsContributeOpen(true);
                    }}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    Contribute
                  </button>
                )}

                <Link
                  href={`/circles/detail?id=${circle.id}`}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  View Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

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
