import { db } from "@workspace/db";
import {
  creatorBuildingsTable,
  creatorBuildingFloorsTable,
  creatorBuildingRoomsTable,
  creatorBuildingDoorsTable,
  creatorBuildingWindowsTable,
  creatorBuildingUtilitiesTable,
  creatorBuildingFurnitureTable,
  creatorBuildingNpcsTable,
  creatorBuildingPermissionsTable,
  creatorBuildingSecurityTable,
  creatorBuildingSpawnpointsTable,
  creatorBuildingEventsTable,
  creatorBuildingTemplatesTable,
  creatorBuildingVersionsTable,
  creatorBuildingHistoryTable,
  creatorBuildingStatisticsTable,
  creatorBuildingExportsTable,
  creatorBuildingImportsTable,
  creatorBuildingRuntimeTable,
  creatorBuildingBookmarksTable,
} from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";

type NewBuilding = typeof creatorBuildingsTable.$inferInsert;
type NewFloor = typeof creatorBuildingFloorsTable.$inferInsert;
type NewRoom = typeof creatorBuildingRoomsTable.$inferInsert;
type NewDoor = typeof creatorBuildingDoorsTable.$inferInsert;
type NewWindow = typeof creatorBuildingWindowsTable.$inferInsert;
type NewUtility = typeof creatorBuildingUtilitiesTable.$inferInsert;
type NewFurniture = typeof creatorBuildingFurnitureTable.$inferInsert;
type NewNpc = typeof creatorBuildingNpcsTable.$inferInsert;
type NewPermission = typeof creatorBuildingPermissionsTable.$inferInsert;
type NewSecurity = typeof creatorBuildingSecurityTable.$inferInsert;
type NewSpawnpoint = typeof creatorBuildingSpawnpointsTable.$inferInsert;
type NewEvent = typeof creatorBuildingEventsTable.$inferInsert;

export class BuildingRepository {
  // ─── Buildings ────────────────────────────────────────────────────────────
  async list(userId: number, limit = 20, offset = 0, search?: string) {
    const q = db.select().from(creatorBuildingsTable)
      .where(
        search
          ? and(eq(creatorBuildingsTable.createdBy, userId), ilike(creatorBuildingsTable.name, `%${search}%`))
          : eq(creatorBuildingsTable.createdBy, userId)
      )
      .orderBy(desc(creatorBuildingsTable.updatedAt))
      .limit(limit).offset(offset);
    return q;
  }

  async count(userId: number) {
    const [r] = await db.select({ c: sql<number>`count(*)` }).from(creatorBuildingsTable).where(eq(creatorBuildingsTable.createdBy, userId));
    return Number(r.c);
  }

  async get(id: number) {
    const [b] = await db.select().from(creatorBuildingsTable).where(eq(creatorBuildingsTable.id, id));
    return b ?? null;
  }

  async getFull(id: number) {
    const [building, floors, rooms, doors, windows, furniture, npcs, security, spawnpoints] = await Promise.all([
      this.get(id),
      this.listFloors(id),
      this.listRooms(id),
      this.listDoors(id),
      this.listWindows(id),
      this.listFurniture(id),
      this.listNpcs(id),
      this.getSecurity(id),
      this.listSpawnpoints(id),
    ]);
    return { building, floors, rooms, doors, windows, furniture, npcs, security, spawnpoints };
  }

  async create(data: NewBuilding) {
    const [b] = await db.insert(creatorBuildingsTable).values(data).returning();
    return b;
  }

  async update(id: number, data: Partial<NewBuilding>) {
    const [b] = await db.update(creatorBuildingsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingsTable.id, id)).returning();
    return b;
  }

  async delete(id: number) {
    await db.delete(creatorBuildingsTable).where(eq(creatorBuildingsTable.id, id));
  }

  // ─── Floors ───────────────────────────────────────────────────────────────
  async listFloors(buildingId: number) {
    return db.select().from(creatorBuildingFloorsTable).where(eq(creatorBuildingFloorsTable.buildingId, buildingId)).orderBy(creatorBuildingFloorsTable.floorNumber);
  }

  async getFloor(id: number) {
    const [f] = await db.select().from(creatorBuildingFloorsTable).where(eq(creatorBuildingFloorsTable.id, id));
    return f ?? null;
  }

  async createFloor(data: NewFloor) {
    const [f] = await db.insert(creatorBuildingFloorsTable).values(data).returning();
    return f;
  }

  async updateFloor(id: number, data: Partial<NewFloor>) {
    const [f] = await db.update(creatorBuildingFloorsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingFloorsTable.id, id)).returning();
    return f;
  }

  async deleteFloor(id: number) {
    await db.delete(creatorBuildingFloorsTable).where(eq(creatorBuildingFloorsTable.id, id));
  }

  // ─── Rooms ────────────────────────────────────────────────────────────────
  async listRooms(buildingId: number) {
    return db.select().from(creatorBuildingRoomsTable).where(eq(creatorBuildingRoomsTable.buildingId, buildingId));
  }

  async getRoom(id: number) {
    const [r] = await db.select().from(creatorBuildingRoomsTable).where(eq(creatorBuildingRoomsTable.id, id));
    return r ?? null;
  }

  async createRoom(data: NewRoom) {
    const [r] = await db.insert(creatorBuildingRoomsTable).values(data).returning();
    return r;
  }

  async updateRoom(id: number, data: Partial<NewRoom>) {
    const [r] = await db.update(creatorBuildingRoomsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingRoomsTable.id, id)).returning();
    return r;
  }

  async deleteRoom(id: number) {
    await db.delete(creatorBuildingRoomsTable).where(eq(creatorBuildingRoomsTable.id, id));
  }

  // ─── Doors ────────────────────────────────────────────────────────────────
  async listDoors(buildingId: number) {
    return db.select().from(creatorBuildingDoorsTable).where(eq(creatorBuildingDoorsTable.buildingId, buildingId));
  }

  async getDoor(id: number) {
    const [d] = await db.select().from(creatorBuildingDoorsTable).where(eq(creatorBuildingDoorsTable.id, id));
    return d ?? null;
  }

  async createDoor(data: NewDoor) {
    const [d] = await db.insert(creatorBuildingDoorsTable).values(data).returning();
    return d;
  }

  async updateDoor(id: number, data: Partial<NewDoor>) {
    const [d] = await db.update(creatorBuildingDoorsTable).set(data).where(eq(creatorBuildingDoorsTable.id, id)).returning();
    return d;
  }

  async deleteDoor(id: number) {
    await db.delete(creatorBuildingDoorsTable).where(eq(creatorBuildingDoorsTable.id, id));
  }

  // ─── Windows ──────────────────────────────────────────────────────────────
  async listWindows(buildingId: number) {
    return db.select().from(creatorBuildingWindowsTable).where(eq(creatorBuildingWindowsTable.buildingId, buildingId));
  }

  async getWindow(id: number) {
    const [w] = await db.select().from(creatorBuildingWindowsTable).where(eq(creatorBuildingWindowsTable.id, id));
    return w ?? null;
  }

  async createWindow(data: NewWindow) {
    const [w] = await db.insert(creatorBuildingWindowsTable).values(data).returning();
    return w;
  }

  async updateWindow(id: number, data: Partial<NewWindow>) {
    const [w] = await db.update(creatorBuildingWindowsTable).set(data).where(eq(creatorBuildingWindowsTable.id, id)).returning();
    return w;
  }

  async deleteWindow(id: number) {
    await db.delete(creatorBuildingWindowsTable).where(eq(creatorBuildingWindowsTable.id, id));
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(buildingId: number) {
    return db.select().from(creatorBuildingUtilitiesTable).where(eq(creatorBuildingUtilitiesTable.buildingId, buildingId));
  }

  async getUtility(id: number) {
    const [u] = await db.select().from(creatorBuildingUtilitiesTable).where(eq(creatorBuildingUtilitiesTable.id, id));
    return u ?? null;
  }

  async createUtility(data: NewUtility) {
    const [u] = await db.insert(creatorBuildingUtilitiesTable).values(data).returning();
    return u;
  }

  async updateUtility(id: number, data: Partial<NewUtility>) {
    const [u] = await db.update(creatorBuildingUtilitiesTable).set(data).where(eq(creatorBuildingUtilitiesTable.id, id)).returning();
    return u;
  }

  async deleteUtility(id: number) {
    await db.delete(creatorBuildingUtilitiesTable).where(eq(creatorBuildingUtilitiesTable.id, id));
  }

  // ─── Furniture ────────────────────────────────────────────────────────────
  async listFurniture(buildingId: number) {
    return db.select().from(creatorBuildingFurnitureTable).where(eq(creatorBuildingFurnitureTable.buildingId, buildingId));
  }

  async getFurniture(id: number) {
    const [f] = await db.select().from(creatorBuildingFurnitureTable).where(eq(creatorBuildingFurnitureTable.id, id));
    return f ?? null;
  }

  async createFurniture(data: NewFurniture) {
    const [f] = await db.insert(creatorBuildingFurnitureTable).values(data).returning();
    return f;
  }

  async updateFurniture(id: number, data: Partial<NewFurniture>) {
    const [f] = await db.update(creatorBuildingFurnitureTable).set(data).where(eq(creatorBuildingFurnitureTable.id, id)).returning();
    return f;
  }

  async deleteFurniture(id: number) {
    await db.delete(creatorBuildingFurnitureTable).where(eq(creatorBuildingFurnitureTable.id, id));
  }

  // ─── NPCs ─────────────────────────────────────────────────────────────────
  async listNpcs(buildingId: number) {
    return db.select().from(creatorBuildingNpcsTable).where(eq(creatorBuildingNpcsTable.buildingId, buildingId));
  }

  async getNpc(id: number) {
    const [n] = await db.select().from(creatorBuildingNpcsTable).where(eq(creatorBuildingNpcsTable.id, id));
    return n ?? null;
  }

  async createNpc(data: NewNpc) {
    const [n] = await db.insert(creatorBuildingNpcsTable).values(data).returning();
    return n;
  }

  async updateNpc(id: number, data: Partial<NewNpc>) {
    const [n] = await db.update(creatorBuildingNpcsTable).set(data).where(eq(creatorBuildingNpcsTable.id, id)).returning();
    return n;
  }

  async deleteNpc(id: number) {
    await db.delete(creatorBuildingNpcsTable).where(eq(creatorBuildingNpcsTable.id, id));
  }

  // ─── Permissions ──────────────────────────────────────────────────────────
  async listPermissions(buildingId: number) {
    return db.select().from(creatorBuildingPermissionsTable).where(eq(creatorBuildingPermissionsTable.buildingId, buildingId));
  }

  async createPermission(data: NewPermission) {
    const [p] = await db.insert(creatorBuildingPermissionsTable).values(data).returning();
    return p;
  }

  async updatePermission(id: number, data: Partial<NewPermission>) {
    const [p] = await db.update(creatorBuildingPermissionsTable).set(data).where(eq(creatorBuildingPermissionsTable.id, id)).returning();
    return p;
  }

  async deletePermission(id: number) {
    await db.delete(creatorBuildingPermissionsTable).where(eq(creatorBuildingPermissionsTable.id, id));
  }

  // ─── Security ─────────────────────────────────────────────────────────────
  async getSecurity(buildingId: number) {
    const [s] = await db.select().from(creatorBuildingSecurityTable).where(eq(creatorBuildingSecurityTable.buildingId, buildingId));
    return s ?? null;
  }

  async upsertSecurity(buildingId: number, data: Partial<NewSecurity>) {
    const existing = await this.getSecurity(buildingId);
    if (existing) {
      const [s] = await db.update(creatorBuildingSecurityTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingSecurityTable.buildingId, buildingId)).returning();
      return s;
    }
    const [s] = await db.insert(creatorBuildingSecurityTable).values({ buildingId, ...data } as NewSecurity).returning();
    return s;
  }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────
  async listSpawnpoints(buildingId: number) {
    return db.select().from(creatorBuildingSpawnpointsTable).where(eq(creatorBuildingSpawnpointsTable.buildingId, buildingId));
  }

  async createSpawnpoint(data: NewSpawnpoint) {
    const [s] = await db.insert(creatorBuildingSpawnpointsTable).values(data).returning();
    return s;
  }

  async updateSpawnpoint(id: number, data: Partial<NewSpawnpoint>) {
    const [s] = await db.update(creatorBuildingSpawnpointsTable).set(data).where(eq(creatorBuildingSpawnpointsTable.id, id)).returning();
    return s;
  }

  async deleteSpawnpoint(id: number) {
    await db.delete(creatorBuildingSpawnpointsTable).where(eq(creatorBuildingSpawnpointsTable.id, id));
  }

  // ─── Events ───────────────────────────────────────────────────────────────
  async listEvents(buildingId: number) {
    return db.select().from(creatorBuildingEventsTable).where(eq(creatorBuildingEventsTable.buildingId, buildingId));
  }

  async createEvent(data: NewEvent) {
    const [e] = await db.insert(creatorBuildingEventsTable).values(data).returning();
    return e;
  }

  async updateEvent(id: number, data: Partial<NewEvent>) {
    const [e] = await db.update(creatorBuildingEventsTable).set(data).where(eq(creatorBuildingEventsTable.id, id)).returning();
    return e;
  }

  async deleteEvent(id: number) {
    await db.delete(creatorBuildingEventsTable).where(eq(creatorBuildingEventsTable.id, id));
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  async getTemplates(global: boolean) {
    return db.select().from(creatorBuildingTemplatesTable).where(eq(creatorBuildingTemplatesTable.isGlobal, global)).orderBy(desc(creatorBuildingTemplatesTable.createdAt));
  }

  async createTemplate(data: typeof creatorBuildingTemplatesTable.$inferInsert) {
    const [t] = await db.insert(creatorBuildingTemplatesTable).values(data).returning();
    return t;
  }

  async deleteTemplate(id: number) {
    await db.delete(creatorBuildingTemplatesTable).where(eq(creatorBuildingTemplatesTable.id, id));
  }

  // ─── Versions ─────────────────────────────────────────────────────────────
  async listVersions(buildingId: number) {
    return db.select().from(creatorBuildingVersionsTable).where(eq(creatorBuildingVersionsTable.buildingId, buildingId)).orderBy(desc(creatorBuildingVersionsTable.version));
  }

  async createVersion(data: typeof creatorBuildingVersionsTable.$inferInsert) {
    const [v] = await db.insert(creatorBuildingVersionsTable).values(data).returning();
    return v;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  async listHistory(buildingId: number) {
    return db.select().from(creatorBuildingHistoryTable).where(eq(creatorBuildingHistoryTable.buildingId, buildingId)).orderBy(desc(creatorBuildingHistoryTable.createdAt)).limit(100);
  }

  async addHistory(buildingId: number, action: string, userId: number, entityType?: string, entityId?: number, diff?: unknown) {
    await db.insert(creatorBuildingHistoryTable).values({ buildingId, action, userId, entityType, entityId, diff: diff as Record<string, unknown> });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(buildingId: number) {
    const [s] = await db.select().from(creatorBuildingStatisticsTable).where(eq(creatorBuildingStatisticsTable.buildingId, buildingId));
    return s ?? null;
  }

  async upsertStatistics(buildingId: number, data: Partial<typeof creatorBuildingStatisticsTable.$inferInsert>) {
    const existing = await this.getStatistics(buildingId);
    if (existing) {
      const [s] = await db.update(creatorBuildingStatisticsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingStatisticsTable.buildingId, buildingId)).returning();
      return s;
    }
    const [s] = await db.insert(creatorBuildingStatisticsTable).values({ buildingId, ...data } as typeof creatorBuildingStatisticsTable.$inferInsert).returning();
    return s;
  }

  // ─── Exports / Imports ────────────────────────────────────────────────────
  async listExports(buildingId: number) {
    return db.select().from(creatorBuildingExportsTable).where(eq(creatorBuildingExportsTable.buildingId, buildingId)).orderBy(desc(creatorBuildingExportsTable.createdAt));
  }

  async addExport(buildingId: number, exportedBy: number, format: string, payload: unknown, checksum?: string) {
    const [e] = await db.insert(creatorBuildingExportsTable).values({ buildingId, exportedBy, format, payload: payload as Record<string, unknown>, checksum }).returning();
    return e;
  }

  async listImports(buildingId: number) {
    return db.select().from(creatorBuildingImportsTable).where(eq(creatorBuildingImportsTable.buildingId, buildingId)).orderBy(desc(creatorBuildingImportsTable.createdAt));
  }

  async addImport(buildingId: number, importedBy: number, format: string, status: string, errors?: unknown) {
    const [i] = await db.insert(creatorBuildingImportsTable).values({ buildingId, importedBy, format, status, errors: errors as Record<string, unknown> }).returning();
    return i;
  }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async listRuntime(buildingId: number) {
    return db.select().from(creatorBuildingRuntimeTable).where(eq(creatorBuildingRuntimeTable.buildingId, buildingId)).orderBy(desc(creatorBuildingRuntimeTable.startedAt));
  }

  async getRuntime(sessionId: string) {
    const [r] = await db.select().from(creatorBuildingRuntimeTable).where(eq(creatorBuildingRuntimeTable.sessionId, sessionId));
    return r ?? null;
  }

  async createRuntime(buildingId: number, sessionId: string) {
    const [r] = await db.insert(creatorBuildingRuntimeTable).values({ buildingId, sessionId }).returning();
    return r;
  }

  async updateRuntime(sessionId: string, data: Partial<typeof creatorBuildingRuntimeTable.$inferInsert>) {
    const [r] = await db.update(creatorBuildingRuntimeTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorBuildingRuntimeTable.sessionId, sessionId)).returning();
    return r;
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  async listBookmarks(userId: number) {
    return db.select().from(creatorBuildingBookmarksTable).where(eq(creatorBuildingBookmarksTable.userId, userId));
  }

  async addBookmark(userId: number, buildingId: number, label?: string) {
    const [b] = await db.insert(creatorBuildingBookmarksTable).values({ userId, buildingId, label }).returning();
    return b;
  }

  async deleteBookmark(id: number) {
    await db.delete(creatorBuildingBookmarksTable).where(eq(creatorBuildingBookmarksTable.id, id));
  }
}
