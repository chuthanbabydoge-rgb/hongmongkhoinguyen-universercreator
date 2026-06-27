import { db } from "@workspace/db";
import {
  creatorRuntimeSessions,
  creatorRuntimeWorlds,
  creatorRuntimeEntities,
  creatorRuntimeComponents,
  creatorRuntimeSystems,
  creatorRuntimeEvents,
  creatorRuntimeLogs,
  creatorRuntimeResources,
  creatorRuntimeSnapshots,
  creatorRuntimeCheckpoints,
  creatorRuntimePerformance,
  creatorRuntimeScheduler,
  creatorRuntimeJobs,
  creatorRuntimeTimers,
  creatorRuntimeVariables,
  creatorRuntimeMemory,
  creatorRuntimeDebug,
  creatorRuntimeErrors,
  creatorRuntimeHistory,
  creatorRuntimeProfiles,
  type RuntimeSession,
  type InsertRuntimeSession,
  type RuntimeWorld,
  type InsertRuntimeWorld,
  type RuntimeEntity,
  type InsertRuntimeEntity,
  type RuntimeComponent,
  type InsertRuntimeComponent,
  type RuntimeSystem,
  type InsertRuntimeSystem,
  type RuntimeEvent,
  type InsertRuntimeEvent,
  type RuntimeLog,
  type InsertRuntimeLog,
  type RuntimeSnapshot,
  type InsertRuntimeSnapshot,
  type RuntimeCheckpoint,
  type InsertRuntimeCheckpoint,
  type RuntimePerformance,
  type InsertRuntimePerformance,
  type RuntimeJob,
  type InsertRuntimeJob,
  type RuntimeTimer,
  type InsertRuntimeTimer,
  type RuntimeVariable,
  type InsertRuntimeVariable,
  type RuntimeError,
  type InsertRuntimeError,
  type RuntimeHistory,
  type InsertRuntimeHistory,
  type RuntimeProfile,
  type InsertRuntimeProfile,
} from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export class DrizzleRuntimeRepository {
  // ─── Sessions ────────────────────────────────────────────────────────────────

  async createSession(data: InsertRuntimeSession): Promise<RuntimeSession> {
    const [row] = await db.insert(creatorRuntimeSessions).values(data).returning();
    return row!;
  }

  async findSessionById(id: number, userId: number): Promise<RuntimeSession | null> {
    const [row] = await db
      .select()
      .from(creatorRuntimeSessions)
      .where(and(eq(creatorRuntimeSessions.id, id), eq(creatorRuntimeSessions.userId, userId)));
    return row ?? null;
  }

  async findSessionByUuid(uuid: string): Promise<RuntimeSession | null> {
    const [row] = await db
      .select()
      .from(creatorRuntimeSessions)
      .where(eq(creatorRuntimeSessions.uuid, uuid));
    return row ?? null;
  }

  async listSessions(userId: number, limit = 20, offset = 0): Promise<{ items: RuntimeSession[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeSessions)
        .where(eq(creatorRuntimeSessions.userId, userId))
        .orderBy(desc(creatorRuntimeSessions.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeSessions)
        .where(eq(creatorRuntimeSessions.userId, userId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  async updateSession(id: number, userId: number, data: Partial<InsertRuntimeSession>): Promise<RuntimeSession | null> {
    const [row] = await db
      .update(creatorRuntimeSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorRuntimeSessions.id, id), eq(creatorRuntimeSessions.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteSession(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(creatorRuntimeSessions)
      .where(and(eq(creatorRuntimeSessions.id, id), eq(creatorRuntimeSessions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Worlds ───────────────────────────────────────────────────────────────────

  async createWorld(data: InsertRuntimeWorld): Promise<RuntimeWorld> {
    const [row] = await db.insert(creatorRuntimeWorlds).values(data).returning();
    return row!;
  }

  async findWorldsBySession(sessionId: number): Promise<RuntimeWorld[]> {
    return db
      .select()
      .from(creatorRuntimeWorlds)
      .where(eq(creatorRuntimeWorlds.sessionId, sessionId))
      .orderBy(asc(creatorRuntimeWorlds.id));
  }

  async updateWorld(id: number, data: Partial<InsertRuntimeWorld>): Promise<RuntimeWorld | null> {
    const [row] = await db
      .update(creatorRuntimeWorlds)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeWorlds.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Entities ────────────────────────────────────────────────────────────────

  async spawnEntity(data: InsertRuntimeEntity): Promise<RuntimeEntity> {
    const [row] = await db.insert(creatorRuntimeEntities).values(data).returning();
    return row!;
  }

  async findEntitiesBySession(sessionId: number, limit = 100, offset = 0): Promise<{ items: RuntimeEntity[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeEntities)
        .where(and(eq(creatorRuntimeEntities.sessionId, sessionId), eq(creatorRuntimeEntities.destroyed, false)))
        .orderBy(asc(creatorRuntimeEntities.id))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeEntities)
        .where(and(eq(creatorRuntimeEntities.sessionId, sessionId), eq(creatorRuntimeEntities.destroyed, false))),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  async findEntityById(id: number): Promise<RuntimeEntity | null> {
    const [row] = await db.select().from(creatorRuntimeEntities).where(eq(creatorRuntimeEntities.id, id));
    return row ?? null;
  }

  async updateEntity(id: number, data: Partial<InsertRuntimeEntity>): Promise<RuntimeEntity | null> {
    const [row] = await db
      .update(creatorRuntimeEntities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeEntities.id, id))
      .returning();
    return row ?? null;
  }

  async destroyEntity(id: number): Promise<boolean> {
    const [row] = await db
      .update(creatorRuntimeEntities)
      .set({ destroyed: true, destroyedAt: new Date(), updatedAt: new Date() })
      .where(eq(creatorRuntimeEntities.id, id))
      .returning();
    return !!row;
  }

  // ─── Components ───────────────────────────────────────────────────────────────

  async addComponent(data: InsertRuntimeComponent): Promise<RuntimeComponent> {
    const [row] = await db.insert(creatorRuntimeComponents).values(data).returning();
    return row!;
  }

  async findComponentsByEntity(entityId: number): Promise<RuntimeComponent[]> {
    return db
      .select()
      .from(creatorRuntimeComponents)
      .where(eq(creatorRuntimeComponents.entityId, entityId))
      .orderBy(asc(creatorRuntimeComponents.order));
  }

  async findComponentsBySession(sessionId: number, limit = 200, offset = 0): Promise<{ items: RuntimeComponent[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeComponents)
        .where(eq(creatorRuntimeComponents.sessionId, sessionId))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeComponents)
        .where(eq(creatorRuntimeComponents.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  async updateComponent(id: number, data: Partial<InsertRuntimeComponent>): Promise<RuntimeComponent | null> {
    const [row] = await db
      .update(creatorRuntimeComponents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeComponents.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Systems ──────────────────────────────────────────────────────────────────

  async upsertSystem(data: InsertRuntimeSystem): Promise<RuntimeSystem> {
    const [row] = await db.insert(creatorRuntimeSystems).values(data).returning();
    return row!;
  }

  async findSystemsBySession(sessionId: number): Promise<RuntimeSystem[]> {
    return db
      .select()
      .from(creatorRuntimeSystems)
      .where(eq(creatorRuntimeSystems.sessionId, sessionId))
      .orderBy(asc(creatorRuntimeSystems.priority));
  }

  async updateSystem(id: number, data: Partial<InsertRuntimeSystem>): Promise<RuntimeSystem | null> {
    const [row] = await db
      .update(creatorRuntimeSystems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeSystems.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Events ───────────────────────────────────────────────────────────────────

  async dispatchEvent(data: InsertRuntimeEvent): Promise<RuntimeEvent> {
    const [row] = await db.insert(creatorRuntimeEvents).values(data).returning();
    return row!;
  }

  async findEventsBySession(sessionId: number, limit = 50, offset = 0): Promise<{ items: RuntimeEvent[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeEvents)
        .where(eq(creatorRuntimeEvents.sessionId, sessionId))
        .orderBy(desc(creatorRuntimeEvents.dispatchedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeEvents)
        .where(eq(creatorRuntimeEvents.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  // ─── Logs ─────────────────────────────────────────────────────────────────────

  async addLog(data: InsertRuntimeLog): Promise<RuntimeLog> {
    const [row] = await db.insert(creatorRuntimeLogs).values(data).returning();
    return row!;
  }

  async findLogsBySession(sessionId: number, limit = 100, offset = 0): Promise<{ items: RuntimeLog[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeLogs)
        .where(eq(creatorRuntimeLogs.sessionId, sessionId))
        .orderBy(desc(creatorRuntimeLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeLogs)
        .where(eq(creatorRuntimeLogs.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  // ─── Snapshots ────────────────────────────────────────────────────────────────

  async createSnapshot(data: InsertRuntimeSnapshot): Promise<RuntimeSnapshot> {
    const [row] = await db.insert(creatorRuntimeSnapshots).values(data).returning();
    return row!;
  }

  async findSnapshotsBySession(sessionId: number): Promise<RuntimeSnapshot[]> {
    return db
      .select()
      .from(creatorRuntimeSnapshots)
      .where(eq(creatorRuntimeSnapshots.sessionId, sessionId))
      .orderBy(desc(creatorRuntimeSnapshots.createdAt));
  }

  async findSnapshotById(id: number): Promise<RuntimeSnapshot | null> {
    const [row] = await db.select().from(creatorRuntimeSnapshots).where(eq(creatorRuntimeSnapshots.id, id));
    return row ?? null;
  }

  async createCheckpoint(data: InsertRuntimeCheckpoint): Promise<RuntimeCheckpoint> {
    const [row] = await db.insert(creatorRuntimeCheckpoints).values(data).returning();
    return row!;
  }

  async findCheckpointsBySession(sessionId: number): Promise<RuntimeCheckpoint[]> {
    return db
      .select()
      .from(creatorRuntimeCheckpoints)
      .where(eq(creatorRuntimeCheckpoints.sessionId, sessionId))
      .orderBy(desc(creatorRuntimeCheckpoints.createdAt));
  }

  // ─── Performance ─────────────────────────────────────────────────────────────

  async recordPerformance(data: InsertRuntimePerformance): Promise<RuntimePerformance> {
    const [row] = await db.insert(creatorRuntimePerformance).values(data).returning();
    return row!;
  }

  async findPerformanceBySession(sessionId: number, limit = 300): Promise<RuntimePerformance[]> {
    return db
      .select()
      .from(creatorRuntimePerformance)
      .where(eq(creatorRuntimePerformance.sessionId, sessionId))
      .orderBy(desc(creatorRuntimePerformance.sampledAt))
      .limit(limit);
  }

  async getLatestPerformance(sessionId: number): Promise<RuntimePerformance | null> {
    const [row] = await db
      .select()
      .from(creatorRuntimePerformance)
      .where(eq(creatorRuntimePerformance.sessionId, sessionId))
      .orderBy(desc(creatorRuntimePerformance.sampledAt))
      .limit(1);
    return row ?? null;
  }

  // ─── Jobs ─────────────────────────────────────────────────────────────────────

  async createJob(data: InsertRuntimeJob): Promise<RuntimeJob> {
    const [row] = await db.insert(creatorRuntimeJobs).values(data).returning();
    return row!;
  }

  async findJobsBySession(sessionId: number, limit = 50, offset = 0): Promise<{ items: RuntimeJob[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeJobs)
        .where(eq(creatorRuntimeJobs.sessionId, sessionId))
        .orderBy(desc(creatorRuntimeJobs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeJobs)
        .where(eq(creatorRuntimeJobs.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  async updateJob(id: number, data: Partial<InsertRuntimeJob>): Promise<RuntimeJob | null> {
    const [row] = await db
      .update(creatorRuntimeJobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeJobs.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Timers ───────────────────────────────────────────────────────────────────

  async createTimer(data: InsertRuntimeTimer): Promise<RuntimeTimer> {
    const [row] = await db.insert(creatorRuntimeTimers).values(data).returning();
    return row!;
  }

  async findTimersBySession(sessionId: number): Promise<RuntimeTimer[]> {
    return db
      .select()
      .from(creatorRuntimeTimers)
      .where(eq(creatorRuntimeTimers.sessionId, sessionId))
      .orderBy(asc(creatorRuntimeTimers.id));
  }

  async updateTimer(id: number, data: Partial<InsertRuntimeTimer>): Promise<RuntimeTimer | null> {
    const [row] = await db
      .update(creatorRuntimeTimers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeTimers.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Variables ────────────────────────────────────────────────────────────────

  async setVariable(data: InsertRuntimeVariable): Promise<RuntimeVariable> {
    const [row] = await db.insert(creatorRuntimeVariables).values(data).returning();
    return row!;
  }

  async findVariablesBySession(sessionId: number): Promise<RuntimeVariable[]> {
    return db
      .select()
      .from(creatorRuntimeVariables)
      .where(eq(creatorRuntimeVariables.sessionId, sessionId))
      .orderBy(asc(creatorRuntimeVariables.name));
  }

  async updateVariable(id: number, data: Partial<InsertRuntimeVariable>): Promise<RuntimeVariable | null> {
    const [row] = await db
      .update(creatorRuntimeVariables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeVariables.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Errors ───────────────────────────────────────────────────────────────────

  async recordError(data: InsertRuntimeError): Promise<RuntimeError> {
    const [row] = await db.insert(creatorRuntimeErrors).values(data).returning();
    return row!;
  }

  async findErrorsBySession(sessionId: number, limit = 50, offset = 0): Promise<{ items: RuntimeError[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeErrors)
        .where(eq(creatorRuntimeErrors.sessionId, sessionId))
        .orderBy(desc(creatorRuntimeErrors.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeErrors)
        .where(eq(creatorRuntimeErrors.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  // ─── History ──────────────────────────────────────────────────────────────────

  async addHistory(data: InsertRuntimeHistory): Promise<RuntimeHistory> {
    const [row] = await db.insert(creatorRuntimeHistory).values(data).returning();
    return row!;
  }

  async findHistoryBySession(sessionId: number, limit = 50, offset = 0): Promise<{ items: RuntimeHistory[]; total: number }> {
    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(creatorRuntimeHistory)
        .where(eq(creatorRuntimeHistory.sessionId, sessionId))
        .orderBy(desc(creatorRuntimeHistory.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(creatorRuntimeHistory)
        .where(eq(creatorRuntimeHistory.sessionId, sessionId)),
    ]);
    return { items, total: countResult[0]?.count ?? 0 };
  }

  // ─── Profiles ─────────────────────────────────────────────────────────────────

  async createProfile(data: InsertRuntimeProfile): Promise<RuntimeProfile> {
    const [row] = await db.insert(creatorRuntimeProfiles).values(data).returning();
    return row!;
  }

  async findProfilesBySession(sessionId: number): Promise<RuntimeProfile[]> {
    return db
      .select()
      .from(creatorRuntimeProfiles)
      .where(eq(creatorRuntimeProfiles.sessionId, sessionId))
      .orderBy(desc(creatorRuntimeProfiles.createdAt));
  }

  // ─── Debug ────────────────────────────────────────────────────────────────────

  async getOrCreateDebug(sessionId: number): Promise<typeof creatorRuntimeDebug.$inferSelect> {
    const existing = await db
      .select()
      .from(creatorRuntimeDebug)
      .where(eq(creatorRuntimeDebug.sessionId, sessionId))
      .limit(1);
    if (existing[0]) return existing[0];
    const [row] = await db.insert(creatorRuntimeDebug).values({ sessionId }).returning();
    return row!;
  }

  async updateDebug(sessionId: number, data: Partial<typeof creatorRuntimeDebug.$inferInsert>): Promise<typeof creatorRuntimeDebug.$inferSelect | null> {
    const [row] = await db
      .update(creatorRuntimeDebug)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorRuntimeDebug.sessionId, sessionId))
      .returning();
    return row ?? null;
  }

  // ─── Memory ───────────────────────────────────────────────────────────────────

  async recordMemory(data: typeof creatorRuntimeMemory.$inferInsert): Promise<typeof creatorRuntimeMemory.$inferSelect> {
    const [row] = await db.insert(creatorRuntimeMemory).values(data).returning();
    return row!;
  }

  async findMemoryBySession(sessionId: number, limit = 100): Promise<(typeof creatorRuntimeMemory.$inferSelect)[]> {
    return db
      .select()
      .from(creatorRuntimeMemory)
      .where(eq(creatorRuntimeMemory.sessionId, sessionId))
      .orderBy(desc(creatorRuntimeMemory.sampledAt))
      .limit(limit);
  }
}
