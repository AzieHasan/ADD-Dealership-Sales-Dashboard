/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Compass, 
  ShieldCheck, 
  KeyRound, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Target, 
  FileCheck, 
  Car, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Unlock,
  Radio,
  Check
} from 'lucide-react';

export interface AreaGuideManualProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedArea: number;
  onSelectArea: (areaId: number) => void;
  onOpenAutoGuide: () => void;
  onOpenHandbook: () => void;
  onOpenNetworkPolicy: () => void;
  onSimulateAdvisor?: () => void;
}

interface AreaDefinition {
  id: number;
  badge: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  keyFeatures: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[];
  sopClause: string;
  sopTitle: string;
  practicalGuidelines: string[];
  actionTips: string[];
}

export const AREA_DEFINITIONS: AreaDefinition[] = [
  {
    id: 1,
    badge: 'AREA 1',
    title: 'Governance & Global Action Bar',
    shortDesc: 'Corporate network governance, interactive guides, SOP handbook, and multi-dealer export tools.',
    icon: ShieldCheck,
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    keyFeatures: [
      {
        title: 'Auto Guide Button',
        desc: 'Interactive 6-step walkthrough for onboarding Sales Advisors with live interactive widget simulators.',
        icon: Compass
      },
      {
        title: 'Handbook SOP Button',
        desc: 'Full Ingress Sales Advisor Standard Operating Procedure (SOP-SA-101 to 601) with official compliance rules.',
        icon: BookOpen
      },
      {
        title: 'Network Access Policy',
        desc: 'Bulk configuration modal allowing sales directors to grant or revoke portal access to all advisors in one click.',
        icon: ShieldCheck
      },
      {
        title: 'Export Excel (.xlsx)',
        desc: 'Exports multi-sheet workbook partitioned by dealership branch with consolidated audit summaries.',
        icon: FileSpreadsheet
      }
    ],
    sopClause: 'SOP-SA-101 & SOP-SA-601',
    sopTitle: 'Frontline Governance & Management Control',
    practicalGuidelines: [
      'New Sales Advisors must complete the 6-step Auto Guide on their first day of showroom deployment.',
      'Always review the official SOP Handbook before updating commission schemes or bank LOU clearing limits.',
      'Use "Network Access Policy" to synchronize access tiers at the start of every fiscal month cycle.'
    ],
    actionTips: [
      'Click [Auto Guide] anytime to launch the interactive training guide.',
      'Click [Handbook] to search official Ingress Automotive operational policies.',
      'Click [Export Excel] to download complete multi-branch performance datasets.'
    ]
  },
  {
    id: 2,
    badge: 'AREA 2',
    title: 'Workforce Performance KPI Strip',
    shortDesc: 'Real-time corporate telemetry tracking advisor quota velocity, LOU approvals, and lead distribution.',
    icon: Target,
    accentColor: 'amber',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    keyFeatures: [
      {
        title: 'Active Roster',
        desc: 'Real-time count of deployed advisors across Mitsubishi, PERODUA, and PROTON e.MAS branches.',
        icon: Users
      },
      {
        title: 'Portal Connected',
        desc: 'Proportion of advisors with active, direct dashboard access enabled for customer consultation.',
        icon: ShieldCheck
      },
      {
        title: 'Quota Fulfillment',
        desc: 'Overall network booking attainment rate: (Total Actual Bookings / Total Target Bookings) × 100%.',
        icon: Target
      },
      {
        title: 'Deliveries (DMV)',
        desc: 'Confirmed physical handovers with electronic JPJ/DMV registration certificates completed.',
        icon: Car
      },
      {
        title: 'LOU Approvals & Value',
        desc: 'Total Letters of Undertaking cleared across Maybank, CIMB, PBB, and HLB with aggregated MYR financing.',
        icon: FileCheck
      },
      {
        title: 'Lead Coverage Ratio',
        desc: 'Average number of active digital inquiries allocated per sales advisor to ensure rapid 15-min response.',
        icon: Radio
      }
    ],
    sopClause: 'SOP-SA-501',
    sopTitle: 'Commercial Target Quotas & Performance Velocity',
    practicalGuidelines: [
      'Branch Managers should maintain at least 90% "Portal Connected" status to prevent floor bottlenecks.',
      'If Quota Fulfillment falls below 80% by mid-month, trigger lead re-distribution in Area 3.',
      'Track total LOU value weekly against corporate floor plan limits to optimize banking turnaround.'
    ],
    actionTips: [
      'Hover over any KPI card to view historical fulfillment benchmarks.',
      'Verify 100% Branch Coverage indicator to ensure no representative showrooms are unstaffed.'
    ]
  },
  {
    id: 3,
    badge: 'AREA 3',
    title: 'Multi-Brand & Representative Branch Filter Bar',
    shortDesc: 'Dynamic search, brand pill filters, representative branch dropdown, and view switcher.',
    icon: Search,
    accentColor: 'sky',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80',
    badgeText: 'text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    keyFeatures: [
      {
        title: 'Instant Search Input',
        desc: 'Live regex search by Sales Advisor name, Staff ID (e.g. SC2458, IMP002, IA884), assigned vehicle model, or role.',
        icon: Search
      },
      {
        title: 'Brand Filter Pills',
        desc: 'Instant brand filtering for Mitsubishi, PERODUA, PROTON e.MAS, or All Ingress Dealerships.',
        icon: SlidersHorizontal
      },
      {
        title: 'Representative Branch Selector',
        desc: 'Filter directly by showroom (Puchong, IMC Bangi, Shah Alam, The Curve, Mutiara Damansara).',
        icon: Layers
      },
      {
        title: 'Card vs Table Layout',
        desc: 'Toggle between visual advisor card grid (with progress rings) and high-density executive audit table.',
        icon: Users
      }
    ],
    sopClause: 'SOP-SA-401',
    sopTitle: 'Branch Allocation & Multi-Dealership Lead Routing',
    practicalGuidelines: [
      'Filter by representative branch before conducting regional sales huddles or morning briefings.',
      'Quickly find specific advisors using their staff identifier (e.g. "SC2458", "IMP002", or "IA884").',
      'Use the Corporate Table view when cross-referencing banking financing totals during weekly reconciliation.'
    ],
    actionTips: [
      'Click the [X] icon in the search box to reset search filters instantly.',
      'Switch to Table view to see all columns side-by-side with financing sums.'
    ]
  },
  {
    id: 4,
    badge: 'AREA 4',
    title: 'Advisor Roster & Commercial Performance',
    shortDesc: 'Individual advisor profile cards, live connection switch, booking progress, and delivery tracking.',
    icon: Users,
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    keyFeatures: [
      {
        title: 'Advisor Profile & Badge',
        desc: 'Color-coded avatar, unique Staff ID, assigned brand badge, official name, and primary vehicle model.',
        icon: Users
      },
      {
        title: 'Direct Dashboard Access Toggle',
        desc: 'Instant one-click switch to toggle between Connected (green) and Suspended (red) access states.',
        icon: Unlock
      },
      {
        title: 'Target vs Actual Booking Meter',
        desc: 'Color-coded progress bar showing units secured vs monthly target, with quota fulfillment percentage.',
        icon: Target
      },
      {
        title: 'Frontline Metric Badges',
        desc: 'Delivered vehicle count (JPJ registrations), approved bank LOU count, and currently active pipeline leads.',
        icon: FileCheck
      }
    ],
    sopClause: 'SOP-SA-201 & SOP-SA-501',
    sopTitle: 'Showroom Stock Allocation & Commission Tiers',
    practicalGuidelines: [
      'Suspended advisors immediately lose portal access and cannot accept incoming showroom walk-in bookings.',
      'Green fulfillment badges indicate quota achievement (>100%), qualifying the advisor for tier-1 commission.',
      'Active leads should be monitored daily to ensure no advisor exceeds 20 uncontacted inquiries.'
    ],
    actionTips: [
      'Click the [Connected / Suspended] pill to toggle access instantly without opening the modal.',
      'Check the top vehicle model indicator to match customer queries with specialist advisors.'
    ]
  },
  {
    id: 5,
    badge: 'AREA 5',
    title: 'ACTION Column & Frontline Operations',
    shortDesc: 'Single-row access permissions modal, 4 frontline privileges, single-row Excel/PDF download, and portal simulation.',
    icon: KeyRound,
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    keyFeatures: [
      {
        title: '[ ACCESS ] Permission Settings',
        desc: 'Opens the single-row "Manage Access Permissions" modal. Update access tier, 2FA, and 4 frontline privileges.',
        icon: KeyRound
      },
      {
        title: '4 Frontline Privileges Config',
        desc: '1. Stock Payment Visibility (Paid vs Not Yet Paid), 2. Bank LOU Fast-Track, 3. Lead Claiming SLA, 4. Quota Meter.',
        icon: ShieldCheck
      },
      {
        title: '[ Download ▾ ] Single-Row Menu',
        desc: 'Export single advisor data as Excel (.xlsx) or Executive PDF Report (with Registered Terminal removed per audit rules).',
        icon: Download
      },
      {
        title: '[ View Portal ] Live Simulator',
        desc: 'Launches the live Sales Advisor Portal view simulation reflecting the exact permissions and privileges configured.',
        icon: Eye
      }
    ],
    sopClause: 'SOP-SA-601',
    sopTitle: 'Action Column Governance & Single-Row Security Controls',
    practicalGuidelines: [
      'Clicking [ACCESS] opens the single-row configuration modal. Any change updates the live advisor dashboard view immediately.',
      'Enabling "Stock Payment Visibility" allows the advisor to view chassis numbers and HQ paid clearance status.',
      'Executive PDF Reports downloaded from the Download dropdown are strictly formatted for official Ingress audit compliance.'
    ],
    actionTips: [
      'Click [Access] on any advisor row/card to customize their specific privilege grants.',
      'Click [Download ▾] and select "PDF Report" to print or archive their official verification document.',
      'Click [View Portal] to preview how the advisor experiences their dashboard under current access settings.'
    ]
  }
];

export function SalesAdvisorAreaGuideManual({
  isOpen,
  onToggle,
  selectedArea,
  onSelectArea,
  onOpenAutoGuide,
  onOpenHandbook,
  onOpenNetworkPolicy,
  onSimulateAdvisor
}: AreaGuideManualProps) {
  const currentArea = AREA_DEFINITIONS.find(a => a.id === selectedArea) || AREA_DEFINITIONS[0];
  const [viewMode, setViewMode] = useState<'detail' | 'overview'>('detail');

  if (!isOpen) {
    return (
      <div className="mb-4">
        <button
          onClick={onToggle}
          className="w-full py-2.5 px-4 rounded-xl border border-amber-300/80 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/80 via-white to-sky-50/80 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/90 hover:border-amber-400 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <div className="text-left">
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Dashboard Guide Manual & Area Explainer</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-bold uppercase">
                  Click to Expand
                </span>
              </span>
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                Visual guide explaining Area 1 (Governance), Area 2 (KPIs), Area 3 (Filters), Area 4 (Roster), & Area 5 (ACTION & ACCESS)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>Show Guide Manual</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-b from-amber-50/40 via-white to-slate-50/50 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-950/90 p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden transition-all">
      {/* Decorative banner glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-500" />

      {/* Guide Manual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold uppercase flex items-center gap-1 shadow-2xs">
              <BookOpen className="w-3 h-3" />
              Official Guide Manual
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold uppercase">
              Area Explainer Active
            </span>
            <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
              Interactive Dashboard Walkthrough & Visual Reference
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Sales Advisor Coverage: Area Guide Manual</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Click any area below to inspect its operational manual, SOP guidelines, and authorized frontline actions. The corresponding dashboard section will highlight automatically.
          </p>
        </div>

        {/* Header Right Action Cluster */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setViewMode(viewMode === 'detail' ? 'overview' : 'detail')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Switch between single-area deep dive and all-areas overview"
          >
            {viewMode === 'detail' ? 'Show All 5 Areas' : 'Focus Selected Area'}
          </button>

          <button
            onClick={onToggle}
            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Collapse Guide Manual banner"
          >
            <span>Hide Manual</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Area Selector Tabs (1 to 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {AREA_DEFINITIONS.map(area => {
          const isSelected = selectedArea === area.id;
          const Icon = area.icon;

          return (
            <button
              key={area.id}
              onClick={() => {
                onSelectArea(area.id);
                setViewMode('detail');
              }}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              )}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${area.badgeBg} ${area.badgeText}`}>
                  {area.badge}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>

              <div className="min-w-0">
                <span className={`text-xs font-bold block truncate ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {area.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  {area.shortDesc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content View: Single Area Deep Dive or All Areas Overview */}
      {viewMode === 'detail' ? (
        <div className="rounded-xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-4 sm:p-5 shadow-xs">
          {/* Active Area Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                {React.createElement(currentArea.icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${currentArea.badgeBg} ${currentArea.badgeText}`}>
                    {currentArea.badge} GUIDE MANUAL
                  </span>
                  <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {currentArea.sopClause}: {currentArea.sopTitle}
                  </span>
                </div>
                <h5 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentArea.title}
                </h5>
              </div>
            </div>

            {/* Quick action buttons linked to this area */}
            <div className="flex flex-wrap items-center gap-2">
              {currentArea.id === 1 && (
                <>
                  <button
                    onClick={onOpenAutoGuide}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-sky-600" />
                    <span>Launch Auto Guide</span>
                  </button>
                  <button
                    onClick={onOpenHandbook}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Read SOP Handbook</span>
                  </button>
                </>
              )}

              {currentArea.id === 2 && (
                <button
                  onClick={onOpenAutoGuide}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>Explain Quota Calculations</span>
                </button>
              )}

              {currentArea.id === 3 && (
                <button
                  onClick={onOpenHandbook}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>View Branch Allocation SOP</span>
                </button>
              )}

              {currentArea.id === 4 && (
                <button
                  onClick={onOpenAutoGuide}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Advisor Card Explainer</span>
                </button>
              )}

              {currentArea.id === 5 && (
                <>
                  <button
                    onClick={onOpenHandbook}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SOP-601: Access Policy</span>
                  </button>
                  {onSimulateAdvisor && (
                    <button
                      onClick={onSimulateAdvisor}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Simulate SA Portal View</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Key Feature Cards Grid */}
          <div className="mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Key Components & Features in {currentArea.badge}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {currentArea.keyFeatures.map((feat, idx) => {
                const FeatIcon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          <FeatIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {feat.title}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational SOP Guidelines & Action Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Practical Operating Rules */}
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
              <span className="text-[10.5px] font-mono font-bold uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Standard Operating Procedure (SOP) Rules
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                {currentArea.practicalGuidelines.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operator Quick Tips & Next Actions */}
            <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/40">
              <span className="text-[10.5px] font-mono font-bold uppercase text-sky-900 dark:text-sky-300 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Frontline Action Instructions
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                {currentArea.actionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* All 5 Areas Consolidated Overview */
        <div className="space-y-3">
          <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-mono text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span>Consolidated Overview of All 5 Dashboard Areas (Ingress Sales Governance)</span>
            <span className="text-[10px] font-bold uppercase">Click any area to inspect details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AREA_DEFINITIONS.map(area => {
              const Icon = area.icon;
              return (
                <div
                  key={area.id}
                  onClick={() => {
                    onSelectArea(area.id);
                    setViewMode('detail');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${area.badgeBg} ${area.badgeText}`}>
                        {area.badge}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {area.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {area.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                    <span>{area.sopClause}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
