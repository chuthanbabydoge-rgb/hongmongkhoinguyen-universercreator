# Universe Creator

Nền tảng phát triển game toàn diện — cho phép creator xây dựng, quản lý và mô phỏng mọi thành phần của một Universe game: thế giới, NPC, nhiệm vụ, vật phẩm, kỹ năng, chiến đấu, thú cưng, hầm ngục, trùm, tòa nhà, giao thông, đất đai, thành phố, và nhiều hơn nữa.

## Run & Operate

```bash
# Khởi động API Server (port 3000)
PORT=3000 pnpm --filter @workspace/api-server run dev

# Khởi động Creator Editor UI (port 5000)
PORT=5000 BASE_PATH=/ API_PORT=3000 pnpm --filter @workspace/creator-editor run dev

# Typecheck toàn bộ workspace
pnpm run typecheck

# Build toàn bộ packages
pnpm run build

# Regenerate API hooks & Zod schemas từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema (dev only — dùng psql trực tiếp nếu có enum conflict)
pnpm --filter @workspace/db run push
```

**Required env:**
- `DATABASE_URL` — PostgreSQL connection string (Replit built-in DB)
- `JWT_SECRET` — JWT signing secret

## Stack

- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9
- **API:** Express 5 (port 3000), esbuild bundle
- **DB:** PostgreSQL + Drizzle ORM, 352+ tables, 100+ enums
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **Frontend:** React 18, Vite 7, Wouter (routing), TanStack Query v5, shadcn/ui, Tailwind CSS
- **API codegen:** Orval (OpenAPI → hooks + Zod)
- **Auth:** JWT (localStorage `creator_token`)

## Where things live

```
artifacts/
  api-server/src/
    routes/           — Express routers (one file per domain)
    repositories/     — Drizzle ORM queries
    services/         — Business logic
    validators/       — Domain validators
    exporters/        — Export to JSON/Template/Package
    importers/        — Import from payload
    runtime/          — Runtime bridge / simulation

  creator-editor/src/
    pages/            — 200+ React pages organized by domain
    components/       — Shared UI components
    components/layout.tsx  — Sidebar navigation (source of truth)
    App.tsx           — All routes registered here

lib/db/src/
  schema/             — Drizzle ORM schema files (source of truth for DB)
  schema/index.ts     — Re-exports all schemas
```

**Schema files (21 files):**
`identity`, `creator`, `assets`, `documents`, `graphs`, `runtime`, `world-editor`, `world-system`, `npc-editor`, `quest-editor`, `item-editor`, `skills`, `combat`, `pets`, `dungeons`, `bosses`, `cities`, `buildings`, `land-editor`, `transportation`, `index`

## Product — Editor Modules

| Sprint | Module | Tables | Endpoints |
|--------|--------|--------|-----------|
| CREATOR-01 | Core / Auth / Assets | ~20 | ~30 |
| CREATOR-04 | Asset Pipeline | — | ~20 |
| CREATOR-05 | Visual Scripting | 20 | ~40 |
| CREATOR-06 | Runtime Engine | 20 | ~40 |
| CREATOR-07 | World Editor | 20 | ~50 |
| CREATOR-08 | NPC Editor | 20 | ~60 |
| CREATOR-09 | Quest Editor | 20 | ~60 |
| CREATOR-10 | Item Editor | 21 | ~60 |
| CREATOR-11 | Skill Editor | 20 | ~60 |
| CREATOR-12 | Combat Editor | 20 | ~60 |
| CREATOR-13 | Dungeon Editor | 20 | ~60 |
| CREATOR-14 | Pet Editor | 20 | ~60 |
| CREATOR-15 | Boss Editor | 20 | ~60 |
| CREATOR-16 | City Editor | 20 | ~60 |
| CREATOR-17 | Building Editor | 20 | ~75 |
| CREATOR-18 | Land Editor | 20 | ~75 |
| CREATOR-19 | Transportation Editor | 20 | ~75 |

**Sidebar sections:** Studio · World Editor · NPC Editor · Quest Editor · Item Editor · Skill Editor · Combat Editor · Pet Editor · Dungeon Editor · Boss Editor · Building Editor · Transportation Editor · Land Editor · City Editor · Visual Scripting · Runtime · Documents · Assets · Identity · Feed

## Architecture decisions

- **Sub-router prefix rule:** All route files use `/resource/...` paths — never `/api/resource/...`. Express mounts at `app.use("/api", router)`, which strips the prefix. Violating this causes 404s.
- **Enum naming:** Enums shared across modules must have unique names. When a new module needs an enum name already taken, prefix it with the module name (e.g., `road_type` → `transport_road_type`, `utility_type` → `land_utility_type`).
- **DB schema push:** `drizzle-kit push` fails when an enum already exists with different values. Workaround: create enums manually via `psql DO $$ IF NOT EXISTS` blocks first, then create tables with `CREATE TABLE IF NOT EXISTS`.
- **TanStack Query v5:** `useQuery` `onSuccess` callback removed — use `useEffect` watching the query data instead.
- **Toast imports:** Always `import { useToast } from "@/hooks/use-toast"` — not from `@/components/ui/use-toast`.
- **Repository imports:** Always import `db` from `"@workspace/db"` — not `"@workspace/db/client"`.

## Gotchas

- Khi thêm enum mới, kiểm tra `pg_type` trước: `SELECT typname FROM pg_type WHERE typname = 'your_enum';`
- `drizzle-kit push` timeout thường xuyên với schema lớn — dùng psql trực tiếp.
- Duplicate import trong `App.tsx` gây lỗi build Vite (`Identifier 'X' has already been declared`) — đặt alias khi cần (`import X as Y`).
- API Server bundle ~3.6mb — bình thường, esbuild warn nhưng không fail.
- Vite dev server phải `allowedHosts: true` để hoạt động trong Replit iframe proxy.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- Xem `.agents/memory/MEMORY.md` để tra cứu chi tiết từng sprint (schema files, route prefixes, enum conflicts, v.v.)
- Xem `artifacts/creator-editor/src/components/layout.tsx` để biết toàn bộ sidebar navigation
- Xem `artifacts/api-server/src/routes/index.ts` để biết toàn bộ router đã đăng ký
- Xem `lib/db/src/schema/index.ts` để biết toàn bộ schema đã export
