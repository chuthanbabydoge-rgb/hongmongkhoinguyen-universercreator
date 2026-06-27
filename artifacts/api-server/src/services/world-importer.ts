import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";
import { WorldSerializer, type WorldPackage } from "./world-serializer";
import { WorldValidator } from "./world-validator";
import type { CreatorWorldImport, CreatorWorld } from "@workspace/db";

export class WorldImporter {
  private repo: DrizzleWorldEditorRepository;
  private serializer: WorldSerializer;
  private validator: WorldValidator;

  constructor(repo: DrizzleWorldEditorRepository) {
    this.repo = repo;
    this.serializer = new WorldSerializer(repo);
    this.validator = new WorldValidator(repo);
  }

  async importFromJson(
    userId: number,
    jsonData: string,
    options: { projectId?: number; nameOverride?: string } = {}
  ): Promise<{ importRecord: CreatorWorldImport; world: CreatorWorld }> {
    const importRecord = await this.repo.createImport({
      userId,
      targetProjectId: options.projectId ?? null,
      format: "json",
      status: "running",
      startedAt: new Date(),
    });

    try {
      const pkg: WorldPackage = JSON.parse(jsonData);
      this.serializer.deserialize(pkg);

      const worldName = options.nameOverride ?? `${pkg.world.name} (Imported)`;
      const slug = worldName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const world = await this.repo.createWorld({
        userId,
        projectId: options.projectId ?? null,
        name: worldName,
        slug,
        description: pkg.world.description ?? null,
        worldType: pkg.world.worldType,
        status: "draft",
        environment: pkg.world.environment,
        tags: pkg.world.tags,
        visibility: "private",
        isTemplate: false,
        seed: pkg.world.seed ?? null,
      });

      if (pkg.settings) {
        await this.repo.upsertSettings(world.id, pkg.settings as Record<string, unknown>);
      }

      for (const region of pkg.regions as Record<string, unknown>[]) {
        const { id: _id, uuid: _uuid, worldId: _wid, createdAt: _ca, updatedAt: _ua, ...rest } = region as Record<string, unknown>;
        await this.repo.createRegion({ worldId: world.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createRegion>[0]);
      }

      for (const layer of pkg.layers as Record<string, unknown>[]) {
        const { id: _id, worldId: _wid, createdAt: _ca, updatedAt: _ua, ...rest } = layer as Record<string, unknown>;
        await this.repo.createLayer({ worldId: world.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createLayer>[0]);
      }

      for (const sp of pkg.spawnpoints as Record<string, unknown>[]) {
        const { id: _id, uuid: _uuid, worldId: _wid, createdAt: _ca, updatedAt: _ua, ...rest } = sp as Record<string, unknown>;
        await this.repo.createSpawnpoint({ worldId: world.id, ...(rest as Record<string, unknown>) } as Parameters<typeof this.repo.createSpawnpoint>[0]);
      }

      if (pkg.environment) {
        const { id: _id, worldId: _wid, createdAt: _ca, updatedAt: _ua, ...rest } = pkg.environment;
        await this.repo.upsertEnvironment(world.id, rest as Record<string, unknown>);
      }

      const updated = await this.repo.updateImport(importRecord.id, {
        status: "completed",
        resultWorldId: world.id,
        completedAt: new Date(),
      });

      return { importRecord: updated!, world };
    } catch (err) {
      await this.repo.updateImport(importRecord.id, {
        status: "failed",
        errorMessage: String(err),
        completedAt: new Date(),
      });
      throw err;
    }
  }

  async importFromTemplate(
    userId: number,
    templateId: number,
    options: { projectId?: number; name: string }
  ): Promise<CreatorWorld> {
    const templates = await this.repo.listTemplates(100, 0);
    const template = templates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const slug = options.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const world = await this.repo.createWorld({
      userId,
      projectId: options.projectId ?? null,
      name: options.name,
      slug,
      description: template.description ?? null,
      worldType: template.worldType,
      status: "draft",
      environment: "outdoor",
      tags: template.tags,
      visibility: "private",
      isTemplate: false,
    });

    const pkg = template.templateData as WorldPackage | null;
    if (pkg) {
      if (pkg.settings) await this.repo.upsertSettings(world.id, pkg.settings as Record<string, unknown>);
    }

    return world;
  }
}
