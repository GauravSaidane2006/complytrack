const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['compliance-change', 'system-update', 'regulatory-change', 'deadline', 'general'],
    required: true
  },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  relatedCompliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' },
  changes: [{
    field: String,
    oldValue: String,
    newValue: String
  }],
  pdfUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  sentBy: { type: String, default: 'system' }
}, { timestamps: true });

noticeSchema.index({ organization: 1, createdAt: -1 });
noticeSchema.index({ organization: 1, isRead: 1 });
noticeSchema.index({ organization: 1, type: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
