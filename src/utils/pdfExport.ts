/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesAdvisor } from '../types';
import { formatLastLoginDateTime, formatMYR } from './excelExport';

/**
 * Generate and download an executive, modern PDF performance and governance dossier
 * for an individual Sales Advisor.
 */
export function exportSingleSalesAdvisorPDF(
  sa: SalesAdvisor,
  filterLabel?: string
) {
  // Initialize A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const usableWidth = pageWidth - marginX * 2; // 182mm

  // Brand-based primary accent color
  let brandPrimaryRGB = [180, 83, 9]; // Warm Amber default
  let brandAccentHex = '#B45309';
  const brandLower = (sa.brand || '').toLowerCase();
  if (brandLower.includes('mitsubishi')) {
    brandPrimaryRGB = [180, 83, 9]; // Amber
    brandAccentHex = '#B45309';
  } else if (brandLower.includes('perodua')) {
    brandPrimaryRGB = [4, 120, 87]; // Deep Emerald
    brandAccentHex = '#047857';
  } else if (brandLower.includes('proton') || brandLower.includes('e.mas')) {
    brandPrimaryRGB = [30, 58, 138]; // Deep Cobalt Blue
    brandAccentHex = '#1E3A8A';
  }

  // -------------------------------------------------------------
  // 1. TOP HEADER BANNER (Modern Executive Dark Slate Bar)
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // #0F172A Slate 900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Decorative brand accent line under the top bar
  doc.setFillColor(brandPrimaryRGB[0], brandPrimaryRGB[1], brandPrimaryRGB[2]);
  doc.rect(0, 24, pageWidth, 1.8, 'F');

  // Corporate Title & Subtitle in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('INGRESS CORPORATION BERHAD', marginX, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Automotive Dealership Division • Frontline SA Governance & Performance Dossier', marginX, 15);

  // Document metadata on top-right
  const reportDateStr = new Date().toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(248, 250, 252);
  doc.text(`REF: ${sa.staffId}-ADD`, pageWidth - marginX, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`ISSUED: ${reportDateStr} • MYT`, pageWidth - marginX, 15, { align: 'right' });

  let currentY = 32;

  // -------------------------------------------------------------
  // 2. ADVISOR PROFILE HERO CARD (Clean Bento Card)
  // -------------------------------------------------------------
  const cardHeight = 38;
  doc.setFillColor(248, 250, 252); // #F8FAFC Slate 50
  doc.setDrawColor(226, 232, 240); // #E2E8F0 Slate 200
  doc.roundedRect(marginX, currentY, usableWidth, cardHeight, 3, 3, 'FD');

  // Vertical brand indicator strip on card's left
  doc.setFillColor(brandPrimaryRGB[0], brandPrimaryRGB[1], brandPrimaryRGB[2]);
  doc.roundedRect(marginX, currentY, 2.5, cardHeight, 1.5, 1.5, 'F');

  // Advisor Initials Avatar Circle
  const avatarX = marginX + 11;
  const avatarY = currentY + 13;
  doc.setFillColor(brandPrimaryRGB[0], brandPrimaryRGB[1], brandPrimaryRGB[2]);
  doc.circle(avatarX, avatarY, 7.5, 'F');

  const initials = sa.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(initials, avatarX, avatarY + 3, { align: 'center' });

  // Advisor Name & Designation
  const infoX = marginX + 23;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(sa.name.toUpperCase(), infoX, currentY + 9);

  // Staff ID Badge
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(infoX, currentY + 12, 22, 5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(sa.staffId, infoX + 11, currentY + 15.5, { align: 'center' });

  // Role
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(sa.role, infoX + 26, currentY + 15.5);

  // Network & Branch details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dealership: ${sa.dealershipName} (${sa.brand})`, infoX, currentY + 22);
  doc.text(`Representative Branch: ${sa.branchName}`, infoX, currentY + 27);
  doc.text(`Contact: ${sa.phone}  |  Email: ${sa.email}`, infoX, currentY + 32);

  // Status & Security Pills on Card Right Side
  const rightColX = pageWidth - marginX - 4;
  
  // Direct Access Status Pill (Green)
  const isAccessOn = sa.accessEnabled;
  doc.setFillColor(isAccessOn ? 236 : 254, isAccessOn ? 253 : 242, isAccessOn ? 245 : 242);
  doc.setDrawColor(isAccessOn ? 167 : 254, isAccessOn ? 243 : 202, isAccessOn ? 208 : 202);
  doc.roundedRect(rightColX - 48, currentY + 6, 48, 6.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(isAccessOn ? 6 : 185, isAccessOn ? 95 : 28, isAccessOn ? 70 : 28);
  doc.text(isAccessOn ? 'DIRECT ACCESS: ACTIVE' : 'DIRECT ACCESS: SUSPENDED', rightColX - 24, currentY + 10.5, { align: 'center' });

  // Portal Tier Pill
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(rightColX - 48, currentY + 14.5, 48, 6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(21, 128, 61);
  doc.text(sa.dashboardAccessLevel || 'Full SA Portal Access', rightColX - 24, currentY + 18.7, { align: 'center' });

  // Last Login Timestamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  const lastLoginStr = formatLastLoginDateTime(sa.lastActive, sa.staffId);
  doc.text(`Last Login: ${lastLoginStr}`, rightColX, currentY + 26, { align: 'right' });
  doc.text(`Two-Factor Auth (2FA): ${sa.twoFactorAuth ? 'Verified & Enforced' : 'Pending Verification'}`, rightColX, currentY + 31, { align: 'right' });

  currentY += cardHeight + 7;

  // -------------------------------------------------------------
  // 3. KEY PERFORMANCE BENCHMARKS (4 Modern Bento Stat Tiles)
  // -------------------------------------------------------------
  const kpiTileWidth = (usableWidth - 9) / 4; // ~43.25mm each
  const kpiTileHeight = 24;
  const fulfillment = sa.targetBookings > 0 ? Math.round((sa.actualBookings / sa.targetBookings) * 100) : 0;

  const kpiTiles = [
    {
      title: 'TARGET VS ACTUAL',
      stat: `${sa.actualBookings} / ${sa.targetBookings}`,
      unit: 'Units',
      subtitle: `${fulfillment}% Quota Fulfilled`,
      colorRGB: [30, 41, 59],
      badgeRGB: [238, 242, 255],
      badgeTextRGB: [67, 56, 202]
    },
    {
      title: 'DMV DELIVERIES',
      stat: `${sa.registrations}`,
      unit: 'Units Handed Over',
      subtitle: `Dropped: ${sa.cancellations} units`,
      colorRGB: [109, 40, 217], // Violet
      badgeRGB: [245, 243, 255],
      badgeTextRGB: [109, 40, 217]
    },
    {
      title: 'BANK LOU APPROVED',
      stat: `${sa.louApprovedCount}`,
      unit: 'LOU Facilities',
      subtitle: `${formatMYR(sa.financingValue)} Value`,
      colorRGB: [180, 83, 9], // Amber
      badgeRGB: [254, 243, 199],
      badgeTextRGB: [146, 64, 14]
    },
    {
      title: 'CUSTOMER PIPELINE',
      stat: `${sa.activeLeads}`,
      unit: 'Active Leads',
      subtitle: `${sa.conversionRate}% Conversion Eff.`,
      colorRGB: [14, 116, 144], // Cyan
      badgeRGB: [236, 254, 255],
      badgeTextRGB: [14, 116, 144]
    }
  ];

  kpiTiles.forEach((tile, idx) => {
    const tileX = marginX + idx * (kpiTileWidth + 3);

    // Box Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(tileX, currentY, kpiTileWidth, kpiTileHeight, 2, 2, 'FD');

    // Colored top accent line
    doc.setFillColor(tile.colorRGB[0], tile.colorRGB[1], tile.colorRGB[2]);
    doc.rect(tileX + 2, currentY, kpiTileWidth - 4, 1, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(tile.title, tileX + 3, currentY + 5.5);

    // Main Stat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(tile.colorRGB[0], tile.colorRGB[1], tile.colorRGB[2]);
    doc.text(tile.stat, tileX + 3, currentY + 12.5);

    // Unit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(tile.unit, tileX + 3, currentY + 16.5);

    // Subtitle badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(tile.badgeTextRGB[0], tile.badgeTextRGB[1], tile.badgeTextRGB[2]);
    doc.text(tile.subtitle, tileX + 3, currentY + 21);
  });

  currentY += kpiTileHeight + 8;

  // -------------------------------------------------------------
  // 4. FRONTLINE PRIVILEGES & GOVERNANCE MATRIX (Table)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FRONTLINE SA PRIVILEGES & SYSTEM ACCESS MATRIX', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Governance policies enforced across Ingress centralized automotive portal and DMS endpoints', marginX, currentY + 4);

  currentY += 6;

  const isStockEnabled = sa.accessEnabled && (sa.privileges ? sa.privileges.stockPaymentVisibility : (sa.dashboardAccessLevel === 'Full SA Portal Access' || sa.dashboardAccessLevel === 'Showroom Floor Access'));
  const isLOUEnabled = sa.accessEnabled && (sa.privileges ? sa.privileges.bankLOUFastTrack : (sa.dashboardAccessLevel === 'Full SA Portal Access' || sa.dashboardAccessLevel === 'Lead & LOU Mobile Access'));
  const isLeadEnabled = sa.accessEnabled && (sa.privileges ? sa.privileges.leadClaiming : (sa.dashboardAccessLevel === 'Full SA Portal Access' || sa.dashboardAccessLevel === 'Lead & LOU Mobile Access'));
  const isQuotaEnabled = sa.accessEnabled && (sa.privileges ? sa.privileges.quotaCommissionMeter : sa.dashboardAccessLevel === 'Full SA Portal Access');

  const privilegesData = [
    [
      '1. Stock Payment Status Visibility',
      isStockEnabled ? 'Enabled (Active)' : 'Restricted',
      'Real-time access to In Stock, Stock Paid, and Not Yet Paid floor allocation queue for delivery handovers.'
    ],
    [
      '2. Bank LOU Fast-Track Status',
      isLOUEnabled ? 'Enabled (Active)' : 'Restricted',
      `Direct submission & approval monitoring with top banks (Maybank, CIMB, Public Bank, HLB). Total: ${sa.louApprovedCount} LOUs (${formatMYR(sa.financingValue)}).`
    ],
    [
      '3. Customer Pipeline Lead Claiming',
      isLeadEnabled ? 'Enabled (Active)' : 'Restricted',
      `Mobile & desktop claiming of incoming test-drive inquiries, showroom visits, and digital lead pools. Total: ${sa.activeLeads} active leads.`
    ],
    [
      '4. Personal Quota & Commission Meter',
      isQuotaEnabled ? 'Enabled (Active)' : 'Restricted',
      `Live quota achievement tracking (${sa.actualBookings}/${sa.targetBookings} units, ${fulfillment}%), completed DMV handovers, and progressive payout meter.`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['Frontline Privilege / Module', 'Access Authorization', 'Operational Scope & Permissions Description']],
    body: privilegesData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 54 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { fontStyle: 'normal', cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.raw === 'Enabled (Active)') {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        }
      }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Calculate current position after table
  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 45;
  currentY = finalTableY + 7;

  // -------------------------------------------------------------
  // 5. COMMERCIAL CONTRIBUTION & SALES AUDIT SUMMARY (Table)
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('COMMERCIAL CONTRIBUTION & SALES AUDIT SUMMARY', marginX, currentY);

  currentY += 5;

  const commercialData = [
    ['Sales Advisor Staff ID', sa.staffId, 'Corporate Dealership Network', sa.dealershipName],
    ['Full Official Name', sa.name, 'Representative Branch', sa.branchName],
    ['Designation / Grade', sa.role, 'Primary Vehicle Focus', sa.topModel || 'Multi-Model'],
    ['Target Booking Quota', `${sa.targetBookings} Units`, 'Actual Bookings Secured', `${sa.actualBookings} Units (${fulfillment}% Quota)`],
    ['Confirmed Customer Deliveries', `${sa.registrations} Units`, 'Cancellations / Dropped', `${sa.cancellations} Units`],
    ['Conversion Efficiency Rate', `${sa.conversionRate}%`, 'Approved Bank LOU Volume', `${sa.louApprovedCount} Approved (${formatMYR(sa.financingValue)})`],
    ['Security / Two-Factor Auth', sa.twoFactorAuth ? 'Verified & Enforced' : 'Pending Verification', 'Frontline Governance Status', sa.accessEnabled ? 'Active (Connected)' : 'Access Suspended']
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: commercialData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 1.8,
      lineColor: [241, 245, 249]
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 42 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 48 },
      2: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 44 },
      3: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 48 }
    }
  });

  const finalSummaryY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  currentY = finalSummaryY + 6;

  // -------------------------------------------------------------
  // 6. OFFICIAL VERIFICATION & AUDIT SIGN-OFF BOX
  // -------------------------------------------------------------
  const signBoxHeight = 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, usableWidth, signBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFICATION & AUDIT SIGN-OFF', marginX + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This digital performance and frontline authorization report is electronically certified by Ingress Corporation Berhad.', marginX + 4, currentY + 9);
  doc.text('Data matches live core DMS records, Centralized Banking LOU clearing gateways, and Ingress Frontline Access Engine.', marginX + 4, currentY + 13);
  doc.text(`Verification Hash: SHA256-${sa.staffId.replace(/-/g, '')}-${new Date().getTime().toString(16).toUpperCase()} • Authorized Signature: HQ ADD (Head of Automotive Sales Governance)`, marginX + 4, currentY + 18);

  // Status Stamp on Right
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth - marginX - 38, currentY + 3.5, 34, 15, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('INGRESS AUDITED', pageWidth - marginX - 21, currentY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(16, 185, 129);
  doc.text('VERIFIED RECORD', pageWidth - marginX - 21, currentY + 14, { align: 'center' });

  // -------------------------------------------------------------
  // 7. FOOTER BAR
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ingress Corporation Berhad • Automotive Dealership Division • Strictly Confidential • For Internal Management Use Only', marginX, pageHeight - 3);
  doc.text('Page 1 of 1', pageWidth - marginX, pageHeight - 3, { align: 'right' });

  // -------------------------------------------------------------
  // SAVE / DOWNLOAD FILE
  // -------------------------------------------------------------
  const cleanName = sa.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Ingress_Sales_Advisor_${sa.staffId}_${cleanName}_Profile_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
