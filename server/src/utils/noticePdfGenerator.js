const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

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

exports.generateNoticePDF = (notice, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const colors = TYPE_COLORS[notice.type] || TYPE_COLORS.general;
      const priorityColor = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.medium;

      doc.rect(0, 0, PAGE_W, 90).fill(colors.primary);
      doc.fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
        .text('COMPLYTRACK INDIA', MARGIN, 12, { width: CONTENT_W, align: 'left' });
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('OFFICIAL NOTICE', MARGIN, 30, { width: CONTENT_W, align: 'left' });
      doc.rect(0, 90, PAGE_W, 3).fill(colors.primary);

      doc.y = 108;

      doc.roundedRect(MARGIN, doc.y, 180, 20, 3).fill(colors.primary);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text(TYPE_LABELS[notice.type] || 'NOTICE', MARGIN + 8, doc.y + 5, { width: 164, align: 'center' });

      doc.roundedRect(MARGIN + 190, doc.y - 5, 90, 20, 3).fill(priorityColor);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text((notice.priority || 'medium').toUpperCase(), MARGIN + 195, doc.y, { width: 80, align: 'center' });

      doc.y += 25;

      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 52).fill('#F9FAFB');
      doc.rect(MARGIN, doc.y, 3, 52).fill(colors.primary);

      let infoY = doc.y + 8;
      doc.fontSize(8.5).font('Helvetica').fillColor('#6B7280');
      doc.text(`Notice No: ${notice._id}`, MARGIN + 12, infoY, { width: 240 });
      doc.text(`Date: ${new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN + 260, infoY, { width: 230 });
      infoY += 14;
      doc.text(`Time: ${new Date(notice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, MARGIN + 12, infoY, { width: 240 });
      doc.text(`Type: ${TYPE_LABELS[notice.type] || notice.type}`, MARGIN + 260, infoY, { width: 230 });

      doc.y = doc.y + 62;

      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke('#E5E7EB');
      doc.y += 12;

      doc.fontSize(16).font('Helvetica-Bold').fillColor('#111827')
        .text(notice.title || 'Notice', MARGIN, doc.y, { width: CONTENT_W });
      doc.y += 6;

      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke('#E5E7EB');
      doc.y += 12;

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151')
        .text('DETAILS', MARGIN, doc.y, { width: CONTENT_W });
      doc.y += 4;

      doc.fontSize(9.5).font('Helvetica').fillColor('#4B5563')
        .text(notice.message || '', MARGIN + 8, doc.y, { width: CONTENT_W - 16, lineGap: 2 });

      if (notice.changes && notice.changes.length > 0) {
        doc.y += 12;
        doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke('#E5E7EB');
        doc.y += 12;

        doc.roundedRect(MARGIN, doc.y, CONTENT_W, 24, 3).fill('#FEF3C7');
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400E')
          .text('CHANGES DETECTED', MARGIN + 10, doc.y + 6, { width: CONTENT_W - 20 });
        doc.y += 32;

        notice.changes.forEach((change, i) => {
          if (doc.y + 60 > PAGE_H - 60) {
            doc.addPage();
            doc.y = MARGIN;
          }

          doc.roundedRect(MARGIN, doc.y, CONTENT_W, 50, 3).fill('#F9FAFB');
          doc.rect(MARGIN, doc.y, 3, 50).fill('#E5E7EB');

          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#374151')
            .text(`Field: ${change.field}`, MARGIN + 10, doc.y + 8, { width: CONTENT_W - 20 });

          doc.fontSize(8.5).font('Helvetica').fillColor('#DC2626')
            .text(`From: ${change.oldValue || '(empty)'}`, MARGIN + 10, doc.y + 2, { width: CONTENT_W - 20, continued: false });

          doc.fillColor('#059669')
            .text(`To: ${change.newValue || '(empty)'}`, MARGIN + 10, doc.y + 2, { width: CONTENT_W - 20 });

          doc.y += 56;
        });
      }

      doc.y += 16;
      if (doc.y + 60 > PAGE_H - 60) {
        doc.addPage();
        doc.y = MARGIN;
      }

      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y).stroke('#E5E7EB');
      doc.y += 12;

      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 36, 3).fill('#F3F4F6');
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280')
        .text('This is an auto-generated notice from ComplyTrack India.', MARGIN + 10, doc.y + 8, { width: CONTENT_W - 20, align: 'center' });
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        MARGIN + 10, doc.y + 2, { width: CONTENT_W - 20, align: 'center' }
      );

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font('Helvetica').fillColor('#9CA3AF')
          .text(`Page ${i + 1} of ${totalPages}`, MARGIN, PAGE_H - 25, { width: CONTENT_W, align: 'center' });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
