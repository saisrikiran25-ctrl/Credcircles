'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Smartphone,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Crown,
  FileText,
  Sliders,
  Check,
  User,
  Users2,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DEMO_PERSONAS } from '@/lib/session';
import { KycVerificationModal } from '@/components/modals/KycVerificationModal';

export default function ProfilePage() {
  const { currentUser, setCurrentUserId, complianceMode, setComplianceMode, triggerRefresh } = useApp();
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* User Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
            {currentUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              {currentUser.isVerified && (
                <span title="eKYC Verified" className="inline-flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.roleDescription}
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              {currentUser.city} • {currentUser.phone}
            </span>
          </div>
        </div>

        <Link
          href="/profile/risk"
          className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-right hover:scale-105 transition-all"
        >
          <span className="text-[9px] font-bold text-indigo-500 uppercase block">Score</span>
          <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
            85/100
          </span>
        </Link>
      </div>

      {/* Switch Demo Persona Menu */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Switch Demo Persona
          </h3>
          <span className="text-[10px] text-indigo-600 font-semibold">1-Click Switch</span>
        </div>

        <div className="space-y-1.5">
          {DEMO_PERSONAS.map((p) => {
            const isActive = p.id === currentUser.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentUserId(p.id)}
                className={`w-full p-2.5 rounded-2xl text-xs flex items-center justify-between text-left transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {p.avatar}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{p.roleDescription}</div>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification & KYC Status */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Identity Verification (eKYC)
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            VERIFIED
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Masked PAN:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              ABCDE****F
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Masked Aadhaar:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              ********8821
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Registered UPI VPA:</span>
            <span className="font-mono font-bold text-indigo-600">{currentUser.upiVpa}</span>
          </div>
        </div>

        <button
          onClick={() => setIsKycModalOpen(true)}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold transition-all"
        >
          Re-verify / Update Simulated eKYC
        </button>
      </div>

      {/* Regulatory Compliance Mode Toggle */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-subtle space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            Regulatory Compliance Mode
          </h3>
          <span className="text-[10px] text-indigo-600 font-mono font-bold">Config</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setComplianceMode('PARTNERED_ESCROW')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              complianceMode === 'PARTNERED_ESCROW'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="text-xs">Option A (Partnered)</div>
            <div className="text-[10px] opacity-75 mt-0.5">Licensed NBFC-P2P LSP</div>
          </button>

          <button
            onClick={() => setComplianceMode('CLOSED_CIRCLES')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              complianceMode === 'CLOSED_CIRCLES'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="text-xs">Option C (Closed)</div>
            <div className="text-[10px] opacity-75 mt-0.5">Strictly Closed Circles</div>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          {complianceMode === 'PARTNERED_ESCROW'
            ? 'Option A enables cross-group lending with simulated NBFC-P2P partner escrow audits.'
            : 'Option C disables all external/cross-group lending to stay within private community exemptions.'}
        </p>
      </div>

      {/* Circle Premium Upgrade Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-900/60 shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
              Circle Pro (₹99/month)
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-300">
              Unlocks portfolio analytics, auto-invest, & priority support.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsPremiumModalOpen(true)}
          className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all shrink-0"
        >
          Manage
        </button>
      </div>

      {/* Legal & Explainer Links */}
      <div className="space-y-1.5 text-xs">
        <Link
          href="/admin"
          className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Pilot Metrics & Revenue View (Admin)
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Connector & Ledger Principle (No Fund Holding)
          </span>
          <span className="text-[10px] font-bold text-emerald-600">Active</span>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Terms of Service & Youth Privacy Policy
          </span>
          <span className="text-[10px] text-slate-400">v1.0 (Pilot)</span>
        </div>
      </div>

      {/* Modals */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        userId={currentUser.id}
        onVerified={triggerRefresh}
      />

      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Circle Pro Subscription</h3>
              <p className="text-xs text-slate-500 mt-1">
                ₹99/month per group (Simulated LSP service fee model from Section 3.8b).
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Deep portfolio analytics & exposure graphs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Automated monthly mandate scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Priority mediator escalation support</span>
              </div>
            </div>
            <button
              onClick={() => {
                alert('Circle Pro active in prototype mode!');
                setIsPremiumModalOpen(false);
              }}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs shadow-md"
            >
              Confirm Subscription (Simulated)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
