# Project Tracker — Nibe DIM
### Single Source of Truth: [Plan.md](./Plan.md) | [HLD.md](./HLD.md) | [LLD.md](./LLD.md)

---

## ✅ PHASE 0 — Foundation & Infrastructure Setup: COMPLETE & VERIFIED
> **Live test result: 10/10 services healthy** — verified 2026-05-12  
> **CI pipeline: build + lint + test green** — verified 2026-05-12  
> Run `npm run start:backend` then `curl http://localhost:400X/health` to confirm.

### Monorepo & Workspace
- [x] Root `package.json` with NPM Workspaces (`packages/backend/services/*`, `packages/backend/shared`, `packages/frontend/*`)
- [x] LLD §2.1 compliant `packages/` directory tree created
- [x] `Makefile` with `install`, `local-start`, `start`, `stop`, `build`, `test`, `lint`, `clean`
- [x] `docker-compose.yml` at project root linking all services and infra containers

### Backend Services Scaffold (10 services)
- [x] `gateway-service` — Port 4000 — TypeScript + Apollo Federation Gateway
- [x] `device-service` — Port 4001 — TypeScript scaffold
- [x] `data-service` — Port 4002 — TypeScript scaffold (telemetry)
- [x] `alert-service` — Port 4003 — TypeScript scaffold
- [x] `workflow-service` — Port 4004 — TypeScript scaffold (rule engine)
- [x] `control-service` — Port 4005 — TypeScript scaffold
- [x] `analytics-service` — Port 4006 — TypeScript scaffold
- [x] `audit-service` — Port 4007 — TypeScript scaffold
- [x] `websocket-service` — Port 4008 — TypeScript scaffold
- [x] `user-service` — Port 4009 — TypeScript scaffold

### TypeScript & Build Pipeline
- [x] TypeScript 5 with `tsconfig.json` per service
- [x] `npm run build` compiles all 10 services + frontend with zero errors
- [x] `@apollo/server`, `@apollo/gateway`, `@apollo/subgraph`, `graphql` injected per service
- [x] `@types/node`, `@types/express`, `@types/cors` installed across all services
- [x] ESLint + Prettier + Jest config per service
- [x] `.eslintignore` per service — excludes `dist/`, `node_modules/`, `coverage/` from linting
- [x] `ts-node-dev` for hot-reload development per service
- [x] `concurrently` installed at root — `npm run start:backend` boots all 10 services in parallel

### Shared Library (`packages/backend/shared`)
- [x] NPM Workspace package `shared` registered
- [x] `getSharedConfig()` utility exported from `src/index.ts`
- [x] Consumed successfully by `gateway-service` via `import { getSharedConfig } from 'shared'`
- [x] Compiled to `dist/` with type declarations

### Service Architecture (per service)
- [x] Layered directory structure: `controllers/`, `services/`, `repositories/`, `models/`, `middleware/`, `config/`, `utils/`
- [x] `GET /health` endpoint on all services
- [x] CORS middleware enabled

### Frontend Scaffold
- [x] React 18 + TypeScript + Vite 8 in `packages/frontend/web-dashboard/`
- [x] Frontend fetches `http://localhost:4000/health` on mount — verified ✅
- [x] `packages/frontend/mobile-app/` and `packages/frontend/shared-components/` directories created

### Docker & Infrastructure
- [x] `Dockerfile` per service (multi-stage builds)
- [x] `.dockerignore` per service
- [x] `docker-compose.yml` service contexts updated to `packages/` paths
- [x] Infrastructure containers in `docker-compose.yml`:
  - [x] MongoDB 6.0 (port 27017)
  - [x] Redis 7.0 Alpine (port 6379)
  - [x] TimescaleDB / PostgreSQL 14 (port 5432)
  - [x] Apache Kafka + Zookeeper — Confluent 7.4.0 (ports 9092, 2181)
  - [x] Eclipse Mosquitto MQTT Broker (ports 1883, 9001)

### GitHub & CI/CD
- [x] `.gitignore` — comprehensive, excludes `node_modules/`, `dist/`, `.env`, `coverage/`, logs, OS files
- [x] `.github/workflows/ci.yml` — GitHub Actions CI: build (shared-first) + test + lint on push/PR
- [x] `.github/ISSUE_TEMPLATE/bug_report.md` — structured bug report template
- [x] `.github/ISSUE_TEMPLATE/feature_request.md` — feature request template with service checklist
- [x] `.github/PULL_REQUEST_TEMPLATE.md` — PR template with type, services, and pre-merge checklist
- [x] `.env.example` per service (all 10 backend + frontend) — committed, `.env` gitignored
- [x] Pushed to `v1_develop` branch on GitHub — PR #1 opened

### Documentation
- [x] `README.md` — Professional project overview
- [x] `Docs/HLD.md` — Architecture, SLOs, data flows (v2.0)
- [x] `Docs/LLD.md` — GraphQL schema, DB schema, service code structure (v2.0)
- [x] `Docs/Plan.md` — Full system plan with DDD, phases, scale projections
- [x] `Docs/How-to.md` — Developer setup and onboarding guide
- [x] `Docs/ProjectTracker.md` — This file
- [x] `Docs/ErrorLogs.md` — Resolved issues log (6 entries)

---

## 🚧 PHASE 1 — Core Domain Logic: NEXT

### 1A — GraphQL Federation (gateway-service)
- [ ] Define federation supergraph schema (`supergraph.graphql`)
- [ ] JWT validation plugin (`src/plugins/auth.ts`)
- [ ] Rate limiting plugin — Redis-backed, 100 req/min/user (`src/plugins/rateLimit.ts`)
- [ ] Query depth limiter — max 7 (`src/security/depthLimit.ts`)
- [ ] Query cost analysis plugin (`src/plugins/costLimit.ts`)
- [ ] Service discovery for subgraph endpoints (`src/services/serviceDiscovery.ts`)
- [ ] Health check for all subgraphs (`src/services/healthCheck.ts`)

### 1B — Device Service (`device-service`)
- [ ] MongoDB connection singleton (`src/config/database.ts`)
- [ ] Mongoose model: `Device` (with all fields per Plan §10 collection spec)
- [ ] Mongoose model: `Facility` / `Site` / `Zone`
- [ ] Repository layer: `DeviceRepository` (save, findById, findByFacility, update, delete)
- [ ] Service layer: `DeviceService` (createDevice, calibrateDevice, updateStatus)
- [ ] GraphQL subgraph schema (`schema.graphql`) — Device, Facility, Zone types
- [ ] Resolvers: `Query.device`, `Query.devices`, `Mutation.registerDevice`, `Mutation.calibrateDevice`
- [ ] `__resolveReference` federation resolver
- [ ] Redis cache layer (`src/cache/deviceCache.ts`) — 5 min TTL
- [ ] Kafka event publisher (`src/events/publisher.ts`) — `device.created`, `device.calibrated`
- [ ] REST endpoint: `GET /api/v1/devices/:id`, `POST /api/v1/devices`
- [ ] Input validation middleware (Zod/Joi)
- [ ] Unit tests: `DeviceService`, `DeviceRepository`
- [ ] Integration tests: MongoDB, GraphQL resolvers

### 1C — Data Service (`data-service`) — Telemetry Ingestion
- [ ] TimescaleDB connection via pg-promise (`src/config/timescale.ts`)
- [ ] Create `telemetry_raw` hypertable migration (`migrations/001_init.sql`)
- [ ] Continuous aggregates migration (`migrations/003_continuous_aggregates.sql`)
- [ ] Kafka consumer — `telemetry.raw` topic (`src/consumer.ts`)
- [ ] Telemetry validator — JSON Schema + range checks (`src/ingestion/validator.ts`)
- [ ] Unit transformer — Celsius, relative humidity conversion (`src/ingestion/transformer.ts`)
- [ ] Redis deduplicator — 5 min sliding window (`src/ingestion/deduplicator.ts`)
- [ ] Quality scorer — 0–1 completeness/freshness score (`src/ingestion/qualityScorer.ts`)
- [ ] Batch writer — COPY protocol for bulk inserts (`src/timescale/batchWriter.ts`)
- [ ] REST fallback: `POST /api/v1/telemetry/batch`
- [ ] GraphQL subgraph schema — `TelemetryPoint`, `TelemetryResult`, `deviceTelemetry` query
- [ ] Redis device metadata cache (`src/cache/deviceMetadata.ts`) — 5 min TTL
- [ ] Unit tests: validator, transformer, deduplicator
- [ ] Performance test: write storm at 5,000 QPS

### 1D — Alert Service (`alert-service`)
- [ ] MongoDB models: `Alert`, `AlertRule` (per LLD §3.1 schema)
- [ ] Kafka consumer — `alert.triggered` topic (`src/consumer.ts`)
- [ ] Email notifier — SendGrid/AWS SES (`src/notifiers/EmailNotifier.ts`)
- [ ] SMS notifier — Twilio (`src/notifiers/SMSNotifier.ts`)
- [ ] Slack notifier — Webhook (`src/notifiers/SlackNotifier.ts`)
- [ ] Webhook notifier — Generic HTTP (`src/notifiers/WebhookNotifier.ts`)
- [ ] Deduplication — Redis debounce, 5 min window (`src/deduplication/debouncer.ts`)
- [ ] Cooldown — Redis TTL per device+rule (`src/deduplication/rateLimiter.ts`)
- [ ] Escalation engine — 15 min re-notify, escalate to manager (`src/escalation/EscalationPolicy.ts`)
- [ ] Alert repository: CRUD + acknowledgment tracking
- [ ] GraphQL resolvers: `activeAlerts`, `alerts`, `acknowledgeAlert`, `resolveAlert`
- [ ] Handlebars email/SMS templates
- [ ] Unit tests: notifiers, escalation, deduplication

### 1E — Workflow Service (`workflow-service`) — Rule Engine
- [ ] MongoDB models: `ControlRule`, `ControlAction`
- [ ] Kafka consumer — `telemetry.raw` topic
- [ ] JSONata condition evaluator (`src/engine/ConditionEvaluator.ts`)
- [ ] Rule loader from MongoDB (`src/loader/ruleLoader.ts`)
- [ ] Redis rule cache — 10 min TTL (`src/loader/ruleCache.ts`)
- [ ] Cooldown manager — Redis SETEX (`src/engine/CooldownManager.ts`)
- [ ] Priority queue for rule evaluation (`src/engine/PriorityQueue.ts`)
- [ ] Kafka producer — `control.triggered`, `alert.triggered` topics
- [ ] GraphQL resolvers: `workflows`, `createWorkflow`, `executeWorkflow`
- [ ] Unit tests: ConditionEvaluator, CooldownManager, RuleEngine

### 1F — Control Service (`control-service`)
- [ ] MongoDB model: `ControlAction` (idempotency, retry tracking)
- [ ] Kafka consumer — `control.triggered` topic
- [ ] MQTT dispatcher — Mosquitto publish (`src/dispatcher/MQTTDispatcher.ts`)
- [ ] HTTP dispatcher — REST API devices (`src/dispatcher/HTTPDispatcher.ts`)
- [ ] Idempotency store — Redis SETNX (`src/idempotency/IdempotencyStore.ts`)
- [ ] Retry policy — exponential backoff, max 3 retries (`src/retry/RetryPolicy.ts`)
- [ ] Dead letter handler — failed commands → alert
- [ ] Per-device circuit breaker (`src/circuitbreaker/DeviceBreaker.ts`)
- [ ] Kafka producer — `control.executed` topic
- [ ] Unit tests: MQTTDispatcher, IdempotencyStore, DeviceBreaker

### 1G — WebSocket Service (`websocket-service`)
- [ ] Socket.io server setup — 10K concurrent connections (`src/server.ts`)
- [ ] Redis adapter for horizontal scaling (`src/adapters/redisAdapter.ts`)
- [ ] JWT socket authentication middleware (`src/auth/socketAuth.ts`)
- [ ] Room manager — join/leave by facility/device (`src/rooms/roomManager.ts`)
- [ ] Kafka consumer — `control.executed`, `alert.triggered` topics
- [ ] Broadcast layer — push events to subscribed rooms
- [ ] Backpressure — per-client send buffer, 100 msg/s limit
- [ ] GraphQL Subscriptions: `telemetryStream`, `alertStream`, `deviceStatusStream`
- [ ] Load test: 10,000 concurrent connections

### 1H — User Service (`user-service`)
- [ ] MongoDB model: `User`, `Organization`, `APIKey`
- [ ] JWT issuance + validation (RS256)
- [ ] Refresh token rotation
- [ ] OAuth2 / Auth0 integration
- [ ] RBAC roles: SUPER_ADMIN, ORG_ADMIN, SITE_MANAGER, ENGINEER, VIEWER
- [ ] GraphQL resolvers: `me`, `inviteUser`, `updateUserRole`, `createAPIKey`
- [ ] Password hashing (bcrypt)
- [ ] MFA support (TOTP)
- [ ] Redis token blacklist (logout/revoke)

### 1I — Shared Library Expansion (`packages/backend/shared`)
- [ ] Kafka client singleton — KafkaJS (`src/kafka/client.ts`)
- [ ] Kafka producer/consumer wrappers + topic constants (`src/kafka/producer.ts`, `consumer.ts`)
- [ ] Redis client singleton — ioredis cluster (`src/redis/client.ts`)
- [ ] Redis distributed lock — Redlock (`src/redis/lock.ts`)
- [ ] MongoDB connection helper — Mongoose (`src/mongodb/client.ts`)
- [ ] TimescaleDB connection helper — pg-promise (`src/timescale/client.ts`)
- [ ] Structured logger — Winston (`src/logging/logger.ts`)
- [ ] Domain error classes (`src/errors/DomainError.ts`, `InfrastructureError.ts`)
- [ ] OpenTelemetry tracer provider (`src/tracing/opentelemetry.ts`)
- [ ] Prometheus metrics client (`src/metrics/prometheus.ts`)
- [ ] Convict config loader (`src/config/index.ts`)
- [ ] Common validators: email, deviceId, UUIDs (`src/utils/validation.ts`)
- [ ] ID generators: UUID v4, Snowflake (`src/utils/idGenerator.ts`)

### 1J — Frontend Dashboard (`web-dashboard`)
- [ ] Apollo Client setup (replace raw `fetch`)
- [ ] Auth context — login/logout, JWT storage, RBAC guards
- [ ] Login page
- [ ] Dashboard layout — sidebar, topbar, breadcrumbs
- [ ] Real-time telemetry chart — Recharts line/area chart
- [ ] Device list page with filter/sort/pagination
- [ ] Device detail page — live readings, calibration, status
- [ ] Alert list page — severity filter, acknowledge action
- [ ] Alert rule builder UI
- [ ] WebSocket subscription integration (`telemetryStream`)
- [ ] Redux Toolkit store setup
- [ ] React Router v6 routing

### 1K — Protocol Buffers (`packages/backend/proto`)
- [ ] `telemetry.proto` — `Telemetry`, `Metric`, `DeviceStatus` messages
- [ ] `device.proto` — `Device`, `Facility`, `Zone` messages
- [ ] `control.proto` — `ControlCommand`, `CommandResult` messages
- [ ] `protoc` compilation to TypeScript (via `ts-proto` or `google-protobuf`)
- [ ] Integrate Protobuf encoding in `data-service` MQTT consumer

---

## 📋 PHASE 2 — Analytics, Reporting & Observability: PLANNED

### Analytics Service
- [ ] TimescaleDB continuous aggregates: 5-min, 1-hr, 1-day
- [ ] Hourly/daily/monthly aggregators
- [ ] PDF compliance report generator — Puppeteer
- [ ] CSV/Excel exporter — streamed to S3
- [ ] S3 presigned URL for download
- [ ] GraphQL resolvers: `timeseries`, `dashboardMetrics`, `complianceReport`
- [ ] ML anomaly detection — Python sidecar (Prophet/ARIMA)
- [ ] Redis aggregate cache — 1 hr TTL

### Audit Service
- [ ] Write-once MongoDB collection (no updates, no deletes)
- [ ] Blockchain-style hash chain for tamper detection
- [ ] Kafka consumer — `audit.log` topic
- [ ] S3 archive after 30 days (Object Lock)
- [ ] AES-256-GCM encryption for sensitive fields
- [ ] GraphQL resolvers: `auditLogs`, `complianceReport`

### Observability
- [ ] Prometheus `/metrics` endpoint per service
- [ ] Grafana dashboards (ingestion rate, alert volume, latency histograms)
- [ ] OpenTelemetry distributed tracing — spans across gateway → services
- [ ] Centralized structured logging (ELK / Datadog)
- [ ] Alert: consumer lag > 10s (Kafka)
- [ ] Alert: p95 latency > 500ms (dashboard)

---

## 🏭 PHASE 3 — Production Hardening: PLANNED

### Security
- [ ] mTLS between all internal services (Linkerd/Istio service mesh)
- [ ] GraphQL query depth limit (max 7), alias limit (max 10)
- [ ] Persisted query whitelist (Apollo Safelisting)
- [ ] Helmet.js security headers (CSP, HSTS, XSS)
- [ ] Rate limiting at ALB edge (AWS WAF rules)
- [ ] Secrets management — HashiCorp Vault / AWS Secrets Manager
- [ ] `.env.example` files per service

### Infrastructure & CI/CD
- [ ] GitHub Actions CI pipeline — lint + test + build on PR
- [ ] Docker image push to AWS ECR
- [ ] Kubernetes manifests (Deployments, Services, HPA, PDB) — `packages/infrastructure/kubernetes/`
- [ ] Terraform modules for VPC, EKS, RDS, ElastiCache — `packages/infrastructure/terraform/`
- [ ] Multi-AZ database replication (MongoDB replica set, TimescaleDB standby)
- [ ] Kafka 3-broker cluster with replication factor 3
- [ ] Blue/Green deployment strategy
- [ ] Rollback procedure documented

### Performance
- [ ] k6 load test: 15,000 QPS telemetry ingestion
- [ ] k6 load test: 10,000 WebSocket connections
- [ ] TimescaleDB query tuning + index analysis
- [ ] Redis cluster (3 primary + 3 replica) configuration
- [ ] Kafka partition tuning per topic

---

## 🔮 PHASE 4 — Future Features: BACKLOG

- [ ] React Native mobile app (`packages/frontend/mobile-app`)
- [ ] Shared UI component library (`packages/frontend/shared-components`)
- [ ] Predictive maintenance ML pipeline (Post-MVP)
- [ ] OTA firmware update orchestration
- [ ] Modbus TCP protocol support (industrial devices)
- [ ] Multi-region active-active deployment (DR)
- [ ] Webhook delivery service (3rd party integrations)
- [ ] Public API documentation (Swagger / Apollo Studio)
- [ ] Feature flags (LaunchDarkly / custom)
- [ ] Multi-tenancy billing and subscription management
