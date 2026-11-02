const mongoose = require('mongoose');
const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TIERS = {
  '1M': { label: '1 Month', days: 30 },
  '3M': { label: '3 Months', days: 90 },
  '1Y': { label: '1 Year', days: 365 },
};

function checksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex')[0].toUpperCase();
}

function validateLicenseKey(key) {
  const clean = key.replace(/[-\s]/g, '').toUpperCase();
  if (clean.length !== 16) return null;

  const prefix = clean.substring(0, 2);
  const tier = TIERS[prefix];
  if (!tier) return null;

  const csInput = clean.substring(0, 2) + clean.substring(3);
  const expectedCs = checksum(csInput);
  const actualCs = clean[2];

  return {
    key: clean.match(/.{1,4}/g).join('-'),
    tier: prefix,
    tierLabel: tier.label,
    days: tier.days,
    validChecksum: expectedCs === actualCs,
  };
}

function generateLicenseKey(tierPrefix) {
  const tier = TIERS[tierPrefix];
  if (!tier) throw new Error('Invalid tier');

  let payload = '';
  for (let i = 0; i < 13; i++) {
    payload += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  const raw = tierPrefix + payload;
  const cs = checksum(raw);
  const full = tierPrefix + cs + payload;
  return full.match(/.{1,4}/g).join('-');
}

const licenseSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  key: { type: String, required: true, unique: true, index: true },
  tier: { type: String, enum: ['1M', '3M', '1Y'], required: true },
  tierLabel: { type: String, required: true },
  days: { type: Number, required: true },
  activatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isRevoked: { type: Boolean, default: false },
  revokedAt: Date,
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revokedReason: String,
  notes: String
}, { timestamps: true });

licenseSchema.index({ organization: 1 });
licenseSchema.index({ expiresAt: 1 });

licenseSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

licenseSchema.methods.isValid = function () {
  return this.isActive && !this.isRevoked && !this.isExpired();
};

licenseSchema.statics.validateKey = validateLicenseKey;
licenseSchema.statics.generateKey = generateLicenseKey;
licenseSchema.statics.TIERS = TIERS;

module.exports = mongoose.model('License', licenseSchema);
