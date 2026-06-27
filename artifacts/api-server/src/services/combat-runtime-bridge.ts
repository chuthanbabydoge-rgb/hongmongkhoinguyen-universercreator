import { DrizzleCombatRepository } from "../repositories/combat-repository";

export interface CombatSimContext {
  attackerStats?: Record<string, number>;
  defenderStats?: Record<string, number>;
  attackerLevel?: number;
  defenderLevel?: number;
  weaponDamage?: number;
}

export interface CombatSimResult {
  combatId: number;
  success: boolean;
  timeline: Array<{ t: number; event: string; value?: number; detail?: string }>;
}

export class CombatRuntimeBridge {
  constructor(private repo: DrizzleCombatRepository) {}

  private clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)); }

  async simulateAttack(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { damage: number; isCrit: boolean; isMiss: boolean }> {
    const combat = await this.repo.getCombat(combatId);
    if (!combat) throw new Error("Combat not found");
    const [formulas, hitRules, critRules, modifiers] = await Promise.all([
      this.repo.getDamageFormulas(combatId),
      this.repo.getHitRules(combatId),
      this.repo.getCriticalRules(combatId),
      this.repo.getDamageModifiers(combatId),
    ]);
    const formula = formulas.find(f => f.isDefault) ?? formulas[0];
    const hitRule = hitRules.find(h => h.isDefault) ?? hitRules[0];
    const critRule = critRules.find(c => c.isDefault) ?? critRules[0];

    const atk = ctx.attackerStats?.["attack"] ?? 10;
    const def = ctx.defenderStats?.["defense"] ?? 5;
    const wpn = ctx.weaponDamage ?? 0;

    const baseHit = hitRule ? this.clamp(hitRule.baseHitChance + (atk * hitRule.accuracyScaling) - (def * hitRule.evasionScaling), hitRule.minHitChance, hitRule.maxHitChance) : 0.9;
    const isMiss = Math.random() > baseHit;

    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: "attack_start" }];
    if (isMiss) { timeline.push({ t: 0.1, event: "miss" }); return { combatId, success: true, timeline, damage: 0, isCrit: false, isMiss: true }; }

    const baseDmg = formula ? (formula.baseValue + atk * formula.attackScaling - def * formula.defenseScaling + wpn) * (formula.randomMin + Math.random() * (formula.randomMax - formula.randomMin)) : wpn || 10;
    const modMult = modifiers.filter(m => m.isActive).reduce((acc, m) => acc * (m.isPercentage ? 1 + m.modifierValue / 100 : m.modifierValue), 1);

    const critChance = critRule ? this.clamp(critRule.baseCritChance + (atk * critRule.critChanceScaling), 0, critRule.maxCritChance) : 0.05;
    const isCrit = Math.random() <= critChance;
    const critMult = isCrit ? (critRule?.baseCritMultiplier ?? 1.5) : 1;
    const damage = Math.max(0, baseDmg * modMult * critMult);

    timeline.push({ t: 0.1, event: isCrit ? "critical_hit" : "hit", value: damage });
    return { combatId, success: true, timeline, damage, isCrit, isMiss: false };
  }

  async simulateDefense(combatId: number, ctx: CombatSimContext & { incomingDamage: number }): Promise<CombatSimResult & { mitigated: number; finalDamage: number }> {
    const combat = await this.repo.getCombat(combatId);
    if (!combat) throw new Error("Combat not found");
    const defRules = await this.repo.getDefenseRules(combatId);
    const defRule = defRules.find(d => d.isDefault) ?? defRules[0];
    const armor = defRule?.armorValue ?? 0;
    const reduction = defRule ? Math.min(defRule.maxReductionPct, armor * defRule.defenseScaling) : 0;
    const mitigated = (ctx.incomingDamage ?? 0) * reduction + (defRule?.flatReduction ?? 0);
    const finalDamage = Math.max(0, (ctx.incomingDamage ?? 0) - mitigated);
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: "defense_check" }, { t: 0.05, event: "damage_mitigated", value: mitigated }, { t: 0.1, event: "damage_applied", value: finalDamage }];
    return { combatId, success: true, timeline, mitigated, finalDamage };
  }

  async simulateCrit(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { isCrit: boolean; multiplier: number }> {
    const critRules = await this.repo.getCriticalRules(combatId);
    const rule = critRules.find(c => c.isDefault) ?? critRules[0];
    const atk = ctx.attackerStats?.["crit_chance"] ?? ctx.attackerStats?.["attack"] ?? 0;
    const chance = rule ? this.clamp(rule.baseCritChance + atk * rule.critChanceScaling, 0, rule.maxCritChance) : 0.05;
    const isCrit = Math.random() <= chance;
    const multiplier = isCrit ? (rule?.baseCritMultiplier ?? 1.5) : 1;
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: isCrit ? "critical_success" : "no_crit", value: multiplier }];
    return { combatId, success: true, timeline, isCrit, multiplier };
  }

  async simulateDodge(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { dodged: boolean; chance: number }> {
    const dodgeRules = await this.repo.getDodgeRules(combatId);
    const rule = dodgeRules.find(d => d.isDefault) ?? dodgeRules[0];
    const agi = ctx.defenderStats?.["agility"] ?? 0;
    const chance = rule ? this.clamp(rule.baseDodgeChance + agi * rule.agilityScaling, 0, rule.maxDodgeChance) : 0.05;
    const dodged = Math.random() <= chance;
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: dodged ? "dodge_success" : "dodge_fail", value: chance }];
    return { combatId, success: true, timeline, dodged, chance };
  }

  async simulateBlock(combatId: number, ctx: CombatSimContext & { incomingDamage?: number }): Promise<CombatSimResult & { blocked: boolean; reduction: number }> {
    const blockRules = await this.repo.getBlockRules(combatId);
    const rule = blockRules.find(b => b.isDefault) ?? blockRules[0];
    const blocked = rule ? Math.random() <= rule.baseBlockChance : false;
    const reduction = blocked ? (ctx.incomingDamage ?? 0) * (rule?.blockDamageReduction ?? 0.5) : 0;
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: blocked ? "block_success" : "block_fail", value: reduction }];
    return { combatId, success: true, timeline, blocked, reduction };
  }

  async simulateParry(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { parried: boolean; counterAttack: boolean }> {
    const parryRules = await this.repo.getParryRules(combatId);
    const rule = parryRules.find(p => p.isDefault) ?? parryRules[0];
    const parried = rule ? Math.random() <= rule.baseParryChance : false;
    const counterAttack = parried && rule ? Math.random() <= rule.counterAttackChance : false;
    const timeline: CombatSimResult["timeline"] = [
      { t: 0, event: parried ? "parry_success" : "parry_fail" },
      ...(counterAttack ? [{ t: 0.2, event: "counter_attack", value: rule?.counterDamageMultiplier ?? 1 }] : []),
    ];
    return { combatId, success: true, timeline, parried, counterAttack };
  }

  async simulateCombo(combatId: number, ctx: CombatSimContext & { hitCount?: number }): Promise<CombatSimResult & { comboTriggered: boolean; bonusDamage: number }> {
    const combos = await this.repo.getComboRules(combatId);
    const hit = ctx.hitCount ?? 1;
    const triggered = combos.filter(c => c.isActive && hit >= c.requiredHits);
    const best = triggered.sort((a, b) => b.bonusDamageMultiplier - a.bonusDamageMultiplier)[0];
    const bonusDamage = best ? (ctx.attackerStats?.["attack"] ?? 10) * (best.bonusDamageMultiplier - 1) : 0;
    const timeline: CombatSimResult["timeline"] = best
      ? [{ t: 0, event: "combo_triggered", detail: best.comboName, value: bonusDamage }]
      : [{ t: 0, event: "no_combo" }];
    return { combatId, success: true, timeline, comboTriggered: !!best, bonusDamage };
  }

  async simulateAggro(combatId: number, ctx: CombatSimContext & { damageDealt?: number; healing?: number }): Promise<CombatSimResult & { threat: number }> {
    const threatRules = await this.repo.getThreatRules(combatId);
    const rule = threatRules.find(t => t.isDefault) ?? threatRules[0];
    const damageThreat = (ctx.damageDealt ?? 0) * (rule?.baseThreatMultiplier ?? 1);
    const healThreat = (ctx.healing ?? 0) * (rule?.healingThreatMultiplier ?? 0.5);
    const threat = damageThreat + healThreat;
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: "aggro_calculated", value: threat }];
    return { combatId, success: true, timeline, threat };
  }

  async simulateStatus(combatId: number, ctx: CombatSimContext & { statusName?: string }): Promise<CombatSimResult & { applied: boolean; tickDamage: number; tickHeal: number }> {
    const statuses = await this.repo.getStatusEffects(combatId);
    const status = ctx.statusName ? statuses.find(s => s.effectName === ctx.statusName) : statuses[0];
    if (!status) return { combatId, success: false, timeline: [{ t: 0, event: "status_not_found" }], applied: false, tickDamage: 0, tickHeal: 0 };
    const ticks = Math.floor(status.duration / (status.tickInterval || 1));
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: "status_applied", detail: status.effectName }];
    for (let i = 1; i <= ticks; i++) {
      if (status.tickDamage > 0) timeline.push({ t: i * status.tickInterval, event: "tick_damage", value: status.tickDamage });
      if (status.tickHeal > 0) timeline.push({ t: i * status.tickInterval, event: "tick_heal", value: status.tickHeal });
    }
    timeline.push({ t: status.duration, event: "status_expired", detail: status.effectName });
    return { combatId, success: true, timeline, applied: true, tickDamage: status.tickDamage, tickHeal: status.tickHeal };
  }

  async simulateDeath(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { deadAt: number }> {
    const timeline: CombatSimResult["timeline"] = [{ t: 0, event: "death_triggered" }, { t: 0.1, event: "loot_rolled" }, { t: 0.5, event: "death_animation" }];
    return { combatId, success: true, timeline, deadAt: 0 };
  }

  async simulateRespawn(combatId: number, ctx: CombatSimContext): Promise<CombatSimResult & { respawnDelay: number; hpPercent: number }> {
    const respawnRules = await this.repo.getRespawnRules(combatId);
    const rule = respawnRules.find(r => r.isDefault) ?? respawnRules[0];
    const delay = rule?.respawnDelay ?? 5;
    const hp = rule?.hpOnRespawn ?? 1;
    const timeline: CombatSimResult["timeline"] = [
      { t: 0, event: "respawn_queued", value: delay },
      { t: delay, event: "respawn_triggered" },
      { t: delay + (rule?.invulnerabilityDuration ?? 3), event: "invulnerability_ended" },
    ];
    return { combatId, success: true, timeline, respawnDelay: delay, hpPercent: hp };
  }
}
