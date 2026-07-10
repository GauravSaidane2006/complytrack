const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

const STATUS_COLORS = {
  completed: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  'in-progress': { bg: '#DBEAFE', text: '#1E40AF' },
  overdue: { bg: '#FEE2E2', text: '#991B1B' },
  waived: { bg: '#F3F4F6', text: '#6B7280' }
};

exports.generatePDF = (reportData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.rect(0, 0, PAGE_W, 90).fill('#1F2937');
      doc.fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
        .text('COMPLYTRACK INDIA', MARGIN, 12, { width: CONTENT_W, align: 'left' });
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('COMPLIANCE REPORT', MARGIN, 32, { width: CONTENT_W, align: 'left' });
      doc.fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.7)')
        .text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN, 60, { width: CONTENT_W, align: 'left' });
      doc.rect(0, 90, PAGE_W, 3).fill('#1F2937');
      doc.y = 108;

      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 56).fill('#F9FAFB');
      doc.rect(MARGIN, doc.y, 3, 56).fill('#1F2937');

      let infoY = doc.y + 10;
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827')
        .text(reportData.title || 'Compliance Report', MARGIN + 12, infoY, { width: CONTENT_W - 24 });
      infoY += 20;
      doc.fontSize(9).font('Helvetica').fillColor('#6B7280');
      doc.text(`Report Type: ${reportData.type || 'General'}`, MARGIN + 12, infoY, { width: 240 });
      if (reportData.dateRange) {
        const from = new Date(reportData.dateRange.from).toLocaleDateString('en-IN');
        const to = new Date(reportData.dateRange.to).toLocaleDateString('en-IN');
        doc.text(`Date Range: ${from} - ${to}`, MARGIN + 260, infoY, { width: 230 });
      }

      doc.y = doc.y + 72;

      doc.roundedRect(MARGIN, doc.y, CONTENT_W, 24, 3).fill('#2563EB');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('EXECUTIVE SUMMARY', MARGIN + 10, doc.y + 6, { width: CONTENT_W - 20 });
      doc.y += 32;

      const summary = reportData.summary || {};
      const stats = [
        { label: 'Total Items', value: summary.totalItems || 0, color: '#374151' },
        { label: 'Completed', value: summary.completed || 0, color: '#059669' },
        { label: 'Pending', value: summary.pending || 0, color: '#D97706' },
        { label: 'In Progress', value: summary.inProgress || 0, color: '#2563EB' },
        { label: 'Overdue', value: summary.overdue || 0, color: '#DC2626' },
        { label: 'Score', value: `${summary.complianceScore || 0}%`, color: '#7C3AED' }
      ];

      const statW = CONTENT_W / stats.length;
      stats.forEach((stat, i) => {
        const x = MARGIN + i * statW;
        doc.roundedRect(x + 2, doc.y, statW - 4, 44, 3).fill('#FFFFFF');
        doc.rect(x + 2, doc.y, statW - 4, 3).fill(stat.color);
        doc.fontSize(16).font('Helvetica-Bold').fillColor(stat.color)
          .text(String(stat.value), x + 2, doc.y + 12, { width: statW - 4, align: 'center' });
        doc.fontSize(7).font('Helvetica').fillColor('#6B7280')
          .text(stat.label.toUpperCase(), x + 2, doc.y + 2, { width: statW - 4, align: 'center' });
      });

      doc.y += 56;

      const items = reportData.items || [];
      if (items.length > 0) {
        doc.roundedRect(MARGIN, doc.y, CONTENT_W, 24, 3).fill('#1F2937');
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF')
          .text('COMPLIANCE ITEMS', MARGIN + 10, doc.y + 6, { width: CONTENT_W - 20 });
        doc.y += 32;

        const colW = [28, 180, 100, 90, 90];
        const colX = [MARGIN + 4, MARGIN + 34, MARGIN + 218, MARGIN + 322, MARGIN + 416];
        const rowH = 22;

        function drawTableHeader(y) {
          doc.roundedRect(MARGIN, y, CONTENT_W, rowH, 2).fill('#374151');
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.text('#', colX[0], y + 6, { width: colW[0] });
          doc.text('TITLE', colX[1], y + 6, { width: colW[1] });
          doc.text('LAW', colX[2], y + 6, { width: colW[2] });
          doc.text('DUE DATE', colX[3], y + 6, { width: colW[3] });
          doc.text('STATUS', colX[4], y + 6, { width: colW[4] });
          return y + rowH;
        }

        let y = drawTableHeader(doc.y);

        items.forEach((item, i) => {
          if (doc.y + rowH > PAGE_H - 60) {
            doc.addPage();
            doc.y = MARGIN;
            y = drawTableHeader(doc.y);
          }

          if (i % 2 === 0) {
            doc.roundedRect(MARGIN, doc.y, CONTENT_W, rowH, 0).fill('#F9FAFB');
          }

          const textY = doc.y + 5;
          doc.fontSize(8).font('Helvetica').fillColor('#374151');
          doc.text(`${i + 1}`, colX[0], textY, { width: colW[0] });
          doc.text(item.title || '-', colX[1], textY, { width: colW[1] });
          doc.text(item.law || '-', colX[2], textY, { width: colW[2] });
          doc.text(item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : '-', colX[3], textY, { width: colW[3] });

          const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
          doc.roundedRect(colX[4] - 2, textY - 2, 72, 14, 3).fill(statusColor.bg);
          doc.fontSize(7).font('Helvetica-Bold').fillColor(statusColor.text)
            .text((item.status || 'pending').toUpperCase(), colX[4], textY + 1, { width: 68, align: 'center' });

          doc.y = doc.y + rowH;
        });
      }

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font('Helvetica').fillColor('#9CA3AF');
        doc.text(`Page ${i + 1} of ${totalPages}`, MARGIN, PAGE_H - 25, { width: CONTENT_W, align: 'center' });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
