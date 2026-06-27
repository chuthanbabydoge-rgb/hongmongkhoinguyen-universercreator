---
name: Quest Editor
description: CREATOR-09 implementation details — schema, backend, and frontend file locations for the Quest Editor sprint.
---

# Quest Editor (CREATOR-09)

**Why:** Documents the architecture and integration points so future sessions can extend or modify without re-discovery.

## Schema
- File: `lib/db/src/schema/quest-editor.ts`
- 8 enums: `questTypeEnum`, `questStatusEnum`, `questObjectiveTypeEnum`, `rewardTypeEnum`, `conditionTypeEnum`, `questBranchTypeEnum`, `questDialogueTypeEnum`
- 20 tables: `creatorQuests` (master) + steps, objectives, conditions, rewards, dialogues, npcs, regions, events, scripts, variables, flags, branches, checkpoints, history, versions, templates, statistics, exports, imports
- Exported from `lib/db/src/schema/index.ts`

## Backend
- Repository: `artifacts/api-server/src/repositories/quest-editor-repository.ts` (class `DrizzleQuestEditorRepository`)
- Main service: `artifacts/api-server/src/services/quest-editor-service.ts`
- Helper services: `quest-validator.ts`, `quest-exporter.ts`, `quest-importer.ts`, `quest-runtime-bridge.ts`
- Routes: `artifacts/api-server/src/routes/quest-editor.ts` — prefix `/api/quest-editor`
- Registered in: `artifacts/api-server/src/routes/index.ts`

## Frontend
- 16 pages under `artifacts/creator-editor/src/pages/quest-*.tsx`
- Routes registered in `artifacts/creator-editor/src/App.tsx`
- Sidebar section "Quest Editor" added in `artifacts/creator-editor/src/components/layout.tsx`
- New icons used: `Scroll`, `CheckSquare`, `ShieldAlert` from lucide-react

## How to apply
- When adding sub-resources to quests, follow the same repository → service → route → page pattern
- Validator runs 5 error checks (missing objectives, duplicates, broken steps/dialogues, circular branches, invalid conditions) and 4 warnings (no reward, description, icon, thumbnail)
- Runtime bridge provides: previewQuest, runQuest, simulateQuest, testQuest, resetQuest
