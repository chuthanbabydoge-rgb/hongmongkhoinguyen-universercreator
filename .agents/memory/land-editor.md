---
name: Land Editor
description: CREATOR-18 Land Editor — schema, backend, frontend pages, enum conflict notes
---

## Schema
- File: `lib/db/src/schema/land-editor.ts`
- 20 tables: creator_lands, creator_land_parcels, creator_land_boundaries, creator_land_owners, creator_land_zones, creator_land_terrain, creator_land_utilities, creator_land_roads, creator_land_teleports, creator_land_buildings, creator_land_bookmarks, creator_land_templates, creator_land_versions, creator_land_history, creator_land_statistics, creator_land_exports, creator_land_imports, creator_land_runtime, creator_land_permissions, creator_land_marketplace
- 7 enums: land_type, land_status, land_zone, ownership_type, terrain_type, land_utility_type, land_access_type

## Enum Conflict
- `utility_type` was already owned by the city editor (different values). Renamed to `land_utility_type` in both the Drizzle schema and the psql CREATE TYPE call. Column also uses `land_utility_type` as column name.

## Backend
- Repository: `artifacts/api-server/src/repositories/land-repository.ts`
- Service: `artifacts/api-server/src/services/land-editor-service.ts`
- Validator: `artifacts/api-server/src/validators/land-validator.ts`
- Exporter: `artifacts/api-server/src/exporters/land-exporter.ts`
- Importer: `artifacts/api-server/src/importers/land-importer.ts`
- Runtime bridge: `artifacts/api-server/src/runtime/land-runtime-bridge.ts`
- Routes: `artifacts/api-server/src/routes/lands.ts` (~75 endpoints, prefix /lands/...)
- Registered in: `artifacts/api-server/src/routes/index.ts` as `router.use(landsRouter)`

## Frontend (16 pages)
All under `artifacts/creator-editor/src/pages/land/`:
/land-dashboard, /land-browser, /land-editor/:id, /land-templates, /land-simulator, /land-validator/:id, /land-import-export/:id, /parcel-editor/:id, /zone-editor/:id, /terrain-editor/:id, /road-network/:id, /teleport-manager/:id, /land-history/:id, /land-statistics/:id, /land-runtime/:id, /land-marketplace

## Sidebar
Added "Land Editor" section in layout.tsx between Building Editor and City Editor sections. Uses MapPin, Globe, Play, ShieldAlert, Download icons.

## Why
- `utility_type` enum conflict: when same enum name used by two editors with different values, Drizzle/psql rejects it. Prefix conflict enums with the module name (e.g., `land_utility_type`).
