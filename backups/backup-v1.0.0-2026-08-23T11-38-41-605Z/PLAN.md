# Plan: Sector/Industry Compliance PDFs + Pre-Selection Questionnaire

## Context

The user wants two major features:

1. **Pre-generated compliance reference PDFs** for every sector/industry combination, showing all applicable compliance items with due dates, penalties, and requirements. These PDFs are served to users based on their sector/industry. Admin accounts (complytrack.dev) can see all PDFs regardless of sector/industry and can modify the PDF content before the user selects compliances.

2. **Pre-selection questionnaire** — Before users select compliances, ask them questions (turnover, employee count, business activities, etc.) to filter and provide only the most relevant compliance items for their specific situation.

## Feature 1: Sector/Industry Compliance PDFs

### What it does
- Generate a styled PDF for each sector/industry combination (3 sectors × ~17 industries each = ~49 PDFs + 3 sector-level + 1 master = ~53 PDFs)
- Each PDF shows: all common compliance items + sector-specific + industry-specific items, with full details (description, frequency, priority, penalties, due date guidance)
- PDFs are stored in `server/reports/sector-pdfs/` and served via API
- Users see only their sector/industry PDF; admins see all

### Files to Create
1. **`server/src/utils/sectorPdfGenerator.js`** — Generates a styled PDF for a given sector/industry using the same pdfkit + design language as `noticePdfGenerator.js` (colored headers, badges, tables, penalty sections)
2. **`server/src/controllers/sectorPdfController.js`** — Endpoints:
   - `GET /api/sector-pdfs` — List available PDFs (filtered by user's sector/industry, admins see all)
   - `GET /api/sector-pdfs/:sector/:industry` — View PDF inline
   - `GET /api/sector-pdfs/:sector/:industry/download` — Download PDF
   - `POST /api/sector-pdfs/generate` — Admin-only: regenerate all or specific PDFs
3. **`server/src/routes/sectorPdfs.js`** — Route definitions
4. **New model: `server/src/models/SectorPdf.js`** — Metadata record per PDF (sector, industry, filePath, generatedAt, version, isActive)

### Files to Modify
5. **`server/src/routes/index.js`** — Register `/sector-pdfs` routes
6. **`server/src/app.js`** — Add static serving for sector PDFs directory
7. **`client/src/store/api/api.js`** — Add RTK Query endpoints for sector PDFs
8. **`client/src/pages/SectorPdfs.jsx`** — New page to browse/view/download sector PDFs
9. **`client/src/App.jsx`** — Add `/sector-pdfs` route
10. **`client/src/components/layout/Sidebar.jsx`** — Add nav item (visible to all, but admin sees "Manage PDFs" variant)

### PDF Content Structure
Each sector PDF will contain TWO versions:

**Version 1: Full Reference PDF** (same for all users in a sector/industry)
- Branded header with sector/industry name and generation date
- Section 1: Common Compliance Items — All 27 common items with title, law, category, frequency, priority, description, penalties table
- Section 2: Sector-Specific Items — Items from `commonIndustries[sector]`
- Section 3: Industry-Specific Items — Items from `COMPLIANCE_DATA[sector][industry]`
- Section 4: Penalty Summary — Consolidated penalty table across all applicable items
- Section 5: Due Date Calendar — Suggested due dates by frequency (monthly, quarterly, yearly)
- Footer with disclaimer and ComplyTrack branding

**Version 2: Personalized PDF** (generated per user after questionnaire)
- Same layout as full reference but items are tagged with applicability:
  - MANDATORY badge (red) — must comply based on questionnaire answers
  - RECOMMENDED badge (amber) — good practice, suggested for profile
  - NOT APPLICABLE badge (grey) — doesn't apply based on answers
- Only shows items that are mandatory or recommended (filters out not-applicable)
- Includes user's company name, turnover bracket, and questionnaire summary at the top

### Generation Logic
- Run once on server startup (if PDFs don't exist) or on-demand via admin endpoint
- Loop through all sector/industry combinations from `complianceData.js`
- Generate PDF using `sectorPdfGenerator.js`
- Store metadata in `SectorPdf` model

---

## Feature 2: Pre-Selection Questionnaire

### What it does
- Before the compliance selection screen, present a questionnaire to the user
- Questions determine which compliance items are truly applicable (e.g., turnover > ₹40L means GST is mandatory, not optional)
- Admin can configure which questions are asked per sector/industry
- Answers are saved to the Organization model and used to filter compliance options

### Files to Create
11. **`server/src/data/questionnaireData.js`** — Question definitions per sector with conditional logic
12. **`server/src/controllers/questionnaireController.js`** — Save answers, get filtered compliance options based on answers
13. **`server/src/routes/questionnaire.js`** — Route definitions
14. **`client/src/pages/Questionnaire.jsx`** — Full-screen questionnaire UI with step-by-step questions

### Files to Modify
15. **`server/src/models/Organization.js`** — Add `turnover`, `questionnaireAnswers` fields
16. **`server/src/controllers/complianceSetupController.js`** — Modify `getComplianceOptions` to filter based on questionnaire answers
17. **`client/src/pages/ComplianceSetup.jsx`** — Add questionnaire step before compliance selection
18. **`client/src/App.jsx`** — Add `/questionnaire` route

### Questionnaire Questions (by priority)

**Common questions (all sectors):**
1. **Annual Turnover** — ₹ Below 20L / ₹ 20L–40L / ₹ 40L–1.5Cr / ₹ 1.5Cr–5Cr / ₹ 5Cr+
   - Affects: GST registration threshold, professional tax applicability, audit requirements
2. **Number of Employees** — 1-10 / 11-20 / 21-50 / 51-200 / 200+
   - Affects: PF applicability (20+ employees), ESI applicability (10+), POSH requirement, factory license, safety officer
3. **Company Type** — (from existing enum)
   - Affects: Companies Act applicability, ROC filings, annual return requirements
4. **Has Physical Office/Shop?** — Yes/No
   - Affects: Shop & Establishment Act, fire NOC, municipal trade license
5. **Imports/Exports?** — Yes/No
   - Affects: Custom Act, DGFT registrations, IEC code

**Service sector specific:**
6. **Handles Personal Data?** — Yes/No
   - Affects: DPDP Act compliance items (if added)
7. **Provides Financial Services?** — Yes/No
   - Affects: RBI Act, SEBI, FEMA compliance

**Manufacturing specific:**
8. **Uses Hazardous Materials?** — Yes/No
   - Affects: Hazardous waste, factory license, pollution board consent
9. **Production Capacity?** — Small / Medium / Large
   - Affects: Factory Act applicability, safety officer requirement

**Trading specific:**
10. **Sells Online?** — Yes/No
    - Affects: E-commerce compliance, consumer protection
11. **Handles Food Products?** — Yes/No
    - Affects: FSSAI license, food safety

### Filtering Logic
The questionnaire answers create a filter profile:
```js
{
  turnover: '40L-1.5Cr',
  employees: '21-50',
  hasPhysicalOffice: true,
  importsExports: false,
  handlesPersonalData: false,
  // etc.
}
```

This profile is used to:
1. Mark certain compliance items as "mandatory" vs "optional" vs "not applicable"
2. Adjust due dates based on turnover (e.g., tax filing deadlines differ for different turnover brackets)
3. Add or remove items that only apply at certain thresholds

---

## Implementation Order

### Phase 1: Data & Backend
1. Add `turnover` and `questionnaireAnswers` fields to Organization model
2. Create `questionnaireData.js` with questions per sector
3. Create `questionnaireController.js` with save/filter logic
4. Create `questionnaire.js` routes
5. Register questionnaire routes in `index.js`

### Phase 2: Sector PDF Generation
6. Create `SectorPdf` model
7. Create `sectorPdfGenerator.js` with styled PDF generation
8. Create `sectorPdfController.js` with CRUD + generate endpoints
9. Create `sectorPdfs.js` routes
10. Register routes, add static serving

### Phase 3: Frontend — Questionnaire
11. Create `Questionnaire.jsx` page
12. Add route and nav item
13. Modify `ComplianceSetup.jsx` to check if questionnaire is completed before showing selection

### Phase 4: Frontend — Sector PDFs
14. Add RTK Query endpoints
15. Create `SectorPdfs.jsx` page
16. Add route and nav item
17. Admin controls for regeneration

### Phase 5: Integration & Testing
18. Modify `getComplianceOptions` to use questionnaire answers for filtering
19. Auto-generate PDFs on first server startup
20. Docker rebuild and full verification

---

## Key Decisions (Confirmed)

1. **PDF scope**: Both versions — generate a full reference PDF (all items) AND a personalized filtered PDF per user based on questionnaire answers
2. **Admin editing**: Regenerate only — admins can regenerate PDFs from current compliance data, no inline editing
3. **PDF access**: Require authentication (all PDFs behind auth middleware)
4. **Questionnaire mandatory**: Mandatory for all users — must complete before seeing compliance selection
5. **Questionnaire impact**: Filter + highlight — show all items but highlight mandatory ones based on answers
