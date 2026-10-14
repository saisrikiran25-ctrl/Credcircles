'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatPaise } from '@/lib/domain/currency';
import { SYSTEM_LIMITS, validateContributionAmount } from '@/lib/domain/rules';
import { UpiPaymentModal } from './UpiPaymentModal';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  userId: string;
  onSuccess: () => void;
}

export function ContributeModal({
  isOpen,
  onClose,
  circleId,
  circleName,
  userId,
  onSuccess,
}: ContributeModalProps) {
  const [amountRupees, setAmountRupees] = useState<number>(1000);
  const [note, setNote] = useState<string>('Monthly pool savings commitment');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const amountPaise = amountRupees * 100;
  const presets = [500, 1000, 2000, 3000, 5000];

  const handleProceedToUpi = () => {
    const val = validateContributionAmount(amountPaise);
    if (!val.isValid) {
      setErrorMsg(val.error || 'Invalid amount');
      return;
    }
    setErrorMsg(null);
    setShowUpiModal(true);
  };

  const handlePaymentCompleted = async (utr: string) => {
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circleId,
          userId,
          amountPaise,
          note,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to record contribution');
      }
    } catch (e) {
      setErrorMsg('Network error recording contribution');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Contribute to Circle</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{circleName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* The Critical Invariant Banner */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
                <span className="font-bold">Your money stays in your bank account.</span>
                <p className="mt-0.5 text-[11px] opacity-90">
                  Circlo is a connector & ledger. Contributions are committed savings tracked logically in-app, ready for peer lending.
                </p>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Monthly Amount (₹500 – ₹5,000)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={500}
                  max={5000}
                  step={100}
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-bold tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountRupees(preset)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    amountRupees === preset
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. October monthly savings"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleProceedToUpi}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Confirm via UPI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        payeeVpa="circle.pool@circlo"
        payeeName={`${circleName} (Logical Pool)`}
        amountPaise={amountPaise}
        note={note}
        onPaymentSuccess={handlePaymentCompleted}
        title="Confirm Contribution"
        actionLabel="Simulate UPI Confirmation"
      />
    </>
  );
}
