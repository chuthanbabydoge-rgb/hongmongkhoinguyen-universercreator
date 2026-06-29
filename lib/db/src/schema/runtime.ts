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
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { creatorUsersTable, creatorProjectsTable } from "./creator";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const runtimeStateEnum = pgEnum("runtime_state", [
  "idle",
  "initializing",
  "loading",
  "running",
  "paused",
  "stepping",
  "stopping",
  "stopped",
  "error",
  "crashed",
]);

export const runtimeModeEnum = pgEnum("runtime_mode", [
  "editor",
  "play",
  "simulation",
  "debug",
  "headless",
  "record",
  "replay",
]);

export const runtimeEventTypeEnum = pgEnum("runtime_event_type", [
  "spawn",
  "destroy",
  "move",
  "rotate",
  "scale",
  "collision",
  "interaction",
  "quest",
  "dialogue",
  "timer",
  "tick",
  "system",
  "input",
  "custom",
]);

export const runtimeLogLevelEnum = pgEnum("runtime_log_level", [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

export const runtimeComponentTypeEnum = pgEnum("runtime_component_type", [
  "transform",
  "renderer",
  "collider",
  "rigid_body",
  "script",
  "health",
  "inventory",
  "quest",
  "dialogue",
  "animation",
  "audio",
  "navigation",
  "custom",
]);

export const runtimeResourceStateEnum = pgEnum("runtime_resource_state", [
  "unloaded",
  "loading",
  "loaded",
  "failed",
  "evicted",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorRuntimeSessions = pgTable("creator_runtime_sessions", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  projectId: integer("project_id").references(() => creatorProjectsTable.id),
  name: text("name").notNull().default("Runtime Session"),
  state: runtimeStateEnum("state").notNull().default("idle"),
  mode: runtimeModeEnum("mode").notNull().default("editor"),
  worldId: integer("world_id"),
  worldInstanceId: integer("world_instance_id"),
  tickRate: real("tick_rate").notNull().default(60),
  currentTick: integer("current_tick").notNull().default(0),
  elapsedTime: real("elapsed_time").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  startedAt: timestamp("started_at"),
  pausedAt: timestamp("paused_at"),
  stoppedAt: timestamp("stopped_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeWorlds = pgTable("creator_runtime_worlds", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  entityCount: integer("entity_count").notNull().default(0),
  systemCount: integer("system_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(false),
  gravity: jsonb("gravity").notNull().default({ x: 0, y: -9.81, z: 0 }),
  bounds: jsonb("bounds").notNull().default({}),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeEntities = pgTable("creator_runtime_entities", {
  id: serial("id").primaryKey(),
  entityUuid: uuid("entity_uuid").defaultRandom().notNull().unique(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  worldId: integer("world_id").references(() => creatorRuntimeWorlds.id),
  name: text("name").notNull(),
  tag: text("tag"),
  layer: text("layer").notNull().default("default"),
  parentId: integer("parent_id"),
  enabled: boolean("enabled").notNull().default(true),
  destroyed: boolean("destroyed").notNull().default(false),
  transform: jsonb("transform").notNull().default({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  }),
  metadata: jsonb("metadata").notNull().default({}),
  spawnedAt: timestamp("spawned_at").notNull().defaultNow(),
  destroyedAt: timestamp("destroyed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeComponents = pgTable("creator_runtime_components", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull().references(() => creatorRuntimeEntities.id, { onDelete: "cascade" }),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  type: runtimeComponentTypeEnum("type").notNull(),
  name: text("name"),
  enabled: boolean("enabled").notNull().default(true),
  data: jsonb("data").notNull().default({}),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeSystems = pgTable("creator_runtime_systems", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  systemType: text("system_type").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  updateType: text("update_type").notNull().default("frame"),
  lastTickMs: real("last_tick_ms").notNull().default(0),
  totalTicks: integer("total_ticks").notNull().default(0),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeEvents = pgTable("creator_runtime_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  type: runtimeEventTypeEnum("type").notNull(),
  name: text("name"),
  sourceEntityId: integer("source_entity_id"),
  targetEntityId: integer("target_entity_id"),
  tick: integer("tick").notNull().default(0),
  payload: jsonb("payload").notNull().default({}),
  processed: boolean("processed").notNull().default(false),
  dispatchedAt: timestamp("dispatched_at").notNull().defaultNow(),
});

export const creatorRuntimeLogs = pgTable("creator_runtime_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  level: runtimeLogLevelEnum("level").notNull().default("info"),
  system: text("system"),
  entityId: integer("entity_id"),
  message: text("message").notNull(),
  tick: integer("tick").notNull().default(0),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRuntimeResources = pgTable("creator_runtime_resources", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  resourceType: text("resource_type").notNull(),
  state: runtimeResourceStateEnum("state").notNull().default("unloaded"),
  path: text("path"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  loadTimeMs: real("load_time_ms"),
  metadata: jsonb("metadata").notNull().default({}),
  loadedAt: timestamp("loaded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeSnapshots = pgTable("creator_runtime_snapshots", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tick: integer("tick").notNull().default(0),
  elapsedTime: real("elapsed_time").notNull().default(0),
  entityCount: integer("entity_count").notNull().default(0),
  stateData: jsonb("state_data").notNull().default({}),
  worldData: jsonb("world_data").notNull().default({}),
  isAutomatic: boolean("is_automatic").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRuntimeCheckpoints = pgTable("creator_runtime_checkpoints", {
  id: serial("id").primaryKey(),
  snapshotId: integer("snapshot_id").notNull().references(() => creatorRuntimeSnapshots.id, { onDelete: "cascade" }),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  tick: integer("tick").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRuntimePerformance = pgTable("creator_runtime_performance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  tick: integer("tick").notNull().default(0),
  fps: real("fps").notNull().default(0),
  frameTimeMs: real("frame_time_ms").notNull().default(0),
  cpuTimeMs: real("cpu_time_ms").notNull().default(0),
  memoryMb: real("memory_mb").notNull().default(0),
  entityCount: integer("entity_count").notNull().default(0),
  componentCount: integer("component_count").notNull().default(0),
  eventCount: integer("event_count").notNull().default(0),
  systemTimings: jsonb("system_timings").notNull().default({}),
  sampledAt: timestamp("sampled_at").notNull().defaultNow(),
});

export const creatorRuntimeScheduler = pgTable("creator_runtime_scheduler", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  scheduleType: text("schedule_type").notNull().default("frame"),
  priority: integer("priority").notNull().default(0),
  intervalTicks: integer("interval_ticks"),
  enabled: boolean("enabled").notNull().default(true),
  lastRunTick: integer("last_run_tick").notNull().default(0),
  runCount: integer("run_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeJobs = pgTable("creator_runtime_jobs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  jobType: text("job_type").notNull(),
  status: text("status").notNull().default("pending"),
  priority: integer("priority").notNull().default(0),
  progress: real("progress").notNull().default(0),
  payload: jsonb("payload").notNull().default({}),
  result: jsonb("result").notNull().default({}),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeTimers = pgTable("creator_runtime_timers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  entityId: integer("entity_id"),
  name: text("name").notNull(),
  timerType: text("timer_type").notNull().default("delay"),
  durationMs: real("duration_ms").notNull().default(1000),
  remainingMs: real("remaining_ms").notNull().default(1000),
  intervalMs: real("interval_ms"),
  isRunning: boolean("is_running").notNull().default(false),
  fireCount: integer("fire_count").notNull().default(0),
  maxFires: integer("max_fires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeVariables = pgTable("creator_runtime_variables", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  entityId: integer("entity_id"),
  name: text("name").notNull(),
  valueType: text("value_type").notNull().default("any"),
  value: jsonb("value").notNull().default(null),
  scope: text("scope").notNull().default("session"),
  isReadonly: boolean("is_readonly").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeMemory = pgTable("creator_runtime_memory", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  tick: integer("tick").notNull().default(0),
  heapUsedMb: real("heap_used_mb").notNull().default(0),
  heapTotalMb: real("heap_total_mb").notNull().default(0),
  externalMb: real("external_mb").notNull().default(0),
  arrayBuffersMb: real("array_buffers_mb").notNull().default(0),
  sampledAt: timestamp("sampled_at").notNull().defaultNow(),
});

export const creatorRuntimeDebug = pgTable("creator_runtime_debug", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  breakpointTick: integer("breakpoint_tick"),
  watchedEntities: jsonb("watched_entities").notNull().default([]),
  watchedVariables: jsonb("watched_variables").notNull().default([]),
  isStepMode: boolean("is_step_mode").notNull().default(false),
  pauseOnError: boolean("pause_on_error").notNull().default(true),
  logFilter: text("log_filter"),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorRuntimeErrors = pgTable("creator_runtime_errors", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  tick: integer("tick").notNull().default(0),
  system: text("system"),
  entityId: integer("entity_id"),
  errorType: text("error_type").notNull(),
  message: text("message").notNull(),
  stack: text("stack"),
  data: jsonb("data").notNull().default({}),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRuntimeHistory = pgTable("creator_runtime_history", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  action: text("action").notNull(),
  worldInstanceId: integer("world_instance_id"),
  tick: integer("tick").notNull().default(0),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRuntimeProfiles = pgTable("creator_runtime_profiles", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => creatorRuntimeSessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startTick: integer("start_tick").notNull().default(0),
  endTick: integer("end_tick"),
  durationMs: real("duration_ms"),
  samples: jsonb("samples").notNull().default([]),
  summary: jsonb("summary").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertRuntimeSessionSchema = createInsertSchema(creatorRuntimeSessions);
export const insertRuntimeWorldSchema = createInsertSchema(creatorRuntimeWorlds);
export const insertRuntimeEntitySchema = createInsertSchema(creatorRuntimeEntities);
export const insertRuntimeComponentSchema = createInsertSchema(creatorRuntimeComponents);
export const insertRuntimeSystemSchema = createInsertSchema(creatorRuntimeSystems);
export const insertRuntimeEventSchema = createInsertSchema(creatorRuntimeEvents);
export const insertRuntimeLogSchema = createInsertSchema(creatorRuntimeLogs);
export const insertRuntimeResourceSchema = createInsertSchema(creatorRuntimeResources);
export const insertRuntimeSnapshotSchema = createInsertSchema(creatorRuntimeSnapshots);
export const insertRuntimeCheckpointSchema = createInsertSchema(creatorRuntimeCheckpoints);
export const insertRuntimePerformanceSchema = createInsertSchema(creatorRuntimePerformance);
export const insertRuntimeSchedulerSchema = createInsertSchema(creatorRuntimeScheduler);
export const insertRuntimeJobSchema = createInsertSchema(creatorRuntimeJobs);
export const insertRuntimeTimerSchema = createInsertSchema(creatorRuntimeTimers);
export const insertRuntimeVariableSchema = createInsertSchema(creatorRuntimeVariables);
export const insertRuntimeMemorySchema = createInsertSchema(creatorRuntimeMemory);
export const insertRuntimeDebugSchema = createInsertSchema(creatorRuntimeDebug);
export const insertRuntimeErrorSchema = createInsertSchema(creatorRuntimeErrors);
export const insertRuntimeHistorySchema = createInsertSchema(creatorRuntimeHistory);
export const insertRuntimeProfileSchema = createInsertSchema(creatorRuntimeProfiles);

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type RuntimeSession = typeof creatorRuntimeSessions.$inferSelect;
export type InsertRuntimeSession = typeof creatorRuntimeSessions.$inferInsert;
export type RuntimeWorld = typeof creatorRuntimeWorlds.$inferSelect;
export type InsertRuntimeWorld = typeof creatorRuntimeWorlds.$inferInsert;
export type RuntimeEntity = typeof creatorRuntimeEntities.$inferSelect;
export type InsertRuntimeEntity = typeof creatorRuntimeEntities.$inferInsert;
export type RuntimeComponent = typeof creatorRuntimeComponents.$inferSelect;
export type InsertRuntimeComponent = typeof creatorRuntimeComponents.$inferInsert;
export type RuntimeSystem = typeof creatorRuntimeSystems.$inferSelect;
export type InsertRuntimeSystem = typeof creatorRuntimeSystems.$inferInsert;
export type RuntimeEvent = typeof creatorRuntimeEvents.$inferSelect;
export type InsertRuntimeEvent = typeof creatorRuntimeEvents.$inferInsert;
export type RuntimeLog = typeof creatorRuntimeLogs.$inferSelect;
export type InsertRuntimeLog = typeof creatorRuntimeLogs.$inferInsert;
export type RuntimeResource = typeof creatorRuntimeResources.$inferSelect;
export type InsertRuntimeResource = typeof creatorRuntimeResources.$inferInsert;
export type RuntimeSnapshot = typeof creatorRuntimeSnapshots.$inferSelect;
export type InsertRuntimeSnapshot = typeof creatorRuntimeSnapshots.$inferInsert;
export type RuntimeCheckpoint = typeof creatorRuntimeCheckpoints.$inferSelect;
export type InsertRuntimeCheckpoint = typeof creatorRuntimeCheckpoints.$inferInsert;
export type RuntimePerformance = typeof creatorRuntimePerformance.$inferSelect;
export type InsertRuntimePerformance = typeof creatorRuntimePerformance.$inferInsert;
export type RuntimeSchedulerEntry = typeof creatorRuntimeScheduler.$inferSelect;
export type InsertRuntimeSchedulerEntry = typeof creatorRuntimeScheduler.$inferInsert;
export type RuntimeJob = typeof creatorRuntimeJobs.$inferSelect;
export type InsertRuntimeJob = typeof creatorRuntimeJobs.$inferInsert;
export type RuntimeTimer = typeof creatorRuntimeTimers.$inferSelect;
export type InsertRuntimeTimer = typeof creatorRuntimeTimers.$inferInsert;
export type RuntimeVariable = typeof creatorRuntimeVariables.$inferSelect;
export type InsertRuntimeVariable = typeof creatorRuntimeVariables.$inferInsert;
export type RuntimeMemory = typeof creatorRuntimeMemory.$inferSelect;
export type InsertRuntimeMemory = typeof creatorRuntimeMemory.$inferInsert;
export type RuntimeDebug = typeof creatorRuntimeDebug.$inferSelect;
export type InsertRuntimeDebug = typeof creatorRuntimeDebug.$inferInsert;
export type RuntimeError = typeof creatorRuntimeErrors.$inferSelect;
export type InsertRuntimeError = typeof creatorRuntimeErrors.$inferInsert;
export type RuntimeHistory = typeof creatorRuntimeHistory.$inferSelect;
export type InsertRuntimeHistory = typeof creatorRuntimeHistory.$inferInsert;
export type RuntimeProfile = typeof creatorRuntimeProfiles.$inferSelect;
export type InsertRuntimeProfile = typeof creatorRuntimeProfiles.$inferInsert;
