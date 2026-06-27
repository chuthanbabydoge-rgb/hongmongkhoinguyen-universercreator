import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";
import type { CreatorWorld } from "@workspace/db";

export interface WorldPackage {
  version: string;
  exportedAt: string;
  world: CreatorWorld;
  settings: Record<string, unknown> | null;
  regions: unknown[];
  layers: unknown[];
  spawnpoints: unknown[];
  portals: unknown[];
  environment: Record<string, unknown> | null;
  weather: unknown[];
  lighting: Record<string, unknown> | null;
  navigation: Record<string, unknown> | null;
}

export class WorldSerializer {
  private repo: DrizzleWorldEditorRepository;

  constructor(repo: DrizzleWorldEditorRepository) {
    this.repo = repo;
  }

  async serialize(worldId: number, userId: number): Promise<WorldPackage> {
    const world = await this.repo.findWorldById(worldId, userId);
    if (!world) throw new Error("World not found");

    const [settings, regions, layers, spawnpoints, portals, environment, weather, lighting, navigation] =
      await Promise.all([
        this.repo.getSettings(worldId),
        this.repo.listRegions(worldId),
        this.repo.listLayers(worldId),
        this.repo.listSpawnpoints(worldId),
        this.repo.listPortals(worldId),
        this.repo.getEnvironment(worldId),
        this.repo.listWeather(worldId),
        this.repo.getLighting(worldId),
        this.repo.getNavigation(worldId),
      ]);

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      world,
      settings: settings as Record<string, unknown> | null,
      regions,
      layers,
      spawnpoints,
      portals,
      environment: environment as Record<string, unknown> | null,
      weather,
      lighting: lighting as Record<string, unknown> | null,
      navigation: navigation as Record<string, unknown> | null,
    };
  }

  deserialize(pkg: WorldPackage): WorldPackage {
    if (!pkg.version) throw new Error("Invalid world package: missing version");
    if (!pkg.world) throw new Error("Invalid world package: missing world data");
    return pkg;
  }
}
