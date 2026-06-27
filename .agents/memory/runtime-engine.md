---
name: Runtime Engine
description: CREATOR-06 — runtime engine schema, ECS backend, services, and frontend pages.
---

# Runtime Engine (CREATOR-06)

## DB Schema — lib/db/src/schema/runtime.ts
6 enums: runtime_state, runtime_mode, runtime_event_type, runtime_log_level, runtime_component_type, runtime_resource_state
20 tables: creator_runtime_sessions, creator_runtime_worlds, creator_runtime_entities, creator_runtime_components, creator_runtime_systems, creator_runtime_events, creator_runtime_logs, creator_runtime_resources, creator_runtime_snapshots, creator_runtime_checkpoints, creator_runtime_performance, creator_runtime_scheduler, creator_runtime_jobs, creator_runtime_timers, creator_runtime_variables, creator_runtime_memory, creator_runtime_debug, creator_runtime_errors, creator_runtime_history, creator_runtime_profiles

## Backend — artifacts/api-server/src/
- repositories/runtime-repository.ts — DrizzleRuntimeRepository
- services/runtime-engine.ts — RuntimeEngine, WorldRuntime, EntityManager, ComponentManager, SystemManager, EventDispatcher, TimerService, DebugService, ProfilerService, SimulationEngine, PlayModeService, Scheduler
- services/runtime-service.ts — RuntimeService (orchestrates engine + repo)
- routes/runtime.ts — 23 endpoints registered in routes/index.ts

**Why:** Repositories import db from "@workspace/db" (not "@workspace/db/client") — the subpath is not exported.

## REST API — /api/runtime
GET / POST / GET /dashboard / GET /:id / DELETE /:id
POST /:id/start|stop|pause|resume|restart|step|snapshot|restore
GET /:id/logs|performance|entities|components|systems|events|jobs|timers|history

## Frontend — artifacts/creator-editor/src/pages/
- runtime-dashboard.tsx — stat widgets, session list, architecture overview, /runtime
- runtime-play.tsx — play toolbar (play/pause/resume/stop/step/snapshot), entity/system/log tabs, /runtime-play/:id
- simulation-center.tsx — mode launcher (editor/play/simulation/debug), session manager, /simulation-center
- runtime-profiler.tsx — sparklines, system timings, sample table, /runtime-profiler/:id
- runtime-logs.tsx — filterable log viewer (level + search), /runtime-logs/:id
- runtime-inspector.tsx — entity hierarchy + component inspector with transforms, /runtime-inspector/:id
- entity-explorer.tsx — filterable entity table with layer filter, /entity-explorer/:id
- component-explorer.tsx — component table grouped by type with color coding, /component-explorer/:id
- system-monitor.tsx — system list with timing bars and tick counters, /system-monitor/:id
- event-monitor.tsx — event stream table with type filter, /event-monitor/:id
- debug-console.tsx — tabbed console/errors/warnings view, /debug-console/:id
- snapshot-manager.tsx — create/restore snapshots, checkpoint concept cards, /runtime-snapshots/:id

Sidebar: "Runtime" section added above Documents with "Runtime Engine" and "Simulation" links.
