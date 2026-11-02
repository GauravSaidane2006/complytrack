const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'company_registration', 'gst_certificate', 'pan_card', 'factory_license', 'pollution_consent',
      'fssai_license', 'apmc_license', 'shop_establishment', 'electricity_bill', 'other',
      'dpdp_registration', 'it_act_compliance', 'stpi_registration', 'dot_registration',
      'rbi_registration', 'sebi_registration', 'rbi_banking_license', 'irdai_registration',
      'clinical_registration', 'nabh_accreditation', 'ugc_recognition', 'fssai_central_license',
      'haccp_certification', 'peso_license', 'eia_clearance', 'arai_type_approval', 'iatf_certification',
      'drug_manufacturing_license', 'gmp_certificate', 'bis_crs_registration', 'ewaste_authorization',
      'drug_license_retail', 'gdp_certificate', 'it_intermediary_compliance', 'consumer_protection_ecom',
      'iec_code', 'customs_house_license', 'peso_dealer_license', 'hallmarking_license',
      'insecticide_license', 'fire_safety_noc', 'rera_registration', 'transport_permit'
    ],
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
