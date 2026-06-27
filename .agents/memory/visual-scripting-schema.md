---
name: Visual Scripting Engine
description: CREATOR-05 — graph-based scripting engine schema, backend services, and frontend pages added in this sprint.
---

# Visual Scripting Engine (CREATOR-05)

## DB Schema — lib/db/src/schema/graphs.ts
6 enums: graph_type, node_type, pin_type, connection_type, execution_state, variable_scope
20 tables: creator_graphs, creator_graph_nodes, creator_graph_pins, creator_graph_connections, creator_graph_variables, creator_graph_functions, creator_graph_events, creator_graph_macros, creator_graph_comments, creator_graph_groups, creator_graph_execution_logs, creator_graph_breakpoints, creator_graph_templates, creator_graph_history, creator_graph_versions, creator_graph_compiler_cache, creator_graph_runtime, creator_graph_snapshots, creator_graph_preferences, creator_graph_shortcuts

## Backend — artifacts/api-server/src/
- repositories/graph-repository.ts — DrizzleGraphRepository (all DB access)
- services/graph-validator.ts — GraphValidator (cycle detection, broken links, unused nodes)
- services/graph-compiler.ts — GraphCompiler (topological sort → runtime instructions)
- services/graph-runtime.ts — GraphRuntime + ExecutionEngine (in-memory execution)
- services/graph-service.ts — GraphService (orchestrates repo + compiler + runtime)
- routes/graphs.ts — full REST API; registered in routes/index.ts

**Why:** Separation of concerns: repository handles DB, compiler transforms graph to instructions, runtime executes them in-memory. The service layer owns orchestration.

## REST API
All under /api/graphs (auth required):
GET / POST / PATCH /:id / DELETE /:id
POST /:id/duplicate, POST /:id/save, GET /:id/load
POST /:id/compile, POST /:id/validate, POST /:id/execute
POST /runtime/:runtimeId/pause|resume|stop
GET /:id/history, GET /:id/versions, POST /:id/restore
GET /templates

## Frontend — artifacts/creator-editor/src/
Pages: visual-script-dashboard, graph-editor, graph-browser, graph-templates, execution-console, macro-library, compiler-panel, runtime-monitor
Components: src/components/graph/ — canvas, node, pin, connection, toolbar, mini-map, node-library, inspector

Sidebar section "Visual Scripting" added under "Studio" in layout.tsx.
Routes added to App.tsx.
