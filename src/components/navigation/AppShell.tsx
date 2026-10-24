'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users2,
  ArrowLeftRight,
  BookOpen,
  User,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Check,
  X,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DEMO_PERSONAS } from '@/lib/session';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, setCurrentUserId, isDarkMode, toggleDarkMode, complianceMode } = useApp();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/bootstrap?userId=${currentUser.id}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.notifications)) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, [currentUser.id]);

  const navItems = [
    { label: 'Home',    href: '/',        icon: Home },
    { label: 'Circles', href: '/circles',  icon: Users2 },
    { label: 'Credit',  href: '/loans',    icon: ArrowLeftRight },
    { label: 'Ledger',  href: '/ledger',   icon: BookOpen },
    { label: 'Profile', href: '/profile',  icon: User },
  ];

  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex justify-center">
      {/* Phone-frame container — full width on mobile, 390px max on desktop */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[var(--bg-primary)]">

        {/* ── Prototype ribbon ── */}
        <div className="bg-navy-800 dark:bg-navy-950 text-[var(--text-muted)] text-[10px] font-medium py-1 px-3 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-g-500 animate-pulse" />
            <span className="text-g-500 font-semibold">PROTOTYPE</span>
            <span className="opacity-50">· Simulated Environment</span>
          </div>
          <span className="font-mono text-[9px] opacity-60">
            {complianceMode === 'PARTNERED_ESCROW' ? 'Mode A · NBFC-P2P' : 'Mode C · Closed'}
          </span>
        </div>

        {/* ── Top Header (Groww-style) ── */}
        <header className="px-4 pt-3 pb-2.5 bg-[var(--bg-primary)] sticky top-0 z-30 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-g-500 text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 fill-white stroke-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                    circlo
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-g-500/10 text-g-500">
                    MVP
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-none -mt-0.5">
                  Community Credit
                </p>
              </div>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-1">

              {/* Persona switcher */}
              <div className="relative">
                <button
                  id="persona-switcher-btn"
                  onClick={() => {
                    setIsPersonaMenuOpen(!isPersonaMenuOpen);
                    setIsNotificationOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold transition-all hover:bg-[var(--border)] border border-[var(--border)]"
                >
                  <span className="w-5 h-5 rounded-full bg-g-500 text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                    {currentUser.avatar}
                  </span>
                  <span className="max-w-[60px] truncate text-xs">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPersonaMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPersonaMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] p-2 z-50 animate-slide-up">
                      <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Switch Persona
                        </span>
                        <button onClick={() => setIsPersonaMenuOpen(false)}>
                          <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {DEMO_PERSONAS.map((persona) => {
                          const isActive = persona.id === currentUser.id;
                          return (
                            <button
                              key={persona.id}
                              onClick={() => {
                                setCurrentUserId(persona.id);
                                setIsPersonaMenuOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                                isActive
                                  ? 'bg-g-500/10 text-[var(--text-primary)]'
                                  : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-7 h-7 rounded-full text-white text-[10px] flex items-center justify-center font-bold shrink-0 ${isActive ? 'bg-g-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                                  {persona.avatar}
                                </span>
                                <div>
                                  <div className={`font-semibold leading-tight ${isActive ? 'text-[var(--text-primary)]' : ''}`}>
                                    {persona.name}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)]">{persona.roleDescription}</div>
                                </div>
                              </div>
                              {isActive && <Check className="w-3.5 h-3.5 text-g-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  id="notifications-btn"
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsPersonaMenuOpen(false);
                  }}
                  className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-g-500 border-2 border-[var(--bg-primary)]" />
                  )}
                </button>

                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] z-50 animate-slide-up overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                        <span className="text-sm font-bold text-[var(--text-primary)]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-g-500/10 text-g-500">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Bell className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                            <p className="text-xs text-[var(--text-muted)]">All caught up!</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-g-500 shrink-0 mt-1.5" />
                                <div>
                                  <div className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</div>
                                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{n.message}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme toggle */}
              <button
                id="theme-toggle-btn"
                onClick={toggleDarkMode}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto pb-[72px] hide-scrollbar">
          {children}
        </main>

        {/* ── Bottom Tab Bar (Groww style) ── */}
        <nav
          id="bottom-nav"
          className="fixed bottom-0 z-30 w-full max-w-md bg-[var(--bg-card)] border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 relative"
              >
                {/* Active indicator dot (Groww style) */}
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-g-500" />
                )}
                <Icon
                  className={`w-[22px] h-[22px] transition-all ${
                    isActive
                      ? 'text-g-500 stroke-[2.5]'
                      : 'text-[var(--text-muted)] stroke-[1.75]'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold transition-all ${
                    isActive ? 'text-g-500' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
