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

export const questTypeEnum = pgEnum("quest_type", [
  "main",
  "side",
  "daily",
  "weekly",
  "event",
  "story",
  "tutorial",
  "achievement",
  "guild",
  "world",
]);

export const questStatusEnum = pgEnum("quest_status", [
  "draft",
  "review",
  "published",
  "archived",
]);

export const questObjectiveTypeEnum = pgEnum("quest_objective_type", [
  "kill",
  "collect",
  "talk",
  "escort",
  "explore",
  "craft",
  "use_item",
  "reach_location",
  "interact",
  "custom",
]);

export const rewardTypeEnum = pgEnum("reward_type", [
  "xp",
  "gold",
  "item",
  "skill",
  "title",
  "reputation",
  "pet",
  "mount",
  "currency",
]);

export const conditionTypeEnum = pgEnum("condition_type", [
  "level",
  "quest",
  "skill",
  "item",
  "reputation",
  "faction",
  "custom",
]);

export const questBranchTypeEnum = pgEnum("quest_branch_type", [
  "linear",
  "choice",
  "conditional",
  "parallel",
  "loop",
  "custom",
]);

export const questDialogueTypeEnum = pgEnum("quest_dialogue_type", [
  "start",
  "progress",
  "complete",
  "fail",
  "branch",
  "ambient",
  "custom",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorQuests = pgTable("creator_quests", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id").notNull().references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  questType: questTypeEnum("quest_type").notNull().default("side"),
  status: questStatusEnum("status").notNull().default("draft"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),
  level: integer("level").notNull().default(1),
  maxLevel: integer("max_level"),
  isRepeatable: boolean("is_repeatable").notNull().default(false),
  isOptional: boolean("is_optional").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestSteps = pgTable("creator_quest_steps", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  name: text("name").notNull(),
  description: text("description"),
  isOptional: boolean("is_optional").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestObjectives = pgTable("creator_quest_objectives", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  stepId: integer("step_id").references(() => creatorQuestSteps.id, { onDelete: "set null" }),
  objectiveType: questObjectiveTypeEnum("objective_type").notNull().default("kill"),
  name: text("name").notNull(),
  description: text("description"),
  targetId: text("target_id"),
  targetName: text("target_name"),
  targetCount: integer("target_count").notNull().default(1),
  order: integer("order").notNull().default(0),
  isOptional: boolean("is_optional").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestConditions = pgTable("creator_quest_conditions", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  conditionType: conditionTypeEnum("condition_type").notNull().default("level"),
  name: text("name").notNull(),
  description: text("description"),
  targetId: text("target_id"),
  targetValue: text("target_value"),
  operator: text("operator").notNull().default("gte"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestRewards = pgTable("creator_quest_rewards", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  rewardType: rewardTypeEnum("reward_type").notNull().default("xp"),
  name: text("name").notNull(),
  description: text("description"),
  amount: integer("amount").notNull().default(1),
  itemId: text("item_id"),
  data: jsonb("data"),
  isOptional: boolean("is_optional").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestDialogues = pgTable("creator_quest_dialogues", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  npcId: integer("npc_id"),
  dialogueType: questDialogueTypeEnum("dialogue_type").notNull().default("start"),
  title: text("title"),
  content: text("content").notNull(),
  order: integer("order").notNull().default(0),
  branchId: integer("branch_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestNpcs = pgTable("creator_quest_npcs", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  npcId: text("npc_id"),
  npcName: text("npc_name").notNull(),
  role: text("role").notNull().default("quest_giver"),
  regionId: integer("region_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestRegions = pgTable("creator_quest_regions", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  worldId: text("world_id"),
  regionName: text("region_name").notNull(),
  description: text("description"),
  coordinates: jsonb("coordinates"),
  radius: real("radius"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestEvents = pgTable("creator_quest_events", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull().default("trigger"),
  triggerCondition: jsonb("trigger_condition"),
  action: jsonb("action"),
  order: integer("order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestScripts = pgTable("creator_quest_scripts", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  scriptType: text("script_type").notNull().default("lua"),
  content: text("content").notNull().default(""),
  trigger: text("trigger").notNull().default("on_start"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestVariables = pgTable("creator_quest_variables", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  variableType: text("variable_type").notNull().default("integer"),
  defaultValue: text("default_value"),
  description: text("description"),
  scope: text("scope").notNull().default("quest"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestFlags = pgTable("creator_quest_flags", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  defaultValue: boolean("default_value").notNull().default(false),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestBranches = pgTable("creator_quest_branches", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  branchType: questBranchTypeEnum("branch_type").notNull().default("choice"),
  name: text("name").notNull(),
  label: text("label"),
  condition: jsonb("condition"),
  order: integer("order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestCheckpoints = pgTable("creator_quest_checkpoints", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  stepId: integer("step_id").references(() => creatorQuestSteps.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  isFinal: boolean("is_final").notNull().default(false),
  order: integer("order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestHistory = pgTable("creator_quest_history", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  description: text("description"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorQuestVersions = pgTable("creator_quest_versions", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  version: integer("version").notNull().default(1),
  label: text("label"),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorQuestTemplates = pgTable("creator_quest_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  questType: questTypeEnum("quest_type").notNull().default("side"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),
  data: jsonb("data").notNull(),
  tags: text("tags").array().notNull().default([]),
  isOfficial: boolean("is_official").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestStatistics = pgTable("creator_quest_statistics", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }).unique(),
  totalSteps: integer("total_steps").notNull().default(0),
  totalObjectives: integer("total_objectives").notNull().default(0),
  totalRewards: integer("total_rewards").notNull().default(0),
  totalDialogues: integer("total_dialogues").notNull().default(0),
  totalBranches: integer("total_branches").notNull().default(0),
  completionRate: real("completion_rate").notNull().default(0),
  averageCompletionTime: integer("average_completion_time"),
  playCount: integer("play_count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorQuestExports = pgTable("creator_quest_exports", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => creatorQuests.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  exportFormat: text("export_format").notNull().default("json"),
  filename: text("filename"),
  data: jsonb("data"),
  size: integer("size"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorQuestImports = pgTable("creator_quest_imports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").references(() => creatorQuests.id, { onDelete: "set null" }),
  importFormat: text("import_format").notNull().default("json"),
  filename: text("filename"),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertCreatorQuestSchema = createInsertSchema(creatorQuests, {
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
});
export const insertCreatorQuestStepSchema = createInsertSchema(creatorQuestSteps);
export const insertCreatorQuestObjectiveSchema = createInsertSchema(creatorQuestObjectives);
export const insertCreatorQuestConditionSchema = createInsertSchema(creatorQuestConditions);
export const insertCreatorQuestRewardSchema = createInsertSchema(creatorQuestRewards);
export const insertCreatorQuestDialogueSchema = createInsertSchema(creatorQuestDialogues);
export const insertCreatorQuestNpcSchema = createInsertSchema(creatorQuestNpcs);
export const insertCreatorQuestRegionSchema = createInsertSchema(creatorQuestRegions);
export const insertCreatorQuestEventSchema = createInsertSchema(creatorQuestEvents);
export const insertCreatorQuestScriptSchema = createInsertSchema(creatorQuestScripts);
export const insertCreatorQuestVariableSchema = createInsertSchema(creatorQuestVariables);
export const insertCreatorQuestFlagSchema = createInsertSchema(creatorQuestFlags);
export const insertCreatorQuestBranchSchema = createInsertSchema(creatorQuestBranches);
export const insertCreatorQuestCheckpointSchema = createInsertSchema(creatorQuestCheckpoints);
export const insertCreatorQuestHistorySchema = createInsertSchema(creatorQuestHistory);
export const insertCreatorQuestVersionSchema = createInsertSchema(creatorQuestVersions);
export const insertCreatorQuestTemplateSchema = createInsertSchema(creatorQuestTemplates);
export const insertCreatorQuestStatisticsSchema = createInsertSchema(creatorQuestStatistics);
export const insertCreatorQuestExportSchema = createInsertSchema(creatorQuestExports);
export const insertCreatorQuestImportSchema = createInsertSchema(creatorQuestImports);

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CreatorQuest = typeof creatorQuests.$inferSelect;
export type InsertCreatorQuest = typeof creatorQuests.$inferInsert;
export type CreatorQuestStep = typeof creatorQuestSteps.$inferSelect;
export type InsertCreatorQuestStep = typeof creatorQuestSteps.$inferInsert;
export type CreatorQuestObjective = typeof creatorQuestObjectives.$inferSelect;
export type InsertCreatorQuestObjective = typeof creatorQuestObjectives.$inferInsert;
export type CreatorQuestCondition = typeof creatorQuestConditions.$inferSelect;
export type InsertCreatorQuestCondition = typeof creatorQuestConditions.$inferInsert;
export type CreatorQuestReward = typeof creatorQuestRewards.$inferSelect;
export type InsertCreatorQuestReward = typeof creatorQuestRewards.$inferInsert;
export type CreatorQuestDialogue = typeof creatorQuestDialogues.$inferSelect;
export type InsertCreatorQuestDialogue = typeof creatorQuestDialogues.$inferInsert;
export type CreatorQuestNpc = typeof creatorQuestNpcs.$inferSelect;
export type InsertCreatorQuestNpc = typeof creatorQuestNpcs.$inferInsert;
export type CreatorQuestRegion = typeof creatorQuestRegions.$inferSelect;
export type InsertCreatorQuestRegion = typeof creatorQuestRegions.$inferInsert;
export type CreatorQuestEvent = typeof creatorQuestEvents.$inferSelect;
export type InsertCreatorQuestEvent = typeof creatorQuestEvents.$inferInsert;
export type CreatorQuestScript = typeof creatorQuestScripts.$inferSelect;
export type InsertCreatorQuestScript = typeof creatorQuestScripts.$inferInsert;
export type CreatorQuestVariable = typeof creatorQuestVariables.$inferSelect;
export type InsertCreatorQuestVariable = typeof creatorQuestVariables.$inferInsert;
export type CreatorQuestFlag = typeof creatorQuestFlags.$inferSelect;
export type InsertCreatorQuestFlag = typeof creatorQuestFlags.$inferInsert;
export type CreatorQuestBranch = typeof creatorQuestBranches.$inferSelect;
export type InsertCreatorQuestBranch = typeof creatorQuestBranches.$inferInsert;
export type CreatorQuestCheckpoint = typeof creatorQuestCheckpoints.$inferSelect;
export type InsertCreatorQuestCheckpoint = typeof creatorQuestCheckpoints.$inferInsert;
export type CreatorQuestHistoryRow = typeof creatorQuestHistory.$inferSelect;
export type InsertCreatorQuestHistory = typeof creatorQuestHistory.$inferInsert;
export type CreatorQuestVersion = typeof creatorQuestVersions.$inferSelect;
export type InsertCreatorQuestVersion = typeof creatorQuestVersions.$inferInsert;
export type CreatorQuestTemplate = typeof creatorQuestTemplates.$inferSelect;
export type InsertCreatorQuestTemplate = typeof creatorQuestTemplates.$inferInsert;
export type CreatorQuestStatistics = typeof creatorQuestStatistics.$inferSelect;
export type InsertCreatorQuestStatistics = typeof creatorQuestStatistics.$inferInsert;
export type CreatorQuestExport = typeof creatorQuestExports.$inferSelect;
export type InsertCreatorQuestExport = typeof creatorQuestExports.$inferInsert;
export type CreatorQuestImport = typeof creatorQuestImports.$inferSelect;
export type InsertCreatorQuestImport = typeof creatorQuestImports.$inferInsert;
