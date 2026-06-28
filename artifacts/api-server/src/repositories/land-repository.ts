import { db } from "@workspace/db";
import {
  creatorLandsTable,
  creatorLandParcelsTable,
  creatorLandBoundariesTable,
  creatorLandOwnersTable,
  creatorLandZonesTable,
  creatorLandTerrainTable,
  creatorLandUtilitiesTable,
  creatorLandRoadsTable,
  creatorLandTeleportsTable,
  creatorLandBuildingsTable,
  creatorLandBookmarksTable,
  creatorLandTemplatesTable,
  creatorLandVersionsTable,
  creatorLandHistoryTable,
  creatorLandStatisticsTable,
  creatorLandExportsTable,
  creatorLandImportsTable,
  creatorLandRuntimeTable,
  creatorLandPermissionsTable,
  creatorLandMarketplaceTable,
} from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";

type NewLand = typeof creatorLandsTable.$inferInsert;
type NewParcel = typeof creatorLandParcelsTable.$inferInsert;
type NewBoundary = typeof creatorLandBoundariesTable.$inferInsert;
type NewOwner = typeof creatorLandOwnersTable.$inferInsert;
type NewZone = typeof creatorLandZonesTable.$inferInsert;
type NewTerrain = typeof creatorLandTerrainTable.$inferInsert;
type NewUtility = typeof creatorLandUtilitiesTable.$inferInsert;
type NewRoad = typeof creatorLandRoadsTable.$inferInsert;
type NewTeleport = typeof creatorLandTeleportsTable.$inferInsert;
type NewBuilding = typeof creatorLandBuildingsTable.$inferInsert;

export class LandRepository {
  // ─── Lands ────────────────────────────────────────────────────────────────
  async list(userId: number, limit = 20, offset = 0, search?: string) {
    return db.select().from(creatorLandsTable)
      .where(search
        ? and(eq(creatorLandsTable.createdBy, userId), ilike(creatorLandsTable.name, `%${search}%`))
        : eq(creatorLandsTable.createdBy, userId))
      .orderBy(desc(creatorLandsTable.updatedAt)).limit(limit).offset(offset);
  }

  async count(userId: number) {
    const [r] = await db.select({ c: sql<number>`count(*)` }).from(creatorLandsTable).where(eq(creatorLandsTable.createdBy, userId));
    return Number(r.c);
  }

  async get(id: number) {
    const [r] = await db.select().from(creatorLandsTable).where(eq(creatorLandsTable.id, id));
    return r ?? null;
  }

  async create(data: NewLand) {
    const [r] = await db.insert(creatorLandsTable).values(data).returning();
    return r;
  }

  async update(id: number, data: Partial<NewLand>) {
    const [r] = await db.update(creatorLandsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandsTable.id, id)).returning();
    return r;
  }

  async delete(id: number) {
    await db.delete(creatorLandsTable).where(eq(creatorLandsTable.id, id));
  }

  // ─── Parcels ──────────────────────────────────────────────────────────────
  async listParcels(landId: number) {
    return db.select().from(creatorLandParcelsTable).where(eq(creatorLandParcelsTable.landId, landId));
  }

  async getParcel(id: number) {
    const [r] = await db.select().from(creatorLandParcelsTable).where(eq(creatorLandParcelsTable.id, id));
    return r ?? null;
  }

  async createParcel(data: NewParcel) {
    const [r] = await db.insert(creatorLandParcelsTable).values(data).returning();
    return r;
  }

  async updateParcel(id: number, data: Partial<NewParcel>) {
    const [r] = await db.update(creatorLandParcelsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandParcelsTable.id, id)).returning();
    return r;
  }

  async deleteParcel(id: number) {
    await db.delete(creatorLandParcelsTable).where(eq(creatorLandParcelsTable.id, id));
  }

  // ─── Boundaries ───────────────────────────────────────────────────────────
  async listBoundaries(landId: number) {
    return db.select().from(creatorLandBoundariesTable).where(eq(creatorLandBoundariesTable.landId, landId));
  }

  async getBoundary(id: number) {
    const [r] = await db.select().from(creatorLandBoundariesTable).where(eq(creatorLandBoundariesTable.id, id));
    return r ?? null;
  }

  async createBoundary(data: NewBoundary) {
    const [r] = await db.insert(creatorLandBoundariesTable).values(data).returning();
    return r;
  }

  async updateBoundary(id: number, data: Partial<NewBoundary>) {
    const [r] = await db.update(creatorLandBoundariesTable).set(data).where(eq(creatorLandBoundariesTable.id, id)).returning();
    return r;
  }

  async deleteBoundary(id: number) {
    await db.delete(creatorLandBoundariesTable).where(eq(creatorLandBoundariesTable.id, id));
  }

  // ─── Owners ───────────────────────────────────────────────────────────────
  async listOwners(landId: number) {
    return db.select().from(creatorLandOwnersTable).where(eq(creatorLandOwnersTable.landId, landId));
  }

  async createOwner(data: NewOwner) {
    const [r] = await db.insert(creatorLandOwnersTable).values(data).returning();
    return r;
  }

  async updateOwner(id: number, data: Partial<NewOwner>) {
    const [r] = await db.update(creatorLandOwnersTable).set(data).where(eq(creatorLandOwnersTable.id, id)).returning();
    return r;
  }

  async deleteOwner(id: number) {
    await db.delete(creatorLandOwnersTable).where(eq(creatorLandOwnersTable.id, id));
  }

  // ─── Zones ────────────────────────────────────────────────────────────────
  async listZones(landId: number) {
    return db.select().from(creatorLandZonesTable).where(eq(creatorLandZonesTable.landId, landId));
  }

  async getZone(id: number) {
    const [r] = await db.select().from(creatorLandZonesTable).where(eq(creatorLandZonesTable.id, id));
    return r ?? null;
  }

  async createZone(data: NewZone) {
    const [r] = await db.insert(creatorLandZonesTable).values(data).returning();
    return r;
  }

  async updateZone(id: number, data: Partial<NewZone>) {
    const [r] = await db.update(creatorLandZonesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandZonesTable.id, id)).returning();
    return r;
  }

  async deleteZone(id: number) {
    await db.delete(creatorLandZonesTable).where(eq(creatorLandZonesTable.id, id));
  }

  // ─── Terrain ──────────────────────────────────────────────────────────────
  async getTerrain(landId: number) {
    const [r] = await db.select().from(creatorLandTerrainTable).where(eq(creatorLandTerrainTable.landId, landId));
    return r ?? null;
  }

  async upsertTerrain(data: NewTerrain) {
    const existing = await this.getTerrain(data.landId);
    if (existing) {
      const [r] = await db.update(creatorLandTerrainTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandTerrainTable.landId, data.landId)).returning();
      return r;
    }
    const [r] = await db.insert(creatorLandTerrainTable).values(data).returning();
    return r;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(landId: number) {
    return db.select().from(creatorLandUtilitiesTable).where(eq(creatorLandUtilitiesTable.landId, landId));
  }

  async getUtility(id: number) {
    const [r] = await db.select().from(creatorLandUtilitiesTable).where(eq(creatorLandUtilitiesTable.id, id));
    return r ?? null;
  }

  async createUtility(data: NewUtility) {
    const [r] = await db.insert(creatorLandUtilitiesTable).values(data).returning();
    return r;
  }

  async updateUtility(id: number, data: Partial<NewUtility>) {
    const [r] = await db.update(creatorLandUtilitiesTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandUtilitiesTable.id, id)).returning();
    return r;
  }

  async deleteUtility(id: number) {
    await db.delete(creatorLandUtilitiesTable).where(eq(creatorLandUtilitiesTable.id, id));
  }

  // ─── Roads ────────────────────────────────────────────────────────────────
  async listRoads(landId: number) {
    return db.select().from(creatorLandRoadsTable).where(eq(creatorLandRoadsTable.landId, landId));
  }

  async getRoad(id: number) {
    const [r] = await db.select().from(creatorLandRoadsTable).where(eq(creatorLandRoadsTable.id, id));
    return r ?? null;
  }

  async createRoad(data: NewRoad) {
    const [r] = await db.insert(creatorLandRoadsTable).values(data).returning();
    return r;
  }

  async updateRoad(id: number, data: Partial<NewRoad>) {
    const [r] = await db.update(creatorLandRoadsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandRoadsTable.id, id)).returning();
    return r;
  }

  async deleteRoad(id: number) {
    await db.delete(creatorLandRoadsTable).where(eq(creatorLandRoadsTable.id, id));
  }

  // ─── Teleports ────────────────────────────────────────────────────────────
  async listTeleports(landId: number) {
    return db.select().from(creatorLandTeleportsTable).where(eq(creatorLandTeleportsTable.landId, landId));
  }

  async getTeleport(id: number) {
    const [r] = await db.select().from(creatorLandTeleportsTable).where(eq(creatorLandTeleportsTable.id, id));
    return r ?? null;
  }

  async createTeleport(data: NewTeleport) {
    const [r] = await db.insert(creatorLandTeleportsTable).values(data).returning();
    return r;
  }

  async updateTeleport(id: number, data: Partial<NewTeleport>) {
    const [r] = await db.update(creatorLandTeleportsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandTeleportsTable.id, id)).returning();
    return r;
  }

  async deleteTeleport(id: number) {
    await db.delete(creatorLandTeleportsTable).where(eq(creatorLandTeleportsTable.id, id));
  }

  // ─── Land Buildings ───────────────────────────────────────────────────────
  async listBuildings(landId: number) {
    return db.select().from(creatorLandBuildingsTable).where(eq(creatorLandBuildingsTable.landId, landId));
  }

  async getLandBuilding(id: number) {
    const [r] = await db.select().from(creatorLandBuildingsTable).where(eq(creatorLandBuildingsTable.id, id));
    return r ?? null;
  }

  async createBuilding(data: NewBuilding) {
    const [r] = await db.insert(creatorLandBuildingsTable).values(data).returning();
    return r;
  }

  async updateBuilding(id: number, data: Partial<NewBuilding>) {
    const [r] = await db.update(creatorLandBuildingsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandBuildingsTable.id, id)).returning();
    return r;
  }

  async deleteLandBuilding(id: number) {
    await db.delete(creatorLandBuildingsTable).where(eq(creatorLandBuildingsTable.id, id));
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  async listBookmarks(userId: number) {
    return db.select().from(creatorLandBookmarksTable).where(eq(creatorLandBookmarksTable.userId, userId));
  }

  async addBookmark(userId: number, landId: number, label?: string) {
    const [r] = await db.insert(creatorLandBookmarksTable).values({ userId, landId, label }).returning();
    return r;
  }

  async deleteBookmark(id: number) {
    await db.delete(creatorLandBookmarksTable).where(eq(creatorLandBookmarksTable.id, id));
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  async listTemplates(global: boolean) {
    return db.select().from(creatorLandTemplatesTable).where(eq(creatorLandTemplatesTable.isGlobal, global));
  }

  async getTemplate(id: number) {
    const [r] = await db.select().from(creatorLandTemplatesTable).where(eq(creatorLandTemplatesTable.id, id));
    return r ?? null;
  }

  async createTemplate(data: typeof creatorLandTemplatesTable.$inferInsert) {
    const [r] = await db.insert(creatorLandTemplatesTable).values(data).returning();
    return r;
  }

  async deleteTemplate(id: number) {
    await db.delete(creatorLandTemplatesTable).where(eq(creatorLandTemplatesTable.id, id));
  }

  // ─── Versions ─────────────────────────────────────────────────────────────
  async listVersions(landId: number) {
    return db.select().from(creatorLandVersionsTable).where(eq(creatorLandVersionsTable.landId, landId)).orderBy(desc(creatorLandVersionsTable.version));
  }

  async createVersion(data: typeof creatorLandVersionsTable.$inferInsert) {
    const [r] = await db.insert(creatorLandVersionsTable).values(data).returning();
    return r;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  async listHistory(landId: number) {
    return db.select().from(creatorLandHistoryTable).where(eq(creatorLandHistoryTable.landId, landId)).orderBy(desc(creatorLandHistoryTable.createdAt)).limit(50);
  }

  async addHistory(landId: number, action: string, performedBy: number, entityType = "land", entityId?: number) {
    const [r] = await db.insert(creatorLandHistoryTable).values({ landId, action, performedBy, entityType, entityId }).returning();
    return r;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(landId: number) {
    const [r] = await db.select().from(creatorLandStatisticsTable).where(eq(creatorLandStatisticsTable.landId, landId));
    return r ?? null;
  }

  async upsertStatistics(landId: number, data: Partial<typeof creatorLandStatisticsTable.$inferInsert>) {
    const existing = await this.getStatistics(landId);
    if (existing) {
      const [r] = await db.update(creatorLandStatisticsTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandStatisticsTable.landId, landId)).returning();
      return r;
    }
    const [r] = await db.insert(creatorLandStatisticsTable).values({ landId, ...data }).returning();
    return r;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────
  async listExports(landId: number) {
    return db.select().from(creatorLandExportsTable).where(eq(creatorLandExportsTable.landId, landId)).orderBy(desc(creatorLandExportsTable.createdAt));
  }

  async createExport(landId: number, format: string, payload: Record<string, unknown>, checksum: string, exportedBy: number) {
    const [r] = await db.insert(creatorLandExportsTable).values({ landId, format, payload, checksum, exportedBy }).returning();
    return r;
  }

  // ─── Imports ──────────────────────────────────────────────────────────────
  async listImports(landId: number) {
    return db.select().from(creatorLandImportsTable).where(eq(creatorLandImportsTable.landId, landId)).orderBy(desc(creatorLandImportsTable.createdAt));
  }

  async createImport(landId: number, format: string, payload: Record<string, unknown>, importedBy: number) {
    const [r] = await db.insert(creatorLandImportsTable).values({ landId, format, payload, importedBy }).returning();
    return r;
  }

  async updateImportStatus(id: number, status: string, errors?: string[]) {
    const [r] = await db.update(creatorLandImportsTable).set({ status, errors }).where(eq(creatorLandImportsTable.id, id)).returning();
    return r;
  }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async getRuntime(landId: number) {
    const [r] = await db.select().from(creatorLandRuntimeTable).where(eq(creatorLandRuntimeTable.landId, landId));
    return r ?? null;
  }

  async upsertRuntime(landId: number, data: Partial<typeof creatorLandRuntimeTable.$inferInsert>) {
    const existing = await this.getRuntime(landId);
    if (existing) {
      const [r] = await db.update(creatorLandRuntimeTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandRuntimeTable.landId, landId)).returning();
      return r;
    }
    const [r] = await db.insert(creatorLandRuntimeTable).values({ landId, ...data }).returning();
    return r;
  }

  // ─── Permissions ──────────────────────────────────────────────────────────
  async listPermissions(landId: number) {
    return db.select().from(creatorLandPermissionsTable).where(eq(creatorLandPermissionsTable.landId, landId));
  }

  async upsertPermission(data: typeof creatorLandPermissionsTable.$inferInsert) {
    const [r] = await db.insert(creatorLandPermissionsTable).values(data).returning();
    return r;
  }

  async deletePermission(id: number) {
    await db.delete(creatorLandPermissionsTable).where(eq(creatorLandPermissionsTable.id, id));
  }

  // ─── Marketplace ──────────────────────────────────────────────────────────
  async listMarketplace(landId: number) {
    return db.select().from(creatorLandMarketplaceTable).where(eq(creatorLandMarketplaceTable.landId, landId));
  }

  async createListing(data: typeof creatorLandMarketplaceTable.$inferInsert) {
    const [r] = await db.insert(creatorLandMarketplaceTable).values(data).returning();
    return r;
  }

  async updateListing(id: number, data: Partial<typeof creatorLandMarketplaceTable.$inferInsert>) {
    const [r] = await db.update(creatorLandMarketplaceTable).set({ ...data, updatedAt: new Date() }).where(eq(creatorLandMarketplaceTable.id, id)).returning();
    return r;
  }

  async deleteListing(id: number) {
    await db.delete(creatorLandMarketplaceTable).where(eq(creatorLandMarketplaceTable.id, id));
  }
}
