const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_MARGIN = 50;

const TYPE_COLORS = {
  'compliance-change': { primary: '#2563EB', light: '#DBEAFE' },
  'system-update': { primary: '#7C3AED', light: '#EDE9FE' },
  'regulatory-change': { primary: '#DC2626', light: '#FEE2E2' },
  'deadline': { primary: '#EA580C', light: '#FFF7ED' },
  'general': { primary: '#059669', light: '#ECFDF5' },
  'summary': { primary: '#0891B2', light: '#CFFAFE' }
};

const TYPE_LABELS = {
  'compliance-change': 'COMPLIANCE STATUS CHANGE',
  'system-update': 'SYSTEM UPDATE',
  'regulatory-change': 'REGULATORY CHANGE',
  'deadline': 'DEADLINE NOTICE',
  'general': 'GENERAL NOTICE',
  'summary': 'DAILY SUMMARY'
};

const PRIORITY_COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#78716C'
};

const TEXT_DARK = '#111827';
const TEXT_MED = '#374151';
const TEXT_LIGHT = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';
const LIGHT_BG = '#F9FAFB';

exports.generateNoticePDF = (notice, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const colors = TYPE_COLORS[notice.type] || TYPE_COLORS.general;
      const priorityColor = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.medium;

      // ── Header ──
      doc.rect(0, 0, PAGE_W, 70).fill(colors.primary);
      doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.55)')
        .text('COMPLYTRACK INDIA', MARGIN, 10, { width: CONTENT_W, align: 'left' });
      doc.fontSize(17).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('OFFICIAL NOTICE', MARGIN, 26, { width: CONTENT_W, align: 'left' });
      doc.rect(0, 70, PAGE_W, 2).fill(colors.primary);

      doc.y = 82;

      // ── Type + Priority badges ──
      const badgeY = doc.y;
      doc.roundedRect(MARGIN, badgeY, 160, 16, 3).fill(colors.primary);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text(TYPE_LABELS[notice.type] || 'NOTICE', MARGIN + 6, badgeY + 4, { width: 148, align: 'center' });

      doc.roundedRect(MARGIN + 168, badgeY, 80, 16, 3).fill(priorityColor);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text((notice.priority || 'medium').toUpperCase(), MARGIN + 172, badgeY + 4, { width: 72, align: 'center' });

      doc.y = badgeY + 22;

      // ── Info box ──
      const infoH = 38;
      doc.rect(MARGIN, doc.y, CONTENT_W, infoH).fill(LIGHT_BG);
      doc.rect(MARGIN, doc.y, 3, infoH).fill(colors.primary);

      let infoY = doc.y + 6;
      doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text(`Notice No: ${notice._id}`, MARGIN + 10, infoY, { width: 240 });
      doc.text(`Date: ${new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN + 260, infoY, { width: 220 });
      infoY += 13;
      doc.text(`Time: ${new Date(notice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, MARGIN + 10, infoY, { width: 240 });
      doc.text(`Type: ${TYPE_LABELS[notice.type] || notice.type}`, MARGIN + 260, infoY, { width: 220 });

      doc.y += infoH + 8;

      // ── Title ──
      doc.fontSize(14).font('Helvetica-Bold').fillColor(TEXT_DARK)
        .text(notice.title || 'Notice', MARGIN, doc.y, { width: CONTENT_W });
      doc.y += 4;

      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke(BORDER);
      doc.y += 8;

      // ── Details ──
      doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_MED)
        .text('DETAILS', MARGIN, doc.y, { width: CONTENT_W });
      doc.y += 4;

      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT)
        .text(notice.message || '', MARGIN + 6, doc.y, { width: CONTENT_W - 12, lineGap: 1.5 });

      // ── Changes ──
      if (notice.changes && notice.changes.length > 0) {
        doc.y += 10;
        doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke(BORDER);
        doc.y += 8;

        doc.roundedRect(MARGIN, doc.y, CONTENT_W, 20, 3).fill('#FEF3C7');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#92400E')
          .text('CHANGES DETECTED', MARGIN + 8, doc.y + 5, { width: CONTENT_W - 16 });
        doc.y += 26;

        notice.changes.forEach((change) => {
          if (doc.y + 36 > PAGE_H - BOTTOM_MARGIN) {
            doc.addPage();
            doc.y = MARGIN;
          }

          doc.roundedRect(MARGIN, doc.y, CONTENT_W, 36, 3).fill(LIGHT_BG);
          doc.rect(MARGIN, doc.y, 3, 36).fill(BORDER);

          doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_MED)
            .text(`Field: ${change.field}`, MARGIN + 10, doc.y + 5, { width: CONTENT_W - 20 });

          doc.fontSize(8).font('Helvetica').fillColor('#DC2626')
            .text(`From: ${change.oldValue || '(empty)'}`, MARGIN + 10, doc.y + 2, { width: CONTENT_W - 20 });

          doc.fillColor('#059669')
            .text(`To: ${change.newValue || '(empty)'}`, MARGIN + 10, doc.y + 2, { width: CONTENT_W - 20 });

          doc.y += 40;
        });
      }

      // ── Footer ──
      doc.y += 10;
      if (doc.y + 30 > PAGE_H - BOTTOM_MARGIN) {
        doc.addPage();
        doc.y = MARGIN;
      }

      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke(BORDER);
      doc.y += 8;

      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 28, 3).fill('#F3F4F6');
      doc.fontSize(7.5).font('Helvetica').fillColor(TEXT_LIGHT)
        .text(
          `This is an auto-generated notice from ComplyTrack India. Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
          MARGIN + 8, doc.y + 8, { width: CONTENT_W - 16, align: 'center' }
        );

      // ── Page numbers ──
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED);
        doc.text(`Page ${i + 1} of ${totalPages}`, MARGIN, PAGE_H - 18, { width: CONTENT_W, align: 'right' });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
