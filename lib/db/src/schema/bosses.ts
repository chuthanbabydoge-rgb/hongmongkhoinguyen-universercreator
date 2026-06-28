import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bossTypeEnum = pgEnum("boss_type", [
  "world_boss", "dungeon_boss", "raid_boss", "field_boss", "event_boss",
  "mini_boss", "final_boss", "secret_boss", "story_boss", "challenge_boss",
]);

export const bossRarityEnum = pgEnum("boss_rarity", [
  "common", "uncommon", "rare", "epic", "legendary", "mythic", "unique",
]);

export const bossStateEnum = pgEnum("boss_state", [
  "idle", "patrolling", "alert", "combat", "phasing", "enraged",
  "stunned", "transitioning", "defeated", "resetting",
]);

export const bossPhaseEnum = pgEnum("boss_phase", [
  "phase_1", "phase_2", "phase_3", "phase_4", "phase_5",
  "enrage", "final", "despawn",
]);

export const bossRewardTypeEnum = pgEnum("boss_reward_type", [
  "item", "currency", "experience", "skill_point", "equipment",
  "cosmetic", "blueprint", "title", "mount", "custom",
]);

export const bossSpawnTypeEnum = pgEnum("boss_spawn_type", [
  "fixed", "triggered", "scheduled", "scripted", "event",
  "raid_summon", "dungeon_encounter", "world_event",
]);

export const bossDifficultyEnum = pgEnum("boss_difficulty", [
  "easy", "normal", "hard", "expert", "legendary", "nightmare", "ultimate",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorBosses = pgTable("creator_bosses", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  bossType: bossTypeEnum("boss_type").notNull().default("dungeon_boss"),
  rarity: bossRarityEnum("boss_rarity").notNull().default("rare"),
  difficulty: bossDifficultyEnum("boss_difficulty").notNull().default("normal"),
  state: bossStateEnum("boss_state").notNull().default("idle"),
  level: integer("level").notNull().default(1),
  baseHp: integer("base_hp").notNull().default(10000),
  baseAttack: integer("base_attack").notNull().default(500),
  baseDefense: integer("base_defense").notNull().default(300),
  baseSpeed: integer("base_speed").notNull().default(100),
  baseMagicAttack: integer("base_magic_attack").notNull().default(400),
  baseMagicDefense: integer("base_magic_defense").notNull().default(250),
  hpScaling: real("hp_scaling").notNull().default(1.0),
  damageScaling: real("damage_scaling").notNull().default(1.0),
  totalPhases: integer("total_phases").notNull().default(1),
  hasRageMode: boolean("has_rage_mode").notNull().default(false),
  rageThreshold: real("rage_threshold").notNull().default(0.25),
  enrageTimer: integer("enrage_timer"),
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(10),
  respawnCooldown: integer("respawn_cooldown").notNull().default(86400),
  npcRef: text("npc_ref"),
  combatRef: text("combat_ref"),
  graphRef: text("graph_ref"),
  runtimeRef: text("runtime_ref"),
  portraitAssetId: integer("portrait_asset_id"),
  modelAssetId: integer("model_asset_id"),
  animationAssetId: integer("animation_asset_id"),
  audioAssetId: integer("audio_asset_id"),
  cinematicAssetId: integer("cinematic_asset_id"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBossPhases = pgTable("creator_boss_phases", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  phase: bossPhaseEnum("boss_phase").notNull().default("phase_1"),
  phaseNumber: integer("phase_number").notNull().default(1),
  name: text("name").notNull(),
  description: text("description"),
  hpThreshold: real("hp_threshold").notNull().default(1.0),
  hpMultiplier: real("hp_multiplier").notNull().default(1.0),
  damageMultiplier: real("damage_multiplier").notNull().default(1.0),
  speedMultiplier: real("speed_multiplier").notNull().default(1.0),
  defenseMultiplier: real("defense_multiplier").notNull().default(1.0),
  transitionAnimation: text("transition_animation"),
  transitionSfx: text("transition_sfx"),
  transitionDialogue: text("transition_dialogue"),
  newAbilities: text("new_abilities").array(),
  removedAbilities: text("removed_abilities").array(),
  spawnMinionIds: text("spawn_minion_ids").array(),
  arenaChanges: jsonb("arena_changes"),
  isEnragePhase: boolean("is_enrage_phase").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(1),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBossSkills = pgTable("creator_boss_skills", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  skillRef: text("skill_ref").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isUltimate: boolean("is_ultimate").notNull().default(false),
  isPassive: boolean("is_passive").notNull().default(false),
  phaseUnlock: integer("phase_unlock").notNull().default(1),
  cooldown: real("cooldown").notNull().default(10),
  energyCost: integer("energy_cost").notNull().default(0),
  usageCondition: text("usage_condition"),
  priority: integer("priority").notNull().default(5),
  damageMultiplier: real("damage_multiplier").notNull().default(1.0),
  isSignatureMove: boolean("is_signature_move").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossPatterns = pgTable("creator_boss_patterns", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  patternType: text("pattern_type").notNull().default("rotation"),
  phaseNumber: integer("phase_number").notNull().default(1),
  triggerCondition: text("trigger_condition"),
  sequence: jsonb("sequence").notNull(),
  repeatCount: integer("repeat_count").notNull().default(-1),
  cooldown: real("cooldown").notNull().default(0),
  priority: integer("priority").notNull().default(5),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossAttacks = pgTable("creator_boss_attacks", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  attackType: text("attack_type").notNull().default("melee"),
  damageType: text("damage_type").notNull().default("physical"),
  baseDamage: real("base_damage").notNull().default(100),
  damageVariance: real("damage_variance").notNull().default(0.1),
  range: real("range").notNull().default(2),
  aoeRadius: real("aoe_radius").notNull().default(0),
  hitCount: integer("hit_count").notNull().default(1),
  castTime: real("cast_time").notNull().default(0),
  animationRef: text("animation_ref"),
  sfxRef: text("sfx_ref"),
  statusEffectRef: text("status_effect_ref"),
  phaseAvailability: integer("phase_availability").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossWeakpoints = pgTable("creator_boss_weakpoints", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  bodyPart: text("body_part").notNull().default("core"),
  damageMultiplier: real("damage_multiplier").notNull().default(1.5),
  requiredCondition: text("required_condition"),
  isExposed: boolean("is_exposed").notNull().default(false),
  exposeTrigger: text("expose_trigger"),
  exposePhase: integer("expose_phase").notNull().default(1),
  stunDuration: real("stun_duration").notNull().default(0),
  sfxOnHit: text("sfx_on_hit"),
  destroyable: boolean("destroyable").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossEnrage = pgTable("creator_boss_enrage", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  triggerType: text("trigger_type").notNull().default("timer"),
  timerSeconds: integer("timer_seconds"),
  hpThreshold: real("hp_threshold"),
  condition: text("condition"),
  damageBoost: real("damage_boost").notNull().default(2.0),
  speedBoost: real("speed_boost").notNull().default(1.5),
  defenseBoost: real("defense_boost").notNull().default(1.2),
  newAbilities: text("new_abilities").array(),
  cinematicRef: text("cinematic_ref"),
  dialogue: text("dialogue"),
  sfxRef: text("sfx_ref"),
  isInstakill: boolean("is_instakill").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossLoot = pgTable("creator_boss_loot", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  itemRef: text("item_ref").notNull(),
  dropChance: real("drop_chance").notNull().default(0.1),
  quantity: integer("quantity").notNull().default(1),
  maxQuantity: integer("max_quantity").notNull().default(1),
  isGuaranteed: boolean("is_guaranteed").notNull().default(false),
  isUnique: boolean("is_unique").notNull().default(false),
  requiredPhase: integer("required_phase").notNull().default(1),
  condition: text("condition"),
  lootTableRef: text("loot_table_ref"),
  currencyAmount: integer("currency_amount").notNull().default(0),
  xpAmount: integer("xp_amount").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossRewards = pgTable("creator_boss_rewards", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  rewardType: bossRewardTypeEnum("boss_reward_type").notNull().default("item"),
  itemRef: text("item_ref"),
  currencyAmount: integer("currency_amount").notNull().default(0),
  xpAmount: integer("xp_amount").notNull().default(0),
  skillPointAmount: integer("skill_point_amount").notNull().default(0),
  triggerCondition: text("trigger_condition").notNull().default("on_kill"),
  isFirstKillOnly: boolean("is_first_kill_only").notNull().default(false),
  isWeeklyLimit: boolean("is_weekly_limit").notNull().default(false),
  raidContribution: real("raid_contribution").notNull().default(1.0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossSpawnRules = pgTable("creator_boss_spawn_rules", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  spawnType: bossSpawnTypeEnum("boss_spawn_type").notNull().default("fixed"),
  worldRef: text("world_ref"),
  regionRef: text("region_ref"),
  dungeonRef: text("dungeon_ref"),
  arenaRef: text("arena_ref"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  positionZ: real("position_z").notNull().default(0),
  spawnSchedule: text("spawn_schedule"),
  respawnCooldown: integer("respawn_cooldown").notNull().default(86400),
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(10),
  triggerCondition: text("trigger_condition"),
  levelRequirement: integer("level_requirement").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossArenas = pgTable("creator_boss_arenas", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  width: real("width").notNull().default(50),
  height: real("height").notNull().default(50),
  depth: real("depth").notNull().default(50),
  arenaType: text("arena_type").notNull().default("enclosed"),
  terrainRef: text("terrain_ref"),
  meshAssetRef: text("mesh_asset_ref"),
  skyboxAssetRef: text("skybox_asset_ref"),
  musicAssetRef: text("music_asset_ref"),
  ambientSfxRef: text("ambient_sfx_ref"),
  environmentEffects: jsonb("environment_effects"),
  hazards: jsonb("hazards"),
  interactables: jsonb("interactables"),
  lockOnStart: boolean("lock_on_start").notNull().default(true),
  resetOnWipe: boolean("reset_on_wipe").notNull().default(true),
  allowRanged: boolean("allow_ranged").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBossCinematics = pgTable("creator_boss_cinematics", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull().default("on_spawn"),
  cinematicAssetRef: text("cinematic_asset_ref"),
  duration: real("duration").notNull().default(5),
  dialogue: text("dialogue"),
  voiceActorRef: text("voice_actor_ref"),
  subtitles: jsonb("subtitles"),
  isSkippable: boolean("is_skippable").notNull().default(true),
  freezeWorld: boolean("freeze_world").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossDialogues = pgTable("creator_boss_dialogues", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  trigger: text("trigger").notNull().default("on_spawn"),
  phaseNumber: integer("phase_number").notNull().default(1),
  dialogue: text("dialogue").notNull(),
  voiceRef: text("voice_ref"),
  captionColor: text("caption_color").notNull().default("#ff4444"),
  displayDuration: real("display_duration").notNull().default(4),
  isSubtitled: boolean("is_subtitled").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossTemplates = pgTable("creator_boss_templates", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
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

export const creatorBossVersions = pgTable("creator_boss_versions", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossHistory = pgTable("creator_boss_history", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  action: text("action").notNull(),
  field: text("field"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: integer("changed_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossStatistics = pgTable("creator_boss_statistics", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  totalEncounters: integer("total_encounters").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  totalWipes: integer("total_wipes").notNull().default(0),
  averageKillTime: real("average_kill_time"),
  fastestKillTime: real("fastest_kill_time"),
  averagePlayerCount: real("average_player_count"),
  firstKillAt: timestamp("first_kill_at"),
  phaseReachCounts: jsonb("phase_reach_counts"),
  mostUsedPhaseKill: integer("most_used_phase_kill"),
  totalLootDropped: integer("total_loot_dropped").notNull().default(0),
  enrageCount: integer("enrage_count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorBossExports = pgTable("creator_boss_exports", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  exportType: text("export_type").notNull().default("json"),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum").notNull(),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossImports = pgTable("creator_boss_imports", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  importType: text("import_type").notNull().default("json"),
  sourceData: jsonb("source_data").notNull(),
  importedBy: integer("imported_by").notNull(),
  status: text("status").notNull().default("success"),
  errors: jsonb("errors"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBossRuntime = pgTable("creator_boss_runtime", {
  id: serial("id").primaryKey(),
  bossId: integer("boss_id").notNull(),
  sessionId: text("session_id").notNull(),
  currentPhase: integer("current_phase").notNull().default(1),
  currentHp: integer("current_hp").notNull().default(0),
  maxHp: integer("max_hp").notNull().default(0),
  state: bossStateEnum("boss_state").notNull().default("idle"),
  isEnraged: boolean("is_enraged").notNull().default(false),
  activeEffects: jsonb("active_effects"),
  combatLog: jsonb("combat_log"),
  participantIds: jsonb("participant_ids"),
  startedAt: timestamp("started_at"),
  defeatedAt: timestamp("defeated_at"),
  runData: jsonb("run_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Insert Schemas ────────────────────────────────────────────────────────────

export const insertBossSchema = createInsertSchema(creatorBosses, {
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export type InsertBoss = z.infer<typeof insertBossSchema>;
