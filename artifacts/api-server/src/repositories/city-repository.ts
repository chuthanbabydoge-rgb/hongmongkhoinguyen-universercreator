import { db } from "@workspace/db";
import {
  creatorCities, creatorCitySettings, creatorCityDistricts, creatorCityZones,
  creatorCityRoads, creatorCityIntersections, creatorCityBuildings, creatorCityUtilities,
  creatorCityTransport, creatorCityPopulation, creatorCityServices, creatorCitySpawnpoints,
  creatorCityLandmarks, creatorCityTemplates, creatorCityVersions, creatorCityHistory,
  creatorCityStatistics, creatorCityExports, creatorCityImports, creatorCityRuntime,
} from "@workspace/db";
import { eq, desc, ilike, and } from "drizzle-orm";

export class CityRepository {
  // ─── Cities ───────────────────────────────────────────────────────────────
  async list(userId: number, limit = 20, offset = 0, search?: string) {
    const q = db.select().from(creatorCities);
    if (search) {
      return q.where(and(eq(creatorCities.createdBy, userId), ilike(creatorCities.name, `%${search}%`))).limit(limit).offset(offset).orderBy(desc(creatorCities.updatedAt));
    }
    return q.where(eq(creatorCities.createdBy, userId)).limit(limit).offset(offset).orderBy(desc(creatorCities.updatedAt));
  }

  async count(userId: number) {
    const rows = await db.select().from(creatorCities).where(eq(creatorCities.createdBy, userId));
    return rows.length;
  }

  async get(id: number) {
    const [row] = await db.select().from(creatorCities).where(eq(creatorCities.id, id));
    return row ?? null;
  }

  async create(data: typeof creatorCities.$inferInsert) {
    const [row] = await db.insert(creatorCities).values(data).returning();
    return row;
  }

  async update(id: number, data: Partial<typeof creatorCities.$inferInsert>) {
    const [row] = await db.update(creatorCities).set({ ...data, updatedAt: new Date() }).where(eq(creatorCities.id, id)).returning();
    return row;
  }

  async delete(id: number) {
    await db.delete(creatorCities).where(eq(creatorCities.id, id));
  }

  // ─── Settings ─────────────────────────────────────────────────────────────
  async getSettings(cityId: number) {
    const [row] = await db.select().from(creatorCitySettings).where(eq(creatorCitySettings.cityId, cityId));
    return row ?? null;
  }

  async upsertSettings(cityId: number, data: Partial<typeof creatorCitySettings.$inferInsert>) {
    const existing = await this.getSettings(cityId);
    if (existing) {
      const [row] = await db.update(creatorCitySettings).set({ ...data, updatedAt: new Date() }).where(eq(creatorCitySettings.cityId, cityId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorCitySettings).values({ cityId, ...data }).returning();
    return row;
  }

  // ─── Districts ────────────────────────────────────────────────────────────
  async listDistricts(cityId: number) {
    return db.select().from(creatorCityDistricts).where(eq(creatorCityDistricts.cityId, cityId)).orderBy(creatorCityDistricts.displayOrder);
  }

  async getDistrict(id: number) {
    const [row] = await db.select().from(creatorCityDistricts).where(eq(creatorCityDistricts.id, id));
    return row ?? null;
  }

  async createDistrict(data: typeof creatorCityDistricts.$inferInsert) {
    const [row] = await db.insert(creatorCityDistricts).values(data).returning();
    return row;
  }

  async updateDistrict(id: number, data: Partial<typeof creatorCityDistricts.$inferInsert>) {
    const [row] = await db.update(creatorCityDistricts).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityDistricts.id, id)).returning();
    return row;
  }

  async deleteDistrict(id: number) {
    await db.delete(creatorCityDistricts).where(eq(creatorCityDistricts.id, id));
  }

  // ─── Zones ────────────────────────────────────────────────────────────────
  async listZones(cityId: number) {
    return db.select().from(creatorCityZones).where(eq(creatorCityZones.cityId, cityId));
  }

  async getZone(id: number) {
    const [row] = await db.select().from(creatorCityZones).where(eq(creatorCityZones.id, id));
    return row ?? null;
  }

  async createZone(data: typeof creatorCityZones.$inferInsert) {
    const [row] = await db.insert(creatorCityZones).values(data).returning();
    return row;
  }

  async updateZone(id: number, data: Partial<typeof creatorCityZones.$inferInsert>) {
    const [row] = await db.update(creatorCityZones).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityZones.id, id)).returning();
    return row;
  }

  async deleteZone(id: number) {
    await db.delete(creatorCityZones).where(eq(creatorCityZones.id, id));
  }

  // ─── Roads ────────────────────────────────────────────────────────────────
  async listRoads(cityId: number) {
    return db.select().from(creatorCityRoads).where(eq(creatorCityRoads.cityId, cityId));
  }

  async getRoad(id: number) {
    const [row] = await db.select().from(creatorCityRoads).where(eq(creatorCityRoads.id, id));
    return row ?? null;
  }

  async createRoad(data: typeof creatorCityRoads.$inferInsert) {
    const [row] = await db.insert(creatorCityRoads).values(data).returning();
    return row;
  }

  async updateRoad(id: number, data: Partial<typeof creatorCityRoads.$inferInsert>) {
    const [row] = await db.update(creatorCityRoads).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityRoads.id, id)).returning();
    return row;
  }

  async deleteRoad(id: number) {
    await db.delete(creatorCityRoads).where(eq(creatorCityRoads.id, id));
  }

  // ─── Intersections ────────────────────────────────────────────────────────
  async listIntersections(cityId: number) {
    return db.select().from(creatorCityIntersections).where(eq(creatorCityIntersections.cityId, cityId));
  }

  async createIntersection(data: typeof creatorCityIntersections.$inferInsert) {
    const [row] = await db.insert(creatorCityIntersections).values(data).returning();
    return row;
  }

  async updateIntersection(id: number, data: Partial<typeof creatorCityIntersections.$inferInsert>) {
    const [row] = await db.update(creatorCityIntersections).set(data).where(eq(creatorCityIntersections.id, id)).returning();
    return row;
  }

  async deleteIntersection(id: number) {
    await db.delete(creatorCityIntersections).where(eq(creatorCityIntersections.id, id));
  }

  // ─── Buildings ────────────────────────────────────────────────────────────
  async listBuildings(cityId: number) {
    return db.select().from(creatorCityBuildings).where(eq(creatorCityBuildings.cityId, cityId));
  }

  async getBuilding(id: number) {
    const [row] = await db.select().from(creatorCityBuildings).where(eq(creatorCityBuildings.id, id));
    return row ?? null;
  }

  async createBuilding(data: typeof creatorCityBuildings.$inferInsert) {
    const [row] = await db.insert(creatorCityBuildings).values(data).returning();
    return row;
  }

  async updateBuilding(id: number, data: Partial<typeof creatorCityBuildings.$inferInsert>) {
    const [row] = await db.update(creatorCityBuildings).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityBuildings.id, id)).returning();
    return row;
  }

  async deleteBuilding(id: number) {
    await db.delete(creatorCityBuildings).where(eq(creatorCityBuildings.id, id));
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  async listUtilities(cityId: number) {
    return db.select().from(creatorCityUtilities).where(eq(creatorCityUtilities.cityId, cityId));
  }

  async getUtility(id: number) {
    const [row] = await db.select().from(creatorCityUtilities).where(eq(creatorCityUtilities.id, id));
    return row ?? null;
  }

  async createUtility(data: typeof creatorCityUtilities.$inferInsert) {
    const [row] = await db.insert(creatorCityUtilities).values(data).returning();
    return row;
  }

  async updateUtility(id: number, data: Partial<typeof creatorCityUtilities.$inferInsert>) {
    const [row] = await db.update(creatorCityUtilities).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityUtilities.id, id)).returning();
    return row;
  }

  async deleteUtility(id: number) {
    await db.delete(creatorCityUtilities).where(eq(creatorCityUtilities.id, id));
  }

  // ─── Transport ────────────────────────────────────────────────────────────
  async listTransport(cityId: number) {
    return db.select().from(creatorCityTransport).where(eq(creatorCityTransport.cityId, cityId));
  }

  async getTransport(id: number) {
    const [row] = await db.select().from(creatorCityTransport).where(eq(creatorCityTransport.id, id));
    return row ?? null;
  }

  async createTransport(data: typeof creatorCityTransport.$inferInsert) {
    const [row] = await db.insert(creatorCityTransport).values(data).returning();
    return row;
  }

  async updateTransport(id: number, data: Partial<typeof creatorCityTransport.$inferInsert>) {
    const [row] = await db.update(creatorCityTransport).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityTransport.id, id)).returning();
    return row;
  }

  async deleteTransport(id: number) {
    await db.delete(creatorCityTransport).where(eq(creatorCityTransport.id, id));
  }

  // ─── Population ───────────────────────────────────────────────────────────
  async getPopulation(cityId: number) {
    const [row] = await db.select().from(creatorCityPopulation).where(eq(creatorCityPopulation.cityId, cityId));
    return row ?? null;
  }

  async upsertPopulation(cityId: number, data: Partial<typeof creatorCityPopulation.$inferInsert>) {
    const existing = await this.getPopulation(cityId);
    if (existing) {
      const [row] = await db.update(creatorCityPopulation).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityPopulation.cityId, cityId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorCityPopulation).values({ cityId, ...data }).returning();
    return row;
  }

  // ─── Services ─────────────────────────────────────────────────────────────
  async listServices(cityId: number) {
    return db.select().from(creatorCityServices).where(eq(creatorCityServices.cityId, cityId));
  }

  async getService(id: number) {
    const [row] = await db.select().from(creatorCityServices).where(eq(creatorCityServices.id, id));
    return row ?? null;
  }

  async createService(data: typeof creatorCityServices.$inferInsert) {
    const [row] = await db.insert(creatorCityServices).values(data).returning();
    return row;
  }

  async updateService(id: number, data: Partial<typeof creatorCityServices.$inferInsert>) {
    const [row] = await db.update(creatorCityServices).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityServices.id, id)).returning();
    return row;
  }

  async deleteService(id: number) {
    await db.delete(creatorCityServices).where(eq(creatorCityServices.id, id));
  }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────
  async listSpawnpoints(cityId: number) {
    return db.select().from(creatorCitySpawnpoints).where(eq(creatorCitySpawnpoints.cityId, cityId));
  }

  async createSpawnpoint(data: typeof creatorCitySpawnpoints.$inferInsert) {
    const [row] = await db.insert(creatorCitySpawnpoints).values(data).returning();
    return row;
  }

  async updateSpawnpoint(id: number, data: Partial<typeof creatorCitySpawnpoints.$inferInsert>) {
    const [row] = await db.update(creatorCitySpawnpoints).set(data).where(eq(creatorCitySpawnpoints.id, id)).returning();
    return row;
  }

  async deleteSpawnpoint(id: number) {
    await db.delete(creatorCitySpawnpoints).where(eq(creatorCitySpawnpoints.id, id));
  }

  // ─── Landmarks ────────────────────────────────────────────────────────────
  async listLandmarks(cityId: number) {
    return db.select().from(creatorCityLandmarks).where(eq(creatorCityLandmarks.cityId, cityId));
  }

  async createLandmark(data: typeof creatorCityLandmarks.$inferInsert) {
    const [row] = await db.insert(creatorCityLandmarks).values(data).returning();
    return row;
  }

  async updateLandmark(id: number, data: Partial<typeof creatorCityLandmarks.$inferInsert>) {
    const [row] = await db.update(creatorCityLandmarks).set(data).where(eq(creatorCityLandmarks.id, id)).returning();
    return row;
  }

  async deleteLandmark(id: number) {
    await db.delete(creatorCityLandmarks).where(eq(creatorCityLandmarks.id, id));
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  async listTemplates(isPublic?: boolean) {
    if (isPublic !== undefined) {
      return db.select().from(creatorCityTemplates).where(eq(creatorCityTemplates.isPublic, isPublic)).orderBy(desc(creatorCityTemplates.usageCount));
    }
    return db.select().from(creatorCityTemplates).orderBy(desc(creatorCityTemplates.usageCount));
  }

  async getTemplate(id: number) {
    const [row] = await db.select().from(creatorCityTemplates).where(eq(creatorCityTemplates.id, id));
    return row ?? null;
  }

  async createTemplate(data: typeof creatorCityTemplates.$inferInsert) {
    const [row] = await db.insert(creatorCityTemplates).values(data).returning();
    return row;
  }

  async deleteTemplate(id: number) {
    await db.delete(creatorCityTemplates).where(eq(creatorCityTemplates.id, id));
  }

  // ─── Versions ─────────────────────────────────────────────────────────────
  async listVersions(cityId: number) {
    return db.select().from(creatorCityVersions).where(eq(creatorCityVersions.cityId, cityId)).orderBy(desc(creatorCityVersions.version));
  }

  async createVersion(data: typeof creatorCityVersions.$inferInsert) {
    const [row] = await db.insert(creatorCityVersions).values(data).returning();
    return row;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  async listHistory(cityId: number) {
    return db.select().from(creatorCityHistory).where(eq(creatorCityHistory.cityId, cityId)).orderBy(desc(creatorCityHistory.createdAt)).limit(100);
  }

  async addHistory(cityId: number, action: string, changedBy: number, field?: string, oldValue?: string, newValue?: string) {
    await db.insert(creatorCityHistory).values({ cityId, action, changedBy, field, oldValue, newValue });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(cityId: number) {
    const [row] = await db.select().from(creatorCityStatistics).where(eq(creatorCityStatistics.cityId, cityId));
    return row ?? null;
  }

  async upsertStatistics(cityId: number, data: Partial<typeof creatorCityStatistics.$inferInsert>) {
    const existing = await this.getStatistics(cityId);
    if (existing) {
      const [row] = await db.update(creatorCityStatistics).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityStatistics.cityId, cityId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorCityStatistics).values({ cityId, ...data }).returning();
    return row;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────
  async listExports(cityId: number) {
    return db.select().from(creatorCityExports).where(eq(creatorCityExports.cityId, cityId)).orderBy(desc(creatorCityExports.createdAt));
  }

  async createExport(data: typeof creatorCityExports.$inferInsert) {
    const [row] = await db.insert(creatorCityExports).values(data).returning();
    return row;
  }

  // ─── Imports ──────────────────────────────────────────────────────────────
  async listImports(cityId: number) {
    return db.select().from(creatorCityImports).where(eq(creatorCityImports.cityId, cityId)).orderBy(desc(creatorCityImports.createdAt));
  }

  async createImport(data: typeof creatorCityImports.$inferInsert) {
    const [row] = await db.insert(creatorCityImports).values(data).returning();
    return row;
  }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async listRuntime(cityId: number) {
    return db.select().from(creatorCityRuntime).where(eq(creatorCityRuntime.cityId, cityId)).orderBy(desc(creatorCityRuntime.createdAt));
  }

  async getRuntime(sessionId: string) {
    const [row] = await db.select().from(creatorCityRuntime).where(eq(creatorCityRuntime.sessionId, sessionId));
    return row ?? null;
  }

  async createRuntime(data: typeof creatorCityRuntime.$inferInsert) {
    const [row] = await db.insert(creatorCityRuntime).values(data).returning();
    return row;
  }

  async updateRuntime(sessionId: string, data: Partial<typeof creatorCityRuntime.$inferInsert>) {
    const [row] = await db.update(creatorCityRuntime).set({ ...data, updatedAt: new Date() }).where(eq(creatorCityRuntime.sessionId, sessionId)).returning();
    return row;
  }

  // ─── Full City ────────────────────────────────────────────────────────────
  async getFull(id: number) {
    const city = await this.get(id);
    if (!city) return null;
    const [settings, districts, zones, roads, buildings, utilities, transport, population, services, spawnpoints, landmarks] = await Promise.all([
      this.getSettings(id), this.listDistricts(id), this.listZones(id), this.listRoads(id),
      this.listBuildings(id), this.listUtilities(id), this.listTransport(id), this.getPopulation(id),
      this.listServices(id), this.listSpawnpoints(id), this.listLandmarks(id),
    ]);
    return { ...city, settings, districts, zones, roads, buildings, utilities, transport, population, services, spawnpoints, landmarks };
  }
}
