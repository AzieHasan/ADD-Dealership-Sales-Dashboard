/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, FileCheck, CheckCircle2, TrendingUp, Download, FileSpreadsheet } from 'lucide-react';
import { TopBankLOU } from '../types';
import { getTopBanksLOUForDealer } from '../data/mockData';
import { exportTopBanksFeature } from '../utils/excelExport';

interface TopBanksLOUProps {
  selectedDealerId?: string;
  selectedDealerName?: string;
  totalBookings?: number;
  droppedBookings?: number;
  currentRegistrations?: number;
  multiplier?: number;
  filterLabel?: string;
  branchName?: string;
}

const formatCurrency = (val: number) => {
  if (val >= 1000000) {
    return `RM ${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `RM ${(val / 1000).toFixed(0)}k`;
  }
  return `RM ${val.toLocaleString('en-MY')}`;
};

export function TopBanksLOU({ 
  selectedDealerId = 'all', 
  selectedDealerName = 'All Dealerships',
  totalBookings,
  droppedBookings,
  currentRegistrations,
  multiplier = 1,
  filterLabel,
  branchName
}: TopBanksLOUProps) {
  // Total Registered Units (LOU) Rejected = ("Total BOOKINGS" - "DROPPED BOOKINGS") - ("REGISTRATIONS")
  const calculatedRejected = (totalBookings !== undefined && droppedBookings !== undefined && currentRegistrations !== undefined)
    ? Math.max(0, (totalBookings - droppedBookings) - currentRegistrations)
    : undefined;

  const banks = getTopBanksLOUForDealer(
    selectedDealerId, 
    2026, 
    'all', 
    currentRegistrations, 
    multiplier,
    calculatedRejected
  );

  const totalLOUCount = banks.reduce((sum, b) => sum + b.louApprovedCount, 0);
  const totalLOUValue = banks.reduce((sum, b) => sum + b.totalFinancingAmount, 0);
  const maxApproved = banks[0]?.louApprovedCount || 1;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden" id="top-banks-lou-panel">
      {/* Decorative top accent glow */}
      <div className="absolute left-0 top-0 w-full h-[1px] bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono block">Financial Approvals</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold uppercase flex items-center gap-1">
              <FileCheck className="w-2.5 h-2.5" />
              LOU Approved
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {selectedDealerId === 'all' ? 'Summary: Mitsubishi + PERODUA + PROTON e.MAS' : selectedDealerName}
            </span>
            {filterLabel && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                {filterLabel}
              </span>
            )}
            {branchName && branchName !== 'All Branches' && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                Branch: {branchName}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Landmark className="w-4.5 h-4.5 text-amber-400" /> Top Banks (LOU Approved)
          </h3>
        </div>

        <button
          onClick={() => exportTopBanksFeature(banks, selectedDealerName, filterLabel || 'FY 2026')}
          className="self-start sm:self-center px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
          title="Download Top Banks LOU Approved table to Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Total Registered Units (LOU)</span>
            <span className="text-sm font-bold text-slate-100 font-mono">{totalLOUCount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">units</span></span>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Total Financing Value</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(totalLOUValue)}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Banks Ranking List */}
      <div className="space-y-2">
        {banks.map((bank, idx) => {
          const relativeWidth = Math.min(100, Math.round((bank.louApprovedCount / maxApproved) * 100));

          return (
            <div
              key={bank.id}
              className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-950/70 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1.5 gap-2">
                {/* Bank Name & Code */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-500 w-4 text-center">
                    #{idx + 1}
                  </span>
                  <div
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border"
                    style={{ backgroundColor: `${bank.color}18`, borderColor: `${bank.color}40`, color: bank.color }}
                  >
                    {bank.code}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {bank.bankName}
                  </span>
                </div>

                {/* Counts & Value */}
                <div className="flex items-center gap-2 text-right shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-100 block leading-none">
                      {bank.louApprovedCount} <span className="text-[9px] text-slate-400 font-normal">LOU</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">
                      {formatCurrency(bank.totalFinancingAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar + Metadata badges */}
              <div className="space-y-1">
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${relativeWidth}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: bank.color }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Appr Rate: <strong className="text-slate-200">{bank.approvalRate}%</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
