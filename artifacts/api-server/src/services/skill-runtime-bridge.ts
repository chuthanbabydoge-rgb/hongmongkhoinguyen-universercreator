import { DrizzleSkillRepository } from "../repositories/skill-repository";

export interface SimulationContext {
  casterLevel?: number;
  casterStats?: Record<string, number>;
  targetStats?: Record<string, number>;
  skillLevel?: number;
}

export interface SimulationResult {
  skillId: number;
  skillLevel: number;
  castSuccess: boolean;
  damage?: number;
  heal?: number;
  cooldownTriggered: number;
  resourceConsumed: number;
  buffsApplied: string[];
  debuffsApplied: string[];
  effectsTriggered: string[];
  timeline: Array<{ t: number; event: string; value?: number }>;
}

export class SkillRuntimeBridge {
  constructor(private repo: DrizzleSkillRepository) {}

  async simulateCast(skillId: number, ctx: SimulationContext): Promise<SimulationResult> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");

    const skillLevel = ctx.skillLevel ?? 1;
    const levels = await this.repo.getLevels(skillId);
    const lvlData = levels.find(l => l.level === skillLevel) ?? levels[0];
    const [costs, cooldowns, effects, buffs, debuffs] = await Promise.all([
      this.repo.getCosts(skillId),
      this.repo.getCooldowns(skillId),
      this.repo.getEffects(skillId),
      this.repo.getBuffs(skillId),
      this.repo.getDebuffs(skillId),
    ]);

    const timeline: SimulationResult["timeline"] = [];
    const multiplier = lvlData?.damageMultiplier ?? 1;
    const healMult = lvlData?.healMultiplier ?? 1;
    const damage = skill.baseDamage * multiplier;
    const heal = skill.baseHeal * healMult;
    const cd = cooldowns[0]?.duration ?? skill.baseCooldown;
    const cost = costs[0]?.amount ?? skill.baseResourceCost;

    timeline.push({ t: 0, event: "cast_start" });
    if (skill.baseCastTime > 0) timeline.push({ t: skill.baseCastTime, event: "cast_complete" });
    if (damage > 0) timeline.push({ t: skill.baseCastTime, event: "damage_applied", value: damage });
    if (heal > 0) timeline.push({ t: skill.baseCastTime, event: "heal_applied", value: heal });
    if (cd > 0) timeline.push({ t: skill.baseCastTime + 0.05, event: "cooldown_start", value: cd });

    const activeEffects = effects.filter(e => Math.random() <= e.chance);
    for (const eff of activeEffects) timeline.push({ t: skill.baseCastTime + 0.1, event: `effect_${eff.effectType}`, value: eff.magnitude });

    await this.repo.upsertStatistics(skillId, {
      timesSimulated: 1,
      avgDamageDealt: damage,
      avgHealDealt: heal,
      lastSimulatedAt: new Date(),
    });

    return {
      skillId,
      skillLevel,
      castSuccess: true,
      damage: damage > 0 ? damage : undefined,
      heal: heal > 0 ? heal : undefined,
      cooldownTriggered: cd,
      resourceConsumed: cost,
      buffsApplied: buffs.map(b => b.buffName),
      debuffsApplied: debuffs.map(d => d.debuffName),
      effectsTriggered: activeEffects.map(e => e.effectName),
      timeline,
    };
  }

  async simulateDamage(skillId: number, ctx: SimulationContext): Promise<{ raw: number; multiplied: number; type: string }> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");
    const levels = await this.repo.getLevels(skillId);
    const lvl = levels.find(l => l.level === (ctx.skillLevel ?? 1)) ?? levels[0];
    const mult = lvl?.damageMultiplier ?? 1;
    return { raw: skill.baseDamage, multiplied: skill.baseDamage * mult, type: skill.damageType };
  }

  async simulateHeal(skillId: number, ctx: SimulationContext): Promise<{ raw: number; multiplied: number }> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");
    const levels = await this.repo.getLevels(skillId);
    const lvl = levels.find(l => l.level === (ctx.skillLevel ?? 1)) ?? levels[0];
    const mult = lvl?.healMultiplier ?? 1;
    return { raw: skill.baseHeal, multiplied: skill.baseHeal * mult };
  }

  async simulateCooldown(skillId: number): Promise<{ base: number; minimum: number; type: string }> {
    const [skill, cds] = await Promise.all([this.repo.getSkill(skillId), this.repo.getCooldowns(skillId)]);
    if (!skill) throw new Error("Skill not found");
    const cd = cds[0];
    return { base: cd?.duration ?? skill.baseCooldown, minimum: cd?.minCooldown ?? 0, type: cd?.cooldownType ?? "local" };
  }

  async simulateCombo(skillId: number, ctx: SimulationContext): Promise<{ hits: number; totalDamage: number; duration: number }> {
    const result = await this.simulateDamage(skillId, ctx);
    const effects = await this.repo.getEffects(skillId);
    const hits = Math.max(1, effects.filter(e => e.trigger === "on_hit").length);
    return { hits, totalDamage: result.multiplied * hits, duration: hits * 0.3 };
  }

  async simulatePassive(skillId: number): Promise<{ buffs: unknown[]; auraRadius: number }> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");
    const buffs = await this.repo.getBuffs(skillId);
    return { buffs, auraRadius: skill.baseRadius };
  }

  async simulateAura(skillId: number): Promise<{ affectsAllies: boolean; radius: number; effectsPerTick: number }> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");
    const buffs = await this.repo.getBuffs(skillId);
    const debuffs = await this.repo.getDebuffs(skillId);
    return {
      affectsAllies: skill.skillTarget === "ally" || skill.skillTarget === "self",
      radius: skill.baseRadius,
      effectsPerTick: buffs.length + debuffs.length,
    };
  }
}
