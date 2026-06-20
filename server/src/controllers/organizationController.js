const Organization = require('../models/Organization');
const Compliance = require('../models/Compliance');

exports.getOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found.' });
    res.json(org);
  } catch (error) {
    next(error);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'gstin', 'pan', 'address', 'city', 'state', 'pinCode', 'industry', 'employeeCount'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const org = await Organization.findByIdAndUpdate(req.organizationId, updates, {
      new: true, runValidators: true
    });
    res.json(org);
  } catch (error) {
    next(error);
  }
};

exports.refreshHealthScore = async (req, res, next) => {
  try {
    const total = await Compliance.countDocuments({ organization: req.organizationId });
    const completed = await Compliance.countDocuments({
      organization: req.organizationId,
      status: { $in: ['completed', 'waived'] }
    });
    const score = total > 0 ? Math.round((completed / total) * 100) : 100;

    await Organization.findByIdAndUpdate(req.organizationId, { complianceHealthScore: score });
    res.json({ complianceHealthScore: score });
  } catch (error) {
    next(error);
  }
};
