/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, ArrowRight, ArrowLeft, X, 
  HelpCircle, BookOpen, Sparkles, CheckCircle2, ChevronRight,
  TrendingUp, Building2, Calendar, DollarSign, AlertTriangle,
  UserCheck, CheckSquare, ShieldCheck, ExternalLink
} from 'lucide-react';
import { Dealership, DashboardFilterState, BookingEvent } from '../types';
import { IngressLogo } from './IngressLogo';

export interface GuideStep {
  id: string;
  targetId: string;
  title: string;
  category: string;
  description: string;
  sampleBadgeTitle: string;
  sampleBadgeContent: string;
  actionTip?: string;
}

interface AutoGuideProps {
  isActive: boolean;
  onClose: () => void;
  onOpenHandbook: () => void;
  currentDealer: Dealership;
  aggregateDealer: Dealership;
  filters: DashboardFilterState;
  events: BookingEvent[];
  momRevenueChange: number;
  momBookingsChange: number;
  momCancellationsChange: number;
  initialStepTargetId?: string;
}

export const AutoGuide: React.FC<AutoGuideProps> = ({
  isActive,
  onClose,
  onOpenHandbook,
  currentDealer,
  aggregateDealer,
  filters,
  events,
  momRevenueChange,
  momBookingsChange,
  momCancellationsChange,
  initialStepTargetId
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 100%
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const STEP_DURATION_MS = 6500; // 6.5 seconds per step in auto-play
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRemainingRef = useRef<number>(STEP_DURATION_MS);

  // Latest booking event
  const latestBooking = events.find(e => e.type === 'booking') || events[0];

  // Dynamic real data steps
  const steps: GuideStep[] = [
    {
      id: 'step-banner',
      targetId: 'guide-top-banner',
      category: 'System Navigation',
      title: 'Corporate Command Banner & Real-Time Controls',
      description: 'The top navigation bar displays Ingress Corporation Berhad corporate credentials, live Malaysia Time (MYT), real-time simulator state toggle, and system theme controls.',
      sampleBadgeTitle: 'Active System Status',
      sampleBadgeContent: `Live Feed: Active • Timezone: Asia/Kuala_Lumpur (MYT) • Division: IIT Group ADD Dealership`,
      actionTip: 'Toggle the simulation play button to pause incoming mock customer reservations or switch between Light & Dark themes.'
    },
    {
      id: 'step-dealership-selector',
      targetId: 'guide-dealership-selector',
      category: 'Brand Fleet Matrix',
      title: 'Interactive Multi-Dealership Brand Selector',
      description: 'Quickly switch between consolidated aggregate reporting and dedicated authorized brand showrooms: Ingress Motors Centre Sdn. Bhd. (Mitsubishi & PERODUA) and Ingress Auto Sdn. Bhd. (PROTON e.MAS).',
      sampleBadgeTitle: 'Live Dealership Snapshot',
      sampleBadgeContent: `Selected: ${currentDealer.name} (${currentDealer.bookings} Active Bookings • RM ${(currentDealer.revenue / 1000000).toFixed(2)}M Revenue • Target: ${currentDealer.targetBookings} units)`,
      actionTip: 'Click on any brand card to isolate branch metrics, sales reps, and model popularity rankings.'
    },
    {
      id: 'step-filter-toolbar',
      targetId: 'guide-filter-toolbar',
      category: 'Dimensional Filtering',
      title: 'Fiscal Year, Time Granularity & Branch Filters',
      description: 'Dynamic time slicing allows leadership to audit performance across Fiscal Years (FY23 - FY26), Daily, Accumulative Weekly, MTD, Monthly, and Quarterly scopes, with branch-level weighting.',
      sampleBadgeTitle: 'Active Filter Parameters',
      sampleBadgeContent: `${filters.financialYear} • ${filters.timePeriodType} (${filters.selectedMonth}) • Branch: ${filters.selectedBranch}`,
      actionTip: 'Changing the time period or branch dynamically updates all revenue multipliers and conversion models.'
    },
    {
      id: 'step-mom-bar',
      targetId: 'mom-comparative-bar',
      category: 'Trend Velocity',
      title: 'Month-over-Month (MoM) Comparative Velocity',
      description: 'Instant trajectory comparison showing current month performance against last month benchmark. Highlights operational gains in revenue, bookings volume, and dropped bookings reduction.',
      sampleBadgeTitle: 'Current MoM Performance',
      sampleBadgeContent: `Revenue: +${momRevenueChange}% • Bookings: +${momBookingsChange}% • Drop Rate: ${momCancellationsChange}% (${filters.selectedMonth} vs Previous Month)`,
      actionTip: 'A positive bookings increase coupled with a negative cancellation drop indicates healthy showroom conversion.'
    },
    {
      id: 'step-metrics-grid',
      targetId: 'guide-metrics-grid',
      category: 'Core Financials & KPIs',
      title: 'Real-Time Dynamic Metrics Bento Grid',
      description: 'The executive scoreboard monitoring the 5 vital dealership health indicators: Gross Revenue, Total Bookings, Dropped Bookings (Alert), Conversion Efficiency, and authenticated DMV Registrations.',
      sampleBadgeTitle: 'Actual Live Values',
      sampleBadgeContent: `Revenue: RM ${currentDealer.revenue.toLocaleString()} • Bookings: ${currentDealer.bookings + currentDealer.cancellations} units • Dropped: ${currentDealer.cancellations} units • Conv: ${currentDealer.conversionRate}% • Registrations: ${currentDealer.registrations} units`,
      actionTip: 'Each metric card features animated sparkline crawling history and color-coded threshold alerts.'
    },
    {
      id: 'step-budget-actual',
      targetId: 'guide-budget-actual',
      category: 'Pacing & Vehicle Demand',
      title: 'Target vs. Actual Pacing & Model Popularity',
      description: 'Cross-analyzes monthly target milestones against current delivered bookings, alongside real-time popularity rankings for top vehicles (Xpander, Triton, Ativa, Myvi, e.MAS 7).',
      sampleBadgeTitle: 'Current Pacing Analysis',
      sampleBadgeContent: `Bookings: ${currentDealer.bookings} / ${currentDealer.targetBookings} Target (${Math.round((currentDealer.bookings / currentDealer.targetBookings) * 100)}% Fulfilled) • Top Model: ${currentDealer.topModel}`,
      actionTip: 'Toggle between Monthly, Quarterly, and Weekly views to inspect cumulative sales momentum.'
    },
    {
      id: 'step-live-feed',
      targetId: 'guide-live-feed',
      category: 'Real-Time Stream',
      title: 'Live Transaction Feed & Audit Inflow',
      description: 'Real-time chronological stream of customer showroom deposits, cancellations, LOU loan submissions, and DMV registration filings across all showroom branches.',
      sampleBadgeTitle: 'Latest Transaction Logged',
      sampleBadgeContent: latestBooking ? `${latestBooking.customerName} placed deposit for ${latestBooking.model} (RM ${latestBooking.value.toLocaleString()})` : 'Awaiting live transaction stream...',
      actionTip: 'Use the "Simulate Booking" button to test real-time metric recalculations and live ticker animation.'
    },
    {
      id: 'step-top-banks',
      targetId: 'guide-top-banks',
      category: 'Financing Intelligence',
      title: 'Top Financing Banks & LOU Approval Efficiency',
      description: 'Audits Letter of Undertaking (LOU) processing speed and approval percentages across premier banking partners: Maybank, CIMB, Hong Leong, Public Bank, and AmBank.',
      sampleBadgeTitle: 'LOU Banking Benchmark',
      sampleBadgeContent: `Maybank leading at 88.4% approval (Avg 2.1 days turnaround) • Total Financing: > RM 5.2M`,
      actionTip: 'Monitor average turnaround days to identify potential loan processing bottlenecks before customer delivery dates.'
    },
    {
      id: 'step-conversion-funnel',
      targetId: 'guide-conversion-funnel',
      category: 'Sales Pipeline & Risk',
      title: 'Customer Pipeline Funnel & Root Cause Analysis',
      description: 'Diagnoses drop-offs through 6 pipeline stages: Inquiries → Showroom Walk-ins → Test Drives → Bookings → LOU Approval → DMV Registrations, paired with drop-off root causes.',
      sampleBadgeTitle: 'Funnel & Risk Snapshot',
      sampleBadgeContent: `Pipeline Conversion: ${currentDealer.conversionRate}% • Primary Cancellation Keyword: #credit-score & #interest-rate`,
      actionTip: 'Refer to the Dashboard Handbook to review the step-by-step mitigation playbook for customer cancellations.'
    },
    {
      id: 'step-sales-advisor-coverage',
      targetId: 'guide-sales-advisor-coverage',
      category: 'Workforce & Governance',
      title: 'Sales Advisor Coverage & Direct Dashboard Access',
      description: 'Expands dealership dashboard access directly to frontline Sales Advisors. Track showroom duty rosters, individual quota fulfillment, mobile device connectivity, and direct bank LOU submission capabilities.',
      sampleBadgeTitle: 'Workforce Coverage',
      sampleBadgeContent: `31 Active SAs Connected • 1:14 Lead Coverage Ratio • 104.8% Quota Fulfillment`,
      actionTip: 'Click "Manage Access Permissions" to grant or suspend direct mobile and showroom dashboard privileges for individual sales consultants.'
    }
  ];

  const currentStep = steps[currentStepIndex] || steps[0];

  // Update target element bounding rect & window size
  const updateTargetPosition = () => {
    if (typeof window === 'undefined') return;
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  // Scroll target element smoothly into view and re-measure
  useEffect(() => {
    if (!isActive) return;

    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });

      // Update position immediately and after scroll animation
      updateTargetPosition();
      const timeout1 = setTimeout(updateTargetPosition, 300);
      const timeout2 = setTimeout(updateTargetPosition, 600);
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [currentStepIndex, isActive]);

  // Handle jump to specific step if initialStepTargetId is provided upon opening
  useEffect(() => {
    if (isActive && initialStepTargetId) {
      const idx = steps.findIndex(s => s.targetId === initialStepTargetId);
      if (idx !== -1) {
        setCurrentStepIndex(idx);
        setProgress(0);
      }
    }
  }, [isActive, initialStepTargetId]);

  // Window resize & scroll listeners
  useEffect(() => {
    if (!isActive) return;

    const handleScrollOrResize = () => {
      updateTargetPosition();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isActive, currentStepIndex]);

  // Keyboard navigation: Escape to skip, Left/Right for prev/next, Space for play/pause
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex]);

  // Auto-play timer engine
  useEffect(() => {
    if (!isActive || !isPlaying) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - ((progress / 100) * STEP_DURATION_MS);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / STEP_DURATION_MS) * 100);
      setProgress(currentProgress);

      if (elapsed >= STEP_DURATION_MS) {
        // Step forward or complete
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
          setProgress(0);
          startTimeRef.current = Date.now();
        } else {
          // Finished all steps
          setIsPlaying(false);
          setProgress(100);
        }
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isActive, isPlaying, currentStepIndex]);

  const handleNext = () => {
    setProgress(0);
    startTimeRef.current = Date.now();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ingress_has_played_auto_guide', 'true');
      }
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    startTimeRef.current = Date.now();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setProgress(0);
    startTimeRef.current = Date.now();
    setCurrentStepIndex(index);
  };

  if (!isActive) return null;

  // Calculate side-by-side positioning for the Guide Card relative to the highlighted element
  const getCardPositionStyle = (): React.CSSProperties => {
    const cardWidth = 660; // Expanded width for spacious, highly legible reading experience
    const padding = 20;
    const safeTop = 75; // Below header if needed

    if (!targetRect) {
      return {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 1000
      };
    }

    const isDesktop = windowSize.width >= 1280;
    
    if (isDesktop) {
      // Side-by-Side positioning:
      // Check if target has enough space on the right or left
      const spaceOnRight = windowSize.width - (targetRect.right + padding);
      const spaceOnLeft = targetRect.left - padding;

      if (spaceOnRight >= cardWidth + 20) {
        // Position on the RIGHT side of the target element (side-by-side)
        const topAlign = Math.max(safeTop, Math.min(targetRect.top, windowSize.height - 520));
        return {
          position: 'fixed',
          left: `${targetRect.right + 20}px`,
          top: `${topAlign}px`,
          width: `${cardWidth}px`,
          zIndex: 1000
        };
      } else if (spaceOnLeft >= cardWidth + 20) {
        // Position on the LEFT side of the target element (side-by-side)
        const topAlign = Math.max(safeTop, Math.min(targetRect.top, windowSize.height - 520));
        return {
          position: 'fixed',
          left: `${Math.max(padding, targetRect.left - cardWidth - 20)}px`,
          top: `${topAlign}px`,
          width: `${cardWidth}px`,
          zIndex: 1000
        };
      } else {
        // Element takes full width (like top banner or metrics bento): place right below it or bottom right
        if (targetRect.bottom + 480 <= windowSize.height) {
          return {
            position: 'fixed',
            top: `${targetRect.bottom + 16}px`,
            left: `${Math.max(padding, Math.min(targetRect.left, windowSize.width - cardWidth - padding))}px`,
            width: `${cardWidth}px`,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 1000
          };
        } else {
          return {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: `${cardWidth}px`,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 1000
          };
        }
      }
    } else {
      // Mobile / Tablet: Dock at bottom with clear visibility
      return {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 1000
      };
    }
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSkipGuide = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ingress_has_played_auto_guide', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden select-none">
      {/* 1. Backdrop Overlay with Semi-Transparent Tint - Light Theme */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)' }}
        onClick={() => setIsPlaying(false)}
      />

      {/* 2. Spotlight Highlighter Box around Target Element - Light Theme Background */}
      {targetRect && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed rounded-2xl pointer-events-none z-[1000]"
          style={{
            border: '2.5px solid #8f043b',
            boxShadow: '0 0 0 9999px rgba(245, 247, 250, 0.82), 0 0 30px rgba(143, 4, 59, 0.35), inset 0 0 15px rgba(143, 4, 59, 0.1)'
          }}
        >
          {/* Corner Brackets for Ingress Corporate Engineering look */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#ff3377]" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#ff3377]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#ff3377]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#ff3377]" />

          {/* Active Target Indicator Badge */}
          <div 
            className="absolute -top-3.5 left-4 flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-extrabold text-black shadow-md uppercase tracking-wider bg-white border-2 border-[#8f043b]"
            style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#8f043b' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8f043b] animate-ping" />
            <span style={{ color: '#000000' }}>FOCUS: {currentStep.category}</span>
          </div>
        </motion.div>
      )}

      {/* 3. Floating Side-by-Side Guide Card - Clean Corporate Light Color Scheme */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        style={{ ...getCardPositionStyle(), backgroundColor: '#ffffff', color: '#000000' }}
        className="auto-guide-card pointer-events-auto bg-white text-black rounded-2xl border-2 border-slate-300 shadow-[0_25px_70px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col font-sans"
      >
        {/* Top Progress Countdown Bar (Auto-Play indicator) */}
        <div className="h-2 w-full bg-slate-100 border-b border-slate-200 relative overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
          <motion.div 
            className="h-full transition-all duration-150"
            style={{ 
              width: `${progress}%`,
              backgroundColor: isPlaying ? '#8f043b' : '#d97706'
            }}
          />
        </div>

        {/* Card Header (Clean: No 'Ingress Auto Guide' text, No 'pause' text badge) */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200" style={{ backgroundColor: '#faf8fa' }}>
          <div className="flex items-center gap-3">
            <IngressLogo className="h-6 sm:h-7 w-auto" />
            <div className="flex items-center gap-2 pl-3 border-l border-slate-300">
              <span 
                className="text-sm sm:text-base font-black text-black tracking-tight font-sans"
                style={{ color: '#000000' }}
              >
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Handbook Quick-Launch Link - Light Button */}
            <button
              onClick={() => {
                setIsPlaying(false);
                onOpenHandbook();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black border transition-colors cursor-pointer shadow-xs hover:bg-slate-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
              title="Open Complete Handbook"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8f043b]" />
              <span className="hidden sm:inline font-bold text-black" style={{ color: '#000000' }}>Handbook</span>
            </button>

            {/* Attractive Light Skip Button */}
            <button
              onClick={handleSkipGuide}
              className="group relative flex items-center gap-2 px-4 py-1.5 rounded-xl font-extrabold text-xs text-black border transition-all duration-200 cursor-pointer shadow-xs hover:bg-rose-50 active:scale-95"
              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#000000' }}
              title="Skip Tour"
            >
              <span className="w-4 h-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 group-hover:rotate-90 transition-transform duration-200">
                <X className="w-2.5 h-2.5 text-rose-600 stroke-[3]" />
              </span>
              <span className="tracking-wider uppercase text-[11px] font-mono font-bold text-black" style={{ color: '#000000' }}>Skip</span>
            </button>
          </div>
        </div>

        {/* Card Content Body - Crystal Clear Light Color Scheme */}
        <div className="p-5 sm:p-6 space-y-4 text-black" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border text-[#8f043b] border-[#8f043b]/40 bg-[#8f043b]/10 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8f043b]" />
              {currentStep.category}
            </div>
            <h3 
              className="text-base sm:text-xl font-black text-black leading-snug tracking-tight"
              style={{ color: '#000000' }}
            >
              {currentStep.title}
            </h3>
            <p 
              className="text-sm sm:text-[15.5px] text-black font-bold leading-relaxed mt-2.5"
              style={{ color: '#000000' }}
            >
              {currentStep.description}
            </p>
          </div>

          {/* Real Embedded Dashboard Sample Content Box - Light Scheme High Contrast */}
          <div 
            className="p-4 rounded-xl border space-y-2.5 font-mono text-xs shadow-xs text-black"
            style={{
              backgroundColor: '#faf5f7',
              borderColor: '#e8d5de',
              borderLeftWidth: '5px',
              borderLeftColor: '#8f043b',
              color: '#000000'
            }}
          >
            <div className="flex items-center justify-between">
              <span 
                className="text-[11px] uppercase font-black tracking-wider text-black"
                style={{ color: '#000000' }}
              >
                {currentStep.sampleBadgeTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 font-black">
                REAL DATA
              </span>
            </div>
            <div 
              className="text-xs sm:text-[14.5px] text-black font-black leading-relaxed font-sans"
              style={{ color: '#000000' }}
            >
              {currentStep.sampleBadgeContent}
            </div>
          </div>

          {/* Action Tip - Explicit Light Background with Black Text */}
          {currentStep.actionTip && (
            <div 
              className="flex items-start gap-2.5 text-xs sm:text-[14px] text-black px-4 py-3 rounded-xl border shadow-xs"
              style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#000000' }}
            >
              <HelpCircle className="w-4 h-4 text-[#8f043b] shrink-0 mt-0.5" />
              <span className="leading-relaxed font-bold text-black" style={{ color: '#000000' }}>
                {currentStep.actionTip}
              </span>
            </div>
          )}
        </div>

        {/* Card Footer Navigation & Play / Pause / Skip Controls - Clean Light Scheme */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-black" style={{ backgroundColor: '#faf8fa', color: '#000000' }}>
          {/* Left: Play / Pause Button (NO text 'pause') & Attractive Skip & Dots */}
          <div className="flex items-center gap-2.5">
            {/* Play / Pause Toggle Button: NO text 'pause', Play has text 'Play' - Light Button */}
            <button
              onClick={handleTogglePlayPause}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs hover:bg-slate-50"
              style={{ 
                backgroundColor: '#ffffff', 
                borderColor: isPlaying ? '#f59e0b' : '#10b981', 
                color: '#000000' 
              }}
              title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
            >
              {isPlaying ? (
                /* Icon only when playing - Strictly NO text 'pause' */
                <Pause className="w-4 h-4 text-amber-600 fill-amber-600" />
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span className="font-extrabold text-black" style={{ color: '#000000' }}>Play</span>
                </>
              )}
            </button>

            {/* Attractive Light Skip Button in Footer */}
            <button
              onClick={handleSkipGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs hover:bg-rose-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#000000' }}
              title="Skip Tour"
            >
              <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
              <span className="tracking-wide uppercase text-[11px] font-mono font-bold text-black" style={{ color: '#000000' }}>Skip</span>
            </button>

            {/* Step Indicator Dots */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex 
                      ? 'w-5 bg-[#8f043b]' 
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  style={{
                    backgroundColor: idx === currentStepIndex ? '#8f043b' : '#cbd5e1'
                  }}
                  title={`Go to step ${idx + 1}: ${s.title}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Prev & Next Buttons - Clean Light Scheme Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                currentStepIndex === 0 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-slate-50'
              }`}
              style={{ 
                backgroundColor: currentStepIndex === 0 ? '#f8fafc' : '#ffffff', 
                borderColor: '#cbd5e1', 
                color: currentStepIndex === 0 ? '#94a3b8' : '#000000' 
              }}
              title="Previous Step"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold text-black" style={{ color: '#000000' }}>Prev</span>
            </button>

            {/* Next / Finish Button - Clean Light Button with Ingress Accent Border */}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-black hover:bg-rose-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              style={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#8f043b', 
                borderWidth: '2px', 
                color: '#000000' 
              }}
              title={currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next Step'}
            >
              <span className="text-black font-black" style={{ color: '#000000' }}>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
