const fs = require('fs');
const path = require('path');
const COMPLIANCE_DATA = require('../data/complianceData');
const { generateFullReferencePDF } = require('../utils/sectorPdfGenerator');

const SECTOR_PDF_DIR = path.join(__dirname, '../../sector-pdfs');

async function generateAllPdfsOnStartup() {
  try {
    if (!fs.existsSync(SECTOR_PDF_DIR)) {
      fs.mkdirSync(SECTOR_PDF_DIR, { recursive: true });
    }

    const existingPdfs = fs.readdirSync(SECTOR_PDF_DIR).filter((f) => f.startsWith('full_'));
    if (existingPdfs.length > 0) {
      return;
    }

    const sectors = ['service', 'manufacturing', 'trading'];
    let generated = 0;

    for (const sector of sectors) {
      const industries = Object.keys(COMPLIANCE_DATA[sector] || {});
      industries.push('all');

      for (const industry of industries) {
        const safeIndustry = industry.replace(/[/\\:]/g, '_');
        const fileName = `full_${sector}_${safeIndustry}.pdf`;
        const filePath = path.join(SECTOR_PDF_DIR, fileName);

        if (!fs.existsSync(filePath)) {
          await generateFullReferencePDF(sector, industry, filePath);
          generated++;
        }
      }
    }

    if (generated > 0) {
      console.log(`Generated ${generated} sector PDFs on startup`);
    }
  } catch (error) {
    console.error('Error generating sector PDFs on startup:', error.message);
  }
}

module.exports = { generateAllPdfsOnStartup };
