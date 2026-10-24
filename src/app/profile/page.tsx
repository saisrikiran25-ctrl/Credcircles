'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Crown,
  Sliders,
  Check,
  Users2,
  Lock,
  LogOut,
  Bell,
  HelpCircle,
  FileText,
  BarChart3,
  Zap,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DEMO_PERSONAS } from '@/lib/session';
import { KycVerificationModal } from '@/components/modals/KycVerificationModal';

export default function ProfilePage() {
  const { currentUser, setCurrentUserId, complianceMode, setComplianceMode, triggerRefresh } = useApp();
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const settingsItems = [
    { icon: BarChart3, label: 'Pilot Metrics & Revenue', sub: 'Admin view', href: '/admin', action: 'chevron' },
    { icon: FileText,  label: 'Terms of Service',        sub: 'v1.0 · Pilot',  href: '#',    action: 'chevron' },
    { icon: Lock,      label: 'Connector & Ledger Principle', sub: 'No Fund Holding — Active', href: '#', action: 'badge', badge: 'Active' },
  ];

  return (
    <div className="animate-fade-in pb-6">

      {/* ─── Profile Hero (Groww account header) ─── */}
      <div className="hero-gradient-groww px-4 pt-5 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-g-500/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-g-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {currentUser.avatar}
            </div>
            {currentUser.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-g-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{currentUser.name}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentUser.roleDescription}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{currentUser.upiVpa}</p>
          </div>

          <Link
            href="/profile/risk"
            id="risk-score-profile"
            className="text-right bg-white/10 rounded-xl px-3 py-2 hover:bg-white/15 transition-colors"
          >
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Circle Score</span>
            <span className="text-xl font-bold text-g-500 tabular-nums">85</span>
            <span className="text-xs text-[var(--text-muted)]">/100</span>
          </Link>
        </div>

        {/* Location + phone */}
        <div className="flex items-center gap-3 mt-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">📍 {currentUser.city}</span>
          <span>·</span>
          <span className="font-mono">{currentUser.phone}</span>
        </div>
      </div>

      {/* ─── SWITCH PERSONA ─── */}
      <div className="px-4 py-4">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Switch Demo Persona
        </h2>
        <div className="surface-card overflow-hidden">
          {DEMO_PERSONAS.map((p, i) => {
            const isActive = p.id === currentUser.id;
            return (
              <button
                key={p.id}
                id={`persona-${p.id}`}
                onClick={() => setCurrentUserId(p.id)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                  i < DEMO_PERSONAS.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                } ${isActive ? 'bg-g-500/5' : 'hover:bg-[var(--bg-surface)]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isActive ? 'bg-g-500 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]'
                  }`}>
                    {p.avatar}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {p.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">{p.roleDescription}</p>
                  </div>
                </div>
                {isActive
                  ? <Check className="w-4 h-4 text-g-500 shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── KYC / IDENTITY ─── */}
      <div className="px-4 py-4">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Identity & KYC
        </h2>
        <div className="surface-card overflow-hidden">
          {/* Verified header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-g-500" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">eKYC Status</span>
            </div>
            <span className="badge bg-g-500/10 text-g-500">VERIFIED</span>
          </div>

          {/* Details */}
          {[
            { label: 'Masked PAN', value: 'ABCDE****F', mono: true },
            { label: 'Masked Aadhaar', value: '********8821', mono: true },
            { label: 'UPI VPA', value: currentUser.upiVpa, mono: true, highlight: true },
          ].map((row, i) => (
            <div
              key={i}
              className={`px-4 py-3 flex items-center justify-between ${i < 2 ? 'border-b border-[var(--border-subtle)]' : ''}`}
            >
              <span className="text-xs text-[var(--text-muted)]">{row.label}</span>
              <span className={`text-xs font-semibold ${row.mono ? 'font-mono' : ''} ${row.highlight ? 'text-g-500' : 'text-[var(--text-primary)]'}`}>
                {row.value}
              </span>
            </div>
          ))}

          {/* Action */}
          <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
            <button
              id="re-verify-kyc-btn"
              onClick={() => setIsKycModalOpen(true)}
              className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold transition-all"
            >
              Re-verify / Update Simulated eKYC
            </button>
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── COMPLIANCE MODE ─── */}
      <div className="px-4 py-4">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Regulatory Mode
        </h2>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {[
            { id: 'PARTNERED_ESCROW', title: 'Option A', sub: 'Licensed NBFC-P2P LSP' },
            { id: 'CLOSED_CIRCLES',   title: 'Option C', sub: 'Strictly Closed Circles' },
          ].map((opt) => {
            const isActive = complianceMode === opt.id;
            return (
              <button
                key={opt.id}
                id={`compliance-${opt.id.toLowerCase()}`}
                onClick={() => setComplianceMode(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-g-500/10 border-g-500 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-g-500" />}
                  <span className="text-xs font-bold">{opt.title}</span>
                </div>
                <span className="text-[11px] opacity-70">{opt.sub}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] px-1">
          {complianceMode === 'PARTNERED_ESCROW'
            ? 'Option A enables cross-group lending with simulated NBFC-P2P partner escrow audits.'
            : 'Option C disables all external/cross-group lending to stay within private community exemptions.'}
        </p>
      </div>

      <div className="section-divider" />

      {/* ─── CIRCLE PRO UPGRADE ─── */}
      <div className="px-4 py-4">
        <div className="surface-card p-4 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Circle Pro</p>
                <p className="text-xs text-[var(--text-muted)]">₹99/month · Analytics & more</p>
              </div>
            </div>
            <button
              id="upgrade-pro-btn"
              onClick={() => setIsPremiumModalOpen(true)}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* ─── SETTINGS LINKS ─── */}
      <div className="px-4 py-4">
        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          More
        </h2>
        <div className="surface-card overflow-hidden">
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                id={`settings-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-surface)] transition-colors ${
                  i < settingsItems.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border)] shrink-0">
                  <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  {item.sub && <p className="text-[11px] text-[var(--text-muted)]">{item.sub}</p>}
                </div>
                {item.action === 'badge' && item.badge ? (
                  <span className="badge bg-g-500/10 text-g-500">{item.badge}</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        userId={currentUser.id}
        onVerified={triggerRefresh}
      />

      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsPremiumModalOpen(false)}>
          <div
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-modal)] p-6 space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Circle Pro</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                ₹99/month per group · Simulated LSP fee model (§3.8b)
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                'Deep portfolio analytics & exposure graphs',
                'Automated monthly mandate scheduling',
                'Priority mediator escalation support',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-g-500 shrink-0" />
                  <span className="text-xs text-[var(--text-secondary)]">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                alert('Circle Pro active in prototype mode!');
                setIsPremiumModalOpen(false);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Confirm Subscription (Simulated)
            </button>
            <button
              onClick={() => setIsPremiumModalOpen(false)}
              className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
