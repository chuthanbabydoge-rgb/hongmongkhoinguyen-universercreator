import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const skillTypeEnum = pgEnum("skill_type", [
  "active", "passive", "toggle", "ultimate", "aura", "reaction", "summon",
]);

export const skillTargetEnum = pgEnum("skill_target", [
  "self", "ally", "enemy", "area", "point", "direction",
]);

export const damageTypeEnum = pgEnum("damage_type", [
  "physical", "magic", "true", "heal",
]);

export const castTypeEnum = pgEnum("cast_type", [
  "instant", "cast", "channel",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "mana", "energy", "stamina", "rage", "none",
]);

export const skillEffectTypeEnum = pgEnum("skill_effect_type", [
  "buff", "debuff", "dot", "hot", "control", "summon", "trigger",
]);

export const cooldownTypeEnum = pgEnum("cooldown_type", [
  "global", "local",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorSkills = pgTable("creator_skills", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  flavorText: text("flavor_text"),
  skillType: skillTypeEnum("skill_type").notNull().default("active"),
  skillTarget: skillTargetEnum("skill_target").notNull().default("enemy"),
  castType: castTypeEnum("cast_type").notNull().default("instant"),
  damageType: damageTypeEnum("damage_type").notNull().default("physical"),
  resourceType: resourceTypeEnum("resource_type").notNull().default("mana"),
  maxLevel: integer("max_level").notNull().default(5),
  baseRange: real("base_range").notNull().default(5),
  baseRadius: real("base_radius").notNull().default(0),
  baseCastTime: real("base_cast_time").notNull().default(0),
  baseCooldown: real("base_cooldown").notNull().default(1),
  baseResourceCost: real("base_resource_cost").notNull().default(10),
  baseDamage: real("base_damage").notNull().default(0),
  baseHeal: real("base_heal").notNull().default(0),
  iconAssetId: integer("icon_asset_id"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  graphRef: text("graph_ref"),
  triggerGraphId: integer("trigger_graph_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorSkillLevels = pgTable("creator_skill_levels", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  level: integer("level").notNull(),
  damageMultiplier: real("damage_multiplier").notNull().default(1),
  healMultiplier: real("heal_multiplier").notNull().default(1),
  rangeBonus: real("range_bonus").notNull().default(0),
  radiusBonus: real("radius_bonus").notNull().default(0),
  cooldownReduction: real("cooldown_reduction").notNull().default(0),
  resourceCostMultiplier: real("resource_cost_multiplier").notNull().default(1),
  durationMultiplier: real("duration_multiplier").notNull().default(1),
  description: text("description"),
  unlocksEffect: text("unlocks_effect"),
  xpRequired: integer("xp_required").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("creator_skill_levels_skill_level").on(t.skillId, t.level)]);

export const creatorSkillCosts = pgTable("creator_skill_costs", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  resourceType: resourceTypeEnum("resource_type").notNull().default("mana"),
  amount: real("amount").notNull().default(10),
  amountPerLevel: real("amount_per_level").notNull().default(0),
  isPercentage: boolean("is_percentage").notNull().default(false),
  chargeCount: integer("charge_count").notNull().default(1),
  rechargeDuration: real("recharge_duration").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillCooldowns = pgTable("creator_skill_cooldowns", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  cooldownType: cooldownTypeEnum("cooldown_type").notNull().default("local"),
  duration: real("duration").notNull().default(1),
  durationPerLevel: real("duration_per_level").notNull().default(0),
  globalCooldownDuration: real("global_cooldown_duration").notNull().default(1.5),
  canReduceWithStats: boolean("can_reduce_with_stats").notNull().default(true),
  minCooldown: real("min_cooldown").notNull().default(0.5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillEffects = pgTable("creator_skill_effects", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  effectName: text("effect_name").notNull(),
  effectType: skillEffectTypeEnum("effect_type").notNull().default("buff"),
  trigger: text("trigger").notNull().default("on_cast"),
  targetType: text("target_type").notNull().default("enemy"),
  magnitude: real("magnitude").notNull().default(0),
  magnitudePerLevel: real("magnitude_per_level").notNull().default(0),
  duration: real("duration").notNull().default(0),
  durationPerLevel: real("duration_per_level").notNull().default(0),
  chance: real("chance").notNull().default(1.0),
  scriptRef: text("script_ref"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillBuffs = pgTable("creator_skill_buffs", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  buffName: text("buff_name").notNull(),
  statAffected: text("stat_affected").notNull(),
  modifierType: text("modifier_type").notNull().default("flat"),
  value: real("value").notNull().default(0),
  valuePerLevel: real("value_per_level").notNull().default(0),
  duration: real("duration").notNull().default(5),
  isStackable: boolean("is_stackable").notNull().default(false),
  maxStacks: integer("max_stacks").notNull().default(1),
  iconAssetId: integer("icon_asset_id"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillDebuffs = pgTable("creator_skill_debuffs", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  debuffName: text("debuff_name").notNull(),
  debuffCategory: text("debuff_category").notNull().default("slow"),
  statAffected: text("stat_affected"),
  modifierType: text("modifier_type").notNull().default("flat"),
  value: real("value").notNull().default(0),
  valuePerLevel: real("value_per_level").notNull().default(0),
  duration: real("duration").notNull().default(3),
  isCrowdControl: boolean("is_crowd_control").notNull().default(false),
  canBeDispelled: boolean("can_be_dispelled").notNull().default(true),
  iconAssetId: integer("icon_asset_id"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillProjectiles = pgTable("creator_skill_projectiles", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  projectileName: text("projectile_name").notNull(),
  speed: real("speed").notNull().default(10),
  maxRange: real("max_range").notNull().default(20),
  hitRadius: real("hit_radius").notNull().default(0.5),
  isPiercing: boolean("is_piercing").notNull().default(false),
  isHoming: boolean("is_homing").notNull().default(false),
  homingStrength: real("homing_strength").notNull().default(1),
  count: integer("count").notNull().default(1),
  spreadAngle: real("spread_angle").notNull().default(0),
  gravity: real("gravity").notNull().default(0),
  modelAssetId: integer("model_asset_id"),
  particleEffectId: text("particle_effect_id"),
  trailEffectId: text("trail_effect_id"),
  impactEffectId: text("impact_effect_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillHitboxes = pgTable("creator_skill_hitboxes", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  hitboxName: text("hitbox_name").notNull(),
  shape: text("shape").notNull().default("circle"),
  width: real("width").notNull().default(1),
  height: real("height").notNull().default(1),
  depth: real("depth").notNull().default(1),
  offsetX: real("offset_x").notNull().default(0),
  offsetY: real("offset_y").notNull().default(0),
  offsetZ: real("offset_z").notNull().default(0),
  activeFrameStart: integer("active_frame_start").notNull().default(0),
  activeFrameEnd: integer("active_frame_end").notNull().default(10),
  damageMultiplier: real("damage_multiplier").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillAnimations = pgTable("creator_skill_animations", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  animationType: text("animation_type").notNull().default("cast"),
  animationAssetId: integer("animation_asset_id"),
  animationRef: text("animation_ref"),
  blendTime: real("blend_time").notNull().default(0.1),
  speed: real("speed").notNull().default(1),
  loop: boolean("loop").notNull().default(false),
  interruptible: boolean("interruptible").notNull().default(false),
  rootMotion: boolean("root_motion").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillAudio = pgTable("creator_skill_audio", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  audioType: text("audio_type").notNull().default("cast"),
  audioAssetId: integer("audio_asset_id"),
  audioRef: text("audio_ref"),
  volume: real("volume").notNull().default(1),
  pitch: real("pitch").notNull().default(1),
  loop: boolean("loop").notNull().default(false),
  minDistance: real("min_distance").notNull().default(1),
  maxDistance: real("max_distance").notNull().default(30),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillVisuals = pgTable("creator_skill_visuals", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  visualType: text("visual_type").notNull().default("vfx"),
  assetId: integer("asset_id"),
  assetRef: text("asset_ref"),
  attachPoint: text("attach_point").notNull().default("caster"),
  scale: real("scale").notNull().default(1),
  colorTint: text("color_tint"),
  duration: real("duration").notNull().default(1),
  loop: boolean("loop").notNull().default(false),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillRequirements = pgTable("creator_skill_requirements", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  requirementType: text("requirement_type").notNull(),
  requirementValue: text("requirement_value").notNull(),
  minLevel: integer("min_level").notNull().default(1),
  failMessage: text("fail_message"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillTags = pgTable("creator_skill_tags", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillVersions = pgTable("creator_skill_versions", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("creator_skill_versions_skill_version").on(t.skillId, t.version)]);

export const creatorSkillHistory = pgTable("creator_skill_history", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  actionType: text("action_type").notNull(),
  fieldChanged: text("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  performedBy: integer("performed_by").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillTemplates = pgTable("creator_skill_templates", {
  id: serial("id").primaryKey(),
  sourceSkillId: integer("source_skill_id").notNull(),
  createdBy: integer("created_by").notNull(),
  templateName: text("template_name").notNull(),
  description: text("description"),
  category: text("category"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  snapshot: jsonb("snapshot"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillStatistics = pgTable("creator_skill_statistics", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().unique(),
  timesUsed: integer("times_used").notNull().default(0),
  timesSimulated: integer("times_simulated").notNull().default(0),
  avgDamageDealt: real("avg_damage_dealt").notNull().default(0),
  avgHealDealt: real("avg_heal_dealt").notNull().default(0),
  lastSimulatedAt: timestamp("last_simulated_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorSkillExports = pgTable("creator_skill_exports", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  exportedBy: integer("exported_by").notNull(),
  format: text("format").notNull().default("json"),
  payload: text("payload").notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorSkillImports = pgTable("creator_skill_imports", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull(),
  importedBy: integer("imported_by").notNull(),
  sourceFormat: text("source_format").notNull().default("json"),
  sourceRef: text("source_ref"),
  status: text("status").notNull().default("success"),
  errors: text("errors").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertSkillSchema = createInsertSchema(creatorSkills);
export const insertSkillLevelSchema = createInsertSchema(creatorSkillLevels);
export const insertSkillCostSchema = createInsertSchema(creatorSkillCosts);
export const insertSkillCooldownSchema = createInsertSchema(creatorSkillCooldowns);
export const insertSkillEffectSchema = createInsertSchema(creatorSkillEffects);
export const insertSkillBuffSchema = createInsertSchema(creatorSkillBuffs);
export const insertSkillDebuffSchema = createInsertSchema(creatorSkillDebuffs);
export const insertSkillProjectileSchema = createInsertSchema(creatorSkillProjectiles);
export const insertSkillHitboxSchema = createInsertSchema(creatorSkillHitboxes);
export const insertSkillAnimationSchema = createInsertSchema(creatorSkillAnimations);
export const insertSkillAudioSchema = createInsertSchema(creatorSkillAudio);
export const insertSkillVisualSchema = createInsertSchema(creatorSkillVisuals);
export const insertSkillRequirementSchema = createInsertSchema(creatorSkillRequirements);
export const insertSkillTagSchema = createInsertSchema(creatorSkillTags);
export const insertSkillVersionSchema = createInsertSchema(creatorSkillVersions);
export const insertSkillHistorySchema = createInsertSchema(creatorSkillHistory);
export const insertSkillTemplateSchema = createInsertSchema(creatorSkillTemplates);
export const insertSkillStatisticsSchema = createInsertSchema(creatorSkillStatistics);
export const insertSkillExportSchema = createInsertSchema(creatorSkillExports);
export const insertSkillImportSchema = createInsertSchema(creatorSkillImports);

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type Skill = typeof creatorSkills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type SkillLevel = typeof creatorSkillLevels.$inferSelect;
export type SkillCost = typeof creatorSkillCosts.$inferSelect;
export type SkillCooldown = typeof creatorSkillCooldowns.$inferSelect;
export type SkillEffect = typeof creatorSkillEffects.$inferSelect;
export type SkillBuff = typeof creatorSkillBuffs.$inferSelect;
export type SkillDebuff = typeof creatorSkillDebuffs.$inferSelect;
export type SkillProjectile = typeof creatorSkillProjectiles.$inferSelect;
export type SkillHitbox = typeof creatorSkillHitboxes.$inferSelect;
export type SkillAnimation = typeof creatorSkillAnimations.$inferSelect;
export type SkillAudio = typeof creatorSkillAudio.$inferSelect;
export type SkillVisual = typeof creatorSkillVisuals.$inferSelect;
export type SkillRequirement = typeof creatorSkillRequirements.$inferSelect;
export type SkillTag = typeof creatorSkillTags.$inferSelect;
export type SkillVersion = typeof creatorSkillVersions.$inferSelect;
export type SkillHistory = typeof creatorSkillHistory.$inferSelect;
export type SkillTemplate = typeof creatorSkillTemplates.$inferSelect;
export type SkillStatistics = typeof creatorSkillStatistics.$inferSelect;
export type SkillExport = typeof creatorSkillExports.$inferSelect;
export type SkillImport = typeof creatorSkillImports.$inferSelect;
