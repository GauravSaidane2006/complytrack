const Compliance = require('../models/Compliance');
const Template = require('../models/Template');
const { escapeRegex } = require('../utils/security');
const { emitToOrg } = require('../utils/socketHelper');

exports.getComplianceItems = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const isManager = req.user.role === 'manager';
    const isAdmin = req.user.role === 'admin';
    const isUser = req.user.role === 'user';

    const filter = isDevUser ? {} : { organization: req.organizationId };

    if (isUser) {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.law) filter.law = { $in: req.query.law.split(',') };
    if (req.query.priority) filter.priority = { $in: req.query.priority.split(',') };
    if (req.query.frequency) filter.frequency = { $in: req.query.frequency.split(',') };
    if (req.query.assignedTo && !isUser) filter.assignedTo = { $in: req.query.assignedTo.split(',') };
    if (req.query.organization && isDevUser) filter.organization = req.query.organization;
    if (req.query.search) {
      const sanitizedSearch = escapeRegex(req.query.search);
      filter.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { regulation: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      userRole: req.user.role
    });
  } catch (error) {
    next(error);
  }
};

exports.getComplianceItem = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const item = await Compliance.findOne({
      _id: req.params.id,
      ...(isDevUser ? {} : { organization: req.organizationId })
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
    emitToOrg(req.organizationId, 'compliance:created', { _id: item._id, title: item.title });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateComplianceItem = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isUser = req.user.role === 'user';

    const item = await Compliance.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });

    // Ownership check: regular users can only update items assigned to them.
    // Managers can work on any task in the organization (but cannot delete).
    if (isUser) {
      const isAssigned = item.assignedTo.some(u => u.toString() === req.user._id.toString());
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update compliance items assigned to you.' });
      }
    }

    // Define allowed fields per role
    const fullFields = ['title', 'law', 'regulation', 'category', 'description', 'frequency', 'dueDate', 'applicableFrom', 'applicableTo', 'assignedTo', 'status', 'priority', 'riskScore', 'notes', 'isRecurring', 'proofRequired', 'reminderSettings'];
    const managerFields = ['status', 'notes', 'proofRequired', 'reminderSettings'];
    const assignedFields = ['status', 'notes', 'proofRequired', 'reminderSettings'];

    const allowedFields = (isDevUser || isAdmin) ? fullFields : (isManager ? managerFields : assignedFields);
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Compliance.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      updates,
      { new: true, runValidators: true }
    );

    emitToOrg(req.organizationId, 'compliance:updated', { _id: updated._id, title: updated.title, status: updated.status });
    res.json(updated);
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
    emitToOrg(req.organizationId, 'compliance:deleted', { _id: item._id });
    res.json({ message: 'Compliance item deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    const isUser = req.user.role === 'user';

    const item = await Compliance.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });

    // Ownership check: regular users can only update status on items assigned to them.
    // Managers can work on any task in the organization (but cannot delete).
    if (isUser) {
      const isAssigned = item.assignedTo.some(u => u.toString() === req.user._id.toString());
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update status on compliance items assigned to you.' });
      }
    }

    const { status, notes } = req.body;
    const update = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
      update.completedBy = req.user._id;
    }
    if (notes !== undefined) update.notes = notes;

    const updated = await Compliance.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      update,
      { new: true }
    );

    emitToOrg(req.organizationId, 'compliance:status-changed', {
      _id: updated._id,
      title: updated.title,
      status: updated.status,
      updatedBy: req.user.name
    });

    if (updated.status === 'completed' && updated.isRecurring && updated.frequency !== 'one-time') {
      const nextDue = new Date(updated.dueDate);
      const freqMap = { monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12 };
      const months = freqMap[updated.frequency];
      if (months) {
        nextDue.setMonth(nextDue.getMonth() + months);
        await Compliance.create({
          ...updated.toObject(),
          _id: undefined,
          parentCompliance: updated._id,
          status: 'pending',
          dueDate: nextDue,
          completedAt: undefined,
          completedBy: undefined,
          createdAt: undefined,
          updatedAt: undefined
        });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.getComplianceStats = async (req, res, next) => {
  try {
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const orgFilter = isDevUser ? {} : { organization: req.organizationId };
    const now = new Date();
    const excludeCompletedOneTime = { $nor: [{ frequency: 'one-time', status: 'completed' }] };
    const pipeline = [
      { $match: { ...orgFilter, ...excludeCompletedOneTime } },
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
      ...orgFilter,
      ...excludeCompletedOneTime,
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'waived'] }
    });

    const upcomingDeadlines = await Compliance.find({
      ...orgFilter,
      ...excludeCompletedOneTime,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $nin: ['completed', 'waived'] }
    }).populate('assignedTo', 'name email').sort('dueDate').limit(10);

    const lawDistribution = await Compliance.aggregate([
      { $match: { ...orgFilter, ...excludeCompletedOneTime } },
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
    emitToOrg(req.organizationId, 'compliance:created', { _id: 'bulk', count: created.length });
    res.status(201).json({ message: `${created.length} compliance items created.`, items: created });
  } catch (error) {
    next(error);
  }
};

exports.assignUsers = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const item = await Compliance.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });

    emitToOrg(req.organizationId, 'compliance:assigned', {
      _id: item._id,
      title: item.title,
      assignedTo: item.assignedTo.map(u => u.name),
      assignedBy: req.user.name
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.bulkAssignCompliance = async (req, res, next) => {
  try {
    const { complianceIds, assignedTo } = req.body;
    if (!Array.isArray(complianceIds) || complianceIds.length === 0) {
      return res.status(400).json({ message: 'complianceIds must be a non-empty array.' });
    }
    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({ message: 'assignedTo must be an array of user IDs.' });
    }

    const result = await Compliance.updateMany(
      { _id: { $in: complianceIds }, organization: req.organizationId },
      { assignedTo },
      { runValidators: true }
    );

    emitToOrg(req.organizationId, 'compliance:bulk-assigned', {
      count: result.modifiedCount,
      assignedTo,
      assignedBy: req.user.name
    });

    res.json({ message: `${result.modifiedCount} compliance items assigned successfully.`, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

exports.uploadProof = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const item = await Compliance.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!item) return res.status(404).json({ message: 'Compliance item not found.' });

    const document = {
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    item.documents.push(document);
    item.proofUploaded = true;
    await item.save();

    emitToOrg(req.organizationId, 'compliance:proof-uploaded', {
      _id: item._id,
      title: item.title,
      fileName: document.name,
      uploadedBy: req.user.name
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};
