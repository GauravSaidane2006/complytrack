const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { organization: req.organizationId };
    const users = await User.find(filter).select('-password -refreshToken').sort('-createdAt');
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
    }).select('-password -refreshToken');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, designation } = req.body;
    const user = await User.create({
      name, email, password, role, phone, designation,
      organization: req.organizationId
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'role', 'phone', 'designation', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
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
