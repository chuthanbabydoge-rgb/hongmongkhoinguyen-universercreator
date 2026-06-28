import { LandRepository } from "../repositories/land-repository";

export class LandImporter {
  private repo = new LandRepository();

  async importJson(landId: number, payload: Record<string, unknown>, importedBy: number) {
    const imp = await this.repo.createImport(landId, "json", payload, importedBy);
    try {
      await this._apply(landId, payload);
      await this.repo.updateImportStatus(imp.id, "completed");
      return { ok: true, importId: imp.id };
    } catch (e) {
      await this.repo.updateImportStatus(imp.id, "failed", [(e as Error).message]);
      throw e;
    }
  }

  async importTemplate(landId: number, templateId: number, importedBy: number) {
    const tpl = await this.repo.getTemplate(templateId);
    if (!tpl) throw new Error("Template not found");
    const payload = tpl.payload as Record<string, unknown>;
    return this.importJson(landId, payload, importedBy);
  }

  async importPackage(landId: number, payload: Record<string, unknown>, importedBy: number) {
    const imp = await this.repo.createImport(landId, "package", payload, importedBy);
    try {
      await this._apply(landId, payload);
      await this.repo.updateImportStatus(imp.id, "completed");
      return { ok: true, importId: imp.id };
    } catch (e) {
      await this.repo.updateImportStatus(imp.id, "failed", [(e as Error).message]);
      throw e;
    }
  }

  private async _apply(landId: number, payload: Record<string, unknown>) {
    const { parcels, boundaries, zones, terrain, utilities, roads, teleports } = payload as Record<string, unknown[]>;
    if (Array.isArray(parcels)) {
      for (const p of parcels) await this.repo.createParcel({ ...(p as object), landId } as Parameters<typeof this.repo.createParcel>[0]);
    }
    if (Array.isArray(boundaries)) {
      for (const b of boundaries) await this.repo.createBoundary({ ...(b as object), landId } as Parameters<typeof this.repo.createBoundary>[0]);
    }
    if (Array.isArray(zones)) {
      for (const z of zones) await this.repo.createZone({ ...(z as object), landId } as Parameters<typeof this.repo.createZone>[0]);
    }
    if (terrain && typeof terrain === "object") {
      await this.repo.upsertTerrain({ ...(terrain as object), landId } as Parameters<typeof this.repo.upsertTerrain>[0]);
    }
    if (Array.isArray(utilities)) {
      for (const u of utilities) await this.repo.createUtility({ ...(u as object), landId } as Parameters<typeof this.repo.createUtility>[0]);
    }
    if (Array.isArray(roads)) {
      for (const r of roads) await this.repo.createRoad({ ...(r as object), landId } as Parameters<typeof this.repo.createRoad>[0]);
    }
    if (Array.isArray(teleports)) {
      for (const t of teleports) await this.repo.createTeleport({ ...(t as object), landId } as Parameters<typeof this.repo.createTeleport>[0]);
    }
  }
}
