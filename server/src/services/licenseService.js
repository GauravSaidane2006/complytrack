const License = require('../models/License');

const MAIN_SERVER_URL = (process.env.MAIN_SERVER_URL || 'http://localhost:5100').replace(/\/+$/, '');
const API_KEY = process.env.COMPLYTRACK_API_KEY || '';
const REQUEST_TIMEOUT_MS = parseInt(process.env.MAIN_SERVER_REQUEST_TIMEOUT || 8000, 10);

async function getActiveLicense(orgId) {
  const license = await License.findOne({
    organization: orgId,
    isActive: true,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).sort({ expiresAt: -1 });

  return license;
}

async function getLicenseStatus(orgId) {
  const license = await License.findOne({
    organization: orgId,
    isActive: true,
    isRevoked: false
  }).sort({ activatedAt: -1 });

  if (!license) {
    return { hasLicense: false, isActive: false, isExpired: false, license: null };
  }

  const isExpired = license.isExpired();
  return {
    hasLicense: true,
    isActive: license.isValid(),
    isExpired,
    license: {
      key: license.key,
      tier: license.tier,
      tierLabel: license.tierLabel,
      days: license.days,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      daysRemaining: isExpired ? 0 : Math.ceil((license.expiresAt - new Date()) / (1000 * 60 * 60 * 24)),
    }
  };
}

async function activateLicense(orgId, key, userId) {
  const validation = License.validateKey(key);
  if (!validation || !validation.validChecksum) {
    return { success: false, message: 'Invalid license key' };
  }

  const existing = await License.findOne({ key: validation.key, isActive: true });
  if (existing && existing.organization.toString() !== orgId.toString()) {
    return { success: false, message: 'This key is already assigned to another organization' };
  }
  if (existing && existing.organization.toString() === orgId.toString()) {
    return { success: false, message: 'This key is already active for your organization' };
  }

  const revoked = await License.findOne({ key: validation.key, isRevoked: true });
  if (revoked) {
    return { success: false, message: 'This key has been revoked' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + validation.days * 24 * 60 * 60 * 1000);

  const license = await License.create({
    organization: orgId,
    key: validation.key,
    tier: validation.tier,
    tierLabel: validation.tierLabel,
    days: validation.days,
    activatedAt: now,
    expiresAt,
  });

  return {
    success: true,
    message: `License activated: ${validation.tierLabel}`,
    license: {
      key: license.key,
      tier: license.tier,
      tierLabel: license.tierLabel,
      expiresAt: license.expiresAt,
      days: license.days,
    }
  };
}

async function validateLicenseWithMainServer(licenseKey, pan) {
  if (!API_KEY) {
    return { success: false, message: 'COMPLYTRACK_API_KEY not configured. Cannot validate license with main server.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${MAIN_SERVER_URL}/api/licenses/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ licenseKey, pan }),
      signal: controller.signal
    });

    const body = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: body.message || `License validation failed (HTTP ${res.status})`,
        conflict: body.conflict || null,
        statusCode: res.status
      };
    }

    return {
      success: true,
      message: body.message,
      tier: body.tier,
      days: body.days,
      expiresAt: body.expiresAt,
      alreadyActivated: body.alreadyActivated || false
    };
  } catch (error) {
    const msg = error.name === 'AbortError'
      ? 'Main server did not respond in time'
      : `Cannot reach main server: ${error.message}`;
    return { success: false, message: msg };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { getActiveLicense, getLicenseStatus, activateLicense, validateLicenseWithMainServer };
