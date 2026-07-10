const PDFDocument = require('pdfkit');
const fs = require('fs');
const COMPLIANCE_DATA = require('../data/complianceData');
const { getMandatoryComplianceIds } = require('../data/questionnaireData');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_X = MARGIN;

const SECTOR_LABELS = {
  service: 'Service Sector',
  manufacturing: 'Manufacturing Sector',
  trading: 'Trading Sector'
};

const SECTOR_COLORS = {
  service: { primary: '#2563EB', light: '#EFF6FF', dark: '#1E40AF' },
  manufacturing: { primary: '#DC2626', light: '#FEF2F2', dark: '#991B1B' },
  trading: { primary: '#059669', light: '#ECFDF5', dark: '#065F46' }
};

const PRIORITY_COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#78716C'
};

const CATEGORY_COLORS = {
  registration: { bg: '#DBEAFE', text: '#1E40AF' },
  filing: { bg: '#FEF3C7', text: '#92400E' },
  licence: { bg: '#EDE9FE', text: '#5B21B6' },
  payment: { bg: '#FCE7F3', text: '#9D174D' },
  audit: { bg: '#D1FAE5', text: '#065F46' },
  other: { bg: '#F3F4F6', text: '#374151' }
};

function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE_H - 60) {
    doc.addPage();
    doc.y = MARGIN;
    return true;
  }
  return false;
}

function drawPageNumber(doc, pageNum) {
  doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
  doc.text(`Page ${pageNum}`, CONTENT_X, PAGE_H - 35, { width: CONTENT_W, align: 'center' });
}

function drawHeader(doc, sector, industry, color, isPersonalized) {
  const colors = SECTOR_COLORS[sector] || SECTOR_COLORS.service;

  doc.rect(0, 0, PAGE_W, 100).fill(colors.primary);

  doc.fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
    .text('COMPLYTRACK INDIA', MARGIN, 15, { width: CONTENT_W, align: 'left' });

  doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF')
    .text(isPersonalized ? 'PERSONALIZED COMPLIANCE GUIDE' : 'COMPLIANCE REFERENCE DOCUMENT', MARGIN, 32, { width: CONTENT_W, align: 'left' });

  const industryLabel = industry === 'all' ? 'All Industries' : industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const subtitle = `${SECTOR_LABELS[sector] || sector} - ${industryLabel}`;
  doc.fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.9)')
    .text(subtitle, MARGIN, 62, { width: CONTENT_W, align: 'left' });

  doc.rect(0, 100, PAGE_W, 3).fill(colors.dark);
  doc.y = 115;
}

function drawInfoBox(doc, items) {
  const boxY = doc.y;
  const boxH = items.length * 16 + 16;

  ensureSpace(doc, boxH + 10);

  doc.rect(MARGIN, doc.y, CONTENT_W, boxH).fill('#F9FAFB');
  doc.rect(MARGIN, doc.y, 3, boxH).fill('#D1D5DB');

  let y = doc.y + 10;
  items.forEach(({ label, value }) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text(`${label}: `, MARGIN + 12, y, { continued: true, width: 120 });
    doc.font('Helvetica').fillColor('#6B7280').text(value, { width: CONTENT_W - 140 });
    y += 16;
  });

  doc.y = boxY + boxH + 8;
}

function drawSectionHeader(doc, title, color, number) {
  ensureSpace(doc, 50);

  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 4).fill(color);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF')
    .text(title, MARGIN + 12, y + 8, { width: CONTENT_W - 24 });

  doc.y = y + 38;
}

function drawComplianceCard(doc, item, index, showBadge, applicability) {
  const neededHeight = 80;
  if (doc.y + neededHeight > PAGE_H - 60) {
    doc.addPage();
    doc.y = MARGIN;
  }

  const cardY = doc.y;
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const priorityColor = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium;

  doc.roundedRect(MARGIN, cardY, CONTENT_W, 1, 0).fill('#E5E7EB');
  const startY = cardY + 8;

  let titleX = MARGIN + 8;
  const titleMaxW = showBadge ? CONTENT_W - 130 : CONTENT_W - 16;

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827')
    .text(`${index}. ${item.title}`, titleX, startY, { width: titleMaxW });

  if (showBadge && applicability) {
    const badgeConfig = {
      mandatory: { bg: '#DC2626', label: 'MANDATORY' },
      recommended: { bg: '#F59E0B', label: 'RECOMMENDED' },
      not_applicable: { bg: '#9CA3AF', label: 'N/A' }
    };
    const badge = badgeConfig[applicability] || badgeConfig.recommended;
    const badgeX = MARGIN + CONTENT_W - 108;
    doc.roundedRect(badgeX, startY - 1, 100, 16, 3).fill(badge.bg);
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text(badge.label, badgeX + 2, startY + 3, { width: 96, align: 'center' });
  }

  let metaY = doc.y + 3;
  if (metaY < startY + 18) metaY = startY + 18;

  const metaParts = [];
  metaParts.push(item.law);
  metaParts.push(CATEGORY_COLORS[item.category] ? (CATEGORY_COLORS[item.category].text === '#065F46' ? 'Audit' : item.category.charAt(0).toUpperCase() + item.category.slice(1)) : item.category);
  metaParts.push(item.frequency.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  metaParts.push((item.priority || 'medium').toUpperCase());

  doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
    .text(metaParts.join('  •  '), MARGIN + 8, metaY, { width: CONTENT_W - 16 });

  let descY = doc.y + 2;
  if (item.description) {
    doc.fontSize(8.5).font('Helvetica').fillColor('#4B5563')
      .text(item.description, MARGIN + 8, descY, { width: CONTENT_W - 16, lineGap: 1 });
    descY = doc.y + 2;
  }

  if (item.penalties && item.penalties.length > 0) {
    const penaltyY = descY;
    doc.roundedRect(MARGIN + 8, penaltyY, CONTENT_W - 16, 14, 2).fill('#FEF2F2');
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#DC2626')
      .text('PENALTIES:', MARGIN + 14, penaltyY + 3, { width: 60 });

    const penaltyTexts = item.penalties.map((p) => {
      let txt = p.description || '';
      if (p.fine) txt += ` | Fine: ${p.fine}`;
      if (p.imprisonment && p.imprisonment !== 'None') txt += ` | Jail: ${p.imprisonment}`;
      return txt;
    }).join('; ');

    doc.fontSize(7.5).font('Helvetica').fillColor('#991B1B')
      .text(penaltyTexts, MARGIN + 72, penaltyY + 3, { width: CONTENT_W - 88 });

    doc.y = penaltyY + 18;
  }

  doc.y = doc.y + 6;
}

function drawPenaltyTable(doc, items) {
  drawSectionHeader(doc, 'PENALTY SUMMARY', '#DC2626');

  const colWidths = [30, 150, 170, 145];
  const colX = [MARGIN + 4, MARGIN + 38, MARGIN + 192, MARGIN + 366];
  const rowH = 20;

  function drawTableHeader(y) {
    doc.rect(MARGIN, y, CONTENT_W, rowH).fill('#1F2937');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('#', colX[0], y + 5, { width: colWidths[0] });
    doc.text('COMPLIANCE ITEM', colX[1], y + 5, { width: colWidths[1] });
    doc.text('PENALTY', colX[2], y + 5, { width: colWidths[2] });
    doc.text('FINE', colX[3], y + 5, { width: colWidths[3] });
    return y + rowH;
  }

  let y = drawTableHeader(doc.y);

  const itemsWithPenalties = items.filter((i) => i.penalties && i.penalties.length > 0);

  itemsWithPenalties.forEach((item, idx) => {
    const itemNum = items.indexOf(item) + 1;

    item.penalties.forEach((p, pi) => {
      ensureSpace(doc, rowH + 4);

      if (doc.y + rowH > PAGE_H - 60) {
        doc.addPage();
        doc.y = MARGIN;
        y = drawTableHeader(doc.y);
      }

      if (idx % 2 === 0) {
        doc.rect(MARGIN, doc.y, CONTENT_W, rowH).fill('#F9FAFB');
      }

      const textY = doc.y + 4;
      doc.fontSize(8).font('Helvetica').fillColor('#374151');

      if (pi === 0) {
        doc.text(`${itemNum}`, colX[0], textY, { width: colWidths[0] });
        doc.text(item.title, colX[1], textY, { width: colWidths[1] });
      }

      doc.text(p.description || '-', colX[2], textY, { width: colWidths[2] });
      doc.fillColor('#DC2626').text(p.fine || '-', colX[3], textY, { width: colWidths[3] });

      doc.y = doc.y + 2;
      doc.y = Math.max(doc.y, textY + 12);
    });
  });
}

function drawDueDateGuide(doc) {
  drawSectionHeader(doc, 'DUE DATE CALENDAR GUIDE', '#059669');

  const freqs = [
    { freq: 'Monthly', desc: 'By 15th of every month', example: 'GSTR-3B, PF Payment, ESI Payment' },
    { freq: 'Quarterly', desc: 'By 15th of month following quarter end', example: 'GSTR-1 (QRMP), PF Return' },
    { freq: 'Half-Yearly', desc: 'Within 6 months of period end', example: 'POSH Annual Report' },
    { freq: 'Yearly', desc: 'Within 3 months of FY end (by June 30)', example: 'IT Return, Annual Return, Audit' },
    { freq: 'One-Time', desc: 'Within 1 year of applicability', example: 'GST Registration, PF Registration' },
    { freq: 'Event-Based', desc: 'As per event timeline', example: 'GST Revocation, Change in Details' }
  ];

  const colW = [90, 180, 225];
  const colX = [MARGIN + 8, MARGIN + 102, MARGIN + 288];

  doc.rect(MARGIN, doc.y, CONTENT_W, 18).fill('#065F46');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
  doc.text('FREQUENCY', colX[0], doc.y - 12, { width: colW[0] });
  doc.text('DUE DATE', colX[1], doc.y - 12, { width: colW[1] });
  doc.text('EXAMPLES', colX[2], doc.y - 12, { width: colW[2] });
  doc.y += 6;

  freqs.forEach((f, i) => {
    const rowY = doc.y;
    if (i % 2 === 0) doc.rect(MARGIN, rowY, CONTENT_W, 22).fill('#ECFDF5');

    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#065F46')
      .text(f.freq, colX[0], rowY + 5, { width: colW[0] });
    doc.font('Helvetica').fillColor('#374151')
      .text(f.desc, colX[1], rowY + 5, { width: colW[1] });
    doc.fillColor('#6B7280')
      .text(f.example, colX[2], rowY + 5, { width: colW[2] });

    doc.y = rowY + 22;
  });
}

function drawFooter(doc, totalPages) {
  const footerY = PAGE_H - 30;
  doc.fontSize(7).font('Helvetica').fillColor('#9CA3AF');
  doc.text(
    'This document is auto-generated by ComplyTrack India. Verify all compliance requirements with relevant authorities.',
    MARGIN, footerY, { width: CONTENT_W, align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    MARGIN, footerY + 10, { width: CONTENT_W, align: 'center' }
  );
}

exports.generateFullReferencePDF = (sector, industry, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      drawHeader(doc, sector, industry, null, false);

      const sectorLabel = SECTOR_LABELS[sector] || sector;
      const industryLabel = industry === 'all' ? 'All Industries' : industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      drawInfoBox(doc, [
        { label: 'Sector', value: sectorLabel },
        { label: 'Industry', value: industryLabel },
        { label: 'Generated', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
        { label: 'Type', value: 'Full Reference Document' }
      ]);

      const allItems = [];
      const commonItems = COMPLIANCE_DATA.common || [];
      const sectorItems = (COMPLIANCE_DATA.commonIndustries && COMPLIANCE_DATA.commonIndustries[sector]) || [];
      const industryItems = (COMPLIANCE_DATA[sector] && COMPLIANCE_DATA[sector][industry]) || [];

      drawSectionHeader(doc, 'SECTION 1 — COMMON COMPLIANCE (ALL SECTORS & INDUSTRIES)', '#374151');
      commonItems.forEach((item) => {
        drawComplianceCard(doc, item, allItems.length + 1, false, null);
        allItems.push(item);
      });

      if (sectorItems.length > 0) {
        const colors = SECTOR_COLORS[sector] || SECTOR_COLORS.service;
        drawSectionHeader(doc, `SECTION 2 — ${sectorLabel.toUpperCase()} SECTOR COMPLIANCE`, colors.primary);
        sectorItems.forEach((item) => {
          drawComplianceCard(doc, item, allItems.length + 1, false, null);
          allItems.push(item);
        });
      }

      if (industryItems.length > 0) {
        drawSectionHeader(doc, `SECTION 3 — ${industryLabel.toUpperCase()} INDUSTRY COMPLIANCE`, '#7C3AED');
        industryItems.forEach((item) => {
          drawComplianceCard(doc, item, allItems.length + 1, false, null);
          allItems.push(item);
        });
      }

      drawPenaltyTable(doc, allItems);
      drawDueDateGuide(doc);

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        drawFooter(doc, totalPages);
        drawPageNumber(doc, i + 1);
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

exports.generatePersonalizedPDF = (sector, industry, companyName, answers, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      drawHeader(doc, sector, industry, null, true);

      const sectorLabel = SECTOR_LABELS[sector] || sector;
      const industryLabel = industry === 'all' ? 'All Industries' : industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const profileItems = [
        { label: 'Company', value: companyName },
        { label: 'Sector', value: sectorLabel },
        { label: 'Industry', value: industryLabel },
        { label: 'Generated', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
      ];

      if (answers) {
        const answerLabels = {
          turnover: 'Annual Turnover',
          employees: 'Employee Count',
          hasPhysicalOffice: 'Physical Office',
          importsExports: 'Import/Export',
          handlesPersonalData: 'Data Processing',
          providesFinancialServices: 'Financial Services',
          usesHazardousMaterials: 'Hazardous Materials',
          productionCapacity: 'Production Scale',
          sellsOnline: 'Online Sales',
          handlesFoodProducts: 'Food Products'
        };
        Object.entries(answerLabels).forEach(([key, label]) => {
          const val = answers[key];
          if (val !== undefined && val !== '' && val !== null) {
            const display = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            profileItems.push({ label, value: display });
          }
        });
      }

      drawInfoBox(doc, profileItems);

      const { mandatory, recommended } = getMandatoryComplianceIds(sector, answers || {});
      const mandatorySet = new Set(mandatory);
      const recommendedSet = new Set(recommended);

      const commonItems = COMPLIANCE_DATA.common || [];
      const sectorItems = (COMPLIANCE_DATA.commonIndustries && COMPLIANCE_DATA.commonIndustries[sector]) || [];
      const industryItems = (COMPLIANCE_DATA[sector] && COMPLIANCE_DATA[sector][industry]) || [];
      const allItems = [...commonItems, ...sectorItems, ...industryItems];

      const mandatoryItems = allItems.filter((item) => mandatorySet.has(item.id));
      const recommendedItems = allItems.filter((item) => recommendedSet.has(item.id) && !mandatorySet.has(item.id));

      drawSectionHeader(doc, `MANDATORY COMPLIANCE ITEMS (${mandatoryItems.length})`, '#DC2626');
      if (mandatoryItems.length === 0) {
        doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
          .text('No mandatory items based on your questionnaire responses.', MARGIN + 8, doc.y, { width: CONTENT_W - 16 });
        doc.y += 8;
      } else {
        mandatoryItems.forEach((item, i) => {
          drawComplianceCard(doc, item, i + 1, true, 'mandatory');
        });
      }

      drawSectionHeader(doc, `RECOMMENDED COMPLIANCE ITEMS (${recommendedItems.length})`, '#F59E0B');
      if (recommendedItems.length === 0) {
        doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
          .text('No recommended items based on your questionnaire responses.', MARGIN + 8, doc.y, { width: CONTENT_W - 16 });
        doc.y += 8;
      } else {
        recommendedItems.forEach((item, i) => {
          drawComplianceCard(doc, item, i + 1, true, 'recommended');
        });
      }

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        drawFooter(doc, totalPages);
        drawPageNumber(doc, i + 1);
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
