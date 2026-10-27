/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, Target, RefreshCw, AlertCircle, ShoppingBag, ShieldAlert, XCircle, Tag, Filter, CreditCard, UserX,
  Facebook, Share2, RotateCcw, Footprints, MapPin, Sparkles, Video, Briefcase, Globe, UserCheck, Navigation, FilePlus, CheckSquare, Layers, ChevronRight, ChevronDown, ChevronUp, PieChart, Calendar, FileSpreadsheet
} from 'lucide-react';
import { HourlyTrend, ConversionFunnel, CancellationReason, Dealership, CustomerSourceItem } from '../types';
import { getCustomerSourcesForDealer, getConversionFunnelForDealer, MONTH_NAMES, YEAR_OPTIONS } from '../data/mockData';
import { exportConversionFunnelFeature, exportDealershipComparisonFeature, exportCancellationRiskFeature } from '../utils/excelExport';

// Helper to format currency (RM)
const formatCurrency = (val: number) => {
  if (val >= 1000000) return `RM ${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `RM ${(val / 1000).toFixed(0)}k`;
  return `RM ${val}`;
};

// ==========================================
// 1. Sleek Line/Area Trend Chart
// ==========================================
interface TrendAreaChartProps {
  data: HourlyTrend[];
}

export function TrendAreaChart({ data }: TrendAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 220 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width || 500, height: height || 220 });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max values for scaling
  const maxVal = Math.max(...data.map(d => Math.max(d.bookings, d.registrations))) || 150;
  // Nice round max val for gridlines
  const yMax = Math.ceil(maxVal / 20) * 20;

  // Compute coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const yB = paddingTop + chartHeight - (d.bookings / yMax) * chartHeight;
    const yR = paddingTop + chartHeight - (d.registrations / yMax) * chartHeight;
    return { x, yB, yR, ...d };
  });

  // SVG Path generator
  const getLinePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');
  };

  const getAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const linePath = getLinePath(coords);
    return `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`;
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest index
    const relativeX = mouseX - paddingLeft;
    const index = Math.round((relativeX / chartWidth) * (data.length - 1));
    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);
    } else {
      setHoveredIndex(null);
    }
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden" id="trend-area-chart-container">
      {/* Background neon grid glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Live Activity Timeline</span>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Hourly Booking Velocity
          </h3>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-slate-300">Bookings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
            <span className="text-slate-300">Registrations</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-56 relative select-none">
        <svg 
          width={width} 
          height={height} 
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="bookingsGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="registrationsGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = paddingTop + p * chartHeight;
            const gridVal = Math.round(yMax * (1 - p));
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--chart-grid, #1e293b)" 
                  strokeWidth="1" 
                  strokeDasharray="4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  fill="#64748b" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Hours */}
          {points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1).map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              className="opacity-80"
            >
              {p.time}
            </text>
          ))}

          {/* Areas */}
          <path 
            d={getAreaPath(points.map(p => ({ x: p.x, y: p.yB })))} 
            fill="url(#bookingsGlow)" 
          />
          <path 
            d={getAreaPath(points.map(p => ({ x: p.x, y: p.yR })))} 
            fill="url(#registrationsGlow)" 
          />

          {/* Lines */}
          <path 
            d={getLinePath(points.map(p => ({ x: p.x, y: p.yB })))} 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d={getLinePath(points.map(p => ({ x: p.x, y: p.yR })))} 
            fill="none" 
            stroke="#a78bfa" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            strokeDasharray="1 1"
          />

          {/* Hover Tracker Vertical Bar */}
          {hoveredPoint && (
            <line 
              x1={hoveredPoint.x} 
              y1={paddingTop} 
              x2={hoveredPoint.x} 
              y2={paddingTop + chartHeight} 
              stroke="var(--chart-tracker, #334155)" 
              strokeWidth="1" 
              strokeDasharray="3"
            />
          )}

          {/* Active Circles */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                {/* Bookings Node */}
                <circle 
                  cx={p.x} 
                  cy={p.yB} 
                  r={isHovered ? 5 : 3} 
                  fill="var(--chart-node-bg, #09090b)"
                  stroke="#6366f1"
                  strokeWidth={isHovered ? 3 : 1.5}
                  className="transition-all duration-150"
                />
                {isHovered && (
                  <circle 
                    cx={p.x} 
                    cy={p.yB} 
                    r={10} 
                    fill="#6366f1" 
                    fillOpacity="0.15" 
                    className="animate-ping"
                  />
                )}

                {/* Registrations Node */}
                <circle 
                  cx={p.x} 
                  cy={p.yR} 
                  r={isHovered ? 4.5 : 2} 
                  fill="var(--chart-node-bg, #09090b)"
                  stroke="#a78bfa"
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] text-xs flex flex-col gap-1 min-w-[120px] backdrop-blur-md"
              style={{
                left: `${Math.min(Math.max(hoveredPoint.x - 60, paddingLeft), width - 140)}px`,
                top: `${Math.min(hoveredPoint.yB - 80, chartHeight - 40)}px`
              }}
            >
              <div className="text-slate-400 font-mono text-[10px] border-b border-slate-800 pb-1 flex justify-between">
                <span>Timeline</span>
                <span className="text-slate-200 font-semibold">{hoveredPoint.time}</span>
              </div>
              <div className="flex justify-between items-center text-indigo-400 mt-1">
                <span>Bookings:</span>
                <span className="font-bold">{hoveredPoint.bookings}</span>
              </div>
              <div className="flex justify-between items-center text-violet-400">
                <span>Registrations:</span>
                <span className="font-bold">{hoveredPoint.registrations}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[10px] pt-1 mt-0.5 border-t border-slate-800/80">
                <span>Conversion:</span>
                <span className="text-slate-300 font-mono font-medium">{hoveredPoint.conversions}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ==========================================
// 2. Interactive Conversion Funnel Chart with Customer Sources
// ==========================================
interface ConversionFunnelChartProps {
  data?: ConversionFunnel[];
  selectedDealerId?: string;
  selectedDealerName?: string;
  dealerObj?: Dealership;
  multiplier?: number;
  filterLabel?: string;
  branchName?: string;
}

export function ConversionFunnelChart({ 
  selectedDealerId = 'all', 
  selectedDealerName = 'All Dealerships Summary',
  multiplier = 1,
  filterLabel,
  branchName
 }: ConversionFunnelChartProps) {
  // Use current period multiplier calibrated to baseline dealership numbers
  const rawFunnelData = getConversionFunnelForDealer(selectedDealerId, 2026, 7, multiplier);
  const totalLeads = rawFunnelData.reduce((sum, item) => sum + item.count, 0) || 1;

  // Sort descending by leads count and compute percentage based on leads
  const funnelData = [...rawFunnelData]
    .map(item => ({
      ...item,
      leadsPercentage: Number(((item.count / totalLeads) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);

  const getSourceIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Facebook': return <Facebook className="w-3.5 h-3.5" style={{ color }} />;
      case 'UserCheck': return <UserCheck className="w-3.5 h-3.5" style={{ color }} />;
      case 'RotateCcw': return <RotateCcw className="w-3.5 h-3.5" style={{ color }} />;
      case 'Footprints': return <Footprints className="w-3.5 h-3.5" style={{ color }} />;
      case 'MapPin': return <MapPin className="w-3.5 h-3.5" style={{ color }} />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" style={{ color }} />;
      case 'Video': return <Video className="w-3.5 h-3.5" style={{ color }} />;
      case 'Briefcase': return <Briefcase className="w-3.5 h-3.5" style={{ color }} />;
      default: return <Globe className="w-3.5 h-3.5" style={{ color }} />;
    }
  };

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md" id="conversion-funnel-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-800/60 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono block">Customer Pipeline Analytics</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
              {selectedDealerId === 'all' || !selectedDealerId
                ? 'All Dealerships Summary'
                : selectedDealerName}
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
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mt-0.5">
            <Users className="w-4 h-4 text-emerald-400" /> Customer Sources Funnel
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800/60 text-[10px] font-mono text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-1.5">
            <span className="text-slate-400">Total Leads:</span>
            <span className="text-slate-100 font-bold">{totalLeads}</span>
          </div>

          <button
            onClick={() => exportConversionFunnelFeature(rawFunnelData, selectedDealerName, filterLabel || 'FY 2026')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
            title="Download Customer Pipeline & Conversion Funnel to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Customer Sources Funnel Visualization */}
      <div className="space-y-2">
        {funnelData.map((item, idx) => {
          const percentageOfTotal = item.leadsPercentage;
          
          return (
            <div 
              key={item.id}
              className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-950/70 transition-all duration-200 flex items-center justify-between gap-2.5"
            >
              {/* Left: Source Icon & Stage Name (font matching Maybank) */}
              <div className="flex items-center gap-2 min-w-0 shrink-0">
                <span className="text-[10px] font-mono font-bold text-slate-500 w-4 text-center">
                  #{idx + 1}
                </span>
                <div 
                  className="p-1.5 rounded-lg border border-slate-800 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}18`, borderColor: `${item.color}40` }}
                >
                  {getSourceIcon(item.icon, item.color)}
                </div>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[150px]">
                  {item.stage}
                </span>
              </div>

              {/* Center: In-line Progress Bar */}
              <div className="flex-1 min-w-[36px] max-w-[140px] bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 relative mx-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentageOfTotal}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`
                  }}
                />
              </div>

              {/* Right: Key Metrics in Single Line (Conversion % based on Leads) */}
              <div className="flex items-center gap-2 font-mono shrink-0">
                <span className="text-xs font-mono font-bold text-slate-100">
                  {item.count.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">Leads</span>
                </span>
                <div className="bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                  {item.leadsPercentage}% Conv
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ==========================================
// 3. Dealership Comparison Bar Chart
// ==========================================
interface ComparisonChartProps {
  dealerships: Dealership[];
  onSelect: (id: string) => void;
  selectedId: string;
}

export function DealershipComparisonChart({ dealerships, onSelect, selectedId }: ComparisonChartProps) {
  // Filter out the 'all' option for exact side-by-side dealerships
  const list = dealerships.filter(d => d.id !== 'all');

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md" id="dealership-comparison-container">
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Performance Index</span>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
            <Target className="w-4 h-4 text-indigo-400" /> Bookings vs Target Goal
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDealershipComparisonFeature(dealerships)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
            title="Download Dealership Performance Index to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {list.map((dealer) => {
          const ratio = Math.min((dealer.bookings / dealer.targetBookings) * 100, 100);
          const isSelected = selectedId === dealer.id;
          
          return (
            <div 
              key={dealer.id}
              onClick={() => onSelect(dealer.id)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-slate-800/40 border-indigo-500/50 shadow-[0_0_15px_-5px_rgba(99,102,241,0.15)]' 
                  : 'bg-slate-950/20 border-slate-800/50 hover:bg-slate-800/20 hover:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    dealer.status === 'optimal' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    dealer.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                    'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  }`} />
                  <span className="text-xs font-semibold text-slate-200">{dealer.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">({dealer.brand})</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-slate-400">Bookings:</span>
                  <span className="text-slate-200 font-bold">{dealer.bookings}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-500 font-medium">{dealer.targetBookings} Target</span>
                </div>
              </div>

              {/* Stacked bar visual */}
              <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden relative">
                {/* Secondary Target Marker */}
                <div className="absolute right-0 top-0 h-full w-0.5 bg-slate-700 z-10" title="Target Baseline" />

                {/* Actual Bar */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    ratio >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                    ratio >= 75 ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)]' :
                    'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  }`}
                />
              </div>

              {/* Footnote statistics */}
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Conv Rate: <strong className="text-slate-300">{dealer.conversionRate}%</strong></span>
                  <span>Registrations: <strong className="text-slate-300">{dealer.registrations}</strong></span>
                </div>
                <div>
                  <span>Est Revenue: <strong className="text-indigo-400">{formatCurrency(dealer.revenue)}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ==========================================
// 4. Booking Cancellation & Rejection Breakdown (Doughnut & Keywords)
// ==========================================
interface CancellationChartProps {
  reasons: CancellationReason[];
  selectedDealerName?: string;
  selectedDealerId?: string;
  filterLabel?: string;
  branchName?: string;
}

export function CancellationDoughnutChart({ reasons, selectedDealerName, selectedDealerId, filterLabel, branchName }: CancellationChartProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'rejection' | 'cancellation'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Compute category breakdown totals
  const rejectionList = reasons.filter(r => r.category === 'rejection');
  const cancellationList = reasons.filter(r => r.category === 'cancellation');

  const rejectionTotal = rejectionList.reduce((sum, r) => sum + r.count, 0);
  const cancellationTotal = cancellationList.reduce((sum, r) => sum + r.count, 0);
  const grandTotal = rejectionTotal + cancellationTotal;

  // Filter reasons based on activeTab
  const filteredReasons = reasons.filter(r => activeTab === 'all' ? true : r.category === activeTab);
  const filteredTotal = filteredReasons.reduce((sum, r) => sum + r.count, 0);

  // SVG parameters
  const size = 160;
  const radius = 60;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke strokeDashoffset
  let accumulatedAngle = 0;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative" id="cancellation-breakdown-container">
      <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 blur-[45px] rounded-full pointer-events-none" />

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800/60 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono block">Attrition Risk Analysis</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
              {selectedDealerId === 'all' || !selectedDealerId
                ? 'All Dealerships Summary (Mitsubishi, PERODUA, PROTON e.MAS)'
                : selectedDealerName}
            </span>
            {filterLabel && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                {filterLabel}
              </span>
            )}
            {branchName && branchName !== 'All Branches' && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                Branch: {branchName}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" /> Booking Cancellation & Rejections
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Filters */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => { setActiveTab('all'); setActiveIndex(null); }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({grandTotal})
            </button>
            <button
              onClick={() => { setActiveTab('rejection'); setActiveIndex(null); }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'rejection' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3 h-3 text-rose-400" />
              Rejected ({rejectionTotal})
            </button>
            <button
              onClick={() => { setActiveTab('cancellation'); setActiveIndex(null); }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'cancellation' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserX className="w-3 h-3 text-amber-400" />
              Canceled ({cancellationTotal})
            </button>
          </div>

          <button
            onClick={() => exportCancellationRiskFeature(filteredReasons, selectedDealerName || 'All Dealerships', filterLabel || 'FY 2026')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
            title="Download Cancellation & Rejection Risk Breakdown to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 font-sans">
        {/* Rejection Metric */}
        <div 
          onClick={() => setActiveTab(activeTab === 'rejection' ? 'all' : 'rejection')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'rejection' 
              ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
              : 'bg-slate-950/40 border-slate-800/80 hover:border-rose-900/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />Rejections
            </span>
            <span className="text-xs font-mono font-bold text-rose-300">
              {grandTotal > 0 ? ((rejectionTotal / grandTotal) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="text-lg font-extrabold font-mono text-slate-100">
            {rejectionTotal} <span className="text-xs text-slate-400 font-normal">units</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">#low income</span>
            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">#high commitment</span>
            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">#AKPK</span>
            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">#CTOS/CCRIS</span>
          </div>
        </div>

        {/* Cancellation Metric */}
        <div 
          onClick={() => setActiveTab(activeTab === 'cancellation' ? 'all' : 'cancellation')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'cancellation' 
              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
              : 'bg-slate-950/40 border-slate-800/80 hover:border-amber-900/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Cancellations
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {grandTotal > 0 ? ((cancellationTotal / grandTotal) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="text-lg font-extrabold font-mono text-slate-100">
            {cancellationTotal} <span className="text-xs text-slate-400 font-normal">units</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">#took another brand</span>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">#Personal issue</span>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">#Better offer</span>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">#Trade in issue</span>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">#Stock issue</span>
          </div>
        </div>
      </div>

      {/* Main Breakdown: Doughnut & List */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* SVG Circle Drawing */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {filteredReasons.map((reason, idx) => {
              const sliceShare = filteredTotal > 0 ? (reason.count / filteredTotal) : 0;
              const strokeOffset = circumference - sliceShare * circumference;
              const angleRotation = (accumulatedAngle / (filteredTotal || 1)) * 360;
              accumulatedAngle += reason.count;

              const isHighlighted = activeIndex === idx;

              return (
                <circle
                  key={reason.id || reason.reason}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={reason.color}
                  strokeWidth={isHighlighted ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  transform={`rotate(${angleRotation} ${center} ${center})`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              );
            })}
          </svg>

          {/* Absolute Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-2xl font-bold font-mono text-slate-100">{filteredTotal}</span>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
              {activeTab === 'all' ? 'Total Attrition' : activeTab === 'rejection' ? 'Rejections' : 'Canceled'}
            </span>
          </div>
        </div>

        {/* Dynamic Reasons & Keyword Legend */}
        <div className="flex-1 space-y-2 w-full max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredReasons.map((reason, idx) => {
            const isHovered = activeIndex === idx;
            const categoryLabel = reason.category === 'rejection' ? 'Rejected' : 'Canceled';
            const categoryBadgeBg = reason.category === 'rejection' 
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

            const sharePct = filteredTotal > 0 ? ((reason.count / filteredTotal) * 100).toFixed(1) : '0';

            return (
              <div 
                key={reason.id || reason.reason}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isHovered ? 'bg-slate-950/80 border-slate-700 shadow-md' : 'bg-slate-950/30 border-slate-800/60 hover:bg-slate-950/50'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: reason.color }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${categoryBadgeBg}`}>
                        {categoryLabel}
                      </span>
                      <span className="text-xs text-slate-200 font-semibold truncate">{reason.reason}</span>
                      <span className="text-[10px] font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60 font-semibold">
                        #{reason.keyword}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {reason.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 font-mono text-xs">
                  <span className="text-slate-100 font-bold">{reason.count} units</span>
                  <span className="text-[10px] text-slate-400 font-medium">{sharePct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
