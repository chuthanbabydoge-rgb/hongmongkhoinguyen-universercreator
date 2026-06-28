import { worldSystemRepo } from "../repositories/world-system-repository";
import crypto from "crypto";

export class WorldSystemService {
  async createWorld(data: Record<string, unknown>, userId: number) {
    const world = await worldSystemRepo.createWorld({
      name: data.name as string,
      description: data.description as string,
      projectId: data.projectId as number,
      worldEditorId: data.worldEditorId as number,
      maxPlayers: (data.maxPlayers as number) ?? 100,
      streamMode: (data.streamMode as any) ?? "distance",
      weatherEnabled: (data.weatherEnabled as boolean) ?? true,
      dayNightEnabled: (data.dayNightEnabled as boolean) ?? true,
      chunkSize: (data.chunkSize as number) ?? 16,
      viewDistance: (data.viewDistance as number) ?? 8,
      sizeX: (data.sizeX as number) ?? 1000,
      sizeY: (data.sizeY as number) ?? 1000,
      sizeZ: (data.sizeZ as number) ?? 100,
      tags: data.tags as string[],
      metadata: data.metadata as any,
      createdBy: userId,
    });
    await worldSystemRepo.addHistory({ worldInstanceId: world.id, action: "created", changedBy: userId });
    // Initialize subsystems
    await worldSystemRepo.upsertWeather(world.id, { currentWeather: "sunny", intensity: 1.0, windSpeed: 0 });
    await worldSystemRepo.upsertDayNight(world.id, { currentHour: 8, dayLengthSeconds: 1440, timeScale: 1.0 });
    await worldSystemRepo.upsertStatistics(world.id, {});
    return world;
  }

  async startWorld(worldId: number, userId: number) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const world = await worldSystemRepo.updateWorld(worldId, { runtimeState: "running" });
    const runtime = await worldSystemRepo.upsertRuntime(worldId, sessionId, {
      runtimeState: "running",
      startedAt: new Date(),
      tickRate: 20,
    });
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "world_started", changedBy: userId });
    await worldSystemRepo.upsertStatistics(worldId, { totalSessionsRun: 1 });
    return { world, runtime, sessionId };
  }

  async stopWorld(worldId: number, sessionId: string, userId: number) {
    const runtime = await worldSystemRepo.getRuntime(worldId, sessionId);
    const uptime = runtime?.startedAt ? Math.floor((Date.now() - runtime.startedAt.getTime()) / 1000) : 0;
    await worldSystemRepo.upsertRuntime(worldId, sessionId, { runtimeState: "offline", stoppedAt: new Date(), uptimeSeconds: uptime });
    const world = await worldSystemRepo.updateWorld(worldId, { runtimeState: "offline" });
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "world_stopped", changedBy: userId });
    return { world, uptime };
  }

  async duplicateWorld(worldId: number, userId: number) {
    const world = await worldSystemRepo.getWorld(worldId);
    if (!world) throw new Error("World not found");
    const copy = await worldSystemRepo.createWorld({ ...world, id: undefined as any, name: `${world.name} (Copy)`, runtimeState: "offline", isPublished: false, createdBy: userId, createdAt: new Date(), updatedAt: new Date() });
    await worldSystemRepo.addHistory({ worldInstanceId: copy.id, action: "duplicated_from", newValue: String(worldId), changedBy: userId });
    return copy;
  }

  async archiveWorld(worldId: number, userId: number) {
    const world = await worldSystemRepo.updateWorld(worldId, { isArchived: true, runtimeState: "offline" });
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "archived", changedBy: userId });
    return world;
  }

  async publishWorld(worldId: number, userId: number) {
    const world = await worldSystemRepo.getWorld(worldId);
    if (!world) throw new Error("World not found");
    const version = await worldSystemRepo.createVersion({ worldInstanceId: worldId, version: (world.version ?? 0) + 1, snapshot: world as any, changelog: "Published", createdBy: userId });
    const updated = await worldSystemRepo.updateWorld(worldId, { isPublished: true, version: (world.version ?? 0) + 1 });
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "published", newValue: String(version.version), changedBy: userId });
    return { world: updated, version };
  }

  async restoreWorld(worldId: number, versionId: number, userId: number) {
    const versions = await worldSystemRepo.listVersions(worldId);
    const version = versions.find(v => v.id === versionId);
    if (!version) throw new Error("Version not found");
    const snapshot = version.snapshot as Record<string, unknown>;
    const restored = await worldSystemRepo.updateWorld(worldId, { ...snapshot, id: worldId, updatedAt: new Date() } as any);
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "restored", newValue: String(versionId), changedBy: userId });
    return restored;
  }

  async exportWorld(worldId: number, userId: number) {
    const world = await worldSystemRepo.getWorld(worldId);
    if (!world) throw new Error("World not found");
    const regions = await worldSystemRepo.listRegions(worldId);
    const spawnpoints = await worldSystemRepo.listSpawnpoints(worldId);
    const portals = await worldSystemRepo.listPortals(worldId);
    const events = await worldSystemRepo.listEvents(worldId);
    const weather = await worldSystemRepo.getWeather(worldId);
    const daynight = await worldSystemRepo.getDayNight(worldId);
    const payload = { type: "world_system_export", version: 1, world, regions, spawnpoints, portals, events, weather, daynight };
    const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const exported = await worldSystemRepo.createExport({ worldInstanceId: worldId, exportType: "json", payload, checksum, exportedBy: userId });
    return { ...exported, payload };
  }

  async importWorld(worldId: number, payload: Record<string, unknown>, userId: number) {
    const errors: string[] = [];
    try {
      if (payload.type !== "world_system_export") errors.push("Invalid export type");
      if (!errors.length) {
        const worldData = payload.world as Record<string, unknown>;
        if (worldData) await worldSystemRepo.updateWorld(worldId, { name: worldData.name as string, description: worldData.description as string, metadata: worldData.metadata as any });
      }
    } catch (e) {
      errors.push((e as Error).message);
    }
    await worldSystemRepo.createImport({ worldInstanceId: worldId, importType: "json", sourceData: payload, importedBy: userId, status: errors.length ? "error" : "success", errors: errors.length ? errors : null });
    return { ok: !errors.length, errors };
  }

  async saveState(worldId: number, sessionId: string, userId: number, label?: string) {
    const world = await worldSystemRepo.getWorld(worldId);
    const weather = await worldSystemRepo.getWeather(worldId);
    const daynight = await worldSystemRepo.getDayNight(worldId);
    const checkpoint = await worldSystemRepo.createCheckpoint({
      worldInstanceId: worldId,
      sessionId,
      label: label ?? `Checkpoint ${Date.now()}`,
      worldStateId: null as any,
      isAutoSave: !label,
      triggeredBy: userId ? `user:${userId}` : "system",
    });
    const state = await worldSystemRepo.createState({
      worldInstanceId: worldId,
      stateName: label ?? `state_${Date.now()}`,
      stateData: { world },
      weatherSnapshot: weather as any,
      daynightSnapshot: daynight as any,
      savedBy: userId,
    });
    await worldSystemRepo.upsertStatistics(worldId, { totalCheckpointsSaved: 1 });
    return { checkpoint, state };
  }

  async validate(worldId: number) {
    const world = await worldSystemRepo.getWorld(worldId);
    if (!world) return { valid: false, issues: [{ field: "id", message: "World not found", severity: "error" }] };
    const issues: { field: string; message: string; severity: string }[] = [];
    if (!world.name) issues.push({ field: "name", message: "Name is required", severity: "error" });
    if (world.maxPlayers < 1) issues.push({ field: "maxPlayers", message: "Max players must be at least 1", severity: "error" });
    if (world.chunkSize < 8) issues.push({ field: "chunkSize", message: "Chunk size should be at least 8", severity: "warning" });
    if (!world.worldEditorId) issues.push({ field: "worldEditorId", message: "Not linked to a World Editor world", severity: "warning" });
    const portals = await worldSystemRepo.listPortals(worldId);
    const orphaned = portals.filter(p => !p.toWorldInstanceId && !p.toDungeonRef);
    if (orphaned.length) issues.push({ field: "portals", message: `${orphaned.length} portal(s) have no destination`, severity: "warning" });
    return { valid: !issues.some(i => i.severity === "error"), issues };
  }
}

export const worldSystemService = new WorldSystemService();
