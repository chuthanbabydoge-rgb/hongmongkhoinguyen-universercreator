import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";

export interface RuntimeBridgeResult {
  ok: boolean;
  mode: string;
  runtimeSessionId?: number;
  message?: string;
}

export class WorldRuntimeBridge {
  private repo: DrizzleWorldEditorRepository;

  constructor(repo: DrizzleWorldEditorRepository) {
    this.repo = repo;
  }

  async loadWorld(worldId: number, userId: number, mode: "play" | "preview" | "simulation"): Promise<RuntimeBridgeResult> {
    const world = await this.repo.findWorldById(worldId, userId);
    if (!world) throw new Error("World not found");

    await this.repo.upsertRuntime(worldId, {
      mode,
      isActive: true,
      loadedAt: new Date(),
    });

    return { ok: true, mode };
  }

  async unloadWorld(worldId: number, userId: number): Promise<RuntimeBridgeResult> {
    const world = await this.repo.findWorldById(worldId, userId);
    if (!world) throw new Error("World not found");

    const rt = await this.repo.getRuntime(worldId);
    if (rt) {
      await this.repo.upsertRuntime(worldId, {
        isActive: false,
        unloadedAt: new Date(),
      });
    }

    return { ok: true, mode: "unloaded" };
  }

  async preview(worldId: number, userId: number): Promise<RuntimeBridgeResult> {
    return this.loadWorld(worldId, userId, "preview");
  }

  async play(worldId: number, userId: number): Promise<RuntimeBridgeResult> {
    return this.loadWorld(worldId, userId, "play");
  }

  async simulate(worldId: number, userId: number): Promise<RuntimeBridgeResult> {
    return this.loadWorld(worldId, userId, "simulation");
  }

  async getRuntimeStatus(worldId: number): Promise<{ isActive: boolean; mode: string | null }> {
    const rt = await this.repo.getRuntime(worldId);
    return { isActive: rt?.isActive ?? false, mode: rt?.mode ?? null };
  }
}
