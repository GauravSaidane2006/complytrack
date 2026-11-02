const { getActiveLicense, getLicenseStatus, activateLicense } = require('../services/licenseService');
const License = require('../models/License');

const getStatus = async (req, res) => {
  try {
    const status = await getLicenseStatus(req.organizationId);
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activate = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'License key is required' });

    const result = await activateLicense(req.organizationId, key, req.user._id);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validate = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'License key is required' });

    const validation = License.validateKey(key);
    if (!validation) {
      return res.status(400).json({ valid: false, message: 'Invalid key format' });
    }

    const existing = await License.findOne({ key: validation.key });
    const isUsed = existing && existing.organization.toString() !== req.organizationId.toString();

    res.json({
      valid: validation.validChecksum,
      tier: validation.tierLabel,
      days: validation.days,
      isUsed,
      message: validation.validChecksum ? 'Key format is valid' : 'Invalid checksum'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllLicenses = async (req, res) => {
  try {
    const licenses = await License.find({ organization: req.organizationId })
      .sort({ activatedAt: -1 })
      .select('-__v');

    res.json({ licenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const revoke = async (req, res) => {
  try {
    const license = await License.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!license) return res.status(404).json({ message: 'License not found' });

    license.isRevoked = true;
    license.revokedAt = new Date();
    license.revokedBy = req.user._id;
    license.revokedReason = req.body.reason || 'Revoked by admin';
    await license.save();

    res.json({ message: 'License revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStatus, activate, validate, getAllLicenses, revoke };
