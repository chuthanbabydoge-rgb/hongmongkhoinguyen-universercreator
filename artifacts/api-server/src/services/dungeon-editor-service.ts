import { DrizzleDungeonRepository } from "../repositories/dungeon-repository";
import { DungeonValidator } from "./dungeon-validator";
import { DungeonExporter } from "./dungeon-exporter";
import { DungeonImporter } from "./dungeon-importer";
import { DungeonRuntimeBridge } from "./dungeon-runtime-bridge";
import type { InsertDungeon } from "@workspace/db/schema";

const repo = new DrizzleDungeonRepository();
const validator = new DungeonValidator(repo);
const exporter = new DungeonExporter(repo);
const importer = new DungeonImporter(repo);
const bridge = new DungeonRuntimeBridge(repo);

export class DungeonEditorService {

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  getDashboard(userId: number) { return repo.getDashboard(userId); }

  // ─── Dungeon Lifecycle ──────────────────────────────────────────────────────

  listDungeons(userId: number, limit = 20, offset = 0, search?: string) {
    return repo.listDungeons(userId, limit, offset, search);
  }

  async createDungeon(userId: number, data: Partial<InsertDungeon>) {
    const dungeon = await repo.createDungeon({ ...data, createdBy: userId, name: data.name ?? "New Dungeon" });
    await repo.addHistory({ dungeonId: dungeon.id, action: "created", changedBy: userId });
    return dungeon;
  }

  getDungeon(id: number) { return repo.getDungeon(id); }
  getFullDungeon(id: number) { return repo.getFullDungeon(id); }

  async updateDungeon(id: number, userId: number, data: Partial<InsertDungeon>) {
    const dungeon = await repo.updateDungeon(id, data);
    await repo.addHistory({ dungeonId: id, action: "updated", changedBy: userId });
    return dungeon;
  }

  async duplicateDungeon(id: number, userId: number) {
    const full = await repo.getFullDungeon(id);
    if (!full.dungeon) throw new Error("Dungeon not found");
    const { id: _id, createdAt: _ca, updatedAt: _ua, description, metadata, ...rest } = full.dungeon;
    const newDungeon = await repo.createDungeon({ ...rest, createdBy: userId, name: `${full.dungeon.name} (Copy)`, isPublished: false, description: description ?? undefined, metadata: metadata as any });
    const newId = newDungeon.id;
    await Promise.all([
      ...full.rooms.map(({ id: _id, dungeonId: _d, createdAt: _ca, updatedAt: _ua, ...r }) => repo.createRoom({ ...r, dungeonId: newId })),
      ...full.connections.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...c }) => repo.createConnection({ ...c, dungeonId: newId })),
      ...full.spawnpoints.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...s }) => repo.createSpawnpoint({ ...s, dungeonId: newId })),
      ...full.bosses.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...b }) => repo.createBoss({ ...b, dungeonId: newId })),
      ...full.monsters.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...m }) => repo.createMonster({ ...m, dungeonId: newId })),
      ...full.traps.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...t }) => repo.createTrap({ ...t, dungeonId: newId })),
      ...full.puzzles.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...p }) => repo.createPuzzle({ ...p, dungeonId: newId })),
      ...full.rewards.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...r }) => repo.createReward({ ...r, dungeonId: newId })),
      ...full.checkpoints.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...c }) => repo.createCheckpoint({ ...c, dungeonId: newId })),
      ...full.requirements.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...r }) => repo.createRequirement({ ...r, dungeonId: newId })),
      ...full.events.map(({ id: _id, dungeonId: _d, createdAt: _ca, ...e }) => repo.createEvent({ ...e, dungeonId: newId })),
      ...full.scripts.map(({ id: _id, dungeonId: _d, createdAt: _ca, updatedAt: _ua, ...s }) => repo.createScript({ ...s, dungeonId: newId })),
    ]);
    await repo.addHistory({ dungeonId: newId, action: "duplicated_from", field: "sourceId", newValue: String(id), changedBy: userId });
    return newDungeon;
  }

  async forkDungeon(id: number, userId: number) { return this.duplicateDungeon(id, userId); }

  async publishDungeon(id: number, userId: number) {
    const dungeon = await repo.updateDungeon(id, { isPublished: true, status: "published" });
    await repo.addHistory({ dungeonId: id, action: "published", changedBy: userId });
    return dungeon;
  }

  async archiveDungeon(id: number, userId: number) {
    const dungeon = await repo.updateDungeon(id, { isArchived: true, status: "archived" });
    await repo.addHistory({ dungeonId: id, action: "archived", changedBy: userId });
    return dungeon;
  }

  async restoreDungeon(id: number, userId: number) {
    const dungeon = await repo.updateDungeon(id, { isArchived: false, status: "draft" });
    await repo.addHistory({ dungeonId: id, action: "restored", changedBy: userId });
    return dungeon;
  }

  async deleteDungeon(id: number) { return repo.deleteDungeon(id); }

  // ─── Templates ──────────────────────────────────────────────────────────────

  listTemplates(userId: number) { return repo.listTemplates(userId); }
  getGlobalTemplates() { return repo.getGlobalTemplates(); }
  createTemplate(data: typeof import("@workspace/db/schema").creatorDungeonTemplates.$inferInsert) { return repo.createTemplate(data); }

  // ─── Sub-resources ──────────────────────────────────────────────────────────

  getRooms(dungeonId: number) { return repo.getRooms(dungeonId); }
  createRoom(data: typeof import("@workspace/db/schema").creatorDungeonRooms.$inferInsert) { return repo.createRoom(data); }
  updateRoom(id: number, data: Parameters<typeof repo.updateRoom>[1]) { return repo.updateRoom(id, data); }
  deleteRoom(id: number) { return repo.deleteRoom(id); }

  getConnections(dungeonId: number) { return repo.getConnections(dungeonId); }
  createConnection(data: typeof import("@workspace/db/schema").creatorDungeonConnections.$inferInsert) { return repo.createConnection(data); }
  updateConnection(id: number, data: Parameters<typeof repo.updateConnection>[1]) { return repo.updateConnection(id, data); }
  deleteConnection(id: number) { return repo.deleteConnection(id); }

  getSpawnpoints(dungeonId: number) { return repo.getSpawnpoints(dungeonId); }
  createSpawnpoint(data: typeof import("@workspace/db/schema").creatorDungeonSpawnpoints.$inferInsert) { return repo.createSpawnpoint(data); }
  updateSpawnpoint(id: number, data: Parameters<typeof repo.updateSpawnpoint>[1]) { return repo.updateSpawnpoint(id, data); }
  deleteSpawnpoint(id: number) { return repo.deleteSpawnpoint(id); }

  getBosses(dungeonId: number) { return repo.getBosses(dungeonId); }
  createBoss(data: typeof import("@workspace/db/schema").creatorDungeonBosses.$inferInsert) { return repo.createBoss(data); }
  updateBoss(id: number, data: Parameters<typeof repo.updateBoss>[1]) { return repo.updateBoss(id, data); }
  deleteBoss(id: number) { return repo.deleteBoss(id); }

  getMonsters(dungeonId: number) { return repo.getMonsters(dungeonId); }
  createMonster(data: typeof import("@workspace/db/schema").creatorDungeonMonsters.$inferInsert) { return repo.createMonster(data); }
  updateMonster(id: number, data: Parameters<typeof repo.updateMonster>[1]) { return repo.updateMonster(id, data); }
  deleteMonster(id: number) { return repo.deleteMonster(id); }

  getTraps(dungeonId: number) { return repo.getTraps(dungeonId); }
  createTrap(data: typeof import("@workspace/db/schema").creatorDungeonTraps.$inferInsert) { return repo.createTrap(data); }
  updateTrap(id: number, data: Parameters<typeof repo.updateTrap>[1]) { return repo.updateTrap(id, data); }
  deleteTrap(id: number) { return repo.deleteTrap(id); }

  getPuzzles(dungeonId: number) { return repo.getPuzzles(dungeonId); }
  createPuzzle(data: typeof import("@workspace/db/schema").creatorDungeonPuzzles.$inferInsert) { return repo.createPuzzle(data); }
  updatePuzzle(id: number, data: Parameters<typeof repo.updatePuzzle>[1]) { return repo.updatePuzzle(id, data); }
  deletePuzzle(id: number) { return repo.deletePuzzle(id); }

  getRewards(dungeonId: number) { return repo.getRewards(dungeonId); }
  createReward(data: typeof import("@workspace/db/schema").creatorDungeonRewards.$inferInsert) { return repo.createReward(data); }
  updateReward(id: number, data: Parameters<typeof repo.updateReward>[1]) { return repo.updateReward(id, data); }
  deleteReward(id: number) { return repo.deleteReward(id); }

  getCheckpoints(dungeonId: number) { return repo.getCheckpoints(dungeonId); }
  createCheckpoint(data: typeof import("@workspace/db/schema").creatorDungeonCheckpoints.$inferInsert) { return repo.createCheckpoint(data); }
  updateCheckpoint(id: number, data: Parameters<typeof repo.updateCheckpoint>[1]) { return repo.updateCheckpoint(id, data); }
  deleteCheckpoint(id: number) { return repo.deleteCheckpoint(id); }

  getRequirements(dungeonId: number) { return repo.getRequirements(dungeonId); }
  createRequirement(data: typeof import("@workspace/db/schema").creatorDungeonRequirements.$inferInsert) { return repo.createRequirement(data); }
  updateRequirement(id: number, data: Parameters<typeof repo.updateRequirement>[1]) { return repo.updateRequirement(id, data); }
  deleteRequirement(id: number) { return repo.deleteRequirement(id); }

  getEvents(dungeonId: number) { return repo.getEvents(dungeonId); }
  createEvent(data: typeof import("@workspace/db/schema").creatorDungeonEvents.$inferInsert) { return repo.createEvent(data); }
  updateEvent(id: number, data: Parameters<typeof repo.updateEvent>[1]) { return repo.updateEvent(id, data); }
  deleteEvent(id: number) { return repo.deleteEvent(id); }

  getScripts(dungeonId: number) { return repo.getScripts(dungeonId); }
  createScript(data: typeof import("@workspace/db/schema").creatorDungeonScripts.$inferInsert) { return repo.createScript(data); }
  updateScript(id: number, data: Parameters<typeof repo.updateScript>[1]) { return repo.updateScript(id, data); }
  deleteScript(id: number) { return repo.deleteScript(id); }

  // ─── Versions & History ─────────────────────────────────────────────────────

  getVersions(dungeonId: number) { return repo.getVersions(dungeonId); }
  getVersion(id: number) { return repo.getVersion(id); }

  async createVersion(dungeonId: number, userId: number, label?: string, changelog?: string) {
    const full = await repo.getFullDungeon(dungeonId);
    const versions = await repo.getVersions(dungeonId);
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    return repo.createVersion({ dungeonId, version: nextVersion, label, changelog, snapshot: full as unknown as Record<string, unknown>, createdBy: userId });
  }

  getHistory(dungeonId: number, limit?: number) { return repo.getHistory(dungeonId, limit); }

  // ─── Statistics ─────────────────────────────────────────────────────────────

  getStatistics(dungeonId: number) { return repo.getStatistics(dungeonId); }
  upsertStatistics(dungeonId: number, data: Parameters<typeof repo.upsertStatistics>[1]) { return repo.upsertStatistics(dungeonId, data); }

  // ─── Import/Export ──────────────────────────────────────────────────────────

  async exportDungeon(dungeonId: number, type: string, userId: number) {
    let result: { payload: Record<string, unknown>; checksum: string };
    if (type === "template") result = await exporter.exportTemplate(dungeonId);
    else if (type === "package") result = await exporter.exportPackage(dungeonId);
    else result = await exporter.exportJson(dungeonId);
    await repo.createExport({ dungeonId, exportType: type, payload: result.payload, checksum: result.checksum, exportedBy: userId });
    return result;
  }

  async importDungeon(userId: number, type: string, data: Record<string, unknown>) {
    let dungeon;
    if (type === "template") dungeon = await importer.importTemplate(userId, data);
    else if (type === "package") dungeon = await importer.importPackage(userId, data);
    else dungeon = await importer.importJson(userId, data);
    await repo.createImport({ dungeonId: dungeon.id, importType: type, sourceData: data, importedBy: userId, status: "success" });
    return dungeon;
  }

  getExports(dungeonId: number) { return repo.getExports(dungeonId); }
  getImports(dungeonId: number) { return repo.getImports(dungeonId); }

  // ─── Validation ─────────────────────────────────────────────────────────────

  validate(dungeonId: number) { return validator.validate(dungeonId); }

  // ─── Runtime Simulation ─────────────────────────────────────────────────────

  previewDungeon(dungeonId: number) { return bridge.previewDungeon(dungeonId); }
  simulateRun(dungeonId: number, partySize: number) { return bridge.simulateRun(dungeonId, partySize); }
  simulateBoss(dungeonId: number, bossId: number) { return bridge.simulateBoss(dungeonId, bossId); }
  simulateSpawn(dungeonId: number, roomId: number) { return bridge.simulateSpawn(dungeonId, roomId); }
  simulatePuzzle(dungeonId: number, puzzleId: number) { return bridge.simulatePuzzle(dungeonId, puzzleId); }
  simulateTrap(dungeonId: number, trapId: number) { return bridge.simulateTrap(dungeonId, trapId); }
  simulateLoot(dungeonId: number) { return bridge.simulateLoot(dungeonId); }
  simulateCheckpoint(dungeonId: number, checkpointId: number) { return bridge.simulateCheckpoint(dungeonId, checkpointId); }
  simulateRespawn(dungeonId: number, checkpointId?: number) { return bridge.simulateRespawn(dungeonId, checkpointId); }
  resetDungeon(dungeonId: number) { return bridge.resetDungeon(dungeonId); }
}
