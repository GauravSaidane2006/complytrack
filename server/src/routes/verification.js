const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadDocumentSchema, reviewDocumentSchema, devBypassSchema } = require('../validators/verificationValidator');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadLimiter, apiLimiter } = require('../middleware/rateLimiters');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', authenticate, uploadLimiter, upload.single('document'), verificationController.uploadDocument);
router.get('/status', authenticate, apiLimiter, verificationController.getVerificationStatus);
router.get('/status/:orgId', authenticate, apiLimiter, verificationController.getVerificationStatus);
router.put('/review/:id', authenticate, authorize('admin', 'superadmin', 'developer'), apiLimiter, validate(reviewDocumentSchema), verificationController.reviewDocument);
router.get('/all', authenticate, authorize('admin', 'superadmin', 'developer'), apiLimiter, verificationController.getAllVerifications);
router.post('/dev-bypass', authenticate, apiLimiter, verificationController.devBypass);
router.get('/help/:sector', authenticate, apiLimiter, verificationController.getSectorHelp);
router.get('/help-content/:sector', authenticate, apiLimiter, verificationController.getHelpContent);

module.exports = router;
