const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  documentType: {
    type: String,
    enum: ['company_registration', 'gst_certificate', 'pan_card', 'factory_license', 'pollution_consent', 'fssai_license', 'apmc_license', 'shop_establishment', 'electricity_bill', 'other'],
    required: true
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  helpText: String,
  sector: {
    type: String,
    enum: ['service', 'manufacturing', 'trading'],
    required: true
  }
}, { timestamps: true });

verificationSchema.index({ organization: 1, documentType: 1 });
verificationSchema.index({ status: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
