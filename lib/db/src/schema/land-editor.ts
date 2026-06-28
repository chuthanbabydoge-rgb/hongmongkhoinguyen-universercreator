import { pgTable, pgEnum, serial, integer, text, boolean, real, jsonb, timestamp } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const landTypeEnum = pgEnum("land_type", [
  "residential", "commercial", "industrial", "agricultural", "government",
  "protected", "park", "military", "dungeon_land", "custom_zone",
]);

export const landStatusEnum = pgEnum("land_status", [
  "draft", "active", "claimed", "contested", "locked", "archived", "deprecated",
]);

export const landZoneEnum = pgEnum("land_zone", [
  "urban", "suburban", "rural", "wilderness", "coastal", "underground",
  "aerial", "special", "restricted", "pvp",
]);

export const ownershipTypeEnum = pgEnum("ownership_type", [
  "unclaimed", "player", "guild", "npc", "government", "system", "contested", "shared",
]);

export const terrainTypeEnum = pgEnum("terrain_type", [
  "flat", "hilly", "mountainous", "forest", "desert", "swamp", "tundra",
  "volcanic", "coastal", "underground", "custom",
]);

export const utilityTypeEnum = pgEnum("land_utility_type", [
  "water", "power", "gas", "sewage", "network", "magic_conduit",
  "teleport_relay", "resource_node", "custom",
]);

export const landAccessTypeEnum = pgEnum("land_access_type", [
  "public", "private", "restricted", "guild_only", "owner_only", "locked", "secret",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorLandsTable = pgTable("creator_lands", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  worldId: integer("world_id"),
  cityId: integer("city_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  landType: landTypeEnum("land_type").notNull().default("residential"),
  landStatus: landStatusEnum("land_status").notNull().default("draft"),
  landZone: landZoneEnum("land_zone").notNull().default("urban"),
  terrainType: terrainTypeEnum("terrain_type").notNull().default("flat"),
  accessType: landAccessTypeEnum("land_access_type").notNull().default("public"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  width: real("width").notNull().default(100),
  depth: real("depth").notNull().default(100),
  elevation: real("elevation").notNull().default(0),
  totalArea: real("total_area").notNull().default(10000),
  usableArea: real("usable_area").notNull().default(8000),
  parcelCount: integer("parcel_count").notNull().default(0),
  buildingCount: integer("building_count").notNull().default(0),
  populationCap: integer("population_cap").notNull().default(100),
  landGraphId: integer("land_graph_id"),
  zoneGraphId: integer("zone_graph_id"),
  teleportGraphId: integer("teleport_graph_id"),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata"),
  isPublished: boolean("is_published").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  isPvpEnabled: boolean("is_pvp_enabled").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandParcelsTable = pgTable("creator_land_parcels", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  name: text("name").notNull(),
  parcelIndex: integer("parcel_index").notNull().default(0),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  width: real("width").notNull().default(20),
  depth: real("depth").notNull().default(20),
  area: real("area").notNull().default(400),
  landType: landTypeEnum("land_type").notNull().default("residential"),
  accessType: landAccessTypeEnum("land_access_type").notNull().default("public"),
  ownerId: integer("owner_id"),
  buildingId: integer("building_id"),
  price: real("price"),
  isLocked: boolean("is_locked").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandBoundariesTable = pgTable("creator_land_boundaries", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  name: text("name").notNull().default("boundary"),
  boundaryType: text("boundary_type").notNull().default("perimeter"),
  points: jsonb("points").$type<{ x: number; z: number }[]>().notNull().default([]),
  height: real("height").notNull().default(2),
  isPassable: boolean("is_passable").notNull().default(true),
  blocksVision: boolean("blocks_vision").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandOwnersTable = pgTable("creator_land_owners", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  ownerType: ownershipTypeEnum("ownership_type").notNull().default("player"),
  ownerRef: text("owner_ref").notNull(),
  ownerName: text("owner_name"),
  ownershipPercent: real("ownership_percent").notNull().default(100),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  canSell: boolean("can_sell").notNull().default(true),
  canBuild: boolean("can_build").notNull().default(true),
  canSubdivide: boolean("can_subdivide").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandZonesTable = pgTable("creator_land_zones", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  name: text("name").notNull(),
  zoneType: landZoneEnum("land_zone").notNull().default("urban"),
  color: text("color").notNull().default("#4ade80"),
  shape: jsonb("shape").$type<{ x: number; z: number }[]>().notNull().default([]),
  area: real("area").notNull().default(0),
  maxBuildingHeight: real("max_building_height").notNull().default(20),
  maxDensity: integer("max_density").notNull().default(10),
  allowedTypes: jsonb("allowed_types").$type<string[]>().default([]),
  isPvpZone: boolean("is_pvp_zone").notNull().default(false),
  isSafeZone: boolean("is_safe_zone").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandTerrainTable = pgTable("creator_land_terrain", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  terrainType: terrainTypeEnum("terrain_type").notNull().default("flat"),
  heightmapRef: text("heightmap_ref"),
  textureRef: text("texture_ref"),
  materialRef: text("material_ref"),
  resolution: integer("resolution").notNull().default(64),
  scaleX: real("scale_x").notNull().default(1),
  scaleZ: real("scale_z").notNull().default(1),
  heightScale: real("height_scale").notNull().default(10),
  baseElevation: real("base_elevation").notNull().default(0),
  roughness: real("roughness").notNull().default(0.5),
  fertility: real("fertility").notNull().default(0.5),
  layers: jsonb("layers").$type<Record<string, unknown>[]>().default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandUtilitiesTable = pgTable("creator_land_utilities", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  utilityType: utilityTypeEnum("land_utility_type").notNull().default("power"),
  name: text("name").notNull(),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  capacity: real("capacity").notNull().default(100),
  currentLoad: real("current_load").notNull().default(0),
  radius: real("radius").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  connectedParcels: jsonb("connected_parcels").$type<number[]>().default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandRoadsTable = pgTable("creator_land_roads", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  name: text("name").notNull(),
  roadType: text("road_type").notNull().default("street"),
  points: jsonb("points").$type<{ x: number; z: number }[]>().notNull().default([]),
  width: real("width").notNull().default(8),
  speedLimit: real("speed_limit").notNull().default(50),
  isOneWay: boolean("is_one_way").notNull().default(false),
  hasFootpath: boolean("has_footpath").notNull().default(true),
  connectedRoads: jsonb("connected_roads").$type<number[]>().default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandTeleportsTable = pgTable("creator_land_teleports", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  name: text("name").notNull(),
  teleportType: text("teleport_type").notNull().default("waypoint"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  destLandId: integer("dest_land_id"),
  destPosX: real("dest_pos_x"),
  destPosY: real("dest_pos_y"),
  destPosZ: real("dest_pos_z"),
  isPublic: boolean("is_public").notNull().default(true),
  requiredLevel: integer("required_level").notNull().default(1),
  cooldownSeconds: integer("cooldown_seconds").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandBuildingsTable = pgTable("creator_land_buildings", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  parcelId: integer("parcel_id"),
  buildingId: integer("building_id").notNull(),
  buildingRef: text("building_ref"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  scaleX: real("scale_x").notNull().default(1),
  scaleZ: real("scale_z").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandBookmarksTable = pgTable("creator_land_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  landId: integer("land_id").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandTemplatesTable = pgTable("creator_land_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  landType: landTypeEnum("land_type").notNull().default("residential"),
  terrainType: terrainTypeEnum("terrain_type").notNull().default("flat"),
  payload: jsonb("payload").notNull().default({}),
  isGlobal: boolean("is_global").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandVersionsTable = pgTable("creator_land_versions", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull().default({}),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandHistoryTable = pgTable("creator_land_history", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull().default("land"),
  entityId: integer("entity_id"),
  performedBy: integer("performed_by").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandStatisticsTable = pgTable("creator_land_statistics", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  totalParcels: integer("total_parcels").notNull().default(0),
  claimedParcels: integer("claimed_parcels").notNull().default(0),
  totalBuildings: integer("total_buildings").notNull().default(0),
  totalRoads: integer("total_roads").notNull().default(0),
  totalTeleports: integer("total_teleports").notNull().default(0),
  totalUtilities: integer("total_utilities").notNull().default(0),
  populationCount: integer("population_count").notNull().default(0),
  taxRevenue: real("tax_revenue").notNull().default(0),
  developmentScore: real("development_score").notNull().default(0),
  utilizationRate: real("utilization_rate").notNull().default(0),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandExportsTable = pgTable("creator_land_exports", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  format: text("format").notNull().default("json"),
  payload: jsonb("payload").notNull().default({}),
  checksum: text("checksum"),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandImportsTable = pgTable("creator_land_imports", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  format: text("format").notNull().default("json"),
  payload: jsonb("payload").notNull().default({}),
  status: text("status").notNull().default("pending"),
  errors: jsonb("errors").$type<string[]>().default([]),
  importedBy: integer("imported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorLandRuntimeTable = pgTable("creator_land_runtime", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  isStreaming: boolean("is_streaming").notNull().default(false),
  activeChunks: jsonb("active_chunks").$type<number[]>().default([]),
  loadedParcels: integer("loaded_parcels").notNull().default(0),
  activeBuildings: integer("active_buildings").notNull().default(0),
  roadNetworkStatus: text("road_network_status").notNull().default("offline"),
  utilityNetworkStatus: text("utility_network_status").notNull().default("offline"),
  teleportNetworkStatus: text("teleport_network_status").notNull().default("offline"),
  simulationTick: integer("simulation_tick").notNull().default(0),
  trafficDensity: real("traffic_density").notNull().default(0),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandPermissionsTable = pgTable("creator_land_permissions", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  entityType: text("entity_type").notNull().default("player"),
  entityRef: text("entity_ref").notNull(),
  canView: boolean("can_view").notNull().default(true),
  canBuild: boolean("can_build").notNull().default(false),
  canEdit: boolean("can_edit").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
  canManage: boolean("can_manage").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorLandMarketplaceTable = pgTable("creator_land_marketplace", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(),
  parcelId: integer("parcel_id"),
  sellerId: integer("seller_id").notNull(),
  listingType: text("listing_type").notNull().default("sale"),
  price: real("price").notNull().default(0),
  currency: text("currency").notNull().default("gold"),
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  buyerId: integer("buyer_id"),
  boughtAt: timestamp("bought_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
