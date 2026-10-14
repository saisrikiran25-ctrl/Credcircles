'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Info,
  Users2,
  Sliders,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  CIRCLE_TYPES,
  SUPPORTED_CITIES,
  SYSTEM_LIMITS,
} from '@/lib/domain/rules';

export default function CreateCirclePage() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<string>(CIRCLE_TYPES[0]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [city, setCity] = useState<string>('Hyderabad');

  // Rules state
  const [maxLoanRupees, setMaxLoanRupees] = useState<number>(15000);
  const [interestRatePct, setInterestRatePct] = useState<number>(10.0);
  const [approvalThresholdPct, setApprovalThresholdPct] = useState<number>(70);
  const [latePenaltyType, setLatePenaltyType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [latePenaltyValue, setLatePenaltyValue] = useState<number>(50); // ₹50 flat or 2%
  const [complianceMode, setComplianceMode] = useState<'PARTNERED_ESCROW' | 'CLOSED_CIRCLES'>(
    'PARTNERED_ESCROW'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any>(null);

  const handleCreate = async () => {
    if (!name || name.trim().length < 3) {
      setErrorMsg('Circle name must be at least 3 characters.');
      return;
    }

    if (interestRatePct < 8 || interestRatePct > 12) {
      setErrorMsg('Interest rate must be within 8% – 12% p.a. as per circle governance limits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          type,
          city,
          createdById: currentUser.id,
          maxLoanAmountPaise: maxLoanRupees * 100,
          interestRatePct,
          approvalThresholdPct,
          latePenaltyType,
          latePenaltyValue: latePenaltyType === 'FLAT' ? latePenaltyValue * 100 : latePenaltyValue,
          complianceMode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to create circle');
      }
    } catch {
      setErrorMsg('Network error creating circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/circles"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create a Credit Circle</h2>
          <p className="text-xs text-slate-500">Step {step} of 3</p>
        </div>
      </div>

      {createdResult ? (
        <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/60 text-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Circle Created!</h3>
            <p className="text-xs text-slate-500 mt-1">
              {createdResult.circle?.name} is ready. Share your invite code with trusted peers.
            </p>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              Your Shareable Invite Code
            </span>
            <div className="text-2xl font-black tracking-widest text-indigo-700 dark:text-indigo-300 font-mono">
              {createdResult.inviteCode}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Only verified members can join using this code.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(createdResult.inviteCode);
                alert('Invite code copied to clipboard!');
              }}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Copy Code
            </button>
            <Link
              href={`/circles/detail?id=${createdResult.circle?.id}`}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              Open Circle
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step 1: Type & Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. Choose Circle Type
                </label>
                <div className="space-y-2">
                  {CIRCLE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs flex items-center justify-between transition-all ${
                        type === t
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200 shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{t}</span>
                      {type === t && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circle City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {SUPPORTED_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs shadow-md transition-all"
              >
                Continue to Details
              </button>
            </div>
          )}

          {/* Step 2: Name & Purpose */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gachibowli Hostel Fellows"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Group Purpose
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Emergency exam dues, hostel deposits, and skills gear."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!name.trim()) {
                      setErrorMsg('Please enter a circle name');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(3);
                  }}
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs shadow-md"
                >
                  Configure Rules
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Circle Rules & Policies */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2 text-xs text-indigo-950 dark:text-indigo-200">
                <Sliders className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  Configure the collective governance rules. Edits require circle proposal and affect only new loans.
                </span>
              </div>

              {/* Max Loan per Member */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Max Loan per Member (₹5k – ₹20k)
                  </label>
                  <span className="text-xs font-extrabold text-indigo-600 tabular-nums">
                    ₹{maxLoanRupees.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={20000}
                  step={1000}
                  value={maxLoanRupees}
                  onChange={(e) => setMaxLoanRupees(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Interest Policy */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Interest Policy (8% – 12% p.a.)
                  </label>
                  <span className="text-xs font-extrabold text-indigo-600 tabular-nums">
                    {interestRatePct}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={8.0}
                  max={12.0}
                  step={0.5}
                  value={interestRatePct}
                  onChange={(e) => setInterestRatePct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Community rates protect peers from usurious fintech rates while providing modest yield.
                </span>
              </div>

              {/* Approval Threshold */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Approval Threshold (Default 70%)
                  </label>
                  <span className="text-xs font-extrabold text-indigo-600 tabular-nums">
                    {approvalThresholdPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={approvalThresholdPct}
                  onChange={(e) => setApprovalThresholdPct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Late Penalty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Late-Payment Penalty
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLatePenaltyType('FLAT');
                      setLatePenaltyValue(50);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border ${
                      latePenaltyType === 'FLAT'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                    }`}
                  >
                    Flat ₹50 / late EMI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLatePenaltyType('PERCENTAGE');
                      setLatePenaltyValue(2);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border ${
                      latePenaltyType === 'PERCENTAGE'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                    }`}
                  >
                    2% of EMI
                  </button>
                </div>
              </div>

              {/* Compliance Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Regulatory Compliance Mode
                </label>
                <select
                  value={complianceMode}
                  onChange={(e) => setComplianceMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="PARTNERED_ESCROW">
                    Mode A: Licensed NBFC-P2P Partnered (Recommended)
                  </option>
                  <option value="CLOSED_CIRCLES">
                    Mode C: Strictly Closed Circles (Internal only)
                  </option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Circle...' : 'Confirm & Create Circle'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
