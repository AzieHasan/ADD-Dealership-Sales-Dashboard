import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, TrendingUp, Target, MapPin, Layers, ChevronRight, 
  ChevronDown, SlidersHorizontal, Building2, Info, 
  CalendarRange, CheckCircle2, AlertCircle, RefreshCw, Crown, 
  BarChart3, Trophy, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { CAR_TREE, TIMELINE, getMonthlyBudgetVsActual } from './BudgetVsActualPopularity';

interface DealershipPerformanceSummaryProps {
  parentStartIdx: number;
  parentEndIdx: number;
  parentFilterMode: 'monthly' | 'accumulative' | 'range';
  selectedDealer?: string;
  selectedBranch?: string;
  financialYear?: string;
  timePeriodType?: string;
  selectedMonth?: string;
  selectedQuarter?: string;
  selectedWeek?: string;
  selectedDay?: string;
}

const getTimeScopeMultiplier = (timePeriodType?: string, selectedDay?: string, selectedWeek?: string) => {
  if (!timePeriodType) return 1.0;
  if (timePeriodType === 'Daily') {
    if (selectedDay?.includes('Yesterday')) return 0.046;
    if (selectedDay?.includes('Aug 05')) return 0.052;
    if (selectedDay?.includes('Aug 04')) return 0.044;
    return 0.05;
  }
  if (timePeriodType === 'Accumulative Weekly') {
    if (selectedWeek?.includes('Week 2')) return 0.24;
    if (selectedWeek?.includes('Week 3')) return 0.26;
    if (selectedWeek?.includes('Week 4')) return 0.25;
    if (selectedWeek?.includes('Accumulative All Weeks')) return 1.0;
    return 0.25;
  }
  if (timePeriodType === 'Month to Day (MTD)') {
    return 0.23;
  }
  return 1.0;
};

export function DealershipPerformanceSummary({
  parentStartIdx,
  parentEndIdx,
  parentFilterMode,
  selectedDealer,
  selectedBranch,
  financialYear,
  timePeriodType,
  selectedMonth,
  selectedQuarter,
  selectedWeek,
  selectedDay
}: DealershipPerformanceSummaryProps) {
  // View type state: 'grouped' (Grouped branches across dealers) vs 'split' (Each dealer-branch split)
  const [viewType, setViewType] = useState<'grouped' | 'split'>('grouped');

  // Sorting state: 'actual' | 'achievement' | 'variance' | 'name'
  const [sortBy, setSortBy] = useState<'actual' | 'achievement' | 'variance' | 'name'>('actual');

  // Timeline preset filter: 'parent' (synchronized with slider) | 'all' | '2024' | '2025' | '2026'
  const [timePreset, setTimePreset] = useState<'parent' | 'all' | '2024' | '2025' | '2026'>('parent');

  // Drilldown state: track which branch/dealer-branch is currently expanded to show models breakdown
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Chart interactivity states
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive graph configuration state variables
  const [graphDimension, setGraphDimension] = useState<'branch' | 'model' | 'timeline'>('branch');
  const [graphBranchFilter, setGraphBranchFilter] = useState<string>('all');
  const [graphModelFilter, setGraphModelFilter] = useState<string>('all');

  const activeDealer = selectedDealer || 'All Dealership';

  // Define unique branches, models, and dealer relationships
  const physicalDealers = useMemo(() => {
    if (!activeDealer || activeDealer === 'All Dealership' || activeDealer === 'All Dealerships') {
      return ['Mitsubishi', 'PERODUA', 'PROTON e.MAS'];
    }
    return [activeDealer];
  }, [activeDealer]);

  const uniqueBranchesList = useMemo(() => {
    let branches: string[] = [];
    if (!activeDealer || activeDealer === 'All Dealership' || activeDealer === 'All Dealerships') {
      branches = ['PUCHONG', 'IMC,BANDAR BARU BANGI', 'BANDAR BARU BANGI', 'SHAH ALAM', 'The Curve', 'MUTIARA DAMANSARA'];
    } else {
      branches = (CAR_TREE[activeDealer]?.branches || []).filter(b => b !== 'All Branches');
    }

    if (selectedBranch && selectedBranch !== 'All Branches') {
      const filtered = branches.filter(b => b.toLowerCase().includes(selectedBranch.toLowerCase()) || selectedBranch.toLowerCase().includes(b.toLowerCase()));
      return filtered.length > 0 ? filtered : branches;
    }

    return branches;
  }, [activeDealer, selectedBranch]);

  const uniqueModels = useMemo(() => {
    if (!activeDealer || activeDealer === 'All Dealership' || activeDealer === 'All Dealerships') {
      return [
        'TRITON',
        'XPANDER',
        'XFORCE',
        'PERODUA AXIA',
        'PERODUA BEZZA',
        'PERODUA MYVI',
        'PERODUA ALZA',
        'e.MAS 5',
        'e.MAS 7',
        'e.MAS 7 PHEV'
      ];
    }
    return Object.keys(CAR_TREE[activeDealer]?.models || {}).filter(m => m !== 'All Models');
  }, [activeDealer]);

  React.useEffect(() => {
    if (graphBranchFilter !== 'all' && !uniqueBranchesList.includes(graphBranchFilter)) {
      setGraphBranchFilter('all');
    }
  }, [uniqueBranchesList, graphBranchFilter]);

  React.useEffect(() => {
    if (graphModelFilter !== 'all' && !uniqueModels.includes(graphModelFilter)) {
      setGraphModelFilter('all');
    }
  }, [uniqueModels, graphModelFilter]);

  // Determine active start/end indices based on preset state
  const { startIdx, endIdx, isSyncing } = useMemo(() => {
    if (timePreset === 'parent') {
      return { 
        startIdx: parentStartIdx, 
        endIdx: parentEndIdx, 
        isSyncing: true 
      };
    }
    if (timePreset === 'all') {
      return { startIdx: 0, endIdx: TIMELINE.length - 1, isSyncing: false };
    }
    // Filter by year
    const yr = parseInt(timePreset, 10);
    const indices = TIMELINE.map((tp, idx) => ({ tp, idx })).filter(item => item.tp.year === yr);
    if (indices.length > 0) {
      return { 
        startIdx: indices[0].idx, 
        endIdx: indices[indices.length - 1].idx, 
        isSyncing: false 
      };
    }
    return { startIdx: 0, endIdx: TIMELINE.length - 1, isSyncing: false };
  }, [timePreset, parentStartIdx, parentEndIdx]);

  // Compute label representation for range
  const rangeLabel = useMemo(() => {
    if (startIdx >= 0 && endIdx < TIMELINE.length) {
      return `${TIMELINE[startIdx].label} to ${TIMELINE[endIdx].label}`;
    }
    return 'Full Timeline';
  }, [startIdx, endIdx]);

  // Helper function to calculate performance for a single dealer, branch, and optional model
  const calculateData = (dealer: string, branch: string, specificModel?: string) => {
    if (selectedBranch && selectedBranch !== 'All Branches') {
      const isMatch = branch.toLowerCase().includes(selectedBranch.toLowerCase()) || selectedBranch.toLowerCase().includes(branch.toLowerCase());
      if (!isMatch) {
        return { budget: 0, actual: 0, variance: 0, achievement: 0 };
      }
    }

    let budgetTotal = 0;
    let actualTotal = 0;

    const models = CAR_TREE[dealer]?.models;
    if (models) {
      const modelKeys = specificModel ? [specificModel] : Object.keys(models);
      modelKeys.forEach(model => {
        if (model === 'All Models') return;
        const variants = models[model];
        variants.forEach(variant => {
          if (variant === 'All Variants') return;
          const monthlyVals = getMonthlyBudgetVsActual(dealer, branch, model, variant);
          monthlyVals.forEach((point, idx) => {
            if (idx >= startIdx && idx <= endIdx) {
              budgetTotal += point.budget;
              actualTotal += point.actual;
            }
          });
        });
      });
    }

    const mult = getTimeScopeMultiplier(timePeriodType, selectedDay, selectedWeek);
    budgetTotal = Math.round(budgetTotal * mult);
    actualTotal = Math.round(actualTotal * mult);

    const variance = actualTotal - budgetTotal;
    const achievementPercent = budgetTotal > 0 ? (actualTotal / budgetTotal) * 100 : 0;

    return {
      budget: budgetTotal,
      actual: actualTotal,
      variance,
      achievement: achievementPercent
    };
  };

  // 1. Calculate Grouped Dealerships (Mitsubishi, PERODUA, PROTON e.MAS)
  const groupedDealershipsData = useMemo(() => {
    return physicalDealers.map(dealer => {
      let totalBudget = 0;
      let totalActual = 0;

      CAR_TREE[dealer]?.branches.forEach(branch => {
        const metrics = calculateData(dealer, branch);
        totalBudget += metrics.budget;
        totalActual += metrics.actual;
      });

      const variance = totalActual - totalBudget;
      const achievement = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

      // Model breakdown for drilldown
      const models = Object.keys(CAR_TREE[dealer]?.models || {}).filter(m => m !== 'All Models');
      const modelBreakdown = models.map(model => {
        let modelBudget = 0;
        let modelActual = 0;
        CAR_TREE[dealer]?.branches.forEach(branch => {
          const stats = calculateData(dealer, branch, model);
          modelBudget += stats.budget;
          modelActual += stats.actual;
        });
        const modelVar = modelActual - modelBudget;
        const modelAch = modelBudget > 0 ? (modelActual / modelBudget) * 100 : 0;

        return {
          dealer,
          model,
          budget: modelBudget,
          actual: modelActual,
          variance: modelVar,
          achievement: modelAch
        };
      }).sort((a, b) => b.actual - a.actual);

      return {
        id: dealer,
        name: dealer,
        dealers: [dealer],
        budget: totalBudget,
        actual: totalActual,
        variance,
        achievement,
        modelBreakdown
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== 'All Branches') {
        return item.budget > 0 || item.actual > 0;
      }
      return true;
    });
  }, [physicalDealers, startIdx, endIdx, selectedBranch, selectedDealer, financialYear, timePeriodType, selectedMonth, selectedQuarter, selectedWeek, selectedDay]);

  // 2. Calculate Split Branches (Individual Dealer-Branch pairings)
  const splitBranchesData = useMemo(() => {
    const list: any[] = [];
    physicalDealers.forEach(dealer => {
      CAR_TREE[dealer].branches.forEach(branch => {
        if (selectedBranch && selectedBranch !== 'All Branches') {
          const isMatch = branch.toLowerCase().includes(selectedBranch.toLowerCase()) || selectedBranch.toLowerCase().includes(branch.toLowerCase());
          if (!isMatch) return;
        }

        const metrics = calculateData(dealer, branch);
        
        // Model breakdown for drilldown
        const models = Object.keys(CAR_TREE[dealer].models).filter(m => m !== 'All Models');
        const modelBreakdown = models.map(model => {
          const stats = calculateData(dealer, branch, model);
          return {
            dealer,
            model,
            ...stats
          };
        }).sort((a, b) => b.actual - a.actual);

        list.push({
          id: `${dealer}-${branch}`,
          name: branch,
          dealer,
          budget: metrics.budget,
          actual: metrics.actual,
          variance: metrics.variance,
          achievement: metrics.achievement,
          modelBreakdown
        });
      });
    });
    return list;
  }, [physicalDealers, startIdx, endIdx, selectedBranch, selectedDealer, financialYear, timePeriodType, selectedMonth, selectedQuarter, selectedWeek, selectedDay]);

  // Apply sorting based on user selection
  const processedList = useMemo(() => {
    const currentList = viewType === 'grouped' ? [...groupedDealershipsData] : [...splitBranchesData];
    
    return currentList.sort((a, b) => {
      if (sortBy === 'actual') {
        return b.actual - a.actual;
      }
      if (sortBy === 'achievement') {
        return b.achievement - a.achievement;
      }
      if (sortBy === 'variance') {
        return b.variance - a.variance;
      }
      // sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [viewType, groupedDealershipsData, splitBranchesData, sortBy]);

  // Overall metrics summary for the selected performance scope
  const overallSummary = useMemo(() => {
    const list = viewType === 'grouped' ? groupedDealershipsData : splitBranchesData;
    let totalB = 0;
    let totalA = 0;
    list.forEach(item => {
      totalB += item.budget;
      totalA += item.actual;
    });
    const variance = totalA - totalB;
    const achievement = totalB > 0 ? (totalA / totalB) * 100 : 0;
    return { budget: totalB, actual: totalA, variance, achievement };
  }, [viewType, groupedDealershipsData, splitBranchesData]);

  // Compute Dealership Aggregates to identify the highest performer
  const dealershipAggregates = useMemo(() => {
    return physicalDealers.map(dealer => {
      let totalBudget = 0;
      let totalActual = 0;

      CAR_TREE[dealer]?.branches.forEach(branch => {
        const stats = calculateData(dealer, branch);
        totalBudget += stats.budget;
        totalActual += stats.actual;
      });

      const variance = totalActual - totalBudget;
      const achievement = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

      return {
        dealer,
        budget: totalBudget,
        actual: totalActual,
        variance,
        achievement
      };
    });
  }, [physicalDealers, startIdx, endIdx, selectedBranch, selectedDealer, financialYear, timePeriodType, selectedMonth, selectedQuarter, selectedWeek, selectedDay]);

  // Identify the higher dealership (the one with the maximum actual sales volume)
  const higherDealership = useMemo(() => {
    if (dealershipAggregates.length === 0) return null;
    return [...dealershipAggregates].sort((a, b) => b.actual - a.actual)[0];
  }, [dealershipAggregates]);

  // Filter metrics calculation helper
  const getFilteredMetrics = (
    branchNameFilter: string,
    modelNameFilter: string,
    specificMonthIdx: number | null = null
  ) => {
    let budgetTotal = 0;
    let actualTotal = 0;

    physicalDealers.forEach(dealer => {
      const dealerBranches = CAR_TREE[dealer].branches;
      dealerBranches.forEach(branchName => {
        if (branchNameFilter !== 'all' && branchNameFilter !== branchName) return;

        if (selectedBranch && selectedBranch !== 'All Branches') {
          const isMatch = branchName.toLowerCase().includes(selectedBranch.toLowerCase()) || selectedBranch.toLowerCase().includes(branchName.toLowerCase());
          if (!isMatch) return;
        }

        const dealerModels = CAR_TREE[dealer].models;
        const modelKeys = Object.keys(dealerModels).filter(m => m !== 'All Models');
        
        modelKeys.forEach(modelName => {
          if (modelNameFilter !== 'all' && modelNameFilter !== modelName) return;

          const variants = dealerModels[modelName];
          variants.forEach(variantName => {
            if (variantName === 'All Variants') return;

            const monthlyVals = getMonthlyBudgetVsActual(dealer, branchName, modelName, variantName);
            
            if (specificMonthIdx !== null) {
              const point = monthlyVals[specificMonthIdx];
              if (point) {
                budgetTotal += point.budget;
                actualTotal += point.actual;
              }
            } else {
              monthlyVals.forEach((point, idx) => {
                if (idx >= startIdx && idx <= endIdx) {
                  budgetTotal += point.budget;
                  actualTotal += point.actual;
                }
              });
            }
          });
        });
      });
    });

    const variance = actualTotal - budgetTotal;
    const achievement = budgetTotal > 0 ? (actualTotal / budgetTotal) * 100 : 0;

    return {
      budget: budgetTotal,
      actual: actualTotal,
      variance,
      achievement
    };
  };

  // Prepare dynamic chart dataset based on dimension and active filters
  const chartItems = useMemo(() => {
    let items: any[] = [];

    if (graphDimension === 'branch') {
      // Show branches on X-axis
      uniqueBranchesList.forEach(branch => {
        if (graphBranchFilter !== 'all' && graphBranchFilter !== branch) return;

        const metrics = getFilteredMetrics(branch, graphModelFilter, null);
        items.push({
          id: `branch-${branch}`,
          name: branch,
          ...metrics
        });
      });
    } else if (graphDimension === 'model') {
      if (graphModelFilter === 'all') {
        // Show all models on X-axis
        uniqueModels.forEach(model => {
          const metrics = getFilteredMetrics(graphBranchFilter, model, null);
          items.push({
            id: `model-${model}`,
            name: model,
            ...metrics
          });
        });
      } else {
        // High fidelity breakdown: Show the VARIANTS of the filtered model!
        let foundDealer = '';
        physicalDealers.forEach(dealer => {
          if (CAR_TREE[dealer].models[graphModelFilter]) {
            foundDealer = dealer;
          }
        });

        if (foundDealer) {
          const variants = CAR_TREE[foundDealer].models[graphModelFilter].filter(v => v !== 'All Variants');
          variants.forEach(variant => {
            let budgetTotal = 0;
            let actualTotal = 0;

            uniqueBranchesList.forEach(branch => {
              if (graphBranchFilter !== 'all' && graphBranchFilter !== branch) return;
              if (CAR_TREE[foundDealer].branches.includes(branch)) {
                const monthlyVals = getMonthlyBudgetVsActual(foundDealer, branch, graphModelFilter, variant);
                monthlyVals.forEach((point, idx) => {
                  if (idx >= startIdx && idx <= endIdx) {
                    budgetTotal += point.budget;
                    actualTotal += point.actual;
                  }
                });
              }
            });

            const variance = actualTotal - budgetTotal;
            const achievement = budgetTotal > 0 ? (actualTotal / budgetTotal) * 100 : 0;

            items.push({
              id: `variant-${variant}`,
              name: variant,
              budget: budgetTotal,
              actual: actualTotal,
              variance,
              achievement
            });
          });
        }
      }
    } else if (graphDimension === 'timeline') {
      // Show active timeline months on X-axis
      for (let i = startIdx; i <= endIdx; i++) {
        const metrics = getFilteredMetrics(graphBranchFilter, graphModelFilter, i);
        items.push({
          id: `timeline-${i}`,
          name: TIMELINE[i].label,
          ...metrics
        });
      }
    }

    // Apply sorting only for branch and model views
    if (graphDimension !== 'timeline') {
      items.sort((a, b) => {
        if (sortBy === 'actual') return b.actual - a.actual;
        if (sortBy === 'achievement') return b.achievement - a.achievement;
        if (sortBy === 'variance') return b.variance - a.variance;
        return a.name.localeCompare(b.name);
      });
    }

    return items;
  }, [
    graphDimension,
    graphBranchFilter,
    graphModelFilter,
    startIdx,
    endIdx,
    sortBy,
    uniqueBranchesList,
    uniqueModels,
    physicalDealers
  ]);

  // Calculate scaling for SVG bars based on dynamic chart items
  const maxChartValue = useMemo(() => {
    let max = 100;
    chartItems.forEach(item => {
      if (item.actual > max) max = item.actual;
      if (item.budget > max) max = item.budget;
    });
    return max * 1.15; // 15% padding at the top of chart
  }, [chartItems]);

  // Color mappings for dealers
  const getDealerColor = (dealer: string) => {
    if (dealer === 'Mitsubishi') return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    if (dealer === 'PERODUA') return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    return 'bg-blue-500/10 border-blue-500/30 text-blue-400'; // PROTON
  };

  const getDealerBorderColor = (dealer: string) => {
    if (dealer === 'Mitsubishi') return 'border-rose-500/50';
    if (dealer === 'PERODUA') return 'border-cyan-500/50';
    return 'border-blue-500/50';
  };

  const getDealerBadgeStyle = (dealer: string) => {
    if (dealer === 'Mitsubishi') return 'text-rose-400 bg-rose-500/10';
    if (dealer === 'PERODUA') return 'text-cyan-400 bg-cyan-500/10';
    return 'text-blue-400 bg-blue-500/10';
  };

  // Helper for tracking tooltip relative coordinates
  const handleSvgMouseMove = (e: React.MouseEvent<SVGElement>, itemId: string) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredBarId(itemId);
  };

  const hoveredItem = useMemo(() => {
    if (!hoveredBarId) return null;
    return chartItems.find(item => item.id === hoveredBarId) || null;
  }, [hoveredBarId, chartItems]);

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative" id="dealership-performance-summary">
      
      {/* Title Header with Glowing Badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
            {activeDealer && activeDealer !== 'All Dealership' && activeDealer !== 'All Dealerships'
              ? `${activeDealer} Performance Summary`
              : 'All Dealership Performance Summary'}
            {selectedBranch && selectedBranch !== 'All Branches' ? ` — ${selectedBranch}` : ''}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-dealership branch performance and target forecast achievements analysis. Click on any branch row to drilldown.
          </p>
        </div>

        {/* Dynamic Sync state status & active filter badges */}
        <div className="flex flex-wrap items-center gap-2">
          {activeDealer && activeDealer !== 'All Dealership' && activeDealer !== 'All Dealerships' && (
            <div className="flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-800/80 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-indigo-300 font-bold">
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>{activeDealer}</span>
            </div>
          )}

          {selectedBranch && selectedBranch !== 'All Branches' && (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-emerald-300 font-bold">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Branch: {selectedBranch}</span>
            </div>
          )}

          {financialYear && (
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-amber-300 font-bold">
              <span>{financialYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* HIGHER DEALERSHIP HIGH IMPACT PANEL */}
      <div className="mb-6">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2.5">
          Dealership Network Standings & Higher Dealership Highlight
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dealershipAggregates.map((item) => {
            const isHighest = higherDealership && higherDealership.dealer === item.dealer;
            const percentageOfTotal = overallSummary.actual > 0 
              ? Math.round((item.actual / overallSummary.actual) * 100) 
              : 0;

            return (
              <div
                key={item.dealer}
                className={`relative rounded-xl p-4 transition-all duration-300 ${
                  isHighest
                    ? 'bg-gradient-to-b from-amber-500/[0.08] to-slate-950/90 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
                    : 'bg-slate-950/40 border border-slate-800/80 hover:border-slate-800'
                }`}
              >
                {/* Visual indicator for the higher dealership */}
                {isHighest && (
                  <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[-10px] flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.3)] select-none">
                    <Crown className="w-3 h-3 fill-slate-950" />
                    <span>HIGHER DEALERSHIP</span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {item.dealer}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                      {percentageOfTotal}% share of network deliveries
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                    item.achievement >= 100 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : item.achievement < 90 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {item.achievement.toFixed(1)}% Achieved
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block">Actual Delivery</span>
                    <span className={`text-sm font-bold font-mono ${isHighest ? 'text-amber-400' : 'text-slate-200'}`}>
                      {item.actual.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-slate-500">units</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block">Target Forecast</span>
                    <span className="text-sm font-bold font-mono text-slate-400">
                      {item.budget.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-slate-500">units</span>
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isHighest 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                          : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, item.achievement)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        
        {/* VIEW TYPE TOGGLE (6 Cols) */}
        <div className="lg:col-span-6 space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Aggregation Structure</span>
          <div className="flex bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setViewType('grouped'); setExpandedRow(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewType === 'grouped'
                  ? 'bg-indigo-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Group Dealership</span>
            </button>
            <button
              onClick={() => { setViewType('split'); setExpandedRow(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewType === 'split'
                  ? 'bg-indigo-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Split Branches</span>
            </button>
          </div>
        </div>

        {/* SORT TOGGLE (6 Cols) */}
        <div className="lg:col-span-6 space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Sort Orientation</span>
          <div className="grid grid-cols-4 gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl font-mono text-[10px]">
            <button
              onClick={() => setSortBy('actual')}
              className={`py-2 px-1 rounded-lg font-bold text-center cursor-pointer transition-all ${
                sortBy === 'actual' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort by actual sales volume"
            >
              Volume
            </button>
            <button
              onClick={() => setSortBy('achievement')}
              className={`py-2 px-1 rounded-lg font-bold text-center cursor-pointer transition-all ${
                sortBy === 'achievement' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort by target achievement rate"
            >
              Achieved%
            </button>
            <button
              onClick={() => setSortBy('variance')}
              className={`py-2 px-1 rounded-lg font-bold text-center cursor-pointer transition-all ${
                sortBy === 'variance' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort by net forecast variance"
            >
              Variance
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`py-2 px-1 rounded-lg font-bold text-center cursor-pointer transition-all ${
                sortBy === 'name' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sort alphabetically by branch name"
            >
              A-Z Name
            </button>
          </div>
        </div>

      </div>

      {/* Aggregate KPI Strip for Consolidated Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/30 border border-slate-900 rounded-xl p-4 mb-6">
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Total Actual</span>
          <span className="text-lg font-bold font-mono text-indigo-400 mt-0.5 block">
            {overallSummary.actual.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-500 font-normal">units</span>
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Total Target Forecast</span>
          <span className="text-lg font-bold font-mono text-slate-300 mt-0.5 block">
            {overallSummary.budget.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-500 font-normal">units</span>
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Overall Achievement Rate</span>
          <span className="text-lg font-bold font-mono text-indigo-300 mt-0.5 block">
            {overallSummary.achievement.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Net Variance</span>
          <span className={`text-lg font-bold font-mono mt-0.5 block ${overallSummary.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {overallSummary.variance >= 0 ? '+' : ''}
            {overallSummary.variance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* List Performance Rows */}
      <div className="space-y-3">
        
        {processedList.map((row) => {
          const isExpanded = expandedRow === row.id;
          const ahead = row.achievement >= 100;
          const behind = row.achievement < 90;
          
          return (
            <div 
              key={row.id}
              className={`border rounded-xl transition-all duration-150 overflow-hidden ${
                isExpanded 
                  ? 'bg-slate-950/75 border-indigo-500/40 shadow-[0_4px_15px_rgba(99,102,241,0.15)]' 
                  : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* PRIMARY ROW CARD */}
              <div 
                onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                
                {/* Branch Name & Dealers */}
                <div className="flex items-center gap-3 w-full md:w-1/4 min-w-[180px]">
                  <div className={`p-2 rounded-lg shrink-0 ${isExpanded ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className={`text-xs font-bold transition-all ${isExpanded ? 'text-indigo-400 font-extrabold' : 'text-slate-200'}`}>
                      {row.name}
                    </h4>
                    
                    {/* Dealer Tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewType === 'grouped' ? (
                        row.dealers.map((dl: string) => (
                          <span key={dl} className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold shrink-0 ${getDealerColor(dl)}`}>
                            {dl}
                          </span>
                        ))
                      ) : (
                        <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold shrink-0 ${getDealerColor(row.dealer)}`}>
                          {row.dealer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VISUAL PROGRESS BAR & TARGET INDICATOR */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex justify-between items-baseline text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Progress:</span>
                      <span className={`font-bold ${ahead ? 'text-emerald-400' : behind ? 'text-rose-400' : 'text-indigo-400'}`}>
                        {Math.round(row.achievement)}% of Target
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-bold">
                      <span className="text-indigo-300 font-extrabold">{row.actual}</span>
                      <span className="text-slate-600 font-normal font-sans text-[10px]"> / {row.budget} target</span>
                    </div>
                  </div>

                  {/* Progressive track visualization */}
                  <div className="h-2.5 bg-slate-900 rounded-full relative overflow-hidden border border-slate-800/80">
                    
                    {/* Target Budget Marker Line overlay (representing 100%) */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80 z-20" style={{ left: '100%' }} />
                    
                    {/* Fill actual deliveries */}
                    <div 
                      className={`h-full rounded-full transition-all duration-700 relative ${
                        ahead 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : behind
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                            : 'bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                      }`}
                      style={{ width: `${Math.min(100, row.achievement)}%` }}
                    >
                      {/* Exceeded amount fill (if achievement goes above 100%) */}
                    </div>

                    {row.achievement > 100 && (
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-400/20 animate-pulse z-10" style={{ width: '100%' }} />
                    )}
                  </div>
                </div>

                {/* ACHIEVEMENTS & VARIANCE GAP PILL */}
                <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end">
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Variance Gap</span>
                    <span className={`text-xs font-bold font-mono flex items-center justify-end gap-1 ${row.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.variance >= 0 ? '+' : ''}
                      {row.variance}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {ahead ? (
                      <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold ${
                        behind 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{behind ? 'Deficit' : 'On Track'}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-slate-500 hover:text-slate-300">
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                  </div>

                </div>

              </div>

              {/* EXPANDED DRILLDOWN DETAILS (Model breakdown) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-t border-slate-900 bg-slate-950/90"
                  >
                    <div className="p-4 space-y-3">
                      
                      {/* Drilldown Subheader */}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <span>Vehicular Breakdown at {row.name}</span>
                        <span className="text-slate-400">{row.modelBreakdown.length} active models</span>
                      </div>

                      {/* Models List Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {row.modelBreakdown.map((item: any, i: number) => {
                          const itemAhead = item.achievement >= 100;
                          return (
                            <div 
                              key={`${item.dealer}-${item.model}`}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40 hover:border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-600 font-mono font-bold">#{i + 1}</span>
                                <div>
                                  <span className="font-semibold text-slate-300">{item.model}</span>
                                  <span className={`text-[8px] font-mono block uppercase ${getDealerColor(item.dealer)} border-none p-0 bg-transparent mt-0.5`}>
                                    {item.dealer}
                                  </span>
                                </div>
                              </div>

                              {/* Performance info */}
                              <div className="flex items-center gap-4 font-mono text-[11px]">
                                <div className="text-right">
                                  <span className="text-slate-200 font-bold">{item.actual} units</span>
                                  <span className="text-[9px] text-slate-500 block">target: {item.budget}</span>
                                </div>

                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  itemAhead 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : item.achievement < 90 
                                      ? 'bg-rose-500/10 text-rose-400' 
                                      : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {Math.round(item.achievement)}%
                                </span>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}

      </div>

    </div>
  );
}
