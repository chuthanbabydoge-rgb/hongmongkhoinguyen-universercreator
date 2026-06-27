import { db } from "@workspace/db";
import {
  creatorWorlds,
  creatorWorldSettings,
  creatorWorldRegions,
  creatorWorldChunks,
  creatorWorldLayers,
  creatorWorldSpawnpoints,
  creatorWorldScenes,
  creatorWorldEnvironments,
  creatorWorldWeather,
  creatorWorldLighting,
  creatorWorldNavigation,
  creatorWorldPortals,
  creatorWorldBookmarks,
  creatorWorldHistory,
  creatorWorldVersions,
  creatorWorldTemplates,
  creatorWorldExports,
  creatorWorldImports,
  creatorWorldRuntime,
  creatorWorldStatistics,
  type CreatorWorld,
  type InsertCreatorWorld,
  type CreatorWorldSettings,
  type InsertCreatorWorldSettings,
  type CreatorWorldRegion,
  type InsertCreatorWorldRegion,
  type CreatorWorldLayer,
  type InsertCreatorWorldLayer,
  type CreatorWorldSpawnpoint,
  type InsertCreatorWorldSpawnpoint,
  type CreatorWorldEnvironment,
  type InsertCreatorWorldEnvironment,
  type CreatorWorldWeather,
  type InsertCreatorWorldWeather,
  type CreatorWorldLightingRow,
  type InsertCreatorWorldLighting,
  type CreatorWorldNavigation,
  type InsertCreatorWorldNavigation,
  type CreatorWorldPortal,
  type InsertCreatorWorldPortal,
  type CreatorWorldBookmark,
  type InsertCreatorWorldBookmark,
  type CreatorWorldHistoryRow,
  type InsertCreatorWorldHistory,
  type CreatorWorldVersion,
  type InsertCreatorWorldVersion,
  type CreatorWorldTemplate,
  type InsertCreatorWorldTemplate,
  type CreatorWorldExport,
  type InsertCreatorWorldExport,
  type CreatorWorldImport,
  type InsertCreatorWorldImport,
  type CreatorWorldRuntime,
  type InsertCreatorWorldRuntime,
  type CreatorWorldStatistics,
} from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export class DrizzleWorldEditorRepository {
  // ─── Worlds ───────────────────────────────────────────────────────────────

  async createWorld(data: InsertCreatorWorld): Promise<CreatorWorld> {
    const [row] = await db.insert(creatorWorlds).values(data).returning();
    return row!;
  }

  async findWorldById(id: number, userId: number): Promise<CreatorWorld | null> {
    const [row] = await db
      .select()
      .from(creatorWorlds)
      .where(and(eq(creatorWorlds.id, id), eq(creatorWorlds.userId, userId)));
    return row ?? null;
  }

  async findWorldByUuid(uuid: string): Promise<CreatorWorld | null> {
    const [row] = await db.select().from(creatorWorlds).where(eq(creatorWorlds.uuid, uuid));
    return row ?? null;
  }

  async listWorlds(userId: number, limit = 20, offset = 0): Promise<CreatorWorld[]> {
    return db
      .select()
      .from(creatorWorlds)
      .where(eq(creatorWorlds.userId, userId))
      .orderBy(desc(creatorWorlds.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async listWorldsByProject(projectId: number, userId: number): Promise<CreatorWorld[]> {
    return db
      .select()
      .from(creatorWorlds)
      .where(and(eq(creatorWorlds.projectId, projectId), eq(creatorWorlds.userId, userId)))
      .orderBy(desc(creatorWorlds.updatedAt));
  }

  async updateWorld(id: number, userId: number, data: Partial<InsertCreatorWorld>): Promise<CreatorWorld | null> {
    const [row] = await db
      .update(creatorWorlds)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorlds.id, id), eq(creatorWorlds.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteWorld(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(creatorWorlds)
      .where(and(eq(creatorWorlds.id, id), eq(creatorWorlds.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async listTemplates(limit = 20, offset = 0): Promise<CreatorWorldTemplate[]> {
    return db
      .select()
      .from(creatorWorldTemplates)
      .orderBy(desc(creatorWorldTemplates.useCount))
      .limit(limit)
      .offset(offset);
  }

  async createTemplate(data: InsertCreatorWorldTemplate): Promise<CreatorWorldTemplate> {
    const [row] = await db.insert(creatorWorldTemplates).values(data).returning();
    return row!;
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async getSettings(worldId: number): Promise<CreatorWorldSettings | null> {
    const [row] = await db
      .select()
      .from(creatorWorldSettings)
      .where(eq(creatorWorldSettings.worldId, worldId));
    return row ?? null;
  }

  async upsertSettings(worldId: number, data: Partial<InsertCreatorWorldSettings>): Promise<CreatorWorldSettings> {
    const existing = await this.getSettings(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorWorldSettings.worldId, worldId))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorWorldSettings)
      .values({ worldId, ...data })
      .returning();
    return row!;
  }

  // ─── Regions ──────────────────────────────────────────────────────────────

  async listRegions(worldId: number): Promise<CreatorWorldRegion[]> {
    return db
      .select()
      .from(creatorWorldRegions)
      .where(eq(creatorWorldRegions.worldId, worldId))
      .orderBy(asc(creatorWorldRegions.id));
  }

  async createRegion(data: InsertCreatorWorldRegion): Promise<CreatorWorldRegion> {
    const [row] = await db.insert(creatorWorldRegions).values(data).returning();
    return row!;
  }

  async updateRegion(id: number, worldId: number, data: Partial<InsertCreatorWorldRegion>): Promise<CreatorWorldRegion | null> {
    const [row] = await db
      .update(creatorWorldRegions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorldRegions.id, id), eq(creatorWorldRegions.worldId, worldId)))
      .returning();
    return row ?? null;
  }

  async deleteRegion(id: number, worldId: number): Promise<boolean> {
    const result = await db
      .delete(creatorWorldRegions)
      .where(and(eq(creatorWorldRegions.id, id), eq(creatorWorldRegions.worldId, worldId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Layers ───────────────────────────────────────────────────────────────

  async listLayers(worldId: number): Promise<CreatorWorldLayer[]> {
    return db
      .select()
      .from(creatorWorldLayers)
      .where(eq(creatorWorldLayers.worldId, worldId))
      .orderBy(asc(creatorWorldLayers.order));
  }

  async createLayer(data: InsertCreatorWorldLayer): Promise<CreatorWorldLayer> {
    const [row] = await db.insert(creatorWorldLayers).values(data).returning();
    return row!;
  }

  async updateLayer(id: number, worldId: number, data: Partial<InsertCreatorWorldLayer>): Promise<CreatorWorldLayer | null> {
    const [row] = await db
      .update(creatorWorldLayers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorldLayers.id, id), eq(creatorWorldLayers.worldId, worldId)))
      .returning();
    return row ?? null;
  }

  async deleteLayer(id: number, worldId: number): Promise<boolean> {
    const result = await db
      .delete(creatorWorldLayers)
      .where(and(eq(creatorWorldLayers.id, id), eq(creatorWorldLayers.worldId, worldId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────

  async listSpawnpoints(worldId: number): Promise<CreatorWorldSpawnpoint[]> {
    return db
      .select()
      .from(creatorWorldSpawnpoints)
      .where(eq(creatorWorldSpawnpoints.worldId, worldId))
      .orderBy(asc(creatorWorldSpawnpoints.id));
  }

  async createSpawnpoint(data: InsertCreatorWorldSpawnpoint): Promise<CreatorWorldSpawnpoint> {
    const [row] = await db.insert(creatorWorldSpawnpoints).values(data).returning();
    return row!;
  }

  async updateSpawnpoint(id: number, worldId: number, data: Partial<InsertCreatorWorldSpawnpoint>): Promise<CreatorWorldSpawnpoint | null> {
    const [row] = await db
      .update(creatorWorldSpawnpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorldSpawnpoints.id, id), eq(creatorWorldSpawnpoints.worldId, worldId)))
      .returning();
    return row ?? null;
  }

  async deleteSpawnpoint(id: number, worldId: number): Promise<boolean> {
    const result = await db
      .delete(creatorWorldSpawnpoints)
      .where(and(eq(creatorWorldSpawnpoints.id, id), eq(creatorWorldSpawnpoints.worldId, worldId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Environment ──────────────────────────────────────────────────────────

  async getEnvironment(worldId: number): Promise<CreatorWorldEnvironment | null> {
    const [row] = await db
      .select()
      .from(creatorWorldEnvironments)
      .where(and(eq(creatorWorldEnvironments.worldId, worldId), eq(creatorWorldEnvironments.isActive, true)));
    return row ?? null;
  }

  async upsertEnvironment(worldId: number, data: Partial<InsertCreatorWorldEnvironment>): Promise<CreatorWorldEnvironment> {
    const existing = await this.getEnvironment(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldEnvironments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorWorldEnvironments.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorWorldEnvironments)
      .values({ worldId, isActive: true, ...data })
      .returning();
    return row!;
  }

  // ─── Weather ──────────────────────────────────────────────────────────────

  async listWeather(worldId: number): Promise<CreatorWorldWeather[]> {
    return db
      .select()
      .from(creatorWorldWeather)
      .where(eq(creatorWorldWeather.worldId, worldId))
      .orderBy(asc(creatorWorldWeather.id));
  }

  async createWeather(data: InsertCreatorWorldWeather): Promise<CreatorWorldWeather> {
    const [row] = await db.insert(creatorWorldWeather).values(data).returning();
    return row!;
  }

  async updateWeather(id: number, worldId: number, data: Partial<InsertCreatorWorldWeather>): Promise<CreatorWorldWeather | null> {
    const [row] = await db
      .update(creatorWorldWeather)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorldWeather.id, id), eq(creatorWorldWeather.worldId, worldId)))
      .returning();
    return row ?? null;
  }

  // ─── Lighting ─────────────────────────────────────────────────────────────

  async getLighting(worldId: number): Promise<CreatorWorldLightingRow | null> {
    const [row] = await db
      .select()
      .from(creatorWorldLighting)
      .where(and(eq(creatorWorldLighting.worldId, worldId), eq(creatorWorldLighting.isActive, true)));
    return row ?? null;
  }

  async upsertLighting(worldId: number, data: Partial<InsertCreatorWorldLighting>): Promise<CreatorWorldLightingRow> {
    const existing = await this.getLighting(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldLighting)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorWorldLighting.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorWorldLighting)
      .values({ worldId, isActive: true, ...data })
      .returning();
    return row!;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async getNavigation(worldId: number): Promise<CreatorWorldNavigation | null> {
    const [row] = await db
      .select()
      .from(creatorWorldNavigation)
      .where(eq(creatorWorldNavigation.worldId, worldId));
    return row ?? null;
  }

  async upsertNavigation(worldId: number, data: Partial<InsertCreatorWorldNavigation>): Promise<CreatorWorldNavigation> {
    const existing = await this.getNavigation(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldNavigation)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorWorldNavigation.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorWorldNavigation)
      .values({ worldId, ...data })
      .returning();
    return row!;
  }

  // ─── Portals ──────────────────────────────────────────────────────────────

  async listPortals(worldId: number): Promise<CreatorWorldPortal[]> {
    return db
      .select()
      .from(creatorWorldPortals)
      .where(eq(creatorWorldPortals.worldId, worldId))
      .orderBy(asc(creatorWorldPortals.id));
  }

  async createPortal(data: InsertCreatorWorldPortal): Promise<CreatorWorldPortal> {
    const [row] = await db.insert(creatorWorldPortals).values(data).returning();
    return row!;
  }

  async updatePortal(id: number, worldId: number, data: Partial<InsertCreatorWorldPortal>): Promise<CreatorWorldPortal | null> {
    const [row] = await db
      .update(creatorWorldPortals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorWorldPortals.id, id), eq(creatorWorldPortals.worldId, worldId)))
      .returning();
    return row ?? null;
  }

  async deletePortal(id: number, worldId: number): Promise<boolean> {
    const result = await db
      .delete(creatorWorldPortals)
      .where(and(eq(creatorWorldPortals.id, id), eq(creatorWorldPortals.worldId, worldId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async recordHistory(data: InsertCreatorWorldHistory): Promise<CreatorWorldHistoryRow> {
    const [row] = await db.insert(creatorWorldHistory).values(data).returning();
    return row!;
  }

  async listHistory(worldId: number, limit = 50): Promise<CreatorWorldHistoryRow[]> {
    return db
      .select()
      .from(creatorWorldHistory)
      .where(eq(creatorWorldHistory.worldId, worldId))
      .orderBy(desc(creatorWorldHistory.createdAt))
      .limit(limit);
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async createVersion(data: InsertCreatorWorldVersion): Promise<CreatorWorldVersion> {
    const [row] = await db.insert(creatorWorldVersions).values(data).returning();
    return row!;
  }

  async listVersions(worldId: number): Promise<CreatorWorldVersion[]> {
    return db
      .select()
      .from(creatorWorldVersions)
      .where(eq(creatorWorldVersions.worldId, worldId))
      .orderBy(desc(creatorWorldVersions.version));
  }

  async getVersion(id: number, worldId: number): Promise<CreatorWorldVersion | null> {
    const [row] = await db
      .select()
      .from(creatorWorldVersions)
      .where(and(eq(creatorWorldVersions.id, id), eq(creatorWorldVersions.worldId, worldId)));
    return row ?? null;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────

  async createExport(data: InsertCreatorWorldExport): Promise<CreatorWorldExport> {
    const [row] = await db.insert(creatorWorldExports).values(data).returning();
    return row!;
  }

  async updateExport(id: number, data: Partial<InsertCreatorWorldExport>): Promise<CreatorWorldExport | null> {
    const [row] = await db
      .update(creatorWorldExports)
      .set(data)
      .where(eq(creatorWorldExports.id, id))
      .returning();
    return row ?? null;
  }

  async listExports(worldId: number): Promise<CreatorWorldExport[]> {
    return db
      .select()
      .from(creatorWorldExports)
      .where(eq(creatorWorldExports.worldId, worldId))
      .orderBy(desc(creatorWorldExports.createdAt));
  }

  // ─── Imports ──────────────────────────────────────────────────────────────

  async createImport(data: InsertCreatorWorldImport): Promise<CreatorWorldImport> {
    const [row] = await db.insert(creatorWorldImports).values(data).returning();
    return row!;
  }

  async updateImport(id: number, data: Partial<InsertCreatorWorldImport>): Promise<CreatorWorldImport | null> {
    const [row] = await db
      .update(creatorWorldImports)
      .set(data)
      .where(eq(creatorWorldImports.id, id))
      .returning();
    return row ?? null;
  }

  // ─── Runtime ──────────────────────────────────────────────────────────────

  async getRuntime(worldId: number): Promise<CreatorWorldRuntime | null> {
    const [row] = await db
      .select()
      .from(creatorWorldRuntime)
      .where(and(eq(creatorWorldRuntime.worldId, worldId), eq(creatorWorldRuntime.isActive, true)));
    return row ?? null;
  }

  async upsertRuntime(worldId: number, data: Partial<InsertCreatorWorldRuntime>): Promise<CreatorWorldRuntime> {
    const existing = await this.getRuntime(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldRuntime)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorWorldRuntime.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorWorldRuntime)
      .values({ worldId, isActive: true, ...data })
      .returning();
    return row!;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async getStatistics(worldId: number): Promise<CreatorWorldStatistics | null> {
    const [row] = await db
      .select()
      .from(creatorWorldStatistics)
      .where(eq(creatorWorldStatistics.worldId, worldId));
    return row ?? null;
  }

  async refreshStatistics(worldId: number): Promise<CreatorWorldStatistics> {
    const [regionCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldRegions)
      .where(eq(creatorWorldRegions.worldId, worldId));
    const [spawnCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldSpawnpoints)
      .where(eq(creatorWorldSpawnpoints.worldId, worldId));
    const [portalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldPortals)
      .where(eq(creatorWorldPortals.worldId, worldId));
    const [layerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldLayers)
      .where(eq(creatorWorldLayers.worldId, worldId));
    const [versionCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldVersions)
      .where(eq(creatorWorldVersions.worldId, worldId));
    const [exportCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creatorWorldExports)
      .where(eq(creatorWorldExports.worldId, worldId));

    const stats = {
      worldId,
      regionCount: regionCount?.count ?? 0,
      chunkCount: 0,
      spawnpointCount: spawnCount?.count ?? 0,
      portalCount: portalCount?.count ?? 0,
      layerCount: layerCount?.count ?? 0,
      versionCount: versionCount?.count ?? 0,
      exportCount: exportCount?.count ?? 0,
      updatedAt: new Date(),
    };

    const existing = await this.getStatistics(worldId);
    if (existing) {
      const [row] = await db
        .update(creatorWorldStatistics)
        .set(stats)
        .where(eq(creatorWorldStatistics.worldId, worldId))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorWorldStatistics).values(stats).returning();
    return row!;
  }
}
