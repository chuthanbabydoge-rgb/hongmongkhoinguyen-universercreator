---
name: Creator project workflows
description: Required env vars and workflow commands for Universe Creator monorepo services
---

API Server requires `PORT` env var. Workflow command:
`PORT=3000 pnpm --filter @workspace/api-server run dev`

Creator Editor requires both `PORT` and `BASE_PATH` env vars. Workflow command:
`PORT=5173 BASE_PATH=/ pnpm --filter @workspace/creator-editor run dev`

**Why:** The vite.config.ts and index.ts both throw hard errors if these env vars are missing. BASE_PATH is used as Vite's `base` option for path-based routing.

**How to apply:** Always set both env vars when configuring or restarting these workflows. Use configureWorkflow() via code_execution.

Schema location: `lib/db/src/schema/` — creator.ts, identity.ts, documents.ts
DB push: `pnpm --filter @workspace/db run push-force`
