/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx-js-style';
import { Dealership, DashboardFilterState, BookingEvent, ModelStockItem, TopBankLOU, CancellationReason, SalesAdvisor } from '../types';
import { CustomerSourceFunnelItem, getSalesAdvisorsForDealer } from '../data/mockData';

// Helper to calculate auto-fit column widths
function fitColumns(data: Record<string, any>[]): { wch: number }[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        if (str.length > maxLen) maxLen = str.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 4, 14), 48) };
  });
}

/**
 * Format relative or stored activity into a formatted absolute "Date & Time Last Login" timestamp.
 * Example output: "2026-10-21 07:54 AM"
 */
export function formatLastLoginDateTime(lastActiveStr: string = '', staffId: string = ''): string {
  const now = new Date();
  let minutesAgo = 0;
  
  const cleaned = (lastActiveStr || '').trim().toLowerCase();
  if (cleaned.includes('just now')) {
    minutesAgo = 2;
  } else if (cleaned.includes('min')) {
    const match = cleaned.match(/(\d+)/);
    minutesAgo = match ? parseInt(match[1], 10) : 5;
  } else if (cleaned.includes('hr') || cleaned.includes('hour')) {
    const match = cleaned.match(/(\d+)/);
    const hrs = match ? parseInt(match[1], 10) : 1;
    minutesAgo = hrs * 60;
  } else if (cleaned.includes('day')) {
    const match = cleaned.match(/(\d+)/);
    const days = match ? parseInt(match[1], 10) : 1;
    minutesAgo = days * 1440;
  } else {
    minutesAgo = 12;
  }

  // Derive stable minute/second variance per staffId for realistic non-colliding timestamps
  let charSum = 0;
  for (let i = 0; i < staffId.length; i++) {
    charSum += staffId.charCodeAt(i);
  }
  const secOffset = charSum % 60;

  const loginTime = new Date(now.getTime() - minutesAgo * 60 * 1000 - secOffset * 1000);
  
  const year = loginTime.getFullYear();
  const month = String(loginTime.getMonth() + 1).padStart(2, '0');
  const day = String(loginTime.getDate()).padStart(2, '0');
  
  const hours24 = loginTime.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(loginTime.getMinutes()).padStart(2, '0');
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  return `${year}-${month}-${day} ${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Applies executive styling to all header cells (Row 1):
 * - Fill background color (default: clean executive light tint, or per-feature theme)
 * - Crisp, bold dark typography with high contrast
 * - Centered vertical & horizontal alignment with text wrapping
 * - Header borders
 * - Adequate row height for professional presentation
 * - Alternate row tinting for clean data readability
 */
function applyHeaderStyles(
  ws: XLSX.WorkSheet,
  fillColorRgb: string = '1E3A8A', // Deep Navy Blue
  fontColorRgb: string = 'FFFFFF'  // High-Contrast White Text
) {
  if (!ws || !ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Set generous row height for the header row
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 28, hpx: 36 };

  // 1. Style Header Row (r = range.s.r, which is row 0 in 0-indexed)
  for (let c = range.s.c; c <= range.e.c; c++) {
    const headerAddress = XLSX.utils.encode_cell({ r: range.s.r, c });
    if (!ws[headerAddress]) {
      ws[headerAddress] = { t: 's', v: '' };
    }
    const cell = ws[headerAddress];
    cell.s = {
      fill: {
        patternType: 'solid',
        fgColor: { rgb: fillColorRgb }
      },
      font: {
        name: 'Segoe UI',
        sz: 11,
        bold: true,
        color: { rgb: fontColorRgb }
      },
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true
      },
      border: {
        top: { style: 'thin', color: { rgb: '334155' } },
        bottom: { style: 'medium', color: { rgb: '0F172A' } },
        left: { style: 'thin', color: { rgb: '334155' } },
        right: { style: 'thin', color: { rgb: '334155' } }
      }
    };
  }

  // 2. Style Data Rows (subtle alternate row tinting and clean borders)
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const isEven = r % 2 === 0;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellAddress];
      if (cell) {
        cell.s = {
          fill: isEven ? {
            patternType: 'solid',
            fgColor: { rgb: 'F8FAFC' }
          } : {
            patternType: 'solid',
            fgColor: { rgb: 'FFFFFF' }
          },
          font: {
            name: 'Segoe UI',
            sz: 10,
            color: { rgb: '1E293B' }
          },
          alignment: {
            vertical: 'center',
            horizontal: typeof cell.v === 'number' ? 'right' : 'left'
          },
          border: {
            top: { style: 'thin', color: { rgb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
            left: { style: 'thin', color: { rgb: 'E2E8F0' } },
            right: { style: 'thin', color: { rgb: 'E2E8F0' } }
          }
        };
      }
    }
  }
}

// Format currency helper for Excel cells
export function formatMYR(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY')}`;
}

// -------------------------------------------------------------
// 1. MASTER WORKBOOK: ALL DASHBOARD FEATURES IN A SINGLE FILE
// -------------------------------------------------------------
export interface MasterExportPayload {
  currentDealer: Dealership;
  allDealerships: Dealership[];
  filters: DashboardFilterState;
  events: BookingEvent[];
  budgetVsActual: { month: string; budget: number; actual: number }[];
  modelRankings: {
    model: string;
    brand: string;
    bookings: number;
    registrations: number;
    cancellations: number;
    share: number;
  }[];
  modelStock: ModelStockItem[];
  topBanks: TopBankLOU[];
  conversionFunnel: CustomerSourceFunnelItem[];
  cancellationReasons: CancellationReason[];
  momData: {
    revenueChange: number;
    bookingsChange: number;
    cancellationsChange: number;
    conversionChange: number;
    registrationsChange: number;
    lastMonthRevenue: number;
    lastMonthBookings: number;
    lastMonthCancellations: number;
    lastMonthConversion: number;
    lastMonthRegistrations: number;
  };
}

export function exportAllDashboardFeaturesToExcel(payload: MasterExportPayload) {
  const wb = XLSX.utils.book_new();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dealerTag = payload.currentDealer.id === 'all' ? 'All_Dealerships' : payload.currentDealer.brand.replace(/\s+/g, '_');

  // Sheet 1: Executive KPI Overview (Header: Deep Executive Navy #1E3A8A)
  const kpiData = [
    {
      'Metric Name': 'Gross Revenue',
      'Current Scope Value': formatMYR(payload.currentDealer.revenue),
      'Last Month Value': formatMYR(payload.momData.lastMonthRevenue),
      'MoM Growth (%)': `${payload.momData.revenueChange > 0 ? '+' : ''}${payload.momData.revenueChange}%`,
      'Status': 'Tracked',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Total Unit Bookings',
      'Current Scope Value': `${payload.currentDealer.bookings + payload.currentDealer.cancellations} units`,
      'Last Month Value': `${payload.momData.lastMonthBookings + payload.momData.lastMonthCancellations} units`,
      'MoM Growth (%)': `${payload.momData.bookingsChange > 0 ? '+' : ''}${payload.momData.bookingsChange}%`,
      'Status': 'Tracked',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Net Retained Bookings',
      'Current Scope Value': `${payload.currentDealer.bookings} units`,
      'Last Month Value': `${payload.momData.lastMonthBookings} units`,
      'MoM Growth (%)': `${payload.momData.bookingsChange > 0 ? '+' : ''}${payload.momData.bookingsChange}%`,
      'Status': 'Active',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Dropped / Cancelled Bookings',
      'Current Scope Value': `${payload.currentDealer.cancellations} units`,
      'Last Month Value': `${payload.momData.lastMonthCancellations} units`,
      'MoM Growth (%)': `${payload.momData.cancellationsChange > 0 ? '+' : ''}${payload.momData.cancellationsChange}%`,
      'Status': payload.currentDealer.cancellations > 4 ? 'Alert Attention' : 'Healthy',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Sales Conversion Efficiency',
      'Current Scope Value': `${payload.currentDealer.conversionRate}%`,
      'Last Month Value': `${payload.momData.lastMonthConversion}%`,
      'MoM Growth (%)': `+${payload.momData.conversionChange}%`,
      'Status': 'Optimal',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'DMV Unit Registrations',
      'Current Scope Value': `${payload.currentDealer.registrations} units`,
      'Last Month Value': `${payload.momData.lastMonthRegistrations} units`,
      'MoM Growth (%)': `+${payload.momData.registrationsChange}%`,
      'Status': 'Delivered',
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Booking Target Quota',
      'Current Scope Value': `${payload.currentDealer.targetBookings} units`,
      'Last Month Value': 'N/A',
      'MoM Growth (%)': 'N/A',
      'Status': `${Math.round((payload.currentDealer.bookings / payload.currentDealer.targetBookings) * 100)}% Fulfillment`,
      'Scope Filter': `${payload.filters.financialYear} • ${payload.filters.selectedMonth}`
    },
    {
      'Metric Name': 'Active Sales Advisors',
      'Current Scope Value': `${payload.currentDealer.activeSalesReps} Advisors`,
      'Last Month Value': 'N/A',
      'MoM Growth (%)': 'N/A',
      'Status': 'On Roster',
      'Scope Filter': payload.filters.selectedBranch
    }
  ];
  const wsKPI = XLSX.utils.json_to_sheet(kpiData);
  wsKPI['!cols'] = fitColumns(kpiData);
  applyHeaderStyles(wsKPI, '1E3A8A'); // Deep Navy Blue
  XLSX.utils.book_append_sheet(wb, wsKPI, 'Executive KPIs');

  // Sheet 2: Budget vs Actual Timeline (Header: Indigo #312E81)
  const budgetData = payload.budgetVsActual.map(item => {
    const variance = item.actual - item.budget;
    const fulfillment = item.budget > 0 ? Number(((item.actual / item.budget) * 100).toFixed(1)) : 0;
    return {
      'Month Period': item.month,
      'Budget Target (Units)': item.budget,
      'Actual Sales (Units)': item.actual,
      'Variance (Units)': variance >= 0 ? `+${variance}` : String(variance),
      'Fulfillment Rate (%)': `${fulfillment}%`,
      'Performance Status': fulfillment >= 100 ? 'Exceeded Budget' : fulfillment >= 85 ? 'On Target' : 'Under Target',
      'Dealership Scope': payload.currentDealer.name,
      'Branch Filter': payload.filters.selectedBranch
    };
  });
  const wsBudget = XLSX.utils.json_to_sheet(budgetData);
  wsBudget['!cols'] = fitColumns(budgetData);
  applyHeaderStyles(wsBudget, '312E81'); // Indigo
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget vs Actual');

  // Sheet 3: Model Popularity Rankings (Header: Slate Charcoal #1E293B)
  const rankingsData = payload.modelRankings.map((m, idx) => ({
    'Popularity Rank': `#${idx + 1}`,
    'Model Name': m.model,
    'Brand': m.brand,
    'Total Bookings': m.bookings,
    'Confirmed Registrations': m.registrations,
    'Dropped Bookings': m.cancellations,
    'Market Volume Share (%)': `${m.share}%`,
    'Conversion Efficiency (%)': m.bookings > 0 ? `${((m.registrations / m.bookings) * 100).toFixed(1)}%` : '0%',
    'Dealership Network': payload.currentDealer.name
  }));
  const wsRankings = XLSX.utils.json_to_sheet(rankingsData);
  wsRankings['!cols'] = fitColumns(rankingsData);
  applyHeaderStyles(wsRankings, '1E293B'); // Slate Charcoal
  XLSX.utils.book_append_sheet(wb, wsRankings, 'Model Popularity');

  // Sheet 4: Stock Available & Payment Status (Header: Forest Emerald #065F46)
  const stockSummaryData = payload.modelStock.map(item => {
    const paidPct = item.totalAvailable > 0 ? Math.round((item.paidUnits / item.totalAvailable) * 100) : 0;
    return {
      'Vehicle Model': item.model,
      'Brand': item.brand,
      'Inventory Status': item.status,
      'Stock Payment Status': item.paymentStatus,
      'Total Available (Units)': item.totalAvailable,
      'On-Hand (Showroom)': item.stockOnHand,
      'In-Transit (Hub)': item.stockInTransit,
      'Customer Reserved': item.reserved,
      'Stock Paid Units': item.paidUnits,
      'Not Yet Paid Units': item.notYetPaidUnits,
      'Payment Cleared Ratio (%)': `${paidPct}%`,
      'Delivery Readiness': item.paymentStatus === 'Paid' ? 'Ready for Handover' : item.paymentStatus === 'Partially Paid' ? 'Release on Balance' : 'Pending Floor Plan Settlement'
    };
  });
  const wsStockSummary = XLSX.utils.json_to_sheet(stockSummaryData);
  wsStockSummary['!cols'] = fitColumns(stockSummaryData);
  applyHeaderStyles(wsStockSummary, '065F46'); // Forest Emerald
  XLSX.utils.book_append_sheet(wb, wsStockSummary, 'Stock by Model');

  // Sheet 5: Stock by Branch Breakdown (Header: Deep Emerald #047857)
  const stockBranchData: Record<string, any>[] = [];
  payload.modelStock.forEach(item => {
    if (item.branchBreakdown && item.branchBreakdown.length > 0) {
      item.branchBreakdown.forEach(b => {
        stockBranchData.push({
          'Vehicle Model': item.model,
          'Brand': item.brand,
          'Branch Name': b.branchName,
          'Sales Reps Count': b.totalSalesReps,
          'Branch Status': b.status,
          'Branch Payment Status': b.paymentStatus || item.paymentStatus,
          'Stock On-Hand': b.stockOnHand,
          'Stock In-Transit': b.stockInTransit,
          'Total Available Units': b.totalAvailable,
          'Customer Reserved': b.reserved,
          'Paid Units': b.paidUnits ?? Math.round(b.totalAvailable * 0.7),
          'Not Yet Paid Units': b.notYetPaidUnits ?? (b.totalAvailable - (b.paidUnits ?? Math.round(b.totalAvailable * 0.7)))
        });
      });
    }
  });
  if (stockBranchData.length > 0) {
    const wsBranchStock = XLSX.utils.json_to_sheet(stockBranchData);
    wsBranchStock['!cols'] = fitColumns(stockBranchData);
    applyHeaderStyles(wsBranchStock, '047857'); // Deep Emerald
    XLSX.utils.book_append_sheet(wb, wsBranchStock, 'Stock by Branch');
  }

  // Sheet 6: Dealership Network Comparison (Header: Deep Navy Blue #1E3A8A)
  const dealersData = payload.allDealerships.filter(d => d.id !== 'all').map(d => ({
    'Dealership Name': d.name,
    'Brand': d.brand,
    'Corporate Entity': d.corporateEntity,
    'Primary Location': d.location,
    'Gross Revenue': formatMYR(d.revenue),
    'Monthly Bookings': d.bookings,
    'Target Bookings Quota': d.targetBookings,
    'Quota Achievement (%)': `${Math.round((d.bookings / d.targetBookings) * 100)}%`,
    'Cancellations': d.cancellations,
    'Conversion Efficiency (%)': `${d.conversionRate}%`,
    'Unit Registrations': d.registrations,
    'Active Sales Advisors': d.activeSalesReps,
    'Best Selling Model': d.topModel,
    'Operational Status': d.status === 'optimal' ? 'Optimal Performance' : 'Warning Action Required'
  }));
  const wsDealers = XLSX.utils.json_to_sheet(dealersData);
  wsDealers['!cols'] = fitColumns(dealersData);
  applyHeaderStyles(wsDealers, '1E3A8A'); // Deep Navy Blue
  XLSX.utils.book_append_sheet(wb, wsDealers, 'Dealership Network');

  // Sheet 7: Top Banks (LOU Approved) (Header: Warm Amber Gold #92400E)
  const banksData = payload.topBanks.map((b, idx) => ({
    'Rank': `#${idx + 1}`,
    'Banking Partner': b.bankName,
    'Bank Code': b.code,
    'LOU Approved (Units)': b.louApprovedCount,
    'Total Financing Amount': formatMYR(b.totalFinancingAmount),
    'LOU Approval Rate (%)': `${b.approvalRate}%`,
    'Processing Turnaround (Days)': `${b.avgTurnaroundDays} days`,
    'SLA Status': b.avgTurnaroundDays <= 2.0 ? 'Fast-Track SLA' : 'Standard SLA',
    'Scope': payload.currentDealer.name
  }));
  const wsBanks = XLSX.utils.json_to_sheet(banksData);
  wsBanks['!cols'] = fitColumns(banksData);
  applyHeaderStyles(wsBanks, '92400E'); // Warm Amber Gold
  XLSX.utils.book_append_sheet(wb, wsBanks, 'Top Banks LOU Approved');

  // Sheet 8: Customer Conversion Funnel & Lead Sources (Header: Royal Violet #581C87)
  const funnelData = payload.conversionFunnel.map(f => ({
    'Channel / Acquisition Source': f.stage,
    'Total Inquiries / Leads': f.count,
    'Walk-in Consultations': f.walkIns,
    'Test Drives Completed': f.testDrives,
    'Booking Orders Secured': f.bookings,
    'DMV Registrations Delivered': f.registrations,
    'End-to-End Conversion Rate (%)': `${f.conversionRate}%`,
    'Share of Pipeline (%)': `${f.percentage}%`,
    'Dealership Filter': payload.currentDealer.name
  }));
  const wsFunnel = XLSX.utils.json_to_sheet(funnelData);
  wsFunnel['!cols'] = fitColumns(funnelData);
  applyHeaderStyles(wsFunnel, '581C87'); // Royal Violet
  XLSX.utils.book_append_sheet(wb, wsFunnel, 'Customer Funnel');

  // Sheet 9: Cancellation & Rejection Risk Analysis (Header: Deep Rose / Crimson #881337)
  const cancellationData = payload.cancellationReasons.map((c, idx) => ({
    'Rank': `#${idx + 1}`,
    'Risk Factor': c.reason,
    'Classification': c.category === 'rejection' ? 'Bank Loan / Credit Rejection' : 'Customer / Market Cancellation',
    'Impacted Bookings (Units)': c.count,
    'Risk Contribution Share (%)': `${c.percentage}%`,
    'Analysis Keyword Tag': c.keyword,
    'Diagnostic Notes': c.description,
    'Dealership': payload.currentDealer.name
  }));
  const wsCancellation = XLSX.utils.json_to_sheet(cancellationData);
  wsCancellation['!cols'] = fitColumns(cancellationData);
  applyHeaderStyles(wsCancellation, '881337'); // Deep Rose / Crimson
  XLSX.utils.book_append_sheet(wb, wsCancellation, 'Cancellation Risk');

  // Sheet 10: Live Inflow Feed Transactions (Header: Deep Teal #0F766E)
  const liveEventsData = payload.events.map(e => ({
    'Transaction ID': e.id,
    'Timestamp (MYT)': new Date(e.timestamp).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
    'Dealership': e.dealershipName,
    'Transaction Type': e.type.toUpperCase(),
    'Vehicle Model': e.model,
    'Customer Name': e.customerName,
    'Transaction Value': formatMYR(e.value),
    'Operational Details': e.details
  }));
  const wsEvents = XLSX.utils.json_to_sheet(liveEventsData);
  wsEvents['!cols'] = fitColumns(liveEventsData);
  applyHeaderStyles(wsEvents, '0F766E'); // Deep Teal
  XLSX.utils.book_append_sheet(wb, wsEvents, 'Live Inflow Stream');

  // Sheet 11: Sales Advisor Coverage & Workforce Roster (Header: Warm Amber Gold #92400E)
  const advisors = getSalesAdvisorsForDealer(payload.filters.selectedBranch === 'All Branches' ? 'all' : payload.currentDealer.id, payload.filters.selectedBranch);
  const advisorRows = advisors.map((sa, idx) => ({
    'No.': idx + 1,
    'Staff ID': sa.staffId,
    'Advisor Name': sa.name,
    'Role': sa.role,
    'Dealership Network': sa.dealershipName,
    'Representative Branch': sa.branchName,
    'Access Level': sa.dashboardAccessLevel,
    'Direct Access': sa.accessEnabled ? 'Active' : 'Suspended',
    'Target Quota': sa.targetBookings,
    'Actual Bookings': sa.actualBookings,
    'Registrations': sa.registrations,
    'Cancellations': sa.cancellations,
    'Conversion Efficiency (%)': `${sa.conversionRate}%`,
    'LOU Approved': sa.louApprovedCount,
    'Financing (RM)': formatMYR(sa.financingValue),
    'Active Leads': sa.activeLeads,
    'Top Model': sa.topModel,
    'Date & Time Last Login': formatLastLoginDateTime(sa.lastActive, sa.staffId)
  }));
  const wsAdvisors = XLSX.utils.json_to_sheet(advisorRows);
  wsAdvisors['!cols'] = fitColumns(advisorRows);
  applyHeaderStyles(wsAdvisors, '92400E'); // Warm Amber Gold
  XLSX.utils.book_append_sheet(wb, wsAdvisors, 'Sales Advisor Coverage');

  // Trigger download with cellStyles enabled
  const filename = `Ingress_Dashboard_Master_Export_${dealerTag}_${timestamp}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

// -------------------------------------------------------------
// 2. INDIVIDUAL FEATURE-LEVEL EXPORT FUNCTIONS
// -------------------------------------------------------------

/** Export Budget vs Actual & Model Popularity feature */
export function exportBudgetVsActualFeature(
  budgetData: { month: string; budget: number; actual: number }[],
  modelRankings: { model: string; brand: string; bookings: number; registrations: number; cancellations: number; share: number }[],
  filters: { dealershipName: string; branch: string; period: string }
) {
  const wb = XLSX.utils.book_new();

  // Timeline Sheet (Header: Indigo #312E81)
  const rowsTimeline = budgetData.map(b => {
    const variance = b.actual - b.budget;
    const fulfillment = b.budget > 0 ? Number(((b.actual / b.budget) * 100).toFixed(1)) : 0;
    return {
      'Month Period': b.month,
      'Sales Budget Target (Units)': b.budget,
      'Actual Sales (Units)': b.actual,
      'Variance (Units)': variance >= 0 ? `+${variance}` : String(variance),
      'Fulfillment Rate (%)': `${fulfillment}%`,
      'Status': fulfillment >= 100 ? 'Exceeded Budget' : fulfillment >= 85 ? 'On Target' : 'Under Target',
      'Dealership': filters.dealershipName,
      'Branch': filters.branch
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(rowsTimeline);
  ws1['!cols'] = fitColumns(rowsTimeline);
  applyHeaderStyles(ws1, '312E81'); // Indigo
  XLSX.utils.book_append_sheet(wb, ws1, 'Budget vs Actual');

  // Model Rankings Sheet (Header: Slate Charcoal #1E293B)
  const rowsRankings = modelRankings.map((m, idx) => ({
    'Rank': `#${idx + 1}`,
    'Model': m.model,
    'Brand': m.brand,
    'Bookings': m.bookings,
    'Registrations': m.registrations,
    'Cancellations': m.cancellations,
    'Market Share (%)': `${m.share}%`,
    'Conversion (%)': m.bookings > 0 ? `${((m.registrations / m.bookings) * 100).toFixed(1)}%` : '0%'
  }));
  const ws2 = XLSX.utils.json_to_sheet(rowsRankings);
  ws2['!cols'] = fitColumns(rowsRankings);
  applyHeaderStyles(ws2, '1E293B'); // Slate Charcoal
  XLSX.utils.book_append_sheet(wb, ws2, 'Model Popularity');

  const filename = `Ingress_Budget_vs_Actual_${filters.dealershipName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Stock Available by Model & Payment Status feature */
export function exportStockAvailableFeature(
  stockList: ModelStockItem[],
  dealerName: string
) {
  const wb = XLSX.utils.book_new();

  // Model Stock Summary (Header: Forest Emerald #065F46)
  const rowsModel = stockList.map(item => ({
    'Vehicle Model': item.model,
    'Brand': item.brand,
    'Inventory Status': item.status,
    'Payment Status': item.paymentStatus,
    'Total Available (Units)': item.totalAvailable,
    'Stock On-Hand': item.stockOnHand,
    'Stock In-Transit': item.stockInTransit,
    'Customer Reserved': item.reserved,
    'Stock Paid Units': item.paidUnits,
    'Not Yet Paid Units': item.notYetPaidUnits,
    'Payment Cleared Ratio (%)': item.totalAvailable > 0 ? `${Math.round((item.paidUnits / item.totalAvailable) * 100)}%` : '0%',
    'Delivery Readiness': item.paymentStatus === 'Paid' ? 'Delivery Eligible' : item.paymentStatus === 'Partially Paid' ? 'Release upon balance' : 'Pending Floor Plan Settlement'
  }));
  const ws1 = XLSX.utils.json_to_sheet(rowsModel);
  ws1['!cols'] = fitColumns(rowsModel);
  applyHeaderStyles(ws1, '065F46'); // Forest Emerald
  XLSX.utils.book_append_sheet(wb, ws1, 'Stock by Model');

  // Branch Breakdown (Header: Deep Emerald #047857)
  const rowsBranch: Record<string, any>[] = [];
  stockList.forEach(item => {
    if (item.branchBreakdown) {
      item.branchBreakdown.forEach(b => {
        rowsBranch.push({
          'Vehicle Model': item.model,
          'Brand': item.brand,
          'Branch Name': b.branchName,
          'Sales Reps': b.totalSalesReps,
          'Stock On-Hand': b.stockOnHand,
          'Stock In-Transit': b.stockInTransit,
          'Total Available': b.totalAvailable,
          'Reserved': b.reserved,
          'Branch Status': b.status,
          'Payment Status': b.paymentStatus || item.paymentStatus,
          'Paid Units': b.paidUnits ?? 0,
          'Not Yet Paid Units': b.notYetPaidUnits ?? 0
        });
      });
    }
  });
  if (rowsBranch.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(rowsBranch);
    ws2['!cols'] = fitColumns(rowsBranch);
    applyHeaderStyles(ws2, '047857'); // Deep Emerald
    XLSX.utils.book_append_sheet(wb, ws2, 'Branch Breakdown');
  }

  const filename = `Ingress_Stock_Available_${dealerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Top Banks (LOU Approved) feature */
export function exportTopBanksFeature(
  banks: TopBankLOU[],
  dealerName: string,
  filterLabel: string
) {
  const wb = XLSX.utils.book_new();
  const rows = banks.map((b, idx) => ({
    'Rank': `#${idx + 1}`,
    'Bank Name': b.bankName,
    'Bank Code': b.code,
    'LOU Approved (Units)': b.louApprovedCount,
    'Total Loan Financing (RM)': formatMYR(b.totalFinancingAmount),
    'Approval Rate (%)': `${b.approvalRate}%`,
    'Turnaround SLA (Days)': `${b.avgTurnaroundDays} days`,
    'Performance': b.avgTurnaroundDays <= 2.0 ? 'Top Fast Tier' : 'Standard Tier',
    'Dealership Scope': dealerName,
    'Time Filter': filterLabel
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = fitColumns(rows);
  applyHeaderStyles(ws, '92400E'); // Warm Amber Gold
  XLSX.utils.book_append_sheet(wb, ws, 'Top Banks LOU');

  const filename = `Ingress_Top_Banks_LOU_${dealerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Customer Conversion Funnel feature */
export function exportConversionFunnelFeature(
  funnel: CustomerSourceFunnelItem[],
  dealerName: string,
  filterLabel: string
) {
  const wb = XLSX.utils.book_new();
  const rows = funnel.map(f => ({
    'Channel / Acquisition Stage': f.stage,
    'Inquiries / Leads': f.count,
    'Walk-Ins': f.walkIns,
    'Test Drives': f.testDrives,
    'Bookings Secured': f.bookings,
    'Registrations Delivered': f.registrations,
    'Channel Conversion Rate (%)': `${f.conversionRate}%`,
    'Pipeline Share (%)': `${f.percentage}%`,
    'Dealership Scope': dealerName,
    'Time Filter': filterLabel
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = fitColumns(rows);
  applyHeaderStyles(ws, '581C87'); // Royal Violet
  XLSX.utils.book_append_sheet(wb, ws, 'Conversion Pipeline');

  const filename = `Ingress_Conversion_Funnel_${dealerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Cancellation & Rejection Risk feature */
export function exportCancellationRiskFeature(
  reasons: CancellationReason[],
  dealerName: string,
  filterLabel: string
) {
  const wb = XLSX.utils.book_new();
  const rows = reasons.map((r, idx) => ({
    'Rank': `#${idx + 1}`,
    'Cancellation / Rejection Factor': r.reason,
    'Category': r.category === 'rejection' ? 'Bank Loan / Credit Rejection' : 'Customer / Market Cancellation',
    'Impacted Volume (Units)': r.count,
    'Contribution Share (%)': `${r.percentage}%`,
    'Analysis Keyword': r.keyword,
    'Detailed Description': r.description,
    'Dealership Scope': dealerName,
    'Time Filter': filterLabel
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = fitColumns(rows);
  applyHeaderStyles(ws, '881337'); // Deep Rose / Crimson
  XLSX.utils.book_append_sheet(wb, ws, 'Cancellation Risk');

  const filename = `Ingress_Cancellation_Risk_${dealerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Dealership Comparison / Performance Index feature */
export function exportDealershipComparisonFeature(
  dealerships: Dealership[]
) {
  const wb = XLSX.utils.book_new();
  const rows = dealerships.filter(d => d.id !== 'all').map(d => ({
    'Dealership Name': d.name,
    'Brand': d.brand,
    'Corporate Entity': d.corporateEntity,
    'Showroom Location': d.location,
    'Gross Revenue (RM)': formatMYR(d.revenue),
    'Bookings (Units)': d.bookings,
    'Monthly Target (Units)': d.targetBookings,
    'Achievement (%)': `${Math.round((d.bookings / d.targetBookings) * 100)}%`,
    'Dropped Bookings': d.cancellations,
    'Conversion Efficiency (%)': `${d.conversionRate}%`,
    'Registrations (Units)': d.registrations,
    'Active Sales Advisors': d.activeSalesReps,
    'Top Model': d.topModel,
    'Status': d.status
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = fitColumns(rows);
  applyHeaderStyles(ws, '1E3A8A'); // Deep Navy Blue
  XLSX.utils.book_append_sheet(wb, ws, 'Dealership Comparison');

  const filename = `Ingress_Dealership_Performance_Index_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export Live Inflow Feed transactions */
export function exportLiveFeedFeature(
  events: BookingEvent[]
) {
  const wb = XLSX.utils.book_new();
  const rows = events.map(e => ({
    'Event ID': e.id,
    'Time (MYT)': new Date(e.timestamp).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
    'Dealership': e.dealershipName,
    'Transaction Type': e.type.toUpperCase(),
    'Vehicle Model': e.model,
    'Customer Name': e.customerName,
    'Transaction Amount (RM)': formatMYR(e.value),
    'Operational Notes': e.details
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = fitColumns(rows);
  applyHeaderStyles(ws, '0F766E'); // Deep Teal
  XLSX.utils.book_append_sheet(wb, ws, 'Live Inflow Stream');

  const filename = `Ingress_Live_Inflow_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Helper to sanitize and ensure valid Excel sheet name (max 31 chars, no illegal characters) */
function sanitizeSheetName(name: string, fallback = 'Sheet'): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim();
  return (cleaned.slice(0, 31) || fallback).trim();
}

/** Export Sales Advisor Coverage & Roster Access feature with sheets split by dealership */
export function exportSalesAdvisorCoverageFeature(
  advisors: SalesAdvisor[],
  dealerName: string,
  filterLabel: string
) {
  const wb = XLSX.utils.book_new();

  const mapAdvisorToRow = (sa: SalesAdvisor, idx: number, scope: string) => ({
    'No.': idx + 1,
    'Staff ID': sa.staffId,
    'Sales Advisor Name': sa.name,
    'Designation / Role': sa.role,
    'Dealership Network': sa.dealershipName,
    'Brand': sa.brand,
    'Representative Branch': sa.branchName,
    'Dashboard Access Tier': sa.dashboardAccessLevel,
    'Portal Access Enabled': sa.accessEnabled ? 'Active (Connected)' : 'Suspended',
    'Two-Factor Auth (2FA)': sa.twoFactorAuth ? 'Verified' : 'Pending',
    'Target Bookings Quota': sa.targetBookings,
    'Actual Bookings Secured': sa.actualBookings,
    'Confirmed Registrations': sa.registrations,
    'Dropped Bookings': sa.cancellations,
    'Conversion Efficiency (%)': `${sa.conversionRate}%`,
    'Bank LOU Approved (Units)': sa.louApprovedCount,
    'Financing Value Arranged (RM)': formatMYR(sa.financingValue),
    'Active Hot Leads': sa.activeLeads,
    'Top Model Specialization': sa.topModel,
    'Date & Time Last Login': formatLastLoginDateTime(sa.lastActive, sa.staffId),
    'Filter Scope': `${scope} • ${filterLabel}`
  });

  const getDealerHeaderColor = (brand: string) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('mitsubishi')) return 'B45309'; // Warm Amber/Red
    if (b.includes('perodua')) return '047857'; // Deep Emerald Green
    if (b.includes('proton') || b.includes('e.mas')) return '1E3A8A'; // Deep Cobalt Blue
    return '92400E'; // Default Warm Amber Gold
  };

  // Group advisors by Dealership Network
  const dealershipMap = new Map<string, SalesAdvisor[]>();
  advisors.forEach(sa => {
    const dName = sa.dealershipName || 'General Dealership';
    if (!dealershipMap.has(dName)) {
      dealershipMap.set(dName, []);
    }
    dealershipMap.get(dName)!.push(sa);
  });

  const usedSheetNames = new Set<string>();
  const getUniqueSheetName = (name: string): string => {
    let clean = sanitizeSheetName(name);
    let counter = 2;
    while (usedSheetNames.has(clean)) {
      const suffix = ` (${counter})`;
      clean = (sanitizeSheetName(name).slice(0, 31 - suffix.length) + suffix).trim();
      counter++;
    }
    usedSheetNames.add(clean);
    return clean;
  };

  if (dealershipMap.size > 1) {
    // 1. Create a dedicated sheet for each individual dealership network
    dealershipMap.forEach((dealerAdvisors, dealershipNetwork) => {
      const rows = dealerAdvisors.map((sa, idx) => mapAdvisorToRow(sa, idx, dealershipNetwork));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = fitColumns(rows);
      const sheetBrand = dealerAdvisors[0]?.brand || '';
      applyHeaderStyles(ws, getDealerHeaderColor(sheetBrand));
      const sheetName = getUniqueSheetName(dealershipNetwork);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // 2. Append a consolidated "All Dealerships" sheet for total network overview
    const allRows = advisors.map((sa, idx) => mapAdvisorToRow(sa, idx, dealerName));
    const wsAll = XLSX.utils.json_to_sheet(allRows);
    wsAll['!cols'] = fitColumns(allRows);
    applyHeaderStyles(wsAll, '92400E'); // Warm Amber Gold
    const consolidatedSheetName = getUniqueSheetName('All Dealerships');
    XLSX.utils.book_append_sheet(wb, wsAll, consolidatedSheetName);
  } else {
    // Single dealership filtered
    const singleDealerName = advisors[0]?.dealershipName || dealerName;
    const rows = advisors.map((sa, idx) => mapAdvisorToRow(sa, idx, singleDealerName));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = fitColumns(rows);
    const sheetBrand = advisors[0]?.brand || '';
    applyHeaderStyles(ws, getDealerHeaderColor(sheetBrand));
    const sheetName = getUniqueSheetName(singleDealerName);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const filename = `Ingress_Sales_Advisor_Coverage_${dealerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}

/** Export single Sales Advisor details to Excel (.xlsx) */
export function exportSingleSalesAdvisorFeature(
  sa: SalesAdvisor,
  filterLabel?: string
) {
  const wb = XLSX.utils.book_new();

  const getDealerHeaderColor = (brand: string) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('mitsubishi')) return 'B45309'; // Warm Amber/Red
    if (b.includes('perodua')) return '047857'; // Deep Emerald Green
    if (b.includes('proton') || b.includes('e.mas')) return '1E3A8A'; // Deep Cobalt Blue
    return '92400E'; // Default Warm Amber Gold
  };

  const row = [{
    'No.': 1,
    'Staff ID': sa.staffId,
    'Sales Advisor Name': sa.name,
    'Designation / Role': sa.role,
    'Dealership Network': sa.dealershipName,
    'Brand': sa.brand,
    'Representative Branch': sa.branchName,
    'Dashboard Access Tier': sa.dashboardAccessLevel,
    'Portal Access Enabled': sa.accessEnabled ? 'Active (Connected)' : 'Suspended',
    'Two-Factor Auth (2FA)': sa.twoFactorAuth ? 'Verified' : 'Pending',
    'Target Bookings Quota': sa.targetBookings,
    'Actual Bookings Secured': sa.actualBookings,
    'Confirmed Registrations': sa.registrations,
    'Dropped Bookings': sa.cancellations,
    'Conversion Efficiency (%)': `${sa.conversionRate}%`,
    'Bank LOU Approved (Units)': sa.louApprovedCount,
    'Financing Value Arranged (RM)': formatMYR(sa.financingValue),
    'Active Hot Leads': sa.activeLeads,
    'Top Model Specialization': sa.topModel,
    'Date & Time Last Login': formatLastLoginDateTime(sa.lastActive, sa.staffId),
    'Record Export Scope': `${sa.dealershipName} • Single Advisor Profile ${filterLabel ? `(${filterLabel})` : ''}`
  }];

  const ws = XLSX.utils.json_to_sheet(row);
  ws['!cols'] = fitColumns(row);
  applyHeaderStyles(ws, getDealerHeaderColor(sa.brand));

  const sheetName = sanitizeSheetName(`${sa.staffId} - ${sa.name}`);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanName = sa.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Ingress_Sales_Advisor_${sa.staffId}_${cleanName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { cellStyles: true });
}


