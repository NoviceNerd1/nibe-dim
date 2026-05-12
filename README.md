# Nibe DIM — Digital Infrastructure Monitor

> **Enterprise-grade real-time environmental monitoring platform** for industrial facilities, cold storage, clean rooms, and smart buildings. Monitors 50,000+ sensors with sub-200ms latency, automated control loops, and compliance reporting.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Microservices](#microservices)
- [Infrastructure](#infrastructure)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [API Reference](#api-reference)
- [Port Reference](#port-reference)
- [Development Workflow](#development-workflow)
- [Documentation](#documentation)
- [Project Status](#project-status)

---

## Overview

Nibe DIM is built to solve real-world industrial monitoring at scale:

| Capability | Target |
|---|---|
| Active Devices | 50,000+ sensors |
| Data Ingestion | 5,000 QPS avg, 15,000 QPS peak |
| Dashboard Latency | < 200ms (p95) |
| Alert Notification | < 5 seconds |
| WebSocket Connections | 10,000 concurrent |
| Uptime SLA | 99.95% |

**Primary Use Cases:**
- Industrial manufacturing (temperature, humidity, air quality)
- Cold storage & pharmaceutical (regulatory compliance: ISO 14644-1, FDA, GMP)
- Data center thermal monitoring
- Smart building HVAC control
- Greenhouse climate automation

---

## Architecture

This project follows a **Microservices + GraphQL Federation** pattern deployed as a **NPM Workspaces Monorepo**.

```
Internet
    │
    ▼
CloudFront CDN + AWS WAF
    │
    ▼
Application Load Balancer (SSL termination)
    │
    ├──▶ GraphQL Gateway (Apollo Federation)
    │         │
    │         ├──▶ Device Service        (MongoDB)
    │         ├──▶ Data Service          (TimescaleDB + Kafka)
    │         ├──▶ Alert Service         (MongoDB + RabbitMQ)
    │         └──▶ Workflow Service      (MongoDB + RabbitMQ)
    │
    └──▶ WebSocket Service (Socket.io)
              │
              └──▶ Redis Pub/Sub
```

**Data Flow:**
```
IoT Sensor ─MQTT→ MQTT Broker ─→ Data Service ─Kafka→ Workflow Service ─→ Alert Service
                                      │                      │
                                 TimescaleDB           Control Service ─MQTT→ Actuator
```

---

## Technology Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20 LTS + TypeScript 5 | Type-safe microservices |
| API | GraphQL (Apollo Federation v4) | Unified query layer |
| Framework | Express.js 4.18 | HTTP server |
| Real-time | Socket.io 4.6 | WebSocket connections |
| Job Queue | BullMQ | Redis-backed async jobs |

### Databases
| Database | Version | Role |
|---|---|---|
| MongoDB | 6.0 | Device registry, alerts, workflows, users |
| TimescaleDB | PostgreSQL 14 | Time-series sensor telemetry |
| Redis | 7.2 | Cache, sessions, rate limiting, pub/sub |
| InfluxDB | 2.7 | Time-series aggregates |

### Messaging
| Technology | Role |
|---|---|
| RabbitMQ | Async task queue, event bus, dead-letter handling |
| Apache Kafka | High-throughput telemetry stream (15K QPS) |
| MQTT (Mosquitto) | IoT device communication protocol |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.2 | Web Dashboard UI |
| TypeScript | 5.0 | Type safety |
| Vite | 8.x | Build tooling & HMR |
| Apollo Client | 3.8 | GraphQL client with caching |
| React Query | 4.36 | Server state management |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker Compose | Local multi-container development |
| AWS ECS Fargate | Production orchestration |
| Terraform | Infrastructure as Code |
| GitHub Actions | CI/CD pipeline |
| Prometheus + Grafana | Metrics & dashboards |
| OpenTelemetry | Distributed tracing |

---

## Repository Structure

```
nibe-dim/
├── packages/
│   ├── backend/
│   │   ├── services/
│   │   │   ├── gateway-service/        # GraphQL Federation Gateway (Port 4000)
│   │   │   ├── device-service/         # Device registry & lifecycle  (Port 4001)
│   │   │   ├── data-service/           # Telemetry ingestion & queries (Port 4002)
│   │   │   ├── alert-service/          # Alert rules & notifications   (Port 4003)
│   │   │   ├── workflow-service/       # Rule engine & automation      (Port 4004)
│   │   │   ├── control-service/        # Device command dispatch       (Port 4005)
│   │   │   ├── analytics-service/      # Aggregations & reports        (Port 4006)
│   │   │   ├── audit-service/          # Audit log & compliance        (Port 4007)
│   │   │   ├── websocket-service/      # Real-time WebSocket server    (Port 4008)
│   │   │   └── user-service/           # Auth, JWT, RBAC               (Port 4009)
│   │   ├── shared/                     # Shared utilities & types (npm workspace)
│   │   └── proto/                      # Protocol Buffers (gRPC + IoT binary)
│   ├── frontend/
│   │   ├── web-dashboard/              # React + Vite web app (Port 5173)
│   │   ├── mobile-app/                 # React Native (planned)
│   │   └── shared-components/          # UI component library (planned)
│   └── infrastructure/
│       ├── docker/                     # Dockerfile templates
│       ├── kubernetes/                 # K8s manifests (EKS)
│       └── terraform/                  # AWS IaC
├── Docs/
│   ├── HLD.md                          # High-Level Design
│   ├── LLD.md                          # Low-Level Design
│   ├── Plan.md                         # Full system plan & phase breakdown
│   ├── How-to.md                       # Developer setup guide
│   ├── ProjectTracker.md               # Sprint progress tracker
│   └── ErrorLogs.md                    # Resolved issues log
├── docker-compose.yml                  # Full local infrastructure stack
├── Makefile                            # Developer commands
└── package.json                        # Root NPM Workspace config
```

### Each Microservice Contains:
```
<service-name>/
├── src/
│   ├── app.ts               # Express entry point
│   ├── controllers/         # Route handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Database access layer
│   ├── models/              # Data models / Mongoose schemas
│   ├── middleware/          # Auth, validation, error handling
│   ├── config/              # Environment configuration
│   └── utils/               # Helpers (logger, metrics)
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
├── Dockerfile
└── package.json
```

---

## Microservices

| Service | Port | Database | Key Responsibilities |
|---|---|---|---|
| **gateway-service** | 4000 | — | Apollo Federation Gateway, JWT auth, rate limiting |
| **device-service** | 4001 | MongoDB + Redis | Device registry, provisioning, calibration, OTA firmware |
| **data-service** | 4002 | TimescaleDB + Kafka | Telemetry ingestion, validation, time-series queries |
| **alert-service** | 4003 | MongoDB + RabbitMQ | Alert rules, threshold evaluation, notification dispatch |
| **workflow-service** | 4004 | MongoDB + Kafka | Rule engine, JSONata evaluation, control triggering |
| **control-service** | 4005 | MongoDB + MQTT | Device command dispatch, idempotency, retry |
| **analytics-service** | 4006 | TimescaleDB + S3 | Aggregations, compliance reports, PDF/CSV export |
| **audit-service** | 4007 | MongoDB | Write-once audit log, event sourcing |
| **websocket-service** | 4008 | Redis | 10K concurrent WebSocket connections, real-time push |
| **user-service** | 4009 | MongoDB + Redis | JWT, OAuth2 (Auth0), RBAC, multi-tenancy |

---

## Infrastructure

The `docker-compose.yml` spins up the full local infrastructure stack:

| Container | Image | Port | Purpose |
|---|---|---|---|
| mongodb | mongo:6.0 | 27017 | Document store |
| redis | redis:7.0-alpine | 6379 | Cache & pub/sub |
| timescaledb | timescale/timescaledb:latest-pg14 | 5432 | Time-series DB |
| kafka | confluentinc/cp-kafka:7.4.0 | 9092 | Event streaming |
| zookeeper | confluentinc/cp-zookeeper:7.4.0 | 2181 | Kafka coordination |
| mqtt-broker | eclipse-mosquitto:2.0 | 1883, 9001 | IoT messaging |

---

## Getting Started

### Prerequisites
- Node.js 20 LTS
- npm 9+
- Docker Desktop (for infrastructure containers)

### 1. Clone & Install
```bash
git clone <repo-url>
cd nibe-dim
npm install
```

### 2. Build All Services
```bash
npm run build
```

### 3. Start Infrastructure (requires Docker)
```bash
make start
# or
docker-compose up -d
```

### 4. Start All Services (native, no Docker)
```bash
make local-start
```

This concurrently starts all backend microservices and the Vite frontend dev server.

### 5. Verify
```bash
curl http://localhost:4000/health
# Expected: {"status":"UP","service":"gateway","sharedInfo":"Hello from Shared Service TS!"}
```

Frontend: [http://localhost:5173](http://localhost:5173)

---

## Available Commands

| Command | Description |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm run build` | Compile TypeScript across all packages |
| `npm run lint` | Run ESLint across all packages |
| `npm run test` | Run Jest tests across all packages |
| `make install` | Alias for `npm install` |
| `make local-start` | Start full stack natively (no Docker) |
| `make start` | Start full stack via Docker Compose |
| `make stop` | Stop Docker containers |
| `make docker-build` | Build all Docker images |
| `make test` | Run all tests |
| `make lint` | Run all linters |
| `make clean` | Remove all `node_modules` |

---

## API Reference

### GraphQL Gateway
- **Endpoint:** `http://localhost:4000/graphql`
- **Protocol:** HTTP POST / WebSocket (subscriptions)
- **Auth:** `Authorization: Bearer <JWT>`

### Health Endpoints
Every microservice exposes `GET /health` returning:
```json
{ "status": "UP", "service": "<service-name>" }
```

### REST Fallback (Telemetry)
- `POST /api/v1/telemetry/batch` — Bulk telemetry ingest

---

## Port Reference

| Service | Port |
|---|---|
| GraphQL Gateway | 4000 |
| Device Service | 4001 |
| Data Service | 4002 |
| Alert Service | 4003 |
| Workflow Service | 4004 |
| Control Service | 4005 |
| Analytics Service | 4006 |
| Audit Service | 4007 |
| WebSocket Service | 4008 |
| User Service | 4009 |
| Web Dashboard (Vite) | 5173 |
| MongoDB | 27017 |
| Redis | 6379 |
| TimescaleDB | 5432 |
| Kafka | 9092 |
| MQTT | 1883 |

---

## Development Workflow

### Working on a Single Service
```bash
# Build just one service
cd packages/backend/services/device-service
npm run build

# Run with hot-reload
npm run dev
```

### Using the Shared Library
```typescript
// In any microservice
import { getSharedConfig } from 'shared';
// npm workspaces resolves this locally — no registry needed
```

### Adding a New Dependency
```bash
# Add to a specific workspace
npm install mongoose --workspace=packages/backend/services/device-service
```

### Environment Variables
Each service reads from `.env` at runtime. Copy the template:
```bash
cp packages/backend/services/device-service/.env.example packages/backend/services/device-service/.env
```

---

## Documentation

All design and planning documents live in `Docs/`:

| File | Description |
|---|---|
| [Plan.md](./Docs/Plan.md) | Full system plan, phases, DDD event storming, scale projections |
| [HLD.md](./Docs/HLD.md) | High-Level Design — architecture diagrams, data flows, SLOs |
| [LLD.md](./Docs/LLD.md) | Low-Level Design — GraphQL schemas, DB schemas, service code structure |
| [How-to.md](./Docs/How-to.md) | Step-by-step developer setup guide |
| [ProjectTracker.md](./Docs/ProjectTracker.md) | Sprint progress, completed milestones, next steps |
| [ErrorLogs.md](./Docs/ErrorLogs.md) | Resolved bugs and architectural decisions log |

---

## Project Status

**Phase 0 — Foundation: ✅ Complete**

| Milestone | Status |
|---|---|
| NPM Workspace monorepo (`packages/`) | ✅ Done |
| TypeScript across all 10 microservices | ✅ Done |
| `tsconfig.json` + build pipeline per service | ✅ Done |
| Apollo Federation dependencies injected | ✅ Done |
| Service layered directories (`controllers/`, `services/`, `repositories/`) | ✅ Done |
| Shared utility library (`packages/backend/shared`) | ✅ Done |
| Docker Compose with full infra stack | ✅ Done |
| Dockerfiles for all services | ✅ Done |
| CORS + Frontend-Backend connectivity verified | ✅ Done |
| `/health` endpoints on all services | ✅ Done |
| ESLint + Prettier + Jest config per service | ✅ Done |
| Makefile orchestration | ✅ Done |

**Phase 1 — Core Domain Logic: 🚧 Next**

| Milestone | Status |
|---|---|
| GraphQL Federation schema per service | ⬜ Pending |
| MongoDB connection + Mongoose models (device-service) | ⬜ Pending |
| TimescaleDB connection + hypertable (data-service) | ⬜ Pending |
| Kafka consumer/producer (workflow-service) | ⬜ Pending |
| MQTT broker integration (control-service) | ⬜ Pending |
| JWT auth middleware (gateway-service + user-service) | ⬜ Pending |
| Alert rule engine (alert-service) | ⬜ Pending |
| React dashboard UI (web-dashboard) | ⬜ Pending |
| WebSocket real-time telemetry (websocket-service) | ⬜ Pending |

---

*Architecture governed by [HLD v2.0](./Docs/HLD.md) and [LLD v2.0](./Docs/LLD.md) — treat as single source of truth.*
