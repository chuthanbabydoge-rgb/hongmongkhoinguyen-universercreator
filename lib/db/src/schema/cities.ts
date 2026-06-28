import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const cityTypeEnum = pgEnum("city_type", [
  "metropolis", "city", "town", "village", "capital", "port", "fortress",
  "trade_hub", "resort", "underground", "floating", "custom",
]);

export const cityStatusEnum = pgEnum("city_status", [
  "draft", "review", "published", "archived", "deprecated",
]);

export const districtTypeEnum = pgEnum("district_type", [
  "residential", "commercial", "industrial", "cultural", "governmental",
  "military", "religious", "education", "entertainment", "mixed", "slum", "elite", "custom",
]);

export const zoneTypeEnum = pgEnum("zone_type", [
  "safe", "pvp", "combat", "restricted", "housing", "market",
  "farming", "crafting", "training", "event", "neutral", "custom",
]);

export const roadTypeEnum = pgEnum("road_type", [
  "main_street", "alley", "highway", "path", "bridge", "tunnel",
  "underground", "elevated", "waterway", "railway", "custom",
]);

export const utilityTypeEnum = pgEnum("utility_type", [
  "electricity", "water", "sewage", "gas", "telecom", "waste",
  "heating", "cooling", "magic_grid", "custom",
]);

export const cityServiceEnum = pgEnum("city_service", [
  "hospital", "police", "fire_station", "school", "library", "bank",
  "post_office", "market", "guild_hall", "inn", "stable", "temple",
  "blacksmith", "enchanter", "custom",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorCities = pgTable("creator_cities", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  cityType: cityTypeEnum("city_type").notNull().default("city"),
  status: cityStatusEnum("city_status").notNull().default("draft"),
  population: integer("population").notNull().default(0),
  maxPopulation: integer("max_population").notNull().default(10000),
  prosperity: real("prosperity").notNull().default(50),
  safety: real("safety").notNull().default(50),
  sizeX: real("size_x").notNull().default(1000),
  sizeY: real("size_y").notNull().default(1000),
  elevation: real("elevation").notNull().default(0),
  climate: text("climate").notNull().default("temperate"),
  founded: text("founded"),
  ruler: text("ruler"),
  faction: text("faction"),
  currency: text("currency").notNull().default("gold"),
  taxRate: real("tax_rate").notNull().default(0.1),
  mapAssetId: integer("map_asset_id"),
  thumbnailAssetId: integer("thumbnail_asset_id"),
  ambientMusicRef: text("ambient_music_ref"),
  worldRef: text("world_ref"),
  regionRef: text("region_ref"),
  graphRef: text("graph_ref"),
  runtimeRef: text("runtime_ref"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCitySettings = pgTable("creator_city_settings", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  allowPvp: boolean("allow_pvp").notNull().default(false),
  allowBuilding: boolean("allow_building").notNull().default(true),
  allowTrading: boolean("allow_trading").notNull().default(true),
  enableDayNight: boolean("enable_day_night").notNull().default(true),
  enableWeather: boolean("enable_weather").notNull().default(true),
  enableEconomy: boolean("enable_economy").notNull().default(true),
  enableCrime: boolean("enable_crime").notNull().default(true),
  enableDisaster: boolean("enable_disaster").notNull().default(false),
  respawnPoint: text("respawn_point"),
  entryCondition: text("entry_condition"),
  exitCondition: text("exit_condition"),
  levelRequirement: integer("level_requirement").notNull().default(1),
  factionRequirement: text("faction_requirement"),
  instanceType: text("instance_type").notNull().default("shared"),
  maxInstances: integer("max_instances").notNull().default(1),
  maxPlayersPerInstance: integer("max_players_per_instance").notNull().default(100),
  npcDensity: real("npc_density").notNull().default(1.0),
  trafficDensity: real("traffic_density").notNull().default(1.0),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityDistricts = pgTable("creator_city_districts", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  districtType: districtTypeEnum("district_type").notNull().default("residential"),
  population: integer("population").notNull().default(0),
  maxPopulation: integer("max_population").notNull().default(1000),
  prosperity: real("prosperity").notNull().default(50),
  safety: real("safety").notNull().default(50),
  crimeRate: real("crime_rate").notNull().default(0),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  sizeX: real("size_x").notNull().default(100),
  sizeY: real("size_y").notNull().default(100),
  color: text("color").notNull().default("#4a90e2"),
  icon: text("icon"),
  landlord: text("landlord"),
  taxMultiplier: real("tax_multiplier").notNull().default(1.0),
  isLocked: boolean("is_locked").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  unlockCondition: text("unlock_condition"),
  npcRef: text("npc_ref"),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityZones = pgTable("creator_city_zones", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  name: text("name").notNull(),
  description: text("description"),
  zoneType: zoneTypeEnum("zone_type").notNull().default("safe"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  radius: real("radius").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  pvpEnabled: boolean("pvp_enabled").notNull().default(false),
  buildingEnabled: boolean("building_enabled").notNull().default(true),
  mountEnabled: boolean("mount_enabled").notNull().default(true),
  flightEnabled: boolean("flight_enabled").notNull().default(false),
  combatRestrictions: jsonb("combat_restrictions"),
  entryCondition: text("entry_condition"),
  exitCondition: text("exit_condition"),
  onEnterGraphRef: text("on_enter_graph_ref"),
  onExitGraphRef: text("on_exit_graph_ref"),
  color: text("color").notNull().default("#22c55e"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityRoads = pgTable("creator_city_roads", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  name: text("name").notNull(),
  description: text("description"),
  roadType: roadTypeEnum("road_type").notNull().default("main_street"),
  startX: real("start_x").notNull().default(0),
  startY: real("start_y").notNull().default(0),
  endX: real("end_x").notNull().default(100),
  endY: real("end_y").notNull().default(100),
  width: real("width").notNull().default(10),
  speedLimit: real("speed_limit").notNull().default(30),
  isOneWay: boolean("is_one_way").notNull().default(false),
  isToll: boolean("is_toll").notNull().default(false),
  tollAmount: real("toll_amount").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockReason: text("block_reason"),
  allowVehicles: boolean("allow_vehicles").notNull().default(true),
  allowMounts: boolean("allow_mounts").notNull().default(true),
  allowPedestrians: boolean("allow_pedestrians").notNull().default(true),
  surfaceType: text("surface_type").notNull().default("cobblestone"),
  meshAssetRef: text("mesh_asset_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityIntersections = pgTable("creator_city_intersections", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  name: text("name"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  connectedRoadIds: integer("connected_road_ids").array(),
  hasTrafficLight: boolean("has_traffic_light").notNull().default(false),
  trafficLightCycle: integer("traffic_light_cycle").notNull().default(30),
  isRoundabout: boolean("is_roundabout").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityBuildings = pgTable("creator_city_buildings", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  name: text("name").notNull(),
  description: text("description"),
  buildingType: text("building_type").notNull().default("house"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  width: real("width").notNull().default(10),
  depth: real("depth").notNull().default(10),
  height: real("height").notNull().default(10),
  floors: integer("floors").notNull().default(1),
  capacity: integer("capacity").notNull().default(10),
  occupancy: integer("occupancy").notNull().default(0),
  owner: text("owner"),
  faction: text("faction"),
  isEnterable: boolean("is_enterable").notNull().default(true),
  isDestructible: boolean("is_destructible").notNull().default(false),
  hp: integer("hp").notNull().default(1000),
  maxHp: integer("max_hp").notNull().default(1000),
  meshAssetRef: text("mesh_asset_ref"),
  iconAssetRef: text("icon_asset_ref"),
  interiorRef: text("interior_ref"),
  npcRef: text("npc_ref"),
  shopRef: text("shop_ref"),
  dungeonRef: text("dungeon_ref"),
  questRef: text("quest_ref"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityUtilities = pgTable("creator_city_utilities", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  name: text("name").notNull(),
  description: text("description"),
  utilityType: utilityTypeEnum("utility_type").notNull().default("electricity"),
  capacity: real("capacity").notNull().default(100),
  currentLoad: real("current_load").notNull().default(0),
  efficiency: real("efficiency").notNull().default(1.0),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  coverageRadius: real("coverage_radius").notNull().default(200),
  isActive: boolean("is_active").notNull().default(true),
  isCritical: boolean("is_critical").notNull().default(false),
  maintenanceCost: real("maintenance_cost").notNull().default(10),
  upgradeLevel: integer("upgrade_level").notNull().default(1),
  maxUpgradeLevel: integer("max_upgrade_level").notNull().default(5),
  connectedBuildingIds: integer("connected_building_ids").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityTransport = pgTable("creator_city_transport", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  transportType: text("transport_type").notNull().default("bus"),
  routePoints: jsonb("route_points").notNull().default([]),
  scheduleType: text("schedule_type").notNull().default("fixed"),
  intervalMinutes: integer("interval_minutes").notNull().default(15),
  capacity: integer("capacity").notNull().default(20),
  fare: real("fare").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  operatingHoursStart: integer("operating_hours_start").notNull().default(6),
  operatingHoursEnd: integer("operating_hours_end").notNull().default(22),
  vehicleAssetRef: text("vehicle_asset_ref"),
  stopIds: integer("stop_ids").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityPopulation = pgTable("creator_city_population", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  totalCount: integer("total_count").notNull().default(0),
  npcCount: integer("npc_count").notNull().default(0),
  playerCount: integer("player_count").notNull().default(0),
  residentCount: integer("resident_count").notNull().default(0),
  birthRate: real("birth_rate").notNull().default(0.02),
  deathRate: real("death_rate").notNull().default(0.01),
  migrationRate: real("migration_rate").notNull().default(0.0),
  employmentRate: real("employment_rate").notNull().default(0.9),
  happinessScore: real("happiness_score").notNull().default(75),
  demographicBreakdown: jsonb("demographic_breakdown"),
  classBreakdown: jsonb("class_breakdown"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityServices = pgTable("creator_city_services", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  buildingId: integer("building_id"),
  name: text("name").notNull(),
  description: text("description"),
  serviceType: cityServiceEnum("city_service").notNull().default("market"),
  isActive: boolean("is_active").notNull().default(true),
  operatingHoursStart: integer("operating_hours_start").notNull().default(8),
  operatingHoursEnd: integer("operating_hours_end").notNull().default(20),
  serviceLevel: integer("service_level").notNull().default(1),
  maxServiceLevel: integer("max_service_level").notNull().default(5),
  coverageRadius: real("coverage_radius").notNull().default(150),
  cost: real("cost").notNull().default(0),
  requiredLevel: integer("required_level").notNull().default(1),
  requiredFaction: text("required_faction"),
  npcRef: text("npc_ref"),
  inventoryRef: text("inventory_ref"),
  skillTrainingRef: text("skill_training_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCitySpawnpoints = pgTable("creator_city_spawnpoints", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  name: text("name").notNull(),
  spawnType: text("spawn_type").notNull().default("player"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  rotationY: real("rotation_y").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  requiredLevel: integer("required_level").notNull().default(1),
  requiredFaction: text("required_faction"),
  requiredQuest: text("required_quest"),
  maxConcurrent: integer("max_concurrent").notNull().default(10),
  respawnDelay: integer("respawn_delay").notNull().default(5),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityLandmarks = pgTable("creator_city_landmarks", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  districtId: integer("district_id"),
  buildingId: integer("building_id"),
  name: text("name").notNull(),
  description: text("description"),
  landmarkType: text("landmark_type").notNull().default("monument"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  isOnMap: boolean("is_on_map").notNull().default(true),
  iconAssetRef: text("icon_asset_ref"),
  meshAssetRef: text("mesh_asset_ref"),
  loreText: text("lore_text"),
  questRef: text("quest_ref"),
  unlockCondition: text("unlock_condition"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityTemplates = pgTable("creator_city_templates", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  thumbnailRef: text("thumbnail_ref"),
  payload: jsonb("payload").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityVersions = pgTable("creator_city_versions", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityHistory = pgTable("creator_city_history", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  action: text("action").notNull(),
  field: text("field"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: integer("changed_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityStatistics = pgTable("creator_city_statistics", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  totalVisitors: integer("total_visitors").notNull().default(0),
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalRevenue: real("total_revenue").notNull().default(0),
  totalExpenses: real("total_expenses").notNull().default(0),
  crimeEvents: integer("crime_events").notNull().default(0),
  disasterEvents: integer("disaster_events").notNull().default(0),
  questsCompleted: integer("quests_completed").notNull().default(0),
  peakPopulation: integer("peak_population").notNull().default(0),
  averageHappiness: real("average_happiness").notNull().default(75),
  buildingsConstructed: integer("buildings_constructed").notNull().default(0),
  roadsBuilt: integer("roads_built").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCityExports = pgTable("creator_city_exports", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  exportType: text("export_type").notNull().default("json"),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum").notNull(),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityImports = pgTable("creator_city_imports", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  importType: text("import_type").notNull().default("json"),
  sourceData: jsonb("source_data").notNull(),
  importedBy: integer("imported_by").notNull(),
  status: text("status").notNull().default("success"),
  errors: jsonb("errors"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCityRuntime = pgTable("creator_city_runtime", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  sessionId: text("session_id").notNull(),
  isRunning: boolean("is_running").notNull().default(false),
  simulationTick: integer("simulation_tick").notNull().default(0),
  currentHour: real("current_hour").notNull().default(8),
  currentDay: integer("current_day").notNull().default(1),
  weather: text("weather").notNull().default("clear"),
  activeCitizens: integer("active_citizens").notNull().default(0),
  activeVehicles: integer("active_vehicles").notNull().default(0),
  economyBalance: real("economy_balance").notNull().default(0),
  powerLoad: real("power_load").notNull().default(0),
  waterLoad: real("water_load").notNull().default(0),
  crimeLevel: real("crime_level").notNull().default(0),
  emergencyActive: boolean("emergency_active").notNull().default(false),
  runtimeLog: jsonb("runtime_log"),
  startedAt: timestamp("started_at"),
  stoppedAt: timestamp("stopped_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Insert Schemas ────────────────────────────────────────────────────────────

export const insertCitySchema = createInsertSchema(creatorCities, {
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export type InsertCity = z.infer<typeof insertCitySchema>;
