/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Layers, 
  Target, 
  PackageCheck, 
  Landmark, 
  Users, 
  AlertTriangle, 
  Activity, 
  Sparkles,
  Calendar,
  Building2,
  FileCheck
} from 'lucide-react';
import { MasterExportPayload, exportAllDashboardFeaturesToExcel, exportBudgetVsActualFeature, exportStockAvailableFeature, exportTopBanksFeature, exportConversionFunnelFeature, exportCancellationRiskFeature, exportDealershipComparisonFeature, exportLiveFeedFeature, exportSalesAdvisorCoverageFeature } from '../utils/excelExport';
import { getSalesAdvisorsForDealer } from '../data/mockData';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: MasterExportPayload;
}

export function ExcelExportModal({ isOpen, onClose, payload }: ExcelExportModalProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportAll = () => {
    exportAllDashboardFeaturesToExcel(payload);
    setDownloadSuccess('Complete Master Workbook (.xlsx) downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportModule = (moduleName: string, exportFn: () => void) => {
    exportFn();
    setDownloadSuccess(`${moduleName} (.xlsx) downloaded!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const modules = [
    {
      id: 'budget-actual',
      title: 'Budget vs Actual & Model Popularity',
      desc: 'Monthly sales targets, actual volume, variance, fulfillment rate, and vehicle popularity rankings',
      icon: <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      color: 'cyan',
      sheetsCount: '2 Sheets',
      action: () => exportBudgetVsActualFeature(
        payload.budgetVsActual,
        payload.modelRankings,
        {
          dealershipName: payload.currentDealer.name,
          branch: payload.filters.selectedBranch,
          period: `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
        }
      )
    },
    {
      id: 'stock-payment',
      title: 'Stock Available by Model & Payment Status',
      desc: 'Unit stock on-hand, in-transit, reserved, and payment status (Paid, Not Yet Paid, Partially Paid) with branch breakdown',
      icon: <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      color: 'emerald',
      sheetsCount: '2 Sheets',
      action: () => exportStockAvailableFeature(
        payload.modelStock,
        payload.currentDealer.name
      )
    },
    {
      id: 'top-banks',
      title: 'Top Banks (LOU Approved)',
      desc: 'Bank loan approvals, LOU volume, total financing value (RM), approval rate (%), and processing SLA',
      icon: <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'amber',
      sheetsCount: '1 Sheet',
      action: () => exportTopBanksFeature(
        payload.topBanks,
        payload.currentDealer.name,
        `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
      )
    },
    {
      id: 'conversion-funnel',
      title: 'Customer Pipeline & Acquisition Funnel',
      desc: 'Lead acquisition channels, walk-in inquiries, test drives, bookings, registrations, and conversion efficiency',
      icon: <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      color: 'indigo',
      sheetsCount: '1 Sheet',
      action: () => exportConversionFunnelFeature(
        payload.conversionFunnel,
        payload.currentDealer.name,
        `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
      )
    },
    {
      id: 'cancellation-risk',
      title: 'Cancellation & Rejection Risk Analysis',
      desc: 'Diagnostic breakdown of bank credit rejections (DSR, CTOS, AKPK) and customer cancellations with keyword tags',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      color: 'rose',
      sheetsCount: '1 Sheet',
      action: () => exportCancellationRiskFeature(
        payload.cancellationReasons,
        payload.currentDealer.name,
        `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
      )
    },
    {
      id: 'dealership-comparison',
      title: 'Dealership Performance Index',
      desc: 'Side-by-side comparison across Mitsubishi, PERODUA, and PROTON e.MAS on quota, bookings, and revenue',
      icon: <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
      color: 'violet',
      sheetsCount: '1 Sheet',
      action: () => exportDealershipComparisonFeature(payload.allDealerships)
    },
    {
      id: 'live-feed',
      title: 'Live Inflow Stream & Transactions Log',
      desc: 'Real-time feed transactions, timestamps, customer names, vehicle models, and financial booking values',
      icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      color: 'blue',
      sheetsCount: '1 Sheet',
      action: () => exportLiveFeedFeature(payload.events)
    },
    {
      id: 'sales-advisor-coverage',
      title: 'Sales Advisor Coverage & Roster Access',
      desc: 'Workforce representative branch coverage, direct portal permissions, quota fulfillment, and financing arranged',
      icon: <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'amber',
      sheetsCount: payload.currentDealer.id === 'all' ? 'Split by Dealership' : '1 Sheet',
      action: () => exportSalesAdvisorCoverageFeature(
        getSalesAdvisorsForDealer(payload.filters.selectedBranch === 'All Branches' ? 'all' : payload.currentDealer.id, payload.filters.selectedBranch),
        payload.currentDealer.name,
        `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-600/30 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  Excel Data Export
                </span>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  Microsoft Excel (.xlsx) Format
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Download Dashboard Features to Excel
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Scope Ribbon */}
        <div className="px-4 sm:px-5 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{payload.currentDealer.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-bold">{payload.currentDealer.brand}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{payload.filters.financialYear} • {payload.filters.selectedMonth}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">{payload.filters.selectedBranch}</span>
          </div>
        </div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {downloadSuccess && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2.5 flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-300 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Master Full-Dashboard Export Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-cyan-950/30 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] font-mono uppercase tracking-wider">
                    Recommended
                  </span>
                  <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
                    11 Modules Included
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Complete Master Dashboard Workbook
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                  Generates an all-inclusive Excel file with separate organized tabs for Executive KPIs, Budget vs Actual, Model Rankings, Stock Available (Paid & Not Yet Paid), Branch Inventory, Dealership Comparison, Top Banks LOU, Customer Funnel, Cancellation Risks, Live Feed, and Sales Advisor Coverage.
                </p>
              </div>

              <button
                onClick={handleExportAll}
                className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download All (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Individual Modules Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Or Download Individual Feature Sheets
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Direct single-click export
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {modules.map((m) => (
                <div 
                  key={m.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex-shrink-0 mt-0.5">
                      {m.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {m.title}
                        </h5>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {m.sheetsCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 max-w-lg">
                        {m.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExportModule(m.title, m.action)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 active:scale-95"
                    title={`Download ${m.title} to Excel`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] text-slate-500">
            Ingress Corporation Berhad • Auto Dealership Division (ADD)
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
