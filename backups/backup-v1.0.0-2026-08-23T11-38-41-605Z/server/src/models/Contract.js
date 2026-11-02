const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true, trim: true },
  contractNumber: { type: String, trim: true },
  party: { type: String, required: true, trim: true },
  partyContact: {
    name: String,
    email: String,
    phone: String
  },
  type: {
    type: String,
    enum: ['vendor', 'client', 'employee', 'lease', 'service', 'partnership', 'other'],
    required: true
  },
  description: String,
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  startDate: { type: Date, required: true },
  endDate: Date,
  renewalDate: Date,
  noticePeriod: Number,
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'renewed', 'terminated'],
    default: 'draft'
  },
  documents: [{
    name: String,
    url: String,
    version: { type: Number, default: 1 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  clauses: [{
    title: String,
    content: String
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
