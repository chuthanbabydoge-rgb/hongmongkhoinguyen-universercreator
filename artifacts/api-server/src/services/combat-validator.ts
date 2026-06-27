import { DrizzleCombatRepository } from "../repositories/combat-repository";

export interface ValidationIssue { code: string; message: string; }
export interface ValidationResult { valid: boolean; errors: ValidationIssue[]; warnings: ValidationIssue[]; }

export class CombatValidator {
  constructor(private repo: DrizzleCombatRepository) {}

  async validate(combatId: number): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const combat = await this.repo.getCombat(combatId);
    if (!combat) return { valid: false, errors: [{ code: "COMBAT_NOT_FOUND", message: "Combat not found" }], warnings: [] };

    const [formulas, defenseRules, respawnRules, statusEffects, comboRules, hitRules, critRules] = await Promise.all([
      this.repo.getDamageFormulas(combatId),
      this.repo.getDefenseRules(combatId),
      this.repo.getRespawnRules(combatId),
      this.repo.getStatusEffects(combatId),
      this.repo.getComboRules(combatId),
      this.repo.getHitRules(combatId),
      this.repo.getCriticalRules(combatId),
    ]);

    // ─── Errors ───────────────────────────────────────────────────────────────

    if (formulas.length === 0) {
      errors.push({ code: "MISSING_DAMAGE_FORMULA", message: "Combat has no damage formula configured" });
    }
    for (const f of formulas) {
      if (f.baseValue < 0) errors.push({ code: "NEGATIVE_DAMAGE", message: `Damage formula "${f.formulaName}" has negative base value` });
      if (f.randomMin > f.randomMax) errors.push({ code: "INVALID_RANDOM_RANGE", message: `Damage formula "${f.formulaName}" has randomMin > randomMax` });
    }

    for (const d of defenseRules) {
      if (d.armorValue < 0) errors.push({ code: "INVALID_DEFENSE", message: `Defense rule "${d.ruleName}" has negative armor value` });
      if (d.maxReductionPct > 1) errors.push({ code: "INVALID_MAX_REDUCTION", message: `Defense rule "${d.ruleName}" max reduction exceeds 100%` });
    }

    if (combat.allowRespawn && respawnRules.length === 0) {
      errors.push({ code: "MISSING_RESPAWN_RULE", message: "Respawn is enabled but no respawn rule is configured" });
    }

    for (const s of statusEffects) {
      if (s.duration < 0) errors.push({ code: "NEGATIVE_STATUS_DURATION", message: `Status effect "${s.effectName}" has negative duration` });
      if (s.tickInterval < 0) errors.push({ code: "NEGATIVE_TICK_INTERVAL", message: `Status effect "${s.effectName}" has negative tick interval` });
      if (s.isStackable && s.maxStacks < 1) errors.push({ code: "INVALID_MAX_STACKS", message: `Status effect "${s.effectName}" maxStacks must be at least 1` });
    }

    const statusNames = statusEffects.map(s => s.effectName);
    const uniqueNames = new Set(statusNames);
    if (statusNames.length !== uniqueNames.size) {
      errors.push({ code: "DUPLICATE_STATUS_EFFECT", message: "Duplicate status effect names detected" });
    }

    // detect infinite combo loops (combo referencing itself as parent)
    for (const c of comboRules) {
      if (c.parentComboId === c.id) {
        errors.push({ code: "INFINITE_COMBO_LOOP", message: `Combo rule "${c.comboName}" references itself as parent — infinite loop detected` });
      }
    }

    for (const h of hitRules) {
      if (h.minHitChance < 0 || h.minHitChance > 1) errors.push({ code: "INVALID_HIT_CHANCE", message: `Hit rule "${h.ruleName}" minHitChance must be between 0 and 1` });
      if (h.maxHitChance < 0 || h.maxHitChance > 1) errors.push({ code: "INVALID_HIT_CHANCE", message: `Hit rule "${h.ruleName}" maxHitChance must be between 0 and 1` });
    }

    for (const c of critRules) {
      if (c.baseCritChance < 0 || c.baseCritChance > 1) errors.push({ code: "INVALID_CRIT_CHANCE", message: `Crit rule "${c.ruleName}" baseCritChance must be between 0 and 1` });
      if (c.baseCritMultiplier < 1) errors.push({ code: "INVALID_CRIT_MULT", message: `Crit rule "${c.ruleName}" baseCritMultiplier must be >= 1` });
    }

    if (combat.aggroRadius < 0) errors.push({ code: "INVALID_AGGRO_RADIUS", message: "Aggro radius cannot be negative" });

    // ─── Warnings ─────────────────────────────────────────────────────────────

    const [modifiers, zones, targetFilters] = await Promise.all([
      this.repo.getDamageModifiers(combatId),
      this.repo.getCombatZones(combatId),
      this.repo.getTargetFilters(combatId),
    ]);

    const unusedModifiers = modifiers.filter(m => !m.isActive);
    if (unusedModifiers.length > 0) {
      warnings.push({ code: "UNUSED_MODIFIERS", message: `${unusedModifiers.length} damage modifier(s) are inactive/unused` });
    }

    const unusedStatus = statusEffects.filter(s => !s.isActive);
    if (unusedStatus.length > 0) {
      warnings.push({ code: "UNUSED_STATUS_EFFECTS", message: `${unusedStatus.length} status effect(s) are inactive/unused` });
    }

    const inactiveCombo = comboRules.filter(c => !c.isActive);
    if (inactiveCombo.length > 0) {
      warnings.push({ code: "UNREACHABLE_COMBO", message: `${inactiveCombo.length} combo rule(s) are inactive and unreachable` });
    }

    if (zones.length === 0) warnings.push({ code: "NO_COMBAT_ZONE", message: "No combat zone configured" });
    if (targetFilters.length === 0) warnings.push({ code: "NO_TARGET_FILTER", message: "No target filter configured" });
    if (!combat.description) warnings.push({ code: "NO_DESCRIPTION", message: "Combat has no description" });

    return { valid: errors.length === 0, errors, warnings };
  }
}
