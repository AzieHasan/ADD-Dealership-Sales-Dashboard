import { INITIAL_SALES_ADVISORS } from './salesAdvisorsData';
export { INITIAL_SALES_ADVISORS };
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dealership, HourlyTrend, ConversionFunnel, CancellationReason, BookingEvent, CustomerSourceItem, TopBankLOU, ModelStockItem, SalesAdvisor } from '../types';

export const INITIAL_DEALERSHIPS: Dealership[] = [
  {
    id: 'all',
    name: 'All Dealerships',
    brand: 'Multi-Brand',
    corporateEntity: 'Ingress Corporation Berhad',
    location: 'Direct Office, Damansara',
    bookings: 93,
    cancellations: 36,
    conversionRate: 27.2,
    registrations: 64,
    targetBookings: 117,
    revenue: 6992500,
    activeSalesReps: 43,
    topModel: 'PROTON e.MAS',
    status: 'optimal'
  },
  {
    id: 'dt-porsche',
    name: 'Ingress Motors Centre Sdn. Bhd.',
    brand: 'Mitsubishi',
    corporateEntity: 'Ingress Motors Centre Sdn. Bhd.',
    location: 'Puchong',
    bookings: 18,
    cancellations: 10,
    conversionRate: 34.6,
    registrations: 14,
    targetBookings: 22,
    revenue: 2945000,
    activeSalesReps: 16,
    topModel: 'TRITON',
    status: 'optimal'
  },
  {
    id: 'ns-audi',
    name: 'Ingress Motors Centre Sdn. Bhd.',
    brand: 'PERODUA',
    corporateEntity: 'Ingress Motors Centre Sdn. Bhd.',
    location: 'The Curve, Damansara',
    bookings: 34,
    cancellations: 15,
    conversionRate: 26.8,
    registrations: 22,
    targetBookings: 45,
    revenue: 1890000,
    activeSalesReps: 15,
    topModel: 'PERODUA BEZZA',
    status: 'optimal'
  },
  {
    id: 'ws-bmw',
    name: 'Ingress Auto Sdn. Bhd.',
    brand: 'PROTON e.MAS',
    corporateEntity: 'Ingress Auto Sdn. Bhd.',
    location: 'Direct Office, Damansara',
    bookings: 41,
    cancellations: 11,
    conversionRate: 24.2,
    registrations: 28,
    targetBookings: 50,
    revenue: 2157500,
    activeSalesReps: 12,
    topModel: 'PROTON e.MAS 5',
    status: 'warning'
  }
];

export const HOURLY_TRENDS: HourlyTrend[] = [
  { time: '08:00', bookings: 3, cancellations: 0, conversions: 8, registrations: 2 },
  { time: '09:00', bookings: 8, cancellations: 1, conversions: 12, registrations: 4 },
  { time: '10:00', bookings: 14, cancellations: 1, conversions: 16, registrations: 8 },
  { time: '11:00', bookings: 20, cancellations: 2, conversions: 20, registrations: 14 },
  { time: '12:00', bookings: 28, cancellations: 2, conversions: 24, registrations: 18 },
  { time: '13:00', bookings: 38, cancellations: 3, conversions: 28, registrations: 24 },
  { time: '14:00', bookings: 48, cancellations: 4, conversions: 34, registrations: 30 },
  { time: '15:00', bookings: 58, cancellations: 5, conversions: 38, registrations: 38 },
  { time: '16:00', bookings: 68, cancellations: 6, conversions: 42, registrations: 46 },
  { time: '17:00', bookings: 78, cancellations: 7, conversions: 46, registrations: 54 },
  { time: '18:00', bookings: 86, cancellations: 8, conversions: 49, registrations: 60 },
  { time: '19:00', bookings: 93, cancellations: 9, conversions: 52, registrations: 64 }
];

export const CUSTOMER_SOURCES_MASTER = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'Facebook' },
  { id: 'reference', name: 'Reference', color: '#10B981', icon: 'UserCheck' },
  { id: 'repeat', name: 'Repeat Customer', color: '#8B5CF6', icon: 'RotateCcw' },
  { id: 'walkin', name: 'Walk-in', color: '#F59E0B', icon: 'Footprints' },
  { id: 'roadshow', name: 'Roadshow', color: '#EC4899', icon: 'MapPin' },
  { id: 'event', name: 'Showroom Event', color: '#6366F1', icon: 'Sparkles' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2FE', icon: 'Video' },
  { id: 'broker', name: 'Broker', color: '#F97316', icon: 'Briefcase' }
];

export const CUSTOMER_SOURCES_BY_DEALER: Record<string, CustomerSourceItem[]> = {
  // Mitsubishi (dt-porsche) - Total Registrations = 14
  'dt-porsche': [
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'Facebook', leads: 32, walkIns: 18, testDrives: 12, bookings: 8, registrations: 3 },
    { id: 'reference', name: 'Reference', color: '#10B981', icon: 'UserCheck', leads: 16, walkIns: 12, testDrives: 9, bookings: 6, registrations: 3 },
    { id: 'repeat', name: 'Repeat Customer', color: '#8B5CF6', icon: 'RotateCcw', leads: 12, walkIns: 10, testDrives: 8, bookings: 6, registrations: 3 },
    { id: 'walkin', name: 'Walk-in', color: '#F59E0B', icon: 'Footprints', leads: 22, walkIns: 16, testDrives: 9, bookings: 5, registrations: 2 },
    { id: 'roadshow', name: 'Roadshow', color: '#EC4899', icon: 'MapPin', leads: 18, walkIns: 8, testDrives: 4, bookings: 3, registrations: 1 },
    { id: 'event', name: 'Showroom Event', color: '#6366F1', icon: 'Sparkles', leads: 14, walkIns: 7, testDrives: 3, bookings: 2, registrations: 1 },
    { id: 'tiktok', name: 'TikTok', color: '#00F2FE', icon: 'Video', leads: 10, walkIns: 3, testDrives: 2, bookings: 1, registrations: 1 },
    { id: 'broker', name: 'Broker', color: '#F97316', icon: 'Briefcase', leads: 6, walkIns: 1, testDrives: 1, bookings: 1, registrations: 0 }
  ],
  // PERODUA (ns-audi) - Total Registrations = 22
  'ns-audi': [
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'Facebook', leads: 38, walkIns: 22, testDrives: 14, bookings: 9, registrations: 5 },
    { id: 'reference', name: 'Reference', color: '#10B981', icon: 'UserCheck', leads: 20, walkIns: 15, testDrives: 11, bookings: 8, registrations: 5 },
    { id: 'repeat', name: 'Repeat Customer', color: '#8B5CF6', icon: 'RotateCcw', leads: 16, walkIns: 13, testDrives: 10, bookings: 7, registrations: 5 },
    { id: 'walkin', name: 'Walk-in', color: '#F59E0B', icon: 'Footprints', leads: 28, walkIns: 20, testDrives: 11, bookings: 7, registrations: 3 },
    { id: 'roadshow', name: 'Roadshow', color: '#EC4899', icon: 'MapPin', leads: 20, walkIns: 9, testDrives: 4, bookings: 3, registrations: 1 },
    { id: 'event', name: 'Showroom Event', color: '#6366F1', icon: 'Sparkles', leads: 16, walkIns: 7, testDrives: 3, bookings: 2, registrations: 1 },
    { id: 'tiktok', name: 'TikTok', color: '#00F2FE', icon: 'Video', leads: 12, walkIns: 3, testDrives: 2, bookings: 1, registrations: 1 },
    { id: 'broker', name: 'Broker', color: '#F97316', icon: 'Briefcase', leads: 5, walkIns: 1, testDrives: 1, bookings: 1, registrations: 1 }
  ],
  // PROTON e.MAS (ws-bmw) - Total Registrations = 28
  'ws-bmw': [
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'Facebook', leads: 25, walkIns: 14, testDrives: 9, bookings: 6, registrations: 7 },
    { id: 'reference', name: 'Reference', color: '#10B981', icon: 'UserCheck', leads: 12, walkIns: 9, testDrives: 7, bookings: 5, registrations: 6 },
    { id: 'repeat', name: 'Repeat Customer', color: '#8B5CF6', icon: 'RotateCcw', leads: 10, walkIns: 8, testDrives: 6, bookings: 4, registrations: 6 },
    { id: 'walkin', name: 'Walk-in', color: '#F59E0B', icon: 'Footprints', leads: 18, walkIns: 12, testDrives: 7, bookings: 4, registrations: 4 },
    { id: 'roadshow', name: 'Roadshow', color: '#EC4899', icon: 'MapPin', leads: 12, walkIns: 5, testDrives: 3, bookings: 2, registrations: 2 },
    { id: 'event', name: 'Showroom Event', color: '#6366F1', icon: 'Sparkles', leads: 10, walkIns: 4, testDrives: 2, bookings: 1, registrations: 1 },
    { id: 'tiktok', name: 'TikTok', color: '#00F2FE', icon: 'Video', leads: 5, walkIns: 2, testDrives: 1, bookings: 1, registrations: 1 },
    { id: 'broker', name: 'Broker', color: '#F97316', icon: 'Briefcase', leads: 3, walkIns: 1, testDrives: 1, bookings: 0, registrations: 1 }
  ]
};

export const MONTH_NAMES: { value: number | 'all'; label: string }[] = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
  { value: 'all', label: 'All Months (Full Year)' }
];

export const YEAR_OPTIONS: { value: number; label: string; isCurrent?: boolean }[] = [
  { value: 2026, label: '2026', isCurrent: true },
  { value: 2025, label: '2025' },
  { value: 2024, label: '2024' }
];

export function getMonthYearMultiplier(year: number, month: number | 'all'): number {
  const yearScale = year === 2026 ? 1.0 : year === 2025 ? 0.88 : 0.75;
  
  if (month === 'all') {
    return yearScale * 10.5;
  }

  const monthSeasonality: Record<number, number> = {
    1: 0.82,
    2: 0.86,
    3: 0.92,
    4: 0.95,
    5: 0.98,
    6: 1.02,
    7: 1.0,
    8: 0.96,
    9: 0.99,
    10: 1.05,
    11: 1.12,
    12: 1.25
  };

  const monthScale = monthSeasonality[month] || 1.0;
  return yearScale * monthScale;
}

export function getCustomerSourcesForDealer(
  dealerId: string, 
  year: number = 2026,
  month: number | 'all' = 7,
  multiplier: number = 1
): CustomerSourceItem[] {
  const mult = getMonthYearMultiplier(year, month) * multiplier;

  const scaleSource = (s: CustomerSourceItem): CustomerSourceItem => ({
    ...s,
    leads: Math.round(s.leads * mult),
    walkIns: Math.round(s.walkIns * mult),
    testDrives: Math.round(s.testDrives * mult),
    bookings: Math.round(s.bookings * mult),
    registrations: Math.round(s.registrations * mult)
  });

  if (dealerId === 'all' || !CUSTOMER_SOURCES_BY_DEALER[dealerId]) {
    const masterMap: Record<string, CustomerSourceItem> = {};
    
    CUSTOMER_SOURCES_MASTER.forEach(m => {
      masterMap[m.id] = { ...m, leads: 0, walkIns: 0, testDrives: 0, bookings: 0, registrations: 0 };
    });

    Object.values(CUSTOMER_SOURCES_BY_DEALER).forEach(dealerSources => {
      dealerSources.forEach(s => {
        if (masterMap[s.id]) {
          masterMap[s.id].leads += Math.round(s.leads * mult);
          masterMap[s.id].walkIns += Math.round(s.walkIns * mult);
          masterMap[s.id].testDrives += Math.round(s.testDrives * mult);
          masterMap[s.id].bookings += Math.round(s.bookings * mult);
          masterMap[s.id].registrations += Math.round(s.registrations * mult);
        }
      });
    });

    return Object.values(masterMap);
  }

  const rawSources = CUSTOMER_SOURCES_BY_DEALER[dealerId] || [];
  return rawSources.map(scaleSource);
}

export interface CustomerSourceFunnelItem extends ConversionFunnel {
  id: string;
  walkIns: number;
  testDrives: number;
  bookings: number;
  registrations: number;
  conversionRate: number;
}

export function getConversionFunnelForDealer(
  dealerId: string,
  year: number = 2026,
  month: number | 'all' = 7,
  multiplier: number = 1
): CustomerSourceFunnelItem[] {
  const sources = getCustomerSourcesForDealer(dealerId, year, month, multiplier);
  const totalLeadsAllSources = sources.reduce((sum, s) => sum + s.leads, 0) || 1;

  return sources.map(s => {
    const sharePercentage = Number(((s.leads / totalLeadsAllSources) * 100).toFixed(1));
    const convRate = s.leads > 0 ? Number(((s.registrations / s.leads) * 100).toFixed(1)) : 0;

    return {
      id: s.id,
      stage: s.name,
      count: s.leads,
      percentage: sharePercentage,
      color: s.color,
      icon: s.icon,
      walkIns: s.walkIns,
      testDrives: s.testDrives,
      bookings: s.bookings,
      registrations: s.registrations,
      conversionRate: convRate
    };
  });
}

export const CONVERSION_FUNNEL: ConversionFunnel[] = getConversionFunnelForDealer('all');

export const CANCELLATION_REASONS_BY_DEALER: Record<string, Record<string, number>> = {
  // Mitsubishi (dt-porsche)
  'dt-porsche': {
    'rej-1': 2,
    'rej-2': 1,
    'rej-3': 1,
    'rej-4': 1,
    'can-1': 2,
    'can-2': 1,
    'can-3': 1,
    'can-4': 1,
    'can-5': 0,
  },
  // PERODUA (ns-audi)
  'ns-audi': {
    'rej-1': 3,
    'rej-2': 2,
    'rej-3': 2,
    'rej-4': 2,
    'can-1': 2,
    'can-2': 2,
    'can-3': 1,
    'can-4': 0,
    'can-5': 1,
  },
  // PROTON e.MAS (ws-bmw)
  'ws-bmw': {
    'rej-1': 2,
    'rej-2': 2,
    'rej-3': 1,
    'rej-4': 1,
    'can-1': 1,
    'can-2': 1,
    'can-3': 1,
    'can-4': 1,
    'can-5': 1,
  },
};

export const CANCELLATION_REASONS_BASE: CancellationReason[] = [
  // --- REJECTION CATEGORIES (Loan/Bank Rejections) ---
  {
    id: 'rej-1',
    reason: 'Low Income / DSR Threshold',
    category: 'rejection',
    keyword: 'low income',
    count: 7,
    percentage: 19,
    color: '#f43f5e', // rose-500
    description: 'Debt Service Ratio (DSR) exceeded basic income threshold'
  },
  {
    id: 'rej-2',
    reason: 'High Commitment Load',
    category: 'rejection',
    keyword: 'high commitment',
    count: 5,
    percentage: 14,
    color: '#e11d48', // rose-600
    description: 'Excessive existing credit card & bank loan commitments'
  },
  {
    id: 'rej-3',
    reason: 'AKPK Enrollment / Debt Restructure',
    category: 'rejection',
    keyword: 'AKPK',
    count: 4,
    percentage: 11,
    color: '#be123c', // rose-700
    description: 'Enrolled under Agensi Kaunseling & Pengurusan Kredit'
  },
  {
    id: 'rej-4',
    reason: 'CTOS / CCRIS Record Issue',
    category: 'rejection',
    keyword: 'CTOS/CCRIS',
    count: 4,
    percentage: 11,
    color: '#9f1239', // rose-800
    description: 'Adverse credit history or loan default record flagged'
  },

  // --- CANCELLATION CATEGORIES (Customer/Operational Withdrawals) ---
  {
    id: 'can-1',
    reason: 'Took Another Brand',
    category: 'cancellation',
    keyword: 'took another brand',
    count: 5,
    percentage: 14,
    color: '#f59e0b', // amber-500
    description: 'Cross-shopped & opted for competitor vehicle model'
  },
  {
    id: 'can-2',
    reason: 'Personal Financial / Emergency Issue',
    category: 'cancellation',
    keyword: 'Personal issue',
    count: 4,
    percentage: 11,
    color: '#d97706', // amber-600
    description: 'Sudden financial reallocation or personal emergency'
  },
  {
    id: 'can-3',
    reason: 'Better Offer Elsewhere',
    category: 'cancellation',
    keyword: 'Better offer',
    count: 3,
    percentage: 8,
    color: '#b45309', // amber-700
    description: 'Competitor dealership provided higher cash rebate'
  },
  {
    id: 'can-4',
    reason: 'Trade-In Valuation Overhang',
    category: 'cancellation',
    keyword: 'Trade in issue',
    count: 2,
    percentage: 6,
    color: '#f97316', // orange-500
    description: 'Used car trade-in valuation below required settlement'
  },
  {
    id: 'can-5',
    reason: 'Stock Delay / Color Unavailable',
    category: 'cancellation',
    keyword: 'Stock issue',
    count: 2,
    percentage: 6,
    color: '#ea580c', // orange-600
    description: 'Long factory lead time or preferred spec out of stock'
  }
];

export function getCancellationReasonsForDealer(dealerId: string, multiplier: number = 1): CancellationReason[] {
  if (dealerId === 'all' || !CANCELLATION_REASONS_BY_DEALER[dealerId]) {
    // For 'all', aggregate Mitsubishi (dt-porsche), PERODUA (ns-audi), and PROTON e.MAS (ws-bmw)
    const aggregatedCounts: Record<string, number> = {};
    Object.values(CANCELLATION_REASONS_BY_DEALER).forEach(dealerObj => {
      Object.entries(dealerObj).forEach(([reasonId, count]) => {
        aggregatedCounts[reasonId] = (aggregatedCounts[reasonId] || 0) + count;
      });
    });

    const totalAll = Object.values(aggregatedCounts).reduce((sum, c) => sum + c, 0);

    const reasons = CANCELLATION_REASONS_BASE.map(reason => {
      const baseCount = aggregatedCounts[reason.id] ?? reason.count;
      const count = Math.max(0, Math.round(baseCount * multiplier));
      const percentage = totalAll > 0 ? Math.round((baseCount / totalAll) * 100) : 0;
      return {
        ...reason,
        count,
        percentage
      };
    });

    const totalScaled = reasons.reduce((sum, r) => sum + r.count, 0);
    if (totalScaled === 0 && multiplier > 0) {
      reasons[0].count = 1;
      if (reasons.length > 4) reasons[4].count = 1;
    }

    return reasons;
  }

  const dealerObj = CANCELLATION_REASONS_BY_DEALER[dealerId];
  const totalDealer = Object.values(dealerObj).reduce((sum, c) => sum + c, 0);

  const reasons = CANCELLATION_REASONS_BASE.map(reason => {
    const baseCount = dealerObj[reason.id] ?? 0;
    const count = Math.max(0, Math.round(baseCount * multiplier));
    const percentage = totalDealer > 0 ? Math.round((baseCount / totalDealer) * 100) : 0;
    return {
      ...reason,
      count,
      percentage
    };
  });

  const totalScaled = reasons.reduce((sum, r) => sum + r.count, 0);
  if (totalScaled === 0 && multiplier > 0) {
    reasons[0].count = 1;
    if (reasons.length > 4) reasons[4].count = 1;
  }

  return reasons;
}

export const CANCELLATION_REASONS = getCancellationReasonsForDealer('all');

export const INITIAL_EVENTS: BookingEvent[] = [
  {
    id: 'evt-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 mins ago
    dealershipId: 'dt-porsche',
    dealershipName: 'Mitsubishi',
    type: 'booking',
    model: '911 GT3 RS',
    value: 223000,
    customerName: 'Marcus Vance',
    details: 'Allocated customization slot'
  },
  {
    id: 'evt-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 mins ago
    dealershipId: 'ns-audi',
    dealershipName: 'PERODUA',
    type: 'registration',
    model: 'PERODUA BEZZA',
    value: 82500,
    customerName: 'Sarah Jenkins',
    details: 'DMV registration confirmed'
  },
  {
    id: 'evt-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    dealershipId: 'ws-bmw',
    dealershipName: 'PROTON e.MAS',
    type: 'cancellation',
    model: 'PROTON e.MAS 5',
    value: 84000,
    customerName: 'Avery Henderson',
    details: 'Financing contract terms rejected'
  }
/*   {
    id: 'evt-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 22), // 22 mins ago
    dealershipId: 'elite-mercedes',
    dealershipName: 'Elite Mercedes-Benz',
    type: 'booking',
    model: 'Mercedes-Benz G 63 AMG',
    value: 179000,
    customerName: 'Robert Lang',
    details: 'Showroom deposit completed'
  },
  {
    id: 'evt-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    dealershipId: 'metro-tesla',
    dealershipName: 'Metro Tesla',
    type: 'conversion',
    model: 'Tesla Model 3 Long Range',
    value: 47000,
    customerName: 'Chloe Dupont',
    details: 'Digital lead converted at showroom'
  } */
];

export const RECENT_MODELS = [
  { brand: 'Mitsubishi', models: ['XPANDER', 'XFORCE', 'TRITON'] },
  { brand: 'PERODUA', models: ['PERODUA AXIZ', 'PERODUA BEZZA', 'PERODUA MYVI', 'PERODUA ALZA'] },
  { brand: 'PROTON e.MAS', models: ['e.MAS 5', 'e.MAS 7', 'e.MAS 7 PHEV'] }
];

export const CUSTOMERS_MOCK = [
  'Liam Neeson', 'Olivia Carter', 'Noah Brooks', 'Emma Sterling', 'Jackson Cole',
  'Sophia Reed', 'Lucas Thorne', 'Mia Vance', 'Ethan Grant', 'Isabella Moss',
  'Oliver Vance', 'Charlotte Hayes', 'Aiden Frost', 'Amelia Bennett', 'Elijah Ward'
];

export const BANK_CONFIG = [
  { id: 'bank-mb', bankName: 'Maybank', code: 'MBB', share: 0.32, approvalRate: 91.2, avgTurnaroundDays: 1.5, color: '#f59e0b' },
  { id: 'bank-pbb', bankName: 'Public Bank', code: 'PBB', share: 0.26, approvalRate: 88.5, avgTurnaroundDays: 1.8, color: '#ef4444' },
  { id: 'bank-cimb', bankName: 'CIMB Bank', code: 'CIMB', share: 0.20, approvalRate: 85.4, avgTurnaroundDays: 2.1, color: '#dc2626' },
  { id: 'bank-ambank', bankName: 'AmBank', code: 'AMB', share: 0.11, approvalRate: 82.1, avgTurnaroundDays: 2.3, color: '#3b82f6' },
  { id: 'bank-rhb', bankName: 'RHB Bank', code: 'RHB', share: 0.06, approvalRate: 79.8, avgTurnaroundDays: 2.6, color: '#06b6d4' },
  { id: 'bank-bi', bankName: 'Bank Islam', code: 'BIMB', share: 0.03, approvalRate: 84.0, avgTurnaroundDays: 2.0, color: '#10b981' },
  { id: 'bank-hlb', bankName: 'Hong Leong Bank', code: 'HLB', share: 0.02, approvalRate: 81.5, avgTurnaroundDays: 2.4, color: '#8b5cf6' }
];

export function getTopBanksLOUForDealer(
  dealerId: string = 'all',
  year: number = 2026,
  month: number | 'all' = 7,
  liveRegistrations?: number,
  multiplier: number = 1,
  liveRejected?: number
): TopBankLOU[] {
  // Get unit registrations for the selected dealer
  let totalUnitRegistrations = 0;
  if (typeof liveRegistrations === 'number') {
    totalUnitRegistrations = liveRegistrations;
  } else {
    const sources = getCustomerSourcesForDealer(dealerId, year, month, multiplier);
    totalUnitRegistrations = sources.reduce((sum, s) => sum + s.registrations, 0);
  }

  // Determine average price per unit based on dealership
  let avgPricePerUnit = 82000;
  if (dealerId === 'dt-porsche') avgPricePerUnit = 125000; // Mitsubishi
  else if (dealerId === 'ns-audi') avgPricePerUnit = 52000; // PERODUA
  else if (dealerId === 'ws-bmw') avgPricePerUnit = 78000; // PROTON e.MAS
  else avgPricePerUnit = 82000; // Summary average

  // Allocate unit registrations to banks according to market share
  let allocated = 0;
  const initialBanks = BANK_CONFIG.map((b, idx) => {
    let count = Math.round(totalUnitRegistrations * b.share);
    if (totalUnitRegistrations > 0 && count === 0 && idx < 4) {
      count = 1;
    }
    allocated += count;

    // Calculate rejected LOU count based on target bank approval rate
    const rejRatio = (100 - b.approvalRate) / b.approvalRate;
    let rejectedCount = count > 0 ? Math.max(1, Math.round(count * rejRatio)) : 0;
    if (count === 0) rejectedCount = 0;

    return {
      id: b.id,
      bankName: b.bankName,
      code: b.code,
      louApprovedCount: count,
      louRejectedCount: rejectedCount,
      totalFinancingAmount: count * avgPricePerUnit,
      approvalRate: b.approvalRate,
      avgTurnaroundDays: b.avgTurnaroundDays,
      color: b.color
    };
  });

  // Adjust rounding difference on the top bank (Maybank) so sum === totalUnitRegistrations
  const diff = totalUnitRegistrations - allocated;
  if (diff !== 0 && initialBanks.length > 0) {
    initialBanks[0].louApprovedCount = Math.max(0, initialBanks[0].louApprovedCount + diff);
    initialBanks[0].totalFinancingAmount = initialBanks[0].louApprovedCount * avgPricePerUnit;
  }

  // If liveRejected is specified, distribute liveRejected across banks
  if (typeof liveRejected === 'number') {
    const targetRejected = Math.max(0, liveRejected);
    let allocatedRej = 0;
    initialBanks.forEach((b, idx) => {
      let rCount = Math.round(targetRejected * BANK_CONFIG[idx].share);
      if (targetRejected > 0 && rCount === 0 && idx < 3) {
        rCount = 1;
      }
      b.louRejectedCount = rCount;
      allocatedRej += rCount;
    });
    const rejDiff = targetRejected - allocatedRej;
    if (rejDiff !== 0 && initialBanks.length > 0) {
      initialBanks[0].louRejectedCount = Math.max(0, initialBanks[0].louRejectedCount + rejDiff);
    }
  }

  // Recalculate exact approval rate for each bank: (Approved / (Approved + Rejected)) * 100
  return initialBanks.map(b => {
    const totalApps = b.louApprovedCount + b.louRejectedCount;
    const exactApprovalRate = totalApps > 0
      ? Number(((b.louApprovedCount / totalApps) * 100).toFixed(1))
      : 0;
    return {
      ...b,
      approvalRate: exactApprovalRate
    };
  }).sort((a, b) => b.louApprovedCount - a.louApprovedCount);
}

export const MODEL_STOCK_DATA: Record<string, ModelStockItem[]> = {
  'dt-porsche': [
    { 
      id: 'st-triton', 
      model: 'TRITON', 
      brand: 'Mitsubishi', 
      stockOnHand: 18, 
      stockInTransit: 6, 
      totalAvailable: 24, 
      reserved: 4, 
      status: 'In Stock',
      paymentStatus: 'Partially Paid',
      paidUnits: 18,
      notYetPaidUnits: 6,
      branchBreakdown: [
        { branchName: 'PUCHONG', totalSalesReps: 3, stockOnHand: 8, stockInTransit: 3, totalAvailable: 11, reserved: 2, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 8, notYetPaidUnits: 3 },
        { branchName: 'IMC, BANDAR BARU BANGI', totalSalesReps: 3, stockOnHand: 6, stockInTransit: 2, totalAvailable: 8, reserved: 1, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 8, notYetPaidUnits: 0 },
        { branchName: 'SHAH ALAM', totalSalesReps: 2, stockOnHand: 4, stockInTransit: 1, totalAvailable: 5, reserved: 1, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 2, notYetPaidUnits: 3 }
      ]
    },
    { 
      id: 'st-xpander', 
      model: 'XPANDER', 
      brand: 'Mitsubishi', 
      stockOnHand: 0, 
      stockInTransit: 0, 
      totalAvailable: 0, 
      reserved: 0, 
      status: 'Non Available',
      paymentStatus: 'Not Yet Paid',
      paidUnits: 0,
      notYetPaidUnits: 0,
      branchBreakdown: [
        { branchName: 'PUCHONG', totalSalesReps: 3, stockOnHand: 0, stockInTransit: 0, totalAvailable: 0, reserved: 0, status: 'Non Available', paymentStatus: 'Not Yet Paid', paidUnits: 0, notYetPaidUnits: 0 },
        { branchName: 'IMC, BANDAR BARU BANGI', totalSalesReps: 3, stockOnHand: 0, stockInTransit: 0, totalAvailable: 0, reserved: 0, status: 'Non Available', paymentStatus: 'Not Yet Paid', paidUnits: 0, notYetPaidUnits: 0 },
        { branchName: 'SHAH ALAM', totalSalesReps: 2, stockOnHand: 0, stockInTransit: 0, totalAvailable: 0, reserved: 0, status: 'Non Available', paymentStatus: 'Not Yet Paid', paidUnits: 0, notYetPaidUnits: 0 }
      ]
    },
    { 
      id: 'st-xforce', 
      model: 'XFORCE', 
      brand: 'Mitsubishi', 
      stockOnHand: 11, 
      stockInTransit: 4, 
      totalAvailable: 15, 
      reserved: 3, 
      status: 'In Stock',
      paymentStatus: 'Paid',
      paidUnits: 15,
      notYetPaidUnits: 0,
      branchBreakdown: [
        { branchName: 'PUCHONG', totalSalesReps: 3, stockOnHand: 5, stockInTransit: 1, totalAvailable: 6, reserved: 1, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 6, notYetPaidUnits: 0 },
        { branchName: 'IMC, BANDAR BARU BANGI', totalSalesReps: 3, stockOnHand: 4, stockInTransit: 1, totalAvailable: 5, reserved: 1, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 5, notYetPaidUnits: 0 },
        { branchName: 'SHAH ALAM', totalSalesReps: 2, stockOnHand: 2, stockInTransit: 2, totalAvailable: 4, reserved: 1, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 4, notYetPaidUnits: 0 }
      ]
    },
  ],
  'ns-audi': [
    { 
      id: 'st-axia', 
      model: 'PERODUA AXIA', 
      brand: 'PERODUA', 
      stockOnHand: 32, 
      stockInTransit: 10, 
      totalAvailable: 42, 
      reserved: 8, 
      status: 'In Stock',
      paymentStatus: 'Partially Paid',
      paidUnits: 34,
      notYetPaidUnits: 8,
      branchBreakdown: [
        { branchName: 'The Curve', totalSalesReps: 6, stockOnHand: 18, stockInTransit: 5, totalAvailable: 23, reserved: 4, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 19, notYetPaidUnits: 4 },
        { branchName: 'MUTIARA DAMANSARA', totalSalesReps: 5, stockOnHand: 14, stockInTransit: 5, totalAvailable: 19, reserved: 4, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 15, notYetPaidUnits: 4 }
      ]
    },
    { 
      id: 'st-bezza', 
      model: 'PERODUA BEZZA', 
      brand: 'PERODUA', 
      stockOnHand: 28, 
      stockInTransit: 10, 
      totalAvailable: 38, 
      reserved: 9, 
      status: 'In Stock',
      paymentStatus: 'Paid',
      paidUnits: 38,
      notYetPaidUnits: 0,
      branchBreakdown: [
        { branchName: 'The Curve', totalSalesReps: 6, stockOnHand: 15, stockInTransit: 5, totalAvailable: 20, reserved: 5, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 20, notYetPaidUnits: 0 },
        { branchName: 'MUTIARA DAMANSARA', totalSalesReps: 5, stockOnHand: 13, stockInTransit: 5, totalAvailable: 18, reserved: 4, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 18, notYetPaidUnits: 0 }
      ]
    },
    { 
      id: 'st-myvi', 
      model: 'PERODUA MYVI', 
      brand: 'PERODUA', 
      stockOnHand: 21, 
      stockInTransit: 8, 
      totalAvailable: 29, 
      reserved: 6, 
      status: 'In Stock',
      paymentStatus: 'Partially Paid',
      paidUnits: 18,
      notYetPaidUnits: 11,
      branchBreakdown: [
        { branchName: 'The Curve', totalSalesReps: 6, stockOnHand: 12, stockInTransit: 4, totalAvailable: 16, reserved: 3, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 10, notYetPaidUnits: 6 },
        { branchName: 'MUTIARA DAMANSARA', totalSalesReps: 5, stockOnHand: 9, stockInTransit: 4, totalAvailable: 13, reserved: 3, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 8, notYetPaidUnits: 5 }
      ]
    },
    { 
      id: 'st-alza', 
      model: 'PERODUA ALZA', 
      brand: 'PERODUA', 
      stockOnHand: 12, 
      stockInTransit: 7, 
      totalAvailable: 19, 
      reserved: 5, 
      status: 'In Stock',
      paymentStatus: 'Not Yet Paid',
      paidUnits: 0,
      notYetPaidUnits: 19,
      branchBreakdown: [
        { branchName: 'The Curve', totalSalesReps: 6, stockOnHand: 7, stockInTransit: 4, totalAvailable: 11, reserved: 3, status: 'In Stock', paymentStatus: 'Not Yet Paid', paidUnits: 0, notYetPaidUnits: 11 },
        { branchName: 'MUTIARA DAMANSARA', totalSalesReps: 5, stockOnHand: 5, stockInTransit: 3, totalAvailable: 8, reserved: 2, status: 'In Stock', paymentStatus: 'Not Yet Paid', paidUnits: 0, notYetPaidUnits: 8 }
      ]
    },
  ],
  'ws-bmw': [
    { 
      id: 'st-emas5', 
      model: 'e.MAS 5', 
      brand: 'PROTON e.MAS', 
      stockOnHand: 16, 
      stockInTransit: 6, 
      totalAvailable: 22, 
      reserved: 4, 
      status: 'In Stock',
      paymentStatus: 'Paid',
      paidUnits: 22,
      notYetPaidUnits: 0,
      branchBreakdown: [
        { branchName: 'BANDAR BARU BANGI', totalSalesReps: 12, stockOnHand: 16, stockInTransit: 6, totalAvailable: 22, reserved: 4, status: 'In Stock', paymentStatus: 'Paid', paidUnits: 22, notYetPaidUnits: 0 }
      ]
    },
    { 
      id: 'st-emas7', 
      model: 'e.MAS 7', 
      brand: 'PROTON e.MAS', 
      stockOnHand: 22, 
      stockInTransit: 9, 
      totalAvailable: 31, 
      reserved: 7, 
      status: 'In Stock',
      paymentStatus: 'Partially Paid',
      paidUnits: 25,
      notYetPaidUnits: 6,
      branchBreakdown: [
        { branchName: 'BANDAR BARU BANGI', totalSalesReps: 12, stockOnHand: 22, stockInTransit: 9, totalAvailable: 31, reserved: 7, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 25, notYetPaidUnits: 6 }
      ]
    },
    { 
      id: 'st-emas7phev', 
      model: 'e.MAS 7 PHEV', 
      brand: 'PROTON e.MAS', 
      stockOnHand: 9, 
      stockInTransit: 5, 
      totalAvailable: 14, 
      reserved: 4, 
      status: 'In Stock',
      paymentStatus: 'Partially Paid',
      paidUnits: 8,
      notYetPaidUnits: 6,
      branchBreakdown: [
        { branchName: 'BANDAR BARU BANGI', totalSalesReps: 12, stockOnHand: 9, stockInTransit: 5, totalAvailable: 14, reserved: 4, status: 'In Stock', paymentStatus: 'Partially Paid', paidUnits: 8, notYetPaidUnits: 6 }
      ]
    },
  ]
};

export function getModelStockForDealer(dealerIdOrName: string): ModelStockItem[] {
  if (!dealerIdOrName || dealerIdOrName === 'all' || dealerIdOrName === 'All Dealerships' || dealerIdOrName === 'All Dealership') {
    return [
      ...MODEL_STOCK_DATA['dt-porsche'],
      ...MODEL_STOCK_DATA['ns-audi'],
      ...MODEL_STOCK_DATA['ws-bmw'],
    ];
  }
  if (dealerIdOrName === 'dt-porsche' || dealerIdOrName.toLowerCase().includes('mitsubishi') || dealerIdOrName.toLowerCase().includes('ingress motors centre')) {
    return MODEL_STOCK_DATA['dt-porsche'];
  }
  if (dealerIdOrName === 'ns-audi' || dealerIdOrName.toLowerCase().includes('perodua') || (dealerIdOrName.toLowerCase().includes('ingress motors') && !dealerIdOrName.toLowerCase().includes('centre'))) {
    return MODEL_STOCK_DATA['ns-audi'];
  }
  if (dealerIdOrName === 'ws-bmw' || dealerIdOrName.toLowerCase().includes('proton') || dealerIdOrName.toLowerCase().includes('ingress auto')) {
    return MODEL_STOCK_DATA['ws-bmw'];
  }
  return [
    ...MODEL_STOCK_DATA['dt-porsche'],
    ...MODEL_STOCK_DATA['ns-audi'],
    ...MODEL_STOCK_DATA['ws-bmw'],
  ];
}

export function getSalesAdvisorsForDealer(
  dealerIdOrName: string,
  branchName?: string,
  multiplier: number = 1
): SalesAdvisor[] {
  let list = [...INITIAL_SALES_ADVISORS];

  if (!dealerIdOrName || dealerIdOrName === 'all' || dealerIdOrName === 'All Dealerships') {
    // Keep all
  } else if (dealerIdOrName === 'dt-porsche' || dealerIdOrName.toLowerCase().includes('mitsubishi')) {
    list = list.filter(sa => sa.dealershipId === 'dt-porsche');
  } else if (dealerIdOrName === 'ns-audi' || dealerIdOrName.toLowerCase().includes('perodua')) {
    list = list.filter(sa => sa.dealershipId === 'ns-audi');
  } else if (dealerIdOrName === 'ws-bmw' || dealerIdOrName.toLowerCase().includes('proton') || dealerIdOrName.toLowerCase().includes('ingress auto') || dealerIdOrName.toLowerCase().includes('e.mas')) {
    list = list.filter(sa => sa.dealershipId === 'ws-bmw');
  }

  if (branchName && branchName !== 'All Branches') {
    const branchLower = branchName.toLowerCase();
    const branchFiltered = list.filter(sa => 
      sa.branchName.toLowerCase().includes(branchLower) ||
      (branchLower.includes('puchong') && sa.branchName.toLowerCase().includes('puchong')) ||
      (branchLower.includes('curve') && sa.branchName.toLowerCase().includes('curve')) ||
      (branchLower.includes('bangi') && (sa.branchName.toLowerCase().includes('bangi') || sa.brand === 'PROTON e.MAS'))
    );
    if (branchFiltered.length > 0) {
      list = branchFiltered;
    }
  }

  if (multiplier !== 1) {
    return list.map(sa => ({
      ...sa,
      actualBookings: Math.max(1, Math.round(sa.actualBookings * multiplier)),
      registrations: Math.max(0, Math.round(sa.registrations * multiplier)),
      activeLeads: Math.max(2, Math.round(sa.activeLeads * multiplier)),
      financingValue: Math.round(sa.financingValue * multiplier)
    }));
  }

  return list;
}


