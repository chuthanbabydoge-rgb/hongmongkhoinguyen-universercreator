---
name: Asset Pipeline prefix
description: CREATOR-04 asset pipeline route prefix decision to avoid conflicts with CREATOR-01
---

All CREATOR-04 asset pipeline endpoints use `/api/pipeline` prefix, NOT `/api/assets`.

**Why:** CREATOR-01 already occupies GET/POST/DELETE `/api/assets` and `/api/assets/:id`. CREATOR-04 spec called for `/api/assets/*` but that would require rewriting CREATOR-01 which is explicitly forbidden. Using `/api/pipeline` avoids all conflicts.

**How to apply:** Any future editor (World Editor, NPC Editor, etc.) that reads assets from the pipeline should call `/api/pipeline` endpoints, not `/api/assets`. The old `/api/assets` endpoints (CREATOR-01) are still used by legacy parts of the app.

Main table: `creator_pipeline_assets` (not `creator_assets`)
Frontend routes: `/asset-pipeline`, `/asset-browser`, `/asset-detail/:id`, `/asset-collections`, `/asset-folders`, `/upload-center`, `/processing-queue`
