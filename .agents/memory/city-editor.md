---
name: City Editor
description: CREATOR-16 City Editor sprint — schema, backend, frontend, DB provisioning notes.
---

## Schema
- File: `lib/db/src/schema/cities.ts`
- 20 tables, 7 enums: `city_type`, `city_status`, `district_type`, `zone_type`, `road_type`, `utility_type`, `city_service`
- Main table: `creator_cities` — was missing from DB, created manually via SQL
- Other 19 tables (`creator_city_buildings`, `creator_city_districts`, etc.) already existed in DB from prior session

## Backend
- Repository: `artifacts/api-server/src/repositories/city-repository.ts`
- Service: `artifacts/api-server/src/services/city-editor-service.ts`
- Validator: `artifacts/api-server/src/services/city-validator.ts`
- Exporter: `artifacts/api-server/src/services/city-exporter.ts`
- Importer: `artifacts/api-server/src/services/city-importer.ts`
- Runtime bridge: `artifacts/api-server/src/services/city-runtime-bridge.ts`
- Routes: `artifacts/api-server/src/routes/cities.ts` — 87 handlers

## Route prefix fix
Routes must use `/cities/...` NOT `/api/cities/...`.
See `express-route-prefix.md` for the general rule.

## Frontend (16 pages)
All in `artifacts/creator-editor/src/pages/city/`:
- city-dashboard, city-browser, city-editor, city-templates, city-settings
- city-district-editor, city-zone-editor, city-building-manager
- city-road-manager, city-utility-manager, city-transport-manager
- city-population-manager, city-service-manager, city-spawn-manager
- city-statistics, city-validator, city-import-export, city-simulator

Sidebar: `artifacts/creator-editor/src/components/layout.tsx` lines ~225-236
Routes: `artifacts/creator-editor/src/App.tsx`
