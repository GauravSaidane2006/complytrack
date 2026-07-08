const User = require('../models/User');
const Organization = require('../models/Organization');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
  return null;
};

exports.getUsers = async (req, res, next) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { organization: req.organizationId };
    const users = await User.find(filter).select('-password -refreshToken -__v').sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      ...(req.user.role !== 'superadmin' && { organization: req.organizationId })
    }).select('-password -refreshToken -__v');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, designation } = req.body;

    if (req.user.isDev) {
      const validationError = validatePassword(password);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
      const user = await User.create({
        name, email, password, phone, designation,
        role: role || 'user',
        organization: req.organizationId
      });
      return res.status(201).json(user);
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only company admin can create new users.' });
    }

    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot create superadmin users.' });
    }

    const validationError = validatePassword(password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.create({
      name, email, password, phone, designation,
      role: role || 'user',
      organization: req.organizationId,
      sector: req.user.sector
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'designation', 'isActive'];
    if (req.user.role === 'superadmin') {
      allowedFields.push('role');
    }

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.role && req.user.role !== 'superadmin') {
      delete updates.role;
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -__v');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      organization: req.organizationId
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyReport = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.user.organization)
      .populate('createdBy', 'name email');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const users = await User.find({ organization: organization._id })
      .select('name email role sector isActive lastLogin createdAt');

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalCompliance, pending, inProgress, completed, overdue, critical, high] = await Promise.all([
      Compliance.countDocuments({ organization: organization._id }),
      Compliance.countDocuments({ organization: organization._id, status: 'pending' }),
      Compliance.countDocuments({ organization: organization._id, status: 'in-progress' }),
      Compliance.countDocuments({ organization: organization._id, status: 'completed' }),
      Compliance.countDocuments({ organization: organization._id, status: 'overdue' }),
      Compliance.countDocuments({ organization: organization._id, priority: 'critical' }),
      Compliance.countDocuments({ organization: organization._id, priority: 'high' }),
    ]);

    const upcomingDeadlines = await Compliance.find({
      organization: organization._id,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      status: { $nin: ['completed', 'waived'] }
    }).sort('dueDate').limit(10).select('title law dueDate priority status');

    const unreadAlerts = await Alert.countDocuments({
      organization: organization._id,
      isRead: false
    });

    const recentUsers = users.filter(u => {
      const created = new Date(u.createdAt);
      return created >= thirtyDaysAgo;
    });

    const complianceScore = totalCompliance > 0
      ? Math.round(((completed) / totalCompliance) * 100)
      : 0;

    res.json({
      company: {
        companyId: organization.companyId,
        name: organization.name,
        sector: organization.sector,
        industry: organization.industry,
        companyType: organization.companyType,
        verificationStatus: organization.verificationStatus,
        complianceSetupComplete: organization.complianceSetupComplete,
        createdAt: organization.createdAt,
        createdBy: organization.createdBy
      },
      users: {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'admin').length,
        managers: users.filter(u => u.role === 'manager').length,
        regular: users.filter(u => u.role === 'user').length,
        recentJoins: recentUsers.length,
        list: users.map(u => ({
          name: u.name,
          email: u.email,
          role: u.role,
          sector: u.sector,
          isActive: u.isActive,
          lastLogin: u.lastLogin,
          joinedAt: u.createdAt
        }))
      },
      compliance: {
        total: totalCompliance,
        pending,
        inProgress,
        completed,
        overdue,
        critical,
        high,
        score: complianceScore
      },
      alerts: {
        unread: unreadAlerts
      },
      upcomingDeadlines
    });
  } catch (error) {
    next(error);
  }
};
