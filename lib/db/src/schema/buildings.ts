import { pgTable, pgEnum, serial, integer, text, boolean, real, jsonb, timestamp } from "drizzle-orm/pg-core";

export const buildingTypeEnum = pgEnum("building_type", [
  "house", "apartment", "office", "shop", "factory", "school",
  "hospital", "government", "stadium", "dungeon_entrance", "custom",
]);

export const buildingStatusEnum = pgEnum("building_status", [
  "draft", "active", "archived", "deprecated",
]);

export const buildingCategoryEnum = pgEnum("building_category", [
  "residential", "commercial", "industrial", "civic", "educational",
  "medical", "recreational", "military", "religious", "special",
]);

export const buildingMaterialEnum = pgEnum("building_material", [
  "wood", "stone", "brick", "concrete", "steel", "glass", "mixed", "custom",
]);

export const buildingAccessTypeEnum = pgEnum("building_access_type", [
  "public", "private", "restricted", "locked", "secret",
]);

export const buildingPowerStateEnum = pgEnum("building_power_state", [
  "on", "off", "emergency", "backup", "off_grid",
]);

export const buildingSecurityLevelEnum = pgEnum("building_security_level", [
  "none", "basic", "standard", "high", "maximum",
]);

export const creatorBuildingsTable = pgTable("creator_buildings", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  cityId: integer("city_id"),
  districtId: integer("district_id"),
  worldRef: text("world_ref"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  buildingType: buildingTypeEnum("building_type").notNull().default("house"),
  buildingStatus: buildingStatusEnum("building_status").notNull().default("draft"),
  buildingCategory: buildingCategoryEnum("building_category").notNull().default("residential"),
  buildingMaterial: buildingMaterialEnum("building_material").notNull().default("brick"),
  accessType: buildingAccessTypeEnum("access_type").notNull().default("public"),
  powerState: buildingPowerStateEnum("power_state").notNull().default("on"),
  securityLevel: buildingSecurityLevelEnum("security_level").notNull().default("basic"),
  floorCount: integer("floor_count").notNull().default(1),
  width: real("width").notNull().default(10),
  depth: real("depth").notNull().default(10),
  height: real("height").notNull().default(4),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  maxOccupancy: integer("max_occupancy").notNull().default(10),
  currentOccupancy: integer("current_occupancy").notNull().default(0),
  rentPrice: real("rent_price"),
  purchasePrice: real("purchase_price"),
  maintenanceCost: real("maintenance_cost").notNull().default(0),
  powerConsumption: real("power_consumption").notNull().default(100),
  waterConsumption: real("water_consumption").notNull().default(50),
  modelAssetId: integer("model_asset_id"),
  thumbnailAssetId: integer("thumbnail_asset_id"),
  textureAssetId: integer("texture_asset_id"),
  buildingGraphId: integer("building_graph_id"),
  interactionGraphId: integer("interaction_graph_id"),
  runtimeRef: text("runtime_ref"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  isDestructible: boolean("is_destructible").notNull().default(false),
  hasBasement: boolean("has_basement").notNull().default(false),
  hasRooftop: boolean("has_rooftop").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingFloorsTable = pgTable("creator_building_floors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorNumber: integer("floor_number").notNull().default(0),
  name: text("name").notNull().default("Ground Floor"),
  height: real("height").notNull().default(3),
  ceilingHeight: real("ceiling_height").notNull().default(3),
  floorplanAssetId: integer("floorplan_asset_id"),
  isBasement: boolean("is_basement").notNull().default(false),
  isRooftop: boolean("is_rooftop").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingRoomsTable = pgTable("creator_building_rooms", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id").notNull(),
  name: text("name").notNull(),
  roomType: text("room_type").notNull().default("generic"),
  width: real("width").notNull().default(4),
  depth: real("depth").notNull().default(4),
  height: real("height").notNull().default(3),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  accessType: buildingAccessTypeEnum("access_type").notNull().default("public"),
  maxOccupancy: integer("max_occupancy").notNull().default(4),
  isLocked: boolean("is_locked").notNull().default(false),
  keyRef: text("key_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingDoorsTable = pgTable("creator_building_doors", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id").notNull(),
  roomFromId: integer("room_from_id"),
  roomToId: integer("room_to_id"),
  doorType: text("door_type").notNull().default("standard"),
  width: real("width").notNull().default(1),
  height: real("height").notNull().default(2.1),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  isAutomatic: boolean("is_automatic").notNull().default(false),
  isExterior: boolean("is_exterior").notNull().default(false),
  keyRef: text("key_ref"),
  modelAssetId: integer("model_asset_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingWindowsTable = pgTable("creator_building_windows", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id").notNull(),
  roomId: integer("room_id"),
  windowType: text("window_type").notNull().default("standard"),
  width: real("width").notNull().default(1.2),
  height: real("height").notNull().default(1.4),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  posY: real("pos_y").notNull().default(1),
  rotY: real("rot_y").notNull().default(0),
  isBreakable: boolean("is_breakable").notNull().default(false),
  isOpen: boolean("is_open").notNull().default(false),
  modelAssetId: integer("model_asset_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingUtilitiesTable = pgTable("creator_building_utilities", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  roomId: integer("room_id"),
  utilityType: text("utility_type").notNull(),
  name: text("name").notNull(),
  powerDraw: real("power_draw").notNull().default(0),
  waterDraw: real("water_draw").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingFurnitureTable = pgTable("creator_building_furniture", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id").notNull(),
  roomId: integer("room_id"),
  itemRef: text("item_ref"),
  name: text("name").notNull(),
  furnitureType: text("furniture_type").notNull().default("generic"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  scaleX: real("scale_x").notNull().default(1),
  scaleY: real("scale_y").notNull().default(1),
  scaleZ: real("scale_z").notNull().default(1),
  isInteractable: boolean("is_interactable").notNull().default(true),
  isDestructible: boolean("is_destructible").notNull().default(false),
  isContainer: boolean("is_container").notNull().default(false),
  lootTableRef: text("loot_table_ref"),
  modelAssetId: integer("model_asset_id"),
  interactionGraphId: integer("interaction_graph_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingNpcsTable = pgTable("creator_building_npcs", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  roomId: integer("room_id"),
  npcRef: text("npc_ref").notNull(),
  npcName: text("npc_name"),
  role: text("role").notNull().default("resident"),
  scheduleRef: text("schedule_ref"),
  spawnX: real("spawn_x").notNull().default(0),
  spawnY: real("spawn_y").notNull().default(0),
  spawnZ: real("spawn_z").notNull().default(0),
  isResident: boolean("is_resident").notNull().default(true),
  isWorker: boolean("is_worker").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingPermissionsTable = pgTable("creator_building_permissions", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  entityType: text("entity_type").notNull().default("player"),
  entityRef: text("entity_ref"),
  factionRef: text("faction_ref"),
  canEnter: boolean("can_enter").notNull().default(true),
  canModify: boolean("can_modify").notNull().default(false),
  canOwn: boolean("can_own").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingSecurityTable = pgTable("creator_building_security", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  securityLevel: buildingSecurityLevelEnum("security_level").notNull().default("basic"),
  hasAlarm: boolean("has_alarm").notNull().default(false),
  hasCameras: boolean("has_cameras").notNull().default(false),
  hasGuards: boolean("has_guards").notNull().default(false),
  alarmTriggerRef: text("alarm_trigger_ref"),
  guardPatrolRef: text("guard_patrol_ref"),
  lockdownGraphId: integer("lockdown_graph_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingSpawnpointsTable = pgTable("creator_building_spawnpoints", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  floorId: integer("floor_id"),
  roomId: integer("room_id"),
  label: text("label").notNull().default("default"),
  spawnType: text("spawn_type").notNull().default("player"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingEventsTable = pgTable("creator_building_events", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  eventType: text("event_type").notNull(),
  label: text("label").notNull(),
  graphRef: text("graph_ref"),
  triggerCondition: text("trigger_condition"),
  cooldownMs: integer("cooldown_ms").notNull().default(0),
  isRepeatable: boolean("is_repeatable").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingTemplatesTable = pgTable("creator_building_templates", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  buildingId: integer("building_id"),
  name: text("name").notNull(),
  description: text("description"),
  buildingType: buildingTypeEnum("building_type").notNull().default("house"),
  buildingCategory: buildingCategoryEnum("building_category").notNull().default("residential"),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum"),
  isGlobal: boolean("is_global").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingVersionsTable = pgTable("creator_building_versions", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  snapshot: jsonb("snapshot").notNull(),
  checksum: text("checksum"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingHistoryTable = pgTable("creator_building_history", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  diff: jsonb("diff"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingStatisticsTable = pgTable("creator_building_statistics", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  totalRooms: integer("total_rooms").notNull().default(0),
  totalFloors: integer("total_floors").notNull().default(0),
  totalDoors: integer("total_doors").notNull().default(0),
  totalWindows: integer("total_windows").notNull().default(0),
  totalFurniture: integer("total_furniture").notNull().default(0),
  totalNpcs: integer("total_npcs").notNull().default(0),
  avgOccupancy: real("avg_occupancy").notNull().default(0),
  peakOccupancy: integer("peak_occupancy").notNull().default(0),
  totalPowerUsed: real("total_power_used").notNull().default(0),
  totalWaterUsed: real("total_water_used").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingExportsTable = pgTable("creator_building_exports", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  exportedBy: integer("exported_by").notNull(),
  format: text("format").notNull().default("json"),
  checksum: text("checksum"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingImportsTable = pgTable("creator_building_imports", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  importedBy: integer("imported_by").notNull(),
  format: text("format").notNull().default("json"),
  status: text("status").notNull().default("success"),
  errors: jsonb("errors"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBuildingRuntimeTable = pgTable("creator_building_runtime", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id").notNull(),
  sessionId: text("session_id").notNull(),
  isPowered: boolean("is_powered").notNull().default(true),
  isWaterOn: boolean("is_water_on").notNull().default(true),
  isLightsOn: boolean("is_lights_on").notNull().default(true),
  isOpen: boolean("is_open").notNull().default(true),
  isOnFire: boolean("is_on_fire").notNull().default(false),
  powerState: buildingPowerStateEnum("power_state").notNull().default("on"),
  securityLevel: buildingSecurityLevelEnum("security_level").notNull().default("basic"),
  currentOccupancy: integer("current_occupancy").notNull().default(0),
  activeNpcs: integer("active_npcs").notNull().default(0),
  tickCount: integer("tick_count").notNull().default(0),
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBuildingBookmarksTable = pgTable("creator_building_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  buildingId: integer("building_id").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
