const path = require('path');
const fs = require('fs');
const SectorPdf = require('../models/SectorPdf');
const Organization = require('../models/Organization');
const COMPLIANCE_DATA = require('../data/complianceData');
const { generateFullReferencePDF, generatePersonalizedPDF } = require('../utils/sectorPdfGenerator');

const SECTOR_PDF_DIR = path.join(__dirname, '../../sector-pdfs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

exports.listPdfs = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'developer';

    if (!isAdmin) {
      return res.json({ pdfs: [], isAdmin: false });
    }

    const filter = { isActive: true, pdfType: 'full_reference' };

    const pdfs = await SectorPdf.find(filter).sort({ sector: 1, industry: 1 });
    res.json({ pdfs, isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await SectorPdf.findById(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const filePath = path.join(SECTOR_PDF_DIR, pdf.fileName);
    if (!fs.existsSync(filePath)) {
      await generateFullReferencePDF(pdf.sector, pdf.industry, filePath);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await SectorPdf.findById(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const filePath = path.join(SECTOR_PDF_DIR, pdf.fileName);
    if (!fs.existsSync(filePath)) {
      await generateFullReferencePDF(pdf.sector, pdf.industry, filePath);
    }

    const downloadName = `Compliance_${pdf.sector}_${pdf.industry}_Reference.pdf`;
    res.download(filePath, downloadName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewPersonalizedPdf = async (req, res) => {
  try {
    const user = req.user;
    const org = await Organization.findById(user.organization);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (!org.questionnaireCompleted) {
      return res.status(400).json({ message: 'Please complete the questionnaire first' });
    }

    const fileName = `personalized_${org._id}_${org.sector}_${org.industry}.pdf`;
    const filePath = path.join(SECTOR_PDF_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      ensureDir(SECTOR_PDF_DIR);
      await generatePersonalizedPDF(
        org.sector,
        org.industry || 'all',
        org.name,
        org.questionnaireAnswers,
        filePath
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateAllPdfs = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'developer';
    if (!isAdmin) return res.status(403).json({ message: 'Admin access required' });

    ensureDir(SECTOR_PDF_DIR);
    const generated = [];

    const sectors = ['service', 'manufacturing', 'trading'];
    for (const sector of sectors) {
      const industries = Object.keys(COMPLIANCE_DATA[sector] || {});
      industries.push('all');

      for (const industry of industries) {
        const safeIndustry = industry.replace(/[/\\:]/g, '_');
        const fileName = `full_${sector}_${safeIndustry}.pdf`;
        const filePath = path.join(SECTOR_PDF_DIR, fileName);

        await generateFullReferencePDF(sector, industry, filePath);
        const stats = fs.statSync(filePath);

        await SectorPdf.findOneAndUpdate(
          { sector, industry, pdfType: 'full_reference' },
          {
            sector,
            industry,
            pdfType: 'full_reference',
            fileName,
            filePath: fileName,
            fileSize: stats.size,
            generatedAt: new Date(),
            isActive: true
          },
          { upsert: true }
        );

        generated.push({ sector, industry, fileName, size: stats.size });
      }
    }

    res.json({ message: `Generated ${generated.length} PDFs`, generated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
