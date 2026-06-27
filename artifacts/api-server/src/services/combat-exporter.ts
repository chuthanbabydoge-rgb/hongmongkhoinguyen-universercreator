import crypto from "crypto";
import { DrizzleCombatRepository } from "../repositories/combat-repository";

export class CombatExporter {
  constructor(private repo: DrizzleCombatRepository) {}

  async exportToJson(combatId: number, userId: number): Promise<string> {
    const combat = await this.repo.getCombat(combatId);
    if (!combat) throw new Error("Combat not found");

    const [rules, formulas, modifiers, defense, resistances, hits, crits, blocks, dodges, parries, combos, status, threat, respawn, zones, filters] = await Promise.all([
      this.repo.getRules(combatId),
      this.repo.getDamageFormulas(combatId),
      this.repo.getDamageModifiers(combatId),
      this.repo.getDefenseRules(combatId),
      this.repo.getResistances(combatId),
      this.repo.getHitRules(combatId),
      this.repo.getCriticalRules(combatId),
      this.repo.getBlockRules(combatId),
      this.repo.getDodgeRules(combatId),
      this.repo.getParryRules(combatId),
      this.repo.getComboRules(combatId),
      this.repo.getStatusEffects(combatId),
      this.repo.getThreatRules(combatId),
      this.repo.getRespawnRules(combatId),
      this.repo.getCombatZones(combatId),
      this.repo.getTargetFilters(combatId),
    ]);

    const statusWithStacks = await Promise.all(
      status.map(async s => ({ ...s, stacks: await this.repo.getStatusStacks(s.id) }))
    );

    const payload = {
      format: "combat",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      combat,
      rules,
      formulas,
      modifiers,
      defense,
      resistances,
      hits,
      crits,
      blocks,
      dodges,
      parries,
      combos,
      status: statusWithStacks,
      threat,
      respawn,
      zones,
      filters,
    };

    const json = JSON.stringify(payload, null, 2);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    return JSON.stringify({ ...payload, checksum }, null, 2);
  }

  async exportAsTemplate(combatId: number, userId: number, templateName: string): Promise<string> {
    const json = await this.exportToJson(combatId, userId);
    const parsed = JSON.parse(json);
    return JSON.stringify({ ...parsed, format: "combat_template", templateName }, null, 2);
  }

  async exportAsPackage(combatId: number, userId: number): Promise<string> {
    const json = await this.exportToJson(combatId, userId);
    const parsed = JSON.parse(json);
    return JSON.stringify({ ...parsed, format: "combat_package", packagedAt: new Date().toISOString() }, null, 2);
  }
}
