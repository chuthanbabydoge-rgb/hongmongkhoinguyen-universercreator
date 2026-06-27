import crypto from "crypto";
import type { DrizzleItemEditorRepository } from "../repositories/item-editor-repository";

export class ItemExporter {
  constructor(private repo: DrizzleItemEditorRepository) {}

  async exportToJson(itemId: number, exportedBy: number): Promise<string> {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    const [stats, attributes, effects, slots, recipes, pricing, restrictions, visuals] = await Promise.all([
      this.repo.listStats(itemId),
      this.repo.listAttributes(itemId),
      this.repo.listEffects(itemId),
      this.repo.listEquipmentSlots(itemId),
      this.repo.listRecipes(itemId),
      this.repo.listPricing(itemId),
      this.repo.listRestrictions(itemId),
      this.repo.listVisuals(itemId),
    ]);

    const recipesWithComponents = await Promise.all(
      recipes.map(async (r) => ({ ...r, components: await this.repo.listComponents(r.id) }))
    );

    const payload = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      item, stats, attributes, effects, slots,
      recipes: recipesWithComponents, pricing, restrictions, visuals,
    });

    const checksum = crypto.createHash("sha256").update(payload).digest("hex");
    await this.repo.saveExport({ itemId, exportedBy, format: "json", payload, checksum });
    return payload;
  }

  async exportAsTemplate(itemId: number, exportedBy: number, templateName: string): Promise<Record<string, unknown>> {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    const [stats, effects] = await Promise.all([
      this.repo.listStats(itemId),
      this.repo.listEffects(itemId),
    ]);

    const snapshot = { item, stats, effects };
    const template = await this.repo.createTemplate({
      sourceItemId: itemId,
      createdBy: exportedBy,
      templateName,
      category: item.itemType,
      tags: item.tags ?? [],
      isPublic: false,
      snapshot,
    });

    return template as unknown as Record<string, unknown>;
  }
}
