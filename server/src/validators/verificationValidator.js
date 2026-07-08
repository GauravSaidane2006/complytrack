const Joi = require('joi');

const uploadDocumentSchema = Joi.object({
  documentType: Joi.string().valid(
    'company_registration', 'gst_certificate', 'pan_card',
    'factory_license', 'pollution_consent', 'fssai_license',
    'apmc_license', 'shop_establishment', 'electricity_bill', 'other'
  ).required(),
  sector: Joi.string().valid('service', 'manufacturing', 'trading').required()
});

const reviewDocumentSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().when('status', {
    is: 'rejected',
    then: Joi.string().required().min(10).max(500),
    otherwise: Joi.optional()
  })
});

const devBypassSchema = Joi.object({
  sector: Joi.string().valid('service', 'manufacturing', 'trading').required(),
  organizationName: Joi.string().required().trim().min(2).max(200)
});

module.exports = { uploadDocumentSchema, reviewDocumentSchema, devBypassSchema };
