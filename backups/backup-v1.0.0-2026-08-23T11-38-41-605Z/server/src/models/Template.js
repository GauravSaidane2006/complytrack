const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
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
  defaultPriority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  applicableIndustries: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
