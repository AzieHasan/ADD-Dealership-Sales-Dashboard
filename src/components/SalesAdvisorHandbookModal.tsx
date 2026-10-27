/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Search, 
  ShieldCheck, 
  Car, 
  FileCheck, 
  Users, 
  Target, 
  KeyRound, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign, 
  ExternalLink,
  BookMarked
} from 'lucide-react';

interface SalesAdvisorHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAutoGuide?: () => void;
}

interface HandbookSOP {
  id: string;
  code: string;
  category: 'Conduct' | 'Stock' | 'Financing' | 'Leads' | 'Commission' | 'Security';
  categoryLabel: string;
  title: string;
  badge: 'MANDATORY' | 'SLA STANDARD' | 'PROCEDURE' | 'SECURITY';
  badgeColor: string;
  summary: string;
  clauses: string[];
  dos: string[];
  donts: string[];
}

export function SalesAdvisorHandbookModal({
  isOpen,
  onClose,
  onOpenAutoGuide
}: SalesAdvisorHandbookModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedSOPs, setExpandedSOPs] = useState<Record<string, boolean>>({
    'sop-01': true,
    'sop-02': true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSOPs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyClause = (code: string, text: string) => {
    navigator.clipboard?.writeText?.(`${code}: ${text}`);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const sopList: HandbookSOP[] = [
    {
      id: 'sop-01',
      code: 'SOP-SA-101',
      category: 'Conduct',
      categoryLabel: 'Code of Conduct & Governance',
      title: 'Frontline Professional Standards & Showroom Etiquette',
      badge: 'MANDATORY',
      badgeColor: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300',
      summary: 'Establishes official Ingress standards of presentation, guest consultation, and representative branch conduct.',
      clauses: [
        'Advisors must be present at the showroom floor 15 minutes before opening (08:45 MYT) in full Ingress corporate business attire.',
        'Greet all walk-in guests within 30 seconds of entry with warm, hospitable acknowledgment and offer refreshment assistance.',
        'Maintain zero solicitation outside designated Ingress dealerships and adhere to corporate pricing without unauthorized cash rebates.',
        'Strictly record all client interaction notes in the Ingress SA portal within 2 hours of showroom departure.'
      ],
      dos: [
        'Present official Ingress brand brochures and digital configurators on company tablets',
        'Wear company name badge with Staff ID clearly visible at all times',
        'Introduce the service advisor team during the vehicle delivery handover tour'
      ],
      donts: [
        'Never make promises regarding delivery lead time before checking stock clearance',
        'Do not accept cash downpayments outside the official dealership cashier counter',
        'Never share customer contact numbers with 3rd-party tinting or accessory vendors'
      ]
    },
    {
      id: 'sop-02',
      code: 'SOP-SA-201',
      category: 'Stock',
      categoryLabel: 'Floor Stock & Delivery SOP',
      title: 'Vehicle Allocation & Stock Payment Clearance Protocol',
      badge: 'PROCEDURE',
      badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
      summary: 'Regulates vehicle reservation, Paid vs Not Yet Paid floor allocations, and pre-delivery inspection (PDI) sign-offs.',
      clauses: [
        'Only units marked "Stock Paid" in the SA dashboard may be officially scheduled for JPJ DMV registration and customer handover ceremonies.',
        'Vehicles marked "Not Yet Paid" are held under factory floorplan arrangement; delivery commitments require branch manager payment sign-off.',
        'Vehicle reservations without confirmed bank LOU approval are strictly capped at 7 calendar days before automatic release back to the inventory pool.',
        'Pre-Delivery Inspection (PDI) checklist consisting of 42 inspection checkpoints must be signed off by both the SA and Chief PDI Technician.'
      ],
      dos: [
        'Verify chassis and engine numbers against the official invoice prior to DMV registration',
        'Take customer through the full electronic vehicle orientation and warranty activation',
        'Document existing vehicle odometer reading (under 50 km delivery limit)'
      ],
      donts: [
        'Never hand over a vehicle without verified receipt of full downpayment balance',
        'Do not release unregistered trade-in vehicles until ownership transfer is stamped',
        'Never remove manufacturer transport protective wraps without authorized PDI bay access'
      ]
    },
    {
      id: 'sop-03',
      code: 'SOP-SA-301',
      category: 'Financing',
      categoryLabel: 'Bank LOU & Financing Manual',
      title: 'Hire-Purchase Financing & Fast-Track LOU Submissions',
      badge: 'SLA STANDARD',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
      summary: 'Standard operating rules for credit submissions to Maybank, Public Bank, CIMB, Hong Leong Bank, and AmBank.',
      clauses: [
        'Advisors must collect certified 3-month salary slips, 3-month bank statements, and EPF statements before submitting to the bank fast-track portal.',
        'Applications submitted to Maybank and Public Bank carry a 48-hour approval turnaround SLA under the Ingress corporate tier agreement.',
        'In the event of bank rejection, advisor must consult the Ingress Finance Specialist within 24 hours to restructure tenure or propose an alternative tier-2 bank.',
        'Financing Letters of Undertaking (LOU) must be countersigned by the customer in person or via verified digital banking sign-off.'
      ],
      dos: [
        'Clearly explain effective interest rates, monthly installment schedules, and insurance coverage',
        'Offer approved Islamic auto financing options where requested by customers',
        'Retain timestamped digital copies of LOU approvals in the customer profile'
      ],
      donts: [
        'Never falsify or alter income tax (LHDN) or EPF documents under any circumstances',
        'Do not submit an applicant to more than 3 banks concurrently to preserve CCRIS scoring',
        'Never accept signing of blank hire-purchase contract forms'
      ]
    },
    {
      id: 'sop-04',
      code: 'SOP-SA-401',
      category: 'Leads',
      categoryLabel: 'Customer Pipeline & Lead Claiming SLA',
      title: 'Digital Showroom Lead Response & 15-Minute Contact Rule',
      badge: 'SLA STANDARD',
      badgeColor: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300',
      summary: 'Governs the allocation, claiming, and conversion milestones of digital leads generated via Mitsubishi, Perodua, and Proton e.MAS portals.',
      clauses: [
        'Mandatory 15-Minute First Contact SLA: SAs claiming a digital lead must contact the client via phone or verified WhatsApp within 15 minutes of claiming.',
        'Lead Reservation Period: Claimed leads remain exclusive to the advisor for 48 hours; lack of logged follow-up triggers automatic return to branch pool.',
        'Test-Drive Booking Logging: SAs must log all customer test-drive indemnity waivers in the portal prior to releasing test-drive vehicles on the road.',
        'Conversion Efficiency Target: Sales Advisors are required to maintain a monthly lead conversion efficiency above 30%.'
      ],
      dos: [
        'Confirm customer valid Malaysian driving license before initiating any test drive',
        'Follow official branch-approved test-drive routes incorporating urban and highway sectors',
        'Send digital thank-you note and quotation summary within 1 hour post consultation'
      ],
      donts: [
        'Never hoard leads without active daily contact logs',
        'Do not conduct test drives during extreme weather without branch manager approval',
        'Never delete customer objection logs; record constructive feedback for sales coaching'
      ]
    },
    {
      id: 'sop-05',
      code: 'SOP-SA-501',
      category: 'Commission',
      categoryLabel: 'Quotas & Commission Framework',
      title: 'Monthly Quota Achievement, DMV Deliveries & Incentive Calculation',
      badge: 'PROCEDURE',
      badgeColor: 'bg-violet-100 text-violet-900 dark:bg-violet-950/80 dark:text-violet-300 border-violet-300',
      summary: 'Framework governing monthly booking quotas, registered DMV units, accelerator multipliers, and progressive payout schedules.',
      clauses: [
        'Monthly quotas are established by the Ingress Automotive Division prior to the 1st of each calendar month based on historical branch allocations.',
        'Commission eligibility requires full vehicle registration (DMV) completion and finance disbursement clearing before end-of-month cut-off.',
        'Performance Tiers: Top Performer (100%+ quota fulfillment), High Achiever (75%-99%), Rising Star (<75%).',
        'Commission Payout Schedule: Final audited incentive payouts are disbursed on the 15th of the following month after internal corporate accounting sign-off.'
      ],
      dos: [
        'Track personal actual vs target bookings meter daily to calibrate closing momentum',
        'Coordinate with vehicle delivery coordinators 5 days prior to month-end to finalize paperwork',
        'Retain individual single-row Excel and PDF dossiers for personal commission audit'
      ],
      donts: [
        'Cancellations exceeding 25% of gross bookings trigger automatic supervisor audit',
        'Do not count customer vehicle bookings without verified deposit receipts as quota units',
        'Never dispute commission settlements without providing official DMV registration numbers'
      ]
    },
    {
      id: 'sop-06',
      code: 'SOP-SA-601',
      category: 'Security',
      categoryLabel: 'DMS Security, Authentication & PDPA',
      title: 'DMS Access Governance, Multi-Factor Authentication & Customer Privacy',
      badge: 'SECURITY',
      badgeColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300',
      summary: 'Data protection standards complying with the Malaysian Personal Data Protection Act 2010 (PDPA) and Ingress IT governance.',
      clauses: [
        'Sales Advisors must not share their portal credentials or 2FA authentication tokens with any colleague, contractor, or family member.',
        'Customer identity cards, payslips, and bank statements must only be uploaded to encrypted Ingress storage and never stored on personal cloud drives.',
        'Device Lock Policy: Mobile tablets and showroom terminals must auto-lock after 3 minutes of inactivity to prevent unauthorized access.',
        'Loss or theft of any registered device containing customer files must be reported to Ingress IT Helpdesk within 2 hours.'
      ],
      dos: [
        'Obtain explicit customer PDPA consent before archiving personal documentation',
        'Use only company-issued encrypted USB drives where offline transfer is unavoidable',
        'Log out of showroom floor kiosks whenever stepping away from the consultation desk'
      ],
      donts: [
        'Never photograph customer credit cards or banking passwords',
        'Do not send customer financial records via unencrypted public email servers',
        'Never bypass two-factor authentication or share one-time password (OTP) codes'
      ]
    }
  ];

  const filteredSOPs = useMemo(() => {
    return sopList.filter(sop => {
      // Category filter
      if (selectedCategory !== 'All' && sop.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesCode = sop.code.toLowerCase().includes(query);
        const matchesTitle = sop.title.toLowerCase().includes(query);
        const matchesSummary = sop.summary.toLowerCase().includes(query);
        const matchesClauses = sop.clauses.some(c => c.toLowerCase().includes(query));
        return matchesCode || matchesTitle || matchesSummary || matchesClauses;
      }
      return true;
    });
  }, [selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="coverage-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl sm:max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50/80 via-emerald-50/40 to-slate-50 dark:from-amber-950/40 dark:via-emerald-950/20 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <BookMarked className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Official SOP Handbook
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Doc Ref: ING-ADD-SOP-2026-V4
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Ingress Automotive Division • Sales Advisor Policy Handbook
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer hidden sm:flex items-center gap-1 font-mono text-xs font-bold"
              title="Print Handbook / Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print SOP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SOP by rule, keyword, e.g. '15 minutes', 'LOU', 'Stock Paid'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All SOPs' },
              { id: 'Conduct', label: '1. Conduct' },
              { id: 'Stock', label: '2. Stock SOP' },
              { id: 'Financing', label: '3. Bank LOU' },
              { id: 'Leads', label: '4. Leads SLA' },
              { id: 'Commission', label: '5. Quota & Pay' },
              { id: 'Security', label: '6. Security' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body - SOP Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1">
            <span>Showing {filteredSOPs.length} standard operating procedure directives</span>
            <span>Ingress Dealership Governance Constitution</span>
          </div>

          {filteredSOPs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No matching SOP policies found</p>
              <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search terms or selecting another category.</p>
            </div>
          ) : (
            filteredSOPs.map(sop => {
              const isExpanded = expandedSOPs[sop.id] ?? false;

              return (
                <div 
                  key={sop.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-2xs overflow-hidden transition-all hover:border-amber-300/80 dark:hover:border-amber-700/60"
                >
                  {/* SOP Header */}
                  <div 
                    onClick={() => toggleExpand(sop.id)}
                    className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shrink-0 mt-0.5">
                        {sop.code}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${sop.badgeColor}`}>
                            {sop.badge}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {sop.categoryLabel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {sop.title}
                        </h4>
                        <p className="text-[11px] font-sans text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {sop.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyClause(sop.code, sop.clauses[0]);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                        title="Copy SOP Reference"
                      >
                        {copiedId === sop.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* SOP Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4 font-sans text-xs bg-white dark:bg-slate-900">
                      {/* Detailed Clauses */}
                      <div>
                        <h5 className="font-mono uppercase font-bold text-[10.5px] text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Operational Clauses & Governance Standards:</span>
                        </h5>
                        <div className="space-y-1.5 pl-2 border-l-2 border-amber-300 dark:border-amber-700">
                          {sop.clauses.map((clause, cIdx) => (
                            <p key={cIdx} className="text-slate-700 dark:text-slate-300 text-[11.5px] leading-relaxed">
                              <strong className="font-mono text-slate-900 dark:text-slate-100 mr-1.5">{cIdx + 1}.</strong>
                              {clause}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Do's and Don'ts Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Do's */}
                        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800">
                          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold mb-1.5 text-[11px] font-mono uppercase">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mandatory Ingress Practice (DO)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-emerald-950 dark:text-emerald-200">
                            {sop.dos.map((d, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-1.5 leading-snug">
                                <span className="text-emerald-600 font-bold shrink-0">•</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Don'ts */}
                        <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800">
                          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold mb-1.5 text-[11px] font-mono uppercase">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Strictly Prohibited (DON'T)</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-rose-950 dark:text-rose-200">
                            {sop.donts.map((d, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-1.5 leading-snug">
                                <span className="text-rose-600 font-bold shrink-0">•</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            {onOpenAutoGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAutoGuide();
                }}
                className="px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 hover:bg-sky-100 text-sky-950 dark:bg-sky-950/60 dark:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Launch Auto Guide walkthrough"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Launch Interactive Auto Guide</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors"
            >
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors"
            >
              Close Handbook
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
