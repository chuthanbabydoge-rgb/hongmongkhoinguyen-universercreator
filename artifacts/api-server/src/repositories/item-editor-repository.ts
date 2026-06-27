import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  creatorItems, creatorItemStats, creatorItemAttributes, creatorItemEffects,
  creatorItemEquipmentSlots, creatorItemCraftingRecipes, creatorItemComponents,
  creatorItemLootTables, creatorItemDrops, creatorItemInventories,
  creatorItemTemplates, creatorItemVersions, creatorItemHistory,
  creatorItemTags, creatorItemPricing, creatorItemTradeRules,
  creatorItemUsageRules, creatorItemRestrictions, creatorItemVisuals,
  creatorItemExports, creatorItemImports,
  type InsertItem,
} from "@workspace/db/schema";

export class DrizzleItemEditorRepository {
  // ── Items ─────────────────────────────────────────────────────────────────

  async listItems(userId: number, limit: number, offset: number, search?: string) {
    const where = search
      ? and(eq(creatorItems.createdBy, userId), ilike(creatorItems.name, `%${search}%`))
      : eq(creatorItems.createdBy, userId);
    return db.select().from(creatorItems).where(where)
      .orderBy(desc(creatorItems.updatedAt)).limit(limit).offset(offset);
  }

  async countItems(userId: number) {
    const [row] = await db.select({ count: sql<number>`count(*)::int` })
      .from(creatorItems).where(eq(creatorItems.createdBy, userId));
    return row?.count ?? 0;
  }

  async getItemById(id: number) {
    const [row] = await db.select().from(creatorItems).where(eq(creatorItems.id, id));
    return row ?? null;
  }

  async createItem(data: InsertItem) {
    const [row] = await db.insert(creatorItems).values(data).returning();
    return row!;
  }

  async updateItem(id: number, data: Partial<InsertItem>) {
    const [row] = await db.update(creatorItems).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorItems.id, id)).returning();
    return row ?? null;
  }

  async deleteItem(id: number) {
    await db.delete(creatorItems).where(eq(creatorItems.id, id));
  }

  async publishItem(id: number) {
    return this.updateItem(id, { isPublished: true });
  }

  async archiveItem(id: number) {
    return this.updateItem(id, { isArchived: true, isPublished: false });
  }

  async restoreItem(id: number) {
    return this.updateItem(id, { isArchived: false });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async listStats(itemId: number) {
    return db.select().from(creatorItemStats).where(eq(creatorItemStats.itemId, itemId))
      .orderBy(creatorItemStats.displayOrder);
  }

  async upsertStat(itemId: number, data: Omit<typeof creatorItemStats.$inferInsert, "itemId">) {
    const [row] = await db.insert(creatorItemStats).values({ ...data, itemId }).returning();
    return row!;
  }

  async deleteStat(statId: number) {
    await db.delete(creatorItemStats).where(eq(creatorItemStats.id, statId));
  }

  // ── Attributes ────────────────────────────────────────────────────────────

  async listAttributes(itemId: number) {
    return db.select().from(creatorItemAttributes).where(eq(creatorItemAttributes.itemId, itemId))
      .orderBy(creatorItemAttributes.displayOrder);
  }

  async upsertAttribute(itemId: number, data: Omit<typeof creatorItemAttributes.$inferInsert, "itemId">) {
    const [row] = await db.insert(creatorItemAttributes).values({ ...data, itemId }).returning();
    return row!;
  }

  async deleteAttribute(attrId: number) {
    await db.delete(creatorItemAttributes).where(eq(creatorItemAttributes.id, attrId));
  }

  // ── Effects ───────────────────────────────────────────────────────────────

  async listEffects(itemId: number) {
    return db.select().from(creatorItemEffects).where(eq(creatorItemEffects.itemId, itemId))
      .orderBy(creatorItemEffects.displayOrder);
  }

  async createEffect(itemId: number, data: Omit<typeof creatorItemEffects.$inferInsert, "itemId">) {
    const [row] = await db.insert(creatorItemEffects).values({ ...data, itemId }).returning();
    return row!;
  }

  async updateEffect(effectId: number, data: Partial<typeof creatorItemEffects.$inferInsert>) {
    const [row] = await db.update(creatorItemEffects).set(data)
      .where(eq(creatorItemEffects.id, effectId)).returning();
    return row ?? null;
  }

  async deleteEffect(effectId: number) {
    await db.delete(creatorItemEffects).where(eq(creatorItemEffects.id, effectId));
  }

  // ── Equipment Slots ───────────────────────────────────────────────────────

  async listEquipmentSlots(itemId: number) {
    return db.select().from(creatorItemEquipmentSlots)
      .where(eq(creatorItemEquipmentSlots.itemId, itemId))
      .orderBy(creatorItemEquipmentSlots.displayOrder);
  }

  async createEquipmentSlot(itemId: number, data: Omit<typeof creatorItemEquipmentSlots.$inferInsert, "itemId">) {
    const [row] = await db.insert(creatorItemEquipmentSlots).values({ ...data, itemId }).returning();
    return row!;
  }

  async deleteEquipmentSlot(slotId: number) {
    await db.delete(creatorItemEquipmentSlots).where(eq(creatorItemEquipmentSlots.id, slotId));
  }

  // ── Crafting Recipes ──────────────────────────────────────────────────────

  async listRecipes(outputItemId: number) {
    return db.select().from(creatorItemCraftingRecipes)
      .where(eq(creatorItemCraftingRecipes.outputItemId, outputItemId))
      .orderBy(desc(creatorItemCraftingRecipes.createdAt));
  }

  async createRecipe(data: typeof creatorItemCraftingRecipes.$inferInsert) {
    const [row] = await db.insert(creatorItemCraftingRecipes).values(data).returning();
    return row!;
  }

  async updateRecipe(recipeId: number, data: Partial<typeof creatorItemCraftingRecipes.$inferInsert>) {
    const [row] = await db.update(creatorItemCraftingRecipes).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorItemCraftingRecipes.id, recipeId)).returning();
    return row ?? null;
  }

  async deleteRecipe(recipeId: number) {
    await db.delete(creatorItemCraftingRecipes).where(eq(creatorItemCraftingRecipes.id, recipeId));
  }

  async listComponents(recipeId: number) {
    return db.select().from(creatorItemComponents)
      .where(eq(creatorItemComponents.recipeId, recipeId))
      .orderBy(creatorItemComponents.displayOrder);
  }

  async createComponent(data: typeof creatorItemComponents.$inferInsert) {
    const [row] = await db.insert(creatorItemComponents).values(data).returning();
    return row!;
  }

  async deleteComponent(componentId: number) {
    await db.delete(creatorItemComponents).where(eq(creatorItemComponents.id, componentId));
  }

  // ── Loot Tables ───────────────────────────────────────────────────────────

  async listLootTables(userId: number, limit: number, offset: number) {
    return db.select().from(creatorItemLootTables)
      .where(eq(creatorItemLootTables.createdBy, userId))
      .orderBy(desc(creatorItemLootTables.createdAt)).limit(limit).offset(offset);
  }

  async getLootTableById(id: number) {
    const [row] = await db.select().from(creatorItemLootTables)
      .where(eq(creatorItemLootTables.id, id));
    return row ?? null;
  }

  async createLootTable(data: typeof creatorItemLootTables.$inferInsert) {
    const [row] = await db.insert(creatorItemLootTables).values(data).returning();
    return row!;
  }

  async updateLootTable(id: number, data: Partial<typeof creatorItemLootTables.$inferInsert>) {
    const [row] = await db.update(creatorItemLootTables).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorItemLootTables.id, id)).returning();
    return row ?? null;
  }

  async deleteLootTable(id: number) {
    await db.delete(creatorItemLootTables).where(eq(creatorItemLootTables.id, id));
  }

  async listDrops(lootTableId: number) {
    return db.select().from(creatorItemDrops)
      .where(eq(creatorItemDrops.lootTableId, lootTableId))
      .orderBy(creatorItemDrops.displayOrder);
  }

  async createDrop(data: typeof creatorItemDrops.$inferInsert) {
    const [row] = await db.insert(creatorItemDrops).values(data).returning();
    return row!;
  }

  async updateDrop(dropId: number, data: Partial<typeof creatorItemDrops.$inferInsert>) {
    const [row] = await db.update(creatorItemDrops).set(data)
      .where(eq(creatorItemDrops.id, dropId)).returning();
    return row ?? null;
  }

  async deleteDrop(dropId: number) {
    await db.delete(creatorItemDrops).where(eq(creatorItemDrops.id, dropId));
  }

  // ── Inventories ───────────────────────────────────────────────────────────

  async listInventories(userId: number) {
    return db.select().from(creatorItemInventories)
      .where(eq(creatorItemInventories.createdBy, userId))
      .orderBy(desc(creatorItemInventories.createdAt));
  }

  async createInventory(data: typeof creatorItemInventories.$inferInsert) {
    const [row] = await db.insert(creatorItemInventories).values(data).returning();
    return row!;
  }

  async updateInventory(id: number, data: Partial<typeof creatorItemInventories.$inferInsert>) {
    const [row] = await db.update(creatorItemInventories).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorItemInventories.id, id)).returning();
    return row ?? null;
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  async listTemplates(limit: number, offset: number) {
    return db.select().from(creatorItemTemplates)
      .orderBy(desc(creatorItemTemplates.useCount)).limit(limit).offset(offset);
  }

  async createTemplate(data: typeof creatorItemTemplates.$inferInsert) {
    const [row] = await db.insert(creatorItemTemplates).values(data).returning();
    return row!;
  }

  async incrementTemplateUse(templateId: number) {
    await db.update(creatorItemTemplates)
      .set({ useCount: sql`${creatorItemTemplates.useCount} + 1` })
      .where(eq(creatorItemTemplates.id, templateId));
  }

  // ── Versions & History ────────────────────────────────────────────────────

  async saveVersion(data: typeof creatorItemVersions.$inferInsert) {
    const [row] = await db.insert(creatorItemVersions).values(data).returning();
    return row!;
  }

  async listVersions(itemId: number) {
    return db.select().from(creatorItemVersions)
      .where(eq(creatorItemVersions.itemId, itemId))
      .orderBy(desc(creatorItemVersions.version));
  }

  async appendHistory(data: typeof creatorItemHistory.$inferInsert) {
    await db.insert(creatorItemHistory).values(data);
  }

  async listHistory(itemId: number, limit: number, offset: number) {
    return db.select().from(creatorItemHistory)
      .where(eq(creatorItemHistory.itemId, itemId))
      .orderBy(desc(creatorItemHistory.createdAt)).limit(limit).offset(offset);
  }

  // ── Pricing ───────────────────────────────────────────────────────────────

  async listPricing(itemId: number) {
    return db.select().from(creatorItemPricing)
      .where(eq(creatorItemPricing.itemId, itemId));
  }

  async upsertPricing(itemId: number, data: Omit<typeof creatorItemPricing.$inferInsert, "itemId">) {
    const [row] = await db.insert(creatorItemPricing).values({ ...data, itemId }).returning();
    return row!;
  }

  async deletePricing(pricingId: number) {
    await db.delete(creatorItemPricing).where(eq(creatorItemPricing.id, pricingId));
  }

  // ── Trade Rules ───────────────────────────────────────────────────────────

  async listTradeRules(itemId: number) {
    return db.select().from(creatorItemTradeRules)
      .where(eq(creatorItemTradeRules.itemId, itemId))
      .orderBy(creatorItemTradeRules.displayOrder);
  }

  async createTradeRule(data: typeof creatorItemTradeRules.$inferInsert) {
    const [row] = await db.insert(creatorItemTradeRules).values(data).returning();
    return row!;
  }

  async deleteTradeRule(ruleId: number) {
    await db.delete(creatorItemTradeRules).where(eq(creatorItemTradeRules.id, ruleId));
  }

  // ── Usage Rules ───────────────────────────────────────────────────────────

  async listUsageRules(itemId: number) {
    return db.select().from(creatorItemUsageRules)
      .where(eq(creatorItemUsageRules.itemId, itemId))
      .orderBy(creatorItemUsageRules.displayOrder);
  }

  async createUsageRule(data: typeof creatorItemUsageRules.$inferInsert) {
    const [row] = await db.insert(creatorItemUsageRules).values(data).returning();
    return row!;
  }

  async deleteUsageRule(ruleId: number) {
    await db.delete(creatorItemUsageRules).where(eq(creatorItemUsageRules.id, ruleId));
  }

  // ── Restrictions ──────────────────────────────────────────────────────────

  async listRestrictions(itemId: number) {
    return db.select().from(creatorItemRestrictions)
      .where(eq(creatorItemRestrictions.itemId, itemId));
  }

  async createRestriction(data: typeof creatorItemRestrictions.$inferInsert) {
    const [row] = await db.insert(creatorItemRestrictions).values(data).returning();
    return row!;
  }

  async deleteRestriction(restrictionId: number) {
    await db.delete(creatorItemRestrictions).where(eq(creatorItemRestrictions.id, restrictionId));
  }

  // ── Visuals ───────────────────────────────────────────────────────────────

  async listVisuals(itemId: number) {
    return db.select().from(creatorItemVisuals)
      .where(eq(creatorItemVisuals.itemId, itemId))
      .orderBy(creatorItemVisuals.displayOrder);
  }

  async createVisual(data: typeof creatorItemVisuals.$inferInsert) {
    const [row] = await db.insert(creatorItemVisuals).values(data).returning();
    return row!;
  }

  async updateVisual(visualId: number, data: Partial<typeof creatorItemVisuals.$inferInsert>) {
    const [row] = await db.update(creatorItemVisuals).set(data)
      .where(eq(creatorItemVisuals.id, visualId)).returning();
    return row ?? null;
  }

  async deleteVisual(visualId: number) {
    await db.delete(creatorItemVisuals).where(eq(creatorItemVisuals.id, visualId));
  }

  // ── Exports & Imports ─────────────────────────────────────────────────────

  async saveExport(data: typeof creatorItemExports.$inferInsert) {
    const [row] = await db.insert(creatorItemExports).values(data).returning();
    return row!;
  }

  async saveImport(data: typeof creatorItemImports.$inferInsert) {
    const [row] = await db.insert(creatorItemImports).values(data).returning();
    return row!;
  }

  async listExports(itemId: number) {
    return db.select().from(creatorItemExports)
      .where(eq(creatorItemExports.itemId, itemId))
      .orderBy(desc(creatorItemExports.createdAt));
  }
}
