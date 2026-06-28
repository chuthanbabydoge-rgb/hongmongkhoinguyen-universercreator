import { LandRepository } from "../repositories/land-repository";
import { LandValidator } from "./land-validator";
import { LandExporter } from "./land-exporter";
import { LandImporter } from "./land-importer";
import { LandRuntimeBridge } from "./land-runtime-bridge";

export class LandEditorService {
  private repo = new LandRepository();
  private validator = new LandValidator();
  private exporter = new LandExporter();
  private importer = new LandImporter();
  private runtime = new LandRuntimeBridge();

  // ─── Dashboard ────────────────────────────────────────────────────────────
  async getDashboard(userId: number) {
    const [lands, total] = await Promise.all([this.repo.list(userId, 5, 0), this.repo.count(userId)]);
    return { lands, total, recentCount: lands.length };
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async listLands(userId: number, limit = 20, offset = 0, search?: string) {
    const [items, total] = await Promise.all([this.repo.list(userId, limit, offset, search), this.repo.count(userId)]);
    return { items, total, limit, offset };
  }

  async getLand(id: number) {
    const l = await this.repo.get(id);
    if (!l) throw new Error("Land not found");
    return l;
  }

  async getFullLand(id: number) {
    const land = await this.repo.get(id);
    if (!land) throw new Error("Land not found");
    const [parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings, stats] = await Promise.all([
      this.repo.listParcels(id),
      this.repo.listBoundaries(id),
      this.repo.listOwners(id),
      this.repo.listZones(id),
      this.repo.getTerrain(id),
      this.repo.listUtilities(id),
      this.repo.listRoads(id),
      this.repo.listTeleports(id),
      this.repo.listBuildings(id),
      this.repo.getStatistics(id),
    ]);
    return { land, parcels, boundaries, owners, zones, terrain, utilities, roads, teleports, buildings, stats };
  }

  async createLand(userId: number, data: Record<string, unknown>) {
    const land = await this.repo.create({ ...data, createdBy: userId } as Parameters<typeof this.repo.create>[0]);
    await Promise.all([this.repo.upsertStatistics(land.id, {}), this.repo.addHistory(land.id, "created", userId)]);
    return land;
  }

  async updateLand(id: number, userId: number, data: Record<string, unknown>) {
    const l = await this.repo.update(id, data as Parameters<typeof this.repo.update>[1]);
    await this.repo.addHistory(id, "updated", userId);
    return l;
  }

  async deleteLand(id: number, userId: number) {
    await this.repo.addHistory(id, "deleted", userId);
    await this.repo.delete(id);
    return { ok: true };
  }

  async duplicateLand(id: number, userId: number) {
    const orig = await this.repo.get(id);
    if (!orig) throw new Error("Land not found");
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = orig;
    const copy = await this.repo.create({ ...rest, createdBy: userId, name: `${orig.name} (Copy)`, isPublished: false, version: 1 });
    await this.repo.addHistory(copy.id, "duplicated_from", userId, "land", id);
    return copy;
  }

  async forkLand(id: number, userId: number) {
    const orig = await this.repo.get(id);
    if (!orig) throw new Error("Land not found");
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = orig;
    const fork = await this.repo.create({ ...rest, createdBy: userId, name: `${orig.name} (Fork)`, isPublished: false, isTemplate: false, version: 1 });
    await this.repo.addHistory(fork.id, "forked_from", userId, "land", id);
    return fork;
  }

  async publishLand(id: number, userId: number) {
    const l = await this.repo.update(id, { isPublished: true });
    await this.repo.addHistory(id, "published", userId);
    return l;
  }

  async archiveLand(id: number, userId: number) {
    const l = await this.repo.update(id, { landStatus: "archived" });
    await this.repo.addHistory(id, "archived", userId);
    return l;
  }

  async restoreLand(id: number, userId: number) {
    const l = await this.repo.update(id, { landStatus: "active" });
    await this.repo.addHistory(id, "restored", userId);
    return l;
  }

  // ─── Parcels ──────────────────────────────────────────────────────────────
  async listParcels(landId: number) { return this.repo.listParcels(landId); }
  async getParcel(id: number) { const p = await this.repo.getParcel(id); if (!p) throw new Error("Parcel not found"); return p; }
  async createParcel(landId: number, data: Record<string, unknown>) { return this.repo.createParcel({ ...data, landId } as Parameters<typeof this.repo.createParcel>[0]); }
  async updateParcel(id: number, data: Record<string, unknown>) { return this.repo.updateParcel(id, data as Parameters<typeof this.repo.updateParcel>[1]); }
  async deleteParcel(id: number) { await this.repo.deleteParcel(id); return { ok: true }; }

  // ─── Boundaries ───────────────────────────────────────────────────────────
  async listBoundaries(landId: number) { return this.repo.listBoundaries(landId); }
  async getBoundary(id: number) { const b = await this.repo.getBoundary(id); if (!b) throw new Error("Boundary not found"); return b; }
  async createBoundary(landId: number, data: Record<string, unknown>) { return this.repo.createBoundary({ ...data, landId } as Parameters<typeof this.repo.createBoundary>[0]); }
  async updateBoundary(id: number, data: Record<string, unknown>) { return this.repo.updateBoundary(id, data as Parameters<typeof this.repo.updateBoundary>[1]); }
  async deleteBoundary(id: number) { await this.repo.deleteBoundary(id); return { ok: true }; }

  // ─── Owners ───────────────────────────────────────────────────────────────
  async listOwners(landId: number) { return this.repo.listOwners(landId); }
  async createOwner(landId: number, data: Record<string, unknown>) { return this.repo.createOwner({ ...data, landId } as Parameters<typeof this.repo.createOwner>[0]); }
  async updateOwner(id: number, data: Record<string, unknown>) { return this.repo.updateOwner(id, data as Parameters<typeof this.repo.updateOwner>[1]); }
  async deleteOwner(id: number) { await this.repo.deleteOwner(id); return { ok: true }; }

  // ─── Zones ────────────────────────────────────────────────────────────────
  async listZones(landId: number) { return this.repo.listZones(landId); }
  async getZone(id: number) { const z = await this.repo.getZone(id); if (!z) throw new Error("Zone not found"); return z; }
  async createZone(landId: number, data: Record<string, unknown>) { return this.repo.createZone({ ...data, landId } as Parameters<typeof this.repo.createZone>[0]); }
  async updateZone(id: number, data: Record<string, unknown>) { return this.repo.updateZone(id, data as Parameters<typeof this.repo.updateZone>[1]); }
  async deleteZone(id: number) { await this.repo.deleteZone(id); return { ok: true }; }

  // ─── Terrain ──────────────────────────────────────────────────────────────
  async getTerrain(landId: number) { return this.repo.getTerrain(landId); }
  async upsertTerrain(landId: number, data: Record<string, unknown>) { return this.repo.upsertTerrain({ ...data, landId } as Parameters<typeof this.repo.upsertTerrain>[0]); }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(landId: number) { return this.repo.listUtilities(landId); }
  async getUtility(id: number) { const u = await this.repo.getUtility(id); if (!u) throw new Error("Utility not found"); return u; }
  async createUtility(landId: number, data: Record<string, unknown>) { return this.repo.createUtility({ ...data, landId } as Parameters<typeof this.repo.createUtility>[0]); }
  async updateUtility(id: number, data: Record<string, unknown>) { return this.repo.updateUtility(id, data as Parameters<typeof this.repo.updateUtility>[1]); }
  async deleteUtility(id: number) { await this.repo.deleteUtility(id); return { ok: true }; }

  // ─── Roads ────────────────────────────────────────────────────────────────
  async listRoads(landId: number) { return this.repo.listRoads(landId); }
  async getRoad(id: number) { const r = await this.repo.getRoad(id); if (!r) throw new Error("Road not found"); return r; }
  async createRoad(landId: number, data: Record<string, unknown>) { return this.repo.createRoad({ ...data, landId } as Parameters<typeof this.repo.createRoad>[0]); }
  async updateRoad(id: number, data: Record<string, unknown>) { return this.repo.updateRoad(id, data as Parameters<typeof this.repo.updateRoad>[1]); }
  async deleteRoad(id: number) { await this.repo.deleteRoad(id); return { ok: true }; }

  // ─── Teleports ────────────────────────────────────────────────────────────
  async listTeleports(landId: number) { return this.repo.listTeleports(landId); }
  async getTeleport(id: number) { const t = await this.repo.getTeleport(id); if (!t) throw new Error("Teleport not found"); return t; }
  async createTeleport(landId: number, data: Record<string, unknown>) { return this.repo.createTeleport({ ...data, landId } as Parameters<typeof this.repo.createTeleport>[0]); }
  async updateTeleport(id: number, data: Record<string, unknown>) { return this.repo.updateTeleport(id, data as Parameters<typeof this.repo.updateTeleport>[1]); }
  async deleteTeleport(id: number) { await this.repo.deleteTeleport(id); return { ok: true }; }

  // ─── Land Buildings ───────────────────────────────────────────────────────
  async listLandBuildings(landId: number) { return this.repo.listBuildings(landId); }
  async placeLandBuilding(landId: number, data: Record<string, unknown>) { return this.repo.createBuilding({ ...data, landId } as Parameters<typeof this.repo.createBuilding>[0]); }
  async updateLandBuilding(id: number, data: Record<string, unknown>) { return this.repo.updateBuilding(id, data as Parameters<typeof this.repo.updateBuilding>[1]); }
  async removeLandBuilding(id: number) { await this.repo.deleteLandBuilding(id); return { ok: true }; }

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  async listBookmarks(userId: number) { return this.repo.listBookmarks(userId); }
  async addBookmark(userId: number, landId: number, label?: string) { return this.repo.addBookmark(userId, landId, label); }
  async deleteBookmark(id: number) { await this.repo.deleteBookmark(id); return { ok: true }; }

  // ─── Templates ────────────────────────────────────────────────────────────
  async getTemplates(global: boolean) { return this.repo.listTemplates(global); }
  async createTemplate(data: Record<string, unknown>) { return this.repo.createTemplate(data as Parameters<typeof this.repo.createTemplate>[0]); }
  async deleteTemplate(id: number) { await this.repo.deleteTemplate(id); return { ok: true }; }

  // ─── History & Versions ───────────────────────────────────────────────────
  async getHistory(landId: number) { return this.repo.listHistory(landId); }
  async listVersions(landId: number) { return this.repo.listVersions(landId); }
  async saveVersion(landId: number, userId: number, changelog?: string) {
    const land = await this.repo.get(landId);
    if (!land) throw new Error("Land not found");
    return this.repo.createVersion({ landId, version: land.version, snapshot: land as Record<string, unknown>, changelog, createdBy: userId });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(landId: number) { return this.repo.getStatistics(landId); }

  // ─── Marketplace ──────────────────────────────────────────────────────────
  async listMarketplace(landId: number) { return this.repo.listMarketplace(landId); }
  async createListing(landId: number, data: Record<string, unknown>) { return this.repo.createListing({ ...data, landId } as Parameters<typeof this.repo.createListing>[0]); }
  async updateListing(id: number, data: Record<string, unknown>) { return this.repo.updateListing(id, data as Parameters<typeof this.repo.updateListing>[1]); }
  async deleteListing(id: number) { await this.repo.deleteListing(id); return { ok: true }; }

  // ─── Permissions ──────────────────────────────────────────────────────────
  async listPermissions(landId: number) { return this.repo.listPermissions(landId); }
  async upsertPermission(landId: number, data: Record<string, unknown>) { return this.repo.upsertPermission({ ...data, landId } as Parameters<typeof this.repo.upsertPermission>[0]); }
  async deletePermission(id: number) { await this.repo.deletePermission(id); return { ok: true }; }

  // ─── Import / Export ──────────────────────────────────────────────────────
  async exportJson(landId: number) { return this.exporter.exportJson(landId); }
  async exportTemplate(landId: number, userId: number) { return this.exporter.exportTemplate(landId, userId); }
  async exportPackage(landId: number, userId: number) { return this.exporter.exportPackage(landId, userId); }
  async importJson(landId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importJson(landId, payload, userId); }
  async importTemplate(landId: number, templateId: number, userId: number) { return this.importer.importTemplate(landId, templateId, userId); }
  async importPackage(landId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importPackage(landId, payload, userId); }
  async listExports(landId: number) { return this.repo.listExports(landId); }
  async listImports(landId: number) { return this.repo.listImports(landId); }

  // ─── Validation ───────────────────────────────────────────────────────────
  async validate(landId: number) { return this.validator.validate(landId); }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async startStreaming(landId: number) { return this.runtime.startStreaming(landId); }
  async stopStreaming(landId: number) { return this.runtime.stopStreaming(landId); }
  async getRuntimeStatus(landId: number) { return this.runtime.getStatus(landId); }
  async loadChunk(landId: number, chunkId: number) { return this.runtime.loadChunk(landId, chunkId); }
  async unloadChunk(landId: number, chunkId: number) { return this.runtime.unloadChunk(landId, chunkId); }
  async simulateTick(landId: number) { return this.runtime.simulateTick(landId); }
  async previewRuntime(landId: number) { return this.runtime.previewRuntime(landId); }
  async syncOwnership(landId: number) { return this.runtime.syncOwnership(landId); }
  async validateZones(landId: number) { return this.runtime.validateZones(landId); }
  async runTrafficFlow(landId: number) { return this.runtime.runTrafficFlow(landId); }
  async marketplaceSync(landId: number) { return this.runtime.marketplaceSync(landId); }
  async constructionTick(landId: number) { return this.runtime.constructionTick(landId); }
}
