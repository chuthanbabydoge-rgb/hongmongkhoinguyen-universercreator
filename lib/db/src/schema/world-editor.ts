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

export const worldTypeEnum = pgEnum("world_type", [
  "fantasy",
  "sci_fi",
  "modern",
  "historical",
  "post_apocalyptic",
  "underwater",
  "space",
  "custom",
]);

export const worldStatusEnum = pgEnum("world_status", [
  "draft",
  "active",
  "archived",
  "published",
  "deprecated",
]);

export const worldEnvironmentEnum = pgEnum("world_environment", [
  "outdoor",
  "indoor",
  "underground",
  "underwater",
  "space",
  "void",
  "custom",
]);

export const worldLightingEnum = pgEnum("world_lighting", [
  "realtime",
  "baked",
  "mixed",
  "custom",
]);

export const worldWeatherEnum = pgEnum("world_weather", [
  "clear",
  "rain",
  "storm",
  "snow",
  "fog",
  "dynamic",
  "custom",
]);

export const terrainTypeEnum = pgEnum("terrain_type", [
  "flat",
  "hills",
  "mountains",
  "ocean",
  "desert",
  "forest",
  "arctic",
  "volcanic",
  "custom",
]);

export const spawnTypeEnum = pgEnum("spawn_type", [
  "player",
  "npc",
  "boss",
  "pet",
  "vehicle",
  "item",
  "custom",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorWorlds = pgTable("creator_worlds", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  projectId: integer("project_id").references(() => creatorProjectsTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),
  worldType: worldTypeEnum("world_type").notNull().default("fantasy"),
  status: worldStatusEnum("status").notNull().default("draft"),
  environment: worldEnvironmentEnum("environment").notNull().default("outdoor"),
  tags: jsonb("tags").notNull().default([]),
  visibility: text("visibility").notNull().default("private"),
  isTemplate: boolean("is_template").notNull().default(false),
  parentWorldId: integer("parent_world_id"),
  graphId: integer("graph_id"),
  seed: text("seed"),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldSettings = pgTable("creator_world_settings", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  gravity: real("gravity").notNull().default(-9.81),
  worldSizeX: real("world_size_x").notNull().default(1000),
  worldSizeY: real("world_size_y").notNull().default(500),
  worldSizeZ: real("world_size_z").notNull().default(1000),
  chunkSizeX: real("chunk_size_x").notNull().default(16),
  chunkSizeY: real("chunk_size_y").notNull().default(16),
  chunkSizeZ: real("chunk_size_z").notNull().default(16),
  maxPlayers: integer("max_players").notNull().default(1),
  respawnEnabled: boolean("respawn_enabled").notNull().default(true),
  pvpEnabled: boolean("pvp_enabled").notNull().default(false),
  fogEnabled: boolean("fog_enabled").notNull().default(false),
  ambientSoundEnabled: boolean("ambient_sound_enabled").notNull().default(true),
  physicsEnabled: boolean("physics_enabled").notNull().default(true),
  collisionEnabled: boolean("collision_enabled").notNull().default(true),
  extra: jsonb("extra").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldRegions = pgTable("creator_world_regions", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  parentRegionId: integer("parent_region_id"),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#4f8ef7"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  sizeX: real("size_x").notNull().default(100),
  sizeY: real("size_y").notNull().default(100),
  sizeZ: real("size_z").notNull().default(100),
  terrain: terrainTypeEnum("terrain").notNull().default("flat"),
  graphId: integer("graph_id"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldChunks = pgTable("creator_world_chunks", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  regionId: integer("region_id").references(() => creatorWorldRegions.id),
  chunkX: integer("chunk_x").notNull().default(0),
  chunkY: integer("chunk_y").notNull().default(0),
  chunkZ: integer("chunk_z").notNull().default(0),
  isLoaded: boolean("is_loaded").notNull().default(false),
  data: jsonb("data").notNull().default({}),
  terrainData: jsonb("terrain_data").notNull().default({}),
  objectCount: integer("object_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldLayers = pgTable("creator_world_layers", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  layerType: text("layer_type").notNull().default("terrain"),
  order: integer("order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  isLocked: boolean("is_locked").notNull().default(false),
  opacity: real("opacity").notNull().default(1.0),
  blendMode: text("blend_mode").notNull().default("normal"),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldSpawnpoints = pgTable("creator_world_spawnpoints", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  regionId: integer("region_id").references(() => creatorWorldRegions.id),
  name: text("name").notNull(),
  spawnType: spawnTypeEnum("spawn_type").notNull().default("player"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  radius: real("radius").notNull().default(1),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  graphId: integer("graph_id"),
  conditions: jsonb("conditions").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldScenes = pgTable("creator_world_scenes", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  cameraPos: jsonb("camera_pos").notNull().default({ x: 0, y: 10, z: 20 }),
  cameraRot: jsonb("camera_rot").notNull().default({ x: 0, y: 0, z: 0 }),
  isDefault: boolean("is_default").notNull().default(false),
  thumbnail: text("thumbnail"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldEnvironments = pgTable("creator_world_environments", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Default Environment"),
  skyboxType: text("skybox_type").notNull().default("procedural"),
  skyboxAssetId: integer("skybox_asset_id"),
  sunEnabled: boolean("sun_enabled").notNull().default(true),
  sunIntensity: real("sun_intensity").notNull().default(1.0),
  sunColor: text("sun_color").notNull().default("#fffbe6"),
  sunPosX: real("sun_pos_x").notNull().default(45),
  sunPosY: real("sun_pos_y").notNull().default(75),
  moonEnabled: boolean("moon_enabled").notNull().default(true),
  moonIntensity: real("moon_intensity").notNull().default(0.3),
  fogEnabled: boolean("fog_enabled").notNull().default(false),
  fogColor: text("fog_color").notNull().default("#c0c8d8"),
  fogDensity: real("fog_density").notNull().default(0.01),
  fogStart: real("fog_start").notNull().default(50),
  fogEnd: real("fog_end").notNull().default(500),
  ambientColor: text("ambient_color").notNull().default("#404060"),
  ambientIntensity: real("ambient_intensity").notNull().default(0.4),
  windSpeed: real("wind_speed").notNull().default(0),
  windDirection: real("wind_direction").notNull().default(0),
  cloudCoverage: real("cloud_coverage").notNull().default(0.3),
  cloudSpeed: real("cloud_speed").notNull().default(0.01),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldWeather = pgTable("creator_world_weather", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  weatherType: worldWeatherEnum("weather_type").notNull().default("clear"),
  intensity: real("intensity").notNull().default(0),
  windSpeed: real("wind_speed").notNull().default(0),
  precipitationRate: real("precipitation_rate").notNull().default(0),
  lightningEnabled: boolean("lightning_enabled").notNull().default(false),
  thunderEnabled: boolean("thunder_enabled").notNull().default(false),
  isDynamic: boolean("is_dynamic").notNull().default(false),
  transitionDuration: real("transition_duration").notNull().default(5),
  settings: jsonb("settings").notNull().default({}),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldLighting = pgTable("creator_world_lighting", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Default Lighting"),
  lightingMode: worldLightingEnum("lighting_mode").notNull().default("realtime"),
  intensity: real("intensity").notNull().default(1.0),
  color: text("color").notNull().default("#ffffff"),
  shadowsEnabled: boolean("shadows_enabled").notNull().default(true),
  shadowDistance: real("shadow_distance").notNull().default(100),
  shadowResolution: integer("shadow_resolution").notNull().default(2048),
  ambientOcclusionEnabled: boolean("ambient_occlusion_enabled").notNull().default(false),
  bloomEnabled: boolean("bloom_enabled").notNull().default(false),
  bloomIntensity: real("bloom_intensity").notNull().default(0.5),
  toneMappingEnabled: boolean("tone_mapping_enabled").notNull().default(true),
  exposure: real("exposure").notNull().default(1.0),
  isActive: boolean("is_active").notNull().default(true),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldNavigation = pgTable("creator_world_navigation", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  regionId: integer("region_id").references(() => creatorWorldRegions.id),
  name: text("name").notNull().default("NavMesh"),
  navMeshEnabled: boolean("nav_mesh_enabled").notNull().default(true),
  agentHeight: real("agent_height").notNull().default(2.0),
  agentRadius: real("agent_radius").notNull().default(0.5),
  agentMaxSlope: real("agent_max_slope").notNull().default(45),
  agentStepHeight: real("agent_step_height").notNull().default(0.4),
  blockedAreas: jsonb("blocked_areas").notNull().default([]),
  walkableAreas: jsonb("walkable_areas").notNull().default([]),
  jumpAreas: jsonb("jump_areas").notNull().default([]),
  waterAreas: jsonb("water_areas").notNull().default([]),
  navData: jsonb("nav_data").notNull().default({}),
  isGenerated: boolean("is_generated").notNull().default(false),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldPortals = pgTable("creator_world_portals", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  regionId: integer("region_id").references(() => creatorWorldRegions.id),
  name: text("name").notNull(),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  targetWorldId: integer("target_world_id"),
  targetWorldUuid: text("target_world_uuid"),
  targetSpawnUuid: text("target_spawn_uuid"),
  targetPosX: real("target_pos_x"),
  targetPosY: real("target_pos_y"),
  targetPosZ: real("target_pos_z"),
  cooldownSeconds: real("cooldown_seconds").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isBidirectional: boolean("is_bidirectional").notNull().default(false),
  graphId: integer("graph_id"),
  conditions: jsonb("conditions").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldBookmarks = pgTable("creator_world_bookmarks", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  name: text("name").notNull(),
  description: text("description"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  cameraState: jsonb("camera_state").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldHistory = pgTable("creator_world_history", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  action: text("action").notNull(),
  description: text("description"),
  before: jsonb("before").notNull().default({}),
  after: jsonb("after").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldVersions = pgTable("creator_world_versions", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  version: integer("version").notNull(),
  label: text("label"),
  description: text("description"),
  snapshot: jsonb("snapshot").notNull().default({}),
  isAutomatic: boolean("is_automatic").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldTemplates = pgTable("creator_world_templates", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  sourceWorldId: integer("source_world_id").references(() => creatorWorlds.id),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  worldType: worldTypeEnum("world_type").notNull().default("fantasy"),
  tags: jsonb("tags").notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  templateData: jsonb("template_data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldExports = pgTable("creator_world_exports", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  format: text("format").notNull().default("json"),
  status: text("status").notNull().default("pending"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  includeAssets: boolean("include_assets").notNull().default(false),
  options: jsonb("options").notNull().default({}),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldImports = pgTable("creator_world_imports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  targetProjectId: integer("target_project_id").references(() => creatorProjectsTable.id),
  format: text("format").notNull().default("json"),
  status: text("status").notNull().default("pending"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  resultWorldId: integer("result_world_id"),
  options: jsonb("options").notNull().default({}),
  errorMessage: text("error_message"),
  validationErrors: jsonb("validation_errors").notNull().default([]),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorWorldRuntime = pgTable("creator_world_runtime", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  runtimeSessionId: integer("runtime_session_id"),
  runtimeWorldId: integer("runtime_world_id"),
  mode: text("mode").notNull().default("preview"),
  isActive: boolean("is_active").notNull().default(false),
  loadedAt: timestamp("loaded_at"),
  unloadedAt: timestamp("unloaded_at"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorWorldStatistics = pgTable("creator_world_statistics", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull().references(() => creatorWorlds.id, { onDelete: "cascade" }),
  regionCount: integer("region_count").notNull().default(0),
  chunkCount: integer("chunk_count").notNull().default(0),
  spawnpointCount: integer("spawnpoint_count").notNull().default(0),
  portalCount: integer("portal_count").notNull().default(0),
  layerCount: integer("layer_count").notNull().default(0),
  versionCount: integer("version_count").notNull().default(0),
  exportCount: integer("export_count").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at"),
  totalEditTimeMs: integer("total_edit_time_ms").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorWorld = typeof creatorWorlds.$inferSelect;
export type InsertCreatorWorld = typeof creatorWorlds.$inferInsert;
export const insertCreatorWorldSchema = createInsertSchema(creatorWorlds);

export type CreatorWorldSettings = typeof creatorWorldSettings.$inferSelect;
export type InsertCreatorWorldSettings = typeof creatorWorldSettings.$inferInsert;
export const insertCreatorWorldSettingsSchema = createInsertSchema(creatorWorldSettings);

export type CreatorWorldRegion = typeof creatorWorldRegions.$inferSelect;
export type InsertCreatorWorldRegion = typeof creatorWorldRegions.$inferInsert;
export const insertCreatorWorldRegionSchema = createInsertSchema(creatorWorldRegions);

export type CreatorWorldChunk = typeof creatorWorldChunks.$inferSelect;
export type InsertCreatorWorldChunk = typeof creatorWorldChunks.$inferInsert;

export type CreatorWorldLayer = typeof creatorWorldLayers.$inferSelect;
export type InsertCreatorWorldLayer = typeof creatorWorldLayers.$inferInsert;
export const insertCreatorWorldLayerSchema = createInsertSchema(creatorWorldLayers);

export type CreatorWorldSpawnpoint = typeof creatorWorldSpawnpoints.$inferSelect;
export type InsertCreatorWorldSpawnpoint = typeof creatorWorldSpawnpoints.$inferInsert;
export const insertCreatorWorldSpawnpointSchema = createInsertSchema(creatorWorldSpawnpoints);

export type CreatorWorldScene = typeof creatorWorldScenes.$inferSelect;
export type InsertCreatorWorldScene = typeof creatorWorldScenes.$inferInsert;

export type CreatorWorldEnvironment = typeof creatorWorldEnvironments.$inferSelect;
export type InsertCreatorWorldEnvironment = typeof creatorWorldEnvironments.$inferInsert;

export type CreatorWorldWeather = typeof creatorWorldWeather.$inferSelect;
export type InsertCreatorWorldWeather = typeof creatorWorldWeather.$inferInsert;

export type CreatorWorldLightingRow = typeof creatorWorldLighting.$inferSelect;
export type InsertCreatorWorldLighting = typeof creatorWorldLighting.$inferInsert;

export type CreatorWorldNavigation = typeof creatorWorldNavigation.$inferSelect;
export type InsertCreatorWorldNavigation = typeof creatorWorldNavigation.$inferInsert;

export type CreatorWorldPortal = typeof creatorWorldPortals.$inferSelect;
export type InsertCreatorWorldPortal = typeof creatorWorldPortals.$inferInsert;
export const insertCreatorWorldPortalSchema = createInsertSchema(creatorWorldPortals);

export type CreatorWorldBookmark = typeof creatorWorldBookmarks.$inferSelect;
export type InsertCreatorWorldBookmark = typeof creatorWorldBookmarks.$inferInsert;

export type CreatorWorldHistoryRow = typeof creatorWorldHistory.$inferSelect;
export type InsertCreatorWorldHistory = typeof creatorWorldHistory.$inferInsert;

export type CreatorWorldVersion = typeof creatorWorldVersions.$inferSelect;
export type InsertCreatorWorldVersion = typeof creatorWorldVersions.$inferInsert;

export type CreatorWorldTemplate = typeof creatorWorldTemplates.$inferSelect;
export type InsertCreatorWorldTemplate = typeof creatorWorldTemplates.$inferInsert;

export type CreatorWorldExport = typeof creatorWorldExports.$inferSelect;
export type InsertCreatorWorldExport = typeof creatorWorldExports.$inferInsert;

export type CreatorWorldImport = typeof creatorWorldImports.$inferSelect;
export type InsertCreatorWorldImport = typeof creatorWorldImports.$inferInsert;

export type CreatorWorldRuntime = typeof creatorWorldRuntime.$inferSelect;
export type InsertCreatorWorldRuntime = typeof creatorWorldRuntime.$inferInsert;

export type CreatorWorldStatistics = typeof creatorWorldStatistics.$inferSelect;
