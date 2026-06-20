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
  notes: String,
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRecurring: { type: Boolean, default: false },
  parentCompliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' }
}, { timestamps: true });

complianceSchema.index({ organization: 1, status: 1 });
complianceSchema.index({ organization: 1, dueDate: 1 });
complianceSchema.index({ organization: 1, law: 1 });

module.exports = mongoose.model('Compliance', complianceSchema);
