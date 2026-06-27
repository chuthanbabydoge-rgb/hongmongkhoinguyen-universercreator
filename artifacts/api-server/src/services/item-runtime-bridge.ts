import type { DrizzleItemEditorRepository } from "../repositories/item-editor-repository";

interface SimulationContext {
  playerLevel?: number;
  playerStats?: Record<string, number>;
  targetStats?: Record<string, number>;
  inventoryItems?: number[];
}

export class ItemRuntimeBridge {
  constructor(private repo: DrizzleItemEditorRepository) {}

  async simulateItemUsage(itemId: number, ctx: SimulationContext = {}) {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    const [stats, effects] = await Promise.all([
      this.repo.listStats(itemId),
      this.repo.listEffects(itemId),
    ]);

    const appliedEffects = effects.map((e) => ({
      effectName: e.effectName,
      effectType: e.effectType,
      magnitude: e.magnitude * (ctx.playerStats?.["power"] ?? 1),
      roll: Math.random() <= e.chance,
      duration: e.duration,
      target: e.targetType,
    }));

    return {
      item: { id: item.id, name: item.name, itemType: item.itemType, rarity: item.rarity },
      stats: stats.map((s) => ({ name: s.statName, value: s.baseValue * (s.scaling ?? 1) })),
      appliedEffects: appliedEffects.filter((e) => e.roll),
      skippedEffects: appliedEffects.filter((e) => !e.roll),
      simulatedAt: new Date().toISOString(),
    };
  }

  async previewCombatEffect(itemId: number, ctx: SimulationContext = {}) {
    const item = await this.repo.getItemById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    const [stats, effects] = await Promise.all([
      this.repo.listStats(itemId),
      this.repo.listEffects(itemId),
    ]);

    const attackPower = stats.find((s) => s.statName === "attack")?.baseValue ?? 0;
    const critChance = stats.find((s) => s.statName === "crit_chance")?.baseValue ?? 0.05;
    const isCrit = Math.random() < critChance;
    const rawDamage = attackPower * (isCrit ? 2 : 1);
    const defenseReduction = ctx.targetStats?.["defense"] ?? 0;
    const finalDamage = Math.max(0, rawDamage - defenseReduction);

    return {
      weapon: item.name,
      attackPower,
      critChance,
      isCrit,
      rawDamage,
      finalDamage,
      onHitEffects: effects.filter((e) => e.trigger === "on_hit").map((e) => e.effectName),
      simulatedAt: new Date().toISOString(),
    };
  }

  async testCraftingResult(itemId: number, playerLevel: number = 1) {
    const recipes = await this.repo.listRecipes(itemId);
    if (!recipes.length) return { canCraft: false, reason: "No crafting recipe defined." };

    const recipe = recipes[0]!;
    const components = await this.repo.listComponents(recipe.id);

    const meetsLevel = playerLevel >= recipe.requiredLevel;
    const canCraft = meetsLevel && components.length > 0;

    return {
      canCraft,
      recipe: recipe.recipeName,
      craftingTime: recipe.craftingTime,
      outputQuantity: recipe.outputQuantity,
      experienceGained: recipe.experienceGained,
      requiredLevel: recipe.requiredLevel,
      components: components.map((c) => ({
        componentItemId: c.componentItemId,
        quantity: c.quantity,
        isOptional: c.isOptional,
      })),
      reason: !meetsLevel ? `Requires level ${recipe.requiredLevel}` : undefined,
      simulatedAt: new Date().toISOString(),
    };
  }

  async simulateInventory(inventoryId: number, items: Array<{ itemId: number; quantity: number }>) {
    const inventories = await this.repo.listInventories(0);
    const inv = inventories.find((i) => i.id === inventoryId);
    if (!inv) throw new Error(`Inventory ${inventoryId} not found`);

    let totalWeight = 0;
    let totalSlots = 0;
    const resolvedItems = await Promise.all(
      items.map(async ({ itemId, quantity }) => {
        const item = await this.repo.getItemById(itemId);
        if (!item) return null;
        const stacksNeeded = item.stackType === "non_stackable" ? quantity
          : Math.ceil(quantity / item.maxStack);
        totalWeight += (item.weight ?? 0) * quantity;
        totalSlots += stacksNeeded;
        return { itemId, name: item.name, quantity, stacksNeeded };
      })
    );

    return {
      inventoryName: inv.inventoryName,
      maxSlots: inv.maxSlots,
      maxWeight: inv.maxWeight,
      usedSlots: totalSlots,
      usedWeight: totalWeight,
      overSlots: totalSlots > inv.maxSlots,
      overWeight: totalWeight > inv.maxWeight,
      items: resolvedItems.filter(Boolean),
      simulatedAt: new Date().toISOString(),
    };
  }
}
