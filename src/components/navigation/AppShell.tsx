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
  ShieldCheck,
  Check,
  Info,
  Building2,
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
    // Fetch notifications for active user
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
    { label: 'Home', href: '/', icon: Home },
    { label: 'Circles', href: '/circles', icon: Users2 },
    { label: 'Loans', href: '/loans', icon: ArrowLeftRight },
    { label: 'Ledger', href: '/ledger', icon: BookOpen },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b14] flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* Mobile-first centered phone frame (390px base, max-w-md) */}
      <div className="w-full max-w-md bg-white dark:bg-[#0c1322] min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200/60 dark:border-slate-800/80">
        {/* Subtle persistent prototype / simulation ribbon */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white text-[11px] font-medium py-1 px-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Prototype / Simulated Environment</span>
          </div>
          <span className="text-[10px] opacity-85 font-mono">
            {complianceMode === 'PARTNERED_ESCROW' ? 'NBFC-P2P Mode A' : 'Closed Mode C'}
          </span>
        </div>

        {/* Top Header */}
        <header className="px-4 py-3 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-indigo-400/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Circlo
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                SHG for Gen Z
              </p>
            </div>
          </Link>

          {/* Right Action Icons & Persona Switcher */}
          <div className="flex items-center gap-1.5">
            {/* Persona Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
              >
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {currentUser.avatar}
                </span>
                <span className="truncate max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Persona Switcher Dropdown */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Demo Persona
                  </div>
                  <div className="space-y-1">
                    {DEMO_PERSONAS.map((persona) => {
                      const isActive = persona.id === currentUser.id;
                      return (
                        <button
                          key={persona.id}
                          onClick={() => {
                            setCurrentUserId(persona.id);
                            setIsPersonaMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                              {persona.avatar}
                            </span>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white leading-tight">
                                {persona.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {persona.roleDescription}
                              </div>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c1322]"></span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      {notifications.length} updates
                    </span>
                  </div>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                        >
                          <div className="font-semibold text-slate-900 dark:text-white text-[11px]">
                            {n.title}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 overflow-y-auto">{children}</main>

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 z-30 w-full max-w-md bg-white/95 dark:bg-[#0c1322]/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
