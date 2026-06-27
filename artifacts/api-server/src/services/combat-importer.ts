import { DrizzleCombatRepository } from "../repositories/combat-repository";
import type { InsertCombat } from "@workspace/db/schema";

export class CombatImporter {
  constructor(private repo: DrizzleCombatRepository) {}

  async importFromJson(userId: number, jsonStr: string, opts?: { projectId?: number; nameOverride?: string }): Promise<{ combat: unknown; imported: Record<string, number> }> {
    const data = JSON.parse(jsonStr);
    const src = data.combat ?? data;

    const combatData: InsertCombat = {
      createdBy: userId,
      projectId: opts?.projectId ?? src.projectId ?? null,
      name: opts?.nameOverride ?? `${src.name ?? "Imported Combat"} (copy)`,
      slug: src.slug,
      description: src.description,
      combatMode: src.combatMode ?? "real_time",
      turnDuration: src.turnDuration ?? 30,
      maxRounds: src.maxRounds ?? 0,
      maxParticipants: src.maxParticipants ?? 10,
      allowFriendlyFire: src.allowFriendlyFire ?? false,
      allowFlee: src.allowFlee ?? true,
      fleeChance: src.fleeChance ?? 0.5,
      allowRespawn: src.allowRespawn ?? true,
      respawnDelay: src.respawnDelay ?? 5,
      deathPenalty: src.deathPenalty ?? "none",
      aggroRadius: src.aggroRadius ?? 10,
      tags: src.tags ?? null,
      metadata: src.metadata ?? null,
      isTemplate: false,
      isPublished: false,
      isArchived: false,
      version: 1,
      graphRef: src.graphRef ?? null,
    };

    const combat = await this.repo.createCombat(combatData);
    const id = combat.id;
    const imported: Record<string, number> = { combatId: id };

    const imports = [
      { key: "rules", items: data.rules ?? [], fn: (item: Record<string, unknown>) => this.repo.createRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createRule>[0]) },
      { key: "formulas", items: data.formulas ?? [], fn: (item: Record<string, unknown>) => this.repo.createDamageFormula({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createDamageFormula>[0]) },
      { key: "modifiers", items: data.modifiers ?? [], fn: (item: Record<string, unknown>) => this.repo.createDamageModifier({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createDamageModifier>[0]) },
      { key: "defense", items: data.defense ?? [], fn: (item: Record<string, unknown>) => this.repo.createDefenseRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createDefenseRule>[0]) },
      { key: "resistances", items: data.resistances ?? [], fn: (item: Record<string, unknown>) => this.repo.createResistance({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createResistance>[0]) },
      { key: "hits", items: data.hits ?? [], fn: (item: Record<string, unknown>) => this.repo.createHitRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createHitRule>[0]) },
      { key: "crits", items: data.crits ?? [], fn: (item: Record<string, unknown>) => this.repo.createCriticalRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createCriticalRule>[0]) },
      { key: "blocks", items: data.blocks ?? [], fn: (item: Record<string, unknown>) => this.repo.createBlockRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createBlockRule>[0]) },
      { key: "dodges", items: data.dodges ?? [], fn: (item: Record<string, unknown>) => this.repo.createDodgeRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createDodgeRule>[0]) },
      { key: "parries", items: data.parries ?? [], fn: (item: Record<string, unknown>) => this.repo.createParryRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createParryRule>[0]) },
      { key: "combos", items: data.combos ?? [], fn: (item: Record<string, unknown>) => this.repo.createComboRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createComboRule>[0]) },
      { key: "threat", items: data.threat ?? [], fn: (item: Record<string, unknown>) => this.repo.createThreatRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createThreatRule>[0]) },
      { key: "respawn", items: data.respawn ?? [], fn: (item: Record<string, unknown>) => this.repo.createRespawnRule({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createRespawnRule>[0]) },
      { key: "zones", items: data.zones ?? [], fn: (item: Record<string, unknown>) => this.repo.createCombatZone({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createCombatZone>[0]) },
      { key: "filters", items: data.filters ?? [], fn: (item: Record<string, unknown>) => this.repo.createTargetFilter({ ...item, combatId: id, id: undefined } as Parameters<typeof this.repo.createTargetFilter>[0]) },
    ];

    for (const { key, items, fn } of imports) {
      let count = 0;
      for (const item of items) {
        await fn(item);
        count++;
      }
      imported[key] = count;
    }

    const statusItems: Array<{ stacks?: unknown[]; [k: string]: unknown }> = data.status ?? [];
    let statusCount = 0;
    for (const item of statusItems) {
      const { stacks, ...rest } = item;
      const s = await this.repo.createStatusEffect({ ...rest, combatId: id, id: undefined } as Parameters<typeof this.repo.createStatusEffect>[0]);
      for (const stack of (stacks ?? []) as Array<Record<string, unknown>>) {
        await this.repo.upsertStatusStack({ ...stack, statusEffectId: s.id, id: undefined } as Parameters<typeof this.repo.upsertStatusStack>[0]);
      }
      statusCount++;
    }
    imported["status"] = statusCount;

    return { combat, imported };
  }

  async importFromTemplate(userId: number, templateJson: string, opts?: { name?: string; projectId?: number }): Promise<{ combat: unknown; imported: Record<string, number> }> {
    return this.importFromJson(userId, templateJson, { nameOverride: opts?.name, projectId: opts?.projectId });
  }
}
