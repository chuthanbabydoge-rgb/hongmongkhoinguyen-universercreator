---
name: Express route prefix rule
description: Sub-routers registered under app.use("/api", router) must NOT include /api in their route paths.
---

## Rule
All route handler paths in sub-routers must NOT include the `/api` prefix.

**Correct:** `router.get("/cities/dashboard", ...)` → matches `/api/cities/dashboard`
**Wrong:** `router.get("/api/cities/dashboard", ...)` → requires `/api/api/cities/dashboard`

## Why
`app.use("/api", mainRouter)` strips the `/api` prefix before the router processes the request.
`mainRouter.use(subRouter)` (no path) does not strip anything further.
So sub-routers see `req.url = "/cities/dashboard"` for a request to `/api/cities/dashboard`.

## How to apply
- Every new router file should define paths without the `/api` prefix
- e.g., `router.get("/cities/:id", ...)`, `router.post("/cities", ...)`
- The Vite dev proxy forwards `/api/*` → `http://localhost:3000/api/*` correctly; the API server handles the stripping
- Frontend pages use `fetch(\`\${BASE}/api/cities/...\`)` which is correct — Vite proxies `/api/...` to the server

## Evidence
- `auth.ts` uses `/auth/register`, `/auth/login` — works correctly (200/400)
- `invitations.ts` uses `/invitations` — works correctly (returns 401 when unauthenticated)
- `cities.ts` was broken with `/api/cities/...` paths → fixed to `/cities/...` → now returns 401 (found, requires auth) instead of 404
