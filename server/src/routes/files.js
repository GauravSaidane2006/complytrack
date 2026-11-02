const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Compliance = require('../models/Compliance');
const Organization = require('../models/Organization');

const authenticateViaQuery = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }
    req.user = user;
    req.organizationId = user.organization;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const serveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const sanitized = path.basename(filename);
    const filePath = path.join(__dirname, '../../uploads', sanitized);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    if (!isDevUser) {
      const fileRef = `/uploads/${sanitized}`;
      const [complianceMatch, orgMatch] = await Promise.all([
        Compliance.findOne({
          organization: req.organizationId,
          'documents.url': fileRef
        }),
        Organization.findOne({
          _id: req.organizationId,
          'documents.fileUrl': fileRef
        })
      ]);

      if (!complianceMatch && !orgMatch) {
        return res.status(403).json({ message: 'Access denied to this file.' });
      }
    }

    const ext = path.extname(sanitized).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${sanitized}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${sanitized}"`);
    }

    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error serving file.' });
  }
};

router.get('/:filename', authenticateViaQuery, serveFile);

module.exports = router;
