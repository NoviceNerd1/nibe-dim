# Error Logs

## 1. Directory Structure Mixed Up (Resolved)
**Issue:** The `services` directory was placed in the root directory alongside `frontend`, making the workspace structure confusing and mixing backend code directly in the root context.
**Resolution:** Moved `services` to a dedicated `backend/` folder (`backend/services`). Updated root `package.json` workspaces to include `"backend/services/*"` and `"frontend"`. Updated NPM scripts to use the corrected `--workspace` flags. Both frontend and backend applications now start concurrently through `npm start`.

## 2. Frontend to Backend Connectivity (Resolved)
**Issue:** Frontend Vite application on port 5173 could not communicate natively with Backend gateway on port 4000 due to Cross-Origin Resource Sharing (CORS) blocks.
**Resolution:** Installed `cors` inside the `gateway` microservice, attached it as a global middleware `app.use(cors())`, and implemented a `fetch()` call on the React frontend to prove end-to-end communication is working.

## 3. IDE Background Process Termination (Resolved)
**Issue:** Received IDE notification: "A shared background process terminated unexpectedly. Please restart the application to recover."
**Root Cause:** During automated testing, the command `pkill -f node` was used to forcefully stop the backend services running in the background. Because editors like VSCode and Cursor use Node.js internally for Extension Hosts and Language Servers (TypeScript/ESLint), this global kill command inadvertently terminated the IDE's core background services.
**Resolution:** Modified `Makefile`'s `local-start` command to run in the foreground using `npx concurrently` instead of relying on background execution with trailing `&` and requiring a dangerous `pkill` cleanup. You should just click "Restart" on the IDE prompt to recover safely.

## 4. Architectural Drift from LLD (Resolved)
**Issue:** The initial backend microservices were scaffolded in vanilla JavaScript with simple directories, and the project root did not follow the `packages/` monorepo design mandated by the Low-Level Design (LLD).
**Resolution:** Restructured the entire root directory into `packages/backend/services/`, `packages/frontend/web-dashboard/`, and `packages/infrastructure/`. Converted all 10 microservices to strict TypeScript (`src/app.ts`), generated `tsconfig.json`, physically created the `controllers/`, `services/`, `models/`, and `repositories/` directory hierarchy, and injected `@apollo/server` dependencies to align flawlessly with the HLD/LLD single source of truth.

## 5. Stale Service Names + Sequential Start Bug (Resolved)
**Issue 1:** `data-service`, `gateway-service`, and `workflow-service` had stale `package.json` `name` fields (`telemetry-service`, `gateway`, `rule-engine-service`) left over from the rename. Their `/health` responses also returned the old service names.
**Issue 2:** `npm start --workspaces --if-present` executes workspaces **sequentially**, meaning only one service was live at a time. This caused all health checks except one to fail.
**Issue 3:** `user-service` directory existed but had no `package.json`, `src/app.ts`, or `tsconfig.json` — it was empty.
**Resolution:**
- Fixed all three `package.json` names and corrected service name strings in `src/app.ts` health responses.
- Scaffolded `user-service` with full TypeScript structure identical to other services (port 4009).
- Installed `concurrently` as a root devDependency and rewrote `package.json` scripts: `start:backend` now boots all 10 services simultaneously using `concurrently`. `make local-start` delegates to `npm start`.
- **Final live verification: 10/10 services returned `{"status":"UP"}` simultaneously.**
