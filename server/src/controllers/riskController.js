const RiskAssessment = require('../models/RiskAssessment');
const Compliance = require('../models/Compliance');

exports.getRiskAssessments = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.impact) filter.impact = req.query.impact;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [assessments, total] = await Promise.all([
      RiskAssessment.find(filter)
        .populate('complianceItem', 'title law dueDate priority')
        .populate('assessedBy', 'name')
        .sort('-riskScore')
        .skip((page - 1) * limit)
        .limit(limit),
      RiskAssessment.countDocuments(filter)
    ]);

    res.json({ assessments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.assessRisk = async (req, res, next) => {
  try {
    const { complianceItem, impact, likelihood, financialImpact, legalConsequence, mitigation, mitigationDeadline } = req.body;

    const compliance = await Compliance.findOne({
      _id: complianceItem,
      organization: req.organizationId
    });
    if (!compliance) return res.status(404).json({ message: 'Compliance item not found.' });

    const impactScores = { low: 10, medium: 30, high: 60, critical: 90 };
    const likelihoodScores = { low: 10, medium: 50, high: 90 };
    const riskScore = Math.round((impactScores[impact] + likelihoodScores[likelihood]) / 2);

    const assessment = await RiskAssessment.create({
      organization: req.organizationId,
      complianceItem,
      riskScore,
      impact,
      likelihood,
      financialImpact,
      legalConsequence,
      mitigation,
      mitigationDeadline,
      assessedBy: req.user._id,
      assessedAt: new Date()
    });

    await Compliance.findByIdAndUpdate(complianceItem, {
      riskScore,
      priority: riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low'
    });

    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
};

exports.updateRiskStatus = async (req, res, next) => {
  try {
    const { status, mitigation } = req.body;
    const update = {};
    if (status) update.status = status;
    if (mitigation) update.mitigation = mitigation;
    if (status === 'mitigated') update.reviewedAt = new Date();

    const assessment = await RiskAssessment.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      update,
      { new: true }
    );

    if (!assessment) return res.status(404).json({ message: 'Risk assessment not found.' });

    if (status === 'mitigated' && assessment.complianceItem) {
      await Compliance.findByIdAndUpdate(assessment.complianceItem, { riskScore: 0, priority: 'low' });
    }

    res.json(assessment);
  } catch (error) {
    next(error);
  }
};

exports.getRiskSummary = async (req, res, next) => {
  try {
    const summary = await RiskAssessment.aggregate([
      { $match: { organization: req.organizationId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$impact', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$impact', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$impact', 'low'] }, 1, 0] } },
          identified: { $sum: { $cond: [{ $eq: ['$status', 'identified'] }, 1, 0] } },
          mitigated: { $sum: { $cond: [{ $eq: ['$status', 'mitigated'] }, 1, 0] } },
          avgRiskScore: { $avg: '$riskScore' }
        }
      }
    ]);

    const result = summary[0] || { total: 0, critical: 0, high: 0, medium: 0, low: 0, identified: 0, mitigated: 0, avgRiskScore: 0 };

    const highRiskItems = await RiskAssessment.find({
      organization: req.organizationId,
      riskScore: { $gte: 50 }
    }).populate('complianceItem', 'title law dueDate').sort('-riskScore').limit(10);

    res.json({ ...result, highRiskItems });
  } catch (error) {
    next(error);
  }
};
