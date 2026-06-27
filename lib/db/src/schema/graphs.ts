import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  real,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { creatorUsersTable, creatorProjectsTable } from "./creator";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const graphTypeEnum = pgEnum("graph_type", [
  "event_graph",
  "function_graph",
  "macro_graph",
  "animation_graph",
  "behavior_tree",
  "dialogue_graph",
  "quest_graph",
  "ai_graph",
  "timeline_graph",
  "custom",
]);

export const nodeTypeEnum = pgEnum("node_type", [
  "start",
  "end",
  "event",
  "branch",
  "switch",
  "sequence",
  "delay",
  "loop",
  "while",
  "for_each",
  "math",
  "compare",
  "random",
  "variable",
  "set_variable",
  "get_variable",
  "function",
  "macro",
  "custom_event",
  "log",
  "print",
  "comment",
  "group",
  "reroute",
  "cast",
  "select",
  "gate",
  "flip_flop",
  "do_once",
  "custom",
]);

export const pinTypeEnum = pgEnum("pin_type", [
  "execution",
  "boolean",
  "integer",
  "float",
  "string",
  "vector",
  "object",
  "array",
  "map",
  "struct",
  "enum",
  "wildcard",
  "event",
]);

export const connectionTypeEnum = pgEnum("connection_type", [
  "execution",
  "data",
  "event",
]);

export const executionStateEnum = pgEnum("execution_state", [
  "idle",
  "running",
  "paused",
  "completed",
  "failed",
  "stopped",
]);

export const variableScopeEnum = pgEnum("variable_scope", [
  "local",
  "graph",
  "global",
  "constant",
]);

// ─── Graphs ───────────────────────────────────────────────────────────────────

export const creatorGraphsTable = pgTable("creator_graphs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "cascade",
  }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: graphTypeEnum("type").default("event_graph").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  tags: text("tags").array().default([]).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  viewport: jsonb("viewport").default({ x: 0, y: 0, zoom: 1 }).notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  parentGraphId: integer("parent_graph_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const creatorGraphNodesTable = pgTable("creator_graph_nodes", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  nodeKey: text("node_key").notNull(),
  type: nodeTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  x: real("x").default(0).notNull(),
  y: real("y").default(0).notNull(),
  width: real("width").default(200).notNull(),
  height: real("height").default(80).notNull(),
  collapsed: boolean("collapsed").default(false).notNull(),
  disabled: boolean("disabled").default(false).notNull(),
  color: text("color"),
  comment: text("comment"),
  metadata: jsonb("metadata").default({}).notNull(),
  config: jsonb("config").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Pins ─────────────────────────────────────────────────────────────────────

export const creatorGraphPinsTable = pgTable(
  "creator_graph_pins",
  {
    id: serial("id").primaryKey(),
    nodeId: integer("node_id")
      .notNull()
      .references(() => creatorGraphNodesTable.id, { onDelete: "cascade" }),
    graphId: integer("graph_id")
      .notNull()
      .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
    pinKey: text("pin_key").notNull(),
    label: text("label").notNull(),
    type: pinTypeEnum("type").notNull(),
    isInput: boolean("is_input").default(true).notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    defaultValue: jsonb("default_value"),
    metadata: jsonb("metadata").default({}).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [unique().on(t.nodeId, t.pinKey)],
);

// ─── Connections ──────────────────────────────────────────────────────────────

export const creatorGraphConnectionsTable = pgTable(
  "creator_graph_connections",
  {
    id: serial("id").primaryKey(),
    graphId: integer("graph_id")
      .notNull()
      .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
    connectionKey: text("connection_key").notNull(),
    type: connectionTypeEnum("type").default("execution").notNull(),
    sourcePinId: integer("source_pin_id")
      .notNull()
      .references(() => creatorGraphPinsTable.id, { onDelete: "cascade" }),
    targetPinId: integer("target_pin_id")
      .notNull()
      .references(() => creatorGraphPinsTable.id, { onDelete: "cascade" }),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.sourcePinId, t.targetPinId)],
);

// ─── Variables ────────────────────────────────────────────────────────────────

export const creatorGraphVariablesTable = pgTable("creator_graph_variables", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: pinTypeEnum("type").notNull(),
  scope: variableScopeEnum("scope").default("local").notNull(),
  defaultValue: jsonb("default_value"),
  description: text("description"),
  isArray: boolean("is_array").default(false).notNull(),
  isExposed: boolean("is_exposed").default(false).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Functions ────────────────────────────────────────────────────────────────

export const creatorGraphFunctionsTable = pgTable("creator_graph_functions", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  inputs: jsonb("inputs").default([]).notNull(),
  outputs: jsonb("outputs").default([]).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Events ───────────────────────────────────────────────────────────────────

export const creatorGraphEventsTable = pgTable("creator_graph_events", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  payload: jsonb("payload").default({}).notNull(),
  isCustom: boolean("is_custom").default(true).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Macros ───────────────────────────────────────────────────────────────────

export const creatorGraphMacrosTable = pgTable("creator_graph_macros", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id").references(() => creatorGraphsTable.id, {
    onDelete: "set null",
  }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  inputs: jsonb("inputs").default([]).notNull(),
  outputs: jsonb("outputs").default([]).notNull(),
  nodes: jsonb("nodes").default([]).notNull(),
  connections: jsonb("connections").default([]).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  tags: text("tags").array().default([]).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Comments ─────────────────────────────────────────────────────────────────

export const creatorGraphCommentsTable = pgTable("creator_graph_comments", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  x: real("x").default(0).notNull(),
  y: real("y").default(0).notNull(),
  width: real("width").default(300).notNull(),
  height: real("height").default(100).notNull(),
  color: text("color").default("#333344").notNull(),
  fontSize: integer("font_size").default(14).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Groups ───────────────────────────────────────────────────────────────────

export const creatorGraphGroupsTable = pgTable("creator_graph_groups", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  x: real("x").default(0).notNull(),
  y: real("y").default(0).notNull(),
  width: real("width").default(400).notNull(),
  height: real("height").default(300).notNull(),
  color: text("color").default("#1a1a2e").notNull(),
  nodeIds: integer("node_ids").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Execution Logs ───────────────────────────────────────────────────────────

export const creatorGraphExecutionLogsTable = pgTable(
  "creator_graph_execution_logs",
  {
    id: serial("id").primaryKey(),
    graphId: integer("graph_id")
      .notNull()
      .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
    runtimeId: text("runtime_id").notNull(),
    nodeId: integer("node_id").references(() => creatorGraphNodesTable.id, {
      onDelete: "set null",
    }),
    level: text("level").default("info").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").default({}).notNull(),
    executedAt: timestamp("executed_at").defaultNow().notNull(),
  },
);

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const creatorGraphBreakpointsTable = pgTable(
  "creator_graph_breakpoints",
  {
    id: serial("id").primaryKey(),
    graphId: integer("graph_id")
      .notNull()
      .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
    nodeId: integer("node_id")
      .notNull()
      .references(() => creatorGraphNodesTable.id, { onDelete: "cascade" }),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    condition: text("condition"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.graphId, t.nodeId)],
);

// ─── Graph Templates ──────────────────────────────────────────────────────────

export const creatorGraphTemplatesTable = pgTable("creator_graph_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: graphTypeEnum("type").default("event_graph").notNull(),
  category: text("category"),
  thumbnail: text("thumbnail"),
  nodes: jsonb("nodes").default([]).notNull(),
  connections: jsonb("connections").default([]).notNull(),
  variables: jsonb("variables").default([]).notNull(),
  tags: text("tags").array().default([]).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdBy: integer("created_by").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── History (undo/redo) ──────────────────────────────────────────────────────

export const creatorGraphHistoryTable = pgTable("creator_graph_history", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Versions ─────────────────────────────────────────────────────────────────

export const creatorGraphVersionsTable = pgTable("creator_graph_versions", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  label: text("label"),
  description: text("description"),
  snapshot: jsonb("snapshot").notNull(),
  compiledOutput: jsonb("compiled_output").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Compiler Cache ───────────────────────────────────────────────────────────

export const creatorGraphCompilerCacheTable = pgTable(
  "creator_graph_compiler_cache",
  {
    id: serial("id").primaryKey(),
    graphId: integer("graph_id")
      .notNull()
      .unique()
      .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
    checksum: text("checksum").notNull(),
    compiledOutput: jsonb("compiled_output").notNull(),
    isValid: boolean("is_valid").default(true).notNull(),
    compiledAt: timestamp("compiled_at").defaultNow().notNull(),
    errorMessage: text("error_message"),
  },
);

// ─── Runtime State ────────────────────────────────────────────────────────────

export const creatorGraphRuntimeTable = pgTable("creator_graph_runtime", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  runtimeId: text("runtime_id").notNull().unique(),
  state: executionStateEnum("state").default("idle").notNull(),
  currentNodeId: integer("current_node_id"),
  variables: jsonb("variables").default({}).notNull(),
  stack: jsonb("stack").default([]).notNull(),
  startedAt: timestamp("started_at"),
  pausedAt: timestamp("paused_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Snapshots ────────────────────────────────────────────────────────────────

export const creatorGraphSnapshotsTable = pgTable("creator_graph_snapshots", {
  id: serial("id").primaryKey(),
  graphId: integer("graph_id")
    .notNull()
    .references(() => creatorGraphsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  label: text("label"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Preferences ──────────────────────────────────────────────────────────────

export const creatorGraphPreferencesTable = pgTable(
  "creator_graph_preferences",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" })
      .unique(),
    snapToGrid: boolean("snap_to_grid").default(true).notNull(),
    gridSize: integer("grid_size").default(16).notNull(),
    showMiniMap: boolean("show_mini_map").default(true).notNull(),
    showGrid: boolean("show_grid").default(true).notNull(),
    autoSave: boolean("auto_save").default(true).notNull(),
    autoSaveInterval: integer("auto_save_interval").default(30).notNull(),
    defaultZoom: real("default_zoom").default(1).notNull(),
    theme: text("theme").default("dark").notNull(),
    nodeSpacing: integer("node_spacing").default(20).notNull(),
    extras: jsonb("extras").default({}).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// ─── Shortcuts ────────────────────────────────────────────────────────────────

export const creatorGraphShortcutsTable = pgTable(
  "creator_graph_shortcuts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    keybinding: text("keybinding").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.action)],
);

// ─── Insert Schemas ───────────────────────────────────────────────────────────

export const insertGraphSchema = createInsertSchema(creatorGraphsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGraphNodeSchema = createInsertSchema(
  creatorGraphNodesTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertGraphPinSchema = createInsertSchema(
  creatorGraphPinsTable,
).omit({ id: true });

export const insertGraphConnectionSchema = createInsertSchema(
  creatorGraphConnectionsTable,
).omit({ id: true, createdAt: true });

export const insertGraphVariableSchema = createInsertSchema(
  creatorGraphVariablesTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertGraphFunctionSchema = createInsertSchema(
  creatorGraphFunctionsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertGraphEventSchema = createInsertSchema(
  creatorGraphEventsTable,
).omit({ id: true, createdAt: true });

export const insertGraphMacroSchema = createInsertSchema(
  creatorGraphMacrosTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertGraphExecutionLogSchema = createInsertSchema(
  creatorGraphExecutionLogsTable,
).omit({ id: true, executedAt: true });

export const insertGraphBreakpointSchema = createInsertSchema(
  creatorGraphBreakpointsTable,
).omit({ id: true, createdAt: true });

export const insertGraphHistorySchema = createInsertSchema(
  creatorGraphHistoryTable,
).omit({ id: true, createdAt: true });

export const insertGraphVersionSchema = createInsertSchema(
  creatorGraphVersionsTable,
).omit({ id: true, createdAt: true });

export const insertGraphSnapshotSchema = createInsertSchema(
  creatorGraphSnapshotsTable,
).omit({ id: true, createdAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorGraph = typeof creatorGraphsTable.$inferSelect;
export type InsertGraph = z.infer<typeof insertGraphSchema>;

export type CreatorGraphNode = typeof creatorGraphNodesTable.$inferSelect;
export type InsertGraphNode = z.infer<typeof insertGraphNodeSchema>;

export type CreatorGraphPin = typeof creatorGraphPinsTable.$inferSelect;
export type InsertGraphPin = z.infer<typeof insertGraphPinSchema>;

export type CreatorGraphConnection =
  typeof creatorGraphConnectionsTable.$inferSelect;
export type InsertGraphConnection = z.infer<typeof insertGraphConnectionSchema>;

export type CreatorGraphVariable =
  typeof creatorGraphVariablesTable.$inferSelect;
export type InsertGraphVariable = z.infer<typeof insertGraphVariableSchema>;

export type CreatorGraphFunction =
  typeof creatorGraphFunctionsTable.$inferSelect;
export type InsertGraphFunction = z.infer<typeof insertGraphFunctionSchema>;

export type CreatorGraphEvent = typeof creatorGraphEventsTable.$inferSelect;
export type InsertGraphEvent = z.infer<typeof insertGraphEventSchema>;

export type CreatorGraphMacro = typeof creatorGraphMacrosTable.$inferSelect;
export type InsertGraphMacro = z.infer<typeof insertGraphMacroSchema>;

export type CreatorGraphComment =
  typeof creatorGraphCommentsTable.$inferSelect;

export type CreatorGraphGroup = typeof creatorGraphGroupsTable.$inferSelect;

export type CreatorGraphExecutionLog =
  typeof creatorGraphExecutionLogsTable.$inferSelect;

export type CreatorGraphBreakpoint =
  typeof creatorGraphBreakpointsTable.$inferSelect;

export type CreatorGraphTemplate =
  typeof creatorGraphTemplatesTable.$inferSelect;

export type CreatorGraphHistory =
  typeof creatorGraphHistoryTable.$inferSelect;

export type CreatorGraphVersion =
  typeof creatorGraphVersionsTable.$inferSelect;

export type CreatorGraphCompilerCache =
  typeof creatorGraphCompilerCacheTable.$inferSelect;

export type CreatorGraphRuntime =
  typeof creatorGraphRuntimeTable.$inferSelect;

export type CreatorGraphSnapshot =
  typeof creatorGraphSnapshotsTable.$inferSelect;

export type CreatorGraphPreferences =
  typeof creatorGraphPreferencesTable.$inferSelect;

export type CreatorGraphShortcut =
  typeof creatorGraphShortcutsTable.$inferSelect;
