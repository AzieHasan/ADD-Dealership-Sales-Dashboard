/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Activity, Sparkles, AlertOctagon, CheckCircle2, ChevronRight, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { BookingEvent } from '../types';
import { exportLiveFeedFeature } from '../utils/excelExport';

interface LiveFeedProps {
  events: BookingEvent[];
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 10) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  return `${diffMins}m ago`;
};

const formatCurrency = (val: number) => {
  return `RM ${Math.round(val).toLocaleString('en-MY')}`;
};

export function LiveFeed({ events, onTriggerSimulation, isSimulating }: LiveFeedProps) {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden" id="live-activity-feed-panel">
      {/* Dynamic line glow */}
      <div className="absolute left-0 top-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">Live Inflow</span>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4.5 h-4.5 text-indigo-400" /> System Events Stream
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time simulation toggle button */}
          <button
            onClick={onTriggerSimulation}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              isSimulating
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700/80 text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Simulating Live' : 'Inject Activity'}</span>
          </button>

          {/* Export to Excel Button */}
          <button
            onClick={() => exportLiveFeedFeature(events)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-300 cursor-pointer shadow-xs active:scale-95"
            title="Download Live Inflow Events Stream to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Feed container */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-xs">
              No recent events logged. Trigger activity injection.
            </div>
          ) : (
            events.map((event) => {
              // Styling based on event type
              let badgeColor = '';
              let badgeText = '';
              let icon = null;
              let description = '';

              switch (event.type) {
                case 'booking':
                  badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-950/40';
                  badgeText = 'Booking';
                  icon = <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
                  description = `purchased ${event.model} for ${formatCurrency(event.value)}`;
                  break;
                case 'cancellation':
                  badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-950/40';
                  badgeText = 'Dropped';
                  icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
                  description = `cancelled booking for ${event.model} (${formatCurrency(event.value)})`;
                  break;
                case 'registration':
                  badgeColor = 'bg-violet-500/10 text-violet-400 border-violet-950/40';
                  badgeText = 'Approved';
                  icon = <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />;
                  description = `registered vehicle ${event.model} (DMV Authorized)`;
                  break;
                case 'conversion':
                  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-950/40';
                  badgeText = 'Converted';
                  icon = <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />;
                  description = `completed showroom contract for ${event.model}`;
                  break;
              }

              const isHighValue = event.value >= 100000;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10, y: -5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, paddingY: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-3 rounded-xl border text-xs relative flex items-start gap-3 transition-all duration-200 hover:bg-slate-800/10 ${
                    isHighValue 
                      ? 'border-amber-500/20 bg-amber-500/[0.02]' 
                      : 'border-slate-800/60 bg-slate-950/30'
                  }`}
                >
                  {/* High Value Badge Decoration */}
                  {isHighValue && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent text-[8px] font-mono text-amber-500 uppercase tracking-widest px-2 py-0.5 rounded-bl-lg font-bold">
                      Premium Sale
                    </div>
                  )}

                  {/* Left Icon Panel */}
                  <div className="flex-shrink-0 p-1.5 rounded-lg bg-slate-950 border border-slate-900 mt-0.5">
                    {icon}
                  </div>

                  {/* Right Description Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-200">
                        {event.customerName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        at
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">
                        {event.dealershipName}
                      </span>
                    </div>

                    <p className="text-slate-400 mt-1 leading-relaxed">
                      {description}
                    </p>

                    {event.details && (
                      <span className="text-[10px] font-mono text-slate-600 block mt-0.5 italic">
                        ↳ {event.details}
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Type Tag */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 justify-between self-stretch font-mono text-[10px]">
                    <span className="text-slate-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded border text-[8px] font-semibold uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
