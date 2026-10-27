/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DashboardFilterState {
  financialYear: string;
  timePeriodType: 'Daily' | 'Accumulative Weekly' | 'Month to Day (MTD)' | 'Monthly' | 'Quarterly' | 'Year to Day (YTD)' | 'Full Year Scope';
  selectedDay: string;
  selectedWeek: string;
  selectedMonth: string;
  selectedQuarter: string;
  selectedBranch: string;
}

export interface Dealership {
  id: string;
  name: string;
  brand: string;
  corporateEntity?: string;
  location: string;
  bookings: number;
  cancellations: number;
  conversionRate: number; // percentage
  registrations: number;
  targetBookings: number;
  revenue: number;
  activeSalesReps: number;
  topModel: string;
  status: 'optimal' | 'warning' | 'critical';
}

export interface BookingEvent {
  id: string;
  timestamp: Date;
  dealershipId: string;
  dealershipName: string;
  type: 'booking' | 'cancellation' | 'registration' | 'conversion';
  model: string;
  value: number;
  customerName: string;
  details?: string;
}

export interface HourlyTrend {
  time: string;
  bookings: number;
  cancellations: number;
  conversions: number;
  registrations: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface CustomerSourceItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  leads: number;
  walkIns: number;
  testDrives: number;
  bookings: number;
  registrations: number;
}

export interface CancellationReason {
  id: string;
  reason: string;
  category: 'rejection' | 'cancellation';
  keyword: string;
  percentage: number;
  count: number;
  color: string;
  description: string;
}

export interface TopBankLOU {
  id: string;
  bankName: string;
  code: string;
  louApprovedCount: number;
  louRejectedCount: number;
  totalFinancingAmount: number;
  approvalRate: number;
  avgTurnaroundDays: number;
  color: string;
}

export type StockPaymentStatus = 'Paid' | 'Not Yet Paid' | 'Partially Paid';

export interface BranchRepStock {
  branchName: string;
  totalSalesReps: number;
  stockOnHand: number;
  stockInTransit: number;
  totalAvailable: number;
  reserved: number;
  status: 'In Stock' | 'Non Available';
  paymentStatus: StockPaymentStatus;
  paidUnits: number;
  notYetPaidUnits: number;
}

export interface ModelStockItem {
  id: string;
  model: string;
  brand: string;
  stockOnHand: number;
  stockInTransit: number;
  totalAvailable: number;
  reserved: number;
  status: 'In Stock' | 'Non Available';
  paymentStatus: StockPaymentStatus;
  paidUnits: number;
  notYetPaidUnits: number;
  branchBreakdown?: BranchRepStock[];
}

export type SalesAdvisorDutyStatus = 
  | 'In Showroom' 
  | 'Customer Test Drive' 
  | 'Bank LOU Submission' 
  | 'Handover Delivery' 
  | 'Field Client Visit';

export type DashboardAccessTier = 
  | 'Full SA Portal Access' 
  | 'Lead & LOU Mobile Access' 
  | 'Showroom Floor Access';

export interface FrontlinePrivileges {
  stockPaymentVisibility: boolean;
  bankLOUFastTrack: boolean;
  leadClaiming: boolean;
  quotaCommissionMeter: boolean;
}

export interface SalesAdvisor {
  id: string;
  staffId: string;
  name: string;
  role: string;
  dealershipId: string;
  dealershipName: string;
  brand: string;
  branchName: string;
  phone: string;
  email: string;
  avatarColor: string;
  dutyStatus: SalesAdvisorDutyStatus;
  dashboardAccessLevel: DashboardAccessTier;
  accessEnabled: boolean;
  twoFactorAuth: boolean;
  lastActive: string;
  registeredDevice: string;
  privileges?: FrontlinePrivileges;
  // Performance Metrics
  targetBookings: number;
  actualBookings: number;
  registrations: number;
  cancellations: number;
  conversionRate: number;
  louApprovedCount: number;
  financingValue: number;
  activeLeads: number;
  topModel: string;
  performanceTier: 'Top Performer' | 'High Achiever' | 'Rising Star';
}

