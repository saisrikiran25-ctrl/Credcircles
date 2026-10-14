'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calculator,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatPaise } from '@/lib/domain/currency';
import { calculateLoanSchedule } from '@/lib/domain/emi';
import { LOAN_PURPOSES, SYSTEM_LIMITS } from '@/lib/domain/rules';
import { analyzeExposure } from '@/lib/domain/exposure';

export default function NewLoanRequestPage() {
  const router = useRouter();
  const { currentUser, triggerRefresh } = useApp();

  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [amountRupees, setAmountRupees] = useState<number>(10000);
  const [tenureMonths, setTenureMonths] = useState<number>(3);
  const [proposedInterestPct, setProposedInterestPct] = useState<number>(10.0);
  const [purpose, setPurpose] = useState<string>(LOAN_PURPOSES[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/circles?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        const myCircles = data.circles?.filter((c: any) => c.isUserMember) || [];
        setCircles(myCircles);
        if (myCircles.length > 0) {
          setSelectedCircleId(myCircles[0].id);
          setProposedInterestPct(myCircles[0].interestRatePct || 10.0);
        }
      });
  }, [currentUser.id]);

  const selectedCircle = circles.find((c) => c.id === selectedCircleId);
  const amountPaise = amountRupees * 100;

  // Live EMI Schedule calculation
  const schedule = calculateLoanSchedule(amountPaise, proposedInterestPct, tenureMonths);

  // Live Exposure Analysis
  const exposure = selectedCircle
    ? analyzeExposure({
        poolBalancePaise: selectedCircle.poolBalance,
        circleMaxLoanPaise: selectedCircle.maxLoanAmount,
        requestedAmountPaise: amountPaise,
        borrowerExistingOutstandingPaise: 0,
        totalCircleOutstandingPaise: selectedCircle.totalOutstandingPaise || 0,
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircleId) {
      setErrorMsg('Please select a circle to request from.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circleId: selectedCircleId,
          borrowerId: currentUser.id,
          amountPaise,
          purpose,
          tenureMonths,
          proposedInterestPct,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        triggerRefresh();
        router.push(`/loans/${data.loanRequest.id}`);
      } else {
        setErrorMsg(data.error || 'Failed to submit loan request');
      }
    } catch {
      setErrorMsg('Network error submitting loan request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/loans"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Circle Loan</h2>
          <p className="text-xs text-slate-500">Pilot Limits: ₹5k–₹20k • 1–6 Months</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Circle Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Select Lending Circle
          </label>
          <select
            value={selectedCircleId}
            onChange={(e) => {
              setSelectedCircleId(e.target.value);
              const found = circles.find((c) => c.id === e.target.value);
              if (found) setProposedInterestPct(found.interestRatePct);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Pool: {formatPaise(c.poolBalance)})
              </option>
            ))}
          </select>
        </div>

        {/* Loan Purpose */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Loan Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            {LOAN_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Slider */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Loan Amount (₹5,000 – ₹20,000)
            </label>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              ₹{amountRupees.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={5000}
            max={20000}
            step={1000}
            value={amountRupees}
            onChange={(e) => setAmountRupees(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>₹5,000</span>
            <span>₹20,000</span>
          </div>
        </div>

        {/* Tenure Selector */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Tenure in Months (1 – 6)
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTenureMonths(m)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  tenureMonths === m
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Proposed Interest Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Proposed Interest Rate (8% – 12% p.a.)
            </label>
            <span className="text-xs font-extrabold text-indigo-600 tabular-nums">
              {proposedInterestPct}% p.a.
            </span>
          </div>
          <input
            type="range"
            min={8.0}
            max={12.0}
            step={0.5}
            value={proposedInterestPct}
            onChange={(e) => setProposedInterestPct(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* Live EMI & Fee Preview */}
        <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Repayment & Fee Preview
            </span>
            <span className="text-[10px] text-indigo-600 font-bold bg-white dark:bg-indigo-900 px-2 py-0.5 rounded-full">
              Simple Interest
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatPaise(schedule.monthlyEmiBase)}
              </span>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Total Interest</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">
                {formatPaise(schedule.totalInterest)}
              </span>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Total Due</span>
              <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatPaise(schedule.totalRepayable)}
              </span>
            </div>
          </div>

          {/* Platform Fee Breakdown */}
          <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Platform Take Rate (1.5% principal):</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {formatPaise(schedule.platformFee)}
            </span>
          </div>
        </div>

        {/* Liquidity & Exposure Nudges */}
        {exposure && (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Risk & Exposure Panel
            </span>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Group Available Liquidity:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {formatPaise(exposure.availableLiquidityPaise)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Recommended Max Exposure:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {formatPaise(exposure.recommendedMaxExposurePaise)}
              </span>
            </div>

            {exposure.nudges.map((nudge, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-[11px] flex items-start gap-1.5 ${
                  nudge.type === 'CRITICAL'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : nudge.type === 'WARNING'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>{nudge.title}:</strong> {nudge.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Opening Vote...' : 'Submit Request for Circle Voting (48h)'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
