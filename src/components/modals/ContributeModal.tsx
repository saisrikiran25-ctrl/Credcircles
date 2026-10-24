'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, PiggyBank } from 'lucide-react';
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
        body: JSON.stringify({ circleId, userId, amountPaise, note }),
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Sheet */}
        <div
          className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-modal)] overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-g-500/10 flex items-center justify-center">
                <PiggyBank className="w-4.5 h-4.5 text-g-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Contribute to Circle</h3>
                <p className="text-xs text-[var(--text-muted)]">{circleName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Trust banner */}
            <div className="p-3 bg-g-500/10 border border-g-500/20 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-g-500 shrink-0 mt-0.5" />
              <div className="text-xs text-g-600 dark:text-g-400 leading-snug">
                <span className="font-bold text-[var(--text-primary)]">Your money stays in your bank.</span>
                <p className="mt-0.5 text-[var(--text-muted)]">
                  Circlo is a connector & ledger. Contributions are tracked logically, ready for peer lending.
                </p>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                Monthly Amount · ₹500 – ₹5,000
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-muted)]">₹</span>
                <input
                  id="contribute-amount-input"
                  type="number"
                  min={500}
                  max={5000}
                  step={100}
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Number(e.target.value))}
                  className="input-groww pl-9 text-2xl font-bold tabular-nums"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountRupees(preset)}
                  className={`filter-pill shrink-0 ${amountRupees === preset ? 'active' : ''}`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                Note (Optional)
              </label>
              <input
                id="contribute-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. October monthly savings"
                className="input-groww"
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs text-[var(--accent-red)] bg-[var(--accent-red-light)] border border-[var(--accent-red)]/20 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              id="contribute-proceed-btn"
              onClick={handleProceedToUpi}
              className="w-full py-3.5 bg-g-500 hover:bg-g-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
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
