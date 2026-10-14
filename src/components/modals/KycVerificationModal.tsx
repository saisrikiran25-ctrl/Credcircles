'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { KycService } from '@/lib/services/kycService';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onVerified: () => void;
}

export function KycVerificationModal({
  isOpen,
  onClose,
  userId,
  onVerified,
}: KycVerificationModalProps) {
  const [docType, setDocType] = useState<'PAN' | 'AADHAAR'>('PAN');
  const [docValue, setDocValue] = useState<string>('ABCDE1234F');
  const [otp, setOtp] = useState<string>('123456');
  const [step, setStep] = useState<'DOCUMENT' | 'OTP' | 'SUCCESS'>('DOCUMENT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setErrorMsg(null);
    if (docType === 'PAN') {
      const clean = docValue.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
        setErrorMsg('Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
        return;
      }
    } else {
      const clean = docValue.replace(/\s+/g, '');
      if (!/^[0-9]{12}$/.test(clean)) {
        setErrorMsg('Invalid Aadhaar format. Must be a 12-digit number.');
        return;
      }
    }
    setStep('OTP');
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    const result = KycService.verifyDocument(docType, docValue, otp);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          docType,
          maskedNumber: result.maskedNumber,
        }),
      });

      if (res.ok) {
        setStep('SUCCESS');
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      } else {
        setErrorMsg('Failed to update KYC status');
      }
    } catch {
      setErrorMsg('Network error verifying KYC');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Simulated eKYC</h3>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Prototype / Simulated NSDL & UIDAI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {step === 'SUCCESS' ? (
            <div className="py-8 flex flex-col items-center text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Identity Verified!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your profile now has the Verified Peer badge. You are eligible to lend and borrow.
              </p>
            </div>
          ) : step === 'OTP' ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Enter Simulated OTP</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Demo mode OTP: <span className="font-bold text-indigo-600">123456</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-2xl font-bold py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                Verify & Submit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                Never enter real government IDs. Format validated only; stored masked.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocType('PAN');
                    setDocValue('ABCDE1234F');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    docType === 'PAN'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  PAN Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocType('AADHAAR');
                    setDocValue('123456789012');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    docType === 'AADHAAR'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Aadhaar (UIDAI)
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {docType === 'PAN' ? 'PAN Number (e.g. ABCDE1234F)' : '12-digit Aadhaar Number'}
                </label>
                <input
                  type="text"
                  value={docValue}
                  onChange={(e) => setDocValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                Send Verification OTP
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
