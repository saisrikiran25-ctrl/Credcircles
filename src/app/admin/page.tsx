'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { formatPaise, formatLakhCrore } from '@/lib/domain/currency';

export default function AdminPilotMetricsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  const { pilotMetrics, revenueMetrics, illustrativeProjections } = data;

  return (
    <div className="p-4 space-y-5">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pilot Metrics & Revenue</h2>
          <p className="text-xs text-slate-500">Business Model Dashboard & Unit Economics</p>
        </div>
      </div>

      {/* Pilot Progress Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Phase 1 Pilot Target
          </span>
          <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded-full font-mono text-indigo-200">
            Hyderabad Campuses
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-indigo-300 block">Active Circles</span>
            <div className="text-2xl font-black tabular-nums mt-0.5">
              {pilotMetrics.activeCirclesCount}
              <span className="text-xs font-normal text-indigo-300"> / 100 Target</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-indigo-300 block">Total AUM Facilitated</span>
            <div className="text-2xl font-black tabular-nums mt-0.5">
              {formatLakhCrore(pilotMetrics.totalAumPaise)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-800/50 text-center text-xs">
          <div>
            <span className="text-[10px] text-indigo-300 block">On-Time Rate</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {pilotMetrics.onTimeRepaymentRate}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block">Group Retention</span>
            <span className="font-bold text-indigo-300 tabular-nums">
              {pilotMetrics.groupRetentionRatePct}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block">Simulated NPS</span>
            <span className="font-bold text-amber-400 tabular-nums">
              +{pilotMetrics.simulatedNpsScore}
            </span>
          </div>
        </div>
      </div>

      {/* Internal Revenue Model View (Section 3.8b) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Platform Revenue Streams
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            Realized
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              1. Platform Take Rate (1.5%)
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {formatPaise(revenueMetrics.totalPlatformFeesPaise)}
            </div>
            <p className="text-[10px] text-slate-500">1.0%–2.5% of facilitated principal</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              2. Circle Pro Subscriptions
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {formatPaise(revenueMetrics.totalPremiumRevenuePaise)}
            </div>
            <p className="text-[10px] text-slate-500">₹99/month service fee per group</p>
          </div>
        </div>
      </div>

      {/* 3-Year Illustrative Financial Projections (Section 12 of Business Description) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3-Year Financial Model
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
            Illustrative
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {illustrativeProjections.map((proj: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {proj.year}
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                  {proj.annualRevenue}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <div>
                  <span className="block text-slate-400">Circles</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {proj.activeCircles}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Avg Pool</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {proj.avgPoolSize}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Total AUM</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {proj.totalAum}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Take Rate</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {proj.takeRate}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-200 dark:border-slate-800">
                {proj.focus}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stretch / Future Roadmap Cards (Section 8) */}
      <div className="space-y-2 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Roadmap & Stretch Horizons
        </h3>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              Cross-Sell: Sachet Insurance & Credit Reports
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              Coming Soon
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Accident/gadget insurance partner integration and bureau score reporting for credit-builder members.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              Option B: Proprietary NBFC-P2P Licence
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              Phase 3 Horizon
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Target ₹2 Cr Net Owned Funds (NOF) requirement for full escrow ownership once 5,000+ active circles are scaled.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              B2B SaaS Fallback for Microfinance & SHGs
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              Contingency
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            White-label digital ledger suite for rural SHG federations and MFIs if consumer metrics encounter friction.
          </p>
        </div>
      </div>
    </div>
  );
}
