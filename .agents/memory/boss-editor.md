---
name: Boss Editor
description: CREATOR-15 — full-stack Boss Editor feature details, schema, routes, and DB push approach.
---

## Schema
- File: `lib/db/src/schema/bosses.ts`
- 20 tables: creator_bosses, creator_boss_phases, creator_boss_skills, creator_boss_patterns, creator_boss_attacks, creator_boss_weakpoints, creator_boss_enrage, creator_boss_loot, creator_boss_rewards, creator_boss_spawn_rules, creator_boss_arenas, creator_boss_cinematics, creator_boss_dialogues, creator_boss_templates, creator_boss_versions, creator_boss_history, creator_boss_statistics, creator_boss_exports, creator_boss_imports, creator_boss_runtime
- 7 enums (all prefixed `boss_*` to avoid conflicts): boss_type, boss_rarity, boss_state, boss_phase, boss_reward_type, boss_spawn_type, boss_difficulty

## DB push approach
- `drizzle-kit push` fails non-interactively when it detects new enums (prompts for rename vs create).
- Pattern used: psql `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` for enums, then `CREATE TABLE IF NOT EXISTS` for each table.

## Backend
- `artifacts/api-server/src/repositories/boss-repository.ts`
- `artifacts/api-server/src/services/boss-editor-service.ts`
- `artifacts/api-server/src/validators/boss-validator.ts`
- `artifacts/api-server/src/exporters/boss-exporter.ts`
- `artifacts/api-server/src/importers/boss-importer.ts`
- `artifacts/api-server/src/runtime/boss-runtime-bridge.ts`
- `artifacts/api-server/src/routes/bosses.ts` — 60+ endpoints at /api/bosses

## Frontend pages (16)
All under `artifacts/creator-editor/src/pages/boss/`:
- boss-dashboard, boss-browser, boss-editor-page, boss-phase-editor, boss-skill-editor
- boss-pattern-editor, boss-arena-editor, boss-loot-editor, boss-reward-editor
- boss-simulator, boss-templates, boss-history, boss-statistics
- boss-import-export, boss-validator, boss-runtime

Routes registered in App.tsx after dungeon routes.
Sidebar section "Boss Editor" added in layout.tsx before "Visual Scripting".

**Why:** Enums prefixed to avoid collisions with other modules' reward_type/spawn_type etc.
