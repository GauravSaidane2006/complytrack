const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true, trim: true },
  law: {
    type: String,
    required: true,
    enum: [
      'GST Act', 'Companies Act', 'RBI Act', 'Income Tax Act',
      'Labour Laws', 'Factory Act', 'ESI Act', 'PF Act',
      'Professional Tax', 'Shop & Establishment Act', 'MSME Act',
      'Environment Act', 'Custom Act', 'Other'
    ]
  },
  regulation: { type: String, trim: true },
  category: {
    type: String,
    enum: ['filing', 'registration', 'licence', 'audit', 'payment', 'other'],
    required: true
  },
  description: { type: String, trim: true },
  frequency: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'event-based'],
    default: 'one-time'
  },
  dueDate: { type: Date, required: true },
  applicableFrom: Date,
  applicableTo: Date,
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue', 'waived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  documents: [{
    name: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  penalties: [{
    description: String,
    fine: String,
    imprisonment: String
  }],
  notes: String,
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRecurring: { type: Boolean, default: false },
  parentCompliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' }
}, { timestamps: true });

complianceSchema.index({ organization: 1, status: 1 });
complianceSchema.index({ organization: 1, dueDate: 1 });
complianceSchema.index({ organization: 1, law: 1 });

complianceSchema.pre('save', function (next) {
  if (this.isNew) return next();
  this._changes = [];
  const trackedFields = ['status', 'priority', 'dueDate', 'title', 'law', 'category'];
  for (const field of trackedFields) {
    if (this.isModified(field)) {
      const oldValue = this.$__?.savedState?.[field] ?? this._original?.[field] ?? '(unknown)';
      this._changes.push({
        field: field.charAt(0).toUpperCase() + field.slice(1),
        oldValue: String(oldValue),
        newValue: String(this[field] || '(empty)')
      });
    }
  }
  next();
});

complianceSchema.post('save', async function (doc) {
  try {
    const changes = doc._changes || [];
    if (changes.length === 0 && !doc.isNew) return;

    const Notice = mongoose.model('Notice');
    const { generateComplianceChangeNotice } = require('../services/noticeService');

    const changeType = doc.isNew ? 'Created' : (changes.some(c => c.field === 'Status') ? 'Status Updated' : 'Updated');

    await generateComplianceChangeNotice(doc, changeType, changes);
  } catch (error) {
    console.error('Error generating compliance change notice:', error.message);
  }
});

module.exports = mongoose.model('Compliance', complianceSchema);
