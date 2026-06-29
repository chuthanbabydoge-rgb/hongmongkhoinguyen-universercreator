<div align="center">

# 🌌 Universe Creator

![Version](https://img.shields.io/badge/phiên_bản-6.0.0-6366f1?style=for-the-badge&logo=rocket)
![Node](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Nền tảng phát triển game toàn diện — quản lý tài nguyên, soạn thảo tài liệu, lập trình trực quan và mô phỏng thời gian thực, tất cả trong một ứng dụng web.**

</div>

---

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [⚙️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [🗂️ Cấu trúc Monorepo](#️-cấu-trúc-monorepo)
- [🚀 Khởi chạy dự án](#-khởi-chạy-dự-án)
- [🔐 Biến môi trường](#-biến-môi-trường)
- [🗄️ Cơ sở dữ liệu](#️-cơ-sở-dữ-liệu)
- [🌐 API Server](#-api-server)
- [🖥️ Creator Editor](#️-creator-editor)
- [🏃 Các Sprint](#-các-sprint)
- [🏛️ Quyết định kiến trúc](#️-quyết-định-kiến-trúc)
- [⚠️ Lưu ý quan trọng](#️-lưu-ý-quan-trọng)

---

## 🎯 Tổng quan

Universe Creator là một **pnpm monorepo đa gói**. Hệ thống gồm hai dịch vụ chính:

| 🟢 Dịch vụ | 📝 Mô tả | 🔌 Cổng |
|---|---|:---:|
| `api-server` | REST API Express 5 với backend PostgreSQL | **3000** |
| `creator-editor` | Ứng dụng web React 19 + Vite 7 | **5173** |

Người dùng có thể đăng nhập, tạo dự án, quản lý tài nguyên và tài liệu, xây dựng kịch bản trực quan (lập trình dạng nút), và chạy mô phỏng qua Runtime Engine — tất cả ngay trên trình duyệt.

---

## ⚙️ Công nghệ sử dụng

| 🏷️ Tầng | 🔧 Công nghệ |
|---|---|
| 🟩 Runtime | Node.js 24 |
| 🔵 Ngôn ngữ | TypeScript 5.9 (strict) |
| 📦 Monorepo | pnpm workspaces |
| 🚂 API | Express 5 |
| 🗄️ Cơ sở dữ liệu | PostgreSQL + Drizzle ORM |
| ✅ Xác thực dữ liệu | Zod v4, drizzle-zod |
| 🏗️ Build | esbuild (CJS bundle) |
| ⚛️ Frontend | React 19, Vite 7, Wouter, TanStack Query |
| 🎨 Giao diện | Radix UI + Tailwind CSS (shadcn/ui) |
| 🔑 Xác thực | JWT (jsonwebtoken + bcryptjs) |

---

## 🗂️ Cấu trúc Monorepo

```
universe-creator/
│
├── 📁 lib/
│   └── 📁 db/                          # @workspace/db — Schema + client Drizzle
│       └── src/schema/
│           ├── 🔐 identity.ts          # Người dùng, tổ chức, phiên
│           ├── 🏗️  creator.ts          # Dự án, mẫu, plugin
│           ├── 📄 documents.ts         # Tài liệu, thư mục, lịch sử
│           ├── 🖼️  assets.ts           # Tài nguyên, pipeline, bộ sưu tập
│           ├── 🔀 graphs.ts            # Visual scripting — đồ thị, nút, chân
│           └── ⚡ runtime.ts           # Runtime engine — phiên, ECS, sự kiện
│
└── 📁 artifacts/
    ├── 📁 api-server/                  # @workspace/api-server — Express REST API
    │   └── src/
    │       ├── 🛡️  middlewares/        # auth.ts (JWT requireAuth)
    │       ├── 🗃️  repositories/       # DrizzleGraphRepository, DrizzleRuntimeRepository
    │       ├── ⚙️  services/           # Graph compiler/runtime, RuntimeEngine, ECS
    │       └── 🌐 routes/              # Một file cho mỗi nhóm tài nguyên
    │
    └── 📁 creator-editor/              # @workspace/creator-editor — React SPA
        └── src/
            ├── 📄 pages/               # ~50 trang (page components)
            └── 🧩 components/
                ├── layout.tsx          # Sidebar + layout chính
                ├── graph/              # Components canvas visual scripting
                └── ui/                 # Components nguyên tử Radix/shadcn
```

---

## 🚀 Khởi chạy dự án

```bash
# 📦 Cài đặt dependencies
pnpm install

# 🗄️ Đẩy schema lên database (chỉ dùng khi dev — cần DATABASE_URL)
pnpm --filter @workspace/db run push

# 🌐 Khởi động API server (cổng 3000)
PORT=3000 pnpm --filter @workspace/api-server run dev

# 🖥️ Khởi động Creator Editor (cổng 5173)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/creator-editor run dev

# 🔍 Kiểm tra kiểu dữ liệu toàn bộ packages
pnpm run typecheck

# 🏗️ Build tất cả packages
pnpm run build

# 🔄 Tái tạo API hooks từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

> **💡 Thứ tự khởi động:** Luôn chạy `db run push` trước, sau đó mới khởi động `api-server`.

---

## 🔐 Biến môi trường

| 🏷️ Biến | 🔴 Bắt buộc | 📝 Mô tả |
|---|:---:|---|
| `DATABASE_URL` | ✅ Có | Chuỗi kết nối PostgreSQL |
| `PORT` | ❌ Không | Cổng API server (mặc định: `3000`) |
| `BASE_PATH` | ❌ Không | Base path Vite cho editor (mặc định: `/`) |

---

## 🗄️ Cơ sở dữ liệu

Drizzle ORM với PostgreSQL. Toàn bộ schema nằm trong `lib/db/src/schema/`.

### 📊 Các file Schema

| 📄 File | 📋 Bảng chính | 🎯 Mục đích |
|---|---|---|
| `identity.ts` | users, organizations, sessions, invitations | Xác thực + đa thuê bao |
| `creator.ts` | projects, templates, plugins, packages | Thực thể dự án cốt lõi |
| `documents.ts` | documents, folders, bookmarks, history | Quản lý tài liệu |
| `assets.ts` | assets, pipeline jobs, collections, folders | Pipeline tài nguyên |
| `graphs.ts` | graphs, nodes, pins, connections, variables… | Visual scripting **(20 bảng)** |
| `runtime.ts` | sessions, worlds, entities, components, systems… | Runtime engine **(20 bảng)** |

```bash
# 🔄 Đẩy thay đổi schema (chỉ dùng khi dev)
pnpm --filter @workspace/db run push
```

---

## 🌐 API Server

Express 5 REST API. Tất cả routes có tiền tố `/api/`. Xác thực bằng middleware `requireAuth` (JWT Bearer token).

### 🛣️ Các nhóm route

| 🔗 Tiền tố | 📄 File | 📝 Mô tả |
|---|---|---|
| `/api/auth` | `auth.ts` | Đăng ký, đăng nhập, thông tin người dùng |
| `/api/projects` | `projects.ts` | CRUD dự án |
| `/api/assets` | `assets.ts` | CRUD tài nguyên |
| `/api/pipeline` | `asset-pipeline.ts` | Nhập và xử lý tài nguyên |
| `/api/documents` | `documents.ts` | CRUD tài liệu + thư mục |
| `/api/graphs` | `graphs.ts` | Visual scripting CRUD + biên dịch + thực thi |
| `/api/runtime` | `runtime.ts` | Phiên runtime + ECS + play mode |
| `/api/organizations` | `organizations.ts` | Quản lý tổ chức |
| `/api/notifications` | `notifications.ts` | Thông báo trong ứng dụng |
| `/api/dashboard` | `dashboard.ts` | Thống kê tổng hợp |
| `…` | `…` | templates, plugins, packages, activity, stars… |

---

## 🖥️ Creator Editor

React 19 SPA với Wouter routing. Token xác thực lưu trong `localStorage` với key `creator_token`, gửi qua header `Authorization: Bearer <token>`.

### 📌 Các mục trong Sidebar

| 🏷️ Mục | 📄 Trang |
|---|---|
| 🎬 **Studio** | Dashboard, Dự án, Tài nguyên, Mẫu, Plugin, Packages |
| 🔀 **Visual Scripting** | Bảng điều khiển Script, Graph Browser, Mẫu Graph, Thư viện Macro, Console Thực thi, Compiler, Runtime Monitor |
| ⚡ **Runtime** | Runtime Engine, Trung tâm Mô phỏng |
| 📄 **Documents** | Tất cả Tài liệu, Thư mục, Bookmarks |
| 🖼️ **Assets** | Pipeline, Trình duyệt, Upload Center, Bộ sưu tập, Thư mục Asset, Hàng đợi Xử lý |
| 👤 **Identity** | Hồ sơ, Tổ chức, Lời mời |
| 📡 **Feed** | Hoạt động, Thông báo |

---

## 🏃 Các Sprint

### 🔐 CREATOR-01 — Danh tính & Dự án
Xác thực cốt lõi (đăng ký/đăng nhập/JWT), hồ sơ người dùng, tổ chức, lời mời, quản lý dự án, mẫu, plugin, packages, thông báo, nhật ký hoạt động.

---

### 📄 CREATOR-02 — Tài liệu
Quản lý tài liệu đầy đủ: CRUD tài liệu phong phú, thư mục, bookmarks, lịch sử tài liệu, tìm kiếm toàn văn.

---

### 🖼️ CREATOR-03 — Pipeline Tài nguyên
Pipeline nhập và xử lý tài nguyên: upload, chuyển mã, trích xuất metadata, bộ sưu tập, thư mục asset, hàng đợi xử lý, bảng điều khiển pipeline.

---

### 🔧 CREATOR-04 — Pipeline Tài nguyên (Mở rộng)
Pipeline tài nguyên mở rộng với xử lý hàng loạt, trình duyệt asset lọc nâng cao, xem chi tiết asset và quản lý jobs pipeline.

---

### 🔀 CREATOR-05 — Visual Scripting Engine

> **20 bảng cơ sở dữ liệu · 6 enum** trong `lib/db/src/schema/graphs.ts`

**⚙️ Backend services:**
- 🔍 `GraphValidator` — phát hiện vòng lặp, liên kết hỏng, nút thừa, chân bắt buộc còn thiếu
- 🏗️ `GraphCompiler` — sắp xếp topo → `CompiledInstruction[]` → lưu vào `creator_graph_compiler_cache`
- ▶️ `GraphRuntime` + `ExecutionEngine` — thực thi nút theo nút trong bộ nhớ, pause/resume/stop
- 🎛️ `GraphService` — điều phối tất cả dịch vụ
- 📡 **17 REST endpoints** dưới `/api/graphs`

**🖥️ Frontend:**
- `GraphEditor` — canvas pan/zoom, kéo nút, kết nối chân, SVG overlay, lưu Ctrl+S
- `NodeLibrary` — 20 loại nút tích hợp thuộc 7 danh mục (Flow, Math, Variables, Events, Functions, Logic, Debug)
- Các component: `Inspector`, `MiniMap`, `Toolbar`, `ConnectionLayer`, `Pin`, `Node`
- Trang: Dashboard Script, Graph Browser, Mẫu, Thư viện Macro, Console, Compiler, Runtime Monitor

---

### ⚡ CREATOR-06 — Runtime Engine

> **20 bảng cơ sở dữ liệu · 6 enum** trong `lib/db/src/schema/runtime.ts`

**🏛️ Kiến trúc:**

```
🔀 Graph Compiler (CREATOR-05)
      ↓  CompiledInstruction[]
⚡ RuntimeEngine
      ↓  initialize → start → stop → pause → resume → step
🌍 WorldRuntime
      ├── 👾 EntityManager       spawn / destroy / transform / enable
      ├── 🧩 ComponentManager    transform / renderer / collider / script / health / …
      ├── ⚙️  SystemManager       Physics / Animation / AI / Quest / Combat / … (11 hệ thống)
      ├── 📡 EventDispatcher     spawn / destroy / move / collision / quest / timer / custom
      ├── ⏱️  TimerService        delay / interval / cooldown / countdown
      └── 🎮 SimulationEngine    vòng lặp tick, theo dõi FPS, frame time
🎬 PlayModeService
      └── start / pause / resume / stop / step / snapshot / restore
📊 ProfilerService + DebugService
      └── lấy mẫu CPU/bộ nhớ mỗi frame → creator_runtime_performance
```

**🎮 Các chế độ mô phỏng:**

| Chế độ | Mô tả |
|---|---|
| `editor` | Công cụ editor đầy đủ, hỗ trợ hot-reload |
| `play` | Mô phỏng game thời gian thực |
| `simulation` | Không giao diện, tốc độ tick tối đa |
| `debug` | Step-frame, breakpoints, xem biến |
| `headless` | Không render |
| `record` / `replay` | Ghi lại và phát lại |

**📡 23 REST endpoints** dưới `/api/runtime`

**🖥️ 12 trang Frontend:**

| 🏷️ Trang | 📝 Mô tả |
|---|---|
| Runtime Dashboard | Widgets thống kê, danh sách phiên, tổng quan kiến trúc |
| Play Mode | Thanh công cụ play, tab entity/hệ thống/log, dải hiệu năng |
| Simulation Center | Bộ khởi chạy chế độ (editor/play/simulation/debug) |
| Runtime Profiler | Biểu đồ sparkline, thanh thời gian hệ thống, bảng mẫu |
| Runtime Logs | Lọc theo cấp độ + tìm kiếm, luồng log màu sắc |
| Runtime Inspector | Cây phân cấp entity + inspector transform + component |
| Entity Explorer | Bảng entity có thể lọc |
| Component Explorer | Bảng component phân nhóm theo loại |
| System Monitor | Thanh thời gian, bộ đếm tick cho mỗi hệ thống |
| Event Monitor | Luồng sự kiện trực tiếp với bộ lọc loại |
| Debug Console | Tabbed: Console / Lỗi / Cảnh báo |
| Snapshot Manager | Tạo, liệt kê, khôi phục snapshot |

---

### 🌍 CREATOR-07 — World Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/world-editor.ts`

**📝 Mô tả:**
Trình chỉnh sửa World để tạo toàn bộ thế giới game, bao gồm terrain, biome, chunk, region, spawn points, teleport, và world settings.

**⚙️ Backend:**
- DrizzleWorldRepository
- WorldEditorService với CRUD, duplicate, fork, publish, archive, restore
- WorldValidator, WorldExporter, WorldImporter
- WorldRuntimeBridge cho simulation

**📡 ~55 REST endpoints** dưới `/api/world-editor`

**🖥️ 16 trang Frontend:**
WorldDashboard, WorldBrowser, WorldEditor, TerrainEditor, BiomeEditor, ChunkManager, RegionManager, SpawnManager, TeleportManager, WorldSettings, Templates, History, ImportExport, Validator, Simulator

---

### 👤 CREATOR-08 — NPC Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/npc-editor.ts`

**📝 Mô tả:**
Trình chỉnh sửa NPC chuyên nghiệp để tạo nhân vật NPC với profile, stats, skills, inventory, equipment, behavior tree, dialogue, patrol routes, và relationships.

**⚙️ Backend:**
- DrizzleNpcEditorRepository
- NpcEditorService, NpcSerializer, NpcValidator
- NpcImporter, NpcExporter, NpcRuntimeBridge

**📡 ~50 REST endpoints** dưới `/api/npc-editor`

**🖥️ 16 trang Frontend:**
NPCDashboard, NPCBrowser, NPCEditor, ProfileEditor, StatsEditor, SkillEditor, InventoryEditor, EquipmentEditor, BehaviorEditor, DialogueEditor, PatrolEditor, RelationshipEditor, Templates, History, ImportExport, Validator

---

### 📜 CREATOR-09 — Quest Editor

> **20 bảng cơ sở dữ liệu · 5 enum** trong `lib/db/src/schema/quest-editor.ts`

**📝 Mô tả:**
Trình chỉnh sửa Quest để tạo toàn bộ nhiệm vụ game với objectives, rewards, conditions, prerequisites, và quest chains.

**⚙️ Backend:**
- DrizzleQuestRepository
- QuestEditorService, QuestValidator
- QuestExporter, QuestImporter, QuestRuntimeBridge

**📡 ~50 REST endpoints** dưới `/api/quest-editor`

**🖥️ 16 trang Frontend:**
QuestDashboard, QuestBrowser, QuestEditor, ObjectiveEditor, RewardEditor, ConditionEditor, PrerequisiteEditor, ChainEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🗡️ CREATOR-10 — Item Editor

> **20 bảng cơ sở dữ liệu · 6 enum** trong `lib/db/src/schema/item-editor.ts`

**📝 Mô tả:**
Trình chỉnh sửa Item để tạo weapons, armor, consumables, materials, currency, quest items, và crafting items với stats, effects, attributes, crafting recipes, loot tables.

**⚙️ Backend:**
- DrizzleItemRepository
- ItemEditorService, ItemValidator
- ItemExporter, ItemImporter, ItemRuntimeBridge

**📡 ~50 REST endpoints** dưới `/api/item-editor`

**🖥️ 16 trang Frontend:**
ItemDashboard, ItemBrowser, ItemEditor, StatsEditor, EffectsEditor, AttributesEditor, CraftingEditor, LootEditor, InventoryEditor, Templates, History, ImportExport, Validator, Simulator

---

### ⚔️ CREATOR-11 — Skill Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/skills.ts`

**📝 Mô tả:**
Trình chỉnh sửa Skill để tạo active/passive skills với levels, costs, cooldowns, effects, buffs, debuffs, projectiles, animations, và visual FX.

**⚙️ Backend:**
- DrizzleSkillRepository
- SkillEditorService, SkillValidator
- SkillExporter, SkillImporter, SkillRuntimeBridge

**📡 ~55 REST endpoints** dưới `/api/skills`

**🖥️ 16 trang Frontend:**
SkillDashboard, SkillBrowser, SkillEditor, EffectsEditor, BuffEditor, DebuffEditor, ProjectileEditor, AnimationEditor, CooldownEditor, CostEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🥊 CREATOR-12 — Combat Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/combat.ts`

**📝 Mô tả:**
Trình chỉnh sửa Combat để tạo combat systems với modes, states, targets, triggers, effects, damage formulas, status effects, và combat logs.

**⚙️ Backend:**
- DrizzleCombatRepository
- CombatEditorService, CombatValidator
- CombatExporter, CombatImporter, CombatRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/combat`

**🖥️ 16 trang Frontend:**
CombatDashboard, CombatBrowser, CombatEditor, ModeEditor, StateEditor, TargetEditor, TriggerEditor, EffectEditor, FormulaEditor, StatusEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🏰 CREATOR-13 — Dungeon Editor

> **20 bảng cơ sở dữ liệu · 6 enum** trong `lib/db/src/schema/dungeons.ts`

**📝 Mô tả:**
Trình chỉnh sửa Dungeon để tạo dungeons với rooms, corridors, traps, puzzles, bosses, monsters, rewards, và difficulty scaling.

**⚙️ Backend:**
- DrizzleDungeonRepository
- DungeonEditorService, DungeonValidator
- DungeonExporter, DungeonImporter, DungeonRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/dungeons`

**🖥️ 16 trang Frontend:**
DungeonDashboard, DungeonBrowser, DungeonEditor, RoomEditor, CorridorEditor, TrapEditor, PuzzleEditor, BossEditor, MonsterEditor, RewardEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🐾 CREATOR-14 — Pet Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/pets.ts`

**📝 Mô tả:**
Trình chỉnh sửa Pet để tạo pets, mounts, companions với species, stats, growth, evolution, skills, equipment, training, food, breeding, và affection.

**⚙️ Backend:**
- DrizzlePetRepository
- PetEditorService, PetValidator
- PetExporter, PetImporter, PetRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/pets`

**🖥️ 16 trang Frontend:**
PetDashboard, PetBrowser, PetEditor, SpeciesEditor, GrowthEditor, EvolutionEditor, SkillEditor, TrainingEditor, EquipmentEditor, FoodEditor, BreedingEditor, MountEditor, Simulator, History, ImportExport, Validator

---

### 👹 CREATOR-15 — Boss Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/bosses.ts`

**📝 Mô tả:**
Trình chỉnh sửa Boss để tạo boss encounters với phases, mechanics, enrage timers, loot tables, spawn conditions, và boss AI.

**⚙️ Backend:**
- DrizzleBossRepository
- BossEditorService, BossValidator
- BossExporter, BossImporter, BossRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/bosses`

**🖥️ 16 trang Frontend:**
BossDashboard, BossBrowser, BossEditor, PhaseEditor, MechanicEditor, EnrageEditor, LootEditor, SpawnEditor, AIEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🏙️ CREATOR-15 — City Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/cities.ts`

**📝 Mô tả:**
Trình chỉnh sửa City để tạo thành phố với districts, zones, roads, buildings, utilities, population, economy, transportation, spawn points, và services.

**⚙️ Backend:**
- DrizzleCityRepository
- CityEditorService, CityValidator
- CityExporter, CityImporter, CityRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/cities`

**🖥️ 16 trang Frontend:**
CityDashboard, CityBrowser, CityEditor, DistrictEditor, ZoneEditor, RoadEditor, BuildingEditor, UtilityEditor, PopulationEditor, EconomyEditor, TransportEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🌐 CREATOR-16 — World System

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/world-system.ts`

**📝 Mô tả:**
Runtime system quản lý world loading, region streaming, chunk loading, scene management, day/night cycle, weather, world events, teleport, spawn, save state, và multi-world support.

**⚙️ Backend:**
- WorldSystemRepository
- WorldSystemService, WorldRuntimeEngine
- WorldManager, SceneManager, ChunkManager, StreamingManager
- RegionManager, PortalManager, WeatherManager, DayNightManager
- SpawnManager, CheckpointManager, EventManager, SaveManager

**📡 ~60 REST endpoints** dưới `/api/world-system`

**🖥️ 16 trang Frontend:**
WorldSystemDashboard, WorldBrowser, WorldRuntime, StreamingCenter, ChunkManager, RegionManager, PortalManager, SpawnManager, WeatherCenter, DayNightCenter, CheckpointCenter, SimulationCenter, Statistics, History, ImportExport, WorldValidator

---

### 🏢 CREATOR-17 — Building Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/buildings.ts`

**📝 Mô tả:**
Trình chỉnh sửa Building để tạo buildings với types, floors, rooms, furniture, utilities, occupants, economy, và building AI.

**⚙️ Backend:**
- DrizzleBuildingRepository
- BuildingEditorService, BuildingValidator
- BuildingExporter, BuildingImporter, BuildingRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/buildings`

**🖥️ 16 trang Frontend:**
BuildingDashboard, BuildingBrowser, BuildingEditor, TypeEditor, FloorEditor, RoomEditor, FurnitureEditor, UtilityEditor, OccupantEditor, EconomyEditor, AIEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🗺️ CREATOR-18 — Land Editor

> **20 bảng cơ sở dữ liệu · 7 enum** trong `lib/db/src/schema/land-editor.ts`

**📝 Mô tả:**
Trình chỉnh sửa Land để quản lý đất đai với parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings, bookmarks, permissions, và marketplace.

**⚙️ Backend:**
- DrizzleLandRepository
- LandEditorService, LandValidator
- LandExporter, LandImporter, LandRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/lands`

**🖥️ 16 trang Frontend:**
LandDashboard, LandBrowser, LandEditor, ParcelEditor, BoundaryEditor, OwnerEditor, ZoneEditor, TerrainEditor, UtilityEditor, RoadEditor, TeleportEditor, BuildingEditor, BookmarkEditor, PermissionEditor, MarketplaceEditor, Templates, History, ImportExport, Validator, Simulator

---

### 🚗 CREATOR-19 — Transportation Editor

> **20 bảng cơ sở dữ liệu · 8 enum** trong `lib/db/src/schema/transportation.ts`

**📝 Mô tả:**
Trình chỉnh sửa Transportation để quản lý hệ thống giao thông với roads, highways, railways, metro, airports, seaports, bus routes, taxi, parking, vehicles, traffic signals, logistics, teleports, và navigation network.

**⚙️ Backend:**
- DrizzleTransportationRepository
- TransportationEditorService, TransportationValidator
- TransportationExporter, TransportationImporter, TransportationRuntimeBridge

**📡 ~60 REST endpoints** dưới `/api/transportation`

**🖥️ 16 trang Frontend:**
TransportDashboard, TransportBrowser, RoadEditor, RailwayEditor, MetroEditor, AirportEditor, SeaportEditor, BusRouteEditor, VehicleEditor, ParkingEditor, SignalEditor, LogisticsEditor, TeleportEditor, NavigationEditor, Templates, History, ImportExport, Validator, Simulator

---

## 🏛️ Quyết định kiến trúc

> **1. 🗃️ Repository Pattern + Service Pattern**
> Toàn bộ truy cập database đi qua các class `Drizzle*Repository`. Business logic nằm trong `*Service`. Routes chỉ gọi services, không bao giờ trực tiếp gọi DB.

> **2. 🚫 Không mock, không triển khai giả**
> Mọi tính năng đều giao tiếp với PostgreSQL thực. Không có fallback in-memory.

> **3. 🔑 JWT lưu trong localStorage**
> Key token là `creator_token`. Hook `setAuthTokenGetter` tự động inject vào tất cả lời gọi API client được tạo.

> **4. 🛣️ Pipeline dùng tiền tố `/api/pipeline`**
> Không dùng `/api/assets` để tránh xung đột với route CRUD assets cơ bản đã đăng ký trước.

> **5. 📦 `@workspace/db` là đường dẫn import duy nhất cho DB client**
> Subpath `@workspace/db/client` không được export. Tất cả repositories dùng `import { db } from "@workspace/db"`.

> **6. 🔀 Graph compiler có tính xác định**
> Sắp xếp topo tạo ra thứ tự lệnh ổn định. Checksum kết quả lưu trong `creator_graph_compiler_cache` để các graph không thay đổi bỏ qua biên dịch lại.

> **7. ⚡ Các phiên runtime hoàn toàn cô lập**
> Mỗi phiên có instance `WorldRuntime` riêng trong bộ nhớ và một tập hàng đầy đủ trong các bảng `creator_runtime_*`. Xóa phiên sẽ cascade qua tất cả bảng con.

---

## ⚠️ Lưu ý quan trọng

> 🔴 **Luôn chạy `pnpm --filter @workspace/db run push` sau khi thay đổi schema** trước khi khởi động lại API server. Server sẽ crash nếu schema chưa được đẩy lên.

> 🟠 **API server chạy trên cổng 3000**, không phải cổng mặc định 5000 như trong một số tài liệu. Lệnh workflow đặt `PORT=3000` một cách tường minh.

> 🟡 **Creator Editor cần `BASE_PATH=/`** — nếu thiếu, Vite sẽ phục vụ assets từ đường dẫn sai.

> 🔵 **Vite `allowedHosts: true`** được đặt trong `vite.config.ts` — bắt buộc vì preview pane là một iframe được proxy từ origin khác.

> 🟣 **TypeScript strict mode bật ở mọi nơi.** Các usage `any` trong page components là có chủ đích (phản hồi API không được đánh kiểu ở tầng page — codegen xử lý tầng client).

---

<div align="center">

**Được xây dựng với ❤️ — Universe Creator Platform**

![Sprint](https://img.shields.io/badge/Sprint-CREATOR--19-6366f1?style=flat-square)
![Tables](https://img.shields.io/badge/DB_Tables-280+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Pages](https://img.shields.io/badge/Trang-300+-61DAFB?style=flat-square&logo=react&logoColor=black)
![API](https://img.shields.io/badge/API_Endpoints-900+-339933?style=flat-square&logo=express&logoColor=white)

</div>
