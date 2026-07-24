const User = require('../models/User');
const Organization = require('../models/Organization');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const Report = require('../models/Report');
const Contract = require('../models/Contract');
const RiskAssessment = require('../models/RiskAssessment');

exports.getGlobalStats = async (req, res, next) => {
  try {
    const [
      totalOrganizations,
      totalUsers,
      totalCompliance,
      activeCompliance,
      overdueCompliance,
      completedCompliance,
      totalAlerts,
      unreadAlerts,
      totalContracts,
      totalRisks
    ] = await Promise.all([
      Organization.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Compliance.countDocuments(),
      Compliance.countDocuments({ status: { $in: ['pending', 'in-progress'] } }),
      Compliance.countDocuments({ status: 'overdue' }),
      Compliance.countDocuments({ status: 'completed' }),
      Alert.countDocuments(),
      Alert.countDocuments({ isRead: false }),
      Contract.countDocuments(),
      RiskAssessment.countDocuments()
    ]);

    const complianceScore = totalCompliance > 0
      ? Math.round((completedCompliance / totalCompliance) * 100)
      : 0;

    res.json({
      organizations: {
        total: totalOrganizations
      },
      users: {
        total: totalUsers
      },
      compliance: {
        total: totalCompliance,
        active: activeCompliance,
        overdue: overdueCompliance,
        completed: completedCompliance,
        score: complianceScore
      },
      alerts: {
        total: totalAlerts,
        unread: unreadAlerts
      },
      contracts: {
        total: totalContracts
      },
      risks: {
        total: totalRisks
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrganizations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { companyId: { $regex: req.query.search, $options: 'i' } },
        { gstin: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.sector) filter.sector = req.query.sector;
    if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;

    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate('createdBy', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Organization.countDocuments(filter)
    ]);

    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const [complianceCount, overdueCount, userCount] = await Promise.all([
          Compliance.countDocuments({ organization: org._id }),
          Compliance.countDocuments({ organization: org._id, status: 'overdue' }),
          User.countDocuments({ organization: org._id })
        ]);
        return {
          ...org.toObject(),
          stats: {
            complianceTotal: complianceCount,
            complianceOverdue: overdueCount,
            users: userCount
          }
        };
      })
    );

    res.json({
      organizations: orgsWithStats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrganizationDetails = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const [users, complianceItems, alerts, contracts] = await Promise.all([
      User.find({ organization: organization._id }).select('name email role isActive lastLogin'),
      Compliance.find({ organization: organization._id }).sort('-dueDate').limit(20),
      Alert.find({ organization: organization._id }).sort('-createdAt').limit(10),
      Contract.find({ organization: organization._id }).sort('-createdAt').limit(10)
    ]);

    const complianceStats = await Compliance.aggregate([
      { $match: { organization: organization._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      organization,
      users,
      complianceItems,
      alerts,
      contracts,
      stats: complianceStats[0] || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllComplianceItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.organization) filter.organization = req.query.organization;
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.law) filter.law = { $in: req.query.law.split(',') };
    if (req.query.priority) filter.priority = { $in: req.query.priority.split(',') };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { regulation: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Compliance.find(filter)
        .populate('assignedTo', 'name email')
        .populate('organization', 'name companyId')
        .sort('-dueDate')
        .skip(skip)
        .limit(limit),
      Compliance.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.organization) filter.organization = req.query.organization;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.priority) filter.priority = req.query.priority;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('complianceItem', 'title dueDate')
        .populate('organization', 'name companyId')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.json({
      alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};
