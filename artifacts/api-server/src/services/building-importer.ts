import { BuildingRepository } from "../repositories/building-repository";

export class BuildingImporter {
  private repo = new BuildingRepository();

  async importJson(buildingId: number, payload: Record<string, unknown>, userId: number) {
    try {
      if (payload.building && typeof payload.building === "object") {
        const b = payload.building as Record<string, unknown>;
        await this.repo.update(buildingId, {
          name: b.name as string,
          description: b.description as string,
          buildingType: b.buildingType as "house",
          metadata: b.metadata as Record<string, unknown>,
        });
      }
      await this.repo.addImport(buildingId, userId, "json", "success");
      return { ok: true };
    } catch (err) {
      await this.repo.addImport(buildingId, userId, "json", "failed", { error: String(err) });
      throw err;
    }
  }

  async importTemplate(buildingId: number, templateId: number, userId: number) {
    try {
      const templates = await this.repo.getTemplates(true);
      const t = templates.find(t => t.id === templateId);
      if (!t) throw new Error("Template not found");
      const payload = t.payload as Record<string, unknown>;
      if (payload.building && typeof payload.building === "object") {
        const b = payload.building as Record<string, unknown>;
        await this.repo.update(buildingId, {
          name: b.name as string,
          description: b.description as string,
          metadata: b.metadata as Record<string, unknown>,
        });
      }
      await this.repo.addImport(buildingId, userId, "template", "success");
      return { ok: true };
    } catch (err) {
      await this.repo.addImport(buildingId, userId, "template", "failed", { error: String(err) });
      throw err;
    }
  }

  async importPackage(buildingId: number, payload: Record<string, unknown>, userId: number) {
    try {
      await this.repo.addImport(buildingId, userId, "package", "success");
      return { ok: true, imported: 1 };
    } catch (err) {
      await this.repo.addImport(buildingId, userId, "package", "failed", { error: String(err) });
      throw err;
    }
  }
}
