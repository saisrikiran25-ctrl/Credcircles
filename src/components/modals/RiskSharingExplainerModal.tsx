'use client';

import React, { useState } from 'react';
import { X, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatPaise } from '@/lib/domain/currency';
import { computeProportionalRiskSharing } from '@/lib/domain/riskSharing';

interface RiskSharingExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RiskSharingExplainerModal({
  isOpen,
  onClose,
}: RiskSharingExplainerModalProps) {
  const [defaultAmountRupees, setDefaultAmountRupees] = useState<number>(3000);

  if (!isOpen) return null;

  const mockLenders = [
    { memberId: '1', memberName: 'Aarav (Admin / Lender)', fundedAmountPaise: 600000 },
    { memberId: '2', memberName: 'Sneha (Peer Lender)', fundedAmountPaise: 400000 },
  ];

  const report = computeProportionalRiskSharing(mockLenders, defaultAmountRupees * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Proportional Risk-Sharing
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                SHG collective protection principle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            In traditional P2P platforms, a single lender can suffer a 100% loss on a bad loan. In a <strong>Credit Circle</strong>, risk is distributed: losses on a defaulted loan are shared proportionally among lending members based on their capital commitment.
          </p>

          {/* Interactive Simulator */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                Simulated Loan: ₹10,000 (100% pool funded)
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Unrecoverable Default Loss:
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  ₹{defaultAmountRupees.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={defaultAmountRupees}
                onChange={(e) => setDefaultAmountRupees(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Proportional Loss Absorption:
              </span>
              {report.allocations.map((alloc) => (
                <div
                  key={alloc.memberId}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {alloc.memberName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Funded: {formatPaise(alloc.fundedAmountPaise)} ({alloc.sharePct}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-rose-600 font-bold tabular-nums">
                      -{formatPaise(alloc.lossBornePaise)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium tabular-nums">
                      Recovered: {formatPaise(alloc.recoveredPrincipalPaise)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-2 text-amber-900 dark:text-amber-200 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Regulatory Risk Disclosure:</strong> Community lending carries risk of principal loss. Loans are not insured by DICGC or guaranteed by RBI. Circles mitigate risk through peer vetting, small tickets, and collective accountability.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
