require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { sanitize, mongoSanitize } = require('./middleware/sanitize');
const { licenseGate } = require('./middleware/licenseGate');
const { globalLimiter, authLimiter, registerLimiter, uploadLimiter, apiLimiter, reportLimiter, dashboardLimiter } = require('./middleware/rateLimiters');
const routes = require('./routes');
const { startScheduledJobs, setSocketIO: setComplianceServiceSocket } = require('./services/complianceService');
const { setSocketIO } = require('./utils/socketHelper');
const { startNoticeJobs } = require('./services/noticeService');
const { generateAllPdfsOnStartup } = require('./services/sectorPdfService');
const mainServerMonitor = require('./services/mainServerMonitor');

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.CLIENT_URL_NETWORK
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required.'));
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.organizationId = decoded.organizationId;
    next();
  } catch (err) {
    next(new Error('Invalid token.'));
  }
});

io.on('connection', (socket) => {
  socket.join(`org:${socket.organizationId}`);
  socket.on('disconnect', () => {});
});

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const noticesDir = path.join(__dirname, '../notices');
if (!fs.existsSync(noticesDir)) fs.mkdirSync(noticesDir, { recursive: true });
const sectorPdfsDir = path.join(__dirname, '../sector-pdfs');
if (!fs.existsSync(sectorPdfsDir)) fs.mkdirSync(sectorPdfsDir, { recursive: true });

app.use(helmet({
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' }
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize);
app.use(sanitize);
app.use('/api', globalLimiter);
app.use('/api', licenseGate);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/verification/upload', uploadLimiter);
app.use('/api/reports', reportLimiter);
app.use('/api/dashboard', dashboardLimiter);

const authenticate = require('./middleware/auth').authenticate;
app.use('/uploads', authenticate, express.static(path.join(__dirname, '../uploads')));
app.use('/reports', authenticate, express.static(path.join(__dirname, '../reports')));
app.use('/notices', authenticate, express.static(path.join(__dirname, '../notices')));
app.use('/sector-pdfs', authenticate, express.static(path.join(__dirname, '../sector-pdfs')));

app.use('/api', routes);

const clientDistPath = path.join(__dirname, '../../client/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5173;

connectDB().then(() => {
  setSocketIO(io);
  setComplianceServiceSocket(io);
  startScheduledJobs();
  startNoticeJobs();
  mainServerMonitor.start();
  generateAllPdfsOnStartup().catch(err => console.error('PDF generation error:', err.message));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or use a different PORT.`);
      process.exit(1);
    }
    console.error('Server error:', err);
  });
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = { app, server, io };
