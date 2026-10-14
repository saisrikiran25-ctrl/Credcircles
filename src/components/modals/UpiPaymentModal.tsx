'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, AlertCircle, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';
import { formatPaise } from '@/lib/domain/currency';
import { UpiService } from '@/lib/services/upiService';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payeeVpa: string;
  payeeName: string;
  amountPaise: number;
  note: string;
  onPaymentSuccess: (utr: string) => void;
  title?: string;
  actionLabel?: string;
}

export function UpiPaymentModal({
  isOpen,
  onClose,
  payeeVpa,
  payeeName,
  amountPaise,
  note,
  onPaymentSuccess,
  title = 'Direct UPI Transfer',
  actionLabel = 'Simulate UPI Payment',
}: UpiPaymentModalProps) {
  const [outcome, setOutcome] = useState<'SUCCESS' | 'FAILURE'>('SUCCESS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUtr, setSuccessUtr] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiUri = UpiService.generatePaymentUri({
    payeeVpa,
    payeeName,
    amountPaise,
    transactionNote: note,
    referenceId: `REF${Date.now()}`,
  });

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Simulate network delay
    setTimeout(() => {
      setIsProcessing(false);
      if (outcome === 'FAILURE') {
        setErrorMsg('Simulated bank transaction failed: Insufficient account funds or bank timeout.');
      } else {
        const res = UpiService.simulateTransaction('SUCCESS');
        setSuccessUtr(res.utr);
        setTimeout(() => {
          onPaymentSuccess(res.utr);
          onClose();
        }, 1200);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">{title}</h3>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Prototype / Simulated Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center">
          {successUtr ? (
            <div className="py-8 flex flex-col items-center animate-scale-up">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment Confirmed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">UTR: {successUtr}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                Event successfully committed to append-only ledger.
              </p>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="mb-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">Amount to Transfer</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {formatPaise(amountPaise)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  To: <span className="font-semibold">{payeeName}</span> ({payeeVpa})
                </div>
              </div>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 mb-3">
                <QRCodeSVG value={upiUri} size={150} level="M" />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 px-3">
                Direct peer-to-peer UPI transfer. The platform is a connector + ledger and never holds funds.
              </div>

              {/* Simulation Mode Toggle */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-4 text-left">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Prototype Outcome Simulation:
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome('SUCCESS')}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                      outcome === 'SUCCESS'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('FAILURE')}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                      outcome === 'FAILURE'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Simulate Fail
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="w-full p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 mb-3 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="w-full space-y-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting to Simulated UPI Switch...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      {actionLabel}
                    </>
                  )}
                </button>

                <a
                  href={upiUri}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in UPI App (Deep-link)
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
