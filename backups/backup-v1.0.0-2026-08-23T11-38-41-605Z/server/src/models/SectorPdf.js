const mongoose = require('mongoose');

const sectorPdfSchema = new mongoose.Schema({
  sector: {
    type: String,
    enum: ['service', 'manufacturing', 'trading', 'all'],
    required: true
  },
  industry: {
    type: String,
    trim: true,
    default: 'all'
  },
  pdfType: {
    type: String,
    enum: ['full_reference', 'personalized'],
    required: true
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  generatedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

sectorPdfSchema.index({ sector: 1, industry: 1, pdfType: 1 });

module.exports = mongoose.model('SectorPdf', sectorPdfSchema);
