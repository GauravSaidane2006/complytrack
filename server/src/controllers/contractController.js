const Contract = require('../models/Contract');

exports.getContracts = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { party: { $regex: req.query.search, $options: 'i' } },
        { contractNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Contract.countDocuments(filter)
    ]);

    res.json({ contracts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      organization: req.organizationId
    }).populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('documents.uploadedBy', 'name');

    if (!contract) return res.status(404).json({ message: 'Contract not found.' });
    res.json(contract);
  } catch (error) {
    next(error);
  }
};

exports.createContract = async (req, res, next) => {
  try {
    const contract = await Contract.create({
      ...req.body,
      organization: req.organizationId,
      createdBy: req.user._id
    });
    res.status(201).json(contract);
  } catch (error) {
    next(error);
  }
};

exports.updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contract) return res.status(404).json({ message: 'Contract not found.' });
    res.json(contract);
  } catch (error) {
    next(error);
  }
};

exports.deleteContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOneAndDelete({
      _id: req.params.id,
      organization: req.organizationId
    });
    if (!contract) return res.status(404).json({ message: 'Contract not found.' });
    res.json({ message: 'Contract deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getContractStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [stats, expiringSoon, totalValue] = await Promise.all([
      Contract.aggregate([
        { $match: { organization: req.organizationId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
            totalValue: { $sum: '$value' }
          }
        }
      ]),
      Contract.find({
        organization: req.organizationId,
        renewalDate: { $gte: now, $lte: thirtyDaysFromNow },
        status: 'active'
      }).select('title party renewalDate').sort('renewalDate'),
      Contract.aggregate([
        { $match: { organization: req.organizationId, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$value' } } }
      ])
    ]);

    const result = stats[0] || { total: 0, active: 0, draft: 0, expired: 0, totalValue: 0 };
    result.expiringSoon = expiringSoon;
    res.json(result);
  } catch (error) {
    next(error);
  }
};
