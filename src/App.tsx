/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Calendar, DollarSign, Award, TrendingUp, AlertTriangle, 
  UserCheck, CheckSquare, Smartphone, Monitor, Clock, Play, Pause, Plus, Sparkles,
  Sun, Moon, ChevronsLeft, LogOut, User as UserIcon, BookOpen, Compass, HelpCircle,
  FileSpreadsheet, Download
} from 'lucide-react';

import { 
  INITIAL_DEALERSHIPS, HOURLY_TRENDS, CONVERSION_FUNNEL, CANCELLATION_REASONS, 
  getCancellationReasonsForDealer, getConversionFunnelForDealer, INITIAL_EVENTS, 
  RECENT_MODELS, CUSTOMERS_MOCK, getModelStockForDealer, getTopBanksLOUForDealer,
  getSalesAdvisorsForDealer
} from './data/mockData';
import { BookingEvent, Dealership, DashboardFilterState } from './types';
import { MetricCard } from './components/MetricCard';
import { TrendAreaChart, ConversionFunnelChart, DealershipComparisonChart, CancellationDoughnutChart } from './components/CustomCharts';
import { DealershipSelector } from './components/DealershipSelector';
import { LiveFeed } from './components/LiveFeed';
import { TopBanksLOU } from './components/TopBanksLOU';
import { DealershipDetails } from './components/DealershipDetails';
import { BudgetVsActualPopularity, CAR_TREE, getMonthlyBudgetVsActual, mapDealerName } from './components/BudgetVsActualPopularity';
import { SalesAdvisorCoverage } from './components/SalesAdvisorCoverage';
import { IngressLogo } from './components/IngressLogo';
import { LoginPage } from './components/LoginPage';
import { AutoGuide } from './components/AutoGuide';
import { DashboardHandbook } from './components/DashboardHandbook';
import { ExcelExportModal } from './components/ExcelExportModal';
import { MasterExportPayload } from './utils/excelExport';

export default function App() {
  // --- STATE DECLARATIONS ---
  const [dealerships, setDealerships] = useState<Dealership[]>(INITIAL_DEALERSHIPS);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('all');
  const [filters, setFilters] = useState<DashboardFilterState>({
    financialYear: 'FY 2026',
    timePeriodType: 'Monthly',
    selectedDay: 'Today (Aug 07)',
    selectedWeek: 'Week 1 (Aug 01 - 07)',
    selectedMonth: 'August',
    selectedQuarter: 'Q3 (Jul - Sep)',
    selectedBranch: 'All Branches'
  });
  const [events, setEvents] = useState<BookingEvent[]>(INITIAL_EVENTS);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile'>('responsive');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ingress-dashboard-theme') : null;
    return saved === 'dark' ? 'dark' : 'light'; // Default is light mode
  });

  // --- AUTO GUIDE & HANDBOOK STATE ---
  const [isGuideActive, setIsGuideActive] = useState<boolean>(false);
  const [guideInitialTarget, setGuideInitialTarget] = useState<string | undefined>(undefined);
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);
  const [handbookInitialTab, setHandbookInitialTab] = useState<string | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // --- AUTHENTICATION STATE ---
  // Default Credentials: Staff ID: Admin01, Password: Ingcorp@123
  const [currentUser, setCurrentUser] = useState<{ staffId: string; name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedLocal = localStorage.getItem('ingress_auth_user');
      if (savedLocal) {
        try {
          return JSON.parse(savedLocal);
        } catch {
          // ignore corrupted data
        }
      }
      const savedSession = sessionStorage.getItem('ingress_auth_user');
      if (savedSession) {
        try {
          return JSON.parse(savedSession);
        } catch {
          // ignore corrupted data
        }
      }
    }
    return null;
  });

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ingress_auth_user');
      sessionStorage.removeItem('ingress_auth_user');
    }
    setCurrentUser(null);
  };

  // --- THEME SYNC ---
  useEffect(() => {
    localStorage.setItem('ingress-dashboard-theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);
  
  // Real-time animated sparkline history records
  const [sparklineHistories, setSparklineHistories] = useState({
    bookings: [65, 70, 74, 80, 84, 88, 90, 93],
    cancellations: [4, 5, 6, 7, 7, 8, 8, 9],
    conversions: [25.0, 25.5, 25.8, 26.2, 26.5, 26.8, 27.0, 27.2],
    registrations: [42, 46, 50, 54, 58, 60, 62, 64],
    revenue: [5800000, 6000000, 6200000, 6400000, 6600000, 6750000, 6880000, 6992500]
  });

  // --- UTC REAL-TIME CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      triggerRandomEvent();
    }, 5500); // Trigger a random event every 5.5 seconds for active real-time feedback

    return () => clearInterval(interval);
  }, [isSimulating]);

  const triggerRandomEvent = () => {
    const eventTypes: ('booking' | 'cancellation' | 'registration' | 'conversion')[] = [
      'booking', 'booking', 'registration', 'cancellation', 'conversion', 'booking', 'registration'
    ];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Pick random brand/model
    const brandIndex = Math.floor(Math.random() * RECENT_MODELS.length);
    const brandGroup = RECENT_MODELS[brandIndex];
    const model = brandGroup.models[Math.floor(Math.random() * brandGroup.models.length)];
    
    // Map brand to dealership ID
    const brandToDealerMap: { [key: string]: string } = {
      'Mitsubishi': 'dt-porsche',
      'PERODUA': 'ns-audi',
      'PROTON e.MAS': 'ws-bmw'
    };
    const dealerId = brandToDealerMap[brandGroup.brand] || 'dt-porsche';
    const customer = CUSTOMERS_MOCK[Math.floor(Math.random() * CUSTOMERS_MOCK.length)];
    
    const value = randomType === 'cancellation' 
      ? Math.round(55000 + Math.random() * 70000)
      : Math.round(42000 + Math.random() * 190000);

    const getRandomCancellationDetails = () => {
      const reason = CANCELLATION_REASONS[Math.floor(Math.random() * CANCELLATION_REASONS.length)];
      const categoryTag = reason.category === 'rejection' ? '[Rejection]' : '[Cancellation]';
      return `${categoryTag} ${reason.reason} (#${reason.keyword})`;
    };

    const detailsMap = {
      booking: 'Showroom deposit verified & locked',
      cancellation: getRandomCancellationDetails(),
      registration: 'County DMV registry authenticated',
      conversion: 'Digital showroom prospect converted'
    };

    const newEvent: BookingEvent = {
      id: `evt-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date(),
      dealershipId: dealerId,
      dealershipName: INITIAL_DEALERSHIPS.find(d => d.id === dealerId)?.name || 'Dealership',
      type: randomType,
      model,
      value,
      customerName: customer,
      details: detailsMap[randomType]
    };

    // Update dealerships in State
    setDealerships(prevDealers => {
      // Step 1: Update individual physical dealer
      const updatedPhysical = prevDealers.map(dealer => {
        if (dealer.id === dealerId && dealer.id !== 'all') {
          let bookings = dealer.bookings;
          let cancellations = dealer.cancellations;
          let registrations = dealer.registrations;
          let revenue = dealer.revenue;
          let conversionRate = dealer.conversionRate;

          if (randomType === 'booking') {
            bookings += 1;
            revenue += value;
            conversionRate = Math.min(99.2, Number((conversionRate + 0.15).toFixed(1)));
          } else if (randomType === 'cancellation') {
            cancellations += 1;
            revenue = Math.max(0, revenue - value);
            conversionRate = Math.max(10, Number((conversionRate - 0.25).toFixed(1)));
          } else if (randomType === 'registration') {
            registrations += 1;
          } else if (randomType === 'conversion') {
            conversionRate = Math.min(99.2, Number((conversionRate + 0.35).toFixed(1)));
          }

          return {
            ...dealer,
            bookings,
            cancellations,
            registrations,
            revenue,
            conversionRate
          };
        }
        return dealer;
      });

      // Step 2: Compute aggregate summary total from Mitsubishi, PERODUA, and PROTON e.MAS
      const physicalList = updatedPhysical.filter(d => d.id !== 'all');
      const totBookings = physicalList.reduce((sum, d) => sum + d.bookings, 0);
      const totCancellations = physicalList.reduce((sum, d) => sum + d.cancellations, 0);
      const totRegistrations = physicalList.reduce((sum, d) => sum + d.registrations, 0);
      const totTargetBookings = physicalList.reduce((sum, d) => sum + d.targetBookings, 0);
      const totRevenue = physicalList.reduce((sum, d) => sum + d.revenue, 0);
      const totSalesReps = physicalList.reduce((sum, d) => sum + d.activeSalesReps, 0);
      const avgConversion = Number((physicalList.reduce((sum, d) => sum + (d.conversionRate * d.bookings), 0) / (totBookings || 1)).toFixed(1));

      const updated = updatedPhysical.map(dealer => {
        if (dealer.id === 'all') {
          return {
            ...dealer,
            bookings: totBookings,
            cancellations: totCancellations,
            registrations: totRegistrations,
            targetBookings: totTargetBookings,
            revenue: totRevenue,
            activeSalesReps: totSalesReps,
            conversionRate: avgConversion
          };
        }
        return dealer;
      });

      // Update sparkline crawling charts based on aggregate stats
      const aggregate = updated.find(d => d.id === 'all');
      if (aggregate) {
        setSparklineHistories(prev => ({
          bookings: [...prev.bookings.slice(1), aggregate.bookings],
          cancellations: [...prev.cancellations.slice(1), aggregate.cancellations],
          conversions: [...prev.conversions.slice(1), aggregate.conversionRate],
          registrations: [...prev.registrations.slice(1), aggregate.registrations],
          revenue: [...prev.revenue.slice(1), aggregate.revenue]
        }));
      }

      return updated;
    });

    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  // Helper currency formatter (Ringgit Malaysia - RM)
  const formatCurrency = (val: number) => {
    return `RM ${Math.round(val).toLocaleString('en-MY')}`;
  };

  const getPreviousMonthName = (monthName: string): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (idx === -1) return 'July';
    const prevIdx = (idx - 1 + 12) % 12;
    return months[prevIdx];
  };

  // Multiplier calculations based on active search filters
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

  const getTimePeriodMultiplier = (type: string, filterState: DashboardFilterState) => {
    switch (type) {
      case 'Daily': {
        const day = filterState.selectedDay;
        if (day.includes('Yesterday')) return 0.046;
        if (day.includes('Aug 05')) return 0.052;
        if (day.includes('Aug 04')) return 0.044;
        if (day.includes('Aug 03')) return 0.048;
        if (day.includes('Aug 02')) return 0.042;
        if (day.includes('Aug 01')) return 0.054;
        return 0.05; // Today (Aug 07)
      }
      case 'Accumulative Weekly': {
        const wk = filterState.selectedWeek;
        if (wk.includes('Week 2')) return 0.24;
        if (wk.includes('Week 3')) return 0.26;
        if (wk.includes('Week 4')) return 0.25;
        if (wk.includes('Accumulative All Weeks')) return 1.0;
        return 0.25; // Week 1
      }
      case 'Month to Day (MTD)': return 0.23;
      case 'Monthly': {
        const m = filterState.selectedMonth;
        if (m === 'All Months') return 12.0;
        if (m === 'January') return 0.85;
        if (m === 'February') return 0.79;
        if (m === 'March') return 0.90;
        if (m === 'April') return 0.84;
        if (m === 'May') return 0.96;
        if (m === 'June') return 0.88;
        if (m === 'July') return 0.94;
        if (m === 'August') return 1.0; // Default current month
        if (m === 'September') return 1.05;
        if (m === 'October') return 1.10;
        if (m === 'November') return 1.08;
        if (m === 'December') return 1.16;
        return 1.0;
      }
      case 'Quarterly': {
        const q = filterState.selectedQuarter;
        if (q.includes('Q1')) return 2.54;
        if (q.includes('Q2')) return 2.68;
        if (q.includes('Q3')) return 3.15;
        if (q.includes('Q4')) return 3.34;
        if (q === 'All Quarters') return 12.0;
        return 3.0;
      }
      case 'Year to Day (YTD)': return 7.15;
      case 'Full Year Scope': return 12.0;
      default: return 1.0;
    }
  };

  const getFYMultiplier = (fy: string) => {
    if (fy === 'FY 2026') return 1.0;
    if (fy === 'FY 2025') return 0.92;
    if (fy === 'FY 2024') return 0.85;
    if (fy === 'FY 2023') return 0.78;
    return 1.0;
  };

  const branchMult = getBranchMultiplier(filters.selectedBranch);
  const timeMult = getTimePeriodMultiplier(filters.timePeriodType, filters);
  const fyMult = getFYMultiplier(filters.financialYear);
  const combinedMult = branchMult * timeMult * fyMult;

  // Filtered dealerships with reactive values based on selected filters
  const filteredDealerships = dealerships.map(d => {
    const scaledBookings = Math.max(1, Math.round(d.bookings * combinedMult));
    const dealerReasons = getCancellationReasonsForDealer(d.id, combinedMult);
    const scaledCancellations = dealerReasons.reduce((sum, r) => sum + r.count, 0);
    const scaledRegistrations = Math.max(1, Math.round(d.registrations * combinedMult));
    const scaledTarget = Math.max(1, Math.round(d.targetBookings * combinedMult));
    const scaledRevenue = Math.max(1000, Math.round(d.revenue * combinedMult));
    const scaledReps = filters.selectedBranch !== 'All Branches' ? 8 : d.activeSalesReps;

    return {
      ...d,
      bookings: scaledBookings,
      cancellations: scaledCancellations,
      registrations: scaledRegistrations,
      targetBookings: scaledTarget,
      revenue: scaledRevenue,
      activeSalesReps: scaledReps
    };
  });

  // Find active statistics
  const currentDealer = filteredDealerships.find(d => d.id === selectedDealerId) || filteredDealerships[0];
  const aggregateDealer = filteredDealerships.find(d => d.id === 'all') || filteredDealerships[0];

  // Helper label for active period sub-selection
  const getPeriodLabel = () => {
    if (filters.timePeriodType === 'Daily') return filters.selectedDay;
    if (filters.timePeriodType === 'Accumulative Weekly') return filters.selectedWeek;
    if (filters.timePeriodType === 'Month to Day (MTD)') return 'MTD (Aug 01 - Aug 07)';
    if (filters.timePeriodType === 'Monthly') return filters.selectedMonth;
    if (filters.timePeriodType === 'Quarterly') return filters.selectedQuarter;
    if (filters.timePeriodType === 'Year to Day (YTD)') return 'YTD (Jan 01 - Aug 07)';
    return 'Full Year Scope';
  };

  // Percentages, dynamic rates and Month-over-Month (Current Month vs Last Month) comparisons
  const globalConversionRate = aggregateDealer.conversionRate;
  const targetProgressPercent = Math.round((aggregateDealer.bookings / aggregateDealer.targetBookings) * 100);

  const currentMonthName = filters.selectedMonth;
  const lastMonthName = getPreviousMonthName(currentMonthName);

  const momRevenueChange = currentDealer.id === 'all' ? 11.8 : 5.4;
  const momBookingsChange = currentDealer.id === 'all' ? 12.4 : 8.1;
  const momCancellationsChange = currentDealer.id === 'all' ? -4.1 : -14.2;
  const momConversionChange = 0.8;
  const momRegistrationsChange = 6.2;

  const lastMonthRevenue = Math.round(currentDealer.revenue / (1 + momRevenueChange / 100));
  const lastMonthBookings = Math.max(0, Math.round(currentDealer.bookings / (1 + momBookingsChange / 100)));
  const lastMonthCancellations = Math.max(0, Math.round(currentDealer.cancellations / (1 + momCancellationsChange / 100)));
  const lastMonthConversion = Math.max(0, Number((currentDealer.conversionRate - momConversionChange).toFixed(1)));
  const lastMonthRegistrations = Math.max(0, Math.round(currentDealer.registrations / (1 + momRegistrationsChange / 100)));

  // Format Date and Time for Header
  const formattedDate = currentTime.toLocaleDateString('en-MY', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  });

  // --- MANUAL INJECTION FUNCTION ---
  const handleManualInject = () => {
    triggerRandomEvent();
  };

  // --- MASTER EXCEL EXPORT DATA ASSEMBLY ---
  const calculatedRejectedLOU = Math.max(0, (currentDealer.bookings) - currentDealer.registrations);
  const topBanksForExport = getTopBanksLOUForDealer(
    selectedDealerId,
    2026,
    'all',
    currentDealer.registrations,
    combinedMult,
    calculatedRejectedLOU
  );
  const conversionFunnelForExport = getConversionFunnelForDealer(selectedDealerId, 2026, 7, combinedMult);
  const cancellationReasonsForExport = getCancellationReasonsForDealer(selectedDealerId, combinedMult);
  const modelStockForExport = getModelStockForDealer(selectedDealerId);
  const mappedDealerNameForExport = mapDealerName(currentDealer.name || currentDealer.id);
  const budgetVsActualForExport = getMonthlyBudgetVsActual(
    mappedDealerNameForExport,
    filters.selectedBranch,
    'All Models',
    'All Variants'
  );

  const siblingModelsForExport = Object.keys(CAR_TREE[mappedDealerNameForExport]?.models || {}).filter(m => m !== 'All Models');
  let overallVolumeForExport = 0;
  const modelRankingsForExport = siblingModelsForExport.map(model => {
    const firstVariant = CAR_TREE[mappedDealerNameForExport]?.models[model]?.[0] || 'All Variants';
    const monthlyVals = getMonthlyBudgetVsActual(mappedDealerNameForExport, filters.selectedBranch, model, firstVariant);
    const sumVal = monthlyVals.reduce((acc, v) => acc + v.actual, 0);
    overallVolumeForExport += sumVal;
    return {
      model,
      brand: currentDealer.brand,
      sales: sumVal
    };
  }).sort((a, b) => b.sales - a.sales).map(item => ({
    model: item.model,
    brand: currentDealer.brand,
    bookings: item.sales,
    registrations: Math.round(item.sales * 0.72),
    cancellations: Math.round(item.sales * 0.12),
    share: overallVolumeForExport > 0 ? Number(((item.sales / overallVolumeForExport) * 100).toFixed(1)) : 0
  }));

  const excelExportPayload: MasterExportPayload = {
    currentDealer,
    allDealerships: dealerships,
    filters,
    events,
    budgetVsActual: budgetVsActualForExport,
    modelRankings: modelRankingsForExport,
    modelStock: modelStockForExport,
    topBanks: topBanksForExport,
    conversionFunnel: conversionFunnelForExport,
    cancellationReasons: cancellationReasonsForExport,
    momData: {
      revenueChange: momRevenueChange,
      bookingsChange: momBookingsChange,
      cancellationsChange: momCancellationsChange,
      conversionChange: momConversionChange,
      registrationsChange: momRegistrationsChange,
      lastMonthRevenue,
      lastMonthBookings,
      lastMonthCancellations,
      lastMonthConversion,
      lastMonthRegistrations
    }
  };

  // --- COMPONENT SHELL RENDER ---
  const renderDashboardContent = () => (
    <div className="flex flex-col gap-5 text-slate-200">
      

      {/* 2. Interactive Dealership Row Selector */}
      <DealershipSelector
        dealerships={filteredDealerships}
        selectedId={selectedDealerId}
        onSelect={setSelectedDealerId}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Month-over-Month (Current Month vs Last Month) Comparative Bar */}
      <div 
        id="mom-comparative-bar"
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-indigo-500/30 rounded-2xl p-3.5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">MoM Trend Analysis:</span>
          <span className="text-cyan-800 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/80 px-2.5 py-1 rounded-md text-[11px] shadow-sm">
            Current Month: {currentMonthName}
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs</span>
          <span className="text-indigo-800 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 px-2.5 py-1 rounded-md text-[11px] shadow-sm">
            Last Month: {lastMonthName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Revenue:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{momRevenueChange}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Bookings:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{momBookingsChange}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Registrations:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{momRegistrationsChange}%</span>
          </div>

          {/* Quick Excel Export button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            title="Export MoM trends and all dashboard reports to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="font-extrabold">Export Excel</span>
          </button>
        </div>
      </div>

      {/* 3. Real-Time Dynamic Metrics Bento Grid */}
      <div id="guide-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Metric 1: Revenue */}
        <MetricCard
          title="Revenue"
          value={formatCurrency(currentDealer.revenue)}
          previousValue={formatCurrency(lastMonthRevenue)}
          change={momRevenueChange}
          changeLabel={`vs Last Month (${lastMonthName})`}
          color="amber"
          icon={<DollarSign className="w-4.5 h-4.5 text-amber-400" />}
          sparklineData={
            (selectedDealerId === 'all' ? sparklineHistories.revenue : [
              lastMonthRevenue * 0.92,
              lastMonthRevenue * 0.95,
              lastMonthRevenue,
              currentDealer.revenue * 0.92,
              currentDealer.revenue * 0.95,
              currentDealer.revenue * 0.98,
              currentDealer.revenue
            ]).map(v => Math.max(1000, Math.round(v * combinedMult)))
          }
        />

        {/* Metric 2: Bookings */}
        <MetricCard
          title={`${currentDealer.id === 'all' ? 'Consolidated' : currentDealer.brand} Bookings`}
          value={currentDealer.bookings + currentDealer.cancellations}
          previousValue={`${lastMonthBookings + lastMonthCancellations} units`}
          change={momBookingsChange}
          changeLabel={`vs Last Month (${lastMonthName})`}
          color="cyan"
          icon={<Sparkles className="w-4.5 h-4.5 text-cyan-400" />}
          sparklineData={
            (selectedDealerId === 'all' 
              ? sparklineHistories.bookings.map((b, idx) => b + (sparklineHistories.cancellations[idx] || 0)) 
              : [
                  lastMonthBookings + lastMonthCancellations, 
                  Math.round(((lastMonthBookings + lastMonthCancellations) + (currentDealer.bookings + currentDealer.cancellations)) / 2), 
                  currentDealer.bookings + currentDealer.cancellations
                ]
            ).map(v => Math.max(1, Math.round(v * combinedMult)))
          }
        />

        {/* Metric 3: Dropped Bookings */}
        <MetricCard
          title="Dropped Bookings"
          value={currentDealer.cancellations}
          previousValue={`${lastMonthCancellations} units`}
          change={momCancellationsChange}
          changeLabel={`vs Last Month (${lastMonthName})`}
          color="rose"
          icon={<AlertTriangle className="w-4.5 h-4.5 text-rose-400" />}
          sparklineData={
            (selectedDealerId === 'all' ? sparklineHistories.cancellations : [lastMonthCancellations, Math.round((lastMonthCancellations + currentDealer.cancellations)/2), currentDealer.cancellations]).map(v => Math.max(0, Math.round(v * combinedMult)))
          }
          isAlert={currentDealer.cancellations > 4 && currentDealer.id !== 'dt-porsche'}
        />

        {/* Metric 4: Conversion Rate */}
        <MetricCard
          title="Conversion Efficiency"
          value={`${currentDealer.conversionRate}%`}
          previousValue={`${lastMonthConversion}%`}
          change={momConversionChange}
          changeLabel={`vs Last Month (${lastMonthName})`}
          color="emerald"
          icon={<UserCheck className="w-4.5 h-4.5 text-emerald-400" />}
          sparklineData={selectedDealerId === 'all' ? sparklineHistories.conversions : [lastMonthConversion, Number(((lastMonthConversion + currentDealer.conversionRate)/2).toFixed(1)), currentDealer.conversionRate]}
        />

        {/* Metric 5: DMV Registrations */}
        <MetricCard
          title="Registrations"
          value={`${currentDealer.registrations} units`}
          previousValue={`${lastMonthRegistrations} units`}
          change={momRegistrationsChange}
          changeLabel={`vs Last Month (${lastMonthName})`}
          color="violet"
          icon={<CheckSquare className="w-4.5 h-4.5 text-violet-400" />}
          sparklineData={
            (selectedDealerId === 'all' ? sparklineHistories.registrations : [lastMonthRegistrations, Math.round((lastMonthRegistrations + currentDealer.registrations)/2), currentDealer.registrations]).map(v => Math.max(1, Math.round(v * combinedMult)))
          }
        />
      </div>

      {/* 4. Secondary Actionable Details Column / Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Timeline area chart - Spans 2 columns */}
        <div id="guide-budget-actual" className="lg:col-span-2 space-y-5">
          <BudgetVsActualPopularity 
            selectedDealerId={selectedDealerId}
            selectedDealerName={currentDealer.name}
            selectedBranchProp={filters.selectedBranch}
            timePeriodType={filters.timePeriodType}
            financialYear={filters.financialYear}
            selectedMonth={filters.selectedMonth}
            selectedQuarter={filters.selectedQuarter}
            selectedWeek={filters.selectedWeek}
            selectedDay={filters.selectedDay}
          />
          
          <div id="guide-dealership-details">
            <DealershipDetails 
              dealership={currentDealer} 
              onClearFilter={() => setSelectedDealerId('all')} 
              totalMarketRevenue={aggregateDealer.revenue}
            />
          </div>
        </div>

        {/* Sidebar right charts and event logs - Spans 1 column */}
        <div className="space-y-5">
          {/* Real-time feed ticker */}
          <div id="guide-live-feed">
            <LiveFeed 
              events={events} 
              onTriggerSimulation={handleManualInject} 
              isSimulating={isSimulating}
            />
          </div>

          {/* Top Banks (LOU Approved) placed at bottom of LIVE INFLOW section */}
          <div id="guide-top-banks">
            <TopBanksLOU 
              selectedDealerId={selectedDealerId}
              selectedDealerName={currentDealer.name}
              totalBookings={currentDealer.bookings + currentDealer.cancellations}
              droppedBookings={currentDealer.cancellations}
              currentRegistrations={currentDealer.registrations}
              multiplier={combinedMult}
              filterLabel={`${filters.financialYear} • ${getPeriodLabel()}`}
              branchName={filters.selectedBranch}
            />
          </div>

          {/* Conversion pipeline widget (Customer Pipeline Analytics) */}
          <div id="guide-conversion-funnel">
            <ConversionFunnelChart 
              selectedDealerId={selectedDealerId}
              selectedDealerName={currentDealer.name}
              dealerObj={currentDealer}
              multiplier={combinedMult}
              filterLabel={`${filters.financialYear} • ${getPeriodLabel()}`}
              branchName={filters.selectedBranch}
            />
          </div>
        </div>
      </div>

      {/* 5. Bottom comparison bento segments (Performance Index & Booking Cancellation & Rejections) */}
      <div id="guide-comparison-reasons" className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Left Column: Performance Index */}
        <div>
          <DealershipComparisonChart 
            dealerships={filteredDealerships}
            onSelect={setSelectedDealerId}
            selectedId={selectedDealerId}
          />
        </div>

        {/* Right Column: Cancellation risk doughnut chart (Booking Cancellation & Rejections) */}
        <div>
          <CancellationDoughnutChart 
            reasons={getCancellationReasonsForDealer(selectedDealerId, combinedMult)} 
            selectedDealerId={selectedDealerId}
            selectedDealerName={currentDealer.name}
            filterLabel={`${filters.financialYear} • ${getPeriodLabel()}`}
            branchName={filters.selectedBranch}
          />
        </div>
      </div>

      {/* 6. Sales Advisor Coverage Section (Positioned below Booking Cancellation & Rejections) */}
      <div id="guide-sales-advisor-coverage" className="mb-5">
        <SalesAdvisorCoverage 
          advisors={getSalesAdvisorsForDealer(selectedDealerId, filters.selectedBranch, combinedMult)}
          selectedDealerId={selectedDealerId}
          selectedDealerName={currentDealer.name}
          filterLabel={`${filters.financialYear} • ${getPeriodLabel()}`}
          onLaunchAutoGuide={(targetId?: string) => {
            setGuideInitialTarget(targetId || 'guide-sales-advisor-coverage');
            setIsGuideActive(true);
          }}
          onOpenHandbook={(tab?: string) => {
            setHandbookInitialTab(tab || 'advisors');
            setIsHandbookOpen(true);
          }}
        />
      </div>
    </div>
  );

  // If not authenticated, display the Ingress Corporate Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // First-time login access check:
          // Play auto guide on first login access once.
          // On 2nd time and subsequent logins, auto guide is manual play only.
          const hasAccessedGuideBefore = typeof window !== 'undefined'
            ? localStorage.getItem('ingress_has_played_auto_guide') === 'true'
            : false;

          if (!hasAccessedGuideBefore) {
            setIsGuideActive(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('ingress_has_played_auto_guide', 'true');
            }
          } else {
            setIsGuideActive(false);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Outer Glow Canvas Elements */}
      <div className="fixed top-[-10%] left-[-20%] w-[60%] h-[50%] bg-indigo-950/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[50%] bg-violet-950/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Global Top Banner Navigation - Ingress Corporate Banner */}
      <header id="guide-top-banner" className="corporate-top-banner sticky top-0 z-40 bg-white dark:bg-[#161217] border-b border-slate-200 dark:border-[#2d242f] px-3 sm:px-6 py-2 shadow-xs dark:shadow-md transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          
          {/* Left: Collapse Icon, Ingress Logo Box, Corporate Name & Division */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Collapse Chevrons Button */}
            <button 
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1 -ml-1 rounded cursor-pointer flex items-center justify-center banner-nav-btn"
              title="Navigation toggle"
              aria-label="Navigation toggle"
            >
              <ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Ingress Logo */}
            <IngressLogo className="h-7 sm:h-8 w-auto flex-shrink-0" />

            {/* Corporate Name: INGRESS CORPORATION BERHAD */}
            <div className="flex flex-col justify-center">
              <span className="text-slate-900 dark:text-white font-extrabold text-[11px] sm:text-[13px] leading-tight tracking-tight uppercase font-sans banner-corp-name">
                INGRESS CORPORATION
              </span>
              <div className="flex items-baseline gap-1.5 leading-tight">
                <span className="text-slate-900 dark:text-white font-extrabold text-[11px] sm:text-[13px] tracking-tight uppercase font-sans banner-corp-name">
                  BERHAD
                </span>
                <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-300 font-normal banner-subtext">
                  199901015899 (490789-K)
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 sm:h-7 w-[1px] bg-slate-200 dark:bg-slate-700/80 mx-1 sm:mx-2 hidden xs:block banner-divider" />

            {/* Division & Group: ADD Dealership Sales Dashboard | IIT Group */}
            <div className="hidden xs:flex flex-col justify-center">
              <span className="text-slate-900 dark:text-white font-bold text-[11px] sm:text-[13px] leading-tight font-sans banner-corp-name">
                ADD Dealership Sales Dashboard
              </span>
              <span className="text-slate-500 dark:text-slate-300 text-[9px] sm:text-[10.5px] leading-tight font-medium font-sans banner-subtext">
                IIT Group
              </span>
            </div>
          </div>

          {/* Right Controls: Date/Time, Simulator, Theme, View Modes */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Live Date & Time Widget */}
            <div className="datetime-widget flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-[#241c28] border border-slate-200 dark:border-[#4d3d52] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-2xs dark:shadow-inner text-slate-800 dark:text-white">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-100">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="datetime-date tracking-tight">{formattedDate}</span>
              </div>
              <span className="datetime-divider text-slate-300 dark:text-slate-400 font-light select-none">|</span>
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <span className="datetime-time tracking-tight">{formattedTime}</span>
                <span className="datetime-myt text-[10px] text-indigo-600 dark:text-indigo-300 font-bold ml-0.5">MYT</span>
              </div>
              <div className="datetime-live-badge hidden sm:flex items-center gap-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 px-2 py-0.5 rounded-md text-[9px] font-bold ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-ping" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Simulation Toggle Button */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`banner-sim-btn p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSimulating 
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-[#241c28] dark:text-slate-300 dark:border-[#4d3d52] dark:hover:text-white'
              }`}
              title={isSimulating ? 'Pause live simulator' : 'Resume live simulator'}
              aria-label={isSimulating ? 'Pause live simulator' : 'Resume live simulator'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" /> : <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <div className="flex items-center bg-slate-100 dark:bg-[#241c28] border border-slate-200 dark:border-[#4d3d52] p-0.5 rounded-xl text-xs font-mono" id="theme-toggle-container">
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-white text-amber-600 font-bold shadow-2xs border border-slate-200/80 dark:border-transparent' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Light Mode"
                aria-label="Switch to Light Mode"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-indigo-300 font-bold shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Dark Mode"
                aria-label="Switch to Dark Mode"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </button>
            </div>

            {/* Selector Switcher for Frame vs Responsive view */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#241c28] border border-slate-200 dark:border-[#4d3d52] p-0.5 rounded-xl text-xs font-mono">
              <button
                onClick={() => setViewMode('responsive')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  viewMode === 'responsive' 
                    ? 'bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 font-semibold shadow-2xs border border-slate-200/80 dark:border-transparent' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Responsive</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  viewMode === 'mobile' 
                    ? 'bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 font-semibold shadow-2xs border border-slate-200/80 dark:border-transparent' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>

            {/* Ingress Auto Guide Button */}
            <button
              onClick={() => setIsGuideActive(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer shadow-xs active:scale-95 bg-white hover:bg-rose-50 text-slate-900 dark:text-white dark:bg-slate-900/60"
              style={{ borderColor: '#8f043b', borderWidth: '1.5px' }}
              title="Start Interactive Auto Guide"
            >
              <Compass className="w-3.5 h-3.5 text-[#8f043b]" />
              <span className="hidden sm:inline font-bold">Auto Guide</span>
            </button>

            {/* Ingress Dashboard Handbook Button */}
            <button
              onClick={() => setIsHandbookOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer shadow-xs active:scale-95 bg-white hover:bg-slate-50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white dark:bg-slate-900/60"
              title="Open Operations & Dashboard Handbook"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8f043b]" />
              <span className="hidden sm:inline font-bold">Handbook</span>
            </button>

            {/* Ingress Excel Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer shadow-xs active:scale-95 bg-white hover:bg-emerald-50 text-slate-900 dark:text-white dark:bg-slate-900/60"
              style={{ borderColor: '#059669', borderWidth: '1.5px' }}
              title="Download Dashboard Reports to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
              <span className="hidden sm:inline font-bold">Export Excel</span>
            </button>

            {/* Authenticated Staff ID Badge & Logout Button */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-[#4d3d52]">
              <div 
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#4d3d52] bg-slate-100 dark:bg-[#241c28] text-xs font-mono shadow-2xs"
              >
                <div 
                  className="w-2 h-2 rounded-full ring-2 ring-slate-400/20 dark:ring-white/20 bg-[#8f043b]" 
                  title="Ingress Active Session"
                />
                <span className="text-slate-500 dark:text-slate-300">Staff:</span>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">{currentUser.staffId}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-900/60 shadow-2xs"
                title="Log out from Dealership Dashboard"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Logout</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        
        {/* Dynamic viewport renderer layout */}
        {viewMode === 'mobile' ? (
          <div className="flex flex-col items-center justify-center py-4">
            
            {/* Explanatory subtitle for mobile mockup frame */}
            <div className="text-center max-w-md mb-6 font-mono text-xs text-slate-400">
              <span className="text-indigo-400 font-bold">Simulator Active:</span> Showing fully optimized high-density dashboard layouts specifically configured for luxury dealership management on touch devices.
            </div>

            {/* Simulated smartphone frame container */}
            <div className="relative w-[390px] h-[844px] bg-slate-900 rounded-[55px] border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              
              {/* Phone hardware detailing: Top Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-slate-900 inline-block mr-8" />
                <span className="w-12 h-1 bg-slate-950 rounded-full inline-block" />
              </div>

              {/* Phone Status bar details */}
              <div className="bg-slate-950 px-6 pt-3 pb-2 flex justify-between items-center text-[10px] font-mono text-slate-400 z-40 select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2 border border-slate-500 rounded-sm inline-block relative after:content-[''] after:absolute after:right-[-2px] after:top-[2px] after:w-[1px] after:h-[2px] after:bg-neutral-500" />
                  <span>5G</span>
                </div>
              </div>

              {/* Nested mobile app display viewport (scrollable) */}
              <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2 scrollbar-thin scrollbar-thumb-slate-800">
                {renderDashboardContent()}
              </div>

              {/* Phone Home visual swipe line at bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        ) : (
          renderDashboardContent()
        )}
      </main>

      {/* Global Command Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900/60 bg-white/95 dark:bg-slate-950/60 backdrop-blur-md py-6 mt-12 relative z-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 dark:text-slate-500 font-mono">
          <div>
            <span>© 2026 INGRESS CORPORATION BERHAD. Dealership Dashboard for ADD.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">Diagnostic Tools</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">Security Encrypted</span>
          </div>
        </div>
      </footer>

      {/* Ingress Auto Guide Tour Walkthrough */}
      <AutoGuide
        isActive={isGuideActive}
        initialStepTargetId={guideInitialTarget}
        onClose={() => {
          setIsGuideActive(false);
          setGuideInitialTarget(undefined);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ingress_has_played_auto_guide', 'true');
          }
        }}
        onOpenHandbook={() => {
          setHandbookInitialTab('advisors');
          setIsHandbookOpen(true);
        }}
        currentDealer={currentDealer}
        aggregateDealer={aggregateDealer}
        filters={filters}
        events={events}
        momRevenueChange={momRevenueChange}
        momBookingsChange={momBookingsChange}
        momCancellationsChange={momCancellationsChange}
      />

      {/* Ingress Corporate Operations & Dashboard Handbook Modal */}
      <DashboardHandbook
        isOpen={isHandbookOpen}
        initialTab={handbookInitialTab}
        onClose={() => {
          setIsHandbookOpen(false);
          setHandbookInitialTab(undefined);
        }}
        onLaunchAutoGuide={() => {
          setGuideInitialTarget('guide-sales-advisor-coverage');
          setIsGuideActive(true);
        }}
        currentDealer={currentDealer}
        aggregateDealer={aggregateDealer}
        dealerships={filteredDealerships}
        filters={filters}
        events={events}
      />

      {/* Ingress Excel Data Export Modal */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        payload={excelExportPayload}
      />
    </div>
  );
}
