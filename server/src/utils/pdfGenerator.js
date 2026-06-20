const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePDF = (reportData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('ComplyTrack India', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Compliance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text(reportData.title);
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica');
      doc.text(`Report Type: ${reportData.type}`);
      doc.text(`Date Range: ${new Date(reportData.dateRange.from).toLocaleDateString()} - ${new Date(reportData.dateRange.to).toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');

      const summary = reportData.summary;
      doc.text(`Total Compliance Items: ${summary.totalItems}`);
      doc.text(`Completed: ${summary.completed}`);
      doc.text(`Pending: ${summary.pending}`);
      doc.text(`In Progress: ${summary.inProgress}`);
      doc.text(`Overdue: ${summary.overdue}`);
      doc.text(`Compliance Score: ${summary.complianceScore}%`);
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('Compliance Items');
      doc.moveDown(0.5);

      const items = reportData.items || [];
      const tableTop = doc.y;
      const colWidths = [40, 200, 100, 80, 70];

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('#', 50, tableTop, { width: colWidths[0] });
      doc.text('Title', 90, tableTop, { width: colWidths[1] });
      doc.text('Law', 290, tableTop, { width: colWidths[2] });
      doc.text('Due Date', 390, tableTop, { width: colWidths[3] });
      doc.text('Status', 470, tableTop, { width: colWidths[4] });

      doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke();
      doc.fontSize(8).font('Helvetica');

      let y = tableTop + 20;
      items.forEach((item, index) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }
        doc.text(`${index + 1}`, 50, y, { width: colWidths[0] });
        doc.text(item.title || '-', 90, y, { width: colWidths[1] });
        doc.text(item.law || '-', 290, y, { width: colWidths[2] });
        doc.text(item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-', 390, y, { width: colWidths[3] });
        doc.text(item.status || '-', 470, y, { width: colWidths[4] });
        y += 18;
      });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
