/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, MapPin, ShieldCheck, ShieldAlert,
  ArrowRight, TrendingUp, DollarSign, PackageCheck, Car, Truck,
  ChevronDown, ChevronUp, Sparkles, Building2,
  AlertCircle, CheckCircle2, CreditCard, FileSpreadsheet
} from 'lucide-react';
import { Dealership } from '../types';
import { getModelStockForDealer } from '../data/mockData';
import { exportStockAvailableFeature } from '../utils/excelExport';

interface DealershipDetailsProps {
  dealership: Dealership;
  onClearFilter: () => void;
  totalMarketRevenue?: number;
}

const formatCurrency = (val: number) => {
  return `RM ${Math.round(val).toLocaleString('en-MY')}`;
};

export function DealershipDetails({ dealership, onClearFilter, totalMarketRevenue = 6992500 }: DealershipDetailsProps) {
  const isAll = dealership.id === 'all';
  const progressPercent = Math.min(Math.round((dealership.bookings / dealership.targetBookings) * 100), 100);

  const [showBranchRepDetails, setShowBranchRepDetails] = useState<boolean>(false);
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'NON_AVAILABLE'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'NOT_YET_PAID'>('ALL');

  useEffect(() => {
    const handleAheadEvent = () => {
      setShowBranchRepDetails(true);
      const elem = document.getElementById('stock-available-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('open-stock-branch-rep-details', handleAheadEvent);
    return () => window.removeEventListener('open-stock-branch-rep-details', handleAheadEvent);
  }, []);

  const modelStock = getModelStockForDealer(dealership.id || dealership.name);
  const totalStockCount = modelStock.reduce((acc, curr) => acc + curr.totalAvailable, 0);
  const totalOnHandCount = modelStock.reduce((acc, curr) => acc + curr.stockOnHand, 0);
  const totalInTransitCount = modelStock.reduce((acc, curr) => acc + curr.stockInTransit, 0);
  const totalPaidUnits = modelStock.reduce((acc, curr) => acc + (curr.paidUnits || 0), 0);
  const totalNotYetPaidUnits = modelStock.reduce((acc, curr) => acc + (curr.notYetPaidUnits || 0), 0);
  
  const inStockCount = modelStock.filter(m => m.status === 'In Stock').length;
  const nonAvailableCount = modelStock.filter(m => m.status === 'Non Available').length;
  const paidStockCount = modelStock.filter(m => (m.paidUnits || 0) > 0).length;
  const notYetPaidStockCount = modelStock.filter(m => (m.notYetPaidUnits || 0) > 0).length;

  const displayedModelStock = modelStock.filter(m => {
    if (stockFilter === 'IN_STOCK' && m.status !== 'In Stock') return false;
    if (stockFilter === 'NON_AVAILABLE' && m.status !== 'Non Available') return false;
    if (paymentFilter === 'PAID' && (m.paidUnits || 0) === 0) return false;
    if (paymentFilter === 'NOT_YET_PAID' && (m.notYetPaidUnits || 0) === 0) return false;
    return true;
  });

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md" id="dealership-detailed-analysis">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 pb-4 border-b border-slate-850">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            {isAll ? 'Consolidated Overview' : 'Franchise Detail Analysis'}
          </span>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            {dealership.name}
            {!isAll && (
              <span className="text-xs font-normal font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-750">
                {dealership.brand}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{dealership.location}</span>
          </div>
        </div>

        {!isAll && (
          <button
            onClick={onClearFilter}
            className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all duration-200 cursor-pointer"
          >
            Reset to Consolidated Overview
          </button>
        )}
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Location Standing */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Location Status</span>
            {dealership.status === 'optimal' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </div>
          <div className="mt-4">
            <span className={`text-sm font-semibold capitalize ${
              dealership.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {dealership.status === 'optimal' ? 'Optimal Performance' : 'Attention Flagged'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {dealership.status === 'optimal' ? 'Operating at peak efficiency' : 'Underperforming sales targets'}
            </span>
          </div>
        </div>

        {/* Metric 2: Revenue generation */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Total Revenue Share</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-slate-100 font-mono">
              {formatCurrency(dealership.revenue)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {isAll ? '100% aggregate share' : `${((dealership.revenue / totalMarketRevenue) * 100).toFixed(1)}% of total market`}
            </span>
          </div>
        </div>

        {/* Metric 3: Best Seller */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Top-Selling Vehicle</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-slate-200 block truncate">
              {dealership.topModel}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              Most test drives converted
            </span>
          </div>
        </div>

        {/* Metric 4: Workforce Intensity */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Active Sales Workforce</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-slate-100 font-mono">
              {dealership.activeSalesReps} Reps
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              ~{(dealership.bookings / dealership.activeSalesReps).toFixed(1)} bookings per rep today
            </span>
          </div>
        </div>
      </div>

      {/* Target Progress */}
      <div className="mt-4">
        <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3">
            Target Completion Rate
          </h4>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              {/* Custom SVG gauge circle */}
              <svg width="80" height="80" className="transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="var(--circle-bg, #1e293b)" strokeWidth="6" fill="transparent" />
                <motion.circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke={progressPercent >= 100 ? '#10b981' : progressPercent >= 75 ? '#6366f1' : '#f59e0b'} 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray="201"
                  initial={{ strokeDashoffset: 201 }}
                  animate={{ strokeDashoffset: 201 - (progressPercent / 100) * 201 }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-100">
                {progressPercent}%
              </div>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Consolidated Bookings:</span>
                <span className="text-slate-100 font-bold">{dealership.bookings + dealership.cancellations}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Net Active Bookings:</span>
                <span className="text-cyan-400 font-bold">{dealership.bookings}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Daily Target:</span>
                <span className="text-slate-200 font-medium">{dealership.targetBookings}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2 leading-tight">
                {progressPercent >= 100 
                  ? '✓ Target quota successfully secured for the current business cycle.' 
                  : `Needs ${dealership.targetBookings - dealership.bookings} additional bookings to reach optimal status.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Stock Available Section */}
      <div className="mt-4" id="stock-available-section">
        <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4">
          {/* Header Row: Title, Filters & Global Controls */}
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-3 mb-4 pb-3 border-b border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Stock Available by Model {isAll ? '(All Dealerships Summary)' : `(${dealership.name})`}
                </h4>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Total Available: <strong className="text-cyan-300">{totalStockCount} Units</strong></span>
                <span className="text-slate-500">({totalOnHandCount} On-Hand • {totalInTransitCount} In-Transit)</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Stock Paid: <strong>{totalPaidUnits} Units</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Not Yet Paid: <strong>{totalNotYetPaidUnits} Units</strong>
                </span>
              </div>
            </div>

            {/* Quick Status Filters & Details Button */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {/* Availability Filter */}
              <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setStockFilter('ALL')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    stockFilter === 'ALL'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({modelStock.length})
                </button>
                <button
                  onClick={() => setStockFilter('IN_STOCK')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    stockFilter === 'IN_STOCK'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-emerald-400/80 hover:text-emerald-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock ({inStockCount})
                </button>
                <button
                  onClick={() => setStockFilter('NON_AVAILABLE')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    stockFilter === 'NON_AVAILABLE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-rose-400/80 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Non Available ({nonAvailableCount})
                </button>
              </div>

              {/* Stock Payment Status Filter */}
              <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setPaymentFilter('ALL')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    paymentFilter === 'ALL'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Show all stock payment statuses"
                >
                  All Payment
                </button>
                <button
                  onClick={() => setPaymentFilter('PAID')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    paymentFilter === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-emerald-400/80 hover:text-emerald-300'
                  }`}
                  title="Filter to models with paid stock"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Paid ({paidStockCount})
                </button>
                <button
                  onClick={() => setPaymentFilter('NOT_YET_PAID')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    paymentFilter === 'NOT_YET_PAID'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                  title="Filter to models with stock not yet paid"
                >
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Not Yet Paid ({notYetPaidStockCount})
                </button>
              </div>

              <button 
                onClick={() => setShowBranchRepDetails(!showBranchRepDetails)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  showBranchRepDetails 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                    : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800'
                }`}
                title="Toggle detailed stock availability by branch"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Details</span>
                <span className="text-[10px] opacity-80">(Branches)</span>
                {showBranchRepDetails ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              {/* Export Stock Table to Excel */}
              <button
                onClick={() => exportStockAvailableFeature(displayedModelStock, dealership.name)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border bg-slate-900 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
                title="Download Stock Available by Model & Payment Status table to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedModelStock.map((item) => {
              const netUnreserved = item.totalAvailable - item.reserved;
              const fillPercentage = item.totalAvailable > 0 ? Math.round((item.reserved / item.totalAvailable) * 100) : 0;
              const isCardExpanded = showBranchRepDetails || expandedModelId === item.id;
              const isInStock = item.status === 'In Stock';

              return (
                <div 
                  key={item.id}
                  className={`rounded-xl p-3.5 transition-all ${
                    isInStock
                      ? isCardExpanded
                        ? 'bg-slate-900/95 border border-emerald-500/40 shadow-lg'
                        : 'bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30'
                      : isCardExpanded
                        ? 'bg-rose-950/20 border border-rose-900/50 shadow-lg'
                        : 'bg-rose-950/10 border border-rose-900/30 hover:border-rose-800/40'
                  }`}
                >
                  {/* Top Bar: Brand, Model Name & Eye-Catching Status Badges */}
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                        {item.brand}
                      </span>
                      <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5 truncate">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.model}</span>
                      </h5>
                    </div>

                    {/* Prominent Eye-Catching Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isInStock ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>IN STOCK</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>NON AVAILABLE</span>
                        </div>
                      )}

                      {/* Stock Payment Status Badge */}
                      {isInStock && (
                        item.paymentStatus === 'Paid' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>STOCK PAID</span>
                          </div>
                        ) : item.paymentStatus === 'Not Yet Paid' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                            <span>NOT YET PAID</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                            <span>PARTIALLY PAID</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Core Metrics: In Stock vs Non Available */}
                  {isInStock ? (
                    <>
                      {/* Simple 2-Stat Hero Block */}
                      <div className="grid grid-cols-2 gap-2 my-2.5">
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
                          <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-wider">Ready to Sell</span>
                          <span className="text-lg font-bold font-mono text-emerald-400 block mt-0.5">
                            {netUnreserved} <span className="text-[10px] text-slate-500 font-normal">units</span>
                          </span>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
                          <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-wider">Total Stock</span>
                          <span className="text-lg font-bold font-mono text-cyan-300 block mt-0.5">
                            {item.totalAvailable} <span className="text-[10px] text-slate-500 font-normal">units</span>
                          </span>
                        </div>
                      </div>

                      {/* Clean Breakdown Strip */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-md border border-slate-850">
                        <span>On-Hand: <strong className="text-slate-200">{item.stockOnHand}</strong></span>
                        <span className="text-slate-700">•</span>
                        <span>Transit: <strong className="text-slate-300">{item.stockInTransit}</strong></span>
                        <span className="text-slate-700">•</span>
                        <span>Reserved: <strong className="text-amber-300">{item.reserved}</strong></span>
                      </div>

                      {/* Stock Status (Paid vs Not Yet Paid) Detailed Breakdown Strip */}
                      <div className="mt-2 p-2 rounded-lg bg-slate-950/70 border border-slate-850 text-[10px] font-mono">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400 flex items-center gap-1 font-semibold">
                            <CreditCard className="w-3 h-3 text-cyan-400" />
                            <span>Stock Status:</span>
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            item.paymentStatus === 'Paid'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : item.paymentStatus === 'Not Yet Paid'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-cyan-400 bg-cyan-500/10'
                          }`}>
                            {item.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-800/70">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            Paid: {item.paidUnits} <span className="text-[9px] text-slate-500 font-normal">units</span>
                          </span>
                          <span className="text-slate-700">•</span>
                          <span className={item.notYetPaidUnits > 0 ? "text-amber-400 font-bold flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                            Not Yet Paid: {item.notYetPaidUnits} <span className="text-[9px] text-slate-500 font-normal">units</span>
                          </span>
                        </div>
                        {/* Visual Ratio Progress Bar: Paid (Emerald) vs Not Yet Paid (Amber) */}
                        {item.totalAvailable > 0 && (
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden flex mt-1.5">
                            <div 
                              className="bg-emerald-400 h-full transition-all" 
                              style={{ width: `${Math.round((item.paidUnits / item.totalAvailable) * 100)}%` }} 
                              title={`Paid: ${item.paidUnits} units (${Math.round((item.paidUnits / item.totalAvailable) * 100)}%)`}
                            />
                            <div 
                              className="bg-amber-400 h-full transition-all" 
                              style={{ width: `${Math.round((item.notYetPaidUnits / item.totalAvailable) * 100)}%` }} 
                              title={`Not Yet Paid: ${item.notYetPaidUnits} units (${Math.round((item.notYetPaidUnits / item.totalAvailable) * 100)}%)`}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Simple Zero Inventory Alert Block */
                    <div className="my-2.5 py-3.5 px-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-rose-300 font-mono font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>0 Units Available</span>
                      </div>
                      <p className="text-[10px] text-rose-400/80 font-mono mt-1">
                        0 On-Hand • 0 In-Transit • Stock Status: Awaiting Restock (0 Units Pending Payment)
                      </p>
                    </div>
                  )}

                  {/* Branch Stock Breakdown Toggle */}
                  {item.branchBreakdown && item.branchBreakdown.length > 0 && (
                    <button
                      onClick={() => setExpandedModelId(isCardExpanded ? null : item.id)}
                      className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg text-[10px] font-mono flex items-center justify-between text-slate-400 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Branches ({item.branchBreakdown.length})</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                        {isCardExpanded ? 'Hide' : 'Details'}
                        {isCardExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                    </button>
                  )}

                  {/* Branch Stock Detailed Breakdown Panel */}
                  <AnimatePresence>
                    {isCardExpanded && item.branchBreakdown && item.branchBreakdown.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            Branch Stock Breakdown:
                          </span>
                        </div>

                        <div className="space-y-2">
                          {item.branchBreakdown.map((br) => {
                            const brNet = br.totalAvailable - br.reserved;
                            const isBrInStock = br.status === 'In Stock';
                            return (
                              <div 
                                key={br.branchName}
                                className="bg-slate-950/70 border border-slate-800/80 rounded-md p-2 hover:border-slate-700/80 transition-all"
                              >
                                <div className="flex justify-between items-start text-xs font-semibold gap-2">
                                  <div>
                                    <span className="text-[11px] text-indigo-300 font-bold block font-mono">
                                      {br.branchName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono font-normal flex items-center gap-1 mt-0.5">
                                      <Users className="w-3 h-3 text-cyan-400 shrink-0" />
                                      {br.totalSalesReps} Sales Representatives
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 border ${
                                      isBrInStock
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isBrInStock ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                      {br.status}
                                    </span>
                                    {isBrInStock && (
                                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                                        br.paymentStatus === 'Paid'
                                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                          : br.paymentStatus === 'Not Yet Paid'
                                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                      }`}>
                                        {br.paymentStatus === 'Paid' ? 'PAID' : br.paymentStatus === 'Not Yet Paid' ? 'NOT YET PAID' : 'PARTIALLY PAID'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isBrInStock ? (
                                  <>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900/90 rounded p-1.5 mt-2 border border-slate-800/80">
                                      <span>Ready: <strong className="text-emerald-400">{brNet}</strong></span>
                                      <span className="text-slate-700">•</span>
                                      <span>Total: <strong className="text-cyan-300">{br.totalAvailable}</strong></span>
                                      <span className="text-slate-700">•</span>
                                      <span>Reserved: <strong className="text-amber-300">{br.reserved}</strong></span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/60 rounded px-2 py-1 mt-1 border border-slate-850">
                                      <span className="text-slate-400 flex items-center gap-1">
                                        <CreditCard className="w-2.5 h-2.5 text-cyan-400" />
                                        <span>Payment Status:</span>
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-emerald-400 font-bold">Paid: {br.paidUnits}</span>
                                        <span className="text-slate-700">•</span>
                                        <span className={br.notYetPaidUnits > 0 ? "text-amber-300 font-bold" : "text-slate-500"}>
                                          Not Yet Paid: {br.notYetPaidUnits}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-[10px] font-mono text-rose-400 bg-rose-950/20 rounded p-1 text-center mt-1.5 border border-rose-900/30">
                                    0 units available at this branch
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

