const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'custom', 'risk-assessment'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel'],
    default: 'pdf'
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filters: {
    status: [String],
    law: [String],
    priority: [String],
    dateFrom: Date,
    dateTo: Date,
    assignedTo: [String]
  },
  summary: {
    totalItems: Number,
    completed: Number,
    pending: Number,
    overdue: Number,
    inProgress: Number,
    complianceScore: Number
  },
  fileUrl: String,
  dateRange: {
    from: Date,
    to: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
