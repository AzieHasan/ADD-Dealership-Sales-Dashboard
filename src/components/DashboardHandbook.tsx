/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Search, X, CheckCircle2, AlertTriangle, 
  DollarSign, Building2, ShieldCheck, Sparkles, Layers, Sliders,
  Copy, Check, Compass, FileSpreadsheet, Download, Users
} from 'lucide-react';
import { Dealership, DashboardFilterState, BookingEvent } from '../types';
import { IngressLogo } from './IngressLogo';
import { getTopBanksLOUForDealer, CANCELLATION_REASONS } from '../data/mockData';

interface DashboardHandbookProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAutoGuide: () => void;
  currentDealer: Dealership;
  aggregateDealer: Dealership;
  dealerships: Dealership[];
  filters: DashboardFilterState;
  events: BookingEvent[];
  initialTab?: string;
}

export const DashboardHandbook: React.FC<DashboardHandbookProps> = ({
  isOpen,
  onClose,
  onLaunchAutoGuide,
  currentDealer,
  aggregateDealer,
  dealerships,
  filters,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'kpi' | 'dealerships' | 'lou' | 'advisors' | 'mitigation' | 'filters'>((initialTab as any) || 'overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [resetGuideSuccess, setResetGuideSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [isOpen, initialTab]);

  const topBanks = getTopBanksLOUForDealer('all', 2026, 'all', aggregateDealer.registrations);

  if (!isOpen) return null;

  const handleCopyLink = (sectionTitle: string) => {
    setCopiedSection(sectionTitle);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleResetFirstTimeGuide = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ingress_has_played_auto_guide');
    }
    setResetGuideSuccess(true);
    setTimeout(() => setResetGuideSuccess(false), 3000);
  };

  const tabs = [
    { id: 'overview', label: 'Corporate Overview', icon: Building2 },
    { id: 'kpi', label: 'KPI Dictionary & Formulas', icon: DollarSign },
    { id: 'dealerships', label: 'Dealership Network', icon: Layers },
    { id: 'lou', label: 'Banking & LOU Guide', icon: ShieldCheck },
    { id: 'advisors', label: 'Sales Advisor Coverage', icon: Users },
    { id: 'mitigation', label: 'Drop-Off Mitigation', icon: AlertTriangle },
    { id: 'filters', label: 'Filter & Engine Logic', icon: Sliders },
  ];

  // Real dashboard values
  const totalVolume = aggregateDealer.bookings + aggregateDealer.cancellations;
  const dropRate = ((aggregateDealer.cancellations / (totalVolume || 1)) * 100).toFixed(1);

  return (
    <div 
      className="fixed inset-0 z-[1001] flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm overflow-hidden font-sans select-none"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="dashboard-handbook w-full max-w-5xl h-[92vh] bg-white border-2 border-slate-300 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden text-black"
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
        {/* 1. Ingress Corporate Header Bar - Clean Light Scheme */}
        <div 
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#8f043b] relative text-black"
          style={{ backgroundColor: '#faf7f9', color: '#000000' }}
        >
          {/* Logo & Corporate Title */}
          <div className="flex items-center gap-3.5">
            <IngressLogo className="h-8 w-auto shrink-0 shadow-xs" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span 
                  className="text-black font-black text-sm sm:text-base tracking-tight uppercase"
                  style={{ color: '#000000' }}
                >
                  INGRESS CORPORATION BERHAD
                </span>
                <span 
                  className="text-[11px] font-mono text-black hidden sm:inline font-bold"
                  style={{ color: '#000000' }}
                >
                  (199901015899 / 490789-K)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#8f043b] font-extrabold">
                  ADD Dealership Operations Handbook
                </span>
                <span className="text-slate-400 font-bold">•</span>
                <span 
                  className="text-black text-[11px] font-mono font-semibold"
                  style={{ color: '#000000' }}
                >
                  IIT Group Reference Manual v2.6
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Launch Guide & Close - Light Color Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onLaunchAutoGuide();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-black transition-all shadow-xs cursor-pointer active:scale-95 border hover:bg-rose-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#8f043b', borderWidth: '2px', color: '#000000' }}
              title="Start Interactive Auto Guide"
            >
              <Compass className="w-3.5 h-3.5 text-[#8f043b]" />
              <span className="text-black font-bold" style={{ color: '#000000' }}>Launch Auto Guide</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-black hover:bg-slate-100 border transition-colors cursor-pointer shadow-xs"
              style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
              title="Close Handbook"
            >
              <X className="w-4 h-4 stroke-[2.5] text-black" />
            </button>
          </div>
        </div>

        {/* 2. Search & Chapter Nav Sub-Header - Light Theme */}
        <div className="border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-black" style={{ backgroundColor: '#f8f9fa', color: '#000000' }}>
          {/* Tab Navigation - Light Color Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shadow-2xs hover:bg-slate-50"
                  style={{ 
                    backgroundColor: isActive ? '#f8fafc' : '#ffffff',
                    borderColor: isActive ? '#8f043b' : '#cbd5e1',
                    borderWidth: isActive ? '2px' : '1px',
                    color: '#000000'
                  }}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8f043b]' : 'text-black'}`} />
                  <span style={{ color: '#000000' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Search Input - Crisp Light Theme */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handbook topics..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-black placeholder-slate-500 focus:outline-none focus:border-[#8f043b] focus:ring-1 focus:ring-[#8f043b] transition-colors font-sans shadow-2xs"
              style={{ color: '#000000' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Handbook Content Area (Scrollable) - Light Theme */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-800 bg-[#fbfbfb] scrollbar-thin">
          
          {/* Real Live Dashboard Snapshot Banner across all tabs */}
          <div 
            className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xs"
            style={{
              borderLeftWidth: '5px',
              borderLeftColor: '#8f043b'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-300 bg-slate-100 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#8f043b]" />
              </div>
              <div>
                <div className="text-black font-black text-xs sm:text-sm" style={{ color: '#000000' }}>
                  Active Operational Snapshot • {filters.financialYear} ({filters.selectedMonth})
                </div>
                <div className="text-black text-[11.5px] font-sans font-semibold mt-0.5" style={{ color: '#000000' }}>
                  Consolidated metrics queried directly from current live showroom database:
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                <span className="text-amber-900 font-bold">Revenue: </span>
                <span className="text-black font-black">RM {aggregateDealer.revenue.toLocaleString()}</span>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                <span className="text-cyan-900 font-bold">Total Bookings: </span>
                <span className="text-black font-black">{totalVolume} units</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                <span className="text-rose-900 font-bold">Drop Rate: </span>
                <span className="text-black font-black">{dropRate}%</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
                <span className="text-emerald-900 font-bold">Conversion: </span>
                <span className="text-black font-black">{aggregateDealer.conversionRate}%</span>
              </div>
            </div>
          </div>

          {/* TAB 1: CORPORATE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="border border-slate-200 bg-white rounded-xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-black flex items-center gap-2" style={{ color: '#000000' }}>
                    <Building2 className="w-5 h-5 text-[#8f043b]" />
                    Corporate Mandate & Executive Hierarchy
                  </h3>
                  <span className="text-[11px] font-mono text-black bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 font-bold" style={{ color: '#000000' }}>
                    INGRESS ADD DIRECTIVE
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] leading-relaxed text-black font-medium" style={{ color: '#000000' }}>
                  <strong className="text-black font-bold">INGRESS CORPORATION BERHAD</strong> operates the Automotive Dealership Division (ADD) under the leadership of IIT Group. The division oversees premier automotive retail operations across Peninsular Malaysia, distributing luxury and mass-market vehicle fleets comprising <strong className="text-black font-bold">Mitsubishi Motors</strong>, <strong className="text-black font-bold">PERODUA</strong>, and <strong className="text-black font-bold">PROTON e.MAS</strong> new-energy electric vehicles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-[11px] font-mono text-black font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Mitsubishi Dealership</div>
                    <div className="text-sm sm:text-base font-extrabold text-black mt-1" style={{ color: '#000000' }}>Ingress Motors Centre Sdn. Bhd.</div>
                    <div className="text-xs text-black font-semibold mt-1" style={{ color: '#000000' }}>Puchong, IMC Bangi, Shah Alam</div>
                  </div>
                  <div className="p-3.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-[11px] font-mono text-black font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>PERODUA Dealership</div>
                    <div className="text-sm sm:text-base font-extrabold text-black mt-1" style={{ color: '#000000' }}>Ingress Motors Centre Sdn. Bhd.</div>
                    <div className="text-xs text-black font-semibold mt-1" style={{ color: '#000000' }}>The Curve, Mutiara Damansara</div>
                  </div>
                  <div className="p-3.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-[11px] font-mono text-black font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>PROTON e.MAS EV</div>
                    <div className="text-sm sm:text-base font-extrabold text-black mt-1" style={{ color: '#000000' }}>Ingress Auto Sdn. Bhd.</div>
                    <div className="text-xs text-black font-semibold mt-1" style={{ color: '#000000' }}>Bandar Baru Bangi EV Flagship</div>
                  </div>
                </div>
              </div>

              {/* Roles & Access Standards */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 space-y-3.5 shadow-xs">
                <h3 className="text-base sm:text-lg font-black text-black flex items-center gap-2" style={{ color: '#000000' }}>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Security Governance & Session Administration
                </h3>
                <p className="text-xs sm:text-[14.5px] leading-relaxed text-black font-medium" style={{ color: '#000000' }}>
                  Access to the ADD Dealership Sales Dashboard is role-governed. Only authorized personnel holding designated Ingress Staff IDs are permitted to view sensitive pricing, customer booking deposit audits, and banking Letter of Undertaking (LOU) pipelines.
                </p>
                <div 
                  className="p-3.5 rounded-xl border font-mono text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3 shadow-xs"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}
                >
                  <div>
                    <span className="text-black font-semibold" style={{ color: '#000000' }}>Authenticated Staff ID: </span>
                    <span className="text-black font-extrabold" style={{ color: '#000000' }}>Admin01</span>
                    <span className="text-black ml-2 font-sans font-semibold" style={{ color: '#000000' }}>| Role: HQ General Manager (ADD)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold">
                    ACTIVE ENCRYPTED SESSION
                  </span>
                </div>
              </div>

              {/* Excel Data Export Protocol */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-black flex items-center gap-2" style={{ color: '#000000' }}>
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Excel Data Export Functions & Multi-Module Reports
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                    .xlsx Standard
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] leading-relaxed text-black font-medium" style={{ color: '#000000' }}>
                  The dashboard features integrated Microsoft Excel (.xlsx) export functionality for all core analytics modules. Dealership executives and branch managers can download instant reports at both master and localized levels.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="font-extrabold text-black flex items-center gap-1.5" style={{ color: '#000000' }}>
                      <Layers className="w-4 h-4 text-emerald-600" />
                      1. Master Dashboard Workbook
                    </div>
                    <p className="text-black font-medium mt-1 leading-normal" style={{ color: '#000000' }}>
                      Exports a single consolidated Excel file containing 10 organized worksheets: Executive KPIs, Budget vs Actual, Model Popularity, Stock Available & Payment Status, Branch Inventory, Dealership Comparison, Top Banks LOU, Customer Pipeline, Cancellation Risk, and Live Inflow Stream.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="font-extrabold text-black flex items-center gap-1.5" style={{ color: '#000000' }}>
                      <Download className="w-4 h-4 text-cyan-600" />
                      2. Feature-Level Quick Export
                    </div>
                    <p className="text-black font-medium mt-1 leading-normal" style={{ color: '#000000' }}>
                      Direct "Export Excel" buttons are located on the headers of each individual widget (Budget vs Actual, Stock Available, Top Banks, Customer Funnel, Cancellation Risks, and Live Inflow) for immediate single-module data extractions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KPI DICTIONARY & FORMULAS */}
          {activeTab === 'kpi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Mathematical Formulations & Real Calculations</h3>
                  <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Precise logic used to compute dashboard scorecards with actual sample values.</p>
                </div>
                <button
                  onClick={() => handleCopyLink('KPI Formulas')}
                  className="flex items-center gap-1.5 text-xs text-black hover:text-black px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 cursor-pointer font-bold shadow-2xs"
                  style={{ color: '#000000' }}
                >
                  {copiedSection === 'KPI Formulas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span style={{ color: '#000000' }}>{copiedSection === 'KPI Formulas' ? 'Copied' : 'Copy Formulas'}</span>
                </button>
              </div>

              {/* KPI 1: Gross Revenue */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-400/30" />
                    <h4 className="font-black text-black text-sm sm:text-base" style={{ color: '#000000' }}>1. Gross Vehicle Sales Revenue (RM)</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-950 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-md">
                    Current Live: RM {currentDealer.revenue.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  Total Ringgit Malaysia value derived from fulfilled vehicle sales minus approved cancellation deductions within the selected fiscal window.
                </p>
                <div 
                  className="p-3 rounded-xl font-mono text-xs sm:text-[13px] border font-bold"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}
                >
                  <code style={{ color: '#000000' }}>Formula: Revenue = Σ (Bookings × Vehicle On-The-Road Price) × Filter_Multiplier</code>
                </div>
              </div>

              {/* KPI 2: Total Bookings & Dropped Units */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 ring-2 ring-cyan-400/30" />
                    <h4 className="font-black text-black text-sm sm:text-base" style={{ color: '#000000' }}>2. Gross & Retained Vehicle Bookings</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-cyan-950 bg-cyan-50 border border-cyan-300 px-2.5 py-1 rounded-md">
                    Gross: {currentDealer.bookings + currentDealer.cancellations} | Retained: {currentDealer.bookings} units
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  Gross Bookings represents total customer deposit locks placed. Retained Bookings accounts for active units currently awaiting LOU financing or delivery allocation.
                </p>
                <div 
                  className="p-3 rounded-xl font-mono text-xs sm:text-[13px] border font-bold"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}
                >
                  <code style={{ color: '#000000' }}>Formula: Gross_Bookings = Retained_Bookings + Dropped_Bookings (Cancellations)</code>
                </div>
              </div>

              {/* KPI 3: Dropped Bookings & Rejection Rate */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-400/30" />
                    <h4 className="font-black text-black text-sm sm:text-base" style={{ color: '#000000' }}>3. Dropped Bookings & Cancellation Rate</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-rose-950 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md">
                    Live Dropped: {currentDealer.cancellations} units ({((currentDealer.cancellations / (currentDealer.bookings + currentDealer.cancellations || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  Total customer cancellations combined with formal bank financing rejections. Threshold alert triggers if dropped units exceed 4 in an active period.
                </p>
                <div 
                  className="p-3 rounded-xl font-mono text-xs sm:text-[13px] border font-bold"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}
                >
                  <code style={{ color: '#000000' }}>Formula: Drop_Rate(%) = (Dropped_Bookings / Gross_Bookings) × 100</code>
                </div>
              </div>

              {/* KPI 4: Conversion Efficiency */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" />
                    <h4 className="font-black text-black text-sm sm:text-base" style={{ color: '#000000' }}>4. Showroom Conversion Efficiency</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-950 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md">
                    Active: {currentDealer.conversionRate}% (Benchmark: &gt; 25.0%)
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  Percentage of verified customer showroom walk-ins and digital inquiries that successfully result in locked booking deposits.
                </p>
                <div 
                  className="p-3 rounded-xl font-mono text-xs sm:text-[13px] border font-bold"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#000000' }}
                >
                  <code style={{ color: '#000000' }}>Formula: Conversion_Efficiency = (Retained_Bookings / Total_Inflow_Leads) × 100</code>
                </div>
              </div>

              {/* KPI 5: DMV / JPJ Registrations */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-500 ring-2 ring-violet-400/30" />
                    <h4 className="font-black text-black text-sm sm:text-base" style={{ color: '#000000' }}>5. DMV / JPJ Authenticated Registrations</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-violet-950 bg-violet-50 border border-violet-300 px-2.5 py-1 rounded-md">
                    Current Deliveries: {currentDealer.registrations} units
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  Official Road Transport Department (JPJ) vehicle number plate registrations and customer key handovers completed during the cycle.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEALERSHIP NETWORK */}
          {activeTab === 'dealerships' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Ingress ADD Branch Network Directory</h3>
                <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Branch representatives, active sales rep headcounts, and live inventory allocations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dealerships.filter(d => d.id !== 'all').map(d => (
                  <div key={d.id} className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-black text-base" style={{ color: '#000000' }}>{d.brand}</div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-950 border border-indigo-200 font-extrabold">
                        {d.id}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-black font-black" style={{ color: '#000000' }}>{d.name}</div>
                    
                    <div className="space-y-2 font-mono text-xs pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-black">
                        <span className="font-semibold" style={{ color: '#000000' }}>Active Bookings:</span>
                        <span className="text-black font-black" style={{ color: '#000000' }}>{d.bookings} units</span>
                      </div>
                      <div className="flex justify-between text-black">
                        <span className="font-semibold" style={{ color: '#000000' }}>Revenue:</span>
                        <span className="text-amber-900 font-black">RM {d.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-black">
                        <span className="font-semibold" style={{ color: '#000000' }}>Sales Reps:</span>
                        <span className="text-cyan-900 font-black">{d.activeSalesReps} Reps</span>
                      </div>
                      <div className="flex justify-between text-black">
                        <span className="font-semibold" style={{ color: '#000000' }}>Flagship Model:</span>
                        <span className="text-emerald-900 font-black">{d.topModel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 mt-4 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>Branch Leadership Contacts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs pt-1">
                  <div className="p-3 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="font-black text-black text-sm" style={{ color: '#000000' }}>Ahmad Razak</div>
                    <div className="text-black text-xs font-semibold mt-0.5" style={{ color: '#000000' }}>Branch Head - Puchong</div>
                    <div className="text-[#8f043b] font-mono text-xs font-black mt-1">+60 12-345 6789</div>
                  </div>
                  <div className="p-3 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="font-black text-black text-sm" style={{ color: '#000000' }}>Farah Lee</div>
                    <div className="text-black text-xs font-semibold mt-0.5" style={{ color: '#000000' }}>Branch Lead - The Curve</div>
                    <div className="text-[#8f043b] font-mono text-xs font-black mt-1">+60 17-555 4321</div>
                  </div>
                  <div className="p-3 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="font-black text-black text-sm" style={{ color: '#000000' }}>Kamal Vance</div>
                    <div className="text-black text-xs font-semibold mt-0.5" style={{ color: '#000000' }}>EV Specialist - Bangi</div>
                    <div className="text-[#8f043b] font-mono text-xs font-black mt-1">+60 11-7777 999</div>
                  </div>
                </div>
              </div>

              {/* Stock Available by Model & Payment Status Protocol Card */}
              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 mt-4 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>Stock Available by Model & Payment Status Standard</h4>
                <p className="text-xs sm:text-[13.5px] text-black font-semibold leading-relaxed" style={{ color: '#000000' }}>
                  The <strong>Stock Available by Model</strong> tracker records live vehicle inventory allocations across dealerships and branches, categorized into physical on-hand stock and inbound in-transit stock, accompanied by financial settlement status.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <div className="font-black text-emerald-950 text-sm">Stock Status: Paid</div>
                    <div className="text-black text-xs font-semibold mt-1" style={{ color: '#000000' }}>
                      Vehicles whose invoices and OEM settlements have been fully cleared. These units are immediately eligible for JPJ registration, insurance issuance, and client handover upon LOU endorsement.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                    <div className="font-black text-amber-950 text-sm">Stock Status: Not Yet Paid</div>
                    <div className="text-black text-xs font-semibold mt-1" style={{ color: '#000000' }}>
                      Vehicles under floor-plan financing, transit billing, or pending principal clearance. Branch managers track these units to expedite payment releases prior to scheduling delivery appointments.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOU & BANKING */}
          {activeTab === 'lou' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Banking Partner & Letter of Undertaking (LOU) Protocol</h3>
                <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Benchmark SLAs, approval percentages, and credit evaluation rules across premier financiers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topBanks.map(bank => (
                  <div key={bank.id} className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-black text-sm sm:text-base flex items-center gap-2" style={{ color: '#000000' }}>
                        <span className="w-3 h-3 rounded-full ring-2 ring-slate-200" style={{ backgroundColor: bank.color }} />
                        {bank.bankName} ({bank.code})
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-950 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md">
                        {bank.approvalRate}% Approval
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Turnaround Time:</span>
                        <div className="text-black font-black text-sm" style={{ color: '#000000' }}>{bank.avgTurnaroundDays} Working Days</div>
                      </div>
                      <div>
                        <span className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Financing Disbursed:</span>
                        <div className="text-amber-900 font-black text-sm">RM {(bank.totalFinancingAmount / 1000000).toFixed(2)}M</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-3 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>Mandatory LOU Documentation Checklist</h4>
                <ul className="text-xs sm:text-[14.5px] text-black space-y-2 list-disc list-inside leading-relaxed font-medium" style={{ color: '#000000' }}>
                  <li style={{ color: '#000000' }}><span className="font-semibold text-black" style={{ color: '#000000' }}>National Registration Identity Card (MyKad) verified copy.</span></li>
                  <li style={{ color: '#000000' }}><span className="font-semibold text-black" style={{ color: '#000000' }}>Last 3 consecutive months verified salary slips and primary bank salary crediting statements.</span></li>
                  <li style={{ color: '#000000' }}><span className="font-semibold text-black" style={{ color: '#000000' }}>Latest EPF (KWSP) statement verifying formal employment contribution.</span></li>
                  <li style={{ color: '#000000' }}><span className="font-semibold text-black" style={{ color: '#000000' }}>CCRIS & CTOS central bank debt-service ratio (DSR) clearance within 70% threshold.</span></li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: SALES ADVISOR COVERAGE & WORKFORCE GOVERNANCE */}
          {activeTab === 'advisors' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Sales Advisor Coverage & Direct Dashboard Access Policy</h3>
                <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Workforce access governance, duty tracking, and frontline operational roles across Ingress Corporation Berhad.</p>
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-3 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: '#000000' }}>
                  <Users className="w-4 h-4 text-amber-600" />
                  Workforce Coverage Scope & Network Benchmarks
                </h4>
                <p className="text-xs sm:text-[14.5px] text-black leading-relaxed font-medium" style={{ color: '#000000' }}>
                  The Ingress Dealership Operations Dashboard maintains 100% real-time coverage across <strong>43 Active Sales Advisors</strong> stationed across nationwide branch showrooms. Each advisor is assigned a maximum lead ratio of <strong>1 Advisor : 14 Active Inquiries</strong> to maintain a sub-15 minute initial customer consultation response SLA.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-amber-800 font-bold block text-[10px] uppercase">Mitsubishi Motors</span>
                    <strong className="text-black text-sm block mt-0.5">16 Sales Advisors</strong>
                    <span className="text-slate-600 text-[11px]">Ingress Motors Centre (Puchong, Bangi, Shah Alam)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 font-bold block text-[10px] uppercase">PERODUA</span>
                    <strong className="text-black text-sm block mt-0.5">15 Sales Advisors</strong>
                    <span className="text-slate-600 text-[11px]">Ingress Motors Centre (The Curve & Mutiara Damansara)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                    <span className="text-indigo-800 font-bold block text-[10px] uppercase">PROTON e.MAS</span>
                    <strong className="text-black text-sm block mt-0.5">12 Sales Advisors</strong>
                    <span className="text-slate-600 text-[11px]">Ingress Auto Bandar Baru Bangi Flagship</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-3 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>
                  Direct Frontline Dashboard Access Tiers
                </h4>
                <div className="space-y-3 text-xs sm:text-[14px]">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <strong className="text-black font-black text-xs sm:text-sm block">1. Full SA Portal Access (Mobile Tablet & Desktop)</strong>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Allocated to Senior Consultants and Master Advisors. Permitted to inspect vehicle stock payment status (Paid vs Not Yet Paid), initiate fast-track bank LOU submissions, manage complete customer CRM follow-ups, and log vehicle handovers.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <strong className="text-black font-black text-xs sm:text-sm block">2. Lead & LOU Mobile Access (Smartphone Applet)</strong>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Optimized for on-the-go advisors conducting external client visits or roadshows. Allows instant booking registration, test drive scheduling, and push notifications when financing LOUs are approved by panel banks.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <strong className="text-black font-black text-xs sm:text-sm block">3. Showroom Floor Access (Kiosk & Terminal Station)</strong>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      Restricted to showroom terminals for junior consultants. Permits walk-in registration, model variant catalog presentation, and live quota meters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DROP-OFF MITIGATION */}
          {activeTab === 'mitigation' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Cancellation & Drop-off Root Cause Mitigation Playbook</h3>
                <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Sales consultant operational workflows to recover high-risk customer reservations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CANCELLATION_REASONS.map(reason => (
                  <div key={reason.id} className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-black text-xs sm:text-sm" style={{ color: '#000000' }}>
                        {reason.reason}
                      </div>
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-extrabold uppercase ${
                        reason.category === 'rejection' 
                          ? 'bg-rose-50 text-rose-950 border border-rose-300' 
                          : 'bg-amber-50 text-amber-950 border border-amber-300'
                      }`}>
                        {reason.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#8f043b] font-black">Keyword: #{reason.keyword}</div>
                    <p className="text-xs sm:text-[14px] text-black leading-relaxed font-medium" style={{ color: '#000000' }}>{reason.description}</p>
                  </div>
                ))}
              </div>

              <div 
                className="p-4.5 rounded-xl border-2 space-y-2.5 shadow-xs bg-[#faf5f7] border-[#8f043b]"
              >
                <h4 className="font-black text-[#8f043b] text-xs sm:text-sm uppercase tracking-wider">Action Plan for Sales Consultants</h4>
                <p className="text-xs sm:text-[14.5px] text-black leading-relaxed font-medium" style={{ color: '#000000' }}>
                  When a booking logs as cancelled or loan rejected in the live inflow ticker, the assigned sales rep must initiate the <strong className="text-black font-black">48-Hour Recovery Protocol</strong>: re-evaluate loan tenure extension from 7 to 9 years, review co-guarantor documentation, or offer model variant substitution.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: FILTER & ENGINE LOGIC */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base sm:text-lg font-black text-black" style={{ color: '#000000' }}>Filter Multiplier Engine & Simulation Framework</h3>
                <p className="text-xs sm:text-[14px] text-black font-semibold mt-0.5" style={{ color: '#000000' }}>Technical documentation on how fiscal year and granularity multipliers calculate reactive values.</p>
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-3.5 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>Active Time Multiplier Coefficients</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Daily (Today):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">0.050x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Weekly (Week 1):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">0.250x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>MTD (Aug 1 - 7):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">0.230x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Monthly (August):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">1.000x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Quarterly (Q3):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">3.150x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>YTD (Jan - Aug):</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">7.150x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>Full Year Scope:</div>
                    <div className="text-cyan-950 font-black text-sm mt-0.5">12.000x</div>
                  </div>
                  <div className="p-2.5 rounded-xl border shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-black text-xs font-semibold" style={{ color: '#000000' }}>FY 2026:</div>
                    <div className="text-emerald-950 font-black text-sm mt-0.5">1.000x</div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4.5 space-y-2.5 shadow-xs">
                <h4 className="font-black text-black text-xs uppercase tracking-wider" style={{ color: '#000000' }}>Branch Multipliers</h4>
                <p className="text-xs sm:text-[14.5px] text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
                  When filtering down to specific branches, the calculation engine applies weighted shares: Puchong (42%), IMC Bangi (35%), Shah Alam (23%), The Curve (55%), Mutiara Damansara (45%), and PROTON e.MAS Bangi (100%).
                </p>
              </div>

              {/* Auto Guide Playback Governance */}
              <div 
                className="border-2 rounded-xl p-4.5 space-y-3.5 shadow-xs bg-white border-[#8f043b]"
                style={{
                  borderLeftWidth: '5px'
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-black text-[#8f043b] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8f043b]" />
                    Auto Guide Access Governance (First Login vs 2nd+ Login)
                  </h4>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-black">
                    SYSTEM RULE
                  </span>
                </div>
                <p className="text-xs sm:text-[14.5px] text-black leading-relaxed font-medium" style={{ color: '#000000' }}>
                  <strong className="text-black font-black">First-Time Login Access:</strong> The interactive walkthrough tour automatically plays once upon the user's initial login to introduce vital dealership KPIs.<br />
                  <strong className="text-black font-black">2nd Time &amp; Subsequent Logins:</strong> The tour does not automatically pop up, allowing seamless direct dashboard operations. Users can manually launch the guide anytime by clicking the <strong className="text-black font-black">"Auto Guide"</strong> button in the top navigation bar.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleResetFirstTimeGuide}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-black border transition-colors cursor-pointer shadow-xs hover:bg-slate-50"
                    style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
                    title="Reset first-time login flag to test auto-play on next login"
                  >
                    <span style={{ color: '#000000' }}>Reset First-Time Auto Guide Flag</span>
                  </button>
                  {resetGuideSuccess && (
                    <span className="text-xs text-emerald-900 font-black flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Reset successful! Auto Guide will auto-play on your next login.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4. Footer Actions Bar - Clean Light Scheme */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-black" style={{ backgroundColor: '#faf8fa', color: '#000000' }}>
          <div className="flex items-center gap-2 text-black text-xs font-mono font-medium" style={{ color: '#000000' }}>
            <span style={{ color: '#000000' }}>Ingress Corporation Berhad • Automotive Dealership Division</span>
            <span>•</span>
            <span className="text-black font-semibold" style={{ color: '#000000' }}>Confidential Internal Document</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onLaunchAutoGuide();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-black border transition-all shadow-xs cursor-pointer active:scale-95 hover:bg-rose-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#8f043b', borderWidth: '2px', color: '#000000' }}
            >
              <Compass className="w-3.5 h-3.5 text-[#8f043b]" />
              <span className="text-black font-bold" style={{ color: '#000000' }}>Take Interactive Tour</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-black border transition-colors cursor-pointer shadow-xs hover:bg-slate-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
            >
              Close Handbook
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
