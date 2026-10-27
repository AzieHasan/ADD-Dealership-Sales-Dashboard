/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Filter, Compass, Calendar, Building2, UserCheck, TrendingUp, 
  DollarSign, Sparkles, AlertTriangle, CheckSquare, Landmark, 
  Users, CheckCircle2, Play, BookOpen, Layers, RotateCcw, 
  HelpCircle, ChevronRight, FileText, ArrowRight, ShieldCheck,
  Check, Phone, Mail, Award, Clock
} from 'lucide-react';
import { DashboardFilterState } from '../types';
import { IngressLogo } from './IngressLogo';

interface DashboardExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInteractiveTour: () => void;
  onApplyFilters: (filters: Partial<DashboardFilterState>, dealerId?: string) => void;
  currentFilters: DashboardFilterState;
  currentDealerId: string;
}

type TabType = 'parameters' | 'dashboard' | 'presets';

export function DashboardExplainerModal({
  isOpen,
  onClose,
  onStartInteractiveTour,
  onApplyFilters,
  currentFilters,
  currentDealerId
}: DashboardExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('parameters');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans selection:bg-[#850536]/30 selection:text-pink-200">
      {/* Dark Corporate Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0c080e]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Window - Ingress Corporate Styling */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#161118] border-2 border-[#850536]/80 rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(133,5,54,0.35)] flex flex-col overflow-hidden z-10 text-slate-100"
      >
        {/* Corporate Header */}
        <div className="p-4 sm:p-6 border-b border-[#351b27] bg-[#1a121c] flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <IngressLogo className="h-7 sm:h-8 w-auto flex-shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8e9095] font-bold">
                  INGRESS CORPORATION BERHAD
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#850536] text-white font-bold border border-[#850536]">
                  ADD DIVISION
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Dashboard & Filter Parameters Handbook
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartInteractiveTour();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#850536] to-[#99063f] hover:brightness-110 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-pink-500/40"
              title="Launch interactive spotlight tour on the dashboard"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Step-by-Step Auto Guide</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2b1727] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Corporate Maroon Highlight */}
        <div className="flex border-b border-[#351b27] bg-[#120a13] px-4 sm:px-6 gap-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'parameters'
                ? 'border-[#850536] text-white bg-[#1a121c]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-4 h-4 text-pink-400" />
            <span>1. How to FILTER PARAMETERS</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-[#850536] text-white bg-[#1a121c]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-400" />
            <span>2. Explaining the Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3.5 border-b-2 font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-[#850536] text-white bg-[#1a121c]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3. Operational Sample Scenarios ("Try It Live")</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* ================= TAB 1: HOW TO FILTER PARAMETERS ================= */}
          {activeTab === 'parameters' && (
            <div className="space-y-6">
              
              {/* Executive Summary Card */}
              <div className="bg-gradient-to-r from-[#24101d] via-[#1a0f18] to-[#24101d] border border-[#52213a] rounded-2xl p-4 sm:p-5 shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#850536] text-white flex-shrink-0">
                    <Filter className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">
                      How Filter Parameters Control Multi-Franchise Dealership Data
                    </h4>
                    <p className="text-slate-200 text-xs sm:text-sm mt-1 leading-relaxed">
                      The ADD Dealership Sales Dashboard uses a 5-dimensional filtering engine. Adjusting any parameter filters all 5 KPI cards, Month-over-Month telemetry, model popularity rankings, and banking LOU approval records with real-time recalculation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Content Reference Matrix */}
              <div className="border border-[#351b27] rounded-xl overflow-hidden bg-[#120a13]">
                <div className="p-3 bg-[#1a121c] border-b border-[#351b27] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    FILTER PARAMETERS: REAL SAMPLE CONTENT & LOGIC MATRIX
                  </span>
                  <span className="text-[10px] font-mono text-[#8e9095]">Current Operational Context</span>
                </div>

                <div className="divide-y divide-[#2a1421] text-xs">
                  {/* Row 1: FY */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>1. Financial Year (FY)</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Options: FY 2026 (Current), FY 2025, FY 2024, FY 2023
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] bg-[#1c0f1a] p-2 rounded border border-[#3b1c2e]">
                      <span className="text-pink-300 font-bold block mb-0.5">Sample Data:</span>
                      FY 2026 Target: RM 940,000,000 | FY 2025 Actual: RM 865,000,000 (+8.6% YoY)
                    </div>
                    <div className="text-[#8e9095] text-[11px]">
                      Recalibrates annual quotas, budget baselines, and variance calculations across all charts.
                    </div>
                  </div>

                  {/* Row 2: Time Scope */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>2. Time Scope Frequency</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Options: Daily, Weekly, MTD, Monthly, Quarterly, YTD, Full Year
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] bg-[#1c0f1a] p-2 rounded border border-[#3b1c2e]">
                      <span className="text-cyan-300 font-bold block mb-0.5">Sample Data:</span>
                      Daily (Today): 6 bookings • Monthly (Aug): 94 bookings • YTD: 658 bookings
                    </div>
                    <div className="text-[#8e9095] text-[11px]">
                      Scales data volumes proportionately: Daily (0.05x month factor) to Full Year (12.0x).
                    </div>
                  </div>

                  {/* Row 3: Sub-Period Cohort */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Sub-Period Granular Selector</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Dynamic: Days (Aug 01–07), Weeks (1–4), Months (Jan–Dec), Quarters (Q1–Q4)
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] bg-[#1c0f1a] p-2 rounded border border-[#3b1c2e]">
                      <span className="text-amber-300 font-bold block mb-0.5">Sample Data:</span>
                      August (Current Month) vs July (Last Month) MoM comparison
                    </div>
                    <div className="text-[#8e9095] text-[11px]">
                      Pinpoints specific marketing campaigns, festive delivery surges, or month-end rushes.
                    </div>
                  </div>

                  {/* Row 4: Dealership */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-pink-400" />
                      <span>4. Dealership Franchise Scope</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Options: All Dealership (Consolidated), Mitsubishi, PERODUA, PROTON e.MAS
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] bg-[#1c0f1a] p-2 rounded border border-[#3b1c2e]">
                      <span className="text-pink-300 font-bold block mb-0.5">Sample Data:</span>
                      Mitsubishi (Triton/Xpander) • PERODUA (Myvi/Bezza/Axia) • e.MAS (e.MAS 7 EV)
                    </div>
                    <div className="text-[#8e9095] text-[11px]">
                      Filters brand pipeline and dynamically locks Parameter 5 to valid brand showrooms.
                    </div>
                  </div>

                  {/* Row 5: Branch */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5. Representative Branch</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Options: Puchong, IMC Bangi, Shah Alam, The Curve, Mutiara Damansara, e.MAS Bangi
                    </div>
                    <div className="text-slate-200 font-mono text-[11px] bg-[#1c0f1a] p-2 rounded border border-[#3b1c2e]">
                      <span className="text-emerald-300 font-bold block mb-0.5">Sample Data:</span>
                      PUCHONG Showroom: Ahmad Razak (+60 12-345 6789) • 8 Sales Reps
                    </div>
                    <div className="text-[#8e9095] text-[11px]">
                      Displays local Branch Lead contacts and branch-specific quota achievement.
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Filters Note */}
              <div className="bg-[#1a121c] border border-[#351b27] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <RotateCcw className="w-4 h-4 text-pink-400" />
                  <span>Tip: Click <strong>"Reset Filters"</strong> in the top-right of the filter bar anytime to restore the default FY 2026 Monthly Consolidated view.</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: EXPLAINING THE DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              
              <div className="bg-[#1a121c] border border-[#351b27] rounded-2xl p-4 sm:p-5">
                <h4 className="text-white font-bold text-sm sm:text-base mb-1">
                  Executive Dashboard Architecture & Live Sample Metrics
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Review the operational definitions and actual figures displayed across the 5 core dashboard modules.
                </p>
              </div>

              {/* Module 1: MoM Comparative Bar */}
              <div className="border border-[#351b27] rounded-xl p-4 bg-[#181119] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h5 className="font-bold text-white text-sm">1. MoM Trend Analysis Bar</h5>
                  </div>
                  <span className="text-[10px] font-mono bg-[#850536] text-white px-2 py-0.5 rounded font-bold">
                    Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Contrasts the selected month (<strong>Current Month: August</strong>) against the previous operating month (<strong>Last Month: July</strong>).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-slate-400 text-[10px] block">Revenue Variance</span>
                    <span className="text-emerald-400 font-bold">+11.8%</span> (RM 78.45M vs RM 70.18M)
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-slate-400 text-[10px] block">Bookings Variance</span>
                    <span className="text-emerald-400 font-bold">+12.4%</span> (94 units vs 84 units)
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-slate-400 text-[10px] block">Registrations Variance</span>
                    <span className="text-emerald-400 font-bold">+6.2%</span> (64 units vs 60 units)
                  </div>
                </div>
              </div>

              {/* Module 2: Bento KPI Grid */}
              <div className="border border-[#351b27] rounded-xl p-4 bg-[#181119] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <h5 className="font-bold text-white text-sm">2. Executive KPI Bento Grid (5 Core Metrics)</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#120a13] border border-[#2a1320]">
                    <span className="text-amber-400 font-bold block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Revenue (RM)
                    </span>
                    <span className="text-white font-bold text-sm block mt-1">RM 78,450,000</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Total consolidated invoicing across all 6 showrooms.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120a13] border border-[#2a1320]">
                    <span className="text-cyan-400 font-bold block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Gross Bookings
                    </span>
                    <span className="text-white font-bold text-sm block mt-1">94 Units</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Confirmed showroom orders with secured customer deposits.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120a13] border border-[#2a1320]">
                    <span className="text-rose-400 font-bold block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Dropped Bookings
                    </span>
                    <span className="text-white font-bold text-sm block mt-1">8 Units</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Loan rejections (4 units) + customer cancellations (4 units).</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120a13] border border-[#2a1320]">
                    <span className="text-emerald-400 font-bold block flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Conversion Efficiency
                    </span>
                    <span className="text-white font-bold text-sm block mt-1">27.2%</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Ratio of walk-in inquiries converted into registered sales.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#120a13] border border-[#2a1320]">
                    <span className="text-pink-400 font-bold block flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" /> DMV Registrations
                    </span>
                    <span className="text-white font-bold text-sm block mt-1">64 Units</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">Officially licensed plates delivered to vehicle owners.</span>
                  </div>
                </div>
              </div>

              {/* Module 3: Budget vs Actual & Model Popularity */}
              <div className="border border-[#351b27] rounded-xl p-4 bg-[#181119] space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                  <h5 className="font-bold text-white text-sm">3. Budget vs Actual & Vehicle Model Rankings</h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interactive line chart tracking delivered vehicle units against budgeted quotas, with vehicle model breakdown:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-pink-300 font-bold block">#1 Mitsubishi Triton Athlete</span>
                    <span className="text-slate-300">38 Delivered / 34 Quota (+11.7%)</span>
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-cyan-300 font-bold block">#2 PERODUA Myvi 1.5 AV</span>
                    <span className="text-slate-300">42 Delivered / 39 Quota (+7.7%)</span>
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-emerald-300 font-bold block">#3 PROTON e.MAS 7 EV</span>
                    <span className="text-slate-300">22 Delivered / 18 Quota (+22.2%)</span>
                  </div>
                </div>
              </div>

              {/* Module 4: Top Banks LOU Approved */}
              <div className="border border-[#351b27] rounded-xl p-4 bg-[#181119] space-y-2">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-white text-sm">4. Top Banks (LOU Approved - Letter of Undertaking)</h5>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Audits commercial bank loan financing throughput and credit turnaround across Malaysian commercial banks:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-amber-400 font-bold block">Maybank (#1 Financier)</span>
                    <span className="text-slate-300">32 Approved LOUs • 91.4% Rate • 2.1 Days</span>
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-slate-200 font-bold block">Public Bank Berhad</span>
                    <span className="text-slate-300">24 Approved LOUs • 88.9% Rate • 2.4 Days</span>
                  </div>
                  <div className="p-2 rounded bg-[#120a13] border border-[#2a1320]">
                    <span className="text-rose-400 font-bold block">Top Rejection Factor</span>
                    <span className="text-slate-300">High DSR / CCRIS Score (52% of drops)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: OPERATIONAL SAMPLE SCENARIOS ================= */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="bg-[#1a121c] border border-[#351b27] rounded-2xl p-4 sm:p-5">
                <h4 className="text-white font-bold text-sm sm:text-base mb-1">
                  Operational Sample Scenarios ("Try It Live")
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Click any real operational case study below to immediately apply its parameters to the live dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Scenario 1: Puchong Mitsubishi */}
                <div className="p-4 rounded-xl bg-[#181119] border border-[#351b27] flex flex-col justify-between hover:border-[#850536] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Showroom Operations</span>
                      <span className="text-[9px] font-mono bg-[#850536]/20 text-pink-300 border border-[#850536]/50 px-2 py-0.5 rounded">
                        PUCHONG 3S
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm">🏆 Case 1: Ahmad Razak's Mitsubishi Puchong Audit</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Filter: <strong>FY 2026 • Monthly (August) • Mitsubishi • PUCHONG Branch</strong>
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-[#120a13] p-2 rounded border border-[#2a1320]">
                      <div>• Branch Head: Ahmad Razak (+60 12-345 6789)</div>
                      <div>• Top Seller: Triton Athlete 2.4L (38 units)</div>
                      <div>• Maybank Financing Approval: 92.1%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyFilters({ financialYear: 'FY 2026', timePeriodType: 'Monthly', selectedMonth: 'August', selectedBranch: 'PUCHONG' }, 'dt-porsche');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-3 bg-[#850536] hover:brightness-110 border border-pink-400/50 rounded-lg text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>⚡ Apply Puchong Branch Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 2: PERODUA The Curve */}
                <div className="p-4 rounded-xl bg-[#181119] border border-[#351b27] flex flex-col justify-between hover:border-emerald-600 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Retail Pacing</span>
                      <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
                        The Curve Mall
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm">🛍️ Case 2: Farah Lee's PERODUA The Curve Month-to-Date</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Filter: <strong>Month to Day (MTD) • PERODUA • The Curve Branch</strong>
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-[#120a13] p-2 rounded border border-[#2a1320]">
                      <div>• Branch Head: Farah Lee (+60 17-555 4321)</div>
                      <div>• Fast Moving: Myvi 1.5 AV & Bezza 1.3 AV</div>
                      <div>• MTD Deliveries: 28 Units</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyFilters({ timePeriodType: 'Month to Day (MTD)', selectedBranch: 'The Curve' }, 'ns-audi');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-3 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold text-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>⚡ Apply PERODUA The Curve Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 3: PROTON e.MAS Bangi */}
                <div className="p-4 rounded-xl bg-[#181119] border border-[#351b27] flex flex-col justify-between hover:border-[#850536] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">EV Pioneer</span>
                      <span className="text-[9px] font-mono bg-[#850536]/20 text-pink-300 border border-[#850536]/50 px-2 py-0.5 rounded">
                        EV Specialist
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm">⚡ Case 3: Kamal Vance's PROTON e.MAS 7 EV Launch</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Filter: <strong>FY 2026 • Monthly (August) • PROTON e.MAS • Bangi</strong>
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-[#120a13] p-2 rounded border border-[#2a1320]">
                      <div>• Branch Head: Kamal Vance (+60 11-7777 999)</div>
                      <div>• EV Pre-Orders: e.MAS 7 Prime & Premium (22 units)</div>
                      <div>• EV Conversion Rate: 29.5%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyFilters({ financialYear: 'FY 2026', timePeriodType: 'Monthly', selectedMonth: 'August', selectedBranch: 'BANDAR BARU BANGI' }, 'ws-bmw');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-3 bg-[#850536] hover:brightness-110 border border-pink-400/50 rounded-lg text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>⚡ Apply PROTON e.MAS Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 4: Group Consolidated */}
                <div className="p-4 rounded-xl bg-[#181119] border border-[#351b27] flex flex-col justify-between hover:border-amber-600 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Board Review</span>
                      <span className="text-[9px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded">
                        Group P&L
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm">📊 Case 4: Group Executive Consolidated Review</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Filter: <strong>FY 2026 • Monthly (August) • All Dealership • All Branches</strong>
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400 bg-[#120a13] p-2 rounded border border-[#2a1320]">
                      <div>• Consolidated Revenue: RM 78,450,000 (+11.8% MoM)</div>
                      <div>• Total Bookings: 94 Units | 64 Registered</div>
                      <div>• Total Financing Value: RM 68.2M LOU Approved</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyFilters({ financialYear: 'FY 2026', timePeriodType: 'Monthly', selectedMonth: 'August', selectedBranch: 'All Branches' }, 'all');
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-3 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/50 rounded-lg text-xs font-mono font-bold text-amber-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>⚡ Apply Consolidated Group Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#351b27] bg-[#120a13] flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs font-mono text-[#8e9095] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ingress ADD Dealership Performance System</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartInteractiveTour();
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#850536] hover:bg-[#850536]/20 text-pink-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-pink-200" />
              <span>Step-by-Step Tour</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#261424] hover:bg-[#381a33] text-white text-xs font-mono font-semibold transition-all cursor-pointer border border-[#44233a]"
            >
              Close
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
