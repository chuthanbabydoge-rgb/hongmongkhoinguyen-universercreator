import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";
import { WorldSerializer } from "./world-serializer";
import { WorldValidator } from "./world-validator";
import { WorldExporter } from "./world-exporter";
import { WorldImporter } from "./world-importer";
import { WorldRuntimeBridge } from "./world-runtime-bridge";
import type {
  CreatorWorld,
  InsertCreatorWorld,
  CreatorWorldRegion,
  InsertCreatorWorldRegion,
  CreatorWorldLayer,
  InsertCreatorWorldLayer,
  CreatorWorldSpawnpoint,
  InsertCreatorWorldSpawnpoint,
  CreatorWorldPortal,
  InsertCreatorWorldPortal,
} from "@workspace/db";

export class WorldEditorService {
  private repo: DrizzleWorldEditorRepository;
  readonly serializer: WorldSerializer;
  readonly validator: WorldValidator;
  readonly exporter: WorldExporter;
  readonly importer: WorldImporter;
  readonly runtimeBridge: WorldRuntimeBridge;

  constructor() {
    this.repo = new DrizzleWorldEditorRepository();
    this.serializer = new WorldSerializer(this.repo);
    this.validator = new WorldValidator(this.repo);
    this.exporter = new WorldExporter(this.repo);
    this.importer = new WorldImporter(this.repo);
    this.runtimeBridge = new WorldRuntimeBridge(this.repo);
  }

  // ─── Worlds ───────────────────────────────────────────────────────────────

  async createWorld(userId: number, data: { name: string; projectId?: number; worldType?: string; description?: string; tags?: string[] }): Promise<CreatorWorld> {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const world = await this.repo.createWorld({
      userId,
      projectId: data.projectId ?? null,
      name: data.name,
      slug,
      description: data.description ?? null,
      worldType: (data.worldType as "fantasy") ?? "fantasy",
      status: "draft",
      environment: "outdoor",
      tags: data.tags ?? [],
      visibility: "private",
      isTemplate: false,
    });
    await this.repo.upsertSettings(world.id, {});
    await this.repo.createLayer({ worldId: world.id, name: "Terrain", layerType: "terrain", order: 0 });
    await this.repo.createLayer({ worldId: world.id, name: "Objects", layerType: "object", order: 1 });
    await this.repo.createLayer({ worldId: world.id, name: "Gameplay", layerType: "gameplay", order: 2 });
    await this.repo.upsertEnvironment(world.id, {});
    await this.repo.upsertLighting(world.id, {});
    await this.repo.recordHistory({ worldId: world.id, userId, action: "create", description: "World created" });
    return world;
  }

  async listWorlds(userId: number, limit = 20, offset = 0): Promise<CreatorWorld[]> {
    return this.repo.listWorlds(userId, limit, offset);
  }

  async getWorld(id: number, userId: number): Promise<CreatorWorld | null> {
    return this.repo.findWorldById(id, userId);
  }

  async updateWorld(id: number, userId: number, data: Partial<InsertCreatorWorld>): Promise<CreatorWorld | null> {
    const updated = await this.repo.updateWorld(id, userId, data);
    if (updated) {
      await this.repo.recordHistory({ worldId: id, userId, action: "update", description: "World updated", after: data as Record<string, unknown> });
    }
    return updated;
  }

  async deleteWorld(id: number, userId: number): Promise<boolean> {
    return this.repo.deleteWorld(id, userId);
  }

  async duplicateWorld(id: number, userId: number, newName?: string): Promise<CreatorWorld> {
    const world = await this.repo.findWorldById(id, userId);
    if (!world) throw new Error("World not found");
    const pkg = await this.serializer.serialize(id, userId);
    const name = newName ?? `${world.name} (Copy)`;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newWorld = await this.repo.createWorld({
      userId,
      projectId: world.projectId ?? null,
      name,
      slug,
      description: world.description ?? null,
      worldType: world.worldType,
      status: "draft",
      environment: world.environment,
      tags: world.tags,
      visibility: "private",
      isTemplate: false,
    });
    if (pkg.settings) await this.repo.upsertSettings(newWorld.id, pkg.settings as Record<string, unknown>);
    for (const region of pkg.regions as Record<string, unknown>[]) {
      const { id: _id, uuid: _u, worldId: _w, createdAt: _c, updatedAt: _ua, ...rest } = region;
      await this.repo.createRegion({ worldId: newWorld.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createRegion>[0]);
    }
    for (const layer of pkg.layers as Record<string, unknown>[]) {
      const { id: _id, worldId: _w, createdAt: _c, updatedAt: _ua, ...rest } = layer;
      await this.repo.createLayer({ worldId: newWorld.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createLayer>[0]);
    }
    for (const sp of pkg.spawnpoints as Record<string, unknown>[]) {
      const { id: _id, uuid: _u, worldId: _w, createdAt: _c, updatedAt: _ua, ...rest } = sp;
      await this.repo.createSpawnpoint({ worldId: newWorld.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createSpawnpoint>[0]);
    }
    if (pkg.environment) {
      const { id: _id, worldId: _w, createdAt: _c, updatedAt: _ua, ...rest } = pkg.environment;
      await this.repo.upsertEnvironment(newWorld.id, rest as Record<string, unknown>);
    }
    await this.repo.recordHistory({ worldId: newWorld.id, userId, action: "duplicate", description: `Duplicated from world #${id}` });
    return newWorld;
  }

  async forkWorld(id: number, userId: number, label?: string): Promise<CreatorWorld> {
    const world = await this.repo.findWorldById(id, userId);
    if (!world) throw new Error("World not found");
    const name = label ?? `${world.name} (Fork)`;
    const forked = await this.duplicateWorld(id, userId, name);
    await this.repo.updateWorld(forked.id, userId, { parentWorldId: id });
    return forked;
  }

  async publishWorld(id: number, userId: number): Promise<CreatorWorld | null> {
    return this.repo.updateWorld(id, userId, { status: "published", publishedAt: new Date(), visibility: "public" });
  }

  async archiveWorld(id: number, userId: number): Promise<CreatorWorld | null> {
    return this.repo.updateWorld(id, userId, { status: "archived", archivedAt: new Date() });
  }

  async restoreWorld(id: number, userId: number): Promise<CreatorWorld | null> {
    return this.repo.updateWorld(id, userId, { status: "draft", archivedAt: null });
  }

  async getDashboard(userId: number) {
    const worlds = await this.repo.listWorlds(userId, 10, 0);
    const allWorlds = await this.repo.listWorlds(userId, 100, 0);
    const published = allWorlds.filter((w) => w.status === "published");
    const drafts = allWorlds.filter((w) => w.status === "draft");
    const archived = allWorlds.filter((w) => w.status === "archived");
    const templates = await this.repo.listTemplates(6, 0);
    return { recentWorlds: worlds, published, drafts, archived, templates, totalCount: allWorlds.length };
  }

  // ─── Regions ──────────────────────────────────────────────────────────────

  async listRegions(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listRegions(worldId);
  }

  async createRegion(worldId: number, userId: number, data: Omit<InsertCreatorWorldRegion, "worldId">): Promise<CreatorWorldRegion> {
    await this.assertOwner(worldId, userId);
    const region = await this.repo.createRegion({ ...data, worldId });
    await this.repo.recordHistory({ worldId, userId, action: "create_region", description: `Region "${data.name}" created` });
    return region;
  }

  async updateRegion(regionId: number, worldId: number, userId: number, data: Partial<InsertCreatorWorldRegion>): Promise<CreatorWorldRegion | null> {
    await this.assertOwner(worldId, userId);
    return this.repo.updateRegion(regionId, worldId, data);
  }

  async deleteRegion(regionId: number, worldId: number, userId: number): Promise<boolean> {
    await this.assertOwner(worldId, userId);
    const ok = await this.repo.deleteRegion(regionId, worldId);
    if (ok) await this.repo.recordHistory({ worldId, userId, action: "delete_region", description: `Region #${regionId} deleted` });
    return ok;
  }

  // ─── Layers ───────────────────────────────────────────────────────────────

  async listLayers(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listLayers(worldId);
  }

  async createLayer(worldId: number, userId: number, data: Omit<InsertCreatorWorldLayer, "worldId">): Promise<CreatorWorldLayer> {
    await this.assertOwner(worldId, userId);
    return this.repo.createLayer({ ...data, worldId });
  }

  async updateLayer(layerId: number, worldId: number, userId: number, data: Partial<InsertCreatorWorldLayer>): Promise<CreatorWorldLayer | null> {
    await this.assertOwner(worldId, userId);
    return this.repo.updateLayer(layerId, worldId, data);
  }

  // ─── Spawnpoints ──────────────────────────────────────────────────────────

  async listSpawnpoints(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listSpawnpoints(worldId);
  }

  async createSpawnpoint(worldId: number, userId: number, data: Omit<InsertCreatorWorldSpawnpoint, "worldId">): Promise<CreatorWorldSpawnpoint> {
    await this.assertOwner(worldId, userId);
    return this.repo.createSpawnpoint({ ...data, worldId });
  }

  async updateSpawnpoint(spawnId: number, worldId: number, userId: number, data: Partial<InsertCreatorWorldSpawnpoint>): Promise<CreatorWorldSpawnpoint | null> {
    await this.assertOwner(worldId, userId);
    return this.repo.updateSpawnpoint(spawnId, worldId, data);
  }

  async deleteSpawnpoint(spawnId: number, worldId: number, userId: number): Promise<boolean> {
    await this.assertOwner(worldId, userId);
    return this.repo.deleteSpawnpoint(spawnId, worldId);
  }

  // ─── Portals ──────────────────────────────────────────────────────────────

  async listPortals(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listPortals(worldId);
  }

  async createPortal(worldId: number, userId: number, data: Omit<InsertCreatorWorldPortal, "worldId">): Promise<CreatorWorldPortal> {
    await this.assertOwner(worldId, userId);
    return this.repo.createPortal({ ...data, worldId });
  }

  async updatePortal(portalId: number, worldId: number, userId: number, data: Partial<InsertCreatorWorldPortal>): Promise<CreatorWorldPortal | null> {
    await this.assertOwner(worldId, userId);
    return this.repo.updatePortal(portalId, worldId, data);
  }

  async deletePortal(portalId: number, worldId: number, userId: number): Promise<boolean> {
    await this.assertOwner(worldId, userId);
    return this.repo.deletePortal(portalId, worldId);
  }

  // ─── Environment / Weather / Lighting ─────────────────────────────────────

  async getEnvironment(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.getEnvironment(worldId);
  }

  async updateEnvironment(worldId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(worldId, userId);
    return this.repo.upsertEnvironment(worldId, data);
  }

  async listWeather(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listWeather(worldId);
  }

  async getLighting(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.getLighting(worldId);
  }

  async updateLighting(worldId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(worldId, userId);
    return this.repo.upsertLighting(worldId, data);
  }

  async getNavigation(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.getNavigation(worldId);
  }

  async getStatistics(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.refreshStatistics(worldId);
  }

  async listTemplates(limit = 20, offset = 0) {
    return this.repo.listTemplates(limit, offset);
  }

  async getSettings(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.getSettings(worldId);
  }

  async updateSettings(worldId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(worldId, userId);
    return this.repo.upsertSettings(worldId, data);
  }

  async createVersion(worldId: number, userId: number, label?: string, description?: string): Promise<unknown> {
    await this.assertOwner(worldId, userId);
    const pkg = await this.serializer.serialize(worldId, userId);
    const versions = await this.repo.listVersions(worldId);
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    return this.repo.createVersion({
      worldId,
      userId,
      version: nextVersion,
      label: label ?? null,
      description: description ?? null,
      snapshot: pkg as Record<string, unknown>,
      isAutomatic: !label,
    });
  }

  async listVersions(worldId: number, userId: number) {
    await this.assertOwner(worldId, userId);
    return this.repo.listVersions(worldId);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async assertOwner(worldId: number, userId: number): Promise<void> {
    const world = await this.repo.findWorldById(worldId, userId);
    if (!world) throw new Error("World not found or access denied");
  }
}
