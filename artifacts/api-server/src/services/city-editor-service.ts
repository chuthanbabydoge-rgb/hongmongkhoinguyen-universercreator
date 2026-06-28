import { CityRepository } from "../repositories/city-repository";
import { CityValidator } from "./city-validator";
import { CityExporter } from "./city-exporter";
import { CityImporter } from "./city-importer";
import { CityRuntimeBridge } from "./city-runtime-bridge";

export class CityEditorService {
  private repo = new CityRepository();
  private validator = new CityValidator();
  private exporter = new CityExporter();
  private importer = new CityImporter();
  private runtime = new CityRuntimeBridge();

  // ─── Dashboard ────────────────────────────────────────────────────────────
  async getDashboard(userId: number) {
    const [cities, total] = await Promise.all([
      this.repo.list(userId, 5, 0),
      this.repo.count(userId),
    ]);
    return { cities, total, recentCount: cities.length };
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async listCities(userId: number, limit = 20, offset = 0, search?: string) {
    const [items, total] = await Promise.all([
      this.repo.list(userId, limit, offset, search),
      this.repo.count(userId),
    ]);
    return { items, total, limit, offset };
  }

  async getCity(id: number) {
    const city = await this.repo.get(id);
    if (!city) throw new Error("City not found");
    return city;
  }

  async getFullCity(id: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    return city;
  }

  async createCity(userId: number, data: Record<string, unknown>) {
    const city = await this.repo.create({ ...data, createdBy: userId } as Parameters<typeof this.repo.create>[0]);
    await this.repo.upsertStatistics(city.id, {});
    await this.repo.upsertSettings(city.id, {});
    await this.repo.upsertPopulation(city.id, {});
    await this.repo.addHistory(city.id, "created", userId);
    return city;
  }

  async updateCity(id: number, userId: number, data: Record<string, unknown>) {
    const city = await this.repo.update(id, data as Parameters<typeof this.repo.update>[1]);
    await this.repo.addHistory(id, "updated", userId);
    return city;
  }

  async deleteCity(id: number, userId: number) {
    await this.repo.addHistory(id, "deleted", userId);
    await this.repo.delete(id);
    return { ok: true };
  }

  async duplicateCity(id: number, userId: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    const { id: _, createdAt, updatedAt, settings, districts, zones, roads, buildings, utilities, transport, population, services, spawnpoints, landmarks, ...rest } = city;
    const newCity = await this.repo.create({ ...rest, name: `${city.name} (Copy)`, createdBy: userId, isPublished: false, version: 1 });
    if (settings) await this.repo.upsertSettings(newCity.id, { ...settings });
    for (const d of districts ?? []) { const { id: __, cityId: ___, ...dr } = d; await this.repo.createDistrict({ ...dr, cityId: newCity.id }); }
    for (const z of zones ?? []) { const { id: __, cityId: ___, ...zr } = z; await this.repo.createZone({ ...zr, cityId: newCity.id }); }
    for (const r of roads ?? []) { const { id: __, cityId: ___, ...rr } = r; await this.repo.createRoad({ ...rr, cityId: newCity.id }); }
    for (const b of buildings ?? []) { const { id: __, cityId: ___, ...br } = b; await this.repo.createBuilding({ ...br, cityId: newCity.id }); }
    for (const u of utilities ?? []) { const { id: __, cityId: ___, ...ur } = u; await this.repo.createUtility({ ...ur, cityId: newCity.id }); }
    for (const t of transport ?? []) { const { id: __, cityId: ___, ...tr } = t; await this.repo.createTransport({ ...tr, cityId: newCity.id }); }
    await this.repo.addHistory(newCity.id, "duplicated", userId, "source_id", String(id));
    return newCity;
  }

  async forkCity(id: number, userId: number) {
    return this.duplicateCity(id, userId);
  }

  async publishCity(id: number, userId: number) {
    const city = await this.repo.update(id, { isPublished: true });
    await this.repo.addHistory(id, "published", userId);
    return city;
  }

  async archiveCity(id: number, userId: number) {
    const city = await this.repo.update(id, { isArchived: true, status: "archived" });
    await this.repo.addHistory(id, "archived", userId);
    return city;
  }

  async restoreCity(id: number, userId: number) {
    const city = await this.repo.update(id, { isArchived: false, status: "draft" });
    await this.repo.addHistory(id, "restored", userId);
    return city;
  }

  async createSnapshot(id: number, userId: number, label?: string) {
    const city = await this.getFullCity(id);
    const current = await this.repo.listVersions(id);
    const nextVersion = (current[0]?.version ?? 0) + 1;
    const version = await this.repo.createVersion({ cityId: id, version: nextVersion, snapshot: city as unknown as Record<string, unknown>, label: label ?? `v${nextVersion}`, createdBy: userId });
    await this.repo.addHistory(id, "snapshot", userId, "version", undefined, String(nextVersion));
    return version;
  }

  // ─── Settings ─────────────────────────────────────────────────────────────
  async getSettings(cityId: number) { return this.repo.getSettings(cityId); }
  async updateSettings(cityId: number, data: Record<string, unknown>) { return this.repo.upsertSettings(cityId, data as Parameters<typeof this.repo.upsertSettings>[1]); }

  // ─── Districts ────────────────────────────────────────────────────────────
  async listDistricts(cityId: number) { return this.repo.listDistricts(cityId); }
  async getDistrict(id: number) { const d = await this.repo.getDistrict(id); if (!d) throw new Error("District not found"); return d; }
  async createDistrict(cityId: number, data: Record<string, unknown>) { return this.repo.createDistrict({ ...data, cityId } as Parameters<typeof this.repo.createDistrict>[0]); }
  async updateDistrict(id: number, data: Record<string, unknown>) { return this.repo.updateDistrict(id, data as Parameters<typeof this.repo.updateDistrict>[1]); }
  async deleteDistrict(id: number) { await this.repo.deleteDistrict(id); return { ok: true }; }

  // ─── Zones ────────────────────────────────────────────────────────────────
  async listZones(cityId: number) { return this.repo.listZones(cityId); }
  async getZone(id: number) { const z = await this.repo.getZone(id); if (!z) throw new Error("Zone not found"); return z; }
  async createZone(cityId: number, data: Record<string, unknown>) { return this.repo.createZone({ ...data, cityId } as Parameters<typeof this.repo.createZone>[0]); }
  async updateZone(id: number, data: Record<string, unknown>) { return this.repo.updateZone(id, data as Parameters<typeof this.repo.updateZone>[1]); }
  async deleteZone(id: number) { await this.repo.deleteZone(id); return { ok: true }; }

  // ─── Roads ────────────────────────────────────────────────────────────────
  async listRoads(cityId: number) { return this.repo.listRoads(cityId); }
  async getRoad(id: number) { const r = await this.repo.getRoad(id); if (!r) throw new Error("Road not found"); return r; }
  async createRoad(cityId: number, data: Record<string, unknown>) { return this.repo.createRoad({ ...data, cityId } as Parameters<typeof this.repo.createRoad>[0]); }
  async updateRoad(id: number, data: Record<string, unknown>) { return this.repo.updateRoad(id, data as Parameters<typeof this.repo.updateRoad>[1]); }
  async deleteRoad(id: number) { await this.repo.deleteRoad(id); return { ok: true }; }

  // ─── Intersections ────────────────────────────────────────────────────────
  async listIntersections(cityId: number) { return this.repo.listIntersections(cityId); }
  async createIntersection(cityId: number, data: Record<string, unknown>) { return this.repo.createIntersection({ ...data, cityId } as Parameters<typeof this.repo.createIntersection>[0]); }
  async updateIntersection(id: number, data: Record<string, unknown>) { return this.repo.updateIntersection(id, data as Parameters<typeof this.repo.updateIntersection>[1]); }
  async deleteIntersection(id: number) { await this.repo.deleteIntersection(id); return { ok: true }; }

  // ─── Buildings ────────────────────────────────────────────────────────────
  async listBuildings(cityId: number) { return this.repo.listBuildings(cityId); }
  async getBuilding(id: number) { const b = await this.repo.getBuilding(id); if (!b) throw new Error("Building not found"); return b; }
  async createBuilding(cityId: number, data: Record<string, unknown>) { return this.repo.createBuilding({ ...data, cityId } as Parameters<typeof this.repo.createBuilding>[0]); }
  async updateBuilding(id: number, data: Record<string, unknown>) { return this.repo.updateBuilding(id, data as Parameters<typeof this.repo.updateBuilding>[1]); }
  async deleteBuilding(id: number) { await this.repo.deleteBuilding(id); return { ok: true }; }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(cityId: number) { return this.repo.listUtilities(cityId); }
  async getUtility(id: number) { const u = await this.repo.getUtility(id); if (!u) throw new Error("Utility not found"); return u; }
  async createUtility(cityId: number, data: Record<string, unknown>) { return this.repo.createUtility({ ...data, cityId } as Parameters<typeof this.repo.createUtility>[0]); }
  async updateUtility(id: number, data: Record<string, unknown>) { return this.repo.updateUtility(id, data as Parameters<typeof this.repo.updateUtility>[1]); }
  async deleteUtility(id: number) { await this.repo.deleteUtility(id); return { ok: true }; }

  // ─── Transport ────────────────────────────────────────────────────────────
  async listTransport(cityId: number) { return this.repo.listTransport(cityId); }
  async getTransport(id: number) { const t = await this.repo.getTransport(id); if (!t) throw new Error("Transport not found"); return t; }
  async createTransport(cityId: number, data: Record<string, unknown>) { return this.repo.createTransport({ ...data, cityId } as Parameters<typeof this.repo.createTransport>[0]); }
  async updateTransport(id: number, data: Record<string, unknown>) { return this.repo.updateTransport(id, data as Parameters<typeof this.repo.updateTransport>[1]); }
  async deleteTransport(id: number) { await this.repo.deleteTransport(id); return { ok: true }; }

  // ─── Population ───────────────────────────────────────────────────────────
  async getPopulation(cityId: number) { return this.repo.getPopulation(cityId); }
  async updatePopulation(cityId: number, data: Record<string, unknown>) { return this.repo.upsertPopulation(cityId, data as Parameters<typeof this.repo.upsertPopulation>[1]); }

  // ─── Services ─────────────────────────────────────────────────────────────
  async listServices(cityId: number) { return this.repo.listServices(cityId); }
  async getService(id: number) { const s = await this.repo.getService(id); if (!s) throw new Error("Service not found"); return s; }
  async createService(cityId: number, data: Record<string, unknown>) { return this.repo.createService({ ...data, cityId } as Parameters<typeof this.repo.createService>[0]); }
  async updateService(id: number, data: Record<string, unknown>) { return this.repo.updateService(id, data as Parameters<typeof this.repo.updateService>[1]); }
  async deleteService(id: number) { await this.repo.deleteService(id); return { ok: true }; }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────
  async listSpawnpoints(cityId: number) { return this.repo.listSpawnpoints(cityId); }
  async createSpawnpoint(cityId: number, data: Record<string, unknown>) { return this.repo.createSpawnpoint({ ...data, cityId } as Parameters<typeof this.repo.createSpawnpoint>[0]); }
  async updateSpawnpoint(id: number, data: Record<string, unknown>) { return this.repo.updateSpawnpoint(id, data as Parameters<typeof this.repo.updateSpawnpoint>[1]); }
  async deleteSpawnpoint(id: number) { await this.repo.deleteSpawnpoint(id); return { ok: true }; }

  // ─── Landmarks ────────────────────────────────────────────────────────────
  async listLandmarks(cityId: number) { return this.repo.listLandmarks(cityId); }
  async createLandmark(cityId: number, data: Record<string, unknown>) { return this.repo.createLandmark({ ...data, cityId } as Parameters<typeof this.repo.createLandmark>[0]); }
  async updateLandmark(id: number, data: Record<string, unknown>) { return this.repo.updateLandmark(id, data as Parameters<typeof this.repo.updateLandmark>[1]); }
  async deleteLandmark(id: number) { await this.repo.deleteLandmark(id); return { ok: true }; }

  // ─── Templates ────────────────────────────────────────────────────────────
  async getTemplates(isPublic?: boolean) { return this.repo.listTemplates(isPublic); }
  async deleteTemplate(id: number) { await this.repo.deleteTemplate(id); return { ok: true }; }

  // ─── Versions / History / Statistics ─────────────────────────────────────
  async listVersions(cityId: number) { return this.repo.listVersions(cityId); }
  async listHistory(cityId: number) { return this.repo.listHistory(cityId); }
  async getStatistics(cityId: number) { return this.repo.getStatistics(cityId); }

  // ─── Validation ───────────────────────────────────────────────────────────
  async validate(id: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    return this.validator.validate(city);
  }

  // ─── Export ───────────────────────────────────────────────────────────────
  async exportJson(id: number, userId: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    return this.exporter.toJson(city, this.repo, id, userId);
  }

  async exportTemplate(id: number, name: string, description: string, userId: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    return this.exporter.toTemplate(city, name, description, this.repo, id, userId);
  }

  async exportPackage(id: number, userId: number) {
    const city = await this.repo.getFull(id);
    if (!city) throw new Error("City not found");
    return this.exporter.toPackage(city, this.repo, id, userId);
  }

  async listExports(cityId: number) { return this.repo.listExports(cityId); }
  async listImports(cityId: number) { return this.repo.listImports(cityId); }

  // ─── Import ───────────────────────────────────────────────────────────────
  async importJson(cityId: number, payload: Record<string, unknown>, userId: number) {
    return this.importer.fromJson(cityId, payload, this.repo, userId);
  }

  async importTemplate(cityId: number, templateId: number, userId: number) {
    return this.importer.fromTemplate(cityId, templateId, this.repo, userId);
  }

  async importPackage(cityId: number, payload: Record<string, unknown>, userId: number) {
    return this.importer.fromPackage(cityId, payload, this.repo, userId);
  }

  // ─── Runtime / Simulation ─────────────────────────────────────────────────
  async listRuntime(cityId: number) { return this.repo.listRuntime(cityId); }

  async startSimulation(cityId: number, sessionId: string) {
    return this.runtime.startSimulation(cityId, sessionId, this.repo);
  }

  async stopSimulation(sessionId: string, userId: number) {
    return this.runtime.stopSimulation(sessionId, userId, this.repo);
  }

  async tickSimulation(sessionId: string) {
    return this.runtime.tick(sessionId, this.repo);
  }

  async spawnCitizens(sessionId: string, count: number) {
    return this.runtime.spawnCitizens(sessionId, count, this.repo);
  }

  async simulateTraffic(sessionId: string) {
    return this.runtime.simulateTraffic(sessionId, this.repo);
  }

  async simulateEconomy(cityId: number) {
    return this.runtime.simulateEconomy(cityId, this.repo);
  }

  async simulateEmergency(sessionId: string, type: string) {
    return this.runtime.simulateEmergency(sessionId, type, this.repo);
  }
}
