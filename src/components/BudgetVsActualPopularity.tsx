/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  BarChart3, 
  Layers, 
  MapPin, 
  Check, 
  ChevronDown, 
  Percent, 
  Gauge, 
  Sparkles,
  GitBranch,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { exportBudgetVsActualFeature } from '../utils/excelExport';

// ==========================================
// Hierarchical Dataset Definition
// ==========================================
export interface TreeStructure {
  [dealership: string]: {
    branches: string[];
    models: {
      [model: string]: string[]; // variants
    };
  };
}

export const CAR_TREE: TreeStructure = {
  'All Dealership': {
    branches: ['All Branches', 'PUCHONG', 'IMC, BANDAR BARU BANGI', 'BANDAR BARU BANGI', 'SHAH ALAM', 'The Curve', 'MUTIARA DAMANSARA'],
    models: {
      'All Models': ['All Variants'],
      'TRITON': ['All Variants', 'Athlete 2.4L', 'AT Premium 2.4L', 'MT Premium 2.4L', 'AT Standard 2.4L', 'Single Cab 2.4L'],
      'XPANDER': ['All Variants', 'Plus 1.5L', '⁠Base 1.5L'],
      'XFORCE': ['All Variants', 'Ultimate 1.5L', 'Urban 1.5L'],
      'PERODUA AXIA': ['All Variants', '1.0L G CVT', '1.0L X CVT', '1.0L AV CVT'],
      'PERODUA BEZZA': ['All Variants', '1.0L G AT', '1.3L X AT', '1.3L AV AT'],
      'PERODUA MYVI': ['All Variants', '1.3L G CVT', '1.5L H CVT', '1.5L AV CVT'],
      'PERODUA ALZA': ['All Variants', '1.5L H CVT', '1.5L AV CVT'],
      'e.MAS 5': ['All Variants', 'Standard Active', 'Executive Pro'],
      'e.MAS 7': ['All Variants', 'Prime Extended', 'Premium Tech'],
      'e.MAS 7 PHEV': ['All Variants', 'Ultimate Hybrid']
    }
  },
  'Mitsubishi': {
    branches: ['All Branches', 'PUCHONG', 'IMC, BANDAR BARU BANGI', 'SHAH ALAM'],
    models: {
      'All Models': ['All Variants'],
      'TRITON': ['All Variants', 'Athlete 2.4L', 'AT Premium 2.4L', 'MT Premium 2.4L', 'AT Standard 2.4L', 'Single Cab 2.4L'],
      'XPANDER': ['All Variants', 'Plus 1.5L', '⁠Base 1.5L'],
      'XFORCE': ['All Variants', 'Ultimate 1.5L', 'Urban 1.5L']
    }
  },
  'PERODUA': {
    branches: ['All Branches', 'The Curve', 'MUTIARA DAMANSARA'],
    models: {
      'All Models': ['All Variants'],
      'PERODUA AXIA': ['All Variants', '1.0L G CVT', '1.0L X CVT', '1.0L AV CVT'],
      'PERODUA BEZZA': ['All Variants', '1.0L G AT', '1.3L X AT', '1.3L AV AT'],
      'PERODUA MYVI': ['All Variants', '1.3L G CVT', '1.5L H CVT', '1.5L AV CVT'],
      'PERODUA ALZA': ['All Variants', '1.5L H CVT', '1.5L AV CVT']
    }
  },
  'PROTON e.MAS': {
    branches: ['All Branches', 'BANDAR BARU BANGI'],
    models: {
      'All Models': ['All Variants'],
      'e.MAS 5': ['All Variants', 'Standard Active', 'Executive Pro'],
      'e.MAS 7': ['All Variants', 'Prime Extended', 'Premium Tech'],
      'e.MAS 7 PHEV': ['All Variants', 'Ultimate Hybrid']
    }
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthYearPoint {
  label: string;
  month: string;
  year: number;
  index: number;
}

export const TIMELINE: MonthYearPoint[] = [];
const YEARS = [2024, 2025, 2026];
let _counter = 0;
YEARS.forEach(yr => {
  const maxMonth = 12; // Jan to Dec for all years
  for (let m = 0; m < maxMonth; m++) {
    TIMELINE.push({
      label: `${MONTHS[m]} '${String(yr).slice(-2)}`,
      month: MONTHS[m],
      year: yr,
      index: _counter++
    });
  }
});

// Helper to calculate a deterministic seed based on string values
const getStringHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Generates realistic monthly sales data deterministically for a single combination
const getSingleMonthlyBudgetVsActual = (
  dealership: string, 
  branch: string, 
  model: string, 
  variant: string
) => {
  const hash = getStringHash(`${dealership}-${branch}-${model}-${variant}`);
  
  // Base sales volume per variant per month
  let baseBudget = 25;
  if (dealership === 'PERODUA') baseBudget = 75;
  if (model.includes('MYVI')) baseBudget = 110;
  if (model.includes('BEZZA')) baseBudget = 90;
  if (model.includes('TRITON')) baseBudget = 40;
  if (model.includes('e.MAS 7')) baseBudget = 30;
  if (branch === 'The Curve') baseBudget += 15;
  
  // Variant offset
  const variantOffset = (hash % 16) - 8;
  baseBudget = Math.max(8, baseBudget + variantOffset);

  return TIMELINE.map((tp, idx) => {
    // Nice seasonal sales curve (higher around mid-year and year-end)
    const seasonalFactor = Math.sin((tp.index / 11) * Math.PI) * (baseBudget * 0.25);
    // Year factor: 2024: 1.0, 2025: 1.15, 2026: 1.30
    const yearFactor = tp.year === 2024 ? 1.0 : tp.year === 2025 ? 1.15 : 1.30;
    
    const monthlyRandomSeed = Math.cos(tp.index * 2.3 + hash) * (baseBudget * 0.15);
    
    const budget = Math.round((baseBudget + seasonalFactor) * yearFactor + monthlyRandomSeed);
    
    // Deterministic actual performance vs budget
    const performanceFactor = 0.92 + (hash % 19) / 100; // e.g. 92% to 110% of budget
    const varianceRandom = Math.sin(tp.index * 1.8 + hash) * (budget * 0.12);
    const actual = Math.round(budget * performanceFactor + varianceRandom);

    return {
      month: tp.label,
      budget: Math.max(4, budget),
      actual: Math.max(3, actual)
    };
  });
};

// Top-level aggregator that handles "All Dealership", "All Branches", "All Models", and "All Variants"
export const getMonthlyBudgetVsActual = (
  dealership: string, 
  branch: string, 
  model: string, 
  variant: string
) => {
  const isAllDealers = dealership === 'All Dealership' || dealership === 'All Dealerships';
  const isAllBranches = branch === 'All Branches';
  const isAllModels = model === 'All Models';
  const isAllVariants = variant === 'All Variants';

  const hasAll = isAllDealers || isAllBranches || isAllModels || isAllVariants;

  if (hasAll) {
    const result = TIMELINE.map(tp => ({
      month: tp.label,
      budget: 0,
      actual: 0
    }));

    // Determine dealers
    const dealers = isAllDealers
      ? ['Mitsubishi', 'PERODUA', 'PROTON e.MAS'] 
      : [dealership];

    dealers.forEach(d => {
      if (!CAR_TREE[d]) return;

      // Determine branches for this dealer
      const dealerBranches = CAR_TREE[d].branches.filter(b => b !== 'All Branches');
      const branches = isAllBranches
        ? dealerBranches
        : dealerBranches.filter(b => b === branch || b.replace(/\s+/g, '') === branch.replace(/\s+/g, ''));

      if (branches.length === 0) return;

      branches.forEach(b => {
        // Determine models for this dealer
        const dealerModels = Object.keys(CAR_TREE[d].models).filter(m => m !== 'All Models');
        const models = isAllModels
          ? dealerModels
          : dealerModels.filter(m => m === model);

        if (models.length === 0) return;

        models.forEach(m => {
          if (!CAR_TREE[d].models[m]) return;

          // Determine variants for this model
          const modelVariants = CAR_TREE[d].models[m].filter(v => v !== 'All Variants');
          const variants = isAllVariants
            ? modelVariants
            : modelVariants.filter(v => v === variant);

          if (variants.length === 0) return;

          variants.forEach(v => {
            const dataset = getSingleMonthlyBudgetVsActual(d, b, m, v);
            dataset.forEach((point, idx) => {
              result[idx].budget += point.budget;
              result[idx].actual += point.actual;
            });
          });
        });
      });
    });

    return result;
  }

  return getSingleMonthlyBudgetVsActual(dealership, branch, model, variant);
};

export interface BudgetVsActualPopularityProps {
  selectedDealerId?: string;
  selectedDealerName?: string;
  selectedBranchProp?: string;
  timePeriodType?: string;
  financialYear?: string;
  selectedMonth?: string;
  selectedQuarter?: string;
  selectedWeek?: string;
  selectedDay?: string;
}

export const mapDealerName = (idOrName?: string): string => {
  if (!idOrName || idOrName === 'all' || idOrName === 'All Dealerships' || idOrName === 'All Dealership') return 'All Dealership';
  if (idOrName === 'dt-porsche' || idOrName.toLowerCase().includes('mitsubishi') || idOrName.toLowerCase().includes('ingress motors centre')) return 'Mitsubishi';
  if (idOrName === 'ns-audi' || idOrName.toLowerCase().includes('perodua') || (idOrName.toLowerCase().includes('ingress motors') && !idOrName.toLowerCase().includes('centre'))) return 'PERODUA';
  if (idOrName === 'ws-bmw' || idOrName.toLowerCase().includes('proton') || idOrName.toLowerCase().includes('ingress auto')) return 'PROTON e.MAS';
  return 'All Dealership';
};

const getMonthIndex = (monthName?: string): number | null => {
  if (!monthName || monthName === 'All Months') return null;
  const mStr = monthName.toLowerCase();
  if (mStr.startsWith('jan')) return 0;
  if (mStr.startsWith('feb')) return 1;
  if (mStr.startsWith('mar')) return 2;
  if (mStr.startsWith('apr')) return 3;
  if (mStr.startsWith('may')) return 4;
  if (mStr.startsWith('jun')) return 5;
  if (mStr.startsWith('jul')) return 6;
  if (mStr.startsWith('aug')) return 7;
  if (mStr.startsWith('sep')) return 8;
  if (mStr.startsWith('oct')) return 9;
  if (mStr.startsWith('nov')) return 10;
  if (mStr.startsWith('dec')) return 11;
  return 7; // Default August
};

export function BudgetVsActualPopularity({ 
  selectedDealerId, 
  selectedDealerName, 
  selectedBranchProp, 
  timePeriodType,
  financialYear,
  selectedMonth,
  selectedQuarter,
  selectedWeek,
  selectedDay
}: BudgetVsActualPopularityProps = {}) {
  // Tree state
  const [selectedDealer, setSelectedDealer] = useState<string>(() => mapDealerName(selectedDealerName || selectedDealerId));
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [selectedModel, setSelectedModel] = useState<string>('All Models');
  const [selectedVariant, setSelectedVariant] = useState<string>('All Variants');

  // Sync selectedDealer when parent props change
  useEffect(() => {
    const mapped = mapDealerName(selectedDealerName || selectedDealerId);
    if (mapped && CAR_TREE[mapped]) {
      setSelectedDealer(mapped);
    }
  }, [selectedDealerId, selectedDealerName]);

  // Sync selectedBranch when selectedBranchProp changes
  useEffect(() => {
    if (selectedBranchProp) {
      const branches = CAR_TREE[selectedDealer]?.branches || ['All Branches'];
      if (branches.includes(selectedBranchProp)) {
        setSelectedBranch(selectedBranchProp);
      } else {
        setSelectedBranch('All Branches');
      }
    }
  }, [selectedBranchProp, selectedDealer]);

  // Interactive drop-down focus state
  const [activeDropdown, setActiveDropdown] = useState<'dealer' | 'branch' | 'model' | 'variant' | null>(null);

  // Filter mode: 'monthly' | 'accumulative' | 'range'
  const [filterMode, setFilterMode] = useState<'monthly' | 'accumulative' | 'range'>('monthly');

  // Sync filterMode when timePeriodType changes
  useEffect(() => {
    if (timePeriodType) {
      if (timePeriodType.includes('Accumulative') || timePeriodType.includes('YTD') || timePeriodType.includes('Full Year')) {
        setFilterMode('accumulative');
      } else if (timePeriodType.includes('Quarterly') || timePeriodType.includes('MTD') || timePeriodType.includes('Daily')) {
        setFilterMode('range');
      } else {
        setFilterMode('monthly');
      }
    }
  }, [timePeriodType]);

  // Compute default start/end month indices from filters
  const computeMonthIndices = () => {
    let yr = 2026;
    if (financialYear?.includes('2025')) yr = 2025;
    if (financialYear?.includes('2024')) yr = 2024;
    const yearBaseIdx = (yr - 2024) * 12;

    if (timePeriodType === 'Full Year Scope') {
      return { start: yearBaseIdx, end: yearBaseIdx + 11 };
    }
    if (timePeriodType === 'Quarterly') {
      let qStart = 6; let qEnd = 8;
      if (selectedQuarter?.includes('Q1')) { qStart = 0; qEnd = 2; }
      else if (selectedQuarter?.includes('Q2')) { qStart = 3; qEnd = 5; }
      else if (selectedQuarter?.includes('Q3')) { qStart = 6; qEnd = 8; }
      else if (selectedQuarter?.includes('Q4')) { qStart = 9; qEnd = 11; }
      else if (selectedQuarter === 'All Quarters') { qStart = 0; qEnd = 11; }
      return { start: yearBaseIdx + qStart, end: yearBaseIdx + qEnd };
    }
    if (timePeriodType === 'Year to Day (YTD)') {
      const mIdx = getMonthIndex(selectedMonth) ?? 7;
      return { start: yearBaseIdx, end: yearBaseIdx + mIdx };
    }

    // Monthly, Daily, Accumulative Weekly, Month to Day (MTD)
    const mIdx = getMonthIndex(selectedMonth);
    if (mIdx === null) {
      return { start: yearBaseIdx, end: yearBaseIdx + 11 };
    }
    return { start: yearBaseIdx + mIdx, end: yearBaseIdx + mIdx };
  };

  const initialIndices = computeMonthIndices();
  const [startMonthIdx, setStartMonthIdx] = useState<number>(initialIndices.start);
  const [endMonthIdx, setEndMonthIdx] = useState<number>(initialIndices.end);

  // Sync timeline indices when financialYear, timePeriodType, selectedMonth, selectedQuarter change
  useEffect(() => {
    const { start, end } = computeMonthIndices();
    setStartMonthIdx(start);
    setEndMonthIdx(end);
  }, [financialYear, timePeriodType, selectedMonth, selectedQuarter]);

  // Hover state for interactive chart
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 600, height: 260 });

  // Update tree options and auto-select defaults on parent change
  useEffect(() => {
    const branches = CAR_TREE[selectedDealer]?.branches || ['All Branches'];
    if (!branches.includes(selectedBranch)) {
      setSelectedBranch('All Branches');
    }
    
    const models = Object.keys(CAR_TREE[selectedDealer]?.models || {});
    if (!models.includes(selectedModel)) {
      setSelectedModel('All Models');
      setSelectedVariant('All Variants');
    } else {
      const variants = CAR_TREE[selectedDealer]?.models[selectedModel] || ['All Variants'];
      if (!variants.includes(selectedVariant)) {
        setSelectedVariant(variants[0] || 'All Variants');
      }
    }
  }, [selectedDealer]);

  useEffect(() => {
    const models = Object.keys(CAR_TREE[selectedDealer]?.models || {});
    if (models.includes(selectedModel)) {
      const variants = CAR_TREE[selectedDealer]?.models[selectedModel] || ['All Variants'];
      if (!variants.includes(selectedVariant)) {
        setSelectedVariant(variants[0] || 'All Variants');
      }
    } else {
      setSelectedModel('All Models');
      setSelectedVariant('All Variants');
    }
  }, [selectedModel]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Update chart dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setChartDimensions({ width: width || 600, height: height || 260 });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Raw dataset based on selections
  const rawData = getMonthlyBudgetVsActual(
    selectedDealer,
    selectedBranch,
    selectedModel,
    selectedVariant
  );

  // Compute values according to filterMode
  let processedData = rawData.map((d, idx) => {
    if (filterMode === 'accumulative') {
      // Running total from Jan up to idx
      let cumulativeBudget = 0;
      let cumulativeActual = 0;
      for (let i = 0; i <= idx; i++) {
        cumulativeBudget += rawData[i].budget;
        cumulativeActual += rawData[i].actual;
      }
      return {
        month: d.month,
        budget: cumulativeBudget,
        actual: cumulativeActual
      };
    }
    return d; // default monthly or range (range is cropped next)
  });

  // Apply cropping for "range" mode
  if (filterMode === 'range') {
    processedData = processedData.filter((_, idx) => idx >= startMonthIdx && idx <= endMonthIdx);
  }

  // Summary Metrics
  const totalBudget = processedData.reduce((sum, d) => sum + d.budget, 0);
  const totalActual = processedData.reduce((sum, d) => sum + d.actual, 0);
  const budgetVariance = totalActual - totalBudget;
  const variancePercentage = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0;

  // Competing Models Comparison (just like "Compare it against others!")
  const siblingModels = Object.keys(CAR_TREE[selectedDealer].models).filter(m => m !== 'All Models');
  const comparisonList = siblingModels.map(model => {
    // Generate static variant summary
    const firstVariant = CAR_TREE[selectedDealer].models[model][0];
    const monthlyVals = getMonthlyBudgetVsActual(selectedDealer, selectedBranch, model, firstVariant);
    
    // Calculate sum in range or overall
    let sumVal = 0;
    monthlyVals.forEach((val, idx) => {
      if (filterMode === 'range') {
        if (idx >= startMonthIdx && idx <= endMonthIdx) sumVal += val.actual;
      } else {
        sumVal += val.actual;
      }
    });

    return {
      model,
      sales: sumVal,
      isCurrent: model === selectedModel
    };
  }).sort((a, b) => b.sales - a.sales);

  // Rank position overall inside current dealer list
  const currentModelRank = comparisonList.findIndex(c => c.model === selectedModel) + 1;

  // Compute overall dealer volume in current range for dynamic percentage
  let overallDealerVolume = 0;
  siblingModels.forEach(m => {
    const firstV = CAR_TREE[selectedDealer].models[m][0];
    const monthlyVals = getMonthlyBudgetVsActual(selectedDealer, selectedBranch, m, firstV);
    monthlyVals.forEach((val, idx) => {
      if (filterMode === 'range') {
        if (idx >= startMonthIdx && idx <= endMonthIdx) overallDealerVolume += val.actual;
      } else {
        overallDealerVolume += val.actual;
      }
    });
  });

  const modelPercentageOfDealer = overallDealerVolume > 0 
    ? Math.round((totalActual / overallDealerVolume) * 100) 
    : 24;

  // Branch Distribution Breakdown
  // Filter out 'All Branches' so only actual physical branches are compared
  const branches = (CAR_TREE[selectedDealer]?.branches || []).filter(b => b !== 'All Branches');
  const branchList = branches.map(br => {
    const monthlyVals = getMonthlyBudgetVsActual(selectedDealer, br, selectedModel, selectedVariant);
    let sumVal = 0;
    monthlyVals.forEach((val, idx) => {
      if (filterMode === 'range') {
        if (idx >= startMonthIdx && idx <= endMonthIdx) sumVal += val.actual;
      } else {
        sumVal += val.actual;
      }
    });
    return {
      branchName: br,
      sales: sumVal,
      isCurrent: br === selectedBranch
    };
  }).sort((a, b) => b.sales - a.sales);

  const totalAcrossBranches = branchList.reduce((sum, b) => sum + b.sales, 0);
  const selectedBranchData = branchList.find(b => b.branchName === selectedBranch);
  const branchPercentage = totalAcrossBranches > 0 && selectedBranchData
    ? Number(((selectedBranchData.sales / totalAcrossBranches) * 100).toFixed(1))
    : 0;

  // Chart configuration math
  const { width, height } = chartDimensions;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = Math.max(100, width - paddingLeft - paddingRight);
  const chartHeight = Math.max(50, height - paddingTop - paddingBottom);

  const maxChartVal = Math.max(...processedData.map(d => Math.max(d.budget, d.actual))) || 100;
  const yMax = Math.ceil(maxChartVal / 10) * 10;

  // Build SVG coordinates
  const svgPoints = processedData.map((d, i) => {
    const x = paddingLeft + (processedData.length > 1 ? (i / (processedData.length - 1)) * chartWidth : chartWidth / 2);
    const yBudget = paddingTop + chartHeight - (d.budget / yMax) * chartHeight;
    const yActual = paddingTop + chartHeight - (d.actual / yMax) * chartHeight;
    return { x, yBudget, yActual, ...d, index: i };
  });

  const getLinePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  };

  const getAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const linePath = getLinePath(coords);
    return `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`;
  };

  // SVG interactions
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    const relativeX = mouseX - paddingLeft;
    const idx = Math.round((relativeX / chartWidth) * (processedData.length - 1));
    if (idx >= 0 && idx < processedData.length) {
      setHoveredPointIdx(idx);
    } else {
      setHoveredPointIdx(null);
    }
  };

  const hoveredPoint = hoveredPointIdx !== null ? svgPoints[hoveredPointIdx] : null;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative" id="budget-vs-actual-popularity-widget">
      {/* Absolute subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Title section with custom badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Popularity Tracking Engine
          </span>
          
          <p className="text-xs text-slate-400 mt-0.5">
            Compare vehicle popularity and track target forecast vs actual delivery milestones.
          </p> 
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Global summary badge */}
          <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <div className="text-[11px] font-mono">
              <span className="text-slate-400">Network Rank:</span>{' '}
              <strong className="text-indigo-300 font-extrabold">
                {selectedModel === 'All Models' ? 'Aggregate' : `#${currentModelRank}`}
              </strong>{' '}
              {selectedModel !== 'All Models' && <span className="text-slate-500">of {siblingModels.length}</span>}
            </div>
          </div>

          {/* Export to Excel Button */}
          <button
            onClick={() => {
              const rankingsData = comparisonList.map(c => ({
                model: c.model,
                brand: selectedDealer,
                bookings: c.sales,
                registrations: Math.round(c.sales * 0.72),
                cancellations: Math.round(c.sales * 0.12),
                share: overallDealerVolume > 0 ? Number(((c.sales / overallDealerVolume) * 100).toFixed(1)) : 0
              }));
              exportBudgetVsActualFeature(
                processedData,
                rankingsData,
                {
                  dealershipName: selectedDealer,
                  branch: selectedBranch,
                  period: financialYear ? `${financialYear} • ${selectedMonth || 'Full Year'}` : 'Timeline'
                }
              );
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
            title="Download Budget vs Actual & Model Popularity to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          Hierarchical Drilldown Selector (Tree)
          ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        
        {/* 1. Dealership Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">1. Dealership</label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'dealer' ? null : 'dealer');
            }}
            className="w-full flex items-center justify-between bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="truncate">{selectedDealer}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${activeDropdown === 'dealer' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'dealer' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 w-full bg-slate-950 border border-slate-800 rounded-xl mt-1.5 p-1.5 shadow-2xl max-h-60 overflow-y-auto"
              >
                {Object.keys(CAR_TREE).map((dealer) => (
                  <button
                    key={dealer}
                    onClick={() => {
                      setSelectedDealer(dealer);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all text-left ${
                      selectedDealer === dealer 
                        ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{dealer}</span>
                    {selectedDealer === dealer && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Branch Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">2. Branch location</label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'branch' ? null : 'branch');
            }}
            className="w-full flex items-center justify-between bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-2 truncate text-left">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedBranch}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${activeDropdown === 'branch' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'branch' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 w-full bg-slate-950 border border-slate-800 rounded-xl mt-1.5 p-1.5 shadow-2xl max-h-60 overflow-y-auto"
              >
                {CAR_TREE[selectedDealer].branches.map((br) => (
                  <button
                    key={br}
                    onClick={() => {
                      setSelectedBranch(br);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all text-left ${
                      selectedBranch === br 
                        ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{br}</span>
                    {selectedBranch === br && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Model Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">3. Car model</label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'model' ? null : 'model');
            }}
            className="w-full flex items-center justify-between bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-2 truncate text-left">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedModel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${activeDropdown === 'model' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'model' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 w-full bg-slate-950 border border-slate-800 rounded-xl mt-1.5 p-1.5 shadow-2xl max-h-60 overflow-y-auto"
              >
                {Object.keys(CAR_TREE[selectedDealer].models).map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      setSelectedModel(model);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all text-left ${
                      selectedModel === model 
                        ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{model}</span>
                    {selectedModel === model && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Variant Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">4. Variant specification</label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'variant' ? null : 'variant');
            }}
            className="w-full flex items-center justify-between bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition-all duration-150"
          >
            <div className="flex items-center gap-2 truncate text-left">
              <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedVariant}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${activeDropdown === 'variant' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'variant' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 w-full bg-slate-950 border border-slate-800 rounded-xl mt-1.5 p-1.5 shadow-2xl max-h-60 overflow-y-auto"
              >
                {(CAR_TREE[selectedDealer].models[selectedModel] || []).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setSelectedVariant(v);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all text-left ${
                      selectedVariant === v 
                        ? 'bg-indigo-500/10 text-indigo-400 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{v}</span>
                    {selectedVariant === v && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ==========================================
          Dashboard Core Grid (Left Chart, Right Stats)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MIDDLE: Chart Column */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
            {/* Control Bar for Chart Configuration */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Target Forecast vs Actual Delivery Performance
                </h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                  {selectedDealer} • {selectedBranch} • {selectedModel}
                </p>
              </div>

              {/* Toggle controls */}
              <div className="flex bg-slate-900 border border-slate-800/80 p-0.5 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setFilterMode('monthly')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    filterMode === 'monthly' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setFilterMode('accumulative')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    filterMode === 'accumulative' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Accumulative
                </button>
                <button
                  onClick={() => setFilterMode('range')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    filterMode === 'range' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Range
                </button>
              </div>
            </div>

            {/* Dynamic Slider controls for Range Mode */}
            <AnimatePresence>
              {filterMode === 'range' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 mb-5 select-none"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/40">
                    <div className="flex items-center gap-1.5 font-mono text-slate-400 font-semibold text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Select Range Window:
                    </div>
                    <div className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                      {TIMELINE[startMonthIdx]?.label} ➜ {TIMELINE[endMonthIdx]?.label}
                    </div>
                  </div>
                  
                  <div className="px-2 pt-2 pb-5">
                    {/* The Double-handle range slider container */}
                    <div className="relative w-full h-6 flex items-center">
                      {/* Track background */}
                      <div className="absolute left-0 right-0 h-1.5 bg-slate-950 rounded-full border border-slate-800/80" />
                      
                      {/* Active selected range track */}
                      <div 
                        className="absolute h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
                        style={{
                          left: `${(startMonthIdx / (TIMELINE.length - 1)) * 100}%`,
                          width: `${((endMonthIdx - startMonthIdx) / (TIMELINE.length - 1)) * 100}%`
                        }}
                      />
                      
                      {/* Left Range input for Start Month */}
                      <input
                        type="range"
                        min="0"
                        max={TIMELINE.length - 1}
                        value={startMonthIdx}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), endMonthIdx);
                          setStartMonthIdx(val);
                        }}
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none z-20
                          [&::-webkit-slider-thumb]:pointer-events-auto 
                          [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:w-4 
                          [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:rounded-full 
                          [&::-webkit-slider-thumb]:bg-indigo-400 
                          [&::-webkit-slider-thumb]:border-2 
                          [&::-webkit-slider-thumb]:border-slate-950 
                          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.6)]
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:duration-75
                          [&::-webkit-slider-thumb:hover]:scale-125
                          
                          [&::-moz-range-thumb]:pointer-events-auto 
                          [&::-moz-range-thumb]:appearance-none 
                          [&::-moz-range-thumb]:w-4 
                          [&::-moz-range-thumb]:h-4 
                          [&::-moz-range-thumb]:rounded-full 
                          [&::-moz-range-thumb]:bg-indigo-400 
                          [&::-moz-range-thumb]:border-2 
                          [&::-moz-range-thumb]:border-slate-950 
                          [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.6)]
                          [&::-moz-range-thumb]:transition-transform
                          [&::-moz-range-thumb]:duration-75
                          [&::-moz-range-thumb:hover]:scale-125"
                      />

                      {/* Right Range input for End Month */}
                      <input
                        type="range"
                        min="0"
                        max={TIMELINE.length - 1}
                        value={endMonthIdx}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), startMonthIdx);
                          setEndMonthIdx(val);
                        }}
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-none cursor-pointer focus:outline-none z-20
                          [&::-webkit-slider-thumb]:pointer-events-auto 
                          [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:w-4 
                          [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:rounded-full 
                          [&::-webkit-slider-thumb]:bg-violet-400 
                          [&::-webkit-slider-thumb]:border-2 
                          [&::-webkit-slider-thumb]:border-slate-950 
                          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.6)]
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:duration-75
                          [&::-webkit-slider-thumb:hover]:scale-125
                          
                          [&::-moz-range-thumb]:pointer-events-auto 
                          [&::-moz-range-thumb]:appearance-none 
                          [&::-moz-range-thumb]:w-4 
                          [&::-moz-range-thumb]:h-4 
                          [&::-moz-range-thumb]:rounded-full 
                          [&::-moz-range-thumb]:bg-violet-400 
                          [&::-moz-range-thumb]:border-2 
                          [&::-moz-range-thumb]:border-slate-950 
                          [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.6)]
                          [&::-moz-range-thumb]:transition-transform
                          [&::-moz-range-thumb]:duration-75
                          [&::-moz-range-thumb:hover]:scale-125"
                      />
                    </div>

                    {/* Tickmarks and labels below slider */}
                    <div className="relative flex justify-between mt-3 px-1">
                      {TIMELINE.map((tp, idx) => {
                        const isSelected = idx >= startMonthIdx && idx <= endMonthIdx;
                        // Show text labels for key points (every 4th month to avoid overlap, and the very last month)
                        const showLabel = idx % 4 === 0 || idx === TIMELINE.length - 1;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              // Intuitive click behavior: adjust closer handle
                              const distToStart = Math.abs(idx - startMonthIdx);
                              const distToEnd = Math.abs(idx - endMonthIdx);
                              if (distToStart < distToEnd) {
                                if (idx <= endMonthIdx) setStartMonthIdx(idx);
                              } else {
                                if (idx >= startMonthIdx) setEndMonthIdx(idx);
                              }
                            }}
                            className="flex flex-col items-center cursor-pointer group select-none"
                            style={{ width: `${100 / TIMELINE.length}%` }}
                          >
                            <span className={`w-1 h-1 rounded-full mb-1 transition-all ${
                              isSelected ? 'bg-indigo-400 scale-125' : 'bg-slate-700 group-hover:bg-slate-500'
                            }`} />
                            {showLabel && (
                              <span className={`text-[9px] font-mono transition-colors duration-150 whitespace-nowrap ${
                                isSelected 
                                  ? 'text-indigo-300 font-bold' 
                                  : 'text-slate-500 group-hover:text-slate-400'
                              }`}>
                                {tp.label}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Render: SVG Chart Viewport */}
            <div ref={containerRef} className="w-full h-64 relative select-none">
              <svg
                width={width}
                height={height}
                className="overflow-visible cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPointIdx(null)}
              >
                <defs>
                  {/* Neon Glow Definitions */}
                  <linearGradient id="actualGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines */}
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
                        fontSize="9" 
                        fontFamily="monospace" 
                        textAnchor="end"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Month Labels */}
                {svgPoints.map((p, i) => {
                  const step = svgPoints.length > 20 ? 3 : (svgPoints.length > 11 ? 2 : 1);
                  if (i % step !== 0 && i !== svgPoints.length - 1) return null;
                  return (
                    <text
                      key={i}
                      x={p.x}
                      y={height - 8}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="opacity-80"
                    >
                      {p.month}
                    </text>
                  );
                })}

                {/* Actual Sales Filled Area under curve */}
                <path 
                  d={getAreaPath(svgPoints.map(p => ({ x: p.x, y: p.yActual })))} 
                  fill="url(#actualGlow)" 
                />

                {/* Budget Target Line (Distinct Amber Dashed Line) */}
                <path 
                  d={getLinePath(svgPoints.map(p => ({ x: p.x, y: p.yBudget })))} 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Actual Sales Connected Line (Distinct Indigo Solid Line) */}
                <path 
                  d={getLinePath(svgPoints.map(p => ({ x: p.x, y: p.yActual })))} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Vertical Tracker Guide */}
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

                {/* Data Points Nodes */}
                {svgPoints.map((p, i) => {
                  const isHovered = hoveredPointIdx === i;
                  return (
                    <g key={i}>
                      {/* Budget point */}
                      <circle 
                        cx={p.x} 
                        cy={p.yBudget} 
                        r={isHovered ? 4.5 : 2.5} 
                        fill="var(--chart-node-bg, #09090b)"
                        stroke="#f59e0b"
                        strokeWidth={isHovered ? 2.5 : 1}
                        className="transition-all duration-150"
                      />

                      {/* Actual point */}
                      <circle 
                        cx={p.x} 
                        cy={p.yActual} 
                        r={isHovered ? 5.5 : 3} 
                        fill="var(--chart-node-bg, #09090b)"
                        stroke="#6366f1"
                        strokeWidth={isHovered ? 3 : 1.5}
                        className="transition-all duration-150"
                      />
                      {isHovered && (
                        <circle 
                          cx={p.x} 
                          cy={p.yActual} 
                          r={9} 
                          fill="#6366f1" 
                          fillOpacity="0.15" 
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover Interactive Tooltip */}
              <AnimatePresence>
                {hoveredPoint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute pointer-events-none bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] text-xs flex flex-col gap-1 min-w-[140px] backdrop-blur-md"
                    style={{
                      left: `${Math.min(Math.max(hoveredPoint.x - 70, paddingLeft), width - 160)}px`,
                      top: `${Math.min(hoveredPoint.yActual - 90, chartHeight - 30)}px`
                    }}
                  >
                    <div className="text-slate-400 font-mono text-[10px] border-b border-slate-800 pb-1 flex justify-between font-semibold">
                      <span>Month</span>
                      <span className="text-slate-200">{hoveredPoint.month}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400 mt-1">
                      <span>Target Forecast:</span>
                      <span className="font-bold">{hoveredPoint.budget} units</span>
                    </div>
                    <div className="flex justify-between items-center text-indigo-400">
                      <span>Actual:</span>
                      <span className="font-bold">{hoveredPoint.actual} units</span>
                    </div>
                    
                    {/* Variance math on tooltip */}
                    <div className="flex justify-between items-center text-slate-500 text-[10px] pt-1 mt-0.5 border-t border-slate-800/80">
                      <span>Variance:</span>
                      <span className={`font-mono font-bold ${hoveredPoint.actual >= hoveredPoint.budget ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hoveredPoint.actual - hoveredPoint.budget >= 0 ? '+' : ''}
                        {hoveredPoint.actual - hoveredPoint.budget}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Legend indicators */}
            <div className="flex flex-wrap justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-900 text-xs font-mono">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-indigo-500 inline-block rounded-full" />
                  <span className="text-slate-400">Actual Registered Sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 inline-block border-t border-dashed border-amber-500" />
                  <span className="text-slate-400">Target Forecast</span>
                </div>
              </div>

              {/* Mode indication note */}
              <div className="text-[10px] text-slate-500">
                Data generated dynamically in Real-Time
              </div>
            </div>
          </div>

          {/* Budget tracking statistics summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* KPI 1: Target Forecast Total */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Target Forecast</span>
                <span className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Target className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold font-mono text-slate-100">{totalBudget.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-1">units</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Sales target forecast allocation for current selected segment.
              </p>
            </div>

            {/* KPI 2: Actual Delivered Total */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Actual Delivered</span>
                <span className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold font-mono text-indigo-400">{totalActual.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-1">units</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Sum of successfully registered client orders.
              </p>
            </div>

            {/* KPI 3: Variance Gap indicator */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Forecast Variance</span>
                <span className={`p-1 rounded text-xs font-bold font-mono ${
                  budgetVariance >= 0 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono ${budgetVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {budgetVariance >= 0 ? '+' : ''}{budgetVariance.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-slate-500">units</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                {budgetVariance >= 0 
                  ? 'Exceeding target forecast bounds. Excellent pacing.' 
                  : 'Failing to meet designated target allocations.'}
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Comparative Stats, Siblings ranking */}
        <div className="space-y-5">
          
          {/* Comparative model popularity section */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Compare Models</span>
                <h3 className="text-sm font-semibold text-slate-200 mt-0.5">
                  How does it compare against others?
                </h3>
              </div>
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" title="Competitor range volume index" />
            </div>

            <div className="space-y-3.5">
              {comparisonList.map((comp, idx) => {
                const maxSales = comparisonList[0]?.sales || 1;
                const percentOfMax = (comp.sales / maxSales) * 100;
                
                return (
                  <div key={comp.model} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 font-bold">#{idx + 1}</span>
                        <span className={`font-medium ${comp.isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                          {comp.model}
                        </span>
                        {comp.isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>
                      <span className="font-mono text-slate-400 text-[11px] font-bold">
                        {comp.sales.toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">units</span>
                      </span>
                    </div>

                    {/* Progress Bar comparison */}
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          comp.isCurrent 
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                            : 'bg-slate-800'
                        }`}
                        style={{ width: `${percentOfMax}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory notice */}
            <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Selected model represents {modelPercentageOfDealer}% of overall {selectedDealer} volume.
              </span>
            </div>
          </div>

          {/* Branch Distribution breakdown card */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-5" id="branch-performance-distribution-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Contribution Registration</span>
                <h3 className="text-sm font-semibold text-slate-200 mt-0.5">
                  Performance across branches
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{branchList.length} {branchList.length === 1 ? 'branch' : 'branches'}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {branchList.map((br) => {
                const totalSales = totalAcrossBranches || 1;
                const percentVal = (br.sales / totalSales) * 100;
                const percentDisplay = percentVal % 1 === 0 ? percentVal.toFixed(0) : percentVal.toFixed(1);

                return (
                  <div 
                    key={br.branchName} 
                    className={`p-2.5 rounded-lg transition-colors border ${
                      br.isCurrent 
                        ? 'bg-indigo-950/25 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]' 
                        : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${br.isCurrent ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />
                        <span className={`font-semibold ${br.isCurrent ? 'text-indigo-300' : 'text-slate-300'}`}>{br.branchName}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-400 font-medium">{br.sales.toLocaleString()} <span className="text-slate-500 text-[10px]">units</span></span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] min-w-[42px] text-right ${
                          br.isCurrent 
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' 
                            : 'bg-slate-900 text-slate-200 border border-slate-800'
                        }`}>
                          {percentDisplay}%
                        </span>
                      </div>
                    </div>

                    {/* Visual contribution bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          br.isCurrent 
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' 
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(2, percentVal))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail explanation of selection branch */}
            <div className="mt-4 pt-3.5 border-t border-slate-900/60 text-[10px] text-slate-400 leading-relaxed">
              {selectedBranch === 'All Branches' ? (
                <span>
                  Showing contribution registration across all <strong className="text-slate-200">{branchList.length} branches</strong> for <strong className="text-indigo-400 font-bold">{selectedModel}</strong> in {selectedDealer} (Total: <strong className="text-slate-200 font-bold">{totalAcrossBranches.toLocaleString()} units</strong>).
                </span>
              ) : (
                <span>
                  Branch <strong className="text-indigo-400 font-bold">{selectedBranch}</strong> contributes <strong className="text-indigo-300 font-bold">{branchPercentage}%</strong> ({selectedBranchData?.sales.toLocaleString()} of {totalAcrossBranches.toLocaleString()} units) of total registered deliveries for {selectedModel} in {selectedDealer}.
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
