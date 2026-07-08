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
const { globalLimiter, authLimiter, registerLimiter, uploadLimiter, apiLimiter, reportLimiter, dashboardLimiter } = require('./middleware/rateLimiters');
const routes = require('./routes');
const { startScheduledJobs } = require('./services/complianceService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/verification/upload', uploadLimiter);
app.use('/api/reports', reportLimiter);
app.use('/api/dashboard', dashboardLimiter);

const authenticate = require('./middleware/auth').authenticate;
app.use('/uploads', authenticate, express.static(path.join(__dirname, '../uploads')));
app.use('/reports', authenticate, express.static(path.join(__dirname, '../reports')));

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startScheduledJobs();
  server.listen(PORT, () => {});
});

module.exports = { app, server, io };
