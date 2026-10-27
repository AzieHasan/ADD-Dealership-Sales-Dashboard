/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Car, 
  FileCheck, 
  Users, 
  Target, 
  KeyRound, 
  Sparkles, 
  BookOpen, 
  Check, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  Smartphone,
  ExternalLink,
  SlidersHorizontal,
  DollarSign,
  Download
} from 'lucide-react';
import { SalesAdvisor } from '../types';

interface SalesAdvisorAutoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHandbook?: () => void;
  onSimulatePortal?: () => void;
  sampleAdvisor?: SalesAdvisor;
}

export function SalesAdvisorAutoGuideModal({
  isOpen,
  onClose,
  onOpenHandbook,
  onSimulatePortal,
  sampleAdvisor
}: SalesAdvisorAutoGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'checklist'>('walkthrough');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({
    check1: true,
    check2: true,
    check3: false,
    check4: false,
    check5: false
  });

  const toggleChecklistItem = (id: string) => {
    setChecklistState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const steps = [
    {
      id: 'step-access',
      stepNum: 1,
      title: 'Portal & Device Authentication',
      tagline: 'Connecting frontline advisors securely to dealership data',
      icon: KeyRound,
      color: 'indigo',
      badge: 'Core Access',
      description: 'Learn how Sales Advisors log in via mobile tablets and showroom desktop workstations with two-factor authentication (2FA).',
      keyPoints: [
        {
          title: 'Direct Dashboard Connectivity',
          desc: 'Advisors access real-time inventory, customer inquiries, and bank financing statuses via dedicated Ingress SA portal logins.'
        },
        {
          title: 'Three Governed Access Tiers',
          desc: 'Full SA Portal Access (all features), Lead & LOU Mobile Access (mobile sales), and Showroom Floor Access (stock & walk-ins).'
        },
        {
          title: '2FA Biometric & OTP Verification',
          desc: 'Every session requires verified multi-factor credentials to ensure customer personal documents remain strictly protected under PDPA.'
        }
      ],
      interactiveDemo: {
        type: 'access',
        title: 'Authentication Status Preview',
        status: 'CONNECTED',
        tier: 'Full SA Portal Access',
        advisorName: sampleAdvisor?.name || 'MARZUKI BIN MOLLIANCHO',
        staffId: sampleAdvisor?.staffId || 'SC2458',
        branch: sampleAdvisor?.branchName || 'Mitsubishi Puchong Showroom'
      },
      proTip: 'Dealership Managers can toggle advisor access or modify tiers individually at any time using the "Access" button in the ACTION column.'
    },
    {
      id: 'step-stock',
      stepNum: 2,
      title: 'Stock Payment Status Visibility',
      tagline: 'Instant visibility into Paid vs Not Yet Paid floor allocation',
      icon: Car,
      color: 'emerald',
      badge: 'Inventory Module',
      description: 'Frontline advisors can view real-time vehicle allocation queues to give confident, committed delivery handover dates to car buyers.',
      keyPoints: [
        {
          title: 'Paid vs Not Yet Paid Differentiation',
          desc: 'Units marked "Stock Paid" have full clearance for immediate DMV registration, road tax issuance, and customer handover schedule.'
        },
        {
          title: 'Floor Stock vs In-Transit Tracking',
          desc: 'Monitor incoming carrier deliveries directly from Tanjung Malim / Port Klang hubs to reserve vehicles as soon as chassis numbers drop.'
        },
        {
          title: 'Zero Mismatch Deliveries',
          desc: 'Prevents advising customers on units already reserved or pending dealer floorplan financial settlement.'
        }
      ],
      interactiveDemo: {
        type: 'stock',
        title: 'Floor Stock Payment Queue',
        items: [
          { model: 'TRITON Athlete 2.4L', status: 'Stock Paid', units: '4 Units Available', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' },
          { model: 'XPANDER 1.5L AT', status: 'Stock Paid', units: '7 Units Available', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' },
          { model: 'PERODUA BEZZA 1.3X', status: 'Not Yet Paid', units: 'Pending Floorplan', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300' },
          { model: 'PROTON e.MAS 7 Prime', status: 'Stock Paid', units: '2 Units Ready', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' }
        ]
      },
      proTip: 'Always check that the customer unit is marked "Stock Paid" before booking the handover ceremony with the customer in the showroom.'
    },
    {
      id: 'step-lou',
      stepNum: 3,
      title: 'Bank LOU Fast-Track Hub',
      tagline: 'Expedited financing submission & instant loan approvals',
      icon: FileCheck,
      color: 'amber',
      badge: 'Financing Module',
      description: 'Submit customer hire-purchase applications and track bank Letters of Undertaking (LOU) across Malaysia’s premier auto financing partners.',
      keyPoints: [
        {
          title: 'Top Bank Clearinghouse',
          desc: 'Direct digital clearing with Maybank, CIMB Bank, Public Bank, AmBank, RHB, Bank Islam, and Hong Leong Bank.'
        },
        {
          title: 'Sub-48 Hour Turnaround SLA',
          desc: 'Receive push alerts upon document verification, credit assessment clearance, and final LOU signing issuance.'
        },
        {
          title: 'Live Pipeline Valuation',
          desc: 'Track individual total financing approved in Ringgit Malaysia (RM) directly linked to monthly target fulfillment.'
        }
      ],
      interactiveDemo: {
        type: 'lou',
        title: 'Bank LOU Fast-Track Status Preview',
        banks: [
          { name: 'Maybank Hire Purchase', code: 'MBB', sla: '1.5 Days Avg', approval: '91.2% Appr', status: 'Fast-Track Active' },
          { name: 'Public Bank Auto Loan', code: 'PBB', sla: '1.8 Days Avg', approval: '88.5% Appr', status: 'Fast-Track Active' },
          { name: 'CIMB Auto Financing', code: 'CIMB', sla: '2.1 Days Avg', approval: '85.4% Appr', status: 'Direct Portal Link' },
          { name: 'Hong Leong Bank Car Loan', code: 'HLB', sla: '2.4 Days Avg', approval: '81.5% Appr', status: 'Document Syncing' }
        ]
      },
      proTip: 'Upload payslips, EPF statements, and IC scans in high-resolution PDF format to reduce bank query turnaround by up to 60%.'
    },
    {
      id: 'step-leads',
      stepNum: 4,
      title: 'Customer Pipeline Lead Claiming',
      tagline: '15-minute digital showroom lead response & test-drive management',
      icon: Users,
      color: 'cyan',
      badge: 'Pipeline Module',
      description: 'Claim incoming customer test-drive bookings, digital inquiries from brand portals, and showroom walk-ins to maintain conversion momentum.',
      keyPoints: [
        {
          title: '15-Minute Response Rule',
          desc: 'High-intent digital showroom leads claimed within 15 minutes achieve 3.8x higher closing rates.'
        },
        {
          title: 'Integrated Test-Drive Scheduler',
          desc: 'Log trade-in valuation requests, customer model preferences, and appointment confirmations in one place.'
        },
        {
          title: 'Automated Follow-up Sequences',
          desc: 'Built-in WhatsApp and SMS consultation reminders keep prospective car buyers engaged through financing approval.'
        }
      ],
      interactiveDemo: {
        type: 'leads',
        title: 'Incoming Ingress Showroom Leads',
        leads: [
          { name: 'Dato’ Azman bin Yahya', model: 'TRITON Athlete 2.4L', source: 'Digital Showroom', time: '5m ago', intent: 'High (Pre-approved)' },
          { name: 'Tan Mei Ling', model: 'PERODUA ALZA 1.5 AV', source: 'Test-Drive Booking', time: '18m ago', intent: 'Medium' },
          { name: 'Suresh Kumar', model: 'PROTON e.MAS 7', source: 'Website Inquiry', time: '32m ago', intent: 'High (Trade-in)' }
        ]
      },
      proTip: 'Leads not followed up within 48 hours are automatically recirculated to the branch allocation pool.'
    },
    {
      id: 'step-quota',
      stepNum: 5,
      title: 'Personal Quota & Commission Meter',
      tagline: 'Real-time booking fulfillment & progressive incentive calculator',
      icon: Target,
      color: 'violet',
      badge: 'Performance & Pay',
      description: 'Track individual monthly booking quotas against confirmed DMV registrations and watch your estimated commissions accumulate in real time.',
      keyPoints: [
        {
          title: 'Booking vs Delivery Reconciliation',
          desc: 'Bookings secure vehicle allocation; official customer DMV registrations unlock progressive commission payouts.'
        },
        {
          title: 'Fulfillment Tiers & Accelerators',
          desc: 'Top Performers reaching 100%+ quota unlock bonus multipliers and regional Ingress recognition tiers.'
        },
        {
          title: 'Transparent Settlement Audits',
          desc: 'Every registered unit is logged with chassis verification, finance contract reference, and handover sign-off.'
        }
      ],
      interactiveDemo: {
        type: 'quota',
        title: 'Quota & Commission Live Meter',
        advisor: sampleAdvisor?.name || 'MARZUKI BIN MOLLIANCHO',
        actual: sampleAdvisor?.actualBookings || 5,
        target: sampleAdvisor?.targetBookings || 4,
        delivered: sampleAdvisor?.registrations || 4,
        rate: '125% Quota Met (Top Performer)',
        estCommission: 'RM 3,850.00'
      },
      proTip: 'Focus on completing registration document submissions by the 25th of the month to ensure payouts are processed in the current cycle.'
    },
    {
      id: 'step-governance',
      stepNum: 6,
      title: 'Single-Row Governance & Audit Reports',
      tagline: 'Individual permissions tuning and instant executive PDF dossiers',
      icon: ShieldCheck,
      color: 'indigo',
      badge: 'Reporting & Admin',
      description: 'Manage individual advisor permissions via the "Access" button and export single-row Excel and modern executive PDF dossiers on demand.',
      keyPoints: [
        {
          title: 'Single-Row ACCESS Control',
          desc: 'Fine-tune any Sales Advisor’s frontline privileges (Stock, LOU, Leads, Quota) directly from the table ACTION column.'
        },
        {
          title: 'Modern Styled Executive PDF Dossier',
          desc: 'Generate a clean, professional, confidential SA performance audit dossier complete with official Ingress verification seal.'
        },
        {
          title: 'Dealership Split Excel Sheets',
          desc: 'Export consolidated coverage or split sheets organized by Mitsubishi, PERODUA, and PROTON e.MAS dealerships.'
        }
      ],
      interactiveDemo: {
        type: 'governance',
        title: 'ACTION Column Quick Controls',
        actions: [
          { label: 'Access', icon: KeyRound, desc: 'Single-row permission tuning modal', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { label: 'Download ▾', icon: Download, desc: 'Excel (.xlsx) or Executive PDF Report', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Portal', icon: Compass, desc: 'Preview advisor’s perspective live', color: 'text-amber-600 bg-amber-50 border-amber-200' }
        ]
      },
      proTip: 'The downloaded PDF report is formatted for A4 executive briefings and does NOT contain hardware terminal identifiers.'
    }
  ];

  const activeStepData = steps[currentStep];
  const StepIcon = activeStepData.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="coverage-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl sm:max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50/80 via-indigo-50/40 to-slate-50 dark:from-sky-950/40 dark:via-indigo-950/20 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  Auto Guide & Interactive Tour
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Ingress SA Engine • Version 4.2
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Sales Advisor Dashboard: Operational Guide & Mastery
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Walkthrough vs Daily Readiness Checklist */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('walkthrough')}
              className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'walkthrough'
                  ? 'border-sky-600 text-sky-700 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Step-by-Step Walkthrough ({currentStep + 1}/{steps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Daily SA Readiness Checklist</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            Ingress Corporation Berhad • Frontline Governance
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {activeTab === 'walkthrough' ? (
            <>
              {/* Stepper Pills Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 pb-2">
                {steps.map((st, idx) => {
                  const isCurrent = idx === currentStep;
                  const isDone = idx < currentStep;
                  const Icon = st.icon;

                  return (
                    <button
                      key={st.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                          : isDone
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-900'
                          : 'bg-slate-100/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold">Step {st.stepNum}</span>
                        {isDone ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Icon className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <span className="text-[10px] font-bold block truncate">
                        {st.title.split(' ')[0]} {st.title.split(' ')[1] || ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Step Feature Hero */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/30 dark:from-slate-950 dark:to-sky-950/20 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                          {activeStepData.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Step {activeStepData.stepNum} of {steps.length}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {activeStepData.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans italic sm:text-right max-w-xs">
                    "{activeStepData.tagline}"
                  </span>
                </div>

                <p className="text-xs font-sans text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {activeStepData.description}
                </p>

                {/* Key Points 3-Column Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
                  {activeStepData.keyPoints.map((kp, kIdx) => (
                    <div 
                      key={kIdx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                          {kp.title}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                        {kp.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Interactive Demo Simulation Area */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-sky-200 dark:border-sky-900/50 shadow-2xs">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="text-[10.5px] font-bold text-slate-900 dark:text-slate-100">
                        {activeStepData.interactiveDemo.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 font-bold uppercase">
                      Live Simulation
                    </span>
                  </div>

                  {activeStepData.interactiveDemo.type === 'access' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {activeStepData.interactiveDemo.advisorName} ({activeStepData.interactiveDemo.staffId})
                        </span>
                        <span className="text-[11px] text-slate-500 font-sans block">
                          Branch: {activeStepData.interactiveDemo.branch}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                          {activeStepData.interactiveDemo.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 border border-indigo-200 font-bold text-[10px]">
                          {activeStepData.interactiveDemo.tier}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStepData.interactiveDemo.type === 'stock' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                      {activeStepData.interactiveDemo.items?.map((item, idx) => (
                        <div key={idx} className={`p-2 rounded-lg border flex items-center justify-between ${item.color}`}>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.model}</span>
                          <span className="font-mono font-bold text-[10px]">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeStepData.interactiveDemo.type === 'lou' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                      {activeStepData.interactiveDemo.banks?.map((bank, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{bank.name}</span>
                            <span className="text-[9.5px] text-slate-500 font-sans">{bank.sla} • {bank.approval}</span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 font-bold">
                            {bank.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeStepData.interactiveDemo.type === 'leads' && (
                    <div className="space-y-1.5 text-[10.5px]">
                      {activeStepData.interactiveDemo.leads?.map((lead, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{lead.name}</span>
                            <span className="text-slate-500 text-[10px] ml-2">({lead.model})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] text-slate-500">{lead.time}</span>
                            <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 text-[9px] font-bold">
                              Claimed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeStepData.interactiveDemo.type === 'quota' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Advisor: {activeStepData.interactiveDemo.advisor}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">
                          Bookings: {activeStepData.interactiveDemo.actual} / {activeStepData.interactiveDemo.target} Units ({activeStepData.interactiveDemo.rate})
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-right">
                        <span className="text-[9.5px] text-slate-500 block">Estimated Progressive Payout</span>
                        <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">
                          {activeStepData.interactiveDemo.estCommission}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStepData.interactiveDemo.type === 'governance' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
                      {activeStepData.interactiveDemo.actions?.map((act, idx) => {
                        const ActIcon = act.icon;
                        return (
                          <div key={idx} className={`p-2.5 rounded-lg border ${act.color}`}>
                            <div className="flex items-center gap-1.5 font-bold mb-0.5">
                              <ActIcon className="w-3.5 h-3.5" />
                              <span>{act.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-600 dark:text-slate-400 font-sans block leading-tight">
                              {act.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pro Tip Callout */}
                <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 block">
                      Frontline Operational Advice
                    </span>
                    <p className="text-[10.5px] font-sans text-amber-950 dark:text-amber-200 mt-0.5 leading-relaxed">
                      {activeStepData.proTip}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Frontline Daily Readiness Checklist */
            <div className="space-y-3.5 font-sans">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs uppercase font-mono tracking-wider">Daily Frontline SA Readiness Routine</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Sales Advisors must complete these 5 operational verification steps daily upon showroom floor opening to ensure smooth handover turnarounds and maximum commission capture.
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  {
                    id: 'check1',
                    title: '1. Verify Active DMS & Portal Connection',
                    desc: 'Log in with 2FA credentials on mobile or showroom workstation; confirm status shows "Connected".',
                    category: 'System'
                  },
                  {
                    id: 'check2',
                    title: '2. Audit Morning Floor Stock & Payment Status',
                    desc: 'Inspect In Stock allocation queue for units marked "Stock Paid" vs "Not Yet Paid" before taking walk-in inquiries.',
                    category: 'Stock'
                  },
                  {
                    id: 'check3',
                    title: '3. Follow-up Pending Bank LOU Submissions (>24h)',
                    desc: 'Contact financing officers from Maybank, CIMB, or Public Bank for loan files awaiting credit sign-off.',
                    category: 'LOU'
                  },
                  {
                    id: 'check4',
                    title: '4. Claim & Contact New Digital Showroom Leads',
                    desc: 'Verify customer pipeline queue; ensure first customer telephone/WhatsApp contact is initiated within 15 minutes.',
                    category: 'Leads'
                  },
                  {
                    id: 'check5',
                    title: '5. Synchronize Monthly Quota & Handover Calendar',
                    desc: 'Confirm registered units with branch coordinator to verify customer delivery dates before end-of-month cut-off.',
                    category: 'Quota'
                  }
                ].map((item) => {
                  const isChecked = checklistState[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                          : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 bg-white dark:bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100">
                              {item.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-sans text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        isChecked ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isChecked ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenHandbook && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHandbook();
                }}
                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Open complete Ingress Sales Advisor Standard Operating Procedure (SOP) Handbook"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Open SOP Handbook</span>
              </button>
            )}

            {onSimulatePortal && (
              <button
                onClick={() => {
                  onClose();
                  onSimulatePortal();
                }}
                className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Preview Sales Advisor direct dashboard perspective"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Launch Portal Simulation</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === 'walkthrough' && (
              <>
                <button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span>Next Module</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Done & Close</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'checklist' && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold cursor-pointer"
              >
                Close Guide
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
