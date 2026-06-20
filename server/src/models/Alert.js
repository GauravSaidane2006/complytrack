const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['deadline', 'regulation-change', 'show-cause', 'risk', 'general', 'reminder'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  complianceItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  sentVia: [{ type: String, enum: ['email', 'sms', 'in-app'] }],
  scheduledFor: Date,
  sentAt: Date,
  expiresAt: Date
}, { timestamps: true });

alertSchema.index({ organization: 1, user: 1, isRead: 1 });
alertSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Alert', alertSchema);
