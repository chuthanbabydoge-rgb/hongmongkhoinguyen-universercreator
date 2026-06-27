import { DrizzleSkillRepository } from "../repositories/skill-repository";
import type { InsertSkill } from "@workspace/db/schema";

interface SkillExportPayload {
  version: string;
  skill: InsertSkill & { id?: number };
  levels?: unknown[];
  costs?: unknown[];
  cooldowns?: unknown[];
  effects?: unknown[];
  buffs?: unknown[];
  debuffs?: unknown[];
  projectiles?: unknown[];
  animations?: unknown[];
  audio?: unknown[];
  visuals?: unknown[];
  requirements?: unknown[];
}

export class SkillImporter {
  constructor(private repo: DrizzleSkillRepository) {}

  async importFromJson(importedBy: number, jsonData: string, opts: { nameOverride?: string; projectId?: number } = {}): Promise<{ skillId: number }> {
    let payload: SkillExportPayload;
    try { payload = JSON.parse(jsonData); } catch { throw new Error("Invalid JSON payload"); }

    const { skill, levels = [], costs = [], cooldowns = [], effects = [], buffs = [], debuffs = [], projectiles = [], animations = [], audio = [], visuals = [], requirements = [] } = payload;

    const created = await this.repo.createSkill({
      ...skill,
      id: undefined,
      createdBy: importedBy,
      projectId: opts.projectId ?? skill.projectId,
      name: opts.nameOverride ?? `${skill.name} (imported)`,
      isPublished: false,
    } as InsertSkill);

    await this.repo.createImport({ skillId: created.id, importedBy, sourceFormat: "json", status: "success" });

    for (const lvl of levels) await this.repo.upsertLevel({ ...(lvl as object), skillId: created.id } as Parameters<typeof this.repo.upsertLevel>[0]);
    for (const cost of costs) await this.repo.createCost({ ...(cost as object), skillId: created.id } as Parameters<typeof this.repo.createCost>[0]);
    for (const cd of cooldowns) await this.repo.upsertCooldown({ ...(cd as object), skillId: created.id } as Parameters<typeof this.repo.upsertCooldown>[0]);
    for (const eff of effects) await this.repo.createEffect({ ...(eff as object), skillId: created.id } as Parameters<typeof this.repo.createEffect>[0]);
    for (const buff of buffs) await this.repo.createBuff({ ...(buff as object), skillId: created.id } as Parameters<typeof this.repo.createBuff>[0]);
    for (const deb of debuffs) await this.repo.createDebuff({ ...(deb as object), skillId: created.id } as Parameters<typeof this.repo.createDebuff>[0]);
    for (const proj of projectiles) await this.repo.createProjectile({ ...(proj as object), skillId: created.id } as Parameters<typeof this.repo.createProjectile>[0]);
    for (const anim of animations) await this.repo.createAnimation({ ...(anim as object), skillId: created.id } as Parameters<typeof this.repo.createAnimation>[0]);
    for (const aud of audio) await this.repo.createAudio({ ...(aud as object), skillId: created.id } as Parameters<typeof this.repo.createAudio>[0]);
    for (const vis of visuals) await this.repo.createVisual({ ...(vis as object), skillId: created.id } as Parameters<typeof this.repo.createVisual>[0]);
    for (const req of requirements) await this.repo.createRequirement({ ...(req as object), skillId: created.id } as Parameters<typeof this.repo.createRequirement>[0]);

    return { skillId: created.id };
  }

  async importFromTemplate(importedBy: number, templateId: number, opts: { name: string; projectId?: number }): Promise<{ skillId: number }> {
    const template = await this.repo.getTemplate(templateId);
    if (!template || !template.snapshot) throw new Error("Template not found or has no snapshot");
    await this.repo.incrementTemplateUse(templateId);
    return this.importFromJson(importedBy, JSON.stringify(template.snapshot), { nameOverride: opts.name, projectId: opts.projectId });
  }
}
