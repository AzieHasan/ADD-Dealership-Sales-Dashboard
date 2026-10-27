/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, ArrowRightLeft, Calendar, Building2, UserCheck, 
  Filter, RotateCcw, CheckCircle2, TrendingUp, Sparkles, DollarSign,
  Phone, Mail, Package, Award
} from 'lucide-react';
import { Dealership, DashboardFilterState } from '../types';
import { getCancellationReasonsForDealer } from '../data/mockData';

interface DealershipSelectorProps {
  dealerships: Dealership[];
  selectedId: string;
  onSelect: (id: string) => void;
  filters?: DashboardFilterState;
  onFilterChange?: (filters: DashboardFilterState) => void;
}

// Branch Representative Directory
const BRANCH_REPS: Record<string, { repName: string; role: string; phone: string; email: string }> = {
  'PUCHONG': { repName: 'Ahmad Razak', role: 'Branch Head & Sales Lead', phone: '+60 12-345 6789', email: 'ahmad.razak@puchong.dealer.my' },
  'IMC, BANDAR BARU BANGI': { repName: 'Siti Nurhaliza', role: 'Senior Branch Representative', phone: '+60 13-987 6543', email: 'siti.n@bangi.dealer.my' },
  'SHAH ALAM': { repName: 'Jason Tan', role: 'Shah Alam Operations Lead', phone: '+60 16-234 5678', email: 'jason.tan@shahalam.dealer.my' },
  'The Curve': { repName: 'Farah Lee', role: 'Branch Lead Representative', phone: '+60 17-555 4321', email: 'farah.lee@thecurve.dealer.my' },
  'MUTIARA DAMANSARA': { repName: 'Chong Wei', role: 'Mutiara Senior Sales Rep', phone: '+60 19-888 1234', email: 'chong.wei@mutiara.dealer.my' },
  'BANDAR BARU BANGI': { repName: 'Kamal Vance', role: 'EV Specialist & Branch Head', phone: '+60 11-7777 999', email: 'kamal.vance@emas.dealer.my' },
  'PROTON e.MAS, BANDAR BARU BANGI': { repName: 'Kamal Vance', role: 'EV Specialist & Branch Head', phone: '+60 11-7777 999', email: 'kamal.vance@emas.dealer.my' }
};

// Dealership Branch Tree Map
const DEALER_BRANCH_MAP: Record<string, string[]> = {
  'all': ['All Branches', 'PUCHONG', 'IMC, BANDAR BARU BANGI', 'SHAH ALAM', 'The Curve', 'MUTIARA DAMANSARA', 'BANDAR BARU BANGI'],
  'dt-porsche': ['All Branches', 'PUCHONG', 'IMC, BANDAR BARU BANGI', 'SHAH ALAM'],
  'ns-audi': ['All Branches', 'The Curve', 'MUTIARA DAMANSARA'],
  'ws-bmw': ['All Branches', 'BANDAR BARU BANGI']
};

export function DealershipSelector({ dealerships, selectedId, onSelect, filters, onFilterChange }: DealershipSelectorProps) {
  // Fallback internal filter state if parent doesn't provide
  const [internalFilters, setInternalFilters] = useState<DashboardFilterState>({
    financialYear: 'FY 2026',
    timePeriodType: 'Monthly',
    selectedDay: 'Today (Aug 07)',
    selectedWeek: 'Week 1 (Aug 01 - 07)',
    selectedMonth: 'August',
    selectedQuarter: 'Q3 (Jul - Sep)',
    selectedBranch: 'All Branches'
  });

  const activeFilters = filters || internalFilters;

  const updateFilter = <K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]) => {
    const updated = { ...activeFilters, [key]: value };
    if (onFilterChange) {
      onFilterChange(updated);
    }
    setInternalFilters(updated);
  };

  const financialYear = activeFilters.financialYear;
  const timePeriodType = activeFilters.timePeriodType;
  const selectedDay = activeFilters.selectedDay;
  const selectedWeek = activeFilters.selectedWeek;
  const selectedMonth = activeFilters.selectedMonth;
  const selectedQuarter = activeFilters.selectedQuarter;
  const selectedBranch = activeFilters.selectedBranch;

  // Handle Dealership selection change
  const handleDealershipChange = (newDealerId: string) => {
    onSelect(newDealerId);
    // Reset branch selection if current branch is not in the new dealer's list
    const validBranches = DEALER_BRANCH_MAP[newDealerId] || DEALER_BRANCH_MAP['all'];
    if (!validBranches.includes(selectedBranch)) {
      updateFilter('selectedBranch', 'All Branches');
    }
  };

  // Reset all search filters to default
  const handleResetFilters = () => {
    const defaultFilters: DashboardFilterState = {
      financialYear: 'FY 2026',
      timePeriodType: 'Monthly',
      selectedDay: 'Today (Aug 07)',
      selectedWeek: 'Week 1 (Aug 01 - 07)',
      selectedMonth: 'August',
      selectedQuarter: 'Q3 (Jul - Sep)',
      selectedBranch: 'All Branches'
    };
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
    setInternalFilters(defaultFilters);
    onSelect('all');
  };

  // Active dealer object
  const currentDealer = dealerships.find(d => d.id === selectedId) || dealerships[0];
  const isAll = selectedId === 'all';
  const availableBranches = DEALER_BRANCH_MAP[selectedId] || DEALER_BRANCH_MAP['all'];
  const activeBranchRep = selectedBranch !== 'All Branches' ? BRANCH_REPS[selectedBranch] : null;

  // Branch volume multiplier logic for realistic branch metric calculations
  const getBranchMultiplier = (branch: string) => {
    if (branch === 'All Branches') return 1.0;
    if (branch === 'PUCHONG') return 0.42;
    if (branch === 'IMC, BANDAR BARU BANGI') return 0.35;
    if (branch === 'SHAH ALAM') return 0.23;
    if (branch === 'The Curve') return 0.55;
    if (branch === 'MUTIARA DAMANSARA') return 0.45;
    if (branch === 'PROTON e.MAS, BANDAR BARU BANGI' || branch === 'BANDAR BARU BANGI') return 1.0;
    return 1.0;
  };

  // Time scope volume multiplier for realistic metric adjustment
  const getTimePeriodMultiplier = () => {
    switch (timePeriodType) {
      case 'Daily': return 0.05;
      case 'Accumulative Weekly': return 0.25;
      case 'Month to Day (MTD)': return 0.23;
      case 'Monthly': return 1.0;
      case 'Quarterly': return 3.0;
      case 'Year to Day (YTD)': return 7.0;
      case 'Full Year Scope': return 12.0;
      default: return 1.0;
    }
  };

  // Financial Year multiplier logic
  const getFYMultiplier = (fy: string) => {
    if (fy === 'FY 2026') return 1.0;
    if (fy === 'FY 2025') return 0.92;
    if (fy === 'FY 2024') return 0.85;
    if (fy === 'FY 2023') return 0.78;
    return 1.0;
  };

  const branchMult = getBranchMultiplier(selectedBranch);
  const timeMult = getTimePeriodMultiplier();
  const fyMult = getFYMultiplier(financialYear);
  const combinedMult = branchMult * timeMult * fyMult;

  // Compute Data Summary Metrics for Selected Dealership
  const summaryBookings = Math.max(1, Math.round(currentDealer.bookings * combinedMult));
  const cancellationReasons = getCancellationReasonsForDealer(selectedId, combinedMult);
  const summaryDroppedBookings = cancellationReasons.reduce((sum, r) => sum + r.count, 0);
  const summaryTarget = Math.max(1, Math.round(currentDealer.targetBookings * combinedMult));
  const summaryRegistrations = Math.max(1, Math.round(currentDealer.registrations * combinedMult));
  const summaryRevenue = Math.max(1000, Math.round(currentDealer.revenue * combinedMult));
  const summaryConversionRate = currentDealer.conversionRate;
  const summaryTargetAchievement = Math.round((summaryBookings / (summaryTarget || 1)) * 100);
  const summaryDroppedRate = Math.round((summaryDroppedBookings / (summaryBookings + summaryDroppedBookings || 1)) * 100 * 10) / 10;
  const summarySalesReps = selectedBranch !== 'All Branches' ? 8 : currentDealer.activeSalesReps;

  // Format label for data summary header badge
  const getPeriodBadgeLabel = () => {
    if (timePeriodType === 'Daily') return selectedDay;
    if (timePeriodType === 'Accumulative Weekly') return selectedWeek;
    if (timePeriodType === 'Month to Day (MTD)') return 'MTD (Aug 01 - Aug 07)';
    if (timePeriodType === 'Monthly') return selectedMonth;
    if (timePeriodType === 'Quarterly') return selectedQuarter;
    if (timePeriodType === 'Year to Day (YTD)') return 'YTD (Jan 01 - Aug 07)';
    return 'Full FY 2026';
  };

  // Format currency in RM
  const formatCurrency = (val: number) => `RM ${Math.round(val).toLocaleString('en-MY')}`;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md space-y-4" id="guide-dealership-selector">
      {/* Header: ACTIVE DEALERS FILTER */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5 font-bold">
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" /> ACTIVE DEALERS FILTER
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset all search filters"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Filters</span>
          </button>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {dealerships.length - 1} Franchises Online
          </span>
        </div>
      </div>

      {/* SEARCH FILTERS SECTION directly below "ACTIVE DEALERS FILTER" */}
      <div id="guide-filter-toolbar" className="bg-slate-950/70 border border-slate-850 rounded-xl p-3 sm:p-4 shadow-inner space-y-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 font-bold tracking-wide uppercase">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filter Parameters: Financial Year, Time Period, Dealership & Branch</span>
        </div>

        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Financial Year */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => updateFilter('financialYear', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="FY 2026">FY 2026 (Current)</option>
              <option value="FY 2025">FY 2025</option>
              <option value="FY 2024">FY 2024</option>
              <option value="FY 2023">FY 2023</option>
            </select>
          </div>

          {/* 2. Time Frequency Scope */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" /> Time Scope
            </label>
            <select
              value={timePeriodType}
              onChange={(e) => updateFilter('timePeriodType', e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="Daily">Daily</option>
              <option value="Accumulative Weekly">Accumulative Weekly</option>
              <option value="Month to Day (MTD)">Month to Day (MTD)</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Year to Day (YTD)">Year to Day (YTD)</option>
              <option value="Full Year Scope">Full Year Scope</option>
            </select>
          </div>

          {/* 3. Sub-period Selector (Daily, Weekly, MTD, Monthly, Quarterly, YTD, Full Year) */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              {timePeriodType === 'Daily' 
                ? 'Day Selection' 
                : timePeriodType === 'Accumulative Weekly' 
                ? 'Week Range' 
                : timePeriodType === 'Monthly' 
                ? 'Month Selection' 
                : timePeriodType === 'Quarterly' 
                ? 'Quarter Selection' 
                : 'Period Range'}
            </label>
            {timePeriodType === 'Daily' ? (
              <select
                value={selectedDay}
                onChange={(e) => updateFilter('selectedDay', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Today (Aug 07)">Today (Aug 07)</option>
                <option value="Yesterday (Aug 06)">Yesterday (Aug 06)</option>
                <option value="Aug 05">Aug 05</option>
                <option value="Aug 04">Aug 04</option>
                <option value="Aug 03">Aug 03</option>
                <option value="Aug 02">Aug 02</option>
                <option value="Aug 01">Aug 01</option>
              </select>
            ) : timePeriodType === 'Accumulative Weekly' ? (
              <select
                value={selectedWeek}
                onChange={(e) => updateFilter('selectedWeek', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Week 1 (Aug 01 - 07)">Week 1 (Aug 01 - 07)</option>
                <option value="Week 2 (Aug 08 - 14)">Week 2 (Aug 08 - 14)</option>
                <option value="Week 3 (Aug 15 - 21)">Week 3 (Aug 15 - 21)</option>
                <option value="Week 4 (Aug 22 - 28)">Week 4 (Aug 22 - 28)</option>
                <option value="Accumulative All Weeks">Accumulative All Weeks</option>
              </select>
            ) : timePeriodType === 'Month to Day (MTD)' ? (
              <div className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs font-semibold">
                MTD: Aug 01 - Aug 07
              </div>
            ) : timePeriodType === 'Monthly' ? (
              <select
                value={selectedMonth}
                onChange={(e) => updateFilter('selectedMonth', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="All Months">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            ) : timePeriodType === 'Quarterly' ? (
              <select
                value={selectedQuarter}
                onChange={(e) => updateFilter('selectedQuarter', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="All Quarters">All Quarters</option>
                <option value="Q1 (Jan - Mar)">Q1 (Jan - Mar)</option>
                <option value="Q2 (Apr - Jun)">Q2 (Apr - Jun)</option>
                <option value="Q3 (Jul - Sep)">Q3 (Jul - Sep)</option>
                <option value="Q4 (Oct - Dec)">Q4 (Oct - Dec)</option>
              </select>
            ) : timePeriodType === 'Year to Day (YTD)' ? (
              <div className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs font-semibold">
                YTD: Jan 01 - Aug 07
              </div>
            ) : (
              <div className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 font-mono text-xs italic">
                Full 12-Month Period
              </div>
            )}
          </div>

          {/* 4. Dealership Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-400" /> Dealership
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleDealershipChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Dealership (Consolidated)</option>
              <option value="dt-porsche">Mitsubishi (Ingress Motors Centre Sdn. Bhd.)</option>
              <option value="ns-audi">PERODUA (Ingress Motors Centre Sdn. Bhd.)</option>
              <option value="ws-bmw">PROTON e.MAS (Ingress Auto Sdn. Bhd.)</option>
            </select>
          </div>

          {/* 5. Representative Branch Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> Representative Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => updateFilter('selectedBranch', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {availableBranches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Dealership Shortcut Cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {dealerships.map((dealer) => {
          const isSelected = selectedId === dealer.id;
          const isAllDealer = dealer.id === 'all';

          return (
            <button
              key={dealer.id}
              onClick={() => handleDealershipChange(dealer.id)}
              className={`flex-shrink-0 text-left p-3 rounded-xl border transition-all duration-200 select-none relative overflow-hidden min-w-[150px] sm:min-w-[170px] cursor-pointer ${
                isSelected
                  ? 'bg-slate-850/80 border-indigo-500/80 shadow-[0_0_12px_-4px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/30 hover:border-slate-700/80'
              }`}
            >
              {/* Highlight bar inside card */}
              {isSelected && (
                <motion.div
                  layoutId="activeGlowBorder"
                  className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-400 to-indigo-600"
                />
              )}

              <div className="flex justify-between items-start mb-1">
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                  isAllDealer 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-950/20' 
                    : 'bg-slate-850/80 text-slate-400'
                }`}>
                  {isAllDealer ? 'Aggregate' : dealer.brand}
                </span>

                <span className={`w-1.5 h-1.5 rounded-full ${
                  dealer.status === 'optimal' ? 'bg-emerald-500' :
                  dealer.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
              </div>

              <h5 className="text-xs font-semibold text-slate-200 truncate pr-2">
                {dealer.name}
              </h5>

              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono">
                <MapPin className="w-3 h-3 flex-shrink-0 text-slate-600" />
                <span className="truncate">{dealer.location}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Consolidated Bookings</span>
                  <span className="text-slate-100 font-bold text-xs">{dealer.bookings + dealer.cancellations}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Conv Rate</span>
                  <span className="text-emerald-400 font-bold text-xs">{dealer.conversionRate}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

