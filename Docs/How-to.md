# How-To: Nibe DIM Developer Guide
### Derived from: [Plan.md](./Plan.md) | [HLD.md](./HLD.md) | [LLD.md](./LLD.md)

---

## Part 1 — Project Setup (COMPLETED ✅)

### Step 1: Create the Monorepo Structure

This project follows the LLD §2.1 `packages/` monorepo pattern.

```bash
mkdir -p packages/backend/services
mkdir -p packages/backend/shared
mkdir -p packages/backend/proto
mkdir -p packages/frontend/web-dashboard
mkdir -p packages/frontend/mobile-app
mkdir -p packages/frontend/shared-components
mkdir -p packages/infrastructure/{docker,kubernetes,terraform}
```

**Current layout:**
```
nibe-dim/
├── packages/
│   ├── backend/
│   │   ├── services/       ← 10 microservices (TypeScript)
│   │   ├── shared/         ← shared utility npm package
│   │   └── proto/          ← Protocol Buffers (future)
│   ├── frontend/
│   │   ├── web-dashboard/  ← React + Vite + TypeScript
│   │   ├── mobile-app/     ← (scaffolded, future)
│   │   └── shared-components/ ← (scaffolded, future)
│   └── infrastructure/
│       ├── docker/
│       ├── kubernetes/
│       └── terraform/
├── Docs/
├── docker-compose.yml
├── Makefile
└── package.json
```

### Step 2: Initialize Root NPM Workspace

The root `package.json` manages all workspaces:

```json
{
  "name": "nibe-dim",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/backend/services/*",
    "packages/backend/shared",
    "packages/frontend/*"
  ],
  "scripts": {
    "start": "npm run start --workspaces --if-present",
    "dev":   "npm run dev   --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint":  "npm run lint  --workspaces --if-present",
    "test":  "npm run test  --workspaces --if-present"
  }
}
```

### Step 3: Scaffold Each Microservice

Each service has this standard TypeScript structure (LLD §2.2):

```
<service-name>/
├── src/
│   ├── app.ts           ← Express entry point
│   ├── controllers/     ← Route/GraphQL handlers
│   ├── services/        ← Business logic (domain layer)
│   ├── repositories/    ← Database access only
│   ├── models/          ← Mongoose/pg models
│   ├── middleware/      ← Auth, validation, error handling
│   ├── config/          ← Environment config
│   └── utils/           ← Helpers (logger, metrics)
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
├── Dockerfile
└── package.json
```

Minimum `package.json` for each service:

```json
{
  "name": "<service-name>",
  "version": "1.0.0",
  "main": "dist/app.js",
  "scripts": {
    "start": "node dist/app.js",
    "dev":   "ts-node-dev src/app.ts",
    "build": "tsc",
    "lint":  "eslint .",
    "test":  "jest --passWithNoTests"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@apollo/server": "^4.0.0",
    "@apollo/subgraph": "^2.0.0",
    "graphql": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0",
    "@types/node": "^18.0.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.13"
  }
}
```

Minimum `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### Step 4: Set Up the Shared Library

`packages/backend/shared` is an internal npm package consumed by all services.

```bash
# packages/backend/shared/package.json
{
  "name": "shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": { "build": "tsc" }
}
```

Consume it in any service — no registry needed:

```typescript
// In gateway-service/src/app.ts
import { getSharedConfig } from 'shared';
```

### Step 5: Install & Build Everything

```bash
# From project root:
npm install        # installs all workspaces + links shared/ automatically
npm run build      # compiles TypeScript in all 10 services + frontend
```

### Step 6: Start the Docker Infrastructure

Requires Docker Desktop to be running.

```bash
make start          # starts all containers in background
# or
docker-compose up -d
```

Containers started:
| Container | Port |
|---|---|
| MongoDB 6.0 | 27017 |
| Redis 7.0 | 6379 |
| TimescaleDB (pg14) | 5432 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| MQTT Mosquitto | 1883, 9001 |

### Step 7: Start All Services Locally (No Docker Required)

```bash
make local-start
# Runs: npx concurrently "npm start" "npm run dev -w packages/frontend/web-dashboard"
```

This boots:
- All 10 backend services (ports 4000–4009) from compiled `dist/app.js`
- Vite frontend dev server (port 5173)

Press `Ctrl+C` to stop cleanly.

### Step 8: Verify Connectivity

```bash
# Backend gateway health
curl http://localhost:4000/health
# Expected: {"status":"UP","service":"gateway","sharedInfo":"Hello from Shared Service TS!"}

# Frontend
open http://localhost:5173
# Expected: React page with "Backend is UP!" status banner
```

---

## Part 2 — Developer Commands Reference

| Command | What it does |
|---|---|
| `npm install` | Install all workspace deps + symlink `shared/` |
| `npm run build` | Compile TypeScript for all packages |
| `npm run test` | Run Jest across all packages |
| `npm run lint` | Run ESLint across all packages |
| `make install` | Alias for `npm install` |
| `make local-start` | Start full stack natively (no Docker) |
| `make start` | Start via Docker Compose |
| `make stop` | Stop Docker containers |
| `make docker-build` | Build all Docker images |
| `make clean` | Remove all `node_modules` |

---

## Part 3 — How To: Add a New Feature (Phase 1 Pattern)

### Adding a Database Model (e.g. Device in device-service)

```bash
# 1. Install mongoose in the workspace
npm install mongoose @types/mongoose --workspace=packages/backend/services/device-service

# 2. Create the model
touch packages/backend/services/device-service/src/models/Device.ts
```

```typescript
// src/models/Device.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  serialNumber: string;
  facilityId: string;
  type: 'sensor' | 'actuator' | 'controller';
  status: 'active' | 'inactive' | 'maintenance';
  calibration: { temperature: { offset: number; factor: number } };
  lastHeartbeat: Date;
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  deviceId:     { type: String, required: true, unique: true },
  serialNumber: { type: String, required: true, unique: true },
  facilityId:   { type: String, required: true, index: true },
  type:         { type: String, enum: ['sensor', 'actuator', 'controller'], required: true },
  status:       { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  calibration:  { temperature: { offset: { type: Number, default: 0 }, factor: { type: Number, default: 1 } } },
  lastHeartbeat: Date,
}, { timestamps: true });

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
```

### Adding a MongoDB Connection

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export const connectMongoDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nibe_dim';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
```

### Adding a GraphQL Subgraph Schema

```typescript
// src/schema.graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

type Device @key(fields: "id") {
  id: ID!
  deviceId: String!
  serialNumber: String!
  type: String!
  status: String!
}

type Query {
  device(id: ID!): Device
  devices(facilityId: ID): [Device!]!
}

type Mutation {
  registerDevice(input: DeviceInput!): Device!
  calibrateDevice(id: ID!, calibration: CalibrationInput!): Device!
}
```

### Adding a Kafka Producer/Consumer

```bash
npm install kafkajs --workspace=packages/backend/services/data-service
```

```typescript
// In data-service: src/consumer.ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'data-service-group' });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'telemetry.raw', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value!.toString());
      // process telemetry payload
    },
  });
};
```

### Adding Apollo Federation to Gateway

```typescript
// gateway-service/src/app.ts
import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'device',    url: 'http://localhost:4001/graphql' },
      { name: 'telemetry', url: 'http://localhost:4002/graphql' },
      { name: 'alerts',    url: 'http://localhost:4003/graphql' },
      { name: 'workflows', url: 'http://localhost:4004/graphql' },
      { name: 'analytics', url: 'http://localhost:4006/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });
```

### Adding a New Dependency to One Workspace

```bash
# Always scope to the specific workspace
npm install <package> --workspace=packages/backend/services/<service-name>
npm install <package> --workspace=packages/frontend/web-dashboard
```

### Adding Environment Variables

Each service should have `.env.example` (committed) and `.env` (gitignored):

```bash
# packages/backend/services/device-service/.env.example
PORT=4001
MONGODB_URI=mongodb://localhost:27017/nibe_dim
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
JWT_SECRET=changeme
NODE_ENV=development
```

---

## Part 4 — Port & Service Reference

| Service | Port | Database | Protocol |
|---|---|---|---|
| gateway-service | 4000 | — | HTTP/GraphQL |
| device-service | 4001 | MongoDB + Redis | HTTP/GraphQL |
| data-service | 4002 | TimescaleDB + Kafka | HTTP/Kafka |
| alert-service | 4003 | MongoDB + Kafka | Kafka consumer |
| workflow-service | 4004 | MongoDB + Kafka + Redis | Kafka consumer |
| control-service | 4005 | MongoDB + MQTT | Kafka + MQTT |
| analytics-service | 4006 | TimescaleDB + S3 | HTTP/GraphQL |
| audit-service | 4007 | MongoDB | Kafka consumer |
| websocket-service | 4008 | Redis | WebSocket |
| user-service | 4009 | MongoDB + Redis | HTTP/GraphQL |
| web-dashboard (Vite) | 5173 | — | HTTP |

---

## Part 5 — Troubleshooting

### IDE Background Process Crash
If you see "A shared background process terminated unexpectedly":
- Click **Restart** in the IDE notification — this is safe
- **Cause:** A `pkill -f node` command killed IDE's internal Node.js processes
- **Fix:** Always use `Ctrl+C` in the terminal to stop services

### Port Already in Use
```bash
lsof -i :<PORT>         # find process using port
kill -9 <PID>           # kill it
```

### TypeScript Build Fails
```bash
cd packages/backend/services/<service>
npx tsc --noEmit        # check errors without emitting files
```

### Shared Module Not Resolving
```bash
npm install             # re-run from root to re-link workspaces
```

### Docker Container Won't Start
```bash
docker-compose logs <service-name>   # view container logs
docker-compose down && docker-compose up -d   # restart
```
