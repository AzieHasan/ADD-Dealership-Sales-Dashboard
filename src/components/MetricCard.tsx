/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number; // percentage change, e.g. +4.2 or -2.1
  changeLabel: string; // e.g. "vs Last Month"
  previousValue?: string | number; // Last month's comparative value
  color: 'cyan' | 'rose' | 'emerald' | 'violet' | 'amber';
  icon: ReactNode;
  sparklineData: number[]; // Array of 8 numbers for sparkline SVG
  isAlert?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  previousValue,
  color,
  icon,
  sparklineData,
  isAlert = false
}: MetricCardProps) {
  const isPositive = change >= 0;

  // Colors mapping for tailwind
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      glow: 'shadow-[0_0_20px_-3px_rgba(34,211,238,0.12)]',
      line: '#22d3ee'
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.12)]',
      line: '#f43f5e'
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_20px_-3px_rgba(16,185,129,0.12)]',
      line: '#10b981'
    },
    violet: {
      text: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      glow: 'shadow-[0_0_20px_-3px_rgba(139,92,246,0.12)]',
      line: '#8b5cf6'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.12)]',
      line: '#f59e0b'
    }
  };

  const scheme = colorMap[color];

  // Draw sparkline SVG coordinates
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 100;
  const height = 30;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div 
      className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 transition-all duration-300 backdrop-blur-md relative overflow-hidden ${scheme.glow} ${
        isAlert ? 'border-rose-500/40 shadow-[0_0_25px_-5px_rgba(239,68,68,0.25)]' : ''
      }`}
      id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Absolute faint background circle glow */}
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl pointer-events-none opacity-20 ${scheme.bg}`} />

      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-300 dark:text-slate-300 font-mono font-bold block">
            {title}
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight block mt-1">
            {value}
          </span>
          {previousValue !== undefined && (
            <span className="text-[10.5px] font-mono text-slate-400 dark:text-slate-300 block mt-0.5 font-medium">
              Last Month: <span className="text-slate-800 dark:text-white font-bold">{previousValue}</span>
            </span>
          )}
        </div>

        {/* Icon wrapper */}
        <div className={`p-2 rounded-xl ${scheme.bg} border border-slate-800/80`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-950/20'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {isPositive ? '+' : ''}{change}%
          </span>

          {/* Sparkline Visual */}
          <div className="w-[85px] h-[24px] opacity-80 hover:opacity-100 transition-opacity">
            <svg width="85" height="24" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              <polyline
                fill="none"
                stroke={scheme.line}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        <div className="text-[10.5px] text-slate-300 dark:text-slate-300 font-mono font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {changeLabel}
        </div>
      </div>
    </div>
  );
}
