import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const combatModeEnum = pgEnum("combat_mode", [
  "turn_based", "real_time", "action", "semi_action", "tactical",
]);

export const damageFormulaEnum = pgEnum("damage_formula", [
  "flat", "percentage", "scaling", "hybrid", "custom",
]);

export const combatStateEnum = pgEnum("combat_state", [
  "idle", "engaging", "fighting", "fleeing", "stunned", "dead", "respawning",
]);

export const combatTargetEnum = pgEnum("combat_target", [
  "self", "single_enemy", "single_ally", "all_enemies", "all_allies", "area", "random",
]);

export const combatEventTypeEnum = pgEnum("combat_event_type", [
  "attack", "defend", "dodge", "block", "parry", "crit", "miss", "death", "respawn", "status_applied", "status_removed",
]);

export const combatTriggerEnum = pgEnum("combat_trigger", [
  "on_hit", "on_miss", "on_crit", "on_dodge", "on_block", "on_parry", "on_kill", "on_death", "on_respawn", "on_combo", "on_turn_start", "on_turn_end",
]);

export const statusCategoryEnum = pgEnum("status_category", [
  "buff", "debuff", "dot", "hot", "cc", "shield", "mark", "aura",
]);

export const combatLogTypeEnum = pgEnum("combat_log_type", [
  "damage", "heal", "status", "death", "respawn", "miss", "dodge", "block", "parry", "crit", "combo",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorCombats = pgTable("creator_combats", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  combatMode: combatModeEnum("combat_mode").notNull().default("real_time"),
  turnDuration: real("turn_duration").notNull().default(30),
  maxRounds: integer("max_rounds").notNull().default(0),
  maxParticipants: integer("max_participants").notNull().default(10),
  allowFriendlyFire: boolean("allow_friendly_fire").notNull().default(false),
  allowFlee: boolean("allow_flee").notNull().default(true),
  fleeChance: real("flee_chance").notNull().default(0.5),
  allowRespawn: boolean("allow_respawn").notNull().default(true),
  respawnDelay: real("respawn_delay").notNull().default(5),
  deathPenalty: text("death_penalty").notNull().default("none"),
  aggroRadius: real("aggro_radius").notNull().default(10),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  graphRef: text("graph_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorCombatRules = pgTable("creator_combat_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull().default("general"),
  trigger: combatTriggerEnum("trigger").notNull().default("on_hit"),
  condition: text("condition"),
  action: text("action").notNull(),
  priority: integer("priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDamageFormulas = pgTable("creator_damage_formulas", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  formulaName: text("formula_name").notNull(),
  formulaType: damageFormulaEnum("formula_type").notNull().default("flat"),
  baseValue: real("base_value").notNull().default(10),
  attackScaling: real("attack_scaling").notNull().default(1),
  defenseScaling: real("defense_scaling").notNull().default(0),
  levelScaling: real("level_scaling").notNull().default(0),
  randomMin: real("random_min").notNull().default(0.9),
  randomMax: real("random_max").notNull().default(1.1),
  expression: text("expression"),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDamageModifiers = pgTable("creator_damage_modifiers", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  modifierName: text("modifier_name").notNull(),
  damageType: text("damage_type").notNull().default("physical"),
  modifierValue: real("modifier_value").notNull().default(1),
  isPercentage: boolean("is_percentage").notNull().default(true),
  appliesOnCrit: boolean("applies_on_crit").notNull().default(false),
  condition: text("condition"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDefenseRules = pgTable("creator_defense_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  armorValue: real("armor_value").notNull().default(0),
  armorReduction: real("armor_reduction").notNull().default(0),
  maxReductionPct: real("max_reduction_pct").notNull().default(0.75),
  flatReduction: real("flat_reduction").notNull().default(0),
  defenseScaling: real("defense_scaling").notNull().default(0.01),
  isDefault: boolean("is_default").notNull().default(false),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorResistances = pgTable("creator_resistances", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  resistanceName: text("resistance_name").notNull(),
  damageType: text("damage_type").notNull().default("magic"),
  resistValue: real("resist_value").notNull().default(0),
  maxResistPct: real("max_resist_pct").notNull().default(0.75),
  penetrationStat: text("penetration_stat"),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorHitRules = pgTable("creator_hit_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseHitChance: real("base_hit_chance").notNull().default(0.9),
  accuracyScaling: real("accuracy_scaling").notNull().default(0.01),
  evasionScaling: real("evasion_scaling").notNull().default(0.01),
  minHitChance: real("min_hit_chance").notNull().default(0.05),
  maxHitChance: real("max_hit_chance").notNull().default(0.99),
  rangeModifier: real("range_modifier").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCriticalRules = pgTable("creator_critical_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseCritChance: real("base_crit_chance").notNull().default(0.05),
  critChanceScaling: real("crit_chance_scaling").notNull().default(0.01),
  baseCritMultiplier: real("base_crit_multiplier").notNull().default(1.5),
  critMultiplierScaling: real("crit_multiplier_scaling").notNull().default(0.1),
  maxCritChance: real("max_crit_chance").notNull().default(0.75),
  maxCritMultiplier: real("max_crit_multiplier").notNull().default(5),
  appliesStatusOnCrit: boolean("applies_status_on_crit").notNull().default(false),
  critStatusRef: text("crit_status_ref"),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorBlockRules = pgTable("creator_block_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseBlockChance: real("base_block_chance").notNull().default(0.1),
  blockChanceScaling: real("block_chance_scaling").notNull().default(0.005),
  blockDamageReduction: real("block_damage_reduction").notNull().default(0.5),
  maxBlockChance: real("max_block_chance").notNull().default(0.75),
  requiresShield: boolean("requires_shield").notNull().default(true),
  cooldown: real("cooldown").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorDodgeRules = pgTable("creator_dodge_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseDodgeChance: real("base_dodge_chance").notNull().default(0.05),
  dodgeChanceScaling: real("dodge_chance_scaling").notNull().default(0.005),
  maxDodgeChance: real("max_dodge_chance").notNull().default(0.75),
  agilityScaling: real("agility_scaling").notNull().default(0.01),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorParryRules = pgTable("creator_parry_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseParryChance: real("base_parry_chance").notNull().default(0.05),
  parryChanceScaling: real("parry_chance_scaling").notNull().default(0.005),
  maxParryChance: real("max_parry_chance").notNull().default(0.5),
  counterAttackChance: real("counter_attack_chance").notNull().default(0.3),
  counterDamageMultiplier: real("counter_damage_multiplier").notNull().default(1.0),
  requiresMeleeWeapon: boolean("requires_melee_weapon").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorComboRules = pgTable("creator_combo_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  comboName: text("combo_name").notNull(),
  requiredHits: integer("required_hits").notNull().default(3),
  windowDuration: real("window_duration").notNull().default(2),
  bonusDamageMultiplier: real("bonus_damage_multiplier").notNull().default(1.5),
  bonusEffect: text("bonus_effect"),
  resetOnMiss: boolean("reset_on_miss").notNull().default(true),
  maxComboCount: integer("max_combo_count").notNull().default(10),
  parentComboId: integer("parent_combo_id"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorStatusEffects = pgTable("creator_status_effects", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  effectName: text("effect_name").notNull(),
  category: statusCategoryEnum("category").notNull().default("debuff"),
  description: text("description"),
  duration: real("duration").notNull().default(5),
  tickInterval: real("tick_interval").notNull().default(1),
  tickDamage: real("tick_damage").notNull().default(0),
  tickHeal: real("tick_heal").notNull().default(0),
  statModifiers: jsonb("stat_modifiers"),
  isCrowdControl: boolean("is_crowd_control").notNull().default(false),
  preventsActions: boolean("prevents_actions").notNull().default(false),
  canBeDispelled: boolean("can_be_dispelled").notNull().default(true),
  isStackable: boolean("is_stackable").notNull().default(false),
  maxStacks: integer("max_stacks").notNull().default(1),
  iconAssetId: integer("icon_asset_id"),
  triggerRef: text("trigger_ref"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorStatusEffectStacks = pgTable("creator_status_effect_stacks", {
  id: serial("id").primaryKey(),
  statusEffectId: integer("status_effect_id").notNull(),
  stackLevel: integer("stack_level").notNull(),
  durationMultiplier: real("duration_multiplier").notNull().default(1),
  damageMultiplier: real("damage_multiplier").notNull().default(1),
  additionalEffect: text("additional_effect"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("creator_status_stacks_unique").on(t.statusEffectId, t.stackLevel)]);

export const creatorThreatRules = pgTable("creator_threat_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  baseThreatMultiplier: real("base_threat_multiplier").notNull().default(1),
  healingThreatMultiplier: real("healing_threat_multiplier").notNull().default(0.5),
  tankingThreatBonus: real("tanking_threat_bonus").notNull().default(1.5),
  aggroDecayRate: real("aggro_decay_rate").notNull().default(0),
  aggroTransferChance: real("aggro_transfer_chance").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorRespawnRules = pgTable("creator_respawn_rules", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  ruleName: text("rule_name").notNull(),
  respawnDelay: real("respawn_delay").notNull().default(5),
  hpOnRespawn: real("hp_on_respawn").notNull().default(1),
  mpOnRespawn: real("mp_on_respawn").notNull().default(1),
  respawnLocation: text("respawn_location").notNull().default("origin"),
  invulnerabilityDuration: real("invulnerability_duration").notNull().default(3),
  clearStatusOnRespawn: boolean("clear_status_on_respawn").notNull().default(true),
  respawnPenalty: text("respawn_penalty"),
  maxRespawns: integer("max_respawns").notNull().default(-1),
  isDefault: boolean("is_default").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCombatZones = pgTable("creator_combat_zones", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  zoneName: text("zone_name").notNull(),
  zoneType: text("zone_type").notNull().default("arena"),
  shape: text("shape").notNull().default("circle"),
  radius: real("radius").notNull().default(20),
  width: real("width").notNull().default(20),
  height: real("height").notNull().default(20),
  centerX: real("center_x").notNull().default(0),
  centerY: real("center_y").notNull().default(0),
  centerZ: real("center_z").notNull().default(0),
  damageOutside: boolean("damage_outside").notNull().default(false),
  damagePerSecond: real("damage_per_second").notNull().default(0),
  shrinkRate: real("shrink_rate").notNull().default(0),
  worldRef: text("world_ref"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorTargetFilters = pgTable("creator_target_filters", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  filterName: text("filter_name").notNull(),
  targetType: combatTargetEnum("target_type").notNull().default("single_enemy"),
  maxTargets: integer("max_targets").notNull().default(1),
  rangeLimit: real("range_limit").notNull().default(0),
  requireLineOfSight: boolean("require_line_of_sight").notNull().default(false),
  excludeSelf: boolean("exclude_self").notNull().default(true),
  factionFilter: text("faction_filter"),
  conditionExpression: text("condition_expression"),
  priorityExpression: text("priority_expression"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCombatHistory = pgTable("creator_combat_history", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  actionType: text("action_type").notNull(),
  fieldChanged: text("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  performedBy: integer("performed_by").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorCombatVersions = pgTable("creator_combat_versions", {
  id: serial("id").primaryKey(),
  combatId: integer("combat_id").notNull(),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("creator_combat_versions_unique").on(t.combatId, t.version)]);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertCombatSchema = createInsertSchema(creatorCombats);
export const insertCombatRuleSchema = createInsertSchema(creatorCombatRules);
export const insertDamageFormulaSchema = createInsertSchema(creatorDamageFormulas);
export const insertDamageModifierSchema = createInsertSchema(creatorDamageModifiers);
export const insertDefenseRuleSchema = createInsertSchema(creatorDefenseRules);
export const insertResistanceSchema = createInsertSchema(creatorResistances);
export const insertHitRuleSchema = createInsertSchema(creatorHitRules);
export const insertCriticalRuleSchema = createInsertSchema(creatorCriticalRules);
export const insertBlockRuleSchema = createInsertSchema(creatorBlockRules);
export const insertDodgeRuleSchema = createInsertSchema(creatorDodgeRules);
export const insertParryRuleSchema = createInsertSchema(creatorParryRules);
export const insertComboRuleSchema = createInsertSchema(creatorComboRules);
export const insertStatusEffectSchema = createInsertSchema(creatorStatusEffects);
export const insertStatusEffectStackSchema = createInsertSchema(creatorStatusEffectStacks);
export const insertThreatRuleSchema = createInsertSchema(creatorThreatRules);
export const insertRespawnRuleSchema = createInsertSchema(creatorRespawnRules);
export const insertCombatZoneSchema = createInsertSchema(creatorCombatZones);
export const insertTargetFilterSchema = createInsertSchema(creatorTargetFilters);
export const insertCombatHistorySchema = createInsertSchema(creatorCombatHistory);
export const insertCombatVersionSchema = createInsertSchema(creatorCombatVersions);

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type Combat = typeof creatorCombats.$inferSelect;
export type InsertCombat = z.infer<typeof insertCombatSchema>;
export type CombatRule = typeof creatorCombatRules.$inferSelect;
export type DamageFormula = typeof creatorDamageFormulas.$inferSelect;
export type DamageModifier = typeof creatorDamageModifiers.$inferSelect;
export type DefenseRule = typeof creatorDefenseRules.$inferSelect;
export type Resistance = typeof creatorResistances.$inferSelect;
export type HitRule = typeof creatorHitRules.$inferSelect;
export type CriticalRule = typeof creatorCriticalRules.$inferSelect;
export type BlockRule = typeof creatorBlockRules.$inferSelect;
export type DodgeRule = typeof creatorDodgeRules.$inferSelect;
export type ParryRule = typeof creatorParryRules.$inferSelect;
export type ComboRule = typeof creatorComboRules.$inferSelect;
export type StatusEffect = typeof creatorStatusEffects.$inferSelect;
export type StatusEffectStack = typeof creatorStatusEffectStacks.$inferSelect;
export type ThreatRule = typeof creatorThreatRules.$inferSelect;
export type RespawnRule = typeof creatorRespawnRules.$inferSelect;
export type CombatZone = typeof creatorCombatZones.$inferSelect;
export type TargetFilter = typeof creatorTargetFilters.$inferSelect;
export type CombatHistory = typeof creatorCombatHistory.$inferSelect;
export type CombatVersion = typeof creatorCombatVersions.$inferSelect;
