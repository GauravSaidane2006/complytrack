const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  companyId: { type: String, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  gstin: { type: String, trim: true },
  pan: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  industry: { type: String, trim: true },
  companyType: {
    type: String,
    enum: ['private_limited', 'public_limited', 'one_person', 'llp', 'sole_proprietorship', 'partnership', 'huf', 'society']
  },
  employeeCount: { type: Number, default: 0 },
  sector: {
    type: String,
    enum: ['service', 'manufacturing', 'trading'],
    required: true
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['company_registration', 'gst_certificate', 'pan_card', 'factory_license', 'pollution_consent', 'fssai_license', 'apmc_license', 'shop_establishment', 'electricity_bill', 'other']
    },
    fileUrl: String,
    fileName: String,
    originalName: String,
    uploadedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: String
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'documents_required', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedAt: Date,
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
    startDate: Date,
    endDate: Date
  },
  selectedCompliances: [{
    complianceId: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  complianceSetupComplete: { type: Boolean, default: false },
  complianceHealthScore: { type: Number, default: 0, min: 0, max: 100 },
  turnover: {
    type: String,
    enum: ['below_20L', '20L_40L', '40L_1_5Cr', '1_5Cr_5Cr', 'above_5Cr']
  },
  questionnaireCompleted: { type: Boolean, default: false },
  questionnaireAnswers: {
    turnover: String,
    employees: String,
    hasPhysicalOffice: Boolean,
    importsExports: Boolean,
    handlesPersonalData: Boolean,
    providesFinancialServices: Boolean,
    usesHazardousMaterials: Boolean,
    productionCapacity: String,
    sellsOnline: Boolean,
    handlesFoodProducts: Boolean
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
