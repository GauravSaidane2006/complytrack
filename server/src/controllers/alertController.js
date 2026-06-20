const Alert = require('../models/Alert');
const Compliance = require('../models/Compliance');

exports.getAlerts = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';
    if (req.query.user) filter.user = req.query.user;

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      filter.$or = [{ user: req.user._id }, { user: { $exists: false } }];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('complianceItem', 'title dueDate')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.json({ alerts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId, isRead: false };
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      filter.$or = [{ user: req.user._id }, { user: { $exists: false } }];
    }
    const count = await Alert.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found.' });
    res.json(alert);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId, isRead: false };
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      filter.$or = [{ user: req.user._id }, { user: { $exists: false } }];
    }
    await Alert.updateMany(filter, { isRead: true, readAt: new Date() });
    res.json({ message: 'All alerts marked as read.' });
  } catch (error) {
    next(error);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create({
      ...req.body,
      organization: req.organizationId
    });
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
};

exports.generateDeadlineAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingItems = await Compliance.find({
      organization: req.organizationId,
      dueDate: { $gte: now, $lte: sevenDaysLater },
      status: { $nin: ['completed', 'waived'] }
    });

    const alerts = [];
    for (const item of upcomingItems) {
      const existingAlert = await Alert.findOne({
        organization: req.organizationId,
        complianceItem: item._id,
        type: 'deadline',
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      });
      if (existingAlert) continue;

      const daysUntilDue = Math.ceil((item.dueDate - now) / (1000 * 60 * 60 * 24));
      const title = daysUntilDue <= 0
        ? `OVERDUE: ${item.title}`
        : `Upcoming Deadline: ${item.title}`;
      const message = daysUntilDue <= 0
        ? `${item.title} was due on ${item.dueDate.toLocaleDateString()}. Immediate action required.`
        : `${item.title} is due in ${daysUntilDue} day(s) on ${item.dueDate.toLocaleDateString()}.`;

      const alert = await Alert.create({
        organization: req.organizationId,
        type: daysUntilDue <= 0 ? 'deadline' : 'reminder',
        title,
        message,
        complianceItem: item._id,
        priority: daysUntilDue <= 0 ? 'high' : item.priority,
        sentVia: ['in-app'],
        scheduledFor: now
      });
      alerts.push(alert);
    }

    res.json({ message: `${alerts.length} alerts generated.`, alerts });
  } catch (error) {
    next(error);
  }
};
