import { worldSystemRepo } from "../repositories/world-system-repository";

interface SimulationResult {
  worldInstanceId: number;
  sessionId: string;
  simulatedAt: string;
  [key: string]: unknown;
}

export class WorldRuntimeEngine {
  // WorldManager
  async getWorldState(worldId: number, sessionId: string) {
    const [world, runtime, weather, daynight, players, npcs] = await Promise.all([
      worldSystemRepo.getWorld(worldId),
      worldSystemRepo.getRuntime(worldId, sessionId),
      worldSystemRepo.getWeather(worldId),
      worldSystemRepo.getDayNight(worldId),
      worldSystemRepo.listPlayers(worldId),
      worldSystemRepo.listNpcs(worldId),
    ]);
    return { world, runtime, weather, daynight, players, npcs };
  }

  // ChunkManager
  async loadChunk(worldId: number, chunkX: number, chunkY: number, chunkZ = 0) {
    const chunk = await worldSystemRepo.upsertChunk({
      worldInstanceId: worldId,
      chunkX,
      chunkY,
      chunkZ,
      chunkState: "loading",
      loadedAt: new Date(),
      lastAccessedAt: new Date(),
    });
    // Simulate loading
    const loaded = await worldSystemRepo.updateChunkState(chunk.id, "loaded");
    await worldSystemRepo.upsertStatistics(worldId, { totalChunksLoaded: 1 });
    return loaded;
  }

  async unloadChunk(worldId: number, chunkX: number, chunkY: number) {
    const chunks = await worldSystemRepo.listChunks(worldId);
    const chunk = chunks.find(c => c.chunkX === chunkX && c.chunkY === chunkY);
    if (!chunk) return null;
    return worldSystemRepo.updateChunkState(chunk.id, "unloaded");
  }

  // StreamingManager
  async updateStreaming(worldId: number, sessionId: string, data: {
    loadedChunks: number;
    activeChunks: number;
    totalChunks: number;
    memoryUsageMb: number;
    streamLatencyMs: number;
    bandwidthKbps: number;
    cacheHitRate: number;
  }) {
    return worldSystemRepo.recordStreaming({
      worldInstanceId: worldId,
      sessionId,
      ...data,
      streamMode: "distance",
    });
  }

  // WeatherManager
  async changeWeather(worldId: number, weather: string, transitionDuration = 60) {
    const current = await worldSystemRepo.getWeather(worldId);
    const updated = await worldSystemRepo.upsertWeather(worldId, {
      nextWeather: current?.currentWeather as any,
      currentWeather: weather as any,
      transitionDuration,
      isManualOverride: true,
      updatedAt: new Date(),
    });
    await worldSystemRepo.upsertStatistics(worldId, { totalWeatherChanges: 1 });
    return updated;
  }

  async forecastWeather(worldId: number) {
    const weatherTypes = ["sunny", "cloudy", "rain", "storm", "snow", "fog", "wind"];
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      hour: i * 3,
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
      intensity: Math.random(),
      temperature: 15 + Math.random() * 20,
    }));
    await worldSystemRepo.upsertWeather(worldId, { forecast });
    return forecast;
  }

  async simulateWeather(worldId: number) {
    const weathers: string[] = ["sunny", "cloudy", "rain", "storm", "snow", "fog"];
    const next = weathers[Math.floor(Math.random() * weathers.length)];
    return { nextWeather: next, estimatedTransitionIn: Math.floor(Math.random() * 3600), intensity: Math.random() };
  }

  // DayNightManager
  async setTime(worldId: number, hour: number) {
    const cycles = [
      { name: "sunrise", start: 5 }, { name: "morning", start: 6 }, { name: "noon", start: 11 },
      { name: "afternoon", start: 13 }, { name: "evening", start: 16 }, { name: "sunset", start: 18 },
      { name: "night", start: 20 }, { name: "midnight", start: 0 },
    ];
    const cycle = [...cycles].reverse().find(c => hour >= c.start) ?? cycles[7];
    return worldSystemRepo.upsertDayNight(worldId, { currentHour: hour, currentCycle: cycle.name as any });
  }

  async pauseTime(worldId: number) {
    return worldSystemRepo.upsertDayNight(worldId, { isPaused: true });
  }

  async resumeTime(worldId: number) {
    return worldSystemRepo.upsertDayNight(worldId, { isPaused: false });
  }

  async setTimeScale(worldId: number, scale: number) {
    return worldSystemRepo.upsertDayNight(worldId, { timeScale: scale });
  }

  // PortalManager
  async traversePortal(worldId: number, portalId: number, playerId: number) {
    const portals = await worldSystemRepo.listPortals(worldId);
    const portal = portals.find(p => p.id === portalId);
    if (!portal) throw new Error("Portal not found");
    if (!portal.isActive) throw new Error("Portal is inactive");
    await worldSystemRepo.upsertStatistics(worldId, { totalPortalTraversals: 1 });
    return {
      portal,
      destination: {
        worldInstanceId: portal.toWorldInstanceId,
        dungeonRef: portal.toDungeonRef,
        x: portal.toX,
        y: portal.toY,
        z: portal.toZ,
      },
      playerId,
      traversedAt: new Date().toISOString(),
    };
  }

  // SpawnManager
  async spawnEntity(worldId: number, entityType: string, entityRef: string, spawnpointId?: number) {
    const spawnpoints = await worldSystemRepo.listSpawnpoints(worldId);
    const spawnpoint = spawnpointId ? spawnpoints.find(s => s.id === spawnpointId) : spawnpoints.find(s => s.spawnType === entityType && s.isActive);

    if (entityType === "npc" || entityType === "boss") {
      return worldSystemRepo.createNpc({
        worldInstanceId: worldId,
        sessionId: `spawn_${Date.now()}`,
        npcRef: entityRef,
        spawnpointId: spawnpoint?.id ?? null as any,
        positionX: spawnpoint?.positionX ?? 0,
        positionY: spawnpoint?.positionY ?? 0,
        positionZ: spawnpoint?.positionZ ?? 0,
        currentHp: 100,
        maxHp: 100,
        aiState: "idle",
      });
    }
    return { entityType, entityRef, spawnpointId: spawnpoint?.id, spawnedAt: new Date().toISOString() };
  }

  async respawnEntity(worldId: number, npcId: number) {
    return worldSystemRepo.updateNpc(npcId, { isAlive: true, currentHp: 100, aiState: "idle" });
  }

  // CheckpointManager
  async createCheckpoint(worldId: number, sessionId: string, label: string, userId: number) {
    const daynight = await worldSystemRepo.getDayNight(worldId);
    const players = await worldSystemRepo.listPlayers(worldId);
    const checkpoint = await worldSystemRepo.createCheckpoint({
      worldInstanceId: worldId,
      sessionId,
      label,
      isAutoSave: false,
      triggeredBy: `user:${userId}`,
    });
    await worldSystemRepo.upsertStatistics(worldId, { totalCheckpointsSaved: 1 });
    return { checkpoint, worldHour: daynight?.currentHour, activePlayers: players.length };
  }

  async rollbackToCheckpoint(worldId: number, checkpointId: number, userId: number) {
    const checkpoints = await worldSystemRepo.listCheckpoints(worldId);
    const checkpoint = checkpoints.find(c => c.id === checkpointId);
    if (!checkpoint) throw new Error("Checkpoint not found");
    await worldSystemRepo.addHistory({ worldInstanceId: worldId, action: "rollback_to_checkpoint", newValue: String(checkpointId), changedBy: userId });
    return { checkpoint, rolledBackAt: new Date().toISOString() };
  }

  // EventManager
  async triggerEvent(worldId: number, eventId: number) {
    const events = await worldSystemRepo.listEvents(worldId);
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error("Event not found");
    await worldSystemRepo.updateEvent(eventId, { lastTriggeredAt: new Date() });
    await worldSystemRepo.upsertStatistics(worldId, { totalEventsTriggered: 1 });
    return { event, triggeredAt: new Date().toISOString() };
  }

  // Simulation
  async simulateDay(worldId: number): Promise<SimulationResult> {
    const daynight = await worldSystemRepo.getDayNight(worldId);
    const events: { hour: number; cycle: string; description: string }[] = [];
    const cycles = [
      { hour: 5, cycle: "sunrise", description: "Sun rises" },
      { hour: 8, cycle: "morning", description: "Morning activities begin" },
      { hour: 12, cycle: "noon", description: "Midday peak" },
      { hour: 16, cycle: "evening", description: "Evening wind-down" },
      { hour: 18, cycle: "sunset", description: "Sun sets" },
      { hour: 21, cycle: "night", description: "Night falls" },
    ];
    events.push(...cycles);
    return { worldInstanceId: worldId, sessionId: `sim_${Date.now()}`, simulatedAt: new Date().toISOString(), dayLengthSeconds: daynight?.dayLengthSeconds, events, cyclesSimulated: cycles.length };
  }

  async simulateStreaming(worldId: number): Promise<SimulationResult> {
    const totalChunks = 64;
    const loadedChunks = Math.floor(totalChunks * 0.4);
    const cacheHitRate = 0.75 + Math.random() * 0.2;
    return {
      worldInstanceId: worldId,
      sessionId: `stream_sim_${Date.now()}`,
      simulatedAt: new Date().toISOString(),
      totalChunks,
      loadedChunks,
      activeChunks: Math.floor(loadedChunks * 0.6),
      cacheHitRate,
      memoryUsageMb: loadedChunks * 2.5,
      streamLatencyMs: 12 + Math.random() * 20,
      bandwidthKbps: 800 + Math.random() * 400,
    };
  }

  async simulatePortal(worldId: number): Promise<SimulationResult> {
    const portals = await worldSystemRepo.listPortals(worldId);
    const active = portals.filter(p => p.isActive);
    return {
      worldInstanceId: worldId,
      sessionId: `portal_sim_${Date.now()}`,
      simulatedAt: new Date().toISOString(),
      totalPortals: portals.length,
      activePortals: active.length,
      estimatedTraversalTime: 2.5,
      portalLoadMs: 150 + Math.random() * 100,
    };
  }

  async simulateRespawn(worldId: number): Promise<SimulationResult> {
    const spawnpoints = await worldSystemRepo.listSpawnpoints(worldId);
    const active = spawnpoints.filter(s => s.isActive);
    return {
      worldInstanceId: worldId,
      sessionId: `respawn_sim_${Date.now()}`,
      simulatedAt: new Date().toISOString(),
      totalSpawnpoints: spawnpoints.length,
      activeSpawnpoints: active.length,
      estimatedRespawnDelay: active[0]?.respawnDelay ?? 30,
      spawnDistribution: active.reduce((acc, s) => { acc[s.spawnType] = (acc[s.spawnType] ?? 0) + 1; return acc; }, {} as Record<string, number>),
    };
  }

  async simulateCheckpoint(worldId: number): Promise<SimulationResult> {
    const checkpoints = await worldSystemRepo.listCheckpoints(worldId);
    return {
      worldInstanceId: worldId,
      sessionId: `cp_sim_${Date.now()}`,
      simulatedAt: new Date().toISOString(),
      totalCheckpoints: checkpoints.length,
      estimatedSaveTimeMs: 250 + Math.random() * 100,
      rollbackFeasible: checkpoints.length > 0,
      oldestCheckpoint: checkpoints[checkpoints.length - 1]?.createdAt,
    };
  }
}

export const worldRuntimeEngine = new WorldRuntimeEngine();
