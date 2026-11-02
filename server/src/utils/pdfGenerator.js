const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_MARGIN = 50;

const STATUS_COLORS = {
  completed: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  'in-progress': { bg: '#DBEAFE', text: '#1E40AF' },
  overdue: { bg: '#FEE2E2', text: '#991B1B' },
  waived: { bg: '#F3F4F6', text: '#6B7280' }
};

const ACCENT = '#1F2937';
const BLUE = '#2563EB';
const LIGHT_BG = '#F9FAFB';
const BORDER = '#E5E7EB';
const TEXT_DARK = '#111827';
const TEXT_MED = '#374151';
const TEXT_LIGHT = '#6B7280';
const TEXT_MUTED = '#9CA3AF';

function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE_H - BOTTOM_MARGIN) {
    doc.addPage();
    doc.y = MARGIN;
    return true;
  }
  return false;
}

function drawFooter(doc) {
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED);
  doc.text('ComplyTrack India  |  Auto-generated compliance report  |  Verify all requirements with relevant authorities',
    MARGIN, PAGE_H - 28, { width: CONTENT_W, align: 'center' });
}

exports.generatePDF = (reportData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── Header ──
      doc.rect(0, 0, PAGE_W, 70).fill(ACCENT);
      doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
        .text('COMPLYTRACK INDIA', MARGIN, 10, { width: CONTENT_W, align: 'left' });
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('COMPLIANCE REPORT', MARGIN, 26, { width: CONTENT_W, align: 'left' });
      doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
        .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN, 50, { width: CONTENT_W, align: 'left' });
      doc.rect(0, 70, PAGE_W, 2).fill(ACCENT);
      doc.y = 82;

      // ── Info box ──
      const infoH = 36;
      doc.rect(MARGIN, doc.y, CONTENT_W, infoH).fill(LIGHT_BG);
      doc.rect(MARGIN, doc.y, 3, infoH).fill(ACCENT);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(TEXT_DARK)
        .text(reportData.title || 'Compliance Report', MARGIN + 10, doc.y + 6, { width: CONTENT_W - 20 });
      doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT);
      let infoLine = `Report Type: ${reportData.type || 'General'}`;
      if (reportData.dateRange) {
        const from = new Date(reportData.dateRange.from).toLocaleDateString('en-IN');
        const to = new Date(reportData.dateRange.to).toLocaleDateString('en-IN');
        infoLine += `   |   Date Range: ${from} - ${to}`;
      }
      doc.text(infoLine, MARGIN + 10, doc.y + 22, { width: CONTENT_W - 20 });
      doc.y += infoH + 8;

      // ── Executive Summary ──
      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 22, 3).fill(BLUE);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('EXECUTIVE SUMMARY', MARGIN + 8, doc.y + 6, { width: CONTENT_W - 16 });
      doc.y += 28;

      const summary = reportData.summary || {};
      const stats = [
        { label: 'Total', value: summary.totalItems || 0, color: ACCENT },
        { label: 'Completed', value: summary.completed || 0, color: '#059669' },
        { label: 'Pending', value: summary.pending || 0, color: '#D97706' },
        { label: 'In Progress', value: summary.inProgress || 0, color: BLUE },
        { label: 'Overdue', value: summary.overdue || 0, color: '#DC2626' },
        { label: 'Score', value: `${summary.complianceScore || 0}%`, color: '#7C3AED' }
      ];

      const cardW = (CONTENT_W - 10) / stats.length;
      const cardH = 36;
      stats.forEach((stat, i) => {
        const x = MARGIN + i * (cardW + 2);
        doc.roundedRect(x, doc.y, cardW, cardH, 2).fill('#FFFFFF');
        doc.rect(x, doc.y, cardW, 2).fill(stat.color);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(stat.color)
          .text(String(stat.value), x, doc.y + 8, { width: cardW, align: 'center' });
        doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_LIGHT)
          .text(stat.label.toUpperCase(), x, doc.y + 24, { width: cardW, align: 'center' });
      });
      doc.y += cardH + 10;

      // ── Compliance Items Table ──
      const items = reportData.items || [];
      if (items.length > 0) {
        ensureSpace(doc, 60);
        doc.roundedRect(MARGIN, doc.y, CONTENT_W, 22, 3).fill(ACCENT);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF')
          .text('COMPLIANCE ITEMS', MARGIN + 8, doc.y + 6, { width: CONTENT_W - 16 });
        doc.y += 28;

        const colWidths = [24, 200, 100, 80, 80];
        const colX = [];
        let cx = MARGIN + 2;
        colWidths.forEach((w) => { colX.push(cx); cx += w; });

        function drawTableHeader(y) {
          doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2).fill('#374151');
          doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.text('#', colX[0], y + 5, { width: colWidths[0] });
          doc.text('TITLE', colX[1], y + 5, { width: colWidths[1] });
          doc.text('LAW', colX[2], y + 5, { width: colWidths[2] });
          doc.text('DUE DATE', colX[3], y + 5, { width: colWidths[3] });
          doc.text('STATUS', colX[4], y + 5, { width: colWidths[4] });
          return y + 18;
        }

        let y = drawTableHeader(doc.y);

        items.forEach((item, i) => {
          const titleText = item.title || '-';
          const titleHeight = doc.font('Helvetica').fontSize(8).heightOfString(titleText, { width: colWidths[1] - 4 });
          const rowH = Math.max(18, Math.ceil(titleHeight) + 6);

          ensureSpace(doc, rowH + 2);
          if (doc.y + rowH > PAGE_H - BOTTOM_MARGIN) {
            doc.addPage();
            doc.y = MARGIN;
            y = drawTableHeader(doc.y);
          }

          if (i % 2 === 0) {
            doc.rect(MARGIN, doc.y, CONTENT_W, rowH).fill(LIGHT_BG);
          }

          const textY = doc.y + 3;
          doc.fontSize(8).font('Helvetica').fillColor(TEXT_MED);
          doc.text(`${i + 1}`, colX[0], textY, { width: colWidths[0] });
          doc.text(titleText, colX[1], textY, { width: colWidths[1] - 4 });
          doc.text(item.law || '-', colX[2], textY, { width: colWidths[2] });
          doc.text(item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : '-', colX[3], textY, { width: colWidths[3] });

          const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
          const badgeW = 64;
          doc.roundedRect(colX[4], textY, badgeW, 12, 3).fill(statusColor.bg);
          doc.fontSize(6.5).font('Helvetica-Bold').fillColor(statusColor.text)
            .text((item.status || 'pending').toUpperCase(), colX[4], textY + 2.5, { width: badgeW, align: 'center' });

          doc.y += rowH;
        });
      }

      // ── Page numbers ──
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        drawFooter(doc);
        doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED)
          .text(`Page ${i + 1} of ${totalPages}`, MARGIN, PAGE_H - 18, { width: CONTENT_W, align: 'right' });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
