const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { hashToken, generateSecureToken } = require('../utils/security');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateAccessToken = (userId, organizationId) => {
  return jwt.sign({ id: userId, organizationId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

const generateRefreshToken = () => {
  return generateSecureToken(40);
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearRefreshCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 0
  });
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
  return null;
};

const generateCompanyId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'CT-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, organizationName, phone, industry, sector, employeeCount, companyType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const isDev = process.env.NODE_ENV === 'development' && (email.endsWith('@complytrack.dev') || email === 'admin@complytrack.dev');

    let companyId;
    let unique = false;
    while (!unique) {
      companyId = generateCompanyId();
      const existing = await Organization.findOne({ companyId });
      if (!existing) unique = true;
    }

    const organization = await Organization.create({
      companyId,
      name: organizationName || `${name}'s Organization`,
      industry,
      sector,
      companyType,
      employeeCount,
      verificationStatus: isDev ? 'verified' : 'documents_required',
      verifiedAt: isDev ? new Date() : undefined
    });

    const user = await User.create({
      name, email, password,
      organization: organization._id,
      phone, role: 'admin', designation: 'Admin',
      sector,
      isDev
    });

    organization.createdBy = user._id;
    await organization.save();

    const accessToken = generateAccessToken(user._id, organization._id);
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: sanitizeUser(user),
      organization,
      requiresVerification: !isDev
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('organization');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = generateAccessToken(user._id, user.organization._id);
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    user.refreshToken = hashedRefreshToken;
    user.lastLogin = new Date();
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: sanitizeUser(user),
      organization: user.organization
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found.' });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({ refreshToken: hashedToken }).populate('organization');
    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken(user._id, user.organization._id);
    const newRefreshToken = generateRefreshToken();
    const hashedNewRefreshToken = hashToken(newRefreshToken);

    user.refreshToken = hashedNewRefreshToken;
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({
      accessToken,
      user: sanitizeUser(user),
      organization: user.organization
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hashedToken = hashToken(token);
      await User.findOneAndUpdate({ refreshToken: hashedToken }, { $set: { refreshToken: null } });
    } else if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } });
    }
    clearRefreshCookie(res);
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organization')
      .select('-password -refreshToken -__v');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, designation } = req.body;
    const allowedFields = ['name', 'phone', 'designation'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -__v');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    clearRefreshCookie(res);

    res.json({ message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    next(error);
  }
};
