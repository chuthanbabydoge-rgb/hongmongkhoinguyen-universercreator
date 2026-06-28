---
name: Transportation Editor
description: CREATOR-19 Transportation Editor — schema, backend, frontend pages, enum conflict notes
---

## Schema
- File: `lib/db/src/schema/transportation.ts`
- 20 tables: creator_transport_networks, creator_transport_roads, creator_transport_intersections, creator_transport_routes, creator_transport_stations, creator_transport_vehicles, creator_transport_parking, creator_transport_signals, creator_transport_bridges, creator_transport_tunnels, creator_transport_ports, creator_transport_airports, creator_transport_railways, creator_transport_checkpoints, creator_transport_templates, creator_transport_versions, creator_transport_history, creator_transport_statistics, creator_transport_runtime, creator_transport_exports
- 8 enums: transport_type, transport_road_type, vehicle_type, transport_status, traffic_signal_state, station_type, route_type, transport_access_type

## Enum Conflict
- `road_type` was already owned by cities.ts (lib/db/src/schema/cities.ts). Renamed to `transport_road_type` in both Drizzle schema and psql CREATE TYPE. Column uses `transport_road_type` as column name.

## Backend
- Repository: `artifacts/api-server/src/repositories/transportation-repository.ts`
- Service: `artifacts/api-server/src/services/transportation-editor-service.ts`
- Validator: `artifacts/api-server/src/validators/transportation-validator.ts`
- Exporter: `artifacts/api-server/src/exporters/transportation-exporter.ts`
- Importer: `artifacts/api-server/src/importers/transportation-importer.ts`
- Runtime bridge: `artifacts/api-server/src/runtime/transportation-runtime-bridge.ts`
- Routes: `artifacts/api-server/src/routes/transportation.ts` (~75 endpoints, prefix /transportation/...)
- Registered in: `artifacts/api-server/src/routes/index.ts` as `router.use(transportationRouter)`

## Frontend (16 pages)
All under `artifacts/creator-editor/src/pages/transportation/`:
/transport-dashboard, /transport-browser, /transport-editor/:id, /road-editor/:id, /route-editor/:id, /station-editor/:id, /vehicle-manager/:id, /traffic-signal-editor/:id, /railway-editor/:id, /airport-editor/:id, /port-editor/:id, /parking-manager/:id, /transport-simulator/:id, /transport-history/:id, /transport-import-export/:id, /transport-validator/:id

## Sidebar
Added "Transportation Editor" section in layout.tsx between Building Editor and Land Editor sections. Uses Navigation, Globe, Play, ShieldAlert, Download icons.

## Why
- `road_type` enum conflict: cities.ts already owns road_type with different values. Always prefix transport-specific enums with `transport_` to avoid collision.
