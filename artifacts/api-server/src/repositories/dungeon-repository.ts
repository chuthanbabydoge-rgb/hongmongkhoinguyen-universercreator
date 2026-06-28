import { db } from "@workspace/db";
import {
  creatorDungeons, creatorDungeonRooms, creatorDungeonConnections,
  creatorDungeonSpawnpoints, creatorDungeonBosses, creatorDungeonMonsters,
  creatorDungeonTraps, creatorDungeonPuzzles, creatorDungeonRewards,
  creatorDungeonCheckpoints, creatorDungeonRequirements, creatorDungeonEvents,
  creatorDungeonScripts, creatorDungeonTemplates, creatorDungeonVersions,
  creatorDungeonHistory, creatorDungeonStatistics, creatorDungeonExports,
  creatorDungeonImports, creatorDungeonRuntime,
  type InsertDungeon,
} from "@workspace/db/schema";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";

export class DrizzleDungeonRepository {

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(userId: number) {
    const [total, published, archived, templates] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(creatorDungeons).where(eq(creatorDungeons.createdBy, userId)),
      db.select({ count: sql<number>`count(*)` }).from(creatorDungeons).where(and(eq(creatorDungeons.createdBy, userId), eq(creatorDungeons.isPublished, true))),
      db.select({ count: sql<number>`count(*)` }).from(creatorDungeons).where(and(eq(creatorDungeons.createdBy, userId), eq(creatorDungeons.isArchived, true))),
      db.select({ count: sql<number>`count(*)` }).from(creatorDungeons).where(and(eq(creatorDungeons.createdBy, userId), eq(creatorDungeons.isTemplate, true))),
    ]);
    const recent = await db.select().from(creatorDungeons).where(eq(creatorDungeons.createdBy, userId)).orderBy(desc(creatorDungeons.updatedAt)).limit(5);
    return {
      totalDungeons: Number(total[0]?.count ?? 0),
      publishedDungeons: Number(published[0]?.count ?? 0),
      archivedDungeons: Number(archived[0]?.count ?? 0),
      templateCount: Number(templates[0]?.count ?? 0),
      recentDungeons: recent,
    };
  }

  // ─── Dungeon CRUD ───────────────────────────────────────────────────────────

  async listDungeons(userId: number, limit: number, offset: number, search?: string) {
    const where = search
      ? and(eq(creatorDungeons.createdBy, userId), or(ilike(creatorDungeons.name, `%${search}%`), ilike(creatorDungeons.description, `%${search}%`)))
      : eq(creatorDungeons.createdBy, userId);
    const [items, countResult] = await Promise.all([
      db.select().from(creatorDungeons).where(where).orderBy(desc(creatorDungeons.updatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creatorDungeons).where(where),
    ]);
    return { items, total: Number(countResult[0]?.count ?? 0), limit, offset };
  }

  async createDungeon(data: InsertDungeon) {
    const [row] = await db.insert(creatorDungeons).values(data).returning();
    return row!;
  }

  async getDungeon(id: number) {
    const [row] = await db.select().from(creatorDungeons).where(eq(creatorDungeons.id, id));
    return row ?? null;
  }

  async updateDungeon(id: number, data: Partial<InsertDungeon>) {
    const [row] = await db.update(creatorDungeons).set({ ...data, updatedAt: new Date() }).where(eq(creatorDungeons.id, id)).returning();
    return row!;
  }

  async deleteDungeon(id: number) {
    await db.delete(creatorDungeons).where(eq(creatorDungeons.id, id));
  }

  async listTemplates(userId: number) {
    return db.select().from(creatorDungeons).where(and(eq(creatorDungeons.createdBy, userId), eq(creatorDungeons.isTemplate, true))).orderBy(desc(creatorDungeons.updatedAt));
  }

  // ─── Rooms ──────────────────────────────────────────────────────────────────

  async getRooms(dungeonId: number) {
    return db.select().from(creatorDungeonRooms).where(eq(creatorDungeonRooms.dungeonId, dungeonId)).orderBy(creatorDungeonRooms.displayOrder);
  }

  async createRoom(data: typeof creatorDungeonRooms.$inferInsert) {
    const [row] = await db.insert(creatorDungeonRooms).values(data).returning();
    return row!;
  }

  async updateRoom(id: number, data: Partial<typeof creatorDungeonRooms.$inferInsert>) {
    const [row] = await db.update(creatorDungeonRooms).set({ ...data, updatedAt: new Date() }).where(eq(creatorDungeonRooms.id, id)).returning();
    return row!;
  }

  async deleteRoom(id: number) {
    await db.delete(creatorDungeonRooms).where(eq(creatorDungeonRooms.id, id));
  }

  // ─── Connections ────────────────────────────────────────────────────────────

  async getConnections(dungeonId: number) {
    return db.select().from(creatorDungeonConnections).where(eq(creatorDungeonConnections.dungeonId, dungeonId));
  }

  async createConnection(data: typeof creatorDungeonConnections.$inferInsert) {
    const [row] = await db.insert(creatorDungeonConnections).values(data).returning();
    return row!;
  }

  async updateConnection(id: number, data: Partial<typeof creatorDungeonConnections.$inferInsert>) {
    const [row] = await db.update(creatorDungeonConnections).set(data).where(eq(creatorDungeonConnections.id, id)).returning();
    return row!;
  }

  async deleteConnection(id: number) {
    await db.delete(creatorDungeonConnections).where(eq(creatorDungeonConnections.id, id));
  }

  // ─── Spawn Points ───────────────────────────────────────────────────────────

  async getSpawnpoints(dungeonId: number) {
    return db.select().from(creatorDungeonSpawnpoints).where(eq(creatorDungeonSpawnpoints.dungeonId, dungeonId));
  }

  async createSpawnpoint(data: typeof creatorDungeonSpawnpoints.$inferInsert) {
    const [row] = await db.insert(creatorDungeonSpawnpoints).values(data).returning();
    return row!;
  }

  async updateSpawnpoint(id: number, data: Partial<typeof creatorDungeonSpawnpoints.$inferInsert>) {
    const [row] = await db.update(creatorDungeonSpawnpoints).set(data).where(eq(creatorDungeonSpawnpoints.id, id)).returning();
    return row!;
  }

  async deleteSpawnpoint(id: number) {
    await db.delete(creatorDungeonSpawnpoints).where(eq(creatorDungeonSpawnpoints.id, id));
  }

  // ─── Bosses ─────────────────────────────────────────────────────────────────

  async getBosses(dungeonId: number) {
    return db.select().from(creatorDungeonBosses).where(eq(creatorDungeonBosses.dungeonId, dungeonId));
  }

  async createBoss(data: typeof creatorDungeonBosses.$inferInsert) {
    const [row] = await db.insert(creatorDungeonBosses).values(data).returning();
    return row!;
  }

  async updateBoss(id: number, data: Partial<typeof creatorDungeonBosses.$inferInsert>) {
    const [row] = await db.update(creatorDungeonBosses).set(data).where(eq(creatorDungeonBosses.id, id)).returning();
    return row!;
  }

  async deleteBoss(id: number) {
    await db.delete(creatorDungeonBosses).where(eq(creatorDungeonBosses.id, id));
  }

  // ─── Monsters ───────────────────────────────────────────────────────────────

  async getMonsters(dungeonId: number) {
    return db.select().from(creatorDungeonMonsters).where(eq(creatorDungeonMonsters.dungeonId, dungeonId));
  }

  async createMonster(data: typeof creatorDungeonMonsters.$inferInsert) {
    const [row] = await db.insert(creatorDungeonMonsters).values(data).returning();
    return row!;
  }

  async updateMonster(id: number, data: Partial<typeof creatorDungeonMonsters.$inferInsert>) {
    const [row] = await db.update(creatorDungeonMonsters).set(data).where(eq(creatorDungeonMonsters.id, id)).returning();
    return row!;
  }

  async deleteMonster(id: number) {
    await db.delete(creatorDungeonMonsters).where(eq(creatorDungeonMonsters.id, id));
  }

  // ─── Traps ──────────────────────────────────────────────────────────────────

  async getTraps(dungeonId: number) {
    return db.select().from(creatorDungeonTraps).where(eq(creatorDungeonTraps.dungeonId, dungeonId));
  }

  async createTrap(data: typeof creatorDungeonTraps.$inferInsert) {
    const [row] = await db.insert(creatorDungeonTraps).values(data).returning();
    return row!;
  }

  async updateTrap(id: number, data: Partial<typeof creatorDungeonTraps.$inferInsert>) {
    const [row] = await db.update(creatorDungeonTraps).set(data).where(eq(creatorDungeonTraps.id, id)).returning();
    return row!;
  }

  async deleteTrap(id: number) {
    await db.delete(creatorDungeonTraps).where(eq(creatorDungeonTraps.id, id));
  }

  // ─── Puzzles ────────────────────────────────────────────────────────────────

  async getPuzzles(dungeonId: number) {
    return db.select().from(creatorDungeonPuzzles).where(eq(creatorDungeonPuzzles.dungeonId, dungeonId));
  }

  async createPuzzle(data: typeof creatorDungeonPuzzles.$inferInsert) {
    const [row] = await db.insert(creatorDungeonPuzzles).values(data).returning();
    return row!;
  }

  async updatePuzzle(id: number, data: Partial<typeof creatorDungeonPuzzles.$inferInsert>) {
    const [row] = await db.update(creatorDungeonPuzzles).set(data).where(eq(creatorDungeonPuzzles.id, id)).returning();
    return row!;
  }

  async deletePuzzle(id: number) {
    await db.delete(creatorDungeonPuzzles).where(eq(creatorDungeonPuzzles.id, id));
  }

  // ─── Rewards ────────────────────────────────────────────────────────────────

  async getRewards(dungeonId: number) {
    return db.select().from(creatorDungeonRewards).where(eq(creatorDungeonRewards.dungeonId, dungeonId));
  }

  async createReward(data: typeof creatorDungeonRewards.$inferInsert) {
    const [row] = await db.insert(creatorDungeonRewards).values(data).returning();
    return row!;
  }

  async updateReward(id: number, data: Partial<typeof creatorDungeonRewards.$inferInsert>) {
    const [row] = await db.update(creatorDungeonRewards).set(data).where(eq(creatorDungeonRewards.id, id)).returning();
    return row!;
  }

  async deleteReward(id: number) {
    await db.delete(creatorDungeonRewards).where(eq(creatorDungeonRewards.id, id));
  }

  // ─── Checkpoints ────────────────────────────────────────────────────────────

  async getCheckpoints(dungeonId: number) {
    return db.select().from(creatorDungeonCheckpoints).where(eq(creatorDungeonCheckpoints.dungeonId, dungeonId)).orderBy(creatorDungeonCheckpoints.checkpointIndex);
  }

  async createCheckpoint(data: typeof creatorDungeonCheckpoints.$inferInsert) {
    const [row] = await db.insert(creatorDungeonCheckpoints).values(data).returning();
    return row!;
  }

  async updateCheckpoint(id: number, data: Partial<typeof creatorDungeonCheckpoints.$inferInsert>) {
    const [row] = await db.update(creatorDungeonCheckpoints).set(data).where(eq(creatorDungeonCheckpoints.id, id)).returning();
    return row!;
  }

  async deleteCheckpoint(id: number) {
    await db.delete(creatorDungeonCheckpoints).where(eq(creatorDungeonCheckpoints.id, id));
  }

  // ─── Requirements ───────────────────────────────────────────────────────────

  async getRequirements(dungeonId: number) {
    return db.select().from(creatorDungeonRequirements).where(eq(creatorDungeonRequirements.dungeonId, dungeonId));
  }

  async createRequirement(data: typeof creatorDungeonRequirements.$inferInsert) {
    const [row] = await db.insert(creatorDungeonRequirements).values(data).returning();
    return row!;
  }

  async updateRequirement(id: number, data: Partial<typeof creatorDungeonRequirements.$inferInsert>) {
    const [row] = await db.update(creatorDungeonRequirements).set(data).where(eq(creatorDungeonRequirements.id, id)).returning();
    return row!;
  }

  async deleteRequirement(id: number) {
    await db.delete(creatorDungeonRequirements).where(eq(creatorDungeonRequirements.id, id));
  }

  // ─── Events ─────────────────────────────────────────────────────────────────

  async getEvents(dungeonId: number) {
    return db.select().from(creatorDungeonEvents).where(eq(creatorDungeonEvents.dungeonId, dungeonId)).orderBy(creatorDungeonEvents.priority);
  }

  async createEvent(data: typeof creatorDungeonEvents.$inferInsert) {
    const [row] = await db.insert(creatorDungeonEvents).values(data).returning();
    return row!;
  }

  async updateEvent(id: number, data: Partial<typeof creatorDungeonEvents.$inferInsert>) {
    const [row] = await db.update(creatorDungeonEvents).set(data).where(eq(creatorDungeonEvents.id, id)).returning();
    return row!;
  }

  async deleteEvent(id: number) {
    await db.delete(creatorDungeonEvents).where(eq(creatorDungeonEvents.id, id));
  }

  // ─── Scripts ────────────────────────────────────────────────────────────────

  async getScripts(dungeonId: number) {
    return db.select().from(creatorDungeonScripts).where(eq(creatorDungeonScripts.dungeonId, dungeonId));
  }

  async createScript(data: typeof creatorDungeonScripts.$inferInsert) {
    const [row] = await db.insert(creatorDungeonScripts).values(data).returning();
    return row!;
  }

  async updateScript(id: number, data: Partial<typeof creatorDungeonScripts.$inferInsert>) {
    const [row] = await db.update(creatorDungeonScripts).set({ ...data, updatedAt: new Date() }).where(eq(creatorDungeonScripts.id, id)).returning();
    return row!;
  }

  async deleteScript(id: number) {
    await db.delete(creatorDungeonScripts).where(eq(creatorDungeonScripts.id, id));
  }

  // ─── Templates ──────────────────────────────────────────────────────────────

  async getGlobalTemplates() {
    return db.select().from(creatorDungeonTemplates).where(eq(creatorDungeonTemplates.isPublic, true)).orderBy(desc(creatorDungeonTemplates.usageCount));
  }

  async createTemplate(data: typeof creatorDungeonTemplates.$inferInsert) {
    const [row] = await db.insert(creatorDungeonTemplates).values(data).returning();
    return row!;
  }

  async getTemplate(id: number) {
    const [row] = await db.select().from(creatorDungeonTemplates).where(eq(creatorDungeonTemplates.id, id));
    return row ?? null;
  }

  // ─── Versions ───────────────────────────────────────────────────────────────

  async getVersions(dungeonId: number) {
    return db.select().from(creatorDungeonVersions).where(eq(creatorDungeonVersions.dungeonId, dungeonId)).orderBy(desc(creatorDungeonVersions.version));
  }

  async createVersion(data: typeof creatorDungeonVersions.$inferInsert) {
    const [row] = await db.insert(creatorDungeonVersions).values(data).returning();
    return row!;
  }

  async getVersion(id: number) {
    const [row] = await db.select().from(creatorDungeonVersions).where(eq(creatorDungeonVersions.id, id));
    return row ?? null;
  }

  // ─── History ────────────────────────────────────────────────────────────────

  async getHistory(dungeonId: number, limit: number = 50) {
    return db.select().from(creatorDungeonHistory).where(eq(creatorDungeonHistory.dungeonId, dungeonId)).orderBy(desc(creatorDungeonHistory.createdAt)).limit(limit);
  }

  async addHistory(data: typeof creatorDungeonHistory.$inferInsert) {
    const [row] = await db.insert(creatorDungeonHistory).values(data).returning();
    return row!;
  }

  // ─── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics(dungeonId: number) {
    const [row] = await db.select().from(creatorDungeonStatistics).where(eq(creatorDungeonStatistics.dungeonId, dungeonId));
    return row ?? null;
  }

  async upsertStatistics(dungeonId: number, data: Partial<typeof creatorDungeonStatistics.$inferInsert>) {
    const existing = await this.getStatistics(dungeonId);
    if (existing) {
      const [row] = await db.update(creatorDungeonStatistics).set({ ...data, updatedAt: new Date() }).where(eq(creatorDungeonStatistics.dungeonId, dungeonId)).returning();
      return row!;
    }
    const [row] = await db.insert(creatorDungeonStatistics).values({ dungeonId, ...data }).returning();
    return row!;
  }

  // ─── Exports ────────────────────────────────────────────────────────────────

  async createExport(data: typeof creatorDungeonExports.$inferInsert) {
    const [row] = await db.insert(creatorDungeonExports).values(data).returning();
    return row!;
  }

  async getExports(dungeonId: number) {
    return db.select().from(creatorDungeonExports).where(eq(creatorDungeonExports.dungeonId, dungeonId)).orderBy(desc(creatorDungeonExports.createdAt));
  }

  // ─── Imports ────────────────────────────────────────────────────────────────

  async createImport(data: typeof creatorDungeonImports.$inferInsert) {
    const [row] = await db.insert(creatorDungeonImports).values(data).returning();
    return row!;
  }

  async getImports(dungeonId: number) {
    return db.select().from(creatorDungeonImports).where(eq(creatorDungeonImports.dungeonId, dungeonId)).orderBy(desc(creatorDungeonImports.createdAt));
  }

  // ─── Runtime ────────────────────────────────────────────────────────────────

  async getRuntimeSession(dungeonId: number, sessionId: string) {
    const [row] = await db.select().from(creatorDungeonRuntime).where(and(eq(creatorDungeonRuntime.dungeonId, dungeonId), eq(creatorDungeonRuntime.sessionId, sessionId)));
    return row ?? null;
  }

  async createRuntimeSession(data: typeof creatorDungeonRuntime.$inferInsert) {
    const [row] = await db.insert(creatorDungeonRuntime).values(data).returning();
    return row!;
  }

  async updateRuntimeSession(id: number, data: Partial<typeof creatorDungeonRuntime.$inferInsert>) {
    const [row] = await db.update(creatorDungeonRuntime).set({ ...data, updatedAt: new Date() }).where(eq(creatorDungeonRuntime.id, id)).returning();
    return row!;
  }

  // ─── Full Dungeon ────────────────────────────────────────────────────────────

  async getFullDungeon(id: number) {
    const [dungeon, rooms, connections, spawnpoints, bosses, monsters, traps, puzzles, rewards, checkpoints, requirements, events, scripts] = await Promise.all([
      this.getDungeon(id),
      this.getRooms(id),
      this.getConnections(id),
      this.getSpawnpoints(id),
      this.getBosses(id),
      this.getMonsters(id),
      this.getTraps(id),
      this.getPuzzles(id),
      this.getRewards(id),
      this.getCheckpoints(id),
      this.getRequirements(id),
      this.getEvents(id),
      this.getScripts(id),
    ]);
    return { dungeon, rooms, connections, spawnpoints, bosses, monsters, traps, puzzles, rewards, checkpoints, requirements, events, scripts };
  }
}
