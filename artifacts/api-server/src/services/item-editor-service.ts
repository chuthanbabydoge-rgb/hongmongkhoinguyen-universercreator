import { DrizzleItemEditorRepository } from "../repositories/item-editor-repository";
import { ItemValidator } from "./item-validator";
import { ItemExporter } from "./item-exporter";
import { ItemImporter } from "./item-importer";
import { ItemRuntimeBridge } from "./item-runtime-bridge";
import type { InsertItem } from "@workspace/db/schema";

export class ItemEditorService {
  private repo = new DrizzleItemEditorRepository();
  public validator = new ItemValidator(this.repo);
  public exporter = new ItemExporter(this.repo);
  public importer = new ItemImporter(this.repo);
  public runtime = new ItemRuntimeBridge(this.repo);

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard(userId: number) {
    const items = await this.repo.listItems(userId, 200, 0);
    const total = items.length;
    const published = items.filter((i) => i.isPublished && !i.isArchived).length;
    const drafts = items.filter((i) => !i.isPublished && !i.isArchived).length;
    const archived = items.filter((i) => i.isArchived).length;
    const byType = items.reduce<Record<string, number>>((acc, i) => {
      acc[i.itemType] = (acc[i.itemType] ?? 0) + 1;
      return acc;
    }, {});
    const byRarity = items.reduce<Record<string, number>>((acc, i) => {
      acc[i.rarity] = (acc[i.rarity] ?? 0) + 1;
      return acc;
    }, {});
    const recent = items
      .filter((i) => !i.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
    return { total, published, drafts, archived, byType, byRarity, recent };
  }

  // ── Items CRUD ────────────────────────────────────────────────────────────

  async listItems(userId: number, limit: number, offset: number, search?: string) {
    return this.repo.listItems(userId, limit, offset, search);
  }

  async getItem(id: number) {
    const item = await this.repo.getItemById(id);
    if (!item) throw new Error(`Item ${id} not found`);
    return item;
  }

  async createItem(userId: number, data: Partial<InsertItem>) {
    const item = await this.repo.createItem({
      ...data,
      name: data.name ?? "New Item",
      createdBy: userId,
      version: 1,
    } as InsertItem);
    await this.repo.appendHistory({ itemId: item.id, actionType: "created", performedBy: userId });
    return item;
  }

  async updateItem(id: number, userId: number, data: Partial<InsertItem>) {
    const existing = await this.getItem(id);
    const updated = await this.repo.updateItem(id, data);
    await this.repo.saveVersion({
      itemId: id,
      version: existing.version + 1,
      snapshot: existing as unknown as Record<string, unknown>,
      changelog: `Updated by user ${userId}`,
      createdBy: userId,
    });
    await this.repo.appendHistory({ itemId: id, actionType: "updated", performedBy: userId });
    return updated;
  }

  async deleteItem(id: number, userId: number) {
    await this.getItem(id);
    await this.repo.deleteItem(id);
    await this.repo.appendHistory({ itemId: id, actionType: "deleted", performedBy: userId });
  }

  async duplicateItem(id: number, userId: number) {
    const existing = await this.getItem(id);
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = existing;
    const copy = await this.repo.createItem({
      ...rest,
      name: `${existing.name} (Copy)`,
      createdBy: userId,
      isPublished: false,
      isArchived: false,
      version: 1,
    } as InsertItem);
    const [stats, attributes, effects, slots] = await Promise.all([
      this.repo.listStats(id),
      this.repo.listAttributes(id),
      this.repo.listEffects(id),
      this.repo.listEquipmentSlots(id),
    ]);
    await Promise.all([
      ...stats.map(({ id: _, itemId: __, ...s }) => this.repo.upsertStat(copy.id, s)),
      ...attributes.map(({ id: _, itemId: __, ...a }) => this.repo.upsertAttribute(copy.id, a)),
      ...effects.map(({ id: _, itemId: __, ...e }) => this.repo.createEffect(copy.id, e)),
      ...slots.map(({ id: _, itemId: __, ...sl }) => this.repo.createEquipmentSlot(copy.id, sl)),
    ]);
    return copy;
  }

  async publishItem(id: number, userId: number) {
    const result = await this.repo.publishItem(id);
    await this.repo.appendHistory({ itemId: id, actionType: "published", performedBy: userId });
    return result;
  }

  async archiveItem(id: number, userId: number) {
    const result = await this.repo.archiveItem(id);
    await this.repo.appendHistory({ itemId: id, actionType: "archived", performedBy: userId });
    return result;
  }

  async restoreItem(id: number, userId: number) {
    const result = await this.repo.restoreItem(id);
    await this.repo.appendHistory({ itemId: id, actionType: "restored", performedBy: userId });
    return result;
  }

  // ── Sub-resources (delegate to repo) ─────────────────────────────────────

  getStats = (id: number) => this.repo.listStats(id);
  upsertStat = (id: number, data: Parameters<typeof this.repo.upsertStat>[1]) => this.repo.upsertStat(id, data);
  deleteStat = (statId: number) => this.repo.deleteStat(statId);

  getAttributes = (id: number) => this.repo.listAttributes(id);
  upsertAttribute = (id: number, data: Parameters<typeof this.repo.upsertAttribute>[1]) => this.repo.upsertAttribute(id, data);
  deleteAttribute = (attrId: number) => this.repo.deleteAttribute(attrId);

  getEffects = (id: number) => this.repo.listEffects(id);
  createEffect = (id: number, data: Parameters<typeof this.repo.createEffect>[1]) => this.repo.createEffect(id, data);
  updateEffect = (effectId: number, data: Parameters<typeof this.repo.updateEffect>[1]) => this.repo.updateEffect(effectId, data);
  deleteEffect = (effectId: number) => this.repo.deleteEffect(effectId);

  getEquipmentSlots = (id: number) => this.repo.listEquipmentSlots(id);
  createEquipmentSlot = (id: number, data: Parameters<typeof this.repo.createEquipmentSlot>[1]) => this.repo.createEquipmentSlot(id, data);
  deleteEquipmentSlot = (slotId: number) => this.repo.deleteEquipmentSlot(slotId);

  getRecipes = (id: number) => this.repo.listRecipes(id);
  createRecipe = (data: Parameters<typeof this.repo.createRecipe>[0]) => this.repo.createRecipe(data);
  updateRecipe = (recipeId: number, data: Parameters<typeof this.repo.updateRecipe>[1]) => this.repo.updateRecipe(recipeId, data);
  deleteRecipe = (recipeId: number) => this.repo.deleteRecipe(recipeId);
  getComponents = (recipeId: number) => this.repo.listComponents(recipeId);
  createComponent = (data: Parameters<typeof this.repo.createComponent>[0]) => this.repo.createComponent(data);
  deleteComponent = (componentId: number) => this.repo.deleteComponent(componentId);

  getLootTables = (userId: number, limit: number, offset: number) => this.repo.listLootTables(userId, limit, offset);
  getLootTable = (id: number) => this.repo.getLootTableById(id);
  createLootTable = (data: Parameters<typeof this.repo.createLootTable>[0]) => this.repo.createLootTable(data);
  updateLootTable = (id: number, data: Parameters<typeof this.repo.updateLootTable>[1]) => this.repo.updateLootTable(id, data);
  deleteLootTable = (id: number) => this.repo.deleteLootTable(id);
  getDrops = (lootTableId: number) => this.repo.listDrops(lootTableId);
  createDrop = (data: Parameters<typeof this.repo.createDrop>[0]) => this.repo.createDrop(data);
  updateDrop = (dropId: number, data: Parameters<typeof this.repo.updateDrop>[1]) => this.repo.updateDrop(dropId, data);
  deleteDrop = (dropId: number) => this.repo.deleteDrop(dropId);

  getInventories = (userId: number) => this.repo.listInventories(userId);
  createInventory = (data: Parameters<typeof this.repo.createInventory>[0]) => this.repo.createInventory(data);
  updateInventory = (id: number, data: Parameters<typeof this.repo.updateInventory>[1]) => this.repo.updateInventory(id, data);

  listTemplates = (limit: number, offset: number) => this.repo.listTemplates(limit, offset);
  createTemplate = (sourceItemId: number, userId: number, name: string) =>
    this.exporter.exportAsTemplate(sourceItemId, userId, name);

  getVersions = (id: number) => this.repo.listVersions(id);
  getHistory = (id: number, limit: number, offset: number) => this.repo.listHistory(id, limit, offset);

  getPricing = (id: number) => this.repo.listPricing(id);
  upsertPricing = (id: number, data: Parameters<typeof this.repo.upsertPricing>[1]) => this.repo.upsertPricing(id, data);
  deletePricing = (pricingId: number) => this.repo.deletePricing(pricingId);

  getTradeRules = (id: number) => this.repo.listTradeRules(id);
  createTradeRule = (data: Parameters<typeof this.repo.createTradeRule>[0]) => this.repo.createTradeRule(data);
  deleteTradeRule = (ruleId: number) => this.repo.deleteTradeRule(ruleId);

  getUsageRules = (id: number) => this.repo.listUsageRules(id);
  createUsageRule = (data: Parameters<typeof this.repo.createUsageRule>[0]) => this.repo.createUsageRule(data);
  deleteUsageRule = (ruleId: number) => this.repo.deleteUsageRule(ruleId);

  getRestrictions = (id: number) => this.repo.listRestrictions(id);
  createRestriction = (data: Parameters<typeof this.repo.createRestriction>[0]) => this.repo.createRestriction(data);
  deleteRestriction = (restrictionId: number) => this.repo.deleteRestriction(restrictionId);

  getVisuals = (id: number) => this.repo.listVisuals(id);
  createVisual = (data: Parameters<typeof this.repo.createVisual>[0]) => this.repo.createVisual(data);
  updateVisual = (visualId: number, data: Parameters<typeof this.repo.updateVisual>[1]) => this.repo.updateVisual(visualId, data);
  deleteVisual = (visualId: number) => this.repo.deleteVisual(visualId);

  getExports = (id: number) => this.repo.listExports(id);
}
