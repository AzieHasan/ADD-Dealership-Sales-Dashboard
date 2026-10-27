/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Award, 
  Target, 
  FileCheck, 
  Car, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Download, 
  FileSpreadsheet, 
  FileText,
  KeyRound, 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  SlidersHorizontal,
  Lock,
  Unlock,
  Radio,
  Building2,
  DollarSign
} from 'lucide-react';
import { SalesAdvisor, DashboardAccessTier, FrontlinePrivileges } from '../types';
import { exportSalesAdvisorCoverageFeature, exportSingleSalesAdvisorFeature, formatLastLoginDateTime, formatMYR } from '../utils/excelExport';
import { exportSingleSalesAdvisorPDF } from '../utils/pdfExport';

interface SalesAdvisorCoverageProps {
  advisors: SalesAdvisor[];
  selectedDealerId: string;
  selectedDealerName: string;
  filterLabel?: string;
  onSelectAdvisor?: (advisor: SalesAdvisor) => void;
  onLaunchAutoGuide?: (targetId?: string) => void;
  onOpenHandbook?: (tab?: string) => void;
}

export function SalesAdvisorCoverage({
  advisors,
  selectedDealerId,
  selectedDealerName,
  filterLabel = 'FY 2026 • August',
  onSelectAdvisor
}: SalesAdvisorCoverageProps) {
  // Local state for interactive filtering & searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<'All' | 'Mitsubishi' | 'PERODUA' | 'PROTON e.MAS'>('All');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('All');
  const [selectedAccessTierFilter, setSelectedAccessTierFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Sync selectedBrandFilter when top dealership changes
  React.useEffect(() => {
    if (selectedDealerId === 'dt-porsche') {
      setSelectedBrandFilter('Mitsubishi');
      setSelectedBranchFilter('All');
    } else if (selectedDealerId === 'ns-audi') {
      setSelectedBrandFilter('PERODUA');
      setSelectedBranchFilter('All');
    } else if (selectedDealerId === 'ws-bmw') {
      setSelectedBrandFilter('PROTON e.MAS');
      setSelectedBranchFilter('All');
    } else {
      setSelectedBrandFilter('All');
      setSelectedBranchFilter('All');
    }
  }, [selectedDealerId]);

  // Representative Branches list based on brand selection
  const representativeBranches = useMemo(() => {
    if (selectedBrandFilter === 'Mitsubishi') {
      return ['PUCHONG', 'IMC, BANDAR BARU BANGI', 'SHAH ALAM'];
    }
    if (selectedBrandFilter === 'PERODUA') {
      return ['The Curve', 'MUTIARA DAMANSARA'];
    }
    if (selectedBrandFilter === 'PROTON e.MAS') {
      return ['BANDAR BARU BANGI'];
    }
    return [
      'PUCHONG',
      'IMC, BANDAR BARU BANGI',
      'SHAH ALAM',
      'The Curve',
      'MUTIARA DAMANSARA',
      'BANDAR BARU BANGI'
    ];
  }, [selectedBrandFilter]);

  // Branch matching helper
  const isBranchMatch = (saBranch: string, filterBranch: string, saBrand: string) => {
    if (filterBranch === 'All' || filterBranch === 'REPRESENTATIVE BRANCH') return true;
    const s = saBranch.toLowerCase();
    const f = filterBranch.toLowerCase();
    if (s === f) return true;
    if (filterBranch === 'PUCHONG' && s.includes('puchong')) return true;
    if (filterBranch === 'The Curve' && s.includes('curve')) return true;
    if (filterBranch === 'MUTIARA DAMANSARA' && s.includes('mutiara')) return true;
    if (filterBranch === 'SHAH ALAM' && s.includes('shah alam')) return true;
    if (filterBranch === 'IMC, BANDAR BARU BANGI' && (s.includes('imc') || (s.includes('bangi') && saBrand === 'Mitsubishi'))) return true;
    if ((filterBranch === 'BANDAR BARU BANGI' || filterBranch === 'PROTON e.MAS, BANDAR BARU BANGI') && (s.includes('bangi') || (saBrand === 'PROTON e.MAS' && s.includes('bangi')))) return true;
    return s.includes(f) || f.includes(s);
  };

  // Interface for single advisor access settings override
  interface AdvisorAccessOverride {
    accessEnabled: boolean;
    dashboardAccessLevel: DashboardAccessTier;
    twoFactorAuth: boolean;
    privileges: FrontlinePrivileges;
  }

  // Interactive Advisor access permissions overrides (persists dynamic changes per advisor)
  const [advisorOverrides, setAdvisorOverrides] = useState<Record<string, AdvisorAccessOverride>>({});

  // Helper to resolve an advisor's current permissions (defaulting based on role and tier)
  const getAdvisorPermissions = (sa: SalesAdvisor): AdvisorAccessOverride => {
    if (advisorOverrides[sa.id]) {
      return advisorOverrides[sa.id];
    }
    const isFull = sa.dashboardAccessLevel === 'Full SA Portal Access';
    return {
      accessEnabled: sa.accessEnabled,
      dashboardAccessLevel: sa.dashboardAccessLevel,
      twoFactorAuth: sa.twoFactorAuth ?? true,
      privileges: sa.privileges ?? {
        stockPaymentVisibility: isFull || sa.dashboardAccessLevel === 'Showroom Floor Access',
        bankLOUFastTrack: isFull || sa.dashboardAccessLevel === 'Lead & LOU Mobile Access',
        leadClaiming: isFull || sa.dashboardAccessLevel === 'Lead & LOU Mobile Access',
        quotaCommissionMeter: isFull,
      }
    };
  };

  // Live advisors list with individual access overrides applied
  const effectiveAdvisors = useMemo(() => {
    return advisors.map(sa => {
      const perms = getAdvisorPermissions(sa);
      return {
        ...sa,
        accessEnabled: perms.accessEnabled,
        dashboardAccessLevel: perms.dashboardAccessLevel,
        twoFactorAuth: perms.twoFactorAuth,
        privileges: perms.privileges
      };
    });
  }, [advisors, advisorOverrides]);

  // Modal states
  const [previewAdvisor, setPreviewAdvisor] = useState<SalesAdvisor | null>(null);
  const [isNetworkPolicyModalOpen, setIsNetworkPolicyModalOpen] = useState(false);
  const [editingAdvisorAccess, setEditingAdvisorAccess] = useState<SalesAdvisor | null>(null);
  const [tempAccessConfig, setTempAccessConfig] = useState<AdvisorAccessOverride | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle single advisor access quickly
  const handleToggleAccess = (saId: string, saName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentSa = effectiveAdvisors.find(a => a.id === saId) || advisors.find(a => a.id === saId);
    if (!currentSa) return;
    const currentPerms = getAdvisorPermissions(currentSa);
    const nextState = !currentPerms.accessEnabled;
    setAdvisorOverrides(prev => ({
      ...prev,
      [saId]: {
        ...currentPerms,
        accessEnabled: nextState
      }
    }));
    showToast(`${saName} direct dashboard access ${nextState ? 'CONNECTED' : 'SUSPENDED'}`);
  };

  // Open single advisor "Manage Access Permissions" modal
  const handleOpenAdvisorAccessModal = (sa: SalesAdvisor, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const perms = getAdvisorPermissions(sa);
    setEditingAdvisorAccess(sa);
    setTempAccessConfig({
      accessEnabled: perms.accessEnabled,
      dashboardAccessLevel: perms.dashboardAccessLevel,
      twoFactorAuth: perms.twoFactorAuth,
      privileges: { ...perms.privileges }
    });
  };

  // Save updated permissions for the single advisor
  const handleSaveAdvisorAccess = () => {
    if (editingAdvisorAccess && tempAccessConfig) {
      setAdvisorOverrides(prev => ({
        ...prev,
        [editingAdvisorAccess.id]: tempAccessConfig
      }));
      showToast(`Access permissions updated: ${editingAdvisorAccess.name} (${tempAccessConfig.dashboardAccessLevel})`);
      setEditingAdvisorAccess(null);
      setTempAccessConfig(null);
    }
  };

  // Bulk enable all access across dealership
  const handleBulkEnableAccess = () => {
    const updated: Record<string, AdvisorAccessOverride> = {};
    advisors.forEach(sa => {
      updated[sa.id] = {
        accessEnabled: true,
        dashboardAccessLevel: 'Full SA Portal Access',
        twoFactorAuth: true,
        privileges: {
          stockPaymentVisibility: true,
          bankLOUFastTrack: true,
          leadClaiming: true,
          quotaCommissionMeter: true
        }
      };
    });
    setAdvisorOverrides(updated);
    showToast('Expanded 100% Full SA Portal access to all active Sales Advisors');
    setIsNetworkPolicyModalOpen(false);
  };

  // Filtered advisors list based on effective state
  const filteredAdvisors = useMemo(() => {
    return effectiveAdvisors.filter(sa => {
      // Brand filter
      if (selectedBrandFilter !== 'All' && sa.brand !== selectedBrandFilter) {
        return false;
      }
      // Representative Branch filter
      if (selectedBranchFilter !== 'All' && selectedBranchFilter !== 'REPRESENTATIVE BRANCH') {
        if (!isBranchMatch(sa.branchName, selectedBranchFilter, sa.brand)) {
          return false;
        }
      }
      // Access Tier filter
      if (selectedAccessTierFilter !== 'All' && sa.dashboardAccessLevel !== selectedAccessTierFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = sa.name.toLowerCase().includes(term);
        const matchesId = sa.staffId.toLowerCase().includes(term);
        const matchesModel = sa.topModel.toLowerCase().includes(term);
        const matchesBranch = sa.branchName.toLowerCase().includes(term);
        const matchesRole = sa.role.toLowerCase().includes(term);
        return matchesName || matchesId || matchesModel || matchesBranch || matchesRole;
      }
      return true;
    });
  }, [effectiveAdvisors, selectedBrandFilter, selectedBranchFilter, selectedAccessTierFilter, searchTerm]);

  // Aggregate statistics using effective advisors
  const totalAdvisors = effectiveAdvisors.length;
  const enabledAccessCount = effectiveAdvisors.filter(sa => sa.accessEnabled).length;
  const totalBookingsSecured = effectiveAdvisors.reduce((sum, sa) => sum + sa.actualBookings, 0);
  const totalTargetBookings = effectiveAdvisors.reduce((sum, sa) => sum + sa.targetBookings, 0);
  const totalRegistrationsDelivered = effectiveAdvisors.reduce((sum, sa) => sum + sa.registrations, 0);
  const totalLOUApproved = effectiveAdvisors.reduce((sum, sa) => sum + sa.louApprovedCount, 0);
  const totalFinancing = effectiveAdvisors.reduce((sum, sa) => sum + sa.financingValue, 0);
  const totalActiveLeads = effectiveAdvisors.reduce((sum, sa) => sum + sa.activeLeads, 0);
  const avgAchievement = totalTargetBookings > 0 ? Math.round((totalBookingsSecured / totalTargetBookings) * 100) : 0;
  const avgLeadRatio = totalAdvisors > 0 ? (totalActiveLeads / totalAdvisors).toFixed(1) : '0';



  // Download format menu dropdown state (advisor ID or null)
  const [downloadMenuAdvisorId, setDownloadMenuAdvisorId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setDownloadMenuAdvisorId(null);
    if (downloadMenuAdvisorId) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [downloadMenuAdvisorId]);

  const handleExportExcel = () => {
    exportSalesAdvisorCoverageFeature(filteredAdvisors, selectedDealerName, filterLabel);
    const uniqueDealers = Array.from(new Set(filteredAdvisors.map(sa => sa.dealershipName)));
    if (uniqueDealers.length > 1) {
      showToast(`Downloading Excel: Split across ${uniqueDealers.length} dealership sheets + consolidated (.xlsx)`);
    } else {
      showToast(`Downloading Excel: ${filteredAdvisors.length} Sales Advisors exported (.xlsx)`);
    }
  };

  const handleDownloadSingleAdvisorExcel = (sa: SalesAdvisor, e?: React.MouseEvent) => {
    e?.stopPropagation();
    exportSingleSalesAdvisorFeature(sa, filterLabel);
    showToast(`Downloaded Excel (.xlsx): ${sa.name} (${sa.staffId})`);
    setDownloadMenuAdvisorId(null);
  };

  const handleDownloadSingleAdvisorPDF = (sa: SalesAdvisor, e?: React.MouseEvent) => {
    e?.stopPropagation();
    exportSingleSalesAdvisorPDF(sa, filterLabel);
    showToast(`Downloaded PDF Report: ${sa.name} (${sa.staffId})`);
    setDownloadMenuAdvisorId(null);
  };

  return (
    <div 
      id="sales-advisor-coverage-panel"
      className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden transition-colors"
    >
      {/* Decorative top accent glow */}
      <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-emerald-500/0" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 right-4 z-50 bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-lg border border-emerald-500 text-xs font-mono font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono font-bold">
              Workforce Access & Governance
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 font-bold uppercase flex items-center gap-1 shadow-2xs">
              <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              Sales Advisor Coverage
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 font-bold uppercase flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Access: {enabledAccessCount}/{totalAdvisors} Connected
            </span>
            <span className="coverage-badge text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold shadow-2xs">
              {selectedDealerName}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Users className="w-5 h-5 text-amber-500" />
            Sales Advisor Coverage: Expand Dashboard Access
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Directly connect frontline Sales Advisors to live dealership inventory, customer pipelines, and bank LOU tracking. Expand permissions, monitor representative branch coverage, and track individual quota achievement in real time.
          </p>
        </div>

        {/* Action Buttons: Expand Access & Export Excel */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={() => setIsNetworkPolicyModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800 cursor-pointer shadow-xs active:scale-95"
            title="Configure and expand network dashboard access permissions for Sales Advisors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Network Access Policy</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800 cursor-pointer shadow-xs active:scale-95"
            title="Download full Sales Advisor Coverage data to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">Active Roster</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{totalAdvisors}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">Advisors</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold block mt-1">100% Branch Coverage</span>
        </div>

        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">Portal Connected</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">{enabledAccessCount}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">/ {totalAdvisors}</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-medium block mt-1">Direct Access Active</span>
        </div>

        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">Quota Fulfillment</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-indigo-700 dark:text-indigo-400">{avgAchievement}%</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">Avg</span>
          </div>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-mono font-bold block mt-1">{totalBookingsSecured}/{totalTargetBookings} units</span>
        </div>

        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">Deliveries (DMV)</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-violet-700 dark:text-violet-400">{totalRegistrationsDelivered}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">units</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-medium block mt-1">Handed over to clients</span>
        </div>

        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">LOU Approvals</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-700 dark:text-amber-400">{totalLOUApproved}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-medium">LOU</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold block mt-1">{formatMYR(totalFinancing)}</span>
        </div>

        <div className="coverage-kpi-card p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block font-bold tracking-wider">Lead Coverage</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-700 dark:text-cyan-400">1 : {avgLeadRatio}</span>
          </div>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-medium block mt-1">{totalActiveLeads} Active Leads</span>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="coverage-search-bar flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search advisor by name, staff ID, top model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs font-mono shadow-2xs">
            {(['All', 'Mitsubishi', 'PERODUA', 'PROTON e.MAS'] as const).map(brand => (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrandFilter(brand);
                  setSelectedBranchFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  selectedBrandFilter === brand
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Representative Branch Dropdown */}
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-900 dark:text-slate-200 font-semibold cursor-pointer shadow-2xs focus:outline-none focus:border-amber-500 uppercase"
            title="Filter by Representative Branch"
          >
            <option value="All">REPRESENTATIVE BRANCH</option>
            {representativeBranches.map(branch => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded cursor-pointer transition-colors ${viewMode === 'grid' ? 'coverage-toggle-active bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Cards Grid View"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded cursor-pointer transition-colors ${viewMode === 'table' ? 'coverage-toggle-active bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white font-bold' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Table View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advisors Content: Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredAdvisors.map(sa => {
            const isAccessOn = sa.accessEnabled;
            const fulfillment = sa.targetBookings > 0 ? Math.round((sa.actualBookings / sa.targetBookings) * 100) : 0;

            return (
              <div
                key={sa.id}
                className="coverage-advisor-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-amber-400/80 dark:hover:border-amber-400/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-3 group relative overflow-hidden"
              >
                {/* Advisor Top Card */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar initial badge */}
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: sa.avatarColor }}
                      >
                        {sa.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="coverage-badge text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            {sa.staffId}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {sa.brand}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5 uppercase" title={sa.name}>
                          {sa.name}
                        </h4>
                      </div>
                    </div>

                    {/* Direct Dashboard Access Switch */}
                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <button
                        onClick={(e) => handleToggleAccess(sa.id, sa.name, e)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                          isAccessOn
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        }`}
                        title={isAccessOn ? 'Click to suspend direct dashboard access' : 'Click to enable direct dashboard access'}
                      >
                        {isAccessOn ? <Unlock className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-300" /> : <Lock className="w-2.5 h-2.5 text-rose-700 dark:text-rose-300" />}
                        <span>{isAccessOn ? 'Access ON' : 'Access OFF'}</span>
                      </button>
                      <span className="text-[8.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {sa.dashboardAccessLevel}
                      </span>
                    </div>
                  </div>

                  {/* Role & Representative Branch (Duty Status Removed) */}
                  <div className="flex items-center justify-between gap-2 my-2 text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate" title={sa.role}>
                      {sa.role}
                    </span>

                    <span className="coverage-badge text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[140px]" title={sa.branchName}>
                      {sa.branchName}
                    </span>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="coverage-inner-box my-2.5 p-2.5 rounded-lg bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">Monthly Quota</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {sa.actualBookings} / {sa.targetBookings} units ({fulfillment}%)
                      </span>
                    </div>

                    <div className="coverage-progress-track w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          fulfillment >= 100 ? 'bg-emerald-500' : fulfillment >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, fulfillment)}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-3 gap-1.5 text-center my-2 text-[10px] font-mono">
                    <div className="coverage-inner-box p-1.5 rounded bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 block text-[9px] font-medium">Delivered</span>
                      <span className="font-bold text-violet-700 dark:text-violet-400">{sa.registrations} units</span>
                    </div>
                    <div className="coverage-inner-box p-1.5 rounded bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 block text-[9px] font-medium">LOU Appr</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{sa.louApprovedCount} LOU</span>
                    </div>
                    <div className="coverage-inner-box p-1.5 rounded bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 block text-[9px] font-medium">Leads</span>
                      <span className="font-bold text-cyan-700 dark:text-cyan-400">{sa.activeLeads}</span>
                    </div>
                  </div>
                </div>

                {/* Footer details: Access, Download (Excel/PDF) & Preview SA Portal */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono">
                  {/* ACCESS Button */}
                  <button
                    onClick={(e) => handleOpenAdvisorAccessModal(sa, e)}
                    className="coverage-action-btn px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 hover:text-indigo-950 border border-indigo-300 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:hover:text-indigo-200 dark:border-indigo-800 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title={`Manage Access Permissions for ${sa.name}`}
                  >
                    <KeyRound className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Access</span>
                  </button>

                  {/* Download Dropdown */}
                  <div className="relative flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDownloadMenuAdvisorId(downloadMenuAdvisorId === `card-${sa.id}` ? null : `card-${sa.id}`);
                      }}
                      className="coverage-action-btn w-full justify-center px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 border border-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:hover:text-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title={`Download options for ${sa.name} (Excel or PDF)`}
                    >
                      <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Download</span>
                      <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                    </button>

                    {downloadMenuAdvisorId === `card-${sa.id}` && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 bottom-full mb-1.5 z-50 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 font-sans animate-fadeIn text-left backdrop-blur-md"
                      >
                        <div className="px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9.5px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                            Choose Format
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDownloadSingleAdvisorExcel(sa, e)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold block text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Excel (.xlsx)</span>
                            <span className="text-[9px] text-slate-500 block">Single-row structured data</span>
                          </div>
                        </button>

                        <button
                          onClick={(e) => handleDownloadSingleAdvisorPDF(sa, e)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer mt-0.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <div>
                            <span className="font-bold block text-xs group-hover:text-rose-700 dark:group-hover:text-rose-400">PDF Report (.pdf)</span>
                            <span className="text-[9px] text-slate-500 block">Executive modern report</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setPreviewAdvisor(sa)}
                    className="coverage-action-btn flex-1 justify-center px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-amber-950/60 dark:text-slate-300 dark:hover:text-amber-300 dark:border-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title={`View ${sa.name} details`}
                  >
                    <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 shadow-xs">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Staff ID & Advisor</th>
                <th className="p-3">Brand & Representative Branch</th>
                <th className="p-3">Role</th>
                <th className="p-3">Dashboard Access</th>
                <th className="p-3 text-center">Quota (Act/Tgt)</th>
                <th className="p-3 text-center">Registrations</th>
                <th className="p-3 text-center">LOU Approved</th>
                <th className="p-3 text-right">Financing (RM)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAdvisors.map(sa => {
                const isAccessOn = sa.accessEnabled;
                const fulfillment = sa.targetBookings > 0 ? Math.round((sa.actualBookings / sa.targetBookings) * 100) : 0;

                return (
                  <tr key={sa.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="coverage-badge font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] shadow-2xs">
                          {sa.staffId}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">{sa.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{sa.brand}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] block">{sa.branchName}</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{sa.role}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleAccess(sa.id, sa.name, e)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold border inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                            isAccessOn
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {isAccessOn ? <Unlock className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-300" /> : <Lock className="w-2.5 h-2.5 text-rose-700 dark:text-rose-300" />}
                          <span>{isAccessOn ? 'Connected' : 'Suspended'}</span>
                        </button>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">
                          {sa.dashboardAccessLevel}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{sa.actualBookings} / {sa.targetBookings}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium block">({fulfillment}%)</span>
                    </td>
                    <td className="p-3 text-center font-bold text-violet-700 dark:text-violet-400">{sa.registrations}</td>
                    <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400">{sa.louApprovedCount}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">{formatMYR(sa.financingValue)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* ACCESS Button */}
                        <button
                          onClick={(e) => handleOpenAdvisorAccessModal(sa, e)}
                          className="coverage-action-btn px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 hover:text-indigo-950 border border-indigo-300 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:hover:text-indigo-200 dark:border-indigo-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
                          title={`Manage Access Permissions for ${sa.name} (${sa.staffId})`}
                        >
                          <KeyRound className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Access</span>
                        </button>

                        {/* Download Format Dropdown Menu */}
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDownloadMenuAdvisorId(downloadMenuAdvisorId === `table-${sa.id}` ? null : `table-${sa.id}`);
                            }}
                            className="coverage-action-btn px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 border border-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:hover:text-emerald-200 dark:border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all active:scale-95"
                            title={`Download ${sa.name} record (Excel or PDF)`}
                          >
                            <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Download</span>
                            <ChevronDown className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-300 opacity-70" />
                          </button>

                          {downloadMenuAdvisorId === `table-${sa.id}` && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 font-sans animate-fadeIn text-left backdrop-blur-md"
                            >
                              <div className="px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-slate-800/80">
                                <span className="text-[9.5px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                                  Select Download Format
                                </span>
                              </div>

                              <button
                                onClick={(e) => handleDownloadSingleAdvisorExcel(sa, e)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                  <FileSpreadsheet className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold block text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                                    Excel Spreadsheet (.xlsx)
                                  </span>
                                  <span className="text-[9.5px] text-slate-500 block">
                                    Single-row structured data
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={(e) => handleDownloadSingleAdvisorPDF(sa, e)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer mt-0.5"
                              >
                                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold block text-xs group-hover:text-rose-700 dark:group-hover:text-rose-400">
                                    PDF Executive Report (.pdf)
                                  </span>
                                  <span className="text-[9.5px] text-slate-500 block">
                                    Modern styled dossier & audit
                                  </span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setPreviewAdvisor(sa)}
                          className="coverage-action-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-amber-950/60 dark:text-slate-300 dark:hover:text-amber-300 dark:border-slate-700 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                          title={`View ${sa.name} details`}
                        >
                          <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL 1: PREVIEW SALES ADVISOR DIRECT DASHBOARD PERSPECTIVE --- */}
      <AnimatePresence>
        {previewAdvisor && (() => {
          const activeAdvisor = effectiveAdvisors.find(a => a.id === previewAdvisor.id) || previewAdvisor;
          const isDirectOn = activeAdvisor.accessEnabled;
          const isStockEnabled = isDirectOn && (activeAdvisor.privileges ? activeAdvisor.privileges.stockPaymentVisibility : (activeAdvisor.dashboardAccessLevel === 'Full SA Portal Access' || activeAdvisor.dashboardAccessLevel === 'Showroom Floor Access'));
          const isLOUEnabled = isDirectOn && (activeAdvisor.privileges ? activeAdvisor.privileges.bankLOUFastTrack : (activeAdvisor.dashboardAccessLevel === 'Full SA Portal Access' || activeAdvisor.dashboardAccessLevel === 'Lead & LOU Mobile Access'));
          const isLeadEnabled = isDirectOn && (activeAdvisor.privileges ? activeAdvisor.privileges.leadClaiming : (activeAdvisor.dashboardAccessLevel === 'Full SA Portal Access' || activeAdvisor.dashboardAccessLevel === 'Lead & LOU Mobile Access'));
          const isQuotaEnabled = isDirectOn && (activeAdvisor.privileges ? activeAdvisor.privileges.quotaCommissionMeter : activeAdvisor.dashboardAccessLevel === 'Full SA Portal Access');
          const activeCount = [isStockEnabled, isLOUEnabled, isLeadEnabled, isQuotaEnabled].filter(Boolean).length;
          const fulfillmentRate = activeAdvisor.targetBookings > 0 ? Math.round((activeAdvisor.actualBookings / activeAdvisor.targetBookings) * 100) : 0;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="coverage-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl sm:max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
              >
                {/* Header */}
                <div className="coverage-modal-header p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0"
                      style={{ backgroundColor: activeAdvisor.avatarColor }}
                    >
                      {activeAdvisor.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                          Sales Advisor Details View
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {activeAdvisor.staffId}
                        </span>
                        <button
                          onClick={() => handleOpenAdvisorAccessModal(activeAdvisor)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                          title={`Manage access permissions for ${activeAdvisor.name}`}
                        >
                          <KeyRound className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Manage Access</span>
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase">
                        {activeAdvisor.name} • {activeAdvisor.brand}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewAdvisor(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
                  {/* Advisor Banner info */}
                  <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isDirectOn
                      ? 'bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 border-amber-300/60 dark:border-amber-800/50'
                      : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/50'
                  }`}>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isDirectOn ? 'text-amber-900 dark:text-amber-300' : 'text-rose-900 dark:text-rose-300'
                      }`}>
                        {isDirectOn ? 'Frontline SA Direct Access Active' : 'Frontline SA Direct Access Suspended'}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {activeAdvisor.role} • {activeAdvisor.branchName}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Date & Time Last Login: <span className="font-bold text-slate-800 dark:text-slate-200">{formatLastLoginDateTime(activeAdvisor.lastActive, activeAdvisor.staffId)}</span>
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-white font-bold text-xs shadow-xs ${
                        isDirectOn ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}>
                        {activeAdvisor.dashboardAccessLevel}
                      </span>
                    </div>
                  </div>

                  {/* Performance Bento */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="coverage-inner-box p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">Target vs Actual</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeAdvisor.actualBookings} / {activeAdvisor.targetBookings}</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5 font-bold">
                        {fulfillmentRate}% Quota Met
                      </span>
                    </div>

                    <div className="coverage-inner-box p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">Registrations</span>
                      <span className="text-lg font-bold text-violet-700 dark:text-violet-400">{activeAdvisor.registrations} units</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Customer Delivery</span>
                    </div>

                    <div className="coverage-inner-box p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">LOU Approved</span>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{activeAdvisor.louApprovedCount} LOU</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5 font-bold">{formatMYR(activeAdvisor.financingValue)}</span>
                    </div>

                    <div className="coverage-inner-box p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">Active Inquiries</span>
                      <span className="text-lg font-bold text-cyan-700 dark:text-cyan-400">{activeAdvisor.activeLeads} Leads</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5 font-medium">{activeAdvisor.conversionRate}% Conv Rate</span>
                    </div>
                  </div>

                  {/* Frontline Privileges Section */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                          Frontline Privileges ({activeCount}/4 Active)
                        </h5>
                      </div>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                        activeCount === 4
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : activeCount > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{activeCount === 4 ? 'Full SA Portal Privileges Enabled' : `${activeCount}/4 Privileges Configured`}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 1. Stock Payment Status Visibility */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isStockEnabled 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs' 
                          : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isStockEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                            }`}>
                              <Car className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              1. Stock Payment Status Visibility
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            isStockEnabled 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isStockEnabled ? 'Enabled' : 'Restricted'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          Direct real-time visibility into <strong>In Stock</strong>, <strong>Stock Paid</strong>, and <strong>Not Yet Paid</strong> units in the dealership allocation queue for fast delivery handovers.
                        </p>
                        {isStockEnabled ? (
                          <div className="mt-2 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Allocation Queue</span>
                            <span>Real-Time Sync Active</span>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>Stock Authorization</span>
                            <span>Access Disabled in SA Permissions</span>
                          </div>
                        )}
                      </div>

                      {/* 2. Bank LOU Fast-Track Status */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isLOUEnabled 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs' 
                          : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isLOUEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                            }`}>
                              <FileCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              2. Bank LOU Fast-Track Status
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            isLOUEnabled 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isLOUEnabled ? 'Enabled' : 'Restricted'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          Submit and track financing letters of undertaking (LOU) with top financial partners (Maybank, CIMB, Public Bank, Hong Leong Bank) with instant approval alerts.
                        </p>
                        {isLOUEnabled ? (
                          <div className="mt-2 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Financing Pipeline</span>
                            <span>{activeAdvisor.louApprovedCount} LOUs ({formatMYR(activeAdvisor.financingValue)})</span>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>LOU Submission</span>
                            <span>Access Disabled in SA Permissions</span>
                          </div>
                        )}
                      </div>

                      {/* 3. Customer Pipeline Lead Claiming */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isLeadEnabled 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs' 
                          : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isLeadEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                            }`}>
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              3. Customer Pipeline Lead Claiming
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            isLeadEnabled 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isLeadEnabled ? 'Enabled' : 'Restricted'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          Instant mobile & desktop claiming for incoming test-drive bookings, digital showroom inquiries, and real-time consultation activity logs.
                        </p>
                        {isLeadEnabled ? (
                          <div className="mt-2 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Assigned Leads</span>
                            <span>{activeAdvisor.activeLeads} Leads ({activeAdvisor.conversionRate}% Conv)</span>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>Pipeline Claiming</span>
                            <span>Access Disabled in SA Permissions</span>
                          </div>
                        )}
                      </div>

                      {/* 4. Personal Quota & Commission Meter */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isQuotaEnabled 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs' 
                          : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isQuotaEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                            }`}>
                              <Target className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              4. Personal Quota & Commission Meter
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            isQuotaEnabled 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isQuotaEnabled ? 'Enabled' : 'Restricted'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                          Live target vs actual booking fulfillment meter, completed handover deliveries, and estimated progressive commission calculations.
                        </p>
                        {isQuotaEnabled ? (
                          <div className="mt-2 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Fulfillment Meter</span>
                            <span>{activeAdvisor.actualBookings}/{activeAdvisor.targetBookings} Units ({fulfillmentRate}%)</span>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>Commission Meter</span>
                            <span>Access Disabled in SA Permissions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="coverage-modal-footer p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Ingress Corporation Berhad • SA Governance Engine
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={(e) => handleDownloadSingleAdvisorExcel(activeAdvisor, e)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      title={`Download ${activeAdvisor.name} single record Excel (.xlsx)`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Download Excel (.xlsx)</span>
                    </button>

                    <button
                      onClick={(e) => handleDownloadSingleAdvisorPDF(activeAdvisor, e)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      title={`Download ${activeAdvisor.name} modern PDF report (.pdf)`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download PDF Report (.pdf)</span>
                    </button>

                    <button
                      onClick={() => setPreviewAdvisor(null)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs font-mono cursor-pointer shadow-xs active:scale-95"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* --- MODAL 2: SINGLE ADVISOR MANAGE ACCESS PERMISSIONS (TRIGGERED BY "ACCESS" IN ACTION COLUMN) --- */}
      <AnimatePresence>
        {editingAdvisorAccess && tempAccessConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="coverage-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
            >
              {/* Modal Header */}
              <div className="coverage-modal-header p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0"
                    style={{ backgroundColor: editingAdvisorAccess.avatarColor }}
                  >
                    {editingAdvisorAccess.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                        <KeyRound className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                        Manage Access Permissions
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {editingAdvisorAccess.staffId}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase">
                      {editingAdvisorAccess.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {editingAdvisorAccess.role} • {editingAdvisorAccess.brand} • {editingAdvisorAccess.branchName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingAdvisorAccess(null);
                    setTempAccessConfig(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
                {/* Direct Dashboard Access Toggle Card */}
                <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Direct Frontline SA Dashboard Access
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans">
                      Permit {editingAdvisorAccess.name} to log in directly via mobile tablet or showroom terminals.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTempAccessConfig(prev => prev ? { ...prev, accessEnabled: !prev.accessEnabled } : null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs shrink-0 ${
                      tempAccessConfig.accessEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {tempAccessConfig.accessEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{tempAccessConfig.accessEnabled ? 'Connected (Enabled)' : 'Suspended (Disabled)'}</span>
                  </button>
                </div>

                {/* Access Tier Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                    Dashboard Access Tier:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        tier: 'Full SA Portal Access' as DashboardAccessTier,
                        label: 'Full SA Portal Access',
                        tag: 'Recommended • All Features',
                        desc: 'Unlocks complete frontline SA portal including stock payment status, bank LOU fast-track, customer pipeline lead claiming, and personal quota meters.'
                      },
                      {
                        tier: 'Lead & LOU Mobile Access' as DashboardAccessTier,
                        label: 'Lead & LOU Mobile Access',
                        tag: 'Mobile Operations Only',
                        desc: 'Focuses on customer pipeline lead claiming and bank LOU financing applications without floor stock payment controls.'
                      },
                      {
                        tier: 'Showroom Floor Access' as DashboardAccessTier,
                        label: 'Showroom Floor Access',
                        tag: 'Showroom Kiosk & Stock',
                        desc: 'Showroom floor stock allocation payment visibility and walk-in customer consultation logging.'
                      }
                    ].map(opt => {
                      const isSelected = tempAccessConfig.dashboardAccessLevel === opt.tier;
                      return (
                        <div
                          key={opt.tier}
                          onClick={() => {
                            const isFull = opt.tier === 'Full SA Portal Access';
                            setTempAccessConfig(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                dashboardAccessLevel: opt.tier,
                                privileges: {
                                  stockPaymentVisibility: isFull || opt.tier === 'Showroom Floor Access',
                                  bankLOUFastTrack: isFull || opt.tier === 'Lead & LOU Mobile Access',
                                  leadClaiming: isFull || opt.tier === 'Lead & LOU Mobile Access',
                                  quotaCommissionMeter: isFull
                                }
                              };
                            });
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                                {opt.label}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isSelected 
                                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-300' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans pl-5.5 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Frontline Privileges Matrix */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                      Frontline Privileges (Single Advisor Configuration):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTempAccessConfig(prev => prev ? {
                          ...prev,
                          privileges: {
                            stockPaymentVisibility: true,
                            bankLOUFastTrack: true,
                            leadClaiming: true,
                            quotaCommissionMeter: true
                          }
                        } : null);
                      }}
                      className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Enable All 4 Privileges
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* 1. Stock Payment Status Visibility */}
                    <div 
                      onClick={() => {
                        setTempAccessConfig(prev => prev ? {
                          ...prev,
                          privileges: {
                            ...prev.privileges,
                            stockPaymentVisibility: !prev.privileges.stockPaymentVisibility
                          }
                        } : null);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        tempAccessConfig.privileges.stockPaymentVisibility
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          tempAccessConfig.privileges.stockPaymentVisibility
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                        }`}>
                          <Car className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              1. Stock Payment Status Visibility
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                            Direct real-time visibility into <strong>In Stock</strong>, <strong>Stock Paid</strong>, and <strong>Not Yet Paid</strong> units in floor allocation queue.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          tempAccessConfig.privileges.stockPaymentVisibility
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tempAccessConfig.privileges.stockPaymentVisibility ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Bank LOU Fast-Track Status */}
                    <div 
                      onClick={() => {
                        setTempAccessConfig(prev => prev ? {
                          ...prev,
                          privileges: {
                            ...prev.privileges,
                            bankLOUFastTrack: !prev.privileges.bankLOUFastTrack
                          }
                        } : null);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        tempAccessConfig.privileges.bankLOUFastTrack
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          tempAccessConfig.privileges.bankLOUFastTrack
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                        }`}>
                          <FileCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              2. Bank LOU Fast-Track Status
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                            Submit and track financing letters of undertaking (LOU) with partner banks (Maybank, CIMB, Public Bank, HLB).
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          tempAccessConfig.privileges.bankLOUFastTrack
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tempAccessConfig.privileges.bankLOUFastTrack ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Customer Pipeline Lead Claiming */}
                    <div 
                      onClick={() => {
                        setTempAccessConfig(prev => prev ? {
                          ...prev,
                          privileges: {
                            ...prev.privileges,
                            leadClaiming: !prev.privileges.leadClaiming
                          }
                        } : null);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        tempAccessConfig.privileges.leadClaiming
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          tempAccessConfig.privileges.leadClaiming
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                        }`}>
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              3. Customer Pipeline Lead Claiming
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                            Instant mobile & desktop claiming for incoming test-drive bookings and showroom customer leads.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          tempAccessConfig.privileges.leadClaiming
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tempAccessConfig.privileges.leadClaiming ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* 4. Personal Quota & Commission Meter */}
                    <div 
                      onClick={() => {
                        setTempAccessConfig(prev => prev ? {
                          ...prev,
                          privileges: {
                            ...prev.privileges,
                            quotaCommissionMeter: !prev.privileges.quotaCommissionMeter
                          }
                        } : null);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        tempAccessConfig.privileges.quotaCommissionMeter
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          tempAccessConfig.privileges.quotaCommissionMeter
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                        }`}>
                          <Target className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              4. Personal Quota & Commission Meter
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                            Live target vs actual booking fulfillment meter, DMV customer deliveries, and progressive commission tracker.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          tempAccessConfig.privileges.quotaCommissionMeter
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tempAccessConfig.privileges.quotaCommissionMeter ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication (2FA) */}
                <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] block">
                      Two-Factor Authentication (2FA) Security
                    </span>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Require biometric or SMS OTP confirmation upon SA portal login.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempAccessConfig(prev => prev ? { ...prev, twoFactorAuth: !prev.twoFactorAuth } : null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                      tempAccessConfig.twoFactorAuth
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {tempAccessConfig.twoFactorAuth ? 'Enforced (Active)' : 'Optional'}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="coverage-modal-footer p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 flex items-center justify-between font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAdvisorAccess(null);
                    setTempAccessConfig(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAdvisorAccess}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Permissions</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: NETWORK-WIDE DASHBOARD ACCESS EXPANSION POLICY --- */}
      <AnimatePresence>
        {isNetworkPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="coverage-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
            >
              {/* Header */}
              <div className="coverage-modal-header p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Expand Sales Advisor Dashboard Access
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Role-based privileges across Ingress dealership network
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsNetworkPolicyModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Coverage Expansion Policy</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans text-emerald-900 dark:text-emerald-300">
                    By expanding access to Sales Advisors, advisors gain dedicated mobile and desktop access to live stock status, loan LOU approvals, and customer pipeline management to accelerate conversion turnaround.
                  </p>
                </div>

                {/* Permissions checklist */}
                <div className="space-y-2.5">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                    Enabled Frontline Privileges:
                  </h5>

                  <div className="coverage-inner-box p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/40 flex items-center gap-3 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Stock Payment Status Visibility</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">View real-time Paid vs Not Yet Paid floor stock for immediate handover</span>
                    </div>
                  </div>

                  <div className="coverage-inner-box p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/40 flex items-center gap-3 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Bank LOU Fast-Track Status</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Submit and track financing approvals directly with top participating banks</span>
                    </div>
                  </div>

                  <div className="coverage-inner-box p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/40 flex items-center gap-3 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Customer Pipeline Lead Claiming</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Claim incoming test drive leads and log consultation notes</span>
                    </div>
                  </div>

                  <div className="coverage-inner-box p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/40 flex items-center gap-3 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Personal Quota & Commission Meter</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">Live target vs actual booking fulfillment tracking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="coverage-modal-footer p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 flex items-center justify-between font-mono text-xs">
                <button
                  onClick={() => setIsNetworkPolicyModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleBulkEnableAccess}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant 100% Access to All SAs</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
