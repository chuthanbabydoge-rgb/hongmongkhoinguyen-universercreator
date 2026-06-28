import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  real,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const transportTypeEnum = pgEnum("transport_type", [
  "road","highway","railway","metro","airport","seaport","bus_route","taxi","parking","teleport","logistics","navigation","bridge","tunnel","custom",
]);

export const transportRoadTypeEnum = pgEnum("transport_road_type", [
  "local_road","arterial","highway","expressway","alley","path","bridge_road","tunnel_road","elevated","underground","custom",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "car","truck","bus","train","metro","tram","airplane","helicopter","ship","ferry","motorcycle","bicycle","drone","tank","custom",
]);

export const transportStatusEnum = pgEnum("transport_status", [
  "draft","active","under_construction","maintenance","closed","archived","deprecated",
]);

export const trafficSignalStateEnum = pgEnum("traffic_signal_state", [
  "red","yellow","green","flashing_red","flashing_yellow","off","custom",
]);

export const stationTypeEnum = pgEnum("station_type", [
  "bus_stop","train_station","metro_station","airport_terminal","seaport_terminal","taxi_stand","parking_lot","checkpoint","waypoint","teleport_hub","custom",
]);

export const routeTypeEnum = pgEnum("route_type", [
  "commuter","express","freight","scenic","emergency","military","tourist","delivery","patrol","custom",
]);

export const transportAccessTypeEnum = pgEnum("transport_access_type", [
  "public","private","restricted","toll","vip","emergency_only","freight_only","custom",
]);

export const creatorTransportNetworksTable = pgTable("creator_transport_networks", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  worldId: integer("world_id"),
  cityId: integer("city_id"),
  landId: integer("land_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  transportType: transportTypeEnum("transport_type").notNull().default("road"),
  transportStatus: transportStatusEnum("transport_status").notNull().default("draft"),
  networkGraph: jsonb("network_graph").default({}),
  totalLength: real("total_length").notNull().default(0),
  totalNodes: integer("total_nodes").notNull().default(0),
  totalEdges: integer("total_edges").notNull().default(0),
  trafficGraphId: integer("traffic_graph_id"),
  vehicleGraphId: integer("vehicle_graph_id"),
  routeGraphId: integer("route_graph_id"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata"),
  isPublished: boolean("is_published").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportRoadsTable = pgTable("creator_transport_roads", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  roadType: transportRoadTypeEnum("transport_road_type").notNull().default("local_road"),
  accessType: transportAccessTypeEnum("transport_access_type").notNull().default("public"),
  points: jsonb("points").notNull().default([]),
  width: real("width").notNull().default(8),
  lanes: integer("lanes").notNull().default(2),
  speedLimit: real("speed_limit").notNull().default(50),
  isOneWay: boolean("is_one_way").notNull().default(false),
  hasSidewalk: boolean("has_sidewalk").notNull().default(true),
  isTollRoad: boolean("is_toll_road").notNull().default(false),
  tollAmount: real("toll_amount").notNull().default(0),
  surfaceMaterial: text("surface_material").notNull().default("asphalt"),
  length: real("length").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportIntersectionsTable = pgTable("creator_transport_intersections", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  connectedRoads: jsonb("connected_roads").default([]),
  hasTrafficLight: boolean("has_traffic_light").notNull().default(false),
  signalId: integer("signal_id"),
  intersectionType: text("intersection_type").notNull().default("standard"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportRoutesTable = pgTable("creator_transport_routes", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  routeCode: text("route_code"),
  routeType: routeTypeEnum("route_type").notNull().default("commuter"),
  accessType: transportAccessTypeEnum("transport_access_type").notNull().default("public"),
  waypoints: jsonb("waypoints").notNull().default([]),
  stationIds: jsonb("station_ids").default([]),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull().default("bus"),
  frequency: real("frequency").notNull().default(30),
  operatingHours: text("operating_hours").notNull().default("06:00-22:00"),
  capacity: integer("capacity").notNull().default(50),
  fare: real("fare").notNull().default(0),
  distance: real("distance").notNull().default(0),
  duration: real("duration").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportStationsTable = pgTable("creator_transport_stations", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  stationType: stationTypeEnum("station_type").notNull().default("bus_stop"),
  accessType: transportAccessTypeEnum("transport_access_type").notNull().default("public"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  buildingId: integer("building_id"),
  platformCount: integer("platform_count").notNull().default(1),
  capacity: integer("capacity").notNull().default(100),
  amenities: jsonb("amenities").default([]),
  connectedRoutes: jsonb("connected_routes").default([]),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportVehiclesTable = pgTable("creator_transport_vehicles", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull().default("car"),
  modelRef: text("model_ref"),
  routeId: integer("route_id"),
  ownerId: integer("owner_id"),
  capacity: integer("capacity").notNull().default(4),
  maxSpeed: real("max_speed").notNull().default(120),
  fuelType: text("fuel_type").notNull().default("gasoline"),
  fuelCapacity: real("fuel_capacity").notNull().default(60),
  cargoCapacity: real("cargo_capacity").notNull().default(0),
  isNpcVehicle: boolean("is_npc_vehicle").notNull().default(false),
  aiPathfinding: boolean("ai_pathfinding").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportParkingTable = pgTable("creator_transport_parking", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  totalSpots: integer("total_spots").notNull().default(50),
  usedSpots: integer("used_spots").notNull().default(0),
  parkingType: text("parking_type").notNull().default("surface"),
  hourlyRate: real("hourly_rate").notNull().default(0),
  maxDuration: real("max_duration").notNull().default(24),
  allowedVehicles: jsonb("allowed_vehicles").default([]),
  buildingId: integer("building_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportSignalsTable = pgTable("creator_transport_signals", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  intersectionId: integer("intersection_id"),
  name: text("name").notNull(),
  state: trafficSignalStateEnum("traffic_signal_state").notNull().default("red"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  redDuration: real("red_duration").notNull().default(30),
  yellowDuration: real("yellow_duration").notNull().default(5),
  greenDuration: real("green_duration").notNull().default(25),
  isAdaptive: boolean("is_adaptive").notNull().default(false),
  controlledLanes: jsonb("controlled_lanes").default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportBridgesTable = pgTable("creator_transport_bridges", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  roadId: integer("road_id"),
  name: text("name").notNull(),
  bridgeType: text("bridge_type").notNull().default("beam"),
  startPosX: real("start_pos_x").notNull().default(0),
  startPosZ: real("start_pos_z").notNull().default(0),
  endPosX: real("end_pos_x").notNull().default(0),
  endPosZ: real("end_pos_z").notNull().default(0),
  span: real("span").notNull().default(50),
  clearance: real("clearance").notNull().default(8),
  loadCapacity: real("load_capacity").notNull().default(40),
  material: text("material").notNull().default("concrete"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportTunnelsTable = pgTable("creator_transport_tunnels", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  roadId: integer("road_id"),
  name: text("name").notNull(),
  tunnelType: text("tunnel_type").notNull().default("road"),
  points: jsonb("points").notNull().default([]),
  length: real("length").notNull().default(100),
  diameter: real("diameter").notNull().default(10),
  depth: real("depth").notNull().default(20),
  hasVentilation: boolean("has_ventilation").notNull().default(true),
  maxVehicleHeight: real("max_vehicle_height").notNull().default(4.5),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportPortsTable = pgTable("creator_transport_ports", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  portType: text("port_type").notNull().default("seaport"),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  berthCount: integer("berth_count").notNull().default(4),
  cargoCapacity: real("cargo_capacity").notNull().default(10000),
  passengerCapacity: integer("passenger_capacity").notNull().default(500),
  connectedRoutes: jsonb("connected_routes").default([]),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportAirportsTable = pgTable("creator_transport_airports", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  iataCode: text("iata_code"),
  posX: real("pos_x").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  runwayCount: integer("runway_count").notNull().default(2),
  terminalCount: integer("terminal_count").notNull().default(1),
  gateCount: integer("gate_count").notNull().default(10),
  passengerCapacity: integer("passenger_capacity").notNull().default(5000),
  cargoCapacity: real("cargo_capacity").notNull().default(50000),
  connectedRoutes: jsonb("connected_routes").default([]),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportRailwaysTable = pgTable("creator_transport_railways", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  railType: text("rail_type").notNull().default("standard"),
  points: jsonb("points").notNull().default([]),
  gaugeWidth: real("gauge_width").notNull().default(1.435),
  maxSpeed: real("max_speed").notNull().default(200),
  isElectrified: boolean("is_electrified").notNull().default(true),
  isDoubleTrack: boolean("is_double_track").notNull().default(false),
  length: real("length").notNull().default(0),
  connectedStations: jsonb("connected_stations").default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportCheckpointsTable = pgTable("creator_transport_checkpoints", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  name: text("name").notNull(),
  checkpointType: text("checkpoint_type").notNull().default("toll"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  accessType: transportAccessTypeEnum("transport_access_type").notNull().default("public"),
  fee: real("fee").notNull().default(0),
  requiredLevel: integer("required_level").notNull().default(1),
  connectedRoads: jsonb("connected_roads").default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportTemplatesTable = pgTable("creator_transport_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  transportType: transportTypeEnum("transport_type").notNull().default("road"),
  payload: jsonb("payload").notNull().default({}),
  isGlobal: boolean("is_global").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportVersionsTable = pgTable("creator_transport_versions", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull().default({}),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorTransportHistoryTable = pgTable("creator_transport_history", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull().default("network"),
  entityId: integer("entity_id"),
  performedBy: integer("performed_by").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorTransportStatisticsTable = pgTable("creator_transport_statistics", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  totalRoads: integer("total_roads").notNull().default(0),
  totalRoutes: integer("total_routes").notNull().default(0),
  totalStations: integer("total_stations").notNull().default(0),
  totalVehicles: integer("total_vehicles").notNull().default(0),
  totalParkingSpots: integer("total_parking_spots").notNull().default(0),
  totalSignals: integer("total_signals").notNull().default(0),
  totalLength: real("total_length").notNull().default(0),
  avgTrafficDensity: real("avg_traffic_density").notNull().default(0),
  congestionScore: real("congestion_score").notNull().default(0),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportRuntimeTable = pgTable("creator_transport_runtime", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  isStreaming: boolean("is_streaming").notNull().default(false),
  activeVehicles: integer("active_vehicles").notNull().default(0),
  trafficDensity: real("traffic_density").notNull().default(0),
  avgSpeed: real("avg_speed").notNull().default(0),
  congestionLevel: real("congestion_level").notNull().default(0),
  signalCycleOffset: integer("signal_cycle_offset").notNull().default(0),
  simulationTick: integer("simulation_tick").notNull().default(0),
  roadNetworkStatus: text("road_network_status").notNull().default("offline"),
  railNetworkStatus: text("rail_network_status").notNull().default("offline"),
  airNetworkStatus: text("air_network_status").notNull().default("offline"),
  seaNetworkStatus: text("sea_network_status").notNull().default("offline"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorTransportExportsTable = pgTable("creator_transport_exports", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  format: text("format").notNull().default("json"),
  payload: jsonb("payload").notNull().default({}),
  checksum: text("checksum"),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
