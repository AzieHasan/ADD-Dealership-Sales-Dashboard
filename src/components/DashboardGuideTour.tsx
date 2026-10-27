/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, ChevronRight, ChevronLeft, X, Sparkles, Filter, 
  Calendar, Building2, UserCheck, TrendingUp, CheckCircle2, 
  HelpCircle, Eye, Play, Pause, ArrowRight, BookOpen, Layers, RotateCcw,
  Landmark, ShieldAlert, Award, FileText, Phone, Mail, Check,
  ArrowUpDown, SkipForward
} from 'lucide-react';
import { DashboardFilterState } from '../types';
import { IngressLogo } from './IngressLogo';

export interface TourStepSampleItem {
  label: string;
  value: string;
  badge?: string;
  highlight?: boolean;
}

export interface TourStep {
  id: string;
  targetId?: string; // DOM ID to highlight
  title: string;
  category: 'Corporate Overview' | 'Filter Parameters' | 'Executive KPIs' | 'Model Performance' | 'Commercial Banking';
  badge: string;
  description: string;
  keyTakeaway: string;
  sampleContent: {
    sectionTitle: string;
    items: TourStepSampleItem[];
    operationalNote: string;
  };
  presetAction?: {
    label: string;
    filters: Partial<DashboardFilterState>;
    dealerId?: string;
  };
}

interface DashboardGuideTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExplainerModal: () => void;
  onApplyFilters?: (filters: Partial<DashboardFilterState>, dealerId?: string) => void;
  activeFilters: DashboardFilterState;
  selectedDealerId: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    title: 'ADD Dealership Sales Performance Guide',
    category: 'Corporate Overview',
    badge: 'Step 1 of 11 • System Scope',
    description: 'Welcome to the executive automotive intelligence portal for INGRESS CORPORATION BERHAD (Automotive Dealership Division - ADD). This dashboard monitors dealership franchises across Malaysia in real time.',
    keyTakeaway: 'All metrics, charts, and banking telemetry are synchronized with the 5 FILTER PARAMETERS below.',
    sampleContent: {
      sectionTitle: 'Current Operational Sample Data:',
      items: [
        { label: 'Franchise Portfolios', value: 'Mitsubishi Motors • PERODUA • PROTON e.MAS', badge: '3 Brands' },
        { label: 'Authorized Showrooms', value: '6 3S Outlets (Puchong, Bangi, Shah Alam, Damansara)', badge: 'Klang Valley' },
        { label: 'Consolidated Revenue', value: 'RM 78,450,000 (Active Month: August)', highlight: true }
      ],
      operationalNote: 'Consolidated numbers aggregate multi-franchise dealership P&L to MYR at real-time month-end rates.'
    }
  },
  {
    id: 'filter-panel',
    targetId: 'filter-parameters-panel',
    title: 'Command Center: FILTER PARAMETERS',
    category: 'Filter Parameters',
    badge: 'Step 2 of 11 • Master Control',
    description: 'The Filter Parameters bar controls the reporting scope. Changing any of the 5 dropdowns recalculates all 5 KPI cards, MoM comparisons, vehicle popularity curves, and banking approvals with zero latency.',
    keyTakeaway: 'The 5 parameters are hierarchical: choosing a Dealership automatically updates valid Showroom Branches in Parameter 5.',
    sampleContent: {
      sectionTitle: 'Active Filter Parameter Configuration:',
      items: [
        { label: 'Parameter 1: Financial Year', value: 'FY 2026 (Annual Quota Benchmark: RM 940M)' },
        { label: 'Parameter 2: Time Frequency Scope', value: 'Monthly (Standard Corporate Cadence)' },
        { label: 'Parameter 3: Sub-Period Cohort', value: 'August (Active Operating Month)' },
        { label: 'Parameter 4: Dealership Franchise', value: 'All Dealership (Consolidated Group View)' },
        { label: 'Parameter 5: Representative Branch', value: 'All Branches (6 Showrooms Integrated)' }
      ],
      operationalNote: 'Click "Reset Filters" anytime to restore this default FY 2026 corporate baseline.'
    }
  },
  {
    id: 'filter-fy',
    targetId: 'filter-fy-selector',
    title: 'Parameter 1: Financial Year (FY)',
    category: 'Filter Parameters',
    badge: 'Step 3 of 11 • Fiscal Calibration',
    description: 'Switches the operating fiscal year. Selecting FY 2026 uses current annual operating budgets and targets. Selecting FY 2025, 2024, or 2023 allows executive audit of multi-year historical delivery pacing.',
    keyTakeaway: 'Re-indexes dealership sales quotas and Year-over-Year (YoY) performance calculations.',
    sampleContent: {
      sectionTitle: 'Sample Financial Year Benchmarks (ADD Division):',
      items: [
        { label: 'FY 2026 (Current Operating Year)', value: 'Target: RM 940,000,000 | 1,120 Target Bookings', badge: 'Active' },
        { label: 'FY 2025 (Prior Year Actual)', value: 'Closed: RM 865,000,000 | 1,024 Bookings (+8.6% YoY)' },
        { label: 'FY 2024 (Historical Actual)', value: 'Closed: RM 795,000,000 | 950 Bookings' }
      ],
      operationalNote: 'Switching to FY 2025 recalibrates target curves on the Budget vs Actual chart.'
    },
    presetAction: {
      label: '⚡ Apply Sample: Benchmark Against FY 2025',
      filters: { financialYear: 'FY 2025' }
    }
  },
  {
    id: 'filter-time-scope',
    targetId: 'filter-time-scope-selector',
    title: 'Parameter 2: Time Scope Frequency',
    category: 'Filter Parameters',
    badge: 'Step 4 of 11 • Operational Cadence',
    description: 'Controls the time aggregation window among 7 modes: Daily (for morning showroom standups), Accumulative Weekly, Month to Day (MTD), Monthly (for GM review), Quarterly, Year to Day (YTD), or Full Year Scope.',
    keyTakeaway: 'All metric cards, sparkline histories, and bank financing records scale proportionally to match the chosen frequency.',
    sampleContent: {
      sectionTitle: 'Sample Volume Scaling by Time Frequency:',
      items: [
        { label: 'Daily Scope (Today Aug 07)', value: '6 Bookings • RM 4.9M Showroom Intake', badge: 'Intraday' },
        { label: 'Weekly Scope (Week 1)', value: '24 Bookings • RM 19.6M Intake' },
        { label: 'Monthly Scope (August)', value: '94 Bookings • RM 78.4M Consolidated Intake', highlight: true },
        { label: 'Year to Day (YTD Jan-Aug)', value: '658 Bookings • RM 560M Consolidated Revenue' }
      ],
      operationalNote: 'Branch heads use Daily and MTD to monitor floor pace; executive directors use Monthly and Quarterly.'
    },
    presetAction: {
      label: '⚡ Apply Sample: Switch to Daily Showroom Standup',
      filters: { timePeriodType: 'Daily', selectedDay: 'Today (Aug 07)' }
    }
  },
  {
    id: 'filter-subperiod',
    targetId: 'filter-subperiod-selector',
    title: 'Parameter 3: Sub-Period Granular Selector',
    category: 'Filter Parameters',
    badge: 'Step 5 of 11 • Granular Drilldown',
    description: 'This context-aware selector dynamically adapts based on Parameter 2! Under Daily mode it offers days (e.g. Today Aug 07, Yesterday); under Weekly it offers Weeks 1–4; under Monthly it allows selecting January through December; under Quarterly it offers Q1 through Q4.',
    keyTakeaway: 'Enables targeted audit of specific promotional campaigns (e.g. Merdeka Sales Week) or month-end delivery rushes.',
    sampleContent: {
      sectionTitle: 'Sample Sub-Period Options in Active Context:',
      items: [
        { label: 'Selected Month', value: 'August (Current Operating Period)', badge: 'Active Cohort' },
        { label: 'Available Calendar Months', value: 'January through December (All 12 Months Selectable)' },
        { label: 'Quarter Alternative', value: 'Q3 (Jul - Sep) • Mid-Year Campaign Pacing' }
      ],
      operationalNote: 'Changing the month automatically updates the MoM Comparative Bar to contrast with the preceding month.'
    },
    presetAction: {
      label: '⚡ Apply Sample: Select August Monthly Window',
      filters: { timePeriodType: 'Monthly', selectedMonth: 'August' }
    }
  },
  {
    id: 'filter-dealership',
    targetId: 'filter-dealership-selector',
    title: 'Parameter 4: Dealership Franchise Scope',
    category: 'Filter Parameters',
    badge: 'Step 6 of 11 • Brand Segregation',
    description: 'Filters between All Dealership (Consolidated Group) or isolates individual manufacturer franchises: Mitsubishi Motors, PERODUA, or PROTON e.MAS.',
    keyTakeaway: 'Selecting a brand scopes all model charts, financing LOU numbers, and assigned showroom branches.',
    sampleContent: {
      sectionTitle: 'Sample Dealership Brand Portfolios in System:',
      items: [
        { label: 'Mitsubishi Motors (Ingress Motors Centre)', value: 'Triton (Athlete/AT), Xpander 1.5L, Xforce', badge: '3S Dealer' },
        { label: 'PERODUA (Ingress Auto Sales)', value: 'Axia 1.0 AV, Bezza 1.3 AV, Myvi 1.5 AV, Alza', badge: 'High Volume' },
        { label: 'PROTON e.MAS (Ingress EV Centre)', value: 'e.MAS 7 Prime Extended, e.MAS 7 Premium Tech', badge: 'EV Pioneer' }
      ],
      operationalNote: 'Selecting Mitsubishi limits the Branch selector to Puchong, IMC Bangi, and Shah Alam.'
    },
    presetAction: {
      label: '⚡ Apply Sample: Filter to Mitsubishi Dealership',
      dealerId: 'dt-porsche',
      filters: { selectedBranch: 'PUCHONG' }
    }
  },
  {
    id: 'filter-branch',
    targetId: 'filter-branch-selector',
    title: 'Parameter 5: Representative Branch Directory',
    category: 'Filter Parameters',
    badge: 'Step 7 of 11 • Showroom Locations',
    description: 'Drills down into individual physical showroom outlets. Selecting a branch reveals the assigned Branch Head contact info, active sales consultant roster, and showroom-specific delivery quotas.',
    keyTakeaway: 'Enables branch managers to conduct localized performance appraisals and stock audits.',
    sampleContent: {
      sectionTitle: 'Sample Branch Directory & Assigned Leadership:',
      items: [
        { label: 'PUCHONG Showroom (Mitsubishi)', value: 'Lead: Ahmad Razak (+60 12-345 6789) • 8 Active Reps', highlight: true },
        { label: 'The Curve Showroom (PERODUA)', value: 'Lead: Farah Lee (+60 17-555 4321) • Retail Mall Outlet' },
        { label: 'BANDAR BARU BANGI (PROTON e.MAS)', value: 'Lead: Kamal Vance (+60 11-7777 999) • EV Specialist' },
        { label: 'SHAH ALAM / MUTIARA DAMANSARA', value: 'Lead: Jason Tan / Chong Wei • 3S Facilities' }
      ],
      operationalNote: 'When a branch is selected, a green representative contact bar appears below the filter controls.'
    },
    presetAction: {
      label: '⚡ Apply Sample: Drill Down to Puchong Branch',
      dealerId: 'dt-porsche',
      filters: { selectedBranch: 'PUCHONG' }
    }
  },
  {
    id: 'mom-comparative',
    targetId: 'mom-comparative-bar',
    title: 'Month-over-Month (MoM) Variance Bar',
    category: 'Executive KPIs',
    badge: 'Step 8 of 11 • Variance Telemetry',
    description: 'Contrasts active month performance against the preceding operating month (Current Month: August vs Last Month: July). Displays automated percentage gains or decreases across key dealership indicators.',
    keyTakeaway: 'Green positive variance badges flag above-budget trajectory; red indicators trigger inventory or marketing reviews.',
    sampleContent: {
      sectionTitle: 'Sample MoM Performance Differential (August vs July):',
      items: [
        { label: 'Revenue Growth', value: '+11.8% (RM 78.45M vs RM 70.18M)', badge: 'Gained' },
        { label: 'Gross Bookings Growth', value: '+12.4% (94 units vs 84 units)', badge: 'Gained' },
        { label: 'DMV Registrations Growth', value: '+6.2% (64 units vs 60 units)', badge: 'Gained' }
      ],
      operationalNote: 'Calculated using real month-end closing records for instant executive visibility.'
    }
  },
  {
    id: 'kpi-grid',
    targetId: 'kpi-metrics-grid',
    title: 'Executive KPI Bento Grid & Live Sparklines',
    category: 'Executive KPIs',
    badge: 'Step 9 of 11 • 5 Core Metrics',
    description: 'Five real-time executive cards display: (1) Total Invoiced Revenue in RM, (2) Gross Bookings, (3) Dropped Bookings with automatic anomaly alerts, (4) Conversion Efficiency %, and (5) DMV Registrations with live animated sparkline histories.',
    keyTakeaway: 'Dropped Bookings trigger an amber/red warning banner if cancellations exceed acceptable threshold (>4 units).',
    sampleContent: {
      sectionTitle: 'Sample Live KPI Values (Consolidated August):',
      items: [
        { label: '1. Revenue (RM)', value: 'RM 78,450,000 (Avg RM 834k/unit across models)', highlight: true },
        { label: '2. Gross Bookings', value: '94 units (Locked Showroom Deposits)' },
        { label: '3. Dropped Bookings', value: '8 units (Rejections & Cancellations combined)' },
        { label: '4. Conversion Efficiency', value: '27.2% (Showroom Inquiries converted to Deliveries)' },
        { label: '5. DMV Registrations', value: '64 units (Authentic Plate Registrations Completed)' }
      ],
      operationalNote: 'Hover over each card to view real-time sparkline performance trajectories.'
    }
  },
  {
    id: 'budget-actual',
    targetId: 'budget-vs-actual-popularity-widget',
    title: 'Budget vs Actual & Vehicle Popularity',
    category: 'Model Performance',
    badge: 'Step 10 of 11 • Model Rankings',
    description: 'Tracks actual delivered vehicles against monthly budgeted targets, variance gaps, and vehicle model popularity rankings. You can filter down to specific car models (e.g. Triton, Xpander, Myvi, e.MAS 7) and trim variants.',
    keyTakeaway: 'Enables sales directors to identify which trim variants are driving profitability vs lagging models.',
    sampleContent: {
      sectionTitle: 'Sample Top Selling Vehicle Trims in Stock:',
      items: [
        { label: '#1 Mitsubishi Triton Athlete 2.4L', value: '38 Delivered vs 34 Quota (+11.7% Variance)', badge: 'Best Seller' },
        { label: '#2 PERODUA Myvi 1.5 H/AV CVT', value: '42 Delivered vs 39 Quota (+7.7% Variance)' },
        { label: '#3 PROTON e.MAS 7 Prime Extended', value: '22 Pre-Orders vs 18 Quota (+22.2% EV Demand)' }
      ],
      operationalNote: 'Toggle between Monthly, Accumulative, and Custom Range views inside this widget.'
    }
  },
  {
    id: 'live-and-lou',
    targetId: 'top-banks-lou-panel',
    title: 'Top Banks (LOU Approved) & Commercial Financing',
    category: 'Commercial Banking',
    badge: 'Step 11 of 11 • Financing Telemetry',
    description: 'Audits commercial bank loan turnaround times and Letter of Undertaking (LOU) approval rates across major Malaysian banks (Maybank, Public Bank, CIMB, Hong Leong, RHB, AmBank). Highlights financial approval bottlenecks.',
    keyTakeaway: 'Distinguishes whether lost deals are caused by bank financing rejections (CCRIS/CTOS) or customer mind changes.',
    sampleContent: {
      sectionTitle: 'Sample Commercial Banking Approval Metrics:',
      items: [
        { label: 'Maybank (Top Financier)', value: '32 Approved LOUs • 91.4% Approval Rate • 2.1 Days TAT', badge: 'Premier Bank' },
        { label: 'Public Bank Berhad', value: '24 Approved LOUs • 88.9% Approval Rate • 2.4 Days TAT' },
        { label: 'CIMB Bank', value: '18 Approved LOUs • 85.7% Approval Rate • 3.0 Days TAT' },
        { label: 'Top Rejection Reason', value: 'High DSR / CCRIS Rating (Accounting for 52% of all drops)' }
      ],
      operationalNote: 'Next to this widget, the Live Inflow Feed streams simulated showroom bookings every 5 seconds.'
    }
  }
];

export function DashboardGuideTour({
  isOpen,
  onClose,
  onOpenExplainerModal,
  onApplyFilters,
  activeFilters,
  selectedDealerId
}: DashboardGuideTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [cardPlacement, setCardPlacement] = useState<'top' | 'bottom'>('bottom');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(5);

  const step = TOUR_STEPS[currentStepIndex];
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When tour opens: start at Step 1, enable auto-play, and reset timer
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsAutoPlaying(true);
      setAutoPlayTimer(5);
    } else {
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    }
  }, [isOpen]);

  // Smart non-overlapping position & scroll calculator
  const updateHighlight = useCallback(() => {
    if (!isOpen || !step) return;

    if (!step.targetId) {
      setHighlightRect(null);
      setCardPlacement('bottom');
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const initialRect = element.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const elementAbsoluteTop = initialRect.top + scrollTop;
      const vh = window.innerHeight;

      // Smart Non-Overlapping Placement Rule:
      // If the element's position is lower on the screen (top > 40% of viewport or bottom > 60%),
      // position the guide card at the TOP of the screen so it NEVER covers the element!
      // If the element is higher on the screen, position the guide card at the BOTTOM.
      const isLowerHalf = initialRect.top > vh * 0.38 || initialRect.bottom > vh * 0.60;
      const placement = isLowerHalf ? 'top' : 'bottom';
      setCardPlacement(placement);

      // Smart Scrolling Clearance:
      // When card is at TOP: it occupies ~60px to ~330px from top.
      //   We scroll so the target element's top starts at ~350px in the viewport.
      // When card is at BOTTOM: it occupies the lower ~280px of the screen.
      //   We scroll so the target element's top starts at ~90px in the viewport (just below header).
      const desiredViewportOffset = placement === 'top' ? 350 : 90;
      const targetScrollY = Math.max(0, elementAbsoluteTop - desiredViewportOffset);

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });

      // Update highlight bounding box after smooth scroll settles
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      }, 280);
    } else {
      setHighlightRect(null);
      setCardPlacement('bottom');
    }
  }, [isOpen, step]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [updateHighlight]);

  // Skip Guide Handler: Clean exit without triggering any other modal
  const handleSkip = () => {
    setIsAutoPlaying(false);
    if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ingress_tour_completed', 'true');
      localStorage.setItem('ingress_tour_skipped', 'true');
    }
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  // Auto-play feature: 5 second interval per step
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
      return;
    }

    setAutoPlayTimer(5);
    const interval = setInterval(() => {
      setAutoPlayTimer(prev => {
        if (prev <= 1) {
          handleNext();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    autoPlayIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsAutoPlaying(false);
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    handleSkip();
  };

  const handleComplete = () => {
    setIsAutoPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ingress_tour_completed', 'true');
    }
    onClose();
    onOpenExplainerModal();
  };

  const handleTestPreset = () => {
    if (step.presetAction && onApplyFilters) {
      onApplyFilters(step.presetAction.filters, step.presetAction.dealerId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
      {/* Dark Spotlight Mask Overlay with Ingress Burgundy Tint */}
      <div 
        className="absolute inset-0 bg-[#0c080e]/80 backdrop-blur-[2px] transition-all duration-300"
        onClick={handleNext}
      />

      {/* Target Element Spotlight Cutout Ring - Ingress Maroon Theme */}
      {highlightRect && (
        <motion.div
          layoutId="tourSpotlightBox"
          initial={false}
          animate={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="absolute rounded-2xl pointer-events-none z-50 border-2 border-[#850536] shadow-[0_0_0_9999px_rgba(12,8,14,0.78),0_0_35px_rgba(133,5,54,0.5)]"
        >
          {/* Authentic Metallic Silver and Burgundy Corner Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#850536]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#850536]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#8e9095]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#8e9095]" />
        </motion.div>
      )}

      {/* Dynamic Non-Overlapping Tour Card Container */}
      <div 
        className={`fixed inset-x-3 sm:inset-x-4 max-w-2xl mx-auto z-50 pointer-events-auto transition-all duration-300 ${
          cardPlacement === 'top' 
            ? 'top-14 sm:top-16' 
            : 'bottom-3 sm:bottom-5'
        }`}
      >
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: cardPlacement === 'top' ? -15 : 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: cardPlacement === 'top' ? -15 : 15, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          className="bg-[#181119] border-2 border-[#850536]/80 rounded-2xl p-4 sm:p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_30px_rgba(133,5,54,0.3)] text-slate-100 backdrop-blur-xl max-h-[82vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
        >
          {/* Corporate Header Ribbon */}
          <div className="flex items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-[#351b27]">
            <div className="flex items-center gap-2">
              <IngressLogo className="h-4 sm:h-5 w-auto flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight text-white font-sans">
                  INGRESS CORPORATION BERHAD
                </span>
                <span className="text-[8.5px] font-mono text-[#8e9095] leading-tight">
                  ADD DEALERSHIP SALES PERFORMANCE GUIDE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Position Flip Button (Prevents Any Display Obstruction) */}
              <button
                onClick={() => setCardPlacement(prev => prev === 'top' ? 'bottom' : 'top')}
                className="px-2 py-1 rounded-lg text-[10px] font-mono text-[#8e9095] hover:text-white hover:bg-[#2b1727] border border-[#47273a] transition-all flex items-center gap-1 cursor-pointer"
                title={cardPlacement === 'top' ? 'Move card to bottom of screen' : 'Move card to top of screen'}
              >
                <ArrowUpDown className="w-3 h-3 text-pink-300" />
                <span className="hidden sm:inline">{cardPlacement === 'top' ? 'Move Down' : 'Move Up'}</span>
              </button>

              {/* Auto-Play Toggle */}
              <button
                onClick={() => setIsAutoPlaying(prev => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  isAutoPlaying 
                    ? 'bg-[#850536] text-white border-pink-400/60 shadow-sm' 
                    : 'bg-[#241724] text-slate-300 border-[#47273a] hover:text-white'
                }`}
                title={isAutoPlaying ? 'Pause Auto-Play' : 'Start Auto-Play walkthrough'}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-white" />
                    <span>Auto ({autoPlayTimer}s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-pink-300" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              {/* High-Visibility Skip Guide Button */}
              <button
                onClick={handleSkip}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#3b1c2b] hover:bg-[#850536] text-pink-200 hover:text-white border border-[#5a243d] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Skip the guide and start using dashboard directly"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#2b1727] transition-colors cursor-pointer"
                title="Close Guide"
                aria-label="Close Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Auto-Play Countdown Visual Indicator Bar */}
          {isAutoPlaying && (
            <div className="w-full bg-[#2a1320] h-1 rounded-full overflow-hidden mb-2">
              <motion.div 
                key={`${step.id}-${autoPlayTimer}`}
                initial={{ width: `${((autoPlayTimer) / 5) * 100}%` }}
                animate={{ width: `${((autoPlayTimer - 1) / 5) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-[#850536] via-pink-500 to-[#850536]"
              />
            </div>
          )}

          {/* Step Category & Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300 bg-[#850536]/20 border border-[#850536]/50 px-2 py-0.5 rounded font-bold">
              {step.badge}
            </span>
            <span className="text-[10px] font-mono text-[#8e9095] uppercase tracking-wider">
              {step.category}
            </span>
          </div>

          {/* Title & Body Description */}
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1.5">
            {step.title}
          </h4>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
            {step.description}
          </p>

          {/* Embedded Real Sample Content Container */}
          <div className="bg-[#120a13] border border-[#3b1a2a] rounded-xl p-3 mb-3 text-xs shadow-inner">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#2a1320]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-pink-400" />
                {step.sampleContent.sectionTitle}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Live Data Sync
              </span>
            </div>

            <div className="space-y-1.5">
              {step.sampleContent.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono py-0.5 ${
                    item.highlight ? 'text-pink-200 font-bold bg-[#850536]/10 px-1.5 rounded' : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-400">{item.label}:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-medium">{item.value}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#261424] text-slate-300 border border-[#44233a]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-1.5 border-t border-[#26121f] text-[10.5px] text-[#8e9095] italic font-mono">
              💡 {step.sampleContent.operationalNote}
            </div>
          </div>

          {/* Action Button: Apply Sample Scenario Live */}
          {step.presetAction && (
            <div className="mb-3">
              <button
                onClick={handleTestPreset}
                className="w-full py-2 px-3 bg-gradient-to-r from-[#850536] via-[#70042d] to-[#850536] hover:brightness-110 border border-pink-400/60 rounded-xl text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{step.presetAction.label}</span>
              </button>
            </div>
          )}

          {/* Bottom Navigation & Progress Dots */}
          <div className="flex items-center justify-between pt-2 border-t border-[#351b27]">
            {/* Step Indicators */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentStepIndex 
                      ? 'w-5 sm:w-6 bg-[#850536]' 
                      : idx < currentStepIndex 
                      ? 'w-2 bg-emerald-400' 
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Go to step ${idx + 1}: ${s.title}`}
                  aria-label={`Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Nav Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="px-2.5 py-1.5 rounded-xl border border-slate-700/80 hover:bg-[#2b1727] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Skip Guide</span>
              </button>

              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl border border-[#47273a] hover:bg-[#2b1727] text-xs font-mono text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#850536] to-[#99063f] hover:brightness-110 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-pink-500/30"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish & Open Handbook' : 'Next Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
