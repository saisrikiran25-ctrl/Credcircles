'use client';

import React from 'react';
import { formatPaise } from '@/lib/domain/currency';

interface CircleDonutGaugeProps {
  totalPoolPaise: number;
  lentOutPaise: number;
  availableLiquidityPaise: number;
  size?: number;
}

export function CircleDonutGauge({
  totalPoolPaise,
  lentOutPaise,
  availableLiquidityPaise,
  size = 200,
}: CircleDonutGaugeProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = Math.max(1, totalPoolPaise);
  const lentPct = Math.min(1, Math.max(0, lentOutPaise / total));
  const availablePct = Math.min(1, Math.max(0, availableLiquidityPaise / total));

  const lentOffset = circumference - lentPct * circumference;
  const availableOffset = circumference - availablePct * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/80 fill-none"
          />

          {/* Available Liquidity Ring (Mint) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={availableOffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-1000 ease-out"
          />

          {/* Lent Out Ring (Indigo/Saffron) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#6366f1"
            strokeWidth={strokeWidth - 2}
            strokeDasharray={circumference}
            strokeDashoffset={lentOffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-1000 ease-out opacity-85"
          />
        </svg>

        {/* Center Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pool Balance
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatPaise(totalPoolPaise)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {formatPaise(availableLiquidityPaise)} free
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600 dark:text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span className="text-slate-600 dark:text-slate-300">Lent Out</span>
        </div>
      </div>
    </div>
  );
}
