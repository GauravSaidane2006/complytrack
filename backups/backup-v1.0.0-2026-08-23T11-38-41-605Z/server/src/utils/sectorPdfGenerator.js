const PDFDocument = require('pdfkit');
const fs = require('fs');
const COMPLIANCE_DATA = require('../data/complianceData');
const { getMandatoryComplianceIds } = require('../data/questionnaireData');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_MARGIN = 50;

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

const TEXT_DARK = '#111827';
const TEXT_MED = '#374151';
const TEXT_LIGHT = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';
const LIGHT_BG = '#F9FAFB';

function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE_H - BOTTOM_MARGIN) {
    doc.addPage();
    doc.y = MARGIN;
    return true;
  }
  return false;
}

function drawPageNumber(doc, pageNum, totalPages) {
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED);
  doc.text(`Page ${pageNum} of ${totalPages}`, MARGIN, PAGE_H - 18, { width: CONTENT_W, align: 'right' });
}

function drawHeader(doc, sector, industry, isPersonalized) {
  const colors = SECTOR_COLORS[sector] || SECTOR_COLORS.service;
  doc.rect(0, 0, PAGE_W, 80).fill(colors.primary);
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
    .text('COMPLYTRACK INDIA', MARGIN, 10, { width: CONTENT_W, align: 'left' });
  doc.fontSize(17).font('Helvetica-Bold').fillColor('#FFFFFF')
    .text(isPersonalized ? 'PERSONALIZED COMPLIANCE GUIDE' : 'COMPLIANCE REFERENCE DOCUMENT', MARGIN, 26, { width: CONTENT_W, align: 'left' });
  const industryLabel = industry === 'all' ? 'All Industries' : industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.85)')
    .text(`${SECTOR_LABELS[sector] || sector} — ${industryLabel}`, MARGIN, 50, { width: CONTENT_W, align: 'left' });
  doc.rect(0, 80, PAGE_W, 2).fill(colors.dark);
  doc.y = 90;
}

function drawInfoBox(doc, items) {
  const lineH = 14;
  const boxH = items.length * lineH + 12;
  ensureSpace(doc, boxH + 6);
  doc.rect(MARGIN, doc.y, CONTENT_W, boxH).fill(LIGHT_BG);
  doc.rect(MARGIN, doc.y, 3, boxH).fill(BORDER);
  let y = doc.y + 8;
  items.forEach(({ label, value }) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_MED).text(`${label}: `, MARGIN + 10, y, { continued: true, width: 100 });
    doc.font('Helvetica').fillColor(TEXT_LIGHT).text(value, { width: CONTENT_W - 120 });
    y += lineH;
  });
  doc.y += boxH + 6;
}

function drawSectionHeader(doc, title, color) {
  ensureSpace(doc, 36);
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_W, 24, 3).fill(color);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF')
    .text(title, MARGIN + 10, y + 7, { width: CONTENT_W - 20 });
  doc.y = y + 30;
}

function drawComplianceCard(doc, item, index, showBadge, applicability) {
  const neededHeight = 48;
  if (doc.y + neededHeight > PAGE_H - BOTTOM_MARGIN) {
    doc.addPage();
    doc.y = MARGIN;
  }

  const cardY = doc.y;
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;

  doc.roundedRect(MARGIN, cardY, CONTENT_W, 1, 0).fill(BORDER);
  const startY = cardY + 6;

  let titleX = MARGIN + 6;
  const titleMaxW = showBadge ? CONTENT_W - 120 : CONTENT_W - 12;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_DARK)
    .text(`${index}. ${item.title}`, titleX, startY, { width: titleMaxW });

  if (showBadge && applicability) {
    const badgeConfig = {
      mandatory: { bg: '#DC2626', label: 'MANDATORY' },
      recommended: { bg: '#F59E0B', label: 'RECOMMENDED' },
      not_applicable: { bg: '#9CA3AF', label: 'N/A' }
    };
    const badge = badgeConfig[applicability] || badgeConfig.recommended;
    const badgeX = MARGIN + CONTENT_W - 100;
    doc.roundedRect(badgeX, startY - 1, 92, 14, 3).fill(badge.bg);
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text(badge.label, badgeX + 2, startY + 2.5, { width: 88, align: 'center' });
  }

  let metaY = Math.max(doc.y + 2, startY + 14);

  const metaParts = [];
  metaParts.push(item.law);
  metaParts.push(item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : '');
  metaParts.push(item.frequency.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  metaParts.push((item.priority || 'medium').toUpperCase());

  doc.fontSize(7.5).font('Helvetica').fillColor(TEXT_MUTED)
    .text(metaParts.filter(Boolean).join('  •  '), MARGIN + 6, metaY, { width: CONTENT_W - 12 });

  let descY = doc.y + 1;
  if (item.description) {
    doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT)
      .text(item.description, MARGIN + 6, descY, { width: CONTENT_W - 12, lineGap: 0.5, height: 18, ellipsis: true });
    descY = doc.y + 1;
  }

  if (item.penalties && item.penalties.length > 0) {
    const penaltyY = descY;
    doc.roundedRect(MARGIN + 6, penaltyY, CONTENT_W - 12, 12, 2).fill('#FEF2F2');
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#DC2626')
      .text('PENALTIES:', MARGIN + 10, penaltyY + 2.5, { width: 52 });

    const penaltyTexts = item.penalties.map((p) => {
      let txt = p.description || '';
      if (p.fine) txt += ` | Fine: ${p.fine}`;
      if (p.imprisonment && p.imprisonment !== 'None') txt += ` | Jail: ${p.imprisonment}`;
      return txt;
    }).join('; ');

    doc.fontSize(7).font('Helvetica').fillColor('#991B1B')
      .text(penaltyTexts, MARGIN + 62, penaltyY + 2.5, { width: CONTENT_W - 74, height: 10, ellipsis: true });

    doc.y = penaltyY + 14;
  }

  doc.y = doc.y + 4;
}

function drawPenaltyTable(doc, items) {
  drawSectionHeader(doc, 'PENALTY SUMMARY', '#DC2626');

  const colWidths = [24, 160, 180, 120];
  const colX = [];
  let cx = MARGIN + 2;
  colWidths.forEach((w) => { colX.push(cx); cx += w; });
  const rowH = 16;

  function drawTableHeader(y) {
    doc.rect(MARGIN, y, CONTENT_W, rowH).fill('#1F2937');
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('#', colX[0], y + 4, { width: colWidths[0] });
    doc.text('COMPLIANCE ITEM', colX[1], y + 4, { width: colWidths[1] });
    doc.text('PENALTY', colX[2], y + 4, { width: colWidths[2] });
    doc.text('FINE', colX[3], y + 4, { width: colWidths[3] });
    return y + rowH;
  }

  let y = drawTableHeader(doc.y);
  const itemsWithPenalties = items.filter((i) => i.penalties && i.penalties.length > 0);

  itemsWithPenalties.forEach((item, idx) => {
    const itemNum = items.indexOf(item) + 1;

    item.penalties.forEach((p, pi) => {
      ensureSpace(doc, rowH + 2);
      if (doc.y + rowH > PAGE_H - BOTTOM_MARGIN) {
        doc.addPage();
        doc.y = MARGIN;
        y = drawTableHeader(doc.y);
      }

      if (idx % 2 === 0) {
        doc.rect(MARGIN, doc.y, CONTENT_W, rowH).fill(LIGHT_BG);
      }

      const textY = doc.y + 3;
      doc.fontSize(7.5).font('Helvetica').fillColor(TEXT_MED);

      if (pi === 0) {
        doc.text(`${itemNum}`, colX[0], textY, { width: colWidths[0] });
        doc.text(item.title, colX[1], textY, { width: colWidths[1] });
      }

      doc.text(p.description || '-', colX[2], textY, { width: colWidths[2] });
      doc.fillColor('#DC2626').text(p.fine || '-', colX[3], textY, { width: colWidths[3] });

      doc.y = Math.max(doc.y + 2, textY + 10);
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

  const colW = [80, 190, 215];
  const colX = [];
  let cx = MARGIN + 6;
  colW.forEach((w) => { colX.push(cx); cx += w; });

  doc.rect(MARGIN, doc.y, CONTENT_W, 16).fill('#065F46');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
  doc.text('FREQUENCY', colX[0], doc.y + 4, { width: colW[0] });
  doc.text('DUE DATE', colX[1], doc.y + 4, { width: colW[1] });
  doc.text('EXAMPLES', colX[2], doc.y + 4, { width: colW[2] });
  doc.y += 16;

  freqs.forEach((f, i) => {
    const rowY = doc.y;
    if (i % 2 === 0) doc.rect(MARGIN, rowY, CONTENT_W, 16).fill('#ECFDF5');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#065F46')
      .text(f.freq, colX[0], rowY + 3, { width: colW[0] });
    doc.font('Helvetica').fillColor(TEXT_MED)
      .text(f.desc, colX[1], rowY + 3, { width: colW[1] });
    doc.fillColor(TEXT_LIGHT)
      .text(f.example, colX[2], rowY + 3, { width: colW[2] });
    doc.y = rowY + 16;
  });
}

function drawFooter(doc) {
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED);
  doc.text('ComplyTrack India  |  Auto-generated reference document  |  Verify all requirements with relevant authorities',
    MARGIN, PAGE_H - 28, { width: CONTENT_W, align: 'center' });
}

exports.generateFullReferencePDF = (sector, industry, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      drawHeader(doc, sector, industry, false);

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
        drawFooter(doc);
        drawPageNumber(doc, i + 1, totalPages);
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

      drawHeader(doc, sector, industry, true);

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
        doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT)
          .text('No mandatory items based on your questionnaire responses.', MARGIN + 6, doc.y, { width: CONTENT_W - 12 });
        doc.y += 6;
      } else {
        mandatoryItems.forEach((item, i) => {
          drawComplianceCard(doc, item, i + 1, true, 'mandatory');
        });
      }

      drawSectionHeader(doc, `RECOMMENDED COMPLIANCE ITEMS (${recommendedItems.length})`, '#F59E0B');
      if (recommendedItems.length === 0) {
        doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT)
          .text('No recommended items based on your questionnaire responses.', MARGIN + 6, doc.y, { width: CONTENT_W - 12 });
        doc.y += 6;
      } else {
        recommendedItems.forEach((item, i) => {
          drawComplianceCard(doc, item, i + 1, true, 'recommended');
        });
      }

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        drawFooter(doc);
        drawPageNumber(doc, i + 1, totalPages);
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
