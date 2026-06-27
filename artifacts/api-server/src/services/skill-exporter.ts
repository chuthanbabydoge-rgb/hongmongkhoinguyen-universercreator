import { createHash } from "crypto";
import { DrizzleSkillRepository } from "../repositories/skill-repository";

export class SkillExporter {
  constructor(private repo: DrizzleSkillRepository) {}

  async exportToJson(skillId: number, exportedBy: number): Promise<string> {
    const skill = await this.repo.getSkill(skillId);
    if (!skill) throw new Error("Skill not found");

    const [levels, costs, cooldowns, effects, buffs, debuffs, projectiles, hitboxes,
      animations, audio, visuals, requirements] = await Promise.all([
      this.repo.getLevels(skillId),
      this.repo.getCosts(skillId),
      this.repo.getCooldowns(skillId),
      this.repo.getEffects(skillId),
      this.repo.getBuffs(skillId),
      this.repo.getDebuffs(skillId),
      this.repo.getProjectiles(skillId),
      this.repo.getHitboxes(skillId),
      this.repo.getAnimations(skillId),
      this.repo.getAudio(skillId),
      this.repo.getVisuals(skillId),
      this.repo.getRequirements(skillId),
    ]);

    const payload = JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), skill, levels, costs, cooldowns, effects, buffs, debuffs, projectiles, hitboxes, animations, audio, visuals, requirements });
    const checksum = createHash("sha256").update(payload).digest("hex");

    await this.repo.createExport({ skillId, exportedBy, format: "json", payload, checksum });
    return payload;
  }
}
