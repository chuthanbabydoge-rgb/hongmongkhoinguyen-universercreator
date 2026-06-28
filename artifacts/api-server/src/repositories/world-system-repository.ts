import { db } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  creatorWorldInstances,
  creatorWorldChunks,
  creatorWorldRegions,
  creatorWorldStreaming,
  creatorWorldSpawnpoints,
  creatorWorldTeleports,
  creatorWorldWeather,
  creatorWorldDaynight,
  creatorWorldEvents,
  creatorWorldStates,
  creatorWorldCheckpoints,
  creatorWorldPortals,
  creatorWorldRuntime,
  creatorWorldPlayers,
  creatorWorldNpcs,
  creatorWorldStatistics,
  creatorWorldHistory,
  creatorWorldVersions,
  creatorWorldExports,
  creatorWorldImports,
} from "@workspace/db/schema";

export class WorldSystemRepository {
  // World Instances
  async listWorlds(limit = 50, offset = 0, filters: Record<string, unknown> = {}) {
    const conditions = [eq(creatorWorldInstances.isArchived, false)];
    if (filters.runtimeState) conditions.push(eq(creatorWorldInstances.runtimeState, filters.runtimeState as string));
    return db.select().from(creatorWorldInstances).where(and(...conditions)).limit(limit).offset(offset).orderBy(desc(creatorWorldInstances.updatedAt));
  }
  async countWorlds() {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(creatorWorldInstances);
    return Number(row.count);
  }
  async getWorld(id: number) {
    const [row] = await db.select().from(creatorWorldInstances).where(eq(creatorWorldInstances.id, id));
    return row ?? null;
  }
  async createWorld(data: typeof creatorWorldInstances.$inferInsert) {
    const [row] = await db.insert(creatorWorldInstances).values(data).returning();
    return row;
  }
  async updateWorld(id: number, data: Partial<typeof creatorWorldInstances.$inferInsert>) {
    const [row] = await db.update(creatorWorldInstances).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldInstances.id, id)).returning();
    return row;
  }
  async deleteWorld(id: number) {
    const [row] = await db.update(creatorWorldInstances).set({ isArchived: true, updatedAt: new Date() }).where(eq(creatorWorldInstances.id, id)).returning();
    return row;
  }

  // Chunks
  async listChunks(worldId: number) {
    return db.select().from(creatorWorldChunks).where(eq(creatorWorldChunks.worldInstanceId, worldId)).orderBy(desc(creatorWorldChunks.loadPriority));
  }
  async getChunk(id: number) {
    const [row] = await db.select().from(creatorWorldChunks).where(eq(creatorWorldChunks.id, id));
    return row ?? null;
  }
  async upsertChunk(data: typeof creatorWorldChunks.$inferInsert) {
    const [row] = await db.insert(creatorWorldChunks).values(data).onConflictDoUpdate({ target: creatorWorldChunks.id, set: { ...data, updatedAt: new Date() } }).returning();
    return row;
  }
  async updateChunkState(id: number, state: string) {
    const [row] = await db.update(creatorWorldChunks).set({ chunkState: state as any, updatedAt: new Date() }).where(eq(creatorWorldChunks.id, id)).returning();
    return row;
  }

  // Regions
  async listRegions(worldId: number) {
    return db.select().from(creatorWorldRegions).where(eq(creatorWorldRegions.worldInstanceId, worldId));
  }
  async getRegion(id: number) {
    const [row] = await db.select().from(creatorWorldRegions).where(eq(creatorWorldRegions.id, id));
    return row ?? null;
  }
  async createRegion(data: typeof creatorWorldRegions.$inferInsert) {
    const [row] = await db.insert(creatorWorldRegions).values(data).returning();
    return row;
  }
  async updateRegion(id: number, data: Partial<typeof creatorWorldRegions.$inferInsert>) {
    const [row] = await db.update(creatorWorldRegions).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldRegions.id, id)).returning();
    return row;
  }
  async deleteRegion(id: number) {
    const [row] = await db.delete(creatorWorldRegions).where(eq(creatorWorldRegions.id, id)).returning();
    return row;
  }

  // Spawnpoints
  async listSpawnpoints(worldId: number) {
    return db.select().from(creatorWorldSpawnpoints).where(eq(creatorWorldSpawnpoints.worldInstanceId, worldId));
  }
  async createSpawnpoint(data: typeof creatorWorldSpawnpoints.$inferInsert) {
    const [row] = await db.insert(creatorWorldSpawnpoints).values(data).returning();
    return row;
  }
  async updateSpawnpoint(id: number, data: Partial<typeof creatorWorldSpawnpoints.$inferInsert>) {
    const [row] = await db.update(creatorWorldSpawnpoints).set(data).where(eq(creatorWorldSpawnpoints.id, id)).returning();
    return row;
  }
  async deleteSpawnpoint(id: number) {
    const [row] = await db.delete(creatorWorldSpawnpoints).where(eq(creatorWorldSpawnpoints.id, id)).returning();
    return row;
  }

  // Teleports
  async listTeleports(worldId: number) {
    return db.select().from(creatorWorldTeleports).where(eq(creatorWorldTeleports.worldInstanceId, worldId));
  }
  async createTeleport(data: typeof creatorWorldTeleports.$inferInsert) {
    const [row] = await db.insert(creatorWorldTeleports).values(data).returning();
    return row;
  }
  async updateTeleport(id: number, data: Partial<typeof creatorWorldTeleports.$inferInsert>) {
    const [row] = await db.update(creatorWorldTeleports).set(data).where(eq(creatorWorldTeleports.id, id)).returning();
    return row;
  }
  async deleteTeleport(id: number) {
    const [row] = await db.delete(creatorWorldTeleports).where(eq(creatorWorldTeleports.id, id)).returning();
    return row;
  }

  // Weather
  async getWeather(worldId: number) {
    const [row] = await db.select().from(creatorWorldWeather).where(eq(creatorWorldWeather.worldInstanceId, worldId));
    return row ?? null;
  }
  async upsertWeather(worldId: number, data: Partial<typeof creatorWorldWeather.$inferInsert>) {
    const existing = await this.getWeather(worldId);
    if (existing) {
      const [row] = await db.update(creatorWorldWeather).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldWeather.worldInstanceId, worldId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorWorldWeather).values({ worldInstanceId: worldId, ...data } as any).returning();
    return row;
  }

  // Day/Night
  async getDayNight(worldId: number) {
    const [row] = await db.select().from(creatorWorldDaynight).where(eq(creatorWorldDaynight.worldInstanceId, worldId));
    return row ?? null;
  }
  async upsertDayNight(worldId: number, data: Partial<typeof creatorWorldDaynight.$inferInsert>) {
    const existing = await this.getDayNight(worldId);
    if (existing) {
      const [row] = await db.update(creatorWorldDaynight).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldDaynight.worldInstanceId, worldId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorWorldDaynight).values({ worldInstanceId: worldId, ...data } as any).returning();
    return row;
  }

  // Events
  async listEvents(worldId: number) {
    return db.select().from(creatorWorldEvents).where(eq(creatorWorldEvents.worldInstanceId, worldId));
  }
  async createEvent(data: typeof creatorWorldEvents.$inferInsert) {
    const [row] = await db.insert(creatorWorldEvents).values(data).returning();
    return row;
  }
  async updateEvent(id: number, data: Partial<typeof creatorWorldEvents.$inferInsert>) {
    const [row] = await db.update(creatorWorldEvents).set(data).where(eq(creatorWorldEvents.id, id)).returning();
    return row;
  }
  async deleteEvent(id: number) {
    const [row] = await db.delete(creatorWorldEvents).where(eq(creatorWorldEvents.id, id)).returning();
    return row;
  }

  // States
  async listStates(worldId: number) {
    return db.select().from(creatorWorldStates).where(eq(creatorWorldStates.worldInstanceId, worldId)).orderBy(desc(creatorWorldStates.savedAt));
  }
  async createState(data: typeof creatorWorldStates.$inferInsert) {
    const [row] = await db.insert(creatorWorldStates).values(data).returning();
    return row;
  }
  async getState(id: number) {
    const [row] = await db.select().from(creatorWorldStates).where(eq(creatorWorldStates.id, id));
    return row ?? null;
  }

  // Checkpoints
  async listCheckpoints(worldId: number, sessionId?: string) {
    const conditions = [eq(creatorWorldCheckpoints.worldInstanceId, worldId)];
    if (sessionId) conditions.push(eq(creatorWorldCheckpoints.sessionId, sessionId));
    return db.select().from(creatorWorldCheckpoints).where(and(...conditions)).orderBy(desc(creatorWorldCheckpoints.createdAt));
  }
  async createCheckpoint(data: typeof creatorWorldCheckpoints.$inferInsert) {
    const [row] = await db.insert(creatorWorldCheckpoints).values(data).returning();
    return row;
  }

  // Portals
  async listPortals(worldId: number) {
    return db.select().from(creatorWorldPortals).where(eq(creatorWorldPortals.worldInstanceId, worldId));
  }
  async createPortal(data: typeof creatorWorldPortals.$inferInsert) {
    const [row] = await db.insert(creatorWorldPortals).values(data).returning();
    return row;
  }
  async updatePortal(id: number, data: Partial<typeof creatorWorldPortals.$inferInsert>) {
    const [row] = await db.update(creatorWorldPortals).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldPortals.id, id)).returning();
    return row;
  }
  async deletePortal(id: number) {
    const [row] = await db.delete(creatorWorldPortals).where(eq(creatorWorldPortals.id, id)).returning();
    return row;
  }

  // Runtime
  async getRuntime(worldId: number, sessionId: string) {
    const [row] = await db.select().from(creatorWorldRuntime).where(and(eq(creatorWorldRuntime.worldInstanceId, worldId), eq(creatorWorldRuntime.sessionId, sessionId)));
    return row ?? null;
  }
  async listRuntimes(worldId: number) {
    return db.select().from(creatorWorldRuntime).where(eq(creatorWorldRuntime.worldInstanceId, worldId)).orderBy(desc(creatorWorldRuntime.updatedAt)).limit(10);
  }
  async upsertRuntime(worldId: number, sessionId: string, data: Partial<typeof creatorWorldRuntime.$inferInsert>) {
    const existing = await this.getRuntime(worldId, sessionId);
    if (existing) {
      const [row] = await db.update(creatorWorldRuntime).set({ ...data, updatedAt: new Date() }).where(and(eq(creatorWorldRuntime.worldInstanceId, worldId), eq(creatorWorldRuntime.sessionId, sessionId))).returning();
      return row;
    }
    const [row] = await db.insert(creatorWorldRuntime).values({ worldInstanceId: worldId, sessionId, ...data } as any).returning();
    return row;
  }

  // Players
  async listPlayers(worldId: number) {
    return db.select().from(creatorWorldPlayers).where(and(eq(creatorWorldPlayers.worldInstanceId, worldId), eq(creatorWorldPlayers.isOnline, true)));
  }
  async upsertPlayer(data: typeof creatorWorldPlayers.$inferInsert) {
    const [row] = await db.insert(creatorWorldPlayers).values(data).returning();
    return row;
  }

  // NPCs
  async listNpcs(worldId: number) {
    return db.select().from(creatorWorldNpcs).where(eq(creatorWorldNpcs.worldInstanceId, worldId));
  }
  async createNpc(data: typeof creatorWorldNpcs.$inferInsert) {
    const [row] = await db.insert(creatorWorldNpcs).values(data).returning();
    return row;
  }
  async updateNpc(id: number, data: Partial<typeof creatorWorldNpcs.$inferInsert>) {
    const [row] = await db.update(creatorWorldNpcs).set(data).where(eq(creatorWorldNpcs.id, id)).returning();
    return row;
  }

  // Statistics
  async getStatistics(worldId: number) {
    const [row] = await db.select().from(creatorWorldStatistics).where(eq(creatorWorldStatistics.worldInstanceId, worldId));
    return row ?? null;
  }
  async upsertStatistics(worldId: number, data: Partial<typeof creatorWorldStatistics.$inferInsert>) {
    const existing = await this.getStatistics(worldId);
    if (existing) {
      const [row] = await db.update(creatorWorldStatistics).set({ ...data, updatedAt: new Date() }).where(eq(creatorWorldStatistics.worldInstanceId, worldId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorWorldStatistics).values({ worldInstanceId: worldId, ...data } as any).returning();
    return row;
  }

  // History
  async listHistory(worldId: number) {
    return db.select().from(creatorWorldHistory).where(eq(creatorWorldHistory.worldInstanceId, worldId)).orderBy(desc(creatorWorldHistory.createdAt)).limit(100);
  }
  async addHistory(data: typeof creatorWorldHistory.$inferInsert) {
    const [row] = await db.insert(creatorWorldHistory).values(data).returning();
    return row;
  }

  // Versions
  async listVersions(worldId: number) {
    return db.select().from(creatorWorldVersions).where(eq(creatorWorldVersions.worldInstanceId, worldId)).orderBy(desc(creatorWorldVersions.version));
  }
  async createVersion(data: typeof creatorWorldVersions.$inferInsert) {
    const [row] = await db.insert(creatorWorldVersions).values(data).returning();
    return row;
  }

  // Exports / Imports
  async createExport(data: typeof creatorWorldExports.$inferInsert) {
    const [row] = await db.insert(creatorWorldExports).values(data).returning();
    return row;
  }
  async createImport(data: typeof creatorWorldImports.$inferInsert) {
    const [row] = await db.insert(creatorWorldImports).values(data).returning();
    return row;
  }

  // Streaming
  async recordStreaming(data: typeof creatorWorldStreaming.$inferInsert) {
    const [row] = await db.insert(creatorWorldStreaming).values(data).returning();
    return row;
  }
  async listStreaming(worldId: number, limit = 20) {
    return db.select().from(creatorWorldStreaming).where(eq(creatorWorldStreaming.worldInstanceId, worldId)).orderBy(desc(creatorWorldStreaming.recordedAt)).limit(limit);
  }
}

export const worldSystemRepo = new WorldSystemRepository();
