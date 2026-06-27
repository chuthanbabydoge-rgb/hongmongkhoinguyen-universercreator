import { DrizzleSkillRepository } from "../repositories/skill-repository";

export interface ValidationIssue { code: string; message: string; }
export interface ValidationResult { valid: boolean; errors: ValidationIssue[]; warnings: ValidationIssue[]; }

export class SkillValidator {
  constructor(private repo: DrizzleSkillRepository) {}

  async validate(skillId: number): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const skill = await this.repo.getSkill(skillId);
    if (!skill) return { valid: false, errors: [{ code: "SKILL_NOT_FOUND", message: "Skill not found" }], warnings: [] };

    const [cooldowns, effects, animations, audio, costs, levels, buffs, debuffs] = await Promise.all([
      this.repo.getCooldowns(skillId),
      this.repo.getEffects(skillId),
      this.repo.getAnimations(skillId),
      this.repo.getAudio(skillId),
      this.repo.getCosts(skillId),
      this.repo.getLevels(skillId),
      this.repo.getBuffs(skillId),
      this.repo.getDebuffs(skillId),
    ]);

    // ─── Errors ───────────────────────────────────────────────────────────

    if (cooldowns.length === 0) {
      errors.push({ code: "MISSING_COOLDOWN", message: "Skill has no cooldown configured" });
    } else {
      const cd = cooldowns[0]!;
      if (cd.duration < 0) errors.push({ code: "NEGATIVE_COOLDOWN", message: "Cooldown duration cannot be negative" });
      if (cd.minCooldown < 0) errors.push({ code: "NEGATIVE_MIN_COOLDOWN", message: "Minimum cooldown cannot be negative" });
    }

    if (costs.length > 0) {
      for (const cost of costs) {
        if (cost.amount < 0) errors.push({ code: "NEGATIVE_RESOURCE_COST", message: `Resource cost for ${cost.resourceType} cannot be negative` });
        if (cost.chargeCount < 1) errors.push({ code: "INVALID_CHARGE_COUNT", message: "Charge count must be at least 1" });
      }
    }

    if (skill.baseRange < 0) errors.push({ code: "INVALID_RANGE", message: "Base range cannot be negative" });
    if (skill.baseRadius < 0) errors.push({ code: "INVALID_RADIUS", message: "Base radius cannot be negative" });
    if (skill.baseCastTime < 0) errors.push({ code: "INVALID_CAST_TIME", message: "Base cast time cannot be negative" });
    if (skill.maxLevel < 1) errors.push({ code: "INVALID_MAX_LEVEL", message: "Max level must be at least 1" });

    const effectIds = effects.map(e => e.id);
    if (effectIds.length !== new Set(effectIds).size) {
      errors.push({ code: "DUPLICATE_EFFECT_IDS", message: "Duplicate effect IDs detected" });
    }

    for (const effect of effects) {
      if (effect.chance < 0 || effect.chance > 1) {
        errors.push({ code: "INVALID_EFFECT_CHANCE", message: `Effect "${effect.effectName}" chance must be between 0 and 1` });
      }
    }

    if (levels.length > 0) {
      for (const lvl of levels) {
        if (lvl.damageMultiplier < 0) errors.push({ code: "INVALID_LEVEL_SCALING", message: `Level ${lvl.level} has negative damage multiplier` });
        if (lvl.xpRequired < 0) errors.push({ code: "INVALID_XP_REQUIRED", message: `Level ${lvl.level} has negative XP requirement` });
      }
    }

    const triggerRefs = effects.filter(e => e.scriptRef).map(e => e.scriptRef!);
    const seen = new Set<string>();
    for (const ref of triggerRefs) {
      if (seen.has(ref)) errors.push({ code: "CIRCULAR_TRIGGER", message: `Trigger ref "${ref}" appears multiple times — possible circular trigger` });
      seen.add(ref);
    }

    // ─── Warnings ─────────────────────────────────────────────────────────

    if (audio.length === 0) warnings.push({ code: "MISSING_AUDIO", message: "Skill has no audio configured" });
    if (!skill.description) warnings.push({ code: "NO_DESCRIPTION", message: "Skill has no description" });
    if (!skill.iconAssetId) warnings.push({ code: "NO_ICON", message: "Skill has no icon asset" });
    if (animations.length === 0) warnings.push({ code: "MISSING_ANIMATION", message: "Skill has no animation configured" });

    if (costs.length > 0 && costs.some(c => c.amount > 100)) {
      warnings.push({ code: "HIGH_RESOURCE_COST", message: "Skill has a very high resource cost (>100)" });
    }

    for (const buff of buffs) {
      if (Math.abs(buff.value) > 500) {
        warnings.push({ code: "HIGH_BUFF_VALUE", message: `Buff "${buff.buffName}" has an extreme value` });
      }
    }

    for (const debuff of debuffs) {
      if (debuff.duration > 60) {
        warnings.push({ code: "LONG_DEBUFF_DURATION", message: `Debuff "${debuff.debuffName}" duration exceeds 60s` });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
