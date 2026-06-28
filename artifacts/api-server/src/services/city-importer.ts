import type { CityRepository } from "../repositories/city-repository";

export class CityImporter {
  async fromJson(cityId: number, payload: Record<string, unknown>, repo: CityRepository, importedBy: number) {
    try {
      const errors: string[] = [];
      if (payload.districts && Array.isArray(payload.districts)) {
        for (const d of payload.districts) {
          try { await repo.createDistrict({ ...d, cityId, id: undefined } as Parameters<typeof repo.createDistrict>[0]); } catch { errors.push(`District import failed: ${d.name}`); }
        }
      }
      if (payload.zones && Array.isArray(payload.zones)) {
        for (const z of payload.zones) {
          try { await repo.createZone({ ...z, cityId, id: undefined } as Parameters<typeof repo.createZone>[0]); } catch { errors.push(`Zone import failed: ${z.name}`); }
        }
      }
      if (payload.buildings && Array.isArray(payload.buildings)) {
        for (const b of payload.buildings) {
          try { await repo.createBuilding({ ...b, cityId, id: undefined } as Parameters<typeof repo.createBuilding>[0]); } catch { errors.push(`Building import failed: ${b.name}`); }
        }
      }
      await repo.createImport({ cityId, importType: "json", sourceData: payload, importedBy, status: errors.length ? "partial" : "success", errors: errors.length ? errors : null });
      return { ok: true, errors };
    } catch (e) {
      await repo.createImport({ cityId, importType: "json", sourceData: payload, importedBy, status: "failed", errors: [String(e)] });
      throw e;
    }
  }

  async fromTemplate(cityId: number, templateId: number, repo: CityRepository, importedBy: number) {
    const template = await repo.getTemplate(templateId);
    if (!template) throw new Error("Template not found");
    return this.fromJson(cityId, template.payload as Record<string, unknown>, repo, importedBy);
  }

  async fromPackage(cityId: number, payload: Record<string, unknown>, repo: CityRepository, importedBy: number) {
    const data = (payload.city ?? payload) as Record<string, unknown>;
    return this.fromJson(cityId, data, repo, importedBy);
  }
}
