const Compliance = require('../models/Compliance');
const Template = require('../models/Template');

exports.getComplianceItems = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.law) filter.law = { $in: req.query.law.split(',') };
    if (req.query.priority) filter.priority = { $in: req.query.priority.split(',') };
    if (req.query.assignedTo) filter.assignedTo = { $in: req.query.assignedTo.split(',') };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { regulation: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.startDate || req.query.endDate) {
      filter.dueDate = {};
      if (req.query.startDate) filter.dueDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.dueDate.$lte = new Date(req.query.endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Compliance.find(filter)
        .populate('assignedTo', 'name email')
        .populate('completedBy', 'name')
        .sort(req.query.sort || '-dueDate')
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

exports.getComplianceItem = async (req, res, next) => {
  try {
    const item = await Compliance.findOne({
      _id: req.params.id,
      organization: req.organizationId
    }).populate('assignedTo', 'name email').populate('completedBy', 'name');

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.createComplianceItem = async (req, res, next) => {
  try {
    const data = { ...req.body, organization: req.organizationId };

    if (req.body.templateId) {
      const template = await Template.findById(req.body.templateId);
      if (template) {
        data.title = data.title || template.name;
        data.law = data.law || template.law;
        data.regulation = data.regulation || template.regulation;
        data.category = data.category || template.category;
        data.description = data.description || template.description;
        data.frequency = data.frequency || template.frequency;
        data.priority = data.priority || template.defaultPriority;
      }
    }

    const item = await Compliance.create(data);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateComplianceItem = async (req, res, next) => {
  try {
    const item = await Compliance.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteComplianceItem = async (req, res, next) => {
  try {
    const item = await Compliance.findOneAndDelete({
      _id: req.params.id,
      organization: req.organizationId
    });
    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });
    res.json({ message: 'Compliance item deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const update = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
      update.completedBy = req.user._id;
    }
    if (notes !== undefined) update.notes = notes;

    const item = await Compliance.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      update,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });

    if (item.status === 'completed' && item.isRecurring && item.frequency !== 'one-time') {
      const nextDue = new Date(item.dueDate);
      const freqMap = { monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12 };
      const months = freqMap[item.frequency];
      if (months) {
        nextDue.setMonth(nextDue.getMonth() + months);
        await Compliance.create({
          ...item.toObject(),
          _id: undefined,
          parentCompliance: item._id,
          status: 'pending',
          dueDate: nextDue,
          completedAt: undefined,
          completedBy: undefined,
          createdAt: undefined,
          updatedAt: undefined
        });
      }
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.getComplianceStats = async (req, res, next) => {
  try {
    const now = new Date();
    const pipeline = [
      { $match: { organization: req.organizationId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
          waived: { $sum: { $cond: [{ $eq: ['$status', 'waived'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ];

    const stats = await Compliance.aggregate(pipeline);

    const overdueItems = await Compliance.countDocuments({
      organization: req.organizationId,
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'waived'] }
    });

    const upcomingDeadlines = await Compliance.find({
      organization: req.organizationId,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $nin: ['completed', 'waived'] }
    }).populate('assignedTo', 'name email').sort('dueDate').limit(10);

    const lawDistribution = await Compliance.aggregate([
      { $match: { organization: req.organizationId } },
      { $group: { _id: '$law', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, waived: 0,
      critical: 0, high: 0, medium: 0, low: 0
    };
    result.overdueItems = overdueItems;
    result.upcomingDeadlines = upcomingDeadlines;
    result.lawDistribution = lawDistribution;
    result.complianceScore = result.total > 0
      ? Math.round(((result.completed + result.waived) / result.total) * 100)
      : 0;

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.bulkCreateFromTemplate = async (req, res, next) => {
  try {
    const { templateId, dueDates, assignedTo } = req.body;
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found.' });

    const items = dueDates.map(dueDate => ({
      organization: req.organizationId,
      title: template.name,
      law: template.law,
      regulation: template.regulation,
      category: template.category,
      description: template.description,
      frequency: template.frequency,
      priority: template.defaultPriority,
      dueDate: new Date(dueDate),
      assignedTo: assignedTo || []
    }));

    const created = await Compliance.insertMany(items);
    res.status(201).json({ message: `${created.length} compliance items created.`, items: created });
  } catch (error) {
    next(error);
  }
};
