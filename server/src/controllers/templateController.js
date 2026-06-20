const Template = require('../models/Template');

exports.getTemplates = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.law) filter.law = req.query.law;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';

    const templates = await Template.find(filter).sort('-createdAt');
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const template = await Template.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    res.json({ message: 'Template deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.seedTemplates = async (req, res, next) => {
  try {
    const templates = [
      { name: 'GST Monthly Return Filing', law: 'GST Act', regulation: 'GSTR-3B', category: 'filing', frequency: 'monthly', defaultPriority: 'high', isSystem: true, description: 'Monthly GST return filing - GSTR-3B' },
      { name: 'GST Annual Return Filing', law: 'GST Act', regulation: 'GSTR-9', category: 'filing', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Annual GST return filing - GSTR-9' },
      { name: 'TDS Return Filing', law: 'Income Tax Act', regulation: 'Section 200(3)', category: 'filing', frequency: 'quarterly', defaultPriority: 'high', isSystem: true, description: 'Quarterly TDS return filing' },
      { name: 'Income Tax Return Filing', law: 'Income Tax Act', regulation: 'Section 139(1)', category: 'filing', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Annual income tax return filing' },
      { name: 'PF Monthly Payment', law: 'PF Act', regulation: 'EPF Scheme 1952', category: 'payment', frequency: 'monthly', defaultPriority: 'high', isSystem: true, description: 'Monthly PF contribution payment' },
      { name: 'ESI Monthly Payment', law: 'ESI Act', regulation: 'ESI Act 1948', category: 'payment', frequency: 'monthly', defaultPriority: 'high', isSystem: true, description: 'Monthly ESI contribution payment' },
      { name: 'Professional Tax Payment', law: 'Professional Tax', regulation: 'State PT Act', category: 'payment', frequency: 'monthly', defaultPriority: 'medium', isSystem: true, description: 'Monthly professional tax payment' },
      { name: 'Board Meeting Minutes Filing', law: 'Companies Act', regulation: 'Section 118', category: 'filing', frequency: 'quarterly', defaultPriority: 'medium', isSystem: true, description: 'Board meeting minutes filing with MCA' },
      { name: 'Annual Return Filing - MCA', law: 'Companies Act', regulation: 'Section 92', category: 'filing', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Annual return filing with MCA - Form MGT-7' },
      { name: 'Financial Statement Filing', law: 'Companies Act', regulation: 'Section 137', category: 'filing', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Financial statement filing with MCA - Form AOC-4' },
      { name: 'Factory License Renewal', law: 'Factory Act', regulation: 'Section 6', category: 'licence', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Annual factory license renewal' },
      { name: 'Shop & Establishment Registration', law: 'Shop & Establishment Act', regulation: 'State Act', category: 'registration', frequency: 'one-time', defaultPriority: 'medium', isSystem: true, description: 'Shop and establishment registration' },
      { name: 'MSME Registration', law: 'MSME Act', regulation: 'MSME Development Act', category: 'registration', frequency: 'one-time', defaultPriority: 'medium', isSystem: true, description: 'MSME/Udyam registration' },
      { name: 'Environmental Clearance Renewal', law: 'Environment Act', regulation: 'EPA 1986', category: 'licence', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Environmental clearance renewal' },
      { name: 'Audit - Statutory', law: 'Companies Act', regulation: 'Section 143', category: 'audit', frequency: 'yearly', defaultPriority: 'high', isSystem: true, description: 'Statutory audit of financial statements' },
      { name: 'Audit - Internal', law: 'Companies Act', regulation: 'Section 138', category: 'audit', frequency: 'quarterly', defaultPriority: 'medium', isSystem: true, description: 'Internal audit as per company requirements' },
      { name: 'Form 16 Issuance', law: 'Income Tax Act', regulation: 'Section 203', category: 'other', frequency: 'yearly', defaultPriority: 'medium', isSystem: true, description: 'Issuance of Form 16 to employees' },
      { name: 'RBI Compliance - FEMA', law: 'RBI Act', regulation: 'FEMA 1999', category: 'filing', frequency: 'quarterly', defaultPriority: 'medium', isSystem: true, description: 'FEMA compliance filing with RBI' }
    ];

    const count = await Template.countDocuments();
    if (count > 0) return res.json({ message: 'Templates already seeded.', count });

    await Template.insertMany(templates);
    res.status(201).json({ message: 'Seed data created.', count: templates.length });
  } catch (error) {
    next(error);
  }
};
