---
name: NPC Editor (CREATOR-08)
description: Architecture and gotchas for the NPC Editor sprint — schema, backend, frontend wiring, and TanStack Query v5 fix.
---

## Schema
- File: `lib/db/src/schema/npc-editor.ts`
- 7 enums: `npc_type`, `npc_state`, `npc_behavior`, `npc_dialogue_type`, `npc_relation`, `npc_spawn_mode`, `npc_animation_state`
- 20 tables covering npcs, attributes/stats, behaviors, dialogue/nodes/choices, schedules, inventory, equipment, skills, spawn points, patrol paths/waypoints, relations, factions, history
- Exported from `lib/db/src/schema/index.ts`

## Backend
- Repository: `artifacts/api-server/src/repositories/npc-editor-repository.ts`
- Service: `artifacts/api-server/src/services/npc-editor-service.ts` (assertOwner access control)
- Supporting services: npc-serializer, npc-validator, npc-exporter, npc-importer, npc-runtime-bridge
- Routes: `artifacts/api-server/src/routes/npc-editor.ts` — 55+ endpoints under `/api/npc-editor/*`
- Mounted in `artifacts/api-server/src/routes/index.ts` via `router.use(npcEditorRouter)`

## Frontend
- 18 pages in `artifacts/creator-editor/src/pages/npc-*.tsx`
- All 18 routes added to `artifacts/creator-editor/src/App.tsx`
- Sidebar "NPC Editor" section added to `artifacts/creator-editor/src/components/layout.tsx` with 5 top-level nav links

## Critical Fix — TanStack Query v5
**Rule:** `onSuccess` callback is **removed** from `useQuery` options in TanStack Query v5 (project uses ^5.90.21). Using it causes a TypeScript error and the callback is silently ignored at runtime.

**How to apply:** Replace `onSuccess` in `useQuery` with a `useEffect` that watches `data`:
```tsx
const { data } = useQuery({ queryKey: [...], queryFn: ... });
useEffect(() => {
  if (data) { /* populate form state */ }
}, [data]);
```
`onSuccess` on `useMutation` is still valid in v5.

**Why:** Fixed in `npc-editor-page.tsx` where `onSuccess` in `useQuery` was used to pre-populate form state on load.
