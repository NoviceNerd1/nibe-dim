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

## 6. GitHub Actions CI Build Failures — TS2307 + ESLint dist/ (Resolved)
**Issue 1 — TS2307 `Cannot find module 'shared'`:**
`gateway-service/src/app.ts` imports from the `shared` workspace package. On a fresh CI checkout, `npm run build --workspaces --if-present` runs alphabetically (`alert → ... → gateway → shared`). This means `gateway-service` compiled *before* `shared` had generated `dist/index.d.ts`, causing TypeScript error TS2307.

**Issue 2 — `paths` + `rootDir` conflict:**
The initial suggested fix was to add `"paths": { "shared": ["../../shared/src"] }` to the gateway `tsconfig.json`. This caused a secondary error: TS6059 "File is not under rootDir". TypeScript attempted to compile `shared/src/index.ts` as part of gateway's build scope, violating the `rootDir: ./src` boundary. This also caused a compiled `index.js` to be emitted into `packages/backend/shared/src/` instead of `dist/`.

**Issue 3 — ESLint linting `dist/` output:**
No `.eslintignore` existed in any service, so ESLint scanned compiled `dist/app.js` files and emitted `no-console` warnings, polluting CI lint output.

**Resolution:**
1. **CI build order fixed** (`.github/workflows/ci.yml`): Added a dedicated `Build shared library` step (`npm run build --workspace=packages/backend/shared`) explicitly before the `Build all packages` step. This guarantees `shared/dist/index.d.ts` exists before any consuming service compiles.
2. **`gateway-service/tsconfig.json` reverted**: Removed `paths` and kept clean `rootDir: ./src` + `outDir: ./dist`. Build order fix makes `paths` unnecessary.
3. **`.eslintignore` added to all 11 packages**: Each service and `shared` now has `dist/`, `node_modules/`, `coverage/` excluded from ESLint scanning.
4. **`/* eslint-disable no-console */`** added to all `src/app.ts` entry files — intentional scaffold logging is suppressed at the source level.
5. **Full local CI simulation verified clean**: `npm run build --workspace=packages/backend/shared && npm run build --workspaces --if-present` exits with code 0, all 10 services and frontend compile without errors.

