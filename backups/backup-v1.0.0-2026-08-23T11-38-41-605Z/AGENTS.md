# AGENTS.md

## Architecture

Three packages in a monorepo:

- **`server/`** — Express + MongoDB (Mongoose) REST API. CommonJS. Entry: `src/app.js`.
- **`client/`** — React 19 + Vite + Tailwind CSS v4 SPA. ES modules. Uses RTK Query for API calls.
- **`cli/`** — Standalone Node scraper for Indian compliance laws. Separate from the app.

**Main Server** lives at `../main-server` (sibling repo, "ComplyTrack Central Update & License Server"). The complytrack server talks to it via `MAIN_SERVER_URL` (default `http://localhost:5100`):

- `POST /api/heartbeat` with `x-api-key` — sent every `MAIN_SERVER_HEARTBEAT_INTERVAL` by `server/src/services/mainServerMonitor.js`. Main server tracks `connectionStatus` per customer (online/offline) via its `src/services/connectionMonitor.js` sweep.
- `GET /api/health` — polled every `MAIN_SERVER_CHECK_INTERVAL` by the same monitor.
- `GET /api/main-server/status` (public) on the complytrack server exposes the monitor state; the client polls it and shows the "Main Server is Down" popup (`client/src/components/common/MainServerStatus.jsx`).

All API routes live under `/api` and are registered in `server/src/routes/index.js`. The client proxies `/api` to `http://localhost:5001` via Vite config (but the server defaults to port 5000).

## Commands

**Server:**
```bash
cd server && npm install
npm run dev        # nodemon, port 5000
npm start          # production
npm test           # jest (experimental VM modules, forceExit, detectOpenHandles)
```

**Client:**
```bash
cd client && npm install
npm run dev        # Vite dev server, port 5173
npm run build      # production build
npm run lint       # eslint
```

**Docker (production-like):**
```bash
docker compose up --build    # mongo:27017, server:5000, client (nginx):80
```

The server Dockerfile uses `npm ci --omit=dev` — devDependencies are excluded. The client Dockerfile builds with Vite then serves via nginx.

## Environment

- Copy `server/.env.example` to `server/.env` for local dev. Required vars: `MONGODB_URI`, `JWT_SECRET`, `EMAIL_HOST/USER/PASS`.
- `server/.env.docker` is used by docker-compose (MongoDB at `mongo:27017`).
- `server/.env` and `uploads/*`, `reports/*` are gitignored.
- `CLIENT_URL` must match the Vite dev server origin (default `http://localhost:5173`).
- Main-server connection tunables on the complytrack server: `MAIN_SERVER_URL`, `COMPLYTRACK_API_KEY`, `MAIN_SERVER_CHECK_INTERVAL`, `MAIN_SERVER_HEARTBEAT_INTERVAL`, `MAIN_SERVER_REQUEST_TIMEOUT`. On the main server: `HEARTBEAT_INTERVAL_MS`, `HEARTBEAT_TIMEOUT_MS`, `CONNECTION_SWEEP_INTERVAL_MS`.

## Key Conventions

- **Server:** CommonJS (`"type": "commonjs"`). Use `require()`/`module.exports`.
- **Client:** ES modules (`"type": "module"`). Use `import`/`export`.
- **Auth:** JWT-based. Tokens in httpOnly cookies + `Authorization: Bearer` header. Refresh token flow built into RTK Query base query.
- **Roles:** `user`, `admin`, `superadmin`, `developer`. Route guards in `App.jsx` enforce access (`ProtectedRoute`, `DeveloperRoute`, `CompanyAdminRoute`).
- **API tags:** All RTK Query endpoints use tag-based cache invalidation. Tags are listed in `client/src/store/api/api.js`.
- **Rate limiting:** Multiple rate limiters in `server/src/middleware/rateLimiters.js` applied per-route.
- **PDFs:** Generated with pdfkit. PDFs in `server/reports/` and `server/sector-pdfs/` are gitignored but mounted as Docker volumes. `generateAllPdfsOnStartup()` runs on server boot.
- **Static files:** `uploads/`, `reports/`, `notices/`, `sector-pdfs/` are served statically behind auth middleware.

## Testing

- Server tests: `cd server && npm test` (jest, currently no test files in `server/tests/`)
- Client has no test framework configured.
- There is no CI pipeline (no `.github/workflows`).

## Adding a New Feature (Backend → Frontend Pattern)

1. Add model in `server/src/models/`
2. Add routes in `server/src/routes/`
3. Register route in `server/src/routes/index.js`
4. Add RTK Query endpoints in `client/src/store/api/api.js` with tag types
5. Add page in `client/src/pages/`
6. Add route in `client/src/App.jsx` (wrap in `ProtectedRoute` if auth required)
7. Add nav entry in sidebar if needed
