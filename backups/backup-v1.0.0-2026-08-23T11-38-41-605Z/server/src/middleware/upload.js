const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'text/plain'
]);

const ALLOWED_EXTS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt']);

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return cb(new Error('File type not allowed.'), false);
  }
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(new Error('File MIME type not allowed.'), false);
  }
  const baseName = path.basename(file.originalname, ext).toLowerCase();
  const suspiciousPatterns = [/\.{2,}/, /[<>:"|?*]/, /^\./, /\s{2,}/];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(baseName)) {
      return cb(new Error('Filename contains invalid characters.'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter
});

module.exports = upload;
