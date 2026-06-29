import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";
import { WorldSerializer } from "./world-serializer";
import type { CreatorWorldExport } from "@workspace/db";

export class WorldExporter {
  private repo: DrizzleWorldEditorRepository;
  private serializer: WorldSerializer;

  constructor(repo: DrizzleWorldEditorRepository) {
    this.repo = repo;
    this.serializer = new WorldSerializer(repo);
  }

  async exportAsJson(worldId: number, userId: number): Promise<{ exportRecord: CreatorWorldExport; data: string }> {
    const exportRecord = await this.repo.createExport({
      worldId,
      userId,
      format: "json",
      status: "running",
      startedAt: new Date(),
    });

    try {
      const pkg = await this.serializer.serialize(worldId, userId);
      const data = JSON.stringify(pkg, null, 2);
      const updated = await this.repo.updateExport(exportRecord.id, {
        status: "completed",
        fileSize: Buffer.byteLength(data, "utf8"),
        completedAt: new Date(),
      });
      return { exportRecord: updated!, data };
    } catch (err) {
      await this.repo.updateExport(exportRecord.id, {
        status: "failed",
        errorMessage: String(err),
        completedAt: new Date(),
      });
      throw err;
    }
  }

  async exportAsTemplate(worldId: number, userId: number, name: string, description?: string): Promise<CreatorWorldExport> {
    const exportRecord = await this.repo.createExport({
      worldId,
      userId,
      format: "template",
      status: "running",
      startedAt: new Date(),
    });

    try {
      const pkg = await this.serializer.serialize(worldId, userId);
      await this.repo.createTemplate({
        userId,
        sourceWorldId: worldId,
        name,
        description: description ?? null,
        worldType: pkg.world.worldType,
        templateData: pkg as unknown as Record<string, unknown>,
      });
      const updated = await this.repo.updateExport(exportRecord.id, {
        status: "completed",
        completedAt: new Date(),
      });
      return updated!;
    } catch (err) {
      await this.repo.updateExport(exportRecord.id, {
        status: "failed",
        errorMessage: String(err),
        completedAt: new Date(),
      });
      throw err;
    }
  }
}
