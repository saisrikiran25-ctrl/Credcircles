'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function JoinCirclePage() {
  const router = useRouter();
  const { currentUser, triggerRefresh } = useApp();
  const [code, setCode] = useState<string>('GACHI70');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter an invite code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        triggerRefresh();
        router.push(`/circles/detail?id=${data.circleId}`);
      } else {
        setErrorMsg(data.error || 'Failed to join circle');
      }
    } catch {
      setErrorMsg('Network error while joining circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/circles"
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Join via Invite Code</h2>
          <p className="text-xs text-slate-500">Circles are invite-only communities</p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-card space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Enter Circle Invite Code
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Provided by your circle admin or roommate peer.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GACHI70"
              className="w-full text-center tracking-widest text-2xl font-black py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-left space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Try Demo Invite Codes:
            </span>
            <div className="flex gap-2">
              {['GACHI70', 'HITECH99', 'ECELL24'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCode(c)}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] font-bold text-indigo-600 hover:bg-indigo-50"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Code...' : 'Join Circle'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
