# ComplyTrack India - AI Brain File

> This document provides comprehensive knowledge for AI assistants working on the ComplyTrack India project. Read this file before making any changes.

---

## Project Overview

**ComplyTrack India** is a full-stack compliance management platform for Indian businesses. It helps organizations track regulatory compliance obligations (GST, Companies Act, RBI, Income Tax, Labour Laws, ESI, PF, etc.), manage deadlines, assess risks, handle contracts, and generate compliance reports.

**Primary Language:** JavaScript (Node.js backend, React frontend)

---

## Architecture

```
complytrack/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Express.js backend (MongoDB)
├── cli/             # Compliance laws scraper CLI tool
└── Brain.md         # This file
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Redux Toolkit (RTK Query) |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Mongoose) with in-memory fallback |
| Auth | JWT (access/refresh tokens, HTTP-only cookies) |
| Validation | Joi schemas |
| PDF | PDFKit |
| Excel | ExcelJS |
| Email | Nodemailer |
| Security | Helmet, CORS, rate limiting, express-mongo-sanitize |

---

## Directory Structure

### Client (`client/`)
```
client/src/
├── main.jsx              # Entry point (Redux Provider + Router)
├── App.jsx               # Route definitions (lines 29-54)
├── index.css             # Tailwind imports
├── pages/                # 12 page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── ComplianceList.jsx
│   ├── ComplianceForm.jsx
│   ├── ComplianceDetail.jsx
│   ├── Templates.jsx
│   ├── Reports.jsx
│   ├── Alerts.jsx
│   ├── RiskAssessment.jsx
│   ├── Contracts.jsx
│   └── Users.jsx
├── components/
│   ├── layout/           # DashboardLayout, Sidebar, Header
│   └── common/           # AuthBootstrap, Modal, StatCard, etc.
└── store/
    ├── index.js          # Redux store config
    └── slices/
        ├── authSlice.js  # Auth state
        └── api/api.js    # RTK Query endpoints (305 lines)
```

### Server (`server/`)
```
server/src/
├── app.js                # MAIN ENTRY POINT
├── config/db.js          # MongoDB connection
├── models/               # 8 Mongoose models
│   ├── User.js
│   ├── Organization.js
│   ├── Compliance.js
│   ├── Template.js
│   ├── Report.js
│   ├── Alert.js
│   ├── RiskAssessment.js
│   └── Contract.js
├── controllers/          # 10 controllers
│   ├── authController.js
│   ├── complianceController.js
│   ├── reportController.js
│   ├── alertController.js
│   ├── dashboardController.js
│   ├── riskController.js
│   ├── contractController.js
│   ├── templateController.js
│   ├── userController.js
│   └── organizationController.js
├── routes/               # 10 route files
│   ├── index.js          # Router aggregator (mounts all under /api)
│   ├── auth.js
│   ├── compliance.js
│   ├── reports.js
│   ├── alerts.js
│   ├── dashboard.js
│   ├── risks.js
│   ├── contracts.js
│   ├── templates.js
│   ├── users.js
│   └── organization.js
├── middleware/            # 5 middleware files
│   ├── auth.js           # JWT authenticate + authorize
│   ├── validate.js       # Joi validation wrapper
│   ├── upload.js         # Multer file upload
│   ├── sanitize.js       # NoSQL injection prevention
│   └── errorHandler.js   # Global error handler
├── validators/           # Joi schemas
│   ├── authValidator.js
│   └── complianceValidator.js
├── services/
│   └── complianceService.js  # Cron jobs (hourly, 6h, daily)
└── utils/
    ├── pdfGenerator.js   # PDFKit report generation
    ├── excelGenerator.js # ExcelJS spreadsheet generation
    └── emailService.js   # Nodemailer email service
```

### CLI (`cli/`)
```
cli/
├── package.json
├── scraper.js            # Main CLI entry point
├── scrapers/             # Sector-specific scrapers
│   ├── index.js          # Scraper registry
│   ├── rbi.js            # Banking/RBI
│   ├── sebi.js           # SEBI/Markets
│   ├── mca.js            # Companies Act
│   ├── incomeTax.js      # Income Tax
│   ├── gst.js            # GST
│   ├── labour.js         # Labour Laws
│   ├── epf.js            # EPF/ESI
│   ├── environment.js    # Environment
│   ├── fssai.js          # FSSAI
│   ├── healthcare.js     # Healthcare
│   ├── service.js        # Service Sector
│   ├── manufacturing.js  # Manufacturing
│   └── agriculture.js    # Agriculture
├── utils/
│   ├── httpClient.js     # Axios with rate limiting
│   ├── htmlParser.js     # Cheerio wrapper
│   └── pdfBuilder.js     # PDF generation
└── output/               # Generated PDFs
```

---

## API Endpoints

All endpoints prefixed with `/api`:

| Endpoint | Controller | Auth | Description |
|----------|-----------|------|-------------|
| `/api/auth` | authController | Partial | Register, login, logout, refresh |
| `/api/compliance` | complianceController | Yes | CRUD + stats + bulk create |
| `/api/reports` | reportController | Yes | Generate, list, download reports |
| `/api/alerts` | alertController | Yes | CRUD + mark read |
| `/api/dashboard` | dashboardController | Yes | Summary, health scores |
| `/api/risks` | riskController | Yes | Risk assessment CRUD |
| `/api/contracts` | contractController | Yes | Contract CRUD |
| `/api/templates` | templateController | Yes | Template CRUD + seed |
| `/api/users` | userController | Yes | User management |
| `/api/organization` | organizationController | Yes | Org settings |

---

## User Roles (RBAC)

| Role | Permissions |
|------|-------------|
| `superadmin` | Full access across all organizations |
| `admin` | Full access within organization |
| `manager` | Can generate reports, limited admin |
| `user` | Basic read/write access |

Roles defined in `User.js` model (line 10) and enforced in `middleware/auth.js` (lines 30-37).

---

## Environment Variables

**File:** `server/.env`

| Variable | Default | Used In |
|----------|---------|---------|
| `PORT` | `5000` | app.js |
| `NODE_ENV` | `development` | authController.js |
| `MONGODB_URI` | (empty = in-memory) | db.js |
| `JWT_SECRET` | (required) | auth.js |
| `CLIENT_URL` | `http://localhost:5173` | app.js |
| `UPLOAD_DIR` | `uploads` | upload.js |
| `MAX_FILE_SIZE` | `10485760` | upload.js |
| `EMAIL_HOST/PORT/USER/PASS` | Gmail defaults | emailService.js |

---

## Database Models

### Compliance Model Fields
- `title`, `description`, `law` (the regulation)
- `status` (pending, in_progress, completed, overdue)
- `priority` (low, medium, high, critical)
- `dueDate`, `completedDate`
- `organization` (ref to Organization)
- `assignedTo` (ref to User)
- `documents` (array of file paths)
- `recurring` (boolean, frequency)

### Report Model Fields
- `title`, `type` (compliance_summary, risk_assessment, deadline_report)
- `dateRange` (from, to)
- `format` (pdf, xlsx)
- `filePath`, `fileUrl`
- `generatedBy` (ref to User)
- `organization` (ref to Organization)

---

## Cron Jobs (complianceService.js)

| Schedule | Job | Description |
|----------|-----|-------------|
| `0 * * * *` (hourly) | markOverdueItems | Marks overdue compliance items |
| `0 */6 * * *` (every 6h) | generateDeadlineAlerts | Alerts for items due within 7 days |
| `0 2 * * *` (daily) | updateHealthScores | Updates org compliance health scores |

---

## File Generation

### PDF Generation (`pdfGenerator.js`)
- Uses PDFKit
- Saves to `server/reports/report_{mongoId}.pdf`
- Accessed via `/reports/report_{mongoId}.pdf`

### Excel Generation (`excelGenerator.js`)
- Uses ExcelJS
- Saves to `server/reports/report_{mongoId}.xlsx`

### CLI PDF Generation (`cli/utils/pdfBuilder.js`)
- Uses PDFKit
- Saves to `cli/output/`
- Format: `{SectorName}_{date}.pdf`

---

## Key Conventions

### Code Style
- **CommonJS modules** (`require`/`module.exports`) in server
- **ES Modules** (`import`/`export`) in client
- **No comments** in code unless explicitly requested
- **Functional components** with hooks in React
- **Async/await** for asynchronous operations

### File Naming
- **Models:** PascalCase (`User.js`, `Compliance.js`)
- **Controllers:** camelCase (`authController.js`)
- **Routes:** camelCase (`auth.js`, `compliance.js`)
- **Components:** PascalCase (`Dashboard.jsx`)
- **Utilities:** camelCase (`pdfGenerator.js`)

### API Response Format
```javascript
// Success
{ success: true, data: {...} }

// Error
{ success: false, message: "Error description" }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total } }
```

### Validation
- Joi schemas in `validators/` directory
- Applied via `validate` middleware
- Schema names: `createSchema`, `updateSchema`

### Error Handling
- Use `AppError` class for operational errors
- Global error handler in `middleware/errorHandler.js`
- Async errors caught automatically with try/catch

---

## Development Workflow

### Starting the Project
```bash
# Server
cd server
npm install
npm run dev          # Starts on port 5000

# Client
cd client
npm install
npm run dev          # Starts on port 5173
```

### CLI Usage
```bash
cd cli
npm install
node scraper.js list                    # View sectors
node scraper.js scrape --all            # All sectors
node scraper.js scrape --sector rbi     # Specific sector
```

### Testing
```bash
cd server
npm test             # Runs Jest tests
```

---

## Common Tasks

### Adding a New Model
1. Create `server/src/models/NewModel.js`
2. Add to `server/src/routes/index.js` if API needed
3. Create controller if complex logic
4. Create Joi validator in `validators/`

### Adding a New API Endpoint
1. Create route in `server/src/routes/newRoute.js`
2. Mount in `routes/index.js`
3. Create controller function
4. Add RTK Query endpoint in `client/src/store/api/api.js`

### Adding a New Page
1. Create `client/src/pages/NewPage.jsx`
2. Add route in `client/src/App.jsx`
3. Add to sidebar in `components/layout/Sidebar.jsx`
4. Add RTK Query hooks if needed

### Adding a New Scraper
1. Create `cli/scrapers/newScraper.js`
2. Export class with `scrape()` method
3. Register in `cli/scrapers/index.js`
4. Add CLI option in `cli/scraper.js`

---

## Security Notes

- **Never commit** `.env` files
- **JWT tokens** stored in HTTP-only cookies
- **Passwords** hashed with bcryptjs
- **Rate limiting:** 100 requests per 15 minutes
- **Input sanitization** via express-mongo-sanitize
- **CORS** configured for `CLIENT_URL`
- **Helmet** for HTTP security headers

---

## Troubleshooting

### MongoDB Connection
- If `MONGODB_URI` is empty, uses `mongodb-memory-server`
- Data is lost on server restart
- Set up MongoDB Atlas for persistence

### File Uploads
- Max size: 10MB (configurable via `MAX_FILE_SIZE`)
- Allowed types: pdf, doc, docx, xlsx, xls, jpg, jpeg, png, txt
- Stored in `server/uploads/` with UUID filenames

### Report Generation
- Reports saved to `server/reports/`
- Old reports not auto-cleaned
- Add cleanup cron job for production

---

## Important Files Reference

| File | Line | Purpose |
|------|------|---------|
| `server/src/app.js` | 82-91 | Server startup |
| `server/src/config/db.js` | 8 | MongoDB connection |
| `server/src/middleware/auth.js` | 30-37 | Role-based access |
| `server/src/controllers/reportController.js` | 92-102 | Report file generation |
| `server/src/services/complianceService.js` | 83-97 | Cron job definitions |
| `client/src/App.jsx` | 29-54 | Route definitions |
| `client/src/store/api/api.js` | 1-305 | All RTK Query endpoints |
| `cli/scraper.js` | 1-149 | CLI entry point |

---

## Last Updated

**Date:** July 3, 2026
**Version:** 1.0.0
**Author:** ComplyTrack India Team
