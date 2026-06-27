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

export const npcTypeEnum = pgEnum("npc_type", [
  "humanoid",
  "creature",
  "boss",
  "merchant",
  "quest_giver",
  "guard",
  "neutral",
  "companion",
  "enemy",
  "custom",
]);

export const npcStateEnum = pgEnum("npc_state", [
  "idle",
  "patrolling",
  "chasing",
  "attacking",
  "fleeing",
  "interacting",
  "dead",
  "sleeping",
  "working",
  "custom",
]);

export const npcBehaviorEnum = pgEnum("npc_behavior", [
  "aggressive",
  "defensive",
  "passive",
  "cowardly",
  "neutral",
  "friendly",
  "territorial",
  "custom",
]);

export const npcDialogueTypeEnum = pgEnum("npc_dialogue_type", [
  "greeting",
  "quest",
  "trade",
  "combat",
  "ambient",
  "lore",
  "farewell",
  "custom",
]);

export const npcRelationEnum = pgEnum("npc_relation", [
  "ally",
  "enemy",
  "neutral",
  "friend",
  "rival",
  "leader",
  "follower",
  "custom",
]);

export const npcSpawnModeEnum = pgEnum("npc_spawn_mode", [
  "fixed",
  "random",
  "scripted",
  "wave",
  "respawn",
  "one_time",
  "custom",
]);

export const npcAnimationStateEnum = pgEnum("npc_animation_state", [
  "idle",
  "walk",
  "run",
  "attack",
  "defend",
  "death",
  "emote",
  "interact",
  "custom",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

// 1. NPCs — master record
export const creatorNpcs = pgTable("creator_npcs", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  projectId: integer("project_id").references(() => creatorProjectsTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),
  npcType: npcTypeEnum("npc_type").notNull().default("humanoid"),
  state: npcStateEnum("state").notNull().default("idle"),
  behavior: npcBehaviorEnum("behavior").notNull().default("neutral"),
  level: integer("level").notNull().default(1),
  isTemplate: boolean("is_template").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  parentNpcId: integer("parent_npc_id"),
  factionId: integer("faction_id"),
  tags: jsonb("tags").notNull().default([]),
  visibility: text("visibility").notNull().default("private"),
  version: integer("version").notNull().default(1),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 2. NPC Profiles — lore, backstory, appearance
export const creatorNpcProfiles = pgTable("creator_npc_profiles", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  race: text("race").notNull().default("human"),
  gender: text("gender").notNull().default("none"),
  age: integer("age"),
  height: real("height"),
  weight: real("weight"),
  occupation: text("occupation"),
  backstory: text("backstory"),
  personality: text("personality"),
  appearance: text("appearance"),
  voiceType: text("voice_type"),
  language: text("language").notNull().default("common"),
  modelAssetId: integer("model_asset_id"),
  portraitAssetId: integer("portrait_asset_id"),
  extra: jsonb("extra").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 3. NPC Attributes — RPG attributes
export const creatorNpcAttributes = pgTable("creator_npc_attributes", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  strength: integer("strength").notNull().default(10),
  dexterity: integer("dexterity").notNull().default(10),
  intelligence: integer("intelligence").notNull().default(10),
  wisdom: integer("wisdom").notNull().default(10),
  charisma: integer("charisma").notNull().default(10),
  constitution: integer("constitution").notNull().default(10),
  luck: integer("luck").notNull().default(10),
  perception: integer("perception").notNull().default(10),
  extra: jsonb("extra").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 4. NPC Stats — combat/runtime stats
export const creatorNpcStats = pgTable("creator_npc_stats", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  maxHp: integer("max_hp").notNull().default(100),
  currentHp: integer("current_hp").notNull().default(100),
  maxMp: integer("max_mp").notNull().default(50),
  currentMp: integer("current_mp").notNull().default(50),
  maxStamina: integer("max_stamina").notNull().default(100),
  attackPower: integer("attack_power").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  magicPower: integer("magic_power").notNull().default(5),
  magicDefense: integer("magic_defense").notNull().default(5),
  speed: real("speed").notNull().default(3.0),
  attackRange: real("attack_range").notNull().default(1.5),
  detectionRange: real("detection_range").notNull().default(10.0),
  experienceReward: integer("experience_reward").notNull().default(10),
  goldReward: integer("gold_reward").notNull().default(0),
  extra: jsonb("extra").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 5. NPC Skills
export const creatorNpcSkills = pgTable("creator_npc_skills", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  skillType: text("skill_type").notNull().default("active"),
  targetType: text("target_type").notNull().default("single"),
  damage: integer("damage").notNull().default(0),
  healAmount: integer("heal_amount").notNull().default(0),
  mpCost: integer("mp_cost").notNull().default(0),
  staminaCost: integer("stamina_cost").notNull().default(0),
  cooldownSeconds: real("cooldown_seconds").notNull().default(0),
  range: real("range").notNull().default(1.5),
  duration: real("duration").notNull().default(0),
  level: integer("level").notNull().default(1),
  isPassive: boolean("is_passive").notNull().default(false),
  effects: jsonb("effects").notNull().default([]),
  conditions: jsonb("conditions").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 6. NPC Inventory
export const creatorNpcInventory = pgTable("creator_npc_inventory", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  itemId: integer("item_id"),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull().default("misc"),
  quantity: integer("quantity").notNull().default(1),
  slotIndex: integer("slot_index").notNull().default(0),
  isEquipped: boolean("is_equipped").notNull().default(false),
  dropChance: real("drop_chance").notNull().default(0),
  isSellable: boolean("is_sellable").notNull().default(false),
  sellPrice: integer("sell_price").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 7. NPC Equipment
export const creatorNpcEquipment = pgTable("creator_npc_equipment", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  slot: text("slot").notNull(),
  itemId: integer("item_id"),
  itemName: text("item_name"),
  assetId: integer("asset_id"),
  statBonus: jsonb("stat_bonus").notNull().default({}),
  isVisible: boolean("is_visible").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 8. NPC Behaviors
export const creatorNpcBehaviors = pgTable("creator_npc_behaviors", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  behaviorType: npcBehaviorEnum("behavior_type").notNull().default("neutral"),
  priority: integer("priority").notNull().default(0),
  triggerConditions: jsonb("trigger_conditions").notNull().default({}),
  actions: jsonb("actions").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  cooldownSeconds: real("cooldown_seconds").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 9. NPC Behavior Trees
export const creatorNpcBehaviorTrees = pgTable("creator_npc_behavior_trees", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Main Behavior Tree"),
  rootNodeId: text("root_node_id"),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 10. NPC Dialogues
export const creatorNpcDialogues = pgTable("creator_npc_dialogues", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dialogueType: npcDialogueTypeEnum("dialogue_type").notNull().default("greeting"),
  triggerConditions: jsonb("trigger_conditions").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 11. NPC Dialogue Nodes
export const creatorNpcDialogueNodes = pgTable("creator_npc_dialogue_nodes", {
  id: serial("id").primaryKey(),
  dialogueId: integer("dialogue_id").notNull().references(() => creatorNpcDialogues.id, { onDelete: "cascade" }),
  nodeKey: text("node_key").notNull(),
  speaker: text("speaker").notNull().default("npc"),
  text: text("text").notNull(),
  animationState: npcAnimationStateEnum("animation_state").notNull().default("idle"),
  voiceLineId: text("voice_line_id"),
  delay: real("delay").notNull().default(0),
  conditions: jsonb("conditions").notNull().default({}),
  actions: jsonb("actions").notNull().default([]),
  isStart: boolean("is_start").notNull().default(false),
  isEnd: boolean("is_end").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 12. NPC Dialogue Choices
export const creatorNpcDialogueChoices = pgTable("creator_npc_dialogue_choices", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").notNull().references(() => creatorNpcDialogueNodes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  nextNodeKey: text("next_node_key"),
  order: integer("order").notNull().default(0),
  conditions: jsonb("conditions").notNull().default({}),
  effects: jsonb("effects").notNull().default([]),
  isHidden: boolean("is_hidden").notNull().default(false),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 13. NPC Spawn Points
export const creatorNpcSpawnPoints = pgTable("creator_npc_spawn_points", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  worldId: integer("world_id"),
  regionId: integer("region_id"),
  name: text("name").notNull(),
  spawnMode: npcSpawnModeEnum("spawn_mode").notNull().default("fixed"),
  posX: real("pos_x").notNull().default(0),
  posY: real("pos_y").notNull().default(0),
  posZ: real("pos_z").notNull().default(0),
  rotY: real("rot_y").notNull().default(0),
  radius: real("radius").notNull().default(0),
  maxCount: integer("max_count").notNull().default(1),
  respawnTimeSeconds: real("respawn_time_seconds").notNull().default(60),
  conditions: jsonb("conditions").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 14. NPC Patrol Paths
export const creatorNpcPatrolPaths = pgTable("creator_npc_patrol_paths", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Patrol Route"),
  isLooping: boolean("is_looping").notNull().default(true),
  patrolSpeed: real("patrol_speed").notNull().default(1.5),
  waitTimeSeconds: real("wait_time_seconds").notNull().default(2),
  waypoints: jsonb("waypoints").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 15. NPC Relations
export const creatorNpcRelations = pgTable("creator_npc_relations", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  targetNpcId: integer("target_npc_id").notNull().references(() => creatorNpcs.id),
  relation: npcRelationEnum("relation").notNull().default("neutral"),
  affinity: integer("affinity").notNull().default(0),
  notes: text("notes"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 16. NPC Factions
export const creatorNpcFactions = pgTable("creator_npc_factions", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  projectId: integer("project_id").references(() => creatorProjectsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#4f8ef7"),
  icon: text("icon"),
  isPlayerFaction: boolean("is_player_faction").notNull().default(false),
  baseReputation: integer("base_reputation").notNull().default(0),
  factionRelations: jsonb("faction_relations").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 17. NPC Schedules
export const creatorNpcSchedules = pgTable("creator_npc_schedules", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Daily Schedule"),
  isActive: boolean("is_active").notNull().default(true),
  entries: jsonb("entries").notNull().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 18. NPC Versions
export const creatorNpcVersions = pgTable("creator_npc_versions", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  version: integer("version").notNull(),
  label: text("label"),
  description: text("description"),
  snapshot: jsonb("snapshot").notNull().default({}),
  isAutomatic: boolean("is_automatic").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 19. NPC History
export const creatorNpcHistory = pgTable("creator_npc_history", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => creatorNpcs.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  action: text("action").notNull(),
  description: text("description"),
  before: jsonb("before").notNull().default({}),
  after: jsonb("after").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 20. NPC Templates
export const creatorNpcTemplates = pgTable("creator_npc_templates", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id),
  sourceNpcId: integer("source_npc_id").references(() => creatorNpcs.id),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  npcType: npcTypeEnum("npc_type").notNull().default("humanoid"),
  tags: jsonb("tags").notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  templateData: jsonb("template_data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorNpc = typeof creatorNpcs.$inferSelect;
export type InsertCreatorNpc = typeof creatorNpcs.$inferInsert;
export const insertCreatorNpcSchema = createInsertSchema(creatorNpcs);

export type CreatorNpcProfile = typeof creatorNpcProfiles.$inferSelect;
export type InsertCreatorNpcProfile = typeof creatorNpcProfiles.$inferInsert;
export const insertCreatorNpcProfileSchema = createInsertSchema(creatorNpcProfiles);

export type CreatorNpcAttributes = typeof creatorNpcAttributes.$inferSelect;
export type InsertCreatorNpcAttributes = typeof creatorNpcAttributes.$inferInsert;
export const insertCreatorNpcAttributesSchema = createInsertSchema(creatorNpcAttributes);

export type CreatorNpcStats = typeof creatorNpcStats.$inferSelect;
export type InsertCreatorNpcStats = typeof creatorNpcStats.$inferInsert;
export const insertCreatorNpcStatsSchema = createInsertSchema(creatorNpcStats);

export type CreatorNpcSkill = typeof creatorNpcSkills.$inferSelect;
export type InsertCreatorNpcSkill = typeof creatorNpcSkills.$inferInsert;
export const insertCreatorNpcSkillSchema = createInsertSchema(creatorNpcSkills);

export type CreatorNpcInventoryItem = typeof creatorNpcInventory.$inferSelect;
export type InsertCreatorNpcInventoryItem = typeof creatorNpcInventory.$inferInsert;

export type CreatorNpcEquipmentSlot = typeof creatorNpcEquipment.$inferSelect;
export type InsertCreatorNpcEquipmentSlot = typeof creatorNpcEquipment.$inferInsert;

export type CreatorNpcBehavior = typeof creatorNpcBehaviors.$inferSelect;
export type InsertCreatorNpcBehavior = typeof creatorNpcBehaviors.$inferInsert;
export const insertCreatorNpcBehaviorSchema = createInsertSchema(creatorNpcBehaviors);

export type CreatorNpcBehaviorTree = typeof creatorNpcBehaviorTrees.$inferSelect;
export type InsertCreatorNpcBehaviorTree = typeof creatorNpcBehaviorTrees.$inferInsert;

export type CreatorNpcDialogue = typeof creatorNpcDialogues.$inferSelect;
export type InsertCreatorNpcDialogue = typeof creatorNpcDialogues.$inferInsert;
export const insertCreatorNpcDialogueSchema = createInsertSchema(creatorNpcDialogues);

export type CreatorNpcDialogueNode = typeof creatorNpcDialogueNodes.$inferSelect;
export type InsertCreatorNpcDialogueNode = typeof creatorNpcDialogueNodes.$inferInsert;
export const insertCreatorNpcDialogueNodeSchema = createInsertSchema(creatorNpcDialogueNodes);

export type CreatorNpcDialogueChoice = typeof creatorNpcDialogueChoices.$inferSelect;
export type InsertCreatorNpcDialogueChoice = typeof creatorNpcDialogueChoices.$inferInsert;

export type CreatorNpcSpawnPoint = typeof creatorNpcSpawnPoints.$inferSelect;
export type InsertCreatorNpcSpawnPoint = typeof creatorNpcSpawnPoints.$inferInsert;
export const insertCreatorNpcSpawnPointSchema = createInsertSchema(creatorNpcSpawnPoints);

export type CreatorNpcPatrolPath = typeof creatorNpcPatrolPaths.$inferSelect;
export type InsertCreatorNpcPatrolPath = typeof creatorNpcPatrolPaths.$inferInsert;
export const insertCreatorNpcPatrolPathSchema = createInsertSchema(creatorNpcPatrolPaths);

export type CreatorNpcRelation = typeof creatorNpcRelations.$inferSelect;
export type InsertCreatorNpcRelation = typeof creatorNpcRelations.$inferInsert;

export type CreatorNpcFaction = typeof creatorNpcFactions.$inferSelect;
export type InsertCreatorNpcFaction = typeof creatorNpcFactions.$inferInsert;
export const insertCreatorNpcFactionSchema = createInsertSchema(creatorNpcFactions);

export type CreatorNpcSchedule = typeof creatorNpcSchedules.$inferSelect;
export type InsertCreatorNpcSchedule = typeof creatorNpcSchedules.$inferInsert;
export const insertCreatorNpcScheduleSchema = createInsertSchema(creatorNpcSchedules);

export type CreatorNpcVersion = typeof creatorNpcVersions.$inferSelect;
export type InsertCreatorNpcVersion = typeof creatorNpcVersions.$inferInsert;

export type CreatorNpcHistoryRow = typeof creatorNpcHistory.$inferSelect;
export type InsertCreatorNpcHistory = typeof creatorNpcHistory.$inferInsert;

export type CreatorNpcTemplate = typeof creatorNpcTemplates.$inferSelect;
export type InsertCreatorNpcTemplate = typeof creatorNpcTemplates.$inferInsert;
export const insertCreatorNpcTemplateSchema = createInsertSchema(creatorNpcTemplates);
