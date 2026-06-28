import { BuildingRepository } from "../repositories/building-repository";
import { BuildingValidator } from "./building-validator";
import { BuildingExporter } from "./building-exporter";
import { BuildingImporter } from "./building-importer";
import { BuildingRuntimeBridge } from "./building-runtime-bridge";

export class BuildingEditorService {
  private repo = new BuildingRepository();
  private validator = new BuildingValidator();
  private exporter = new BuildingExporter();
  private importer = new BuildingImporter();
  private runtime = new BuildingRuntimeBridge();

  // ─── Dashboard ────────────────────────────────────────────────────────────
  async getDashboard(userId: number) {
    const [buildings, total] = await Promise.all([
      this.repo.list(userId, 5, 0),
      this.repo.count(userId),
    ]);
    return { buildings, total, recentCount: buildings.length };
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async listBuildings(userId: number, limit = 20, offset = 0, search?: string) {
    const [items, total] = await Promise.all([
      this.repo.list(userId, limit, offset, search),
      this.repo.count(userId),
    ]);
    return { items, total, limit, offset };
  }

  async getBuilding(id: number) {
    const b = await this.repo.get(id);
    if (!b) throw new Error("Building not found");
    return b;
  }

  async getFullBuilding(id: number) {
    const b = await this.repo.getFull(id);
    if (!b.building) throw new Error("Building not found");
    return b;
  }

  async createBuilding(userId: number, data: Record<string, unknown>) {
    const building = await this.repo.create({ ...data, createdBy: userId } as Parameters<typeof this.repo.create>[0]);
    await Promise.all([
      this.repo.upsertStatistics(building.id, {}),
      this.repo.upsertSecurity(building.id, {}),
      this.repo.addHistory(building.id, "created", userId),
    ]);
    const floor = await this.repo.createFloor({ buildingId: building.id, floorNumber: 0, name: "Ground Floor", height: 3, ceilingHeight: 3 });
    return { ...building, floors: [floor] };
  }

  async updateBuilding(id: number, userId: number, data: Record<string, unknown>) {
    const b = await this.repo.update(id, data as Parameters<typeof this.repo.update>[1]);
    await this.repo.addHistory(id, "updated", userId);
    return b;
  }

  async deleteBuilding(id: number, userId: number) {
    await this.repo.addHistory(id, "deleted", userId);
    await this.repo.delete(id);
    return { ok: true };
  }

  async duplicateBuilding(id: number, userId: number) {
    const orig = await this.repo.get(id);
    if (!orig) throw new Error("Building not found");
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = orig;
    const copy = await this.repo.create({ ...rest, createdBy: userId, name: `${orig.name} (Copy)`, isPublished: false, version: 1 });
    await this.repo.addHistory(copy.id, "duplicated_from", userId, "building", id);
    return copy;
  }

  async forkBuilding(id: number, userId: number) {
    const orig = await this.repo.get(id);
    if (!orig) throw new Error("Building not found");
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = orig;
    const fork = await this.repo.create({ ...rest, createdBy: userId, name: `${orig.name} (Fork)`, isPublished: false, isTemplate: false, version: 1 });
    await this.repo.addHistory(fork.id, "forked_from", userId, "building", id);
    return fork;
  }

  async publishBuilding(id: number, userId: number) {
    const b = await this.repo.update(id, { isPublished: true });
    await this.repo.addHistory(id, "published", userId);
    return b;
  }

  async archiveBuilding(id: number, userId: number) {
    const b = await this.repo.update(id, { isArchived: true, buildingStatus: "archived" });
    await this.repo.addHistory(id, "archived", userId);
    return b;
  }

  async restoreBuilding(id: number, userId: number) {
    const b = await this.repo.update(id, { isArchived: false, buildingStatus: "draft" });
    await this.repo.addHistory(id, "restored", userId);
    return b;
  }

  async createSnapshot(id: number, userId: number, label: string) {
    const full = await this.repo.getFull(id);
    const building = await this.repo.get(id);
    const v = await this.repo.createVersion({ buildingId: id, version: (building?.version ?? 1), label, snapshot: full as Record<string, unknown>, createdBy: userId });
    await this.repo.update(id, { version: (building?.version ?? 1) + 1 });
    return v;
  }

  // ─── Floors ───────────────────────────────────────────────────────────────
  async listFloors(buildingId: number) { return this.repo.listFloors(buildingId); }
  async createFloor(buildingId: number, data: Record<string, unknown>) { return this.repo.createFloor({ ...data, buildingId } as Parameters<typeof this.repo.createFloor>[0]); }
  async getFloor(id: number) { return this.repo.getFloor(id); }
  async updateFloor(id: number, data: Record<string, unknown>) { return this.repo.updateFloor(id, data as Parameters<typeof this.repo.updateFloor>[1]); }
  async deleteFloor(id: number) { await this.repo.deleteFloor(id); return { ok: true }; }

  // ─── Rooms ────────────────────────────────────────────────────────────────
  async listRooms(buildingId: number) { return this.repo.listRooms(buildingId); }
  async createRoom(buildingId: number, data: Record<string, unknown>) { return this.repo.createRoom({ ...data, buildingId } as Parameters<typeof this.repo.createRoom>[0]); }
  async getRoom(id: number) { return this.repo.getRoom(id); }
  async updateRoom(id: number, data: Record<string, unknown>) { return this.repo.updateRoom(id, data as Parameters<typeof this.repo.updateRoom>[1]); }
  async deleteRoom(id: number) { await this.repo.deleteRoom(id); return { ok: true }; }

  // ─── Doors ────────────────────────────────────────────────────────────────
  async listDoors(buildingId: number) { return this.repo.listDoors(buildingId); }
  async createDoor(buildingId: number, data: Record<string, unknown>) { return this.repo.createDoor({ ...data, buildingId } as Parameters<typeof this.repo.createDoor>[0]); }
  async getDoor(id: number) { return this.repo.getDoor(id); }
  async updateDoor(id: number, data: Record<string, unknown>) { return this.repo.updateDoor(id, data as Parameters<typeof this.repo.updateDoor>[1]); }
  async deleteDoor(id: number) { await this.repo.deleteDoor(id); return { ok: true }; }

  // ─── Windows ──────────────────────────────────────────────────────────────
  async listWindows(buildingId: number) { return this.repo.listWindows(buildingId); }
  async createWindow(buildingId: number, data: Record<string, unknown>) { return this.repo.createWindow({ ...data, buildingId } as Parameters<typeof this.repo.createWindow>[0]); }
  async getWindow(id: number) { return this.repo.getWindow(id); }
  async updateWindow(id: number, data: Record<string, unknown>) { return this.repo.updateWindow(id, data as Parameters<typeof this.repo.updateWindow>[1]); }
  async deleteWindow(id: number) { await this.repo.deleteWindow(id); return { ok: true }; }

  // ─── Furniture ────────────────────────────────────────────────────────────
  async listFurniture(buildingId: number) { return this.repo.listFurniture(buildingId); }
  async createFurniture(buildingId: number, data: Record<string, unknown>) { return this.repo.createFurniture({ ...data, buildingId } as Parameters<typeof this.repo.createFurniture>[0]); }
  async getFurniture(id: number) { return this.repo.getFurniture(id); }
  async updateFurniture(id: number, data: Record<string, unknown>) { return this.repo.updateFurniture(id, data as Parameters<typeof this.repo.updateFurniture>[1]); }
  async deleteFurniture(id: number) { await this.repo.deleteFurniture(id); return { ok: true }; }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(buildingId: number) { return this.repo.listUtilities(buildingId); }
  async createUtility(buildingId: number, data: Record<string, unknown>) { return this.repo.createUtility({ ...data, buildingId } as Parameters<typeof this.repo.createUtility>[0]); }
  async getUtility(id: number) { return this.repo.getUtility(id); }
  async updateUtility(id: number, data: Record<string, unknown>) { return this.repo.updateUtility(id, data as Parameters<typeof this.repo.updateUtility>[1]); }
  async deleteUtility(id: number) { await this.repo.deleteUtility(id); return { ok: true }; }

  // ─── NPCs ─────────────────────────────────────────────────────────────────
  async listNpcs(buildingId: number) { return this.repo.listNpcs(buildingId); }
  async createNpc(buildingId: number, data: Record<string, unknown>) { return this.repo.createNpc({ ...data, buildingId } as Parameters<typeof this.repo.createNpc>[0]); }
  async getNpc(id: number) { return this.repo.getNpc(id); }
  async updateNpc(id: number, data: Record<string, unknown>) { return this.repo.updateNpc(id, data as Parameters<typeof this.repo.updateNpc>[1]); }
  async deleteNpc(id: number) { await this.repo.deleteNpc(id); return { ok: true }; }

  // ─── Permissions ──────────────────────────────────────────────────────────
  async listPermissions(buildingId: number) { return this.repo.listPermissions(buildingId); }
  async createPermission(buildingId: number, data: Record<string, unknown>) { return this.repo.createPermission({ ...data, buildingId } as Parameters<typeof this.repo.createPermission>[0]); }
  async updatePermission(id: number, data: Record<string, unknown>) { return this.repo.updatePermission(id, data as Parameters<typeof this.repo.updatePermission>[1]); }
  async deletePermission(id: number) { await this.repo.deletePermission(id); return { ok: true }; }

  // ─── Security ─────────────────────────────────────────────────────────────
  async getSecurity(buildingId: number) { return this.repo.getSecurity(buildingId); }
  async updateSecurity(buildingId: number, data: Record<string, unknown>) { return this.repo.upsertSecurity(buildingId, data as Parameters<typeof this.repo.upsertSecurity>[1]); }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────
  async listSpawnpoints(buildingId: number) { return this.repo.listSpawnpoints(buildingId); }
  async createSpawnpoint(buildingId: number, data: Record<string, unknown>) { return this.repo.createSpawnpoint({ ...data, buildingId } as Parameters<typeof this.repo.createSpawnpoint>[0]); }
  async updateSpawnpoint(id: number, data: Record<string, unknown>) { return this.repo.updateSpawnpoint(id, data as Parameters<typeof this.repo.updateSpawnpoint>[1]); }
  async deleteSpawnpoint(id: number) { await this.repo.deleteSpawnpoint(id); return { ok: true }; }

  // ─── Events ───────────────────────────────────────────────────────────────
  async listEvents(buildingId: number) { return this.repo.listEvents(buildingId); }
  async createEvent(buildingId: number, data: Record<string, unknown>) { return this.repo.createEvent({ ...data, buildingId } as Parameters<typeof this.repo.createEvent>[0]); }
  async updateEvent(id: number, data: Record<string, unknown>) { return this.repo.updateEvent(id, data as Parameters<typeof this.repo.updateEvent>[1]); }
  async deleteEvent(id: number) { await this.repo.deleteEvent(id); return { ok: true }; }

  // ─── Templates ────────────────────────────────────────────────────────────
  async getTemplates(global: boolean) { return this.repo.getTemplates(global); }
  async deleteTemplate(id: number) { await this.repo.deleteTemplate(id); return { ok: true }; }

  // ─── Versions / History ───────────────────────────────────────────────────
  async listVersions(buildingId: number) { return this.repo.listVersions(buildingId); }
  async listHistory(buildingId: number) { return this.repo.listHistory(buildingId); }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(buildingId: number) { return this.repo.getStatistics(buildingId); }

  // ─── Validation ───────────────────────────────────────────────────────────
  async validate(buildingId: number) { return this.validator.validate(buildingId); }

  // ─── Export ───────────────────────────────────────────────────────────────
  async exportJson(id: number, userId: number) { return this.exporter.exportJson(id, userId); }
  async exportTemplate(id: number, name: string, description: string, userId: number) { return this.exporter.exportTemplate(id, name, description, userId); }
  async exportPackage(id: number, userId: number) { return this.exporter.exportPackage(id, userId); }
  async listExports(id: number) { return this.repo.listExports(id); }
  async listImports(id: number) { return this.repo.listImports(id); }

  // ─── Import ───────────────────────────────────────────────────────────────
  async importJson(buildingId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importJson(buildingId, payload, userId); }
  async importTemplate(buildingId: number, templateId: number, userId: number) { return this.importer.importTemplate(buildingId, templateId, userId); }
  async importPackage(buildingId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importPackage(buildingId, payload, userId); }

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  async listBookmarks(userId: number) { return this.repo.listBookmarks(userId); }
  async addBookmark(userId: number, buildingId: number, label?: string) { return this.repo.addBookmark(userId, buildingId, label); }
  async deleteBookmark(id: number) { await this.repo.deleteBookmark(id); return { ok: true }; }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async listRuntime(buildingId: number) { return this.repo.listRuntime(buildingId); }
  async startSimulation(buildingId: number) { return this.runtime.startSession(buildingId); }
  async stopSimulation(sessionId: string, userId: number) { return this.runtime.stopSession(sessionId, userId); }
  async openBuilding(sessionId: string) { return this.runtime.openBuilding(sessionId); }
  async closeBuilding(sessionId: string) { return this.runtime.closeBuilding(sessionId); }
  async setPower(sessionId: string, state: "on" | "off" | "emergency" | "backup" | "off_grid") { return this.runtime.setPower(sessionId, state); }
  async setWater(sessionId: string, on: boolean) { return this.runtime.setWater(sessionId, on); }
  async setLighting(sessionId: string, on: boolean) { return this.runtime.setLighting(sessionId, on); }
  async setSecurityLevel(sessionId: string, level: "none" | "basic" | "standard" | "high" | "maximum") { return this.runtime.setSecurityLevel(sessionId, level); }
  async triggerEmergency(sessionId: string, type: string) { return this.runtime.triggerEmergency(sessionId, type); }
  async spawnVisitors(sessionId: string, count: number) { return this.runtime.spawnVisitors(sessionId, count); }
  async tickSimulation(sessionId: string) { return this.runtime.tickSimulation(sessionId); }
  async streamBuilding(buildingId: number) { return this.runtime.streamBuilding(buildingId); }
}
