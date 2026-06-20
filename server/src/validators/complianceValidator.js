const Joi = require('joi');

const createComplianceSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  law: Joi.string().required().valid(
    'GST Act', 'Companies Act', 'RBI Act', 'Income Tax Act',
    'Labour Laws', 'Factory Act', 'ESI Act', 'PF Act',
    'Professional Tax', 'Shop & Establishment Act', 'MSME Act',
    'Environment Act', 'Custom Act', 'Other'
  ),
  regulation: Joi.string().trim().max(200),
  category: Joi.string().required().valid('filing', 'registration', 'licence', 'audit', 'payment', 'other'),
  description: Joi.string().trim().max(1000),
  frequency: Joi.string().valid('one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'event-based'),
  dueDate: Joi.date().required(),
  applicableFrom: Joi.date(),
  applicableTo: Joi.date(),
  assignedTo: Joi.array().items(Joi.string()),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  isRecurring: Joi.boolean(),
  templateId: Joi.string()
});

const updateComplianceSchema = Joi.object({
  title: Joi.string().trim().max(200),
  law: Joi.string().valid(
    'GST Act', 'Companies Act', 'RBI Act', 'Income Tax Act',
    'Labour Laws', 'Factory Act', 'ESI Act', 'PF Act',
    'Professional Tax', 'Shop & Establishment Act', 'MSME Act',
    'Environment Act', 'Custom Act', 'Other'
  ),
  regulation: Joi.string().trim().max(200),
  category: Joi.string().valid('filing', 'registration', 'licence', 'audit', 'payment', 'other'),
  description: Joi.string().trim().max(1000),
  frequency: Joi.string().valid('one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'event-based'),
  dueDate: Joi.date(),
  applicableFrom: Joi.date(),
  applicableTo: Joi.date(),
  assignedTo: Joi.array().items(Joi.string()),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  isRecurring: Joi.boolean()
}).min(1);

const statusUpdateSchema = Joi.object({
  status: Joi.string().required().valid('pending', 'in-progress', 'completed', 'overdue', 'waived'),
  notes: Joi.string().trim().max(1000)
});

module.exports = { createComplianceSchema, updateComplianceSchema, statusUpdateSchema };
