---
name: Building Editor
description: CREATOR-17 Building Editor sprint — schema, backend, frontend, DB, routing details.
---

# Building Editor (CREATOR-17)

**Schema**: `lib/db/src/schema/buildings.ts` — 7 enums (`building_type`, `building_status`, `building_category`, `building_material`, `building_access_type`, `building_power_state`, `building_security_level`), 20 tables.

**DB**: All enums created via `DO $$ BEGIN IF NOT EXISTS ... END $$` block; all 20 tables created via individual `CREATE TABLE IF NOT EXISTS` executeSql calls.

**Backend files** (`artifacts/api-server/src/`):
- `repositories/building-repository.ts`
- `services/building-editor-service.ts`
- `services/building-validator.ts`
- `services/building-exporter.ts`
- `services/building-importer.ts`
- `services/building-runtime-bridge.ts`
- `routes/buildings.ts` — 70+ endpoints, prefix `/buildings/...` (NOT `/api/buildings/...`)

**Router registration**: `routes/index.ts` — `import buildingsRouter from "./buildings"` + `router.use(buildingsRouter)` after citiesRouter.

**Frontend pages** (`artifacts/creator-editor/src/pages/building/`): 16 pages:
- `building-dashboard.tsx`, `building-browser.tsx`, `building-editor.tsx`
- `floor-editor.tsx`, `room-editor.tsx`, `door-editor.tsx`, `window-editor.tsx`
- `furniture-editor.tsx`, `utility-editor.tsx`, `npc-manager.tsx`, `security-manager.tsx`
- `spawn-manager.tsx`, `building-simulator.tsx`, `building-history.tsx`
- `building-import-export.tsx`, `building-validator.tsx`

**Routes in App.tsx**: 16 `<Route>` entries under `{/* CREATOR-17: Building Editor */}` comment.

**Sidebar**: `layout.tsx` — "Building Editor" section between Boss Editor and City Editor, 5 items.

**Why**: Standard CREATOR sprint pattern — all prefixed enum names avoid conflicts; DO $$ blocks required because executeSql runs in separate transactions and CREATE TYPE IF NOT EXISTS failed silently in prior attempts.
