import { pgTable, serial, integer, text, boolean, real, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const petTypeEnum = pgEnum("pet_type", [
  "beast", "dragon", "elemental", "mechanical", "undead", "spirit",
  "aquatic", "flying", "insect", "plant", "humanoid", "demon",
]);

export const petRarityEnum = pgEnum("pet_rarity", [
  "common", "uncommon", "rare", "epic", "legendary", "mythic",
]);

export const petStateEnum = pgEnum("pet_state", [
  "idle", "following", "fighting", "resting", "hungry", "happy",
  "evolving", "breeding", "sleeping", "exploring",
]);

export const petGrowthTypeEnum = pgEnum("pet_growth_type", [
  "fast", "normal", "slow", "erratic", "fluctuating", "medium_fast",
]);

export const petPersonalityEnum = pgEnum("pet_personality", [
  "brave", "timid", "jolly", "modest", "bold", "calm",
  "gentle", "hasty", "impish", "lax", "lonely", "mild",
  "naive", "naughty", "quiet", "quirky", "rash", "relaxed",
  "sassy", "serious",
]);

export const petFoodTypeEnum = pgEnum("pet_food_type", [
  "meat", "fish", "berries", "vegetables", "candy", "special",
  "potion", "crystal", "none",
]);

export const petSizeEnum = pgEnum("pet_size", [
  "tiny", "small", "medium", "large", "huge", "gigantic",
]);

export const creatorPets = pgTable("creator_pets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  createdBy: integer("created_by").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  speciesId: integer("species_id"),
  petType: petTypeEnum("pet_type").notNull().default("beast"),
  rarity: petRarityEnum("rarity").notNull().default("common"),
  state: petStateEnum("state").notNull().default("idle"),
  personality: petPersonalityEnum("personality").notNull().default("quirky"),
  size: petSizeEnum("size").notNull().default("medium"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  loyalty: integer("loyalty").notNull().default(50),
  hunger: integer("hunger").notNull().default(100),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  iconAssetId: text("icon_asset_id"),
  portraitAssetId: text("portrait_asset_id"),
  modelAssetId: text("model_asset_id"),
  animationAssetId: text("animation_asset_id"),
  audioAssetId: text("audio_asset_id"),
  worldRef: text("world_ref"),
  npcRef: text("npc_ref"),
  combatRef: text("combat_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorPetSpecies = pgTable("creator_pet_species", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  petType: petTypeEnum("pet_type").notNull().default("beast"),
  rarity: petRarityEnum("rarity").notNull().default("common"),
  size: petSizeEnum("size").notNull().default("medium"),
  foodType: petFoodTypeEnum("food_type").notNull().default("meat"),
  baseHp: integer("base_hp").notNull().default(100),
  baseAttack: integer("base_attack").notNull().default(10),
  baseDefense: integer("base_defense").notNull().default(5),
  baseSpeed: integer("base_speed").notNull().default(10),
  baseSpecialAttack: integer("base_special_attack").notNull().default(5),
  baseSpecialDefense: integer("base_special_defense").notNull().default(5),
  growthType: petGrowthTypeEnum("growth_type").notNull().default("normal"),
  captureRate: integer("capture_rate").notNull().default(45),
  description: text("description"),
  iconAssetId: text("icon_asset_id"),
  portraitAssetId: text("portrait_asset_id"),
  modelAssetId: text("model_asset_id"),
  animationAssetId: text("animation_asset_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetLevels = pgTable("creator_pet_levels", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  level: integer("level").notNull().default(1),
  expRequired: integer("exp_required").notNull().default(0),
  hpBonus: integer("hp_bonus").notNull().default(0),
  attackBonus: integer("attack_bonus").notNull().default(0),
  defenseBonus: integer("defense_bonus").notNull().default(0),
  speedBonus: integer("speed_bonus").notNull().default(0),
  skillUnlocked: text("skill_unlocked"),
  reward: text("reward"),
  metadata: jsonb("metadata"),
});

export const creatorPetStats = pgTable("creator_pet_stats", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  hp: integer("hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  speed: integer("speed").notNull().default(10),
  specialAttack: integer("special_attack").notNull().default(5),
  specialDefense: integer("special_defense").notNull().default(5),
  critRate: real("crit_rate").notNull().default(0.05),
  evasion: real("evasion").notNull().default(0.05),
  accuracy: real("accuracy").notNull().default(0.95),
  elementalBonus: jsonb("elemental_bonus"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorPetGrowth = pgTable("creator_pet_growth", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  growthType: petGrowthTypeEnum("growth_type").notNull().default("normal"),
  expMultiplier: real("exp_multiplier").notNull().default(1.0),
  statMultiplier: real("stat_multiplier").notNull().default(1.0),
  loyaltyGrowth: real("loyalty_growth").notNull().default(1.0),
  hungerRate: real("hunger_rate").notNull().default(1.0),
  evolutionEligible: boolean("evolution_eligible").notNull().default(false),
  maxLevel: integer("max_level").notNull().default(100),
  notes: text("notes"),
  metadata: jsonb("metadata"),
});

export const creatorPetSkills = pgTable("creator_pet_skills", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  skillRef: text("skill_ref").notNull(),
  slotIndex: integer("slot_index").notNull().default(0),
  learnedAtLevel: integer("learned_at_level").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  uses: integer("uses"),
  maxUses: integer("max_uses"),
  metadata: jsonb("metadata"),
});

export const creatorPetEquipment = pgTable("creator_pet_equipment", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  slot: text("slot").notNull(),
  itemRef: text("item_ref"),
  attackBonus: integer("attack_bonus").notNull().default(0),
  defenseBonus: integer("defense_bonus").notNull().default(0),
  speedBonus: integer("speed_bonus").notNull().default(0),
  hpBonus: integer("hp_bonus").notNull().default(0),
  specialBonus: jsonb("special_bonus"),
  equippedAt: timestamp("equipped_at").notNull().defaultNow(),
});

export const creatorPetLoyalty = pgTable("creator_pet_loyalty", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  currentLoyalty: integer("current_loyalty").notNull().default(50),
  maxLoyalty: integer("max_loyalty").notNull().default(100),
  minLoyalty: integer("min_loyalty").notNull().default(0),
  loyaltyPerFeed: integer("loyalty_per_feed").notNull().default(5),
  loyaltyPerCombat: integer("loyalty_per_combat").notNull().default(3),
  loyaltyDecayRate: real("loyalty_decay_rate").notNull().default(0.1),
  loyaltyThresholds: jsonb("loyalty_thresholds"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorPetHunger = pgTable("creator_pet_hunger", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  currentHunger: integer("current_hunger").notNull().default(100),
  maxHunger: integer("max_hunger").notNull().default(100),
  hungerDecayRate: real("hunger_decay_rate").notNull().default(1.0),
  preferredFood: petFoodTypeEnum("preferred_food").notNull().default("meat"),
  dislikedFood: petFoodTypeEnum("disliked_food"),
  feedCooldown: integer("feed_cooldown").notNull().default(300),
  lastFedAt: timestamp("last_fed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorPetPersonality = pgTable("creator_pet_personality", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  personality: petPersonalityEnum("personality").notNull().default("quirky"),
  statBonusStat: text("stat_bonus_stat"),
  statPenaltyStat: text("stat_penalty_stat"),
  preferredActivity: text("preferred_activity"),
  flavorText: text("flavor_text"),
  behaviorFlags: jsonb("behavior_flags"),
});

export const creatorPetEvolution = pgTable("creator_pet_evolution", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  targetSpeciesId: integer("target_species_id").notNull(),
  requiredLevel: integer("required_level").notNull().default(20),
  requiredItem: text("required_item"),
  requiredLoyalty: integer("required_loyalty"),
  requiredCondition: text("required_condition"),
  evolutionOrder: integer("evolution_order").notNull().default(1),
  isReversible: boolean("is_reversible").notNull().default(false),
  statBoostOnEvolve: jsonb("stat_boost_on_evolve"),
  metadata: jsonb("metadata"),
});

export const creatorPetBreeding = pgTable("creator_pet_breeding", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  partnerId: integer("partner_id"),
  offspringSpeciesId: integer("offspring_species_id"),
  breedingCooldown: integer("breeding_cooldown").notNull().default(3600),
  lastBredAt: timestamp("last_bred_at"),
  maxBreeds: integer("max_breeds").notNull().default(10),
  currentBreeds: integer("current_breeds").notNull().default(0),
  inheritanceRules: jsonb("inheritance_rules"),
  specialTraits: jsonb("special_traits"),
  metadata: jsonb("metadata"),
});

export const creatorPetSpawnRules = pgTable("creator_pet_spawn_rules", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  regionRef: text("region_ref"),
  spawnWeight: real("spawn_weight").notNull().default(1.0),
  spawnCondition: text("spawn_condition"),
  minLevel: integer("min_level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(10),
  spawnTimeStart: integer("spawn_time_start"),
  spawnTimeEnd: integer("spawn_time_end"),
  maxConcurrent: integer("max_concurrent").notNull().default(5),
  isEnabled: boolean("is_enabled").notNull().default(true),
  metadata: jsonb("metadata"),
});

export const creatorPetTemplates = pgTable("creator_pet_templates", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isGlobal: boolean("is_global").notNull().default(false),
  tags: jsonb("tags"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetVersions = pgTable("creator_pet_versions", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  version: integer("version").notNull().default(1),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetHistory = pgTable("creator_pet_history", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  action: text("action").notNull(),
  detail: text("detail"),
  changedBy: integer("changed_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetStatistics = pgTable("creator_pet_statistics", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  totalBattles: integer("total_battles").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalFeeds: integer("total_feeds").notNull().default(0),
  totalEvolutions: integer("total_evolutions").notNull().default(0),
  totalBreeds: integer("total_breeds").notNull().default(0),
  totalExpGained: integer("total_exp_gained").notNull().default(0),
  highestLevel: integer("highest_level").notNull().default(1),
  playtime: integer("playtime").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorPetExports = pgTable("creator_pet_exports", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  format: text("format").notNull().default("json"),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum"),
  exportedBy: integer("exported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetImports = pgTable("creator_pet_imports", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  source: text("source").notNull().default("json"),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  importedBy: integer("imported_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorPetRuntime = pgTable("creator_pet_runtime", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  isSpawned: boolean("is_spawned").notNull().default(false),
  isSummoned: boolean("is_summoned").notNull().default(false),
  ownerId: integer("owner_id"),
  currentHp: integer("current_hp").notNull().default(100),
  currentExp: integer("current_exp").notNull().default(0),
  currentLoyalty: integer("current_loyalty").notNull().default(50),
  currentHunger: integer("current_hunger").notNull().default(100),
  runtimeState: petStateEnum("runtime_state").notNull().default("idle"),
  simulationData: jsonb("simulation_data"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertPet = typeof creatorPets.$inferInsert;
export type SelectPet = typeof creatorPets.$inferSelect;
export type InsertPetSpecies = typeof creatorPetSpecies.$inferInsert;
export type SelectPetSpecies = typeof creatorPetSpecies.$inferSelect;
export type InsertPetLevel = typeof creatorPetLevels.$inferInsert;
export type InsertPetStat = typeof creatorPetStats.$inferInsert;
export type InsertPetGrowth = typeof creatorPetGrowth.$inferInsert;
export type InsertPetSkill = typeof creatorPetSkills.$inferInsert;
export type InsertPetEquipment = typeof creatorPetEquipment.$inferInsert;
export type InsertPetLoyalty = typeof creatorPetLoyalty.$inferInsert;
export type InsertPetHunger = typeof creatorPetHunger.$inferInsert;
export type InsertPetPersonality = typeof creatorPetPersonality.$inferInsert;
export type InsertPetEvolution = typeof creatorPetEvolution.$inferInsert;
export type InsertPetBreeding = typeof creatorPetBreeding.$inferInsert;
export type InsertPetSpawnRule = typeof creatorPetSpawnRules.$inferInsert;
export type InsertPetTemplate = typeof creatorPetTemplates.$inferInsert;
export type InsertPetVersion = typeof creatorPetVersions.$inferInsert;
export type InsertPetHistory = typeof creatorPetHistory.$inferInsert;
export type InsertPetStatistic = typeof creatorPetStatistics.$inferInsert;
export type InsertPetRuntime = typeof creatorPetRuntime.$inferInsert;
