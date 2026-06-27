import { DrizzleSkillRepository } from "../repositories/skill-repository";
import { SkillValidator } from "./skill-validator";
import { SkillExporter } from "./skill-exporter";
import { SkillImporter } from "./skill-importer";
import { SkillRuntimeBridge } from "./skill-runtime-bridge";
import type { InsertSkill } from "@workspace/db/schema";

export class SkillEditorService {
  private repo: DrizzleSkillRepository;
  validator: SkillValidator;
  exporter: SkillExporter;
  importer: SkillImporter;
  runtime: SkillRuntimeBridge;

  constructor() {
    this.repo = new DrizzleSkillRepository();
    this.validator = new SkillValidator(this.repo);
    this.exporter = new SkillExporter(this.repo);
    this.importer = new SkillImporter(this.repo);
    this.runtime = new SkillRuntimeBridge(this.repo);
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboard(userId: number) { return this.repo.getDashboard(userId); }

  // ─── Skills CRUD ──────────────────────────────────────────────────────────

  listSkills(userId: number, limit: number, offset: number, search?: string) { return this.repo.listSkills(userId, limit, offset, search); }

  async createSkill(userId: number, data: Partial<InsertSkill>) {
    const skill = await this.repo.createSkill({ name: "New Skill", ...data, createdBy: userId } as InsertSkill);
    await this.repo.recordHistory({ skillId: skill.id, actionType: "created", performedBy: userId });
    return skill;
  }

  async getSkill(id: number) {
    const skill = await this.repo.getSkill(id);
    if (!skill) throw new Error("Skill not found");
    return skill;
  }

  async updateSkill(id: number, userId: number, data: Partial<InsertSkill>) {
    const skill = await this.repo.updateSkill(id, data);
    await this.repo.recordHistory({ skillId: id, actionType: "updated", performedBy: userId });
    return skill;
  }

  async deleteSkill(id: number, userId: number) {
    await this.repo.recordHistory({ skillId: id, actionType: "deleted", performedBy: userId });
    await this.repo.deleteSkill(id);
  }

  async duplicateSkill(id: number, userId: number) {
    const json = await this.exporter.exportToJson(id, userId);
    return this.importer.importFromJson(userId, json, { nameOverride: undefined });
  }

  async publishSkill(id: number, userId: number) {
    const result = await this.validator.validate(id);
    if (!result.valid) throw new Error(`Validation failed: ${result.errors.map(e => e.message).join("; ")}`);
    const skill = await this.repo.updateSkill(id, { isPublished: true });
    await this.repo.recordHistory({ skillId: id, actionType: "published", performedBy: userId });
    return skill;
  }

  async archiveSkill(id: number, userId: number) {
    const skill = await this.repo.updateSkill(id, { isArchived: true });
    await this.repo.recordHistory({ skillId: id, actionType: "archived", performedBy: userId });
    return skill;
  }

  async restoreSkill(id: number, userId: number) {
    const skill = await this.repo.updateSkill(id, { isArchived: false });
    await this.repo.recordHistory({ skillId: id, actionType: "restored", performedBy: userId });
    return skill;
  }

  // ─── Sub-resources ────────────────────────────────────────────────────────

  getLevels(id: number) { return this.repo.getLevels(id); }
  upsertLevel(id: number, data: object) { return this.repo.upsertLevel({ ...data, skillId: id } as Parameters<typeof this.repo.upsertLevel>[0]); }
  deleteLevel(levelId: number) { return this.repo.deleteLevel(levelId); }

  getCosts(id: number) { return this.repo.getCosts(id); }
  createCost(id: number, data: object) { return this.repo.createCost({ ...data, skillId: id } as Parameters<typeof this.repo.createCost>[0]); }
  updateCost(costId: number, data: object) { return this.repo.updateCost(costId, data as Parameters<typeof this.repo.updateCost>[1]); }
  deleteCost(costId: number) { return this.repo.deleteCost(costId); }

  getCooldowns(id: number) { return this.repo.getCooldowns(id); }
  upsertCooldown(id: number, data: object) { return this.repo.upsertCooldown({ ...data, skillId: id } as Parameters<typeof this.repo.upsertCooldown>[0]); }
  deleteCooldown(cdId: number) { return this.repo.deleteCooldown(cdId); }

  getEffects(id: number) { return this.repo.getEffects(id); }
  createEffect(id: number, data: object) { return this.repo.createEffect({ ...data, skillId: id } as Parameters<typeof this.repo.createEffect>[0]); }
  updateEffect(effectId: number, data: object) { return this.repo.updateEffect(effectId, data as Parameters<typeof this.repo.updateEffect>[1]); }
  deleteEffect(effectId: number) { return this.repo.deleteEffect(effectId); }

  getBuffs(id: number) { return this.repo.getBuffs(id); }
  createBuff(id: number, data: object) { return this.repo.createBuff({ ...data, skillId: id } as Parameters<typeof this.repo.createBuff>[0]); }
  updateBuff(buffId: number, data: object) { return this.repo.updateBuff(buffId, data as Parameters<typeof this.repo.updateBuff>[1]); }
  deleteBuff(buffId: number) { return this.repo.deleteBuff(buffId); }

  getDebuffs(id: number) { return this.repo.getDebuffs(id); }
  createDebuff(id: number, data: object) { return this.repo.createDebuff({ ...data, skillId: id } as Parameters<typeof this.repo.createDebuff>[0]); }
  updateDebuff(debuffId: number, data: object) { return this.repo.updateDebuff(debuffId, data as Parameters<typeof this.repo.updateDebuff>[1]); }
  deleteDebuff(debuffId: number) { return this.repo.deleteDebuff(debuffId); }

  getProjectiles(id: number) { return this.repo.getProjectiles(id); }
  createProjectile(id: number, data: object) { return this.repo.createProjectile({ ...data, skillId: id } as Parameters<typeof this.repo.createProjectile>[0]); }
  updateProjectile(projId: number, data: object) { return this.repo.updateProjectile(projId, data as Parameters<typeof this.repo.updateProjectile>[1]); }
  deleteProjectile(projId: number) { return this.repo.deleteProjectile(projId); }

  getHitboxes(id: number) { return this.repo.getHitboxes(id); }
  createHitbox(id: number, data: object) { return this.repo.createHitbox({ ...data, skillId: id } as Parameters<typeof this.repo.createHitbox>[0]); }
  deleteHitbox(hbId: number) { return this.repo.deleteHitbox(hbId); }

  getAnimations(id: number) { return this.repo.getAnimations(id); }
  createAnimation(id: number, data: object) { return this.repo.createAnimation({ ...data, skillId: id } as Parameters<typeof this.repo.createAnimation>[0]); }
  updateAnimation(animId: number, data: object) { return this.repo.updateAnimation(animId, data as Parameters<typeof this.repo.updateAnimation>[1]); }
  deleteAnimation(animId: number) { return this.repo.deleteAnimation(animId); }

  getAudio(id: number) { return this.repo.getAudio(id); }
  createAudio(id: number, data: object) { return this.repo.createAudio({ ...data, skillId: id } as Parameters<typeof this.repo.createAudio>[0]); }
  updateAudio(audioId: number, data: object) { return this.repo.updateAudio(audioId, data as Parameters<typeof this.repo.updateAudio>[1]); }
  deleteAudio(audioId: number) { return this.repo.deleteAudio(audioId); }

  getVisuals(id: number) { return this.repo.getVisuals(id); }
  createVisual(id: number, data: object) { return this.repo.createVisual({ ...data, skillId: id } as Parameters<typeof this.repo.createVisual>[0]); }
  updateVisual(visId: number, data: object) { return this.repo.updateVisual(visId, data as Parameters<typeof this.repo.updateVisual>[1]); }
  deleteVisual(visId: number) { return this.repo.deleteVisual(visId); }

  getRequirements(id: number) { return this.repo.getRequirements(id); }
  createRequirement(id: number, data: object) { return this.repo.createRequirement({ ...data, skillId: id } as Parameters<typeof this.repo.createRequirement>[0]); }
  deleteRequirement(reqId: number) { return this.repo.deleteRequirement(reqId); }

  listTemplates(limit: number, offset: number) { return this.repo.listTemplates(limit, offset); }
  createTemplate(skillId: number, userId: number, name: string) {
    return this.exporter.exportToJson(skillId, userId).then(json =>
      this.repo.createTemplate({ sourceSkillId: skillId, createdBy: userId, templateName: name, snapshot: JSON.parse(json) })
    );
  }

  getVersions(id: number) { return this.repo.getVersions(id); }
  getHistory(id: number, limit: number, offset: number) { return this.repo.getHistory(id, limit, offset); }
  getStatistics(id: number) { return this.repo.getStatistics(id); }
  getExports(id: number) { return this.repo.getExports(id); }
}
