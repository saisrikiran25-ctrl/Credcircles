'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { computeRiskScore } from '@/lib/domain/risk';

export default function RiskScoreDetailPage() {
  const { currentUser } = useApp();

  // Compute explainable risk factors for active user
  const riskResult = computeRiskScore({
    totalInstalmentsDue: currentUser.id === 'demo-user-rohan' ? 2 : 12,
    onTimeInstalmentsPaid: currentUser.id === 'demo-user-rohan' ? 2 : 12,
    lateInstalments: 0,
    platformAgeDays: currentUser.id === 'demo-user-rohan' ? 45 : 120,
    totalVotesReceived: 8,
    positiveVotesReceived: 7,
    lifetimeContributionsPaise: 150000,
    currentOutstandingPaise: currentUser.id === 'demo-user-rohan' ? 680000 : 0,
    isVerified: currentUser.isVerified,
  });

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Community Risk Score
          </h2>
          <p className="text-xs text-slate-500">Transparent, Explainable 0–100 Rating</p>
        </div>
      </div>

      {/* Main Score Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white text-center space-y-3 shadow-xl border border-indigo-800/40">
        <div className="inline-block p-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          {riskResult.riskBand} RISK BAND
        </div>

        <div>
          <div className="text-5xl font-black tracking-tight tabular-nums text-white">
            {riskResult.score}
            <span className="text-xl font-normal text-indigo-300">/100</span>
          </div>
          <p className="text-xs text-indigo-200 mt-2 max-w-xs mx-auto leading-relaxed">
            {riskResult.summary}
          </p>
        </div>
      </div>

      {/* Explainable Factor Breakdown (Section 3.8 Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Factor Breakdown (Non-Black-Box)
          </h3>
          <span className="text-[10px] text-indigo-600 font-semibold">100% Weight Sum</span>
        </div>

        <div className="space-y-2.5">
          {riskResult.factors.map((f, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{f.factor}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({f.weightPct}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {f.description}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                    {f.score}/100
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{f.weightedPoints} pts
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${f.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Note */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">
          Why Explainable Risk Scoring?
        </span>
        <p>
          Unlike predatory fintech apps using opaque contact-scraping algorithms, Circlo scores credit purely on verifiable financial conduct, circle trust votes, and peer savings commitments.
        </p>
      </div>
    </div>
  );
}
