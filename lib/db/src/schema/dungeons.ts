import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const dungeonTypeEnum = pgEnum("dungeon_type", [
  "linear", "branching", "open", "procedural", "raid", "arena", "tower", "maze",
]);

export const dungeonStatusEnum = pgEnum("dungeon_status", [
  "draft", "testing", "published", "archived", "deprecated",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "entrance", "corridor", "chamber", "boss_room", "treasure_room", "puzzle_room",
  "spawn_room", "checkpoint_room", "exit_room", "secret_room",
]);

export const dungeonSpawnTypeEnum = pgEnum("dungeon_spawn_type", [
  "fixed", "random", "wave", "triggered", "respawn", "boss", "elite", "patrol",
]);

export const trapTypeEnum = pgEnum("trap_type", [
  "pressure_plate", "arrow_trap", "spike_trap", "poison_gas", "fire_trap",
  "ice_trap", "electric_trap", "magic_trap", "alarm_trap", "pit_trap",
]);

export const rewardTypeEnum = pgEnum("dungeon_reward_type", [
  "item", "currency", "experience", "skill_point", "loot_table", "chest",
  "blueprint", "cosmetic", "reputation", "custom",
]);

export const dungeonDifficultyEnum = pgEnum("dungeon_difficulty", [
  "easy", "normal", "hard", "expert", "legendary", "nightmare",
]);

export const resetTypeEnum = pgEnum("reset_type", [
  "never", "daily", "weekly", "on_completion", "on_party_wipe", "manual", "timed",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorDungeons = pgTable("creator_dungeons", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  dungeonType: dungeonTypeEnum("dungeon_type").notNull().default("linear"),
  status: dungeonStatusEnum("status").notNull().default("draft"),
  difficulty: dungeonDifficultyEnum("difficulty").notNull().default("normal"),
  resetType: resetTypeEnum("reset_type").notNull().default("daily"),
  resetIntervalHours: real("reset_interval_hours").notNull().default(24),
  minLevel: integer("min_level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(100),
  minPartySize: integer("min_party_size").notNull().default(1),
  maxPartySize: integer("max_party_size").notNull().default(5),
  timeLimit: integer("time_limit"),
  worldRef: text("world_ref"),
  regionRef: text("region_ref"),
  portalRef: text("portal_ref"),
  graphRef: text("graph_ref"),
  runtimeRef: text("runtime_ref"),
  musicAssetRef: text("music_asset_ref"),
  iconAssetRef: text("icon_asset_ref"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorDungeonRooms = pgTable("creator_dungeon_rooms", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  roomType: roomTypeEnum("room_type").notNull().default("chamber"),
  width: real("width").notNull().default(10),
  height: real("height").notNull().default(10),
  depth: real("depth").notNull().default(10),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  isEntrance: boolean("is_entrance").notNull().default(false),
  isExit: boolean("is_exit").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  lockCondition: text("lock_condition"),
  meshAssetRef: text("mesh_asset_ref"),
  textureAssetRef: text("texture_asset_ref"),
  sfxAssetRef: text("sfx_asset_ref"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorDungeonConnections = pgTable("creator_dungeon_connections", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  fromRoomId: integer("from_room_id").notNull(),
  toRoomId: integer("to_room_id").notNull(),
  isBidirectional: boolean("is_bidirectional").notNull().default(true),
  isLocked: boolean("is_locked").notNull().default(false),
  lockType: text("lock_type").notNull().default("none"),
  keyRef: text("key_ref"),
  triggerCondition: text("trigger_condition"),
  travelTime: real("travel_time").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonSpawnpoints = pgTable("creator_dungeon_spawnpoints", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  spawnType: dungeonSpawnTypeEnum("dungeon_spawn_type").notNull().default("fixed"),
  npcRef: text("npc_ref"),
  monsterRef: text("monster_ref"),
  count: integer("count").notNull().default(1),
  maxCount: integer("max_count").notNull().default(1),
  respawnDelay: real("respawn_delay").notNull().default(30),
  triggerCondition: text("trigger_condition"),
  waveNumber: integer("wave_number").notNull().default(1),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonBosses = pgTable("creator_dungeon_bosses", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  npcRef: text("npc_ref"),
  combatRef: text("combat_ref"),
  skillRefs: text("skill_refs").array(),
  aiGraphRef: text("ai_graph_ref"),
  hpMultiplier: real("hp_multiplier").notNull().default(1),
  damageMultiplier: real("damage_multiplier").notNull().default(1),
  phase: integer("phase").notNull().default(1),
  phaseThresholds: jsonb("phase_thresholds"),
  enrageTimer: integer("enrage_timer"),
  deathTrigger: text("death_trigger"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonMonsters = pgTable("creator_dungeon_monsters", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  spawnpointId: integer("spawnpoint_id"),
  npcRef: text("npc_ref"),
  combatRef: text("combat_ref"),
  skillRefs: text("skill_refs").array(),
  hpMultiplier: real("hp_multiplier").notNull().default(1),
  damageMultiplier: real("damage_multiplier").notNull().default(1),
  xpReward: integer("xp_reward").notNull().default(0),
  lootTableRef: text("loot_table_ref"),
  aggroRange: real("aggro_range").notNull().default(10),
  patrolPath: jsonb("patrol_path"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonTraps = pgTable("creator_dungeon_traps", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  trapType: trapTypeEnum("trap_type").notNull().default("pressure_plate"),
  skillRef: text("skill_ref"),
  damageFormula: text("damage_formula").notNull().default("flat"),
  damageAmount: real("damage_amount").notNull().default(10),
  statusEffectRef: text("status_effect_ref"),
  triggerCondition: text("trigger_condition"),
  resetCondition: text("reset_condition"),
  canDisarm: boolean("can_disarm").notNull().default(true),
  disarmDifficulty: integer("disarm_difficulty").notNull().default(10),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  sfxAssetRef: text("sfx_asset_ref"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonPuzzles = pgTable("creator_dungeon_puzzles", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  puzzleGraphRef: text("puzzle_graph_ref"),
  solution: jsonb("solution"),
  hints: jsonb("hints"),
  timeLimit: integer("time_limit"),
  failurePenalty: text("failure_penalty"),
  successTrigger: text("success_trigger"),
  rewardRef: text("reward_ref"),
  isRequired: boolean("is_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonRewards = pgTable("creator_dungeon_rewards", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  name: text("name").notNull(),
  rewardType: rewardTypeEnum("dungeon_reward_type").notNull().default("item"),
  itemRef: text("item_ref"),
  lootTableRef: text("loot_table_ref"),
  currencyAmount: integer("currency_amount").notNull().default(0),
  xpAmount: integer("xp_amount").notNull().default(0),
  triggerCondition: text("trigger_condition").notNull().default("on_completion"),
  isGuaranteed: boolean("is_guaranteed").notNull().default(false),
  dropChance: real("drop_chance").notNull().default(1.0),
  quantity: integer("quantity").notNull().default(1),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonCheckpoints = pgTable("creator_dungeon_checkpoints", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  checkpointIndex: integer("checkpoint_index").notNull().default(0),
  triggerCondition: text("trigger_condition"),
  savePartyState: boolean("save_party_state").notNull().default(true),
  healsParty: boolean("heals_party").notNull().default(false),
  healPercent: real("heal_percent").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonRequirements = pgTable("creator_dungeon_requirements", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  requirementType: text("requirement_type").notNull().default("level"),
  minValue: integer("min_value"),
  maxValue: integer("max_value"),
  itemRef: text("item_ref"),
  questRef: text("quest_ref"),
  skillRef: text("skill_ref"),
  description: text("description"),
  isHardRequirement: boolean("is_hard_requirement").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonEvents = pgTable("creator_dungeon_events", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull().default("trigger"),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  condition: text("condition"),
  priority: integer("priority").notNull().default(0),
  isOneShot: boolean("is_one_shot").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  graphRef: text("graph_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonScripts = pgTable("creator_dungeon_scripts", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  name: text("name").notNull(),
  scriptType: text("script_type").notNull().default("lua"),
  content: text("content").notNull().default(""),
  entrypoint: text("entrypoint").notNull().default("main"),
  triggerOn: text("trigger_on").notNull().default("on_enter"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorDungeonTemplates = pgTable("creator_dungeon_templates", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
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

export const creatorDungeonVersions = pgTable("creator_dungeon_versions", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonHistory = pgTable("creator_dungeon_history", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  action: text("action").notNull(),
  field: text("field"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: integer("changed_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonStatistics = pgTable("creator_dungeon_statistics", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  totalRuns: integer("total_runs").notNull().default(0),
  completedRuns: integer("completed_runs").notNull().default(0),
  failedRuns: integer("failed_runs").notNull().default(0),
  averageCompletionTime: real("average_completion_time"),
  fastestCompletionTime: real("fastest_completion_time"),
  totalBossKills: integer("total_boss_kills").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  averagePartySize: real("average_party_size"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorDungeonExports = pgTable("creator_dungeon_exports", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  exportType: text("export_type").notNull().default("json"),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum").notNull(),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonImports = pgTable("creator_dungeon_imports", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  importType: text("import_type").notNull().default("json"),
  sourceData: jsonb("source_data").notNull(),
  importedBy: integer("imported_by").notNull(),
  status: text("status").notNull().default("success"),
  errors: jsonb("errors"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDungeonRuntime = pgTable("creator_dungeon_runtime", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull(),
  sessionId: text("session_id").notNull(),
  partyIds: jsonb("party_ids"),
  currentRoomId: integer("current_room_id"),
  checkpointId: integer("checkpoint_id"),
  state: text("state").notNull().default("idle"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  runData: jsonb("run_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Insert Schemas ────────────────────────────────────────────────────────────

export const insertDungeonSchema = createInsertSchema(creatorDungeons, {
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export type InsertDungeon = z.infer<typeof insertDungeonSchema>;
