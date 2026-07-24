const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const orgFilter = isDevUser ? {} : { organization: req.organizationId };
    const now = new Date();

    const [
      complianceStats,
      overdueCount,
      upcomingDeadlines,
      unreadAlerts,
      recentActivity,
      lastReport
    ] = await Promise.all([
      Compliance.aggregate([
        { $match: orgFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
            waived: { $sum: { $cond: [{ $eq: ['$status', 'waived'] }, 1, 0] } },
            critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
          }
        }
      ]),
      Compliance.countDocuments({
        ...orgFilter,
        dueDate: { $lt: now },
        status: { $nin: ['completed', 'waived'] }
      }),
      Compliance.find({
        ...orgFilter,
        dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: { $nin: ['completed', 'waived'] }
      }).populate('assignedTo', 'name').sort('dueDate').limit(5),
      Alert.countDocuments(isDevUser ? { isRead: false } : { organization: req.organizationId, isRead: false }),
      Compliance.find(orgFilter)
        .sort('-updatedAt').limit(5)
        .select('title status updatedAt priority'),
      isDevUser ? Report.findOne().sort('-createdAt') : Report.findOne({ organization: req.organizationId }).sort('-createdAt')
    ]);

    const stats = complianceStats[0] || {
      total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, waived: 0,
      critical: 0, high: 0
    };

    stats.complianceScore = stats.total > 0
      ? Math.round(((stats.completed + stats.waived) / stats.total) * 100)
      : 0;

    res.json({
      stats,
      overdueCount,
      upcomingDeadlines,
      unreadAlerts: unreadAlerts || 0,
      recentActivity,
      lastReport
    });
  } catch (error) {
    next(error);
  }
};

exports.getComplianceHealth = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const orgFilter = isDevUser ? {} : { organization: req.organizationId };
    const monthlyData = await Compliance.aggregate([
      { $match: orgFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const score = monthlyData.map(d => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
      total: d.total,
      completed: d.completed,
      score: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
    }));

    const lawBreakdown = await Compliance.aggregate([
      { $match: orgFilter },
      {
        $group: {
          _id: '$law',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ score, lawBreakdown });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingDeadlines = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const orgFilter = isDevUser ? {} : { organization: req.organizationId };
    const now = new Date();
    const deadlines = await Compliance.find({
      ...orgFilter,
      dueDate: { $gte: now },
      status: { $nin: ['completed', 'waived'] }
    }).populate('assignedTo', 'name email')
      .sort('dueDate')
      .limit(20);

    res.json(deadlines);
  } catch (error) {
    next(error);
  }
};
