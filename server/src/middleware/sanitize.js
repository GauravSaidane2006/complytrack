const mongoSanitize = require('express-mongo-sanitize');

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value.replace(/\$/g, '_').replace(/\./g, '_');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [k, v] of Object.entries(value)) {
      const safeKey = k.replace(/\$/g, '_').replace(/\./g, '_');
      if (safeKey !== '__proto__' && safeKey !== 'constructor' && safeKey !== 'prototype') {
        sanitized[safeKey] = sanitizeValue(v);
      }
    }
    return sanitized;
  }
  return value;
}

function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    const safe = {};
    for (const [k, v] of Object.entries(req.params)) {
      safe[k.replace(/\$/g, '_').replace(/\./g, '_')] = v;
    }
    Object.assign(req.params, safe);
  }
  next();
}

const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key} from ${req.ip}`);
  }
});

module.exports = { sanitize, mongoSanitize: mongoSanitizeMiddleware };
