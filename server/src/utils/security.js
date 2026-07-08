const crypto = require('crypto');

const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
};

const generateSecureToken = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const verifyTokenHash = (token, hash) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

module.exports = {
  escapeRegex,
  sanitizeInput,
  generateSecureToken,
  hashToken,
  verifyTokenHash,
  isValidEmail,
  sanitizeFilename
};
