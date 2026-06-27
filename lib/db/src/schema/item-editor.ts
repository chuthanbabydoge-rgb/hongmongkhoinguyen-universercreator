import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const itemTypeEnum = pgEnum("item_type", [
  "weapon", "armor", "consumable", "material", "currency",
  "quest_item", "crafting", "accessory", "tool", "cosmetic",
]);

export const itemRarityEnum = pgEnum("item_rarity", [
  "common", "uncommon", "rare", "epic", "legendary", "mythic", "unique",
]);

export const itemCategoryEnum = pgEnum("item_category", [
  "melee", "ranged", "magic", "shield", "helmet", "chest", "legs",
  "boots", "gloves", "ring", "amulet", "potion", "food", "ore",
  "gem", "cloth", "wood", "metal", "coin", "token", "misc",
]);

export const itemBindingTypeEnum = pgEnum("item_binding_type", [
  "none", "bind_on_pickup", "bind_on_equip", "bind_on_use", "account_bound",
]);

export const itemStackTypeEnum = pgEnum("item_stack_type", [
  "non_stackable", "stackable", "limited_stack",
]);

export const itemQualityEnum = pgEnum("item_quality", [
  "poor", "normal", "fine", "superior", "masterwork", "artifact",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorItems = pgTable("creator_items", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  flavorText: text("flavor_text"),
  itemType: itemTypeEnum("item_type").notNull().default("material"),
  category: itemCategoryEnum("category").notNull().default("misc"),
  rarity: itemRarityEnum("rarity").notNull().default("common"),
  quality: itemQualityEnum("quality").notNull().default("normal"),
  bindingType: itemBindingTypeEnum("binding_type").notNull().default("none"),
  stackType: itemStackTypeEnum("stack_type").notNull().default("non_stackable"),
  maxStack: integer("max_stack").notNull().default(1),
  level: integer("level").notNull().default(1),
  requiredLevel: integer("required_level").notNull().default(1),
  weight: real("weight").notNull().default(0),
  baseValue: integer("base_value").notNull().default(0),
  sellValue: integer("sell_value").notNull().default(0),
  isQuestItem: boolean("is_quest_item").notNull().default(false),
  isTradeable: boolean("is_tradeable").notNull().default(true),
  isDroppable: boolean("is_droppable").notNull().default(true),
  isDestroyable: boolean("is_destroyable").notNull().default(true),
  iconAssetId: integer("icon_asset_id"),
  modelAssetId: integer("model_asset_id"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  isTemplate: boolean("is_template").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorItemStats = pgTable("creator_item_stats", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  statName: text("stat_name").notNull(),
  baseValue: real("base_value").notNull().default(0),
  minValue: real("min_value").notNull().default(0),
  maxValue: real("max_value").notNull().default(0),
  scaling: real("scaling").notNull().default(1),
  scalingStat: text("scaling_stat"),
  isPrimary: boolean("is_primary").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemAttributes = pgTable("creator_item_attributes", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  attributeKey: text("attribute_key").notNull(),
  attributeValue: text("attribute_value").notNull(),
  attributeType: text("attribute_type").notNull().default("string"),
  isEditable: boolean("is_editable").notNull().default(true),
  displayLabel: text("display_label"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemEffects = pgTable("creator_item_effects", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  effectName: text("effect_name").notNull(),
  effectType: text("effect_type").notNull(),
  trigger: text("trigger").notNull().default("on_use"),
  targetType: text("target_type").notNull().default("self"),
  duration: integer("duration"),
  magnitude: real("magnitude").notNull().default(0),
  chance: real("chance").notNull().default(1.0),
  cooldown: integer("cooldown"),
  description: text("description"),
  scriptRef: text("script_ref"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemEquipmentSlots = pgTable("creator_item_equipment_slots", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  slotName: text("slot_name").notNull(),
  slotGroup: text("slot_group"),
  isRequired: boolean("is_required").notNull().default(false),
  isPrimary: boolean("is_primary").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemCraftingRecipes = pgTable("creator_item_crafting_recipes", {
  id: serial("id").primaryKey(),
  outputItemId: integer("output_item_id").notNull(),
  createdBy: integer("created_by").notNull(),
  recipeName: text("recipe_name").notNull(),
  description: text("description"),
  craftingStation: text("crafting_station"),
  craftingTime: integer("crafting_time").notNull().default(0),
  outputQuantity: integer("output_quantity").notNull().default(1),
  requiredLevel: integer("required_level").notNull().default(1),
  requiredSkill: text("required_skill"),
  requiredSkillLevel: integer("required_skill_level").notNull().default(0),
  experienceGained: integer("experience_gained").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorItemComponents = pgTable("creator_item_components", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  componentItemId: integer("component_item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  isOptional: boolean("is_optional").notNull().default(false),
  canSubstitute: boolean("can_substitute").notNull().default(false),
  substituteItemId: integer("substitute_item_id"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemLootTables = pgTable("creator_item_loot_tables", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  tableName: text("table_name").notNull(),
  description: text("description"),
  rollType: text("roll_type").notNull().default("single"),
  minRolls: integer("min_rolls").notNull().default(1),
  maxRolls: integer("max_rolls").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorItemDrops = pgTable("creator_item_drops", {
  id: serial("id").primaryKey(),
  lootTableId: integer("loot_table_id").notNull(),
  itemId: integer("item_id").notNull(),
  dropChance: real("drop_chance").notNull().default(0.1),
  minQuantity: integer("min_quantity").notNull().default(1),
  maxQuantity: integer("max_quantity").notNull().default(1),
  requiredCondition: text("required_condition"),
  weight: real("weight").notNull().default(1.0),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemInventories = pgTable("creator_item_inventories", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").notNull(),
  projectId: integer("project_id"),
  inventoryName: text("inventory_name").notNull(),
  ownerType: text("owner_type").notNull().default("npc"),
  ownerId: integer("owner_id"),
  maxSlots: integer("max_slots").notNull().default(20),
  maxWeight: real("max_weight").notNull().default(100),
  isShared: boolean("is_shared").notNull().default(false),
  allowedTypes: text("allowed_types").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorItemTemplates = pgTable("creator_item_templates", {
  id: serial("id").primaryKey(),
  sourceItemId: integer("source_item_id").notNull(),
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

export const creatorItemVersions = pgTable("creator_item_versions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  version: integer("version").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  changelog: text("changelog"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("creator_item_versions_item_version").on(t.itemId, t.version)]);

export const creatorItemHistory = pgTable("creator_item_history", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  actionType: text("action_type").notNull(),
  fieldChanged: text("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  performedBy: integer("performed_by").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemTags = pgTable("creator_item_tags", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemPricing = pgTable("creator_item_pricing", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  currencyType: text("currency_type").notNull().default("gold"),
  buyPrice: integer("buy_price").notNull().default(0),
  sellPrice: integer("sell_price").notNull().default(0),
  repairCost: integer("repair_cost").notNull().default(0),
  auctionMinBid: integer("auction_min_bid").notNull().default(0),
  regionId: integer("region_id"),
  factionId: integer("faction_id"),
  discountRate: real("discount_rate").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatorItemTradeRules = pgTable("creator_item_trade_rules", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(),
  condition: text("condition"),
  value: text("value"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemUsageRules = pgTable("creator_item_usage_rules", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull().default("requirement"),
  condition: text("condition"),
  value: text("value"),
  failMessage: text("fail_message"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemRestrictions = pgTable("creator_item_restrictions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  restrictionType: text("restriction_type").notNull(),
  restrictionValue: text("restriction_value").notNull(),
  isBlacklist: boolean("is_blacklist").notNull().default(true),
  reason: text("reason"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemVisuals = pgTable("creator_item_visuals", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  visualType: text("visual_type").notNull().default("icon"),
  assetId: integer("asset_id"),
  assetUrl: text("asset_url"),
  colorTint: text("color_tint"),
  scale: real("scale").notNull().default(1.0),
  offset: jsonb("offset"),
  rotation: jsonb("rotation"),
  animationId: text("animation_id"),
  particleEffect: text("particle_effect"),
  shaderOverride: text("shader_override"),
  metadata: jsonb("metadata"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemExports = pgTable("creator_item_exports", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  exportedBy: integer("exported_by").notNull(),
  format: text("format").notNull().default("json"),
  payload: text("payload").notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorItemImports = pgTable("creator_item_imports", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  importedBy: integer("imported_by").notNull(),
  sourceFormat: text("source_format").notNull().default("json"),
  sourceRef: text("source_ref"),
  status: text("status").notNull().default("success"),
  errors: text("errors").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertItemSchema = createInsertSchema(creatorItems);
export const insertItemStatSchema = createInsertSchema(creatorItemStats);
export const insertItemAttributeSchema = createInsertSchema(creatorItemAttributes);
export const insertItemEffectSchema = createInsertSchema(creatorItemEffects);
export const insertItemEquipmentSlotSchema = createInsertSchema(creatorItemEquipmentSlots);
export const insertItemCraftingRecipeSchema = createInsertSchema(creatorItemCraftingRecipes);
export const insertItemComponentSchema = createInsertSchema(creatorItemComponents);
export const insertItemLootTableSchema = createInsertSchema(creatorItemLootTables);
export const insertItemDropSchema = createInsertSchema(creatorItemDrops);
export const insertItemInventorySchema = createInsertSchema(creatorItemInventories);
export const insertItemTemplateSchema = createInsertSchema(creatorItemTemplates);
export const insertItemVersionSchema = createInsertSchema(creatorItemVersions);
export const insertItemHistorySchema = createInsertSchema(creatorItemHistory);
export const insertItemTagSchema = createInsertSchema(creatorItemTags);
export const insertItemPricingSchema = createInsertSchema(creatorItemPricing);
export const insertItemTradeRuleSchema = createInsertSchema(creatorItemTradeRules);
export const insertItemUsageRuleSchema = createInsertSchema(creatorItemUsageRules);
export const insertItemRestrictionSchema = createInsertSchema(creatorItemRestrictions);
export const insertItemVisualSchema = createInsertSchema(creatorItemVisuals);
export const insertItemExportSchema = createInsertSchema(creatorItemExports);
export const insertItemImportSchema = createInsertSchema(creatorItemImports);

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type Item = typeof creatorItems.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type ItemStat = typeof creatorItemStats.$inferSelect;
export type ItemAttribute = typeof creatorItemAttributes.$inferSelect;
export type ItemEffect = typeof creatorItemEffects.$inferSelect;
export type ItemEquipmentSlot = typeof creatorItemEquipmentSlots.$inferSelect;
export type ItemCraftingRecipe = typeof creatorItemCraftingRecipes.$inferSelect;
export type ItemComponent = typeof creatorItemComponents.$inferSelect;
export type ItemLootTable = typeof creatorItemLootTables.$inferSelect;
export type ItemDrop = typeof creatorItemDrops.$inferSelect;
export type ItemInventory = typeof creatorItemInventories.$inferSelect;
export type ItemTemplate = typeof creatorItemTemplates.$inferSelect;
export type ItemVersion = typeof creatorItemVersions.$inferSelect;
export type ItemHistory = typeof creatorItemHistory.$inferSelect;
export type ItemTag = typeof creatorItemTags.$inferSelect;
export type ItemPricing = typeof creatorItemPricing.$inferSelect;
export type ItemTradeRule = typeof creatorItemTradeRules.$inferSelect;
export type ItemUsageRule = typeof creatorItemUsageRules.$inferSelect;
export type ItemRestriction = typeof creatorItemRestrictions.$inferSelect;
export type ItemVisual = typeof creatorItemVisuals.$inferSelect;
export type ItemExport = typeof creatorItemExports.$inferSelect;
export type ItemImport = typeof creatorItemImports.$inferSelect;
