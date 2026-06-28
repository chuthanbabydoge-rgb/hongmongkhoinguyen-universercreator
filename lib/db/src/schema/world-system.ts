import { pgTable, serial, integer, text, boolean, real, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import {
  worldWeatherEnum,
  creatorWorldChunks,
  creatorWorldRegions,
  creatorWorldSpawnpoints,
  creatorWorldWeather,
  creatorWorldPortals,
  creatorWorldRuntime,
  creatorWorldStatistics,
  creatorWorldHistory,
  creatorWorldVersions,
  creatorWorldExports,
  creatorWorldImports,
} from "./world-editor";

export {
  creatorWorldChunks,
  creatorWorldRegions,
  creatorWorldSpawnpoints,
  creatorWorldWeather,
  creatorWorldPortals,
  creatorWorldRuntime,
  creatorWorldStatistics,
  creatorWorldHistory,
  creatorWorldVersions,
  creatorWorldExports,
  creatorWorldImports,
};

export const worldRuntimeStateEnum = pgEnum("world_runtime_state", [
  "offline", "loading", "running", "paused", "saving", "stopping", "error", "maintenance",
]);
export const worldTimeCycleEnum = pgEnum("world_time_cycle", [
  "sunrise", "morning", "noon", "afternoon", "evening", "sunset", "night", "midnight",
]);
export const worldStreamModeEnum = pgEnum("world_stream_mode", [
  "distance", "region", "portal", "manual", "hybrid", "disabled",
]);
export const worldEventTypeEnum = pgEnum("world_event_type", [
  "boss_spawn", "weather_change", "time_shift", "portal_open", "npc_event", "player_event",
  "season_change", "invasion", "festival", "scripted",
]);
export const portalTypeEnum = pgEnum("portal_type", [
  "dungeon_entrance", "city_gate", "teleport", "world_gate", "instance_portal", "fast_travel",
]);
export const chunkStateEnum = pgEnum("chunk_state", [
  "unloaded", "loading", "loaded", "active", "unloading", "error",
]);

export const creatorWorldInstances = pgTable("creator_world_instances", {
  id: serial("id").primaryKey(),
  worldEditorId: integer("world_editor_id"),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  runtimeState: worldRuntimeStateEnum("runtime_state").notNull().default("offline"),
  currentWeather: worldWeatherEnum("current_weather").notNull().default("clear"),
  currentTimeCycle: worldTimeCycleEnum("current_time_cycle").notNull().default("morning"),
  streamMode: worldStreamModeEnum("stream_mode").notNull().default("distance"),
  timeScale: real("time_scale").notNull().default(1.0),
  weatherEnabled: boolean("weather_enabled").notNull().default(true),
  dayNightEnabled: boolean("day_night_enabled").notNull().default(true),
  maxPlayers: integer("max_players").notNull().default(100),
  currentPlayers: integer("current_players").notNull().default(0),
  seed: text("seed"),
  sizeX: real("size_x").notNull().default(1000),
  sizeY: real("size_y").notNull().default(1000),
  sizeZ: real("size_z").notNull().default(100),
  chunkSize: integer("chunk_size").notNull().default(16),
  viewDistance: integer("view_distance").notNull().default(8),
  skyboxAssetId: integer("skybox_asset_id"),
  terrainAssetId: integer("terrain_asset_id"),
  ambientMusicRef: text("ambient_music_ref"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldStreaming = pgTable("creator_world_streaming", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  sessionId: text("session_id").notNull(),
  streamMode: worldStreamModeEnum("stream_mode").notNull().default("distance"),
  loadedChunks: integer("loaded_chunks").notNull().default(0),
  activeChunks: integer("active_chunks").notNull().default(0),
  totalChunks: integer("total_chunks").notNull().default(0),
  memoryUsageMb: real("memory_usage_mb").notNull().default(0),
  streamLatencyMs: real("stream_latency_ms").notNull().default(0),
  bandwidthKbps: real("bandwidth_kbps").notNull().default(0),
  cacheHitRate: real("cache_hit_rate").notNull().default(0),
  streamingQueue: jsonb("streaming_queue"),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export const creatorWorldTeleports = pgTable("creator_world_teleports", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  name: text("name").notNull(),
  fromX: real("from_x").notNull().default(0),
  fromY: real("from_y").notNull().default(0),
  fromZ: real("from_z").notNull().default(0),
  toX: real("to_x").notNull().default(0),
  toY: real("to_y").notNull().default(0),
  toZ: real("to_z").notNull().default(0),
  toWorldInstanceId: integer("to_world_instance_id"),
  radius: real("radius").notNull().default(2),
  cooldownSeconds: integer("cooldown_seconds").notNull().default(0),
  requiredLevel: integer("required_level").notNull().default(1),
  requiredItem: text("required_item"),
  isActive: boolean("is_active").notNull().default(true),
  sfxRef: text("sfx_ref"),
  vfxRef: text("vfx_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldDaynight = pgTable("creator_world_daynight", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  currentHour: real("current_hour").notNull().default(8),
  dayLengthSeconds: integer("day_length_seconds").notNull().default(1440),
  timeScale: real("time_scale").notNull().default(1.0),
  isPaused: boolean("is_paused").notNull().default(false),
  currentCycle: worldTimeCycleEnum("current_cycle").notNull().default("morning"),
  sunriseHour: real("sunrise_hour").notNull().default(6),
  sunsetHour: real("sunset_hour").notNull().default(18),
  moonPhase: integer("moon_phase").notNull().default(0),
  ambientLightColor: text("ambient_light_color").notNull().default("#ffffff"),
  sunColor: text("sun_color").notNull().default("#fffbeb"),
  moonColor: text("moon_color").notNull().default("#b0c4de"),
  skyboxDay: text("skybox_day"),
  skyboxNight: text("skybox_night"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldEvents = pgTable("creator_world_events", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  name: text("name").notNull(),
  eventType: worldEventTypeEnum("event_type").notNull().default("scripted"),
  triggerCondition: text("trigger_condition"),
  triggerAt: timestamp("trigger_at"),
  duration: integer("duration").notNull().default(3600),
  isRepeating: boolean("is_repeating").notNull().default(false),
  repeatIntervalSeconds: integer("repeat_interval_seconds"),
  affectedRegionId: integer("affected_region_id"),
  entityRef: text("entity_ref"),
  graphRef: text("graph_ref"),
  rewards: jsonb("rewards"),
  isActive: boolean("is_active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldStates = pgTable("creator_world_states", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  stateName: text("state_name").notNull(),
  stateData: jsonb("state_data").notNull().default({}),
  weatherSnapshot: jsonb("weather_snapshot"),
  daynightSnapshot: jsonb("daynight_snapshot"),
  entitySnapshot: jsonb("entity_snapshot"),
  playerSnapshot: jsonb("player_snapshot"),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
  savedBy: integer("saved_by").notNull(),
});

export const creatorWorldCheckpoints = pgTable("creator_world_checkpoints", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  sessionId: text("session_id").notNull(),
  checkpointIndex: integer("checkpoint_index").notNull().default(0),
  label: text("label"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  worldStateId: integer("world_state_id"),
  isAutoSave: boolean("is_auto_save").notNull().default(false),
  triggeredBy: text("triggered_by"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldPlayers = pgTable("creator_world_players", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  sessionId: text("session_id").notNull(),
  playerId: integer("player_id").notNull(),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  currentChunkId: integer("current_chunk_id"),
  currentRegionId: integer("current_region_id"),
  isOnline: boolean("is_online").notNull().default(true),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  metadata: jsonb("metadata"),
});

export const creatorWorldNpcs = pgTable("creator_world_npcs", {
  id: serial("id").primaryKey(),
  worldInstanceId: integer("world_instance_id").notNull(),
  sessionId: text("session_id").notNull(),
  npcRef: text("npc_ref").notNull(),
  spawnpointId: integer("spawnpoint_id"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  currentRegionId: integer("current_region_id"),
  currentChunkId: integer("current_chunk_id"),
  isAlive: boolean("is_alive").notNull().default(true),
  currentHp: integer("current_hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  aiState: text("ai_state").notNull().default("idle"),
  spawnedAt: timestamp("spawned_at").notNull().defaultNow(),
  metadata: jsonb("metadata"),
});
