const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().lowercase().trim().pattern(/@/).message('Invalid email'),
  password: Joi.string().required().min(6).max(128),
  organizationName: Joi.string().trim().max(200),
  phone: Joi.string().trim().allow(''),
  industry: Joi.string().trim().allow(''),
  employeeCount: Joi.alternatives().try(Joi.number().integer().min(1), Joi.valid('', null))
});

const loginSchema = Joi.object({
  email: Joi.string().required().lowercase().trim().pattern(/@/).message('Invalid email'),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6).max(128)
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
