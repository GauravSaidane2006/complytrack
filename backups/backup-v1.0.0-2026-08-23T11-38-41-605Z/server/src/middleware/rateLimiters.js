const rateLimit = require('express-rate-limit');

const createLimiter = (opts) => {
  const config = {
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: opts.message || 'Too many requests, please try again later.' },
    ...opts
  };

  return rateLimit(config);
};

const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
  keyGenerator: (req) => req.ip
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req) => req.ip
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many registration attempts, please try again later.',
  keyGenerator: (req) => req.ip
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later.',
  keyGenerator: (req) => req.ip
});

const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many file uploads, please try again later.',
  keyGenerator: (req) => `${req.user?._id || req.ip}`
});

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests, please try again later.',
  keyGenerator: (req) => req.user?._id || req.ip
});

const reportLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many report requests, please try again later.',
  keyGenerator: (req) => `${req.user?._id || req.ip}`
});

const dashboardLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many dashboard requests, please try again later.',
  keyGenerator: (req) => `${req.user?._id || req.ip}`
});

const searchLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many search requests, please try again later.',
  keyGenerator: (req) => `${req.user?._id || req.ip}`
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  apiLimiter,
  reportLimiter,
  dashboardLimiter,
  searchLimiter
};
