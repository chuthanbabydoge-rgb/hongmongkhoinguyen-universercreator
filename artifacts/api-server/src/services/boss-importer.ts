import { BossRepository } from "../repositories/boss-repository";

export class BossImporter {
  private repo = new BossRepository();

  async importJson(bossId: number, payload: Record<string, unknown>, importedBy: number) {
    const errors: string[] = [];
    try {
      if (payload.type !== "boss_json") errors.push("Invalid export type");
      const data = payload.data as Record<string, unknown> | undefined;
      if (!data) { errors.push("Missing data field"); }
      if (errors.length === 0 && data) {
        const { phases, skills, patterns, attacks, weakpoints, enrage, loot, rewards, spawnRules, arenas, cinematics, dialogues, ...boss } = data as Record<string, unknown>;
        await this.repo.update(bossId, boss as Parameters<typeof this.repo.update>[1]);
      }
      await this.repo.createImport({ bossId, importType: "json", sourceData: payload as Record<string, unknown>, importedBy, status: errors.length ? "error" : "success", errors: errors.length ? errors : null });
    } catch (err) {
      errors.push(String(err));
      await this.repo.createImport({ bossId, importType: "json", sourceData: payload as Record<string, unknown>, importedBy, status: "error", errors });
    }
    return { ok: errors.length === 0, errors };
  }

  async importTemplate(bossId: number, templateId: number, importedBy: number) {
    const errors: string[] = [];
    try {
      const template = await this.repo.getTemplate(templateId);
      if (!template) { errors.push("Template not found"); }
      if (errors.length === 0 && template) {
        const payload = template.payload as Record<string, unknown>;
        const data = (payload.data ?? {}) as Record<string, unknown>;
        const { phases, skills, ...boss } = data;
        await this.repo.update(bossId, boss as Parameters<typeof this.repo.update>[1]);
        await this.repo.createImport({ bossId, importType: "template", sourceData: payload, importedBy, status: "success", errors: null });
      }
    } catch (err) {
      errors.push(String(err));
      await this.repo.createImport({ bossId, importType: "template", sourceData: { templateId } as Record<string, unknown>, importedBy, status: "error", errors });
    }
    return { ok: errors.length === 0, errors };
  }

  async importPackage(bossId: number, payload: Record<string, unknown>, importedBy: number) {
    const errors: string[] = [];
    try {
      if (payload.type !== "boss_package") errors.push("Invalid package type");
      if (errors.length === 0) {
        const data = (payload.data ?? {}) as Record<string, unknown>;
        const { phases, skills, patterns, attacks, weakpoints, enrage, loot, rewards, spawnRules, arenas, cinematics, dialogues, ...boss } = data;
        await this.repo.update(bossId, boss as Parameters<typeof this.repo.update>[1]);
      }
      await this.repo.createImport({ bossId, importType: "package", sourceData: payload, importedBy, status: errors.length ? "error" : "success", errors: errors.length ? errors : null });
    } catch (err) {
      errors.push(String(err));
      await this.repo.createImport({ bossId, importType: "package", sourceData: payload, importedBy, status: "error", errors });
    }
    return { ok: errors.length === 0, errors };
  }
}
