const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  complianceItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance', required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  impact: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  likelihood: { type: String, enum: ['low', 'medium', 'high'], required: true },
  financialImpact: { type: String, trim: true },
  legalConsequence: { type: String, trim: true },
  mitigation: { type: String, trim: true },
  mitigationDeadline: Date,
  status: {
    type: String,
    enum: ['identified', 'mitigated', 'accepted', 'monitoring'],
    default: 'identified'
  },
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessedAt: { type: Date, default: Date.now },
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
