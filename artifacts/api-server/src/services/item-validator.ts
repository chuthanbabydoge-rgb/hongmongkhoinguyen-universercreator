import type { DrizzleItemEditorRepository } from "../repositories/item-editor-repository";

export interface ItemValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ItemValidator {
  constructor(private repo: DrizzleItemEditorRepository) {}

  async validate(itemId: number): Promise<ItemValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const item = await this.repo.getItemById(itemId);
    if (!item) { return { valid: false, errors: ["Item not found"], warnings: [] }; }

    const stats = await this.repo.listStats(itemId);
    const effects = await this.repo.listEffects(itemId);
    const recipes = await this.repo.listRecipes(itemId);

    // ── Errors ─────────────────────────────────────────────────────────────

    if (!item.name?.trim()) errors.push("Item must have a name.");
    if (item.level < 1) errors.push("Item level must be at least 1.");
    if (item.requiredLevel > item.level) errors.push("Required level cannot exceed item level.");
    if (item.maxStack < 1) errors.push("Max stack must be at least 1.");
    if (item.stackType === "non_stackable" && item.maxStack > 1)
      errors.push("Non-stackable items must have max stack of 1.");
    if (item.stackType === "limited_stack" && item.maxStack < 2)
      errors.push("Limited stack items must have max stack ≥ 2.");
    if (item.baseValue < 0) errors.push("Base value cannot be negative.");
    if (item.sellValue < 0) errors.push("Sell value cannot be negative.");

    // Invalid rarity for item type
    if (item.itemType === "currency" && item.rarity !== "common")
      errors.push("Currency items should be common rarity.");

    // Broken crafting recipe – check component items exist
    for (const recipe of recipes) {
      const components = await this.repo.listComponents(recipe.id);
      if (!components.length)
        errors.push(`Crafting recipe "${recipe.recipeName}" has no components.`);

      for (const comp of components) {
        if (comp.componentItemId === itemId)
          errors.push(`Circular dependency: item is a component of its own recipe "${recipe.recipeName}".`);
        if (comp.canSubstitute && comp.substituteItemId === itemId)
          errors.push(`Circular dependency: item is a substitute in recipe "${recipe.recipeName}".`);
      }
    }

    // Effects missing magnitude or type
    for (const effect of effects) {
      if (!effect.effectType?.trim())
        errors.push(`Effect "${effect.effectName}" is missing a type.`);
      if (effect.chance < 0 || effect.chance > 1)
        errors.push(`Effect "${effect.effectName}" chance must be between 0 and 1.`);
    }

    // Missing asset reference for non-material items
    if (!["material", "currency"].includes(item.itemType) && !item.iconAssetId && !item.thumbnailUrl)
      errors.push("Weapon/Armor/Consumable items must have an icon asset or thumbnail.");

    // ── Warnings ───────────────────────────────────────────────────────────

    if (!item.description?.trim()) warnings.push("No description — players won't know what this item does.");
    if (!stats.length) warnings.push("No stats defined — item has no gameplay effect.");
    if (item.itemType === "weapon" && !effects.length)
      warnings.push("Weapon has no effects — consider adding on-hit effects.");
    if (!item.flavorText?.trim()) warnings.push("No flavor text — adds world richness.");
    if (item.weight <= 0 && item.itemType !== "currency")
      warnings.push("Item has no weight — consider setting an encumbrance value.");

    return { valid: errors.length === 0, errors, warnings };
  }
}
