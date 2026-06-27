# Universe Creator

A full-stack game development platform for building, scripting, and simulating game worlds. Universe Creator provides a suite of editors — asset management, document authoring, visual scripting, and a real-time runtime engine — all in one web application.

---

## Table of Contents

- [Overview](#overview)
- [Stack](#stack)
- [Monorepo Structure](#monorepo-structure)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Server](#api-server)
- [Creator Editor](#creator-editor)
- [Sprints](#sprints)
- [Architecture Decisions](#architecture-decisions)
- [Gotchas](#gotchas)

---

## Overview

Universe Creator is a multi-package pnpm monorepo. It consists of:

| Service | Description | Port |
|---|---|---|
| `api-server` | Express 5 REST API with PostgreSQL backend | 3000 |
| `creator-editor` | React 19 + Vite 7 web application | 5173 |

Users sign in, create projects, manage assets and documents, build visual scripts (node-based programming), and run simulations via the Runtime Engine — all without leaving the browser.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 (strict) |
| Monorepo | pnpm workspaces |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| Build | esbuild (CJS bundle) |
| Frontend | React 19, Vite 7, Wouter, TanStack Query |
| UI | Radix UI + Tailwind CSS (shadcn/ui) |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Monorepo Structure

```
universe-creator/
├── lib/
│   └── db/                         # @workspace/db — Drizzle schema + client
│       └── src/
│           └── schema/
│               ├── identity.ts     # Users, orgs, sessions
│               ├── creator.ts      # Projects, templates, plugins
│               ├── documents.ts    # Documents, folders, history
│               ├── assets.ts       # Assets, pipeline, collections
│               ├── graphs.ts       # Visual scripting — graphs, nodes, pins
│               └── runtime.ts      # Runtime engine — sessions, ECS, events
├── artifacts/
│   ├── api-server/                 # @workspace/api-server — Express REST API
│   │   └── src/
│   │       ├── middlewares/        # auth.ts (JWT requireAuth)
│   │       ├── repositories/       # DrizzleGraphRepository, DrizzleRuntimeRepository
│   │       ├── services/           # Graph compiler/runtime, RuntimeEngine, ECS
│   │       └── routes/             # One file per resource group
│   └── creator-editor/             # @workspace/creator-editor — React SPA
│       └── src/
│           ├── pages/              # ~50 page components
│           └── components/
│               ├── layout.tsx      # Sidebar + main layout
│               ├── graph/          # Visual scripting canvas components
│               └── ui/             # Radix/shadcn atomic components
└── pnpm-workspace.yaml
```

---

## Running the Project

```bash
# Install dependencies
pnpm install

# Push database schema (dev only — requires DATABASE_URL)
pnpm --filter @workspace/db run push

# Start API server (port 3000)
PORT=3000 pnpm --filter @workspace/api-server run dev

# Start Creator Editor (port 5173)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/creator-editor run dev

# Full typecheck across all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | API server port (default: 3000) |
| `BASE_PATH` | No | Vite base path for the editor (default: `/`) |

---

## Database

Drizzle ORM with PostgreSQL. All schema lives in `lib/db/src/schema/`.

### Schema files

| File | Tables | Purpose |
|---|---|---|
| `identity.ts` | users, organizations, sessions, invitations | Auth + multi-tenancy |
| `creator.ts` | projects, templates, plugins, packages | Core project entities |
| `documents.ts` | documents, folders, bookmarks, history | Document management |
| `assets.ts` | assets, pipeline jobs, collections, folders | Asset pipeline |
| `graphs.ts` | graphs, nodes, pins, connections, variables, functions, macros, … | Visual scripting (20 tables) |
| `runtime.ts` | sessions, worlds, entities, components, systems, events, logs, … | Runtime engine (20 tables) |

**Push schema changes (dev):**
```bash
pnpm --filter @workspace/db run push
```

---

## API Server

Express 5 REST API. All routes are prefixed `/api/`. Auth is enforced via `requireAuth` middleware (JWT Bearer token).

### Route groups

| Prefix | File | Description |
|---|---|---|
| `/api/auth` | `auth.ts` | Register, login, me |
| `/api/projects` | `projects.ts` | Project CRUD |
| `/api/assets` | `assets.ts` | Asset CRUD |
| `/api/pipeline` | `asset-pipeline.ts` | Asset ingestion + processing |
| `/api/documents` | `documents.ts` | Document + folder CRUD |
| `/api/graphs` | `graphs.ts` | Visual scripting CRUD + compile + execute |
| `/api/runtime` | `runtime.ts` | Runtime sessions + ECS + play mode |
| `/api/organizations` | `organizations.ts` | Org management |
| `/api/notifications` | `notifications.ts` | In-app notifications |
| `/api/dashboard` | `dashboard.ts` | Aggregate dashboard stats |
| … | … | templates, plugins, packages, activity, stars, etc. |

---

## Creator Editor

React 19 SPA with Wouter routing. Auth token stored in `localStorage` as `creator_token`, sent as `Authorization: Bearer <token>` header.

### Sidebar sections

| Section | Pages |
|---|---|
| Studio | Dashboard, Projects, Assets, Templates, Plugins, Packages |
| Visual Scripting | Visual Script Dashboard, Graph Browser, Graph Templates, Macro Library, Execution Console, Compiler, Runtime Monitor |
| Runtime | Runtime Engine, Simulation Center |
| Documents | All Documents, Folders, Bookmarks |
| Assets | Asset Pipeline, Browser, Upload Center, Collections, Asset Folders, Processing Queue |
| Identity | Profile, Organizations, Invitations |
| Feed | Activity, Notifications |

---

## Sprints

### CREATOR-01 — Identity & Projects
Core authentication (register/login/JWT), user profiles, organizations, invitations, project management, templates, plugins, packages, notifications, activity feed.

### CREATOR-02 — Documents
Full document management: rich document CRUD, folders, bookmarks, document history, full-text search.

### CREATOR-03 — Asset Pipeline
Asset ingestion and processing pipeline: upload, transcode, metadata extraction, collections, asset folders, processing queue, pipeline dashboard.

### CREATOR-04 — Asset Pipeline (Extended)
Extended asset pipeline with batch processing, asset browser with advanced filtering, asset detail view, and pipeline job management.

### CREATOR-05 — Visual Scripting Engine

**20 database tables, 6 enums** in `lib/db/src/schema/graphs.ts`

**Backend services:**
- `GraphValidator` — cycle detection, broken links, unused nodes, missing required pins
- `GraphCompiler` — topological sort → `CompiledInstruction[]` → stored in `creator_graph_compiler_cache`
- `GraphRuntime` + `ExecutionEngine` — in-memory node-by-node execution, pause/resume/stop
- `GraphService` — orchestrates all services
- 17 REST endpoints under `/api/graphs`

**Frontend:**
- `GraphEditor` — pan/zoom canvas, drag nodes, pin connections, SVG overlay, Ctrl+S save
- `NodeLibrary` — 20 built-in node types across 7 categories (Flow, Math, Variables, Events, Functions, Logic, Debug)
- `Inspector`, `MiniMap`, `Toolbar`, `ConnectionLayer`, `Pin`, `Node` components
- Pages: Visual Script Dashboard, Graph Browser, Graph Templates, Macro Library, Execution Console, Compiler Panel, Runtime Monitor

### CREATOR-06 — Runtime Engine

**20 database tables, 6 enums** in `lib/db/src/schema/runtime.ts`

**Architecture:**
```
Graph Compiler (CREATOR-05)
  ↓ CompiledInstruction[]
RuntimeEngine
  ↓ initialize / start / stop / pause / resume / step
WorldRuntime
  ├── EntityManager       spawn / destroy / transform / enable
  ├── ComponentManager    transform / renderer / collider / script / health / …
  ├── SystemManager       Physics / Animation / AI / Quest / Combat / … (11 systems)
  ├── EventDispatcher     spawn / destroy / move / collision / quest / timer / custom
  ├── TimerService        delay / interval / cooldown / countdown
  └── SimulationEngine    tick loop, FPS tracking, frame time
PlayModeService
  └── start / pause / resume / stop / step / snapshot / restore
ProfilerService + DebugService
  └── per-frame CPU/memory sampling → creator_runtime_performance
```

**Simulation modes:** `editor` · `play` · `simulation` · `debug` · `headless` · `record` · `replay`

**23 REST endpoints** under `/api/runtime`

**Frontend pages (12):**
- Runtime Dashboard — stat widgets, session list, architecture overview
- Play Mode — play toolbar, entity/system/log tabs, performance strip
- Simulation Center — mode launcher (editor/play/simulation/debug)
- Runtime Profiler — sparkline charts, system timing bars, sample table
- Runtime Logs — level + search filter, color-coded stream
- Runtime Inspector — entity hierarchy + transform inspector + component drill-down
- Entity Explorer — filterable entity table
- Component Explorer — type-grouped component table
- System Monitor — timing bars, tick counters per system
- Event Monitor — live event stream with type filter
- Debug Console — tabbed console / errors / warnings
- Snapshot Manager — create, list, restore snapshots

---

## Architecture Decisions

1. **Repository Pattern + Service Pattern** — All database access goes through `Drizzle*Repository` classes. Business logic lives in `*Service`. Routes only call services, never the DB directly.

2. **No mocks, no fake implementations** — Every feature talks to real PostgreSQL. There is no in-memory fallback.

3. **JWT stored in localStorage** — Token key is `creator_token`. The `setAuthTokenGetter` hook injects it into all generated API client calls automatically.

4. **Asset pipeline uses `/api/pipeline` prefix** — Not `/api/assets`, to avoid collision with the basic assets CRUD route registered earlier.

5. **`@workspace/db` is the only import path for the DB client** — The subpath `@workspace/db/client` is not exported. All repositories use `import { db } from "@workspace/db"`.

6. **Graph compiler is deterministic** — Topological sort produces a stable instruction order. The resulting checksum is stored in `creator_graph_compiler_cache` so unchanged graphs skip recompilation.

7. **Runtime sessions are fully isolated** — Each session owns its own `WorldRuntime` instance in memory and a complete set of rows in the `creator_runtime_*` tables. Deleting a session cascades through all child tables.

---

## Gotchas

- **Always run `pnpm --filter @workspace/db run push` after schema changes** before restarting the API server. The server will crash on missing tables if schema is not pushed first.
- **API server runs on port 3000**, not the default 5000 shown in some docs. The workflow command explicitly sets `PORT=3000`.
- **Creator Editor needs `BASE_PATH=/`** — without it, Vite serves assets from the wrong path.
- **Vite `allowedHosts: true`** is set in `vite.config.ts` — required because the preview pane is a proxied iframe from a different origin.
- **TypeScript strict mode is on everywhere.** All `any` usages in page components are intentional (API responses are untyped at the page layer — codegen covers the client layer).
