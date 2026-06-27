---
name: Item Editor
description: CREATOR-10 implementation details — schema, backend, and frontend file locations for the Item Editor sprint.
---

# Item Editor (CREATOR-10)

**Why:** Documents the architecture and integration points so future sessions can extend or modify without re-discovery.

## Schema
- File: `lib/db/src/schema/item-editor.ts`
- 6 enums: `itemTypeEnum`, `itemRarityEnum`, `itemCategoryEnum`, `itemBindingTypeEnum`, `itemStackTypeEnum`, `itemQualityEnum`
- 21 tables: `creatorItems` (master) + stats, attributes, effects, equipment_slots, crafting_recipes, components, loot_tables, drops, inventories, templates, versions, history, tags, pricing, trade_rules, usage_rules, restrictions, visuals, exports, imports
- Exported from `lib/db/src/schema/index.ts`

## Backend
- Repository: `artifacts/api-server/src/repositories/item-editor-repository.ts`
- Main service: `artifacts/api-server/src/services/item-editor-service.ts`
- Helper services: `item-validator.ts`, `item-exporter.ts`, `item-importer.ts`, `item-runtime-bridge.ts`
- Routes: `artifacts/api-server/src/routes/item-editor.ts` — prefix `/api/item-editor`
- Registered in: `artifacts/api-server/src/routes/index.ts`

## Frontend
- 16 pages under `artifacts/creator-editor/src/pages/item-*.tsx`
- Routes registered in `artifacts/creator-editor/src/App.tsx`
- Sidebar section "Item Editor" added in `artifacts/creator-editor/src/components/layout.tsx`
- Icons used: `Package`, `Zap`, `Hammer`, `Dices`, `Grid3X3`, `Coins`, `ShieldOff`, `Palette`, `Wand2`

## Integration Points
- NPC Inventory (CREATOR-08): `ownerType: "npc"` in creator_item_inventories
- Quest Rewards (CREATOR-09): items referenced by ID in quest reward system
- World Loot Spawns (CREATOR-07): creator_item_loot_tables + drops for world spawning
- Asset Pipeline (CREATOR-04): iconAssetId, modelAssetId on creator_items
- Runtime Engine (CREATOR-06): ItemRuntimeBridge for simulate/preview/test/inventory-sim
- Visual Scripting (CREATOR-05): scriptRef on effects for graph-based triggers

## How to apply
- Rarity color legend: common=gray, uncommon=green, rare=blue, epic=purple, legendary=orange, mythic=red, unique=yellow
- Crafting recipe circular dependency check: component.componentItemId === outputItemId
- Stack validation: non_stackable → maxStack must be 1; limited_stack → maxStack ≥ 2
