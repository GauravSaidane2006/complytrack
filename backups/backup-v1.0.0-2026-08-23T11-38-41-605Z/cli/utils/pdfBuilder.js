const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PdfBuilder {
  constructor(options = {}) {
    this.options = {
      margin: 50,
      size: 'A4',
      info: {
        Title: options.title || 'Indian Compliance Laws Guide',
        Author: 'ComplyTrack India',
        Subject: 'Compliance Regulations Reference',
        Creator: 'ComplyTrack Scraper',
      },
      ...options,
    };
    this.doc = null;
    this.toc = [];
    this.currentY = 0;
    this.pageHeight = 842; // A4 height
    this.pageWidth = 595; // A4 width
    this.margin = this.options.margin;
    this.contentWidth = this.pageWidth - (2 * this.margin);
  }

  createDocument() {
    this.doc = new PDFDocument(this.options);
    return this;
  }

  async generate(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        this.createDocument();
        const stream = fs.createWriteStream(outputPath);
        this.doc.pipe(stream);

        this.generateCoverPage(data);
        this.generateTableOfContents(data);

        for (const sector of data.sectors) {
          this.generateSectorSection(sector);
        }

        this.generateAppendix(data);

        this.doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  generateCoverPage(data) {
    const doc = this.doc;

    // Background color
    doc.rect(0, 0, this.pageWidth, this.pageHeight)
       .fill('#1a365d');

    // White box in center
    doc.roundedRect(60, 150, this.pageWidth - 120, 400, 10)
       .fill('#ffffff');

    // Title
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text('ComplyTrack India', 60, 200, {
         align: 'center',
         width: this.contentWidth,
       });

    doc.moveDown(0.5);

    doc.fontSize(22)
       .font('Helvetica')
       .fillColor('#2d3748')
       .text('Indian Compliance Laws Guide', 60, 260, {
         align: 'center',
         width: this.contentWidth,
       });

    doc.moveDown(2);

    // Divider line
    doc.moveTo(100, 320)
       .lineTo(this.pageWidth - 100, 320)
       .lineWidth(2)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.moveDown(2);

    // Info
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#4a5568')
       .text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 60, 360, {
         align: 'center',
         width: this.contentWidth,
       });

    doc.moveDown(0.5);

    const sectorNames = data.sectors.map(s => s.sectorName).join(', ');
    doc.text(`Sectors Covered: ${data.sectors.length}`, 60, 390, {
      align: 'center',
      width: this.contentWidth,
    });

    doc.moveDown(0.5);

    const totalRegulations = data.sectors.reduce((sum, s) => sum + (s.regulations?.length || 0), 0);
    doc.text(`Total Regulations: ${totalRegulations}`, 60, 415, {
      align: 'center',
      width: this.contentWidth,
    });

    doc.moveDown(3);

    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#718096')
       .text('Disclaimer: This document is for informational purposes only.\nAlways refer to official government sources for legal compliance.', 60, 470, {
         align: 'center',
         width: this.contentWidth,
       });

    // Footer
    doc.fontSize(8)
       .fillColor('#a0aec0')
       .text('ComplyTrack India - Compliance Management Platform', 60, this.pageHeight - 80, {
         align: 'center',
         width: this.contentWidth,
       });
  }

  generateTableOfContents(data) {
    this.doc.addPage();
    const doc = this.doc;

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text('Table of Contents', this.margin, this.margin);

    doc.moveDown(0.5);

    doc.moveTo(this.margin, doc.y)
       .lineTo(this.pageWidth - this.margin, doc.y)
       .lineWidth(1)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.moveDown(1);

    let y = doc.y;
    let pageNum = 3;

    data.sectors.forEach((sector, index) => {
      if (y > this.pageHeight - 100) {
        this.doc.addPage();
        y = this.margin;
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#2d3748')
         .text(`${index + 1}. ${sector.sectorName}`, this.margin, y);

      const regCount = sector.regulations?.length || 0;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#718096')
         .text(`   ${regCount} regulations`, this.margin + 20, y + 18);

      y += 45;
    });

    this.currentY = y;
  }

  generateSectorSection(sector) {
    this.doc.addPage();
    const doc = this.doc;

    // Sector header
    doc.rect(0, 0, this.pageWidth, 80)
       .fill('#1a365d');

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(sector.sectorName, this.margin, 25, {
         width: this.contentWidth,
       });

    doc.moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#e2e8f0')
       .text(`Source: ${sector.sourceUrl || 'Multiple sources'}`, this.margin, 55, {
         width: this.contentWidth,
       });

    doc.y = 100;

    // Regulations
    if (sector.regulations && sector.regulations.length > 0) {
      sector.regulations.forEach((regulation, index) => {
        this.generateRegulationEntry(regulation, index + 1);
      });
    } else {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#718096')
         .text('No regulations data available for this sector.', this.margin, doc.y);
    }
  }

  generateRegulationEntry(regulation, number) {
    const doc = this.doc;

    if (doc.y > this.pageHeight - 200) {
      this.doc.addPage();
      doc.y = this.margin;
    }

    // Regulation number badge
    doc.roundedRect(this.margin, doc.y, 25, 25, 4)
       .fill('#3182ce');

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(number.toString(), this.margin + 7, doc.y + 5, {
         width: 11,
       });

    // Regulation title
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text(regulation.title || 'Untitled Regulation', this.margin + 35, doc.y - 20, {
         width: this.contentWidth - 35,
       });

    doc.moveDown(0.3);

    // Section
    if (regulation.section) {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#4a5568')
         .text(`Section: ${regulation.section}`, this.margin + 35, doc.y);
      doc.moveDown(0.3);
    }

    // Summary
    if (regulation.summary) {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#2d3748')
         .text(regulation.summary, this.margin + 35, doc.y, {
           width: this.contentWidth - 35,
           lineGap: 3,
         });
      doc.moveDown(0.5);
    }

    // Key Requirements
    if (regulation.requirements && regulation.requirements.length > 0) {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#1a365d')
         .text('Key Requirements:', this.margin + 35, doc.y);
      doc.moveDown(0.3);

      regulation.requirements.forEach(req => {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#2d3748')
           .text(`  • ${req}`, this.margin + 45, doc.y, {
             width: this.contentWidth - 45,
             lineGap: 2,
           });
        doc.moveDown(0.2);
      });
      doc.moveDown(0.3);
    }

    // Penalties
    if (regulation.penalties) {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#c53030')
         .text('Penalties for Non-Compliance:', this.margin + 35, doc.y);
      doc.moveDown(0.2);

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#742a2a')
         .text(regulation.penalties, this.margin + 35, doc.y, {
           width: this.contentWidth - 35,
           lineGap: 2,
         });
      doc.moveDown(0.3);
    }

    // Source URL
    if (regulation.sourceUrl) {
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor('#3182ce')
         .text(`Source: ${regulation.sourceUrl}`, this.margin + 35, doc.y, {
           width: this.contentWidth - 35,
         });
      doc.moveDown(0.3);
    }

    // Divider
    doc.moveTo(this.margin + 35, doc.y)
       .lineTo(this.pageWidth - this.margin, doc.y)
       .lineWidth(0.5)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.moveDown(0.8);
  }

  generateAppendix(data) {
    this.doc.addPage();
    const doc = this.doc;

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text('Appendix', this.margin, this.margin);

    doc.moveDown(0.5);

    doc.moveTo(this.margin, doc.y)
       .lineTo(this.pageWidth - this.margin, doc.y)
       .lineWidth(1)
       .strokeColor('#e2e8f0')
       .stroke();

    doc.moveDown(1);

    // Official Sources
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3748')
       .text('Official Government Sources', this.margin, doc.y);
    doc.moveDown(0.5);

    const sources = [
      { name: 'Reserve Bank of India (RBI)', url: 'https://www.rbi.org.in' },
      { name: 'Securities and Exchange Board of India (SEBI)', url: 'https://www.sebi.gov.in' },
      { name: 'Ministry of Corporate Affairs (MCA)', url: 'https://www.mca.gov.in' },
      { name: 'Income Tax Department', url: 'https://www.incometax.gov.in' },
      { name: 'GST Council', url: 'https://www.gstcouncil.gov.in' },
      { name: 'Central Board of Direct Taxes (CBDT)', url: 'https://www.cbdt.gov.in' },
      { name: 'Ministry of Labour & Employment', url: 'https://labour.gov.in' },
      { name: 'Employees Provident Fund Organisation (EPFO)', url: 'https://www.epfindia.gov.in' },
      { name: 'Employees State Insurance Corporation (ESIC)', url: 'https://www.esic.nic.in' },
      { name: 'Ministry of Environment, Forest & Climate Change', url: 'https://moef.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
      { name: 'Food Safety and Standards Authority of India (FSSAI)', url: 'https://www.fssai.gov.in' },
      { name: 'Central Drugs Standard Control Organisation (CDSCO)', url: 'https://cdsco.gov.in' },
      { name: 'National Medical Commission (NMC)', url: 'https://www.nmc.org.in' },
      { name: 'Telecom Regulatory Authority of India (TRAI)', url: 'https://www.trai.gov.in' },
      { name: 'Indian Computer Emergency Response Team (CERT-In)', url: 'https://www.cert-in.org.in' },
    ];

    sources.forEach(source => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#2d3748')
         .text(`• ${source.name}`, this.margin, doc.y);

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#3182ce')
         .text(`  ${source.url}`, this.margin + 15, doc.y, {
           width: this.contentWidth - 15,
         });

      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // Important Notes
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3748')
       .text('Important Notes', this.margin, doc.y);
    doc.moveDown(0.5);

    const notes = [
      'This document is generated for informational purposes only.',
      'Always refer to official government websites for the latest regulations.',
      'Laws and regulations are subject to amendments and updates.',
      'Consult legal professionals for specific compliance advice.',
      'Some regulations may have state-specific variations.',
    ];

    notes.forEach(note => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4a5568')
         .text(`• ${note}`, this.margin, doc.y, {
           width: this.contentWidth,
         });
      doc.moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);

    doc.fontSize(8)
       .font('Helvetica-Oblique')
       .fillColor('#a0aec0')
       .text(`Generated by ComplyTrack India on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, this.margin, doc.y, {
         align: 'center',
         width: this.contentWidth,
       });
  }
}

module.exports = PdfBuilder;
