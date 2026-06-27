import { DrizzleWorldEditorRepository } from "../repositories/world-editor-repository";

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class WorldValidator {
  private repo: DrizzleWorldEditorRepository;

  constructor(repo: DrizzleWorldEditorRepository) {
    this.repo = repo;
  }

  async validate(worldId: number, userId: number): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const world = await this.repo.findWorldById(worldId, userId);
    if (!world) {
      return { valid: false, errors: [{ code: "WORLD_NOT_FOUND", message: "World not found" }], warnings: [] };
    }

    const spawnpoints = await this.repo.listSpawnpoints(worldId);
    const playerSpawns = spawnpoints.filter((s) => s.spawnType === "player");
    if (playerSpawns.length === 0) {
      errors.push({ code: "MISSING_PLAYER_SPAWN", message: "World has no player spawn point" });
    }

    const regions = await this.repo.listRegions(worldId);
    const regionKeys = new Set<string>();
    for (const region of regions) {
      const key = `${Math.round(region.posX)}_${Math.round(region.posZ)}_${Math.round(region.sizeX)}_${Math.round(region.sizeZ)}`;
      if (regionKeys.has(key)) {
        warnings.push({ code: "DUPLICATE_REGION", message: `Region "${region.name}" may overlap another region` });
      }
      regionKeys.add(key);
    }

    const portals = await this.repo.listPortals(worldId);
    for (const portal of portals) {
      if (!portal.targetWorldId && !portal.targetWorldUuid) {
        warnings.push({ code: "INVALID_PORTAL", message: `Portal "${portal.name}" has no target world` });
      }
      if (portal.cooldownSeconds < 0) {
        errors.push({ code: "INVALID_PORTAL_COOLDOWN", message: `Portal "${portal.name}" has a negative cooldown` });
      }
    }

    const layers = await this.repo.listLayers(worldId);
    if (layers.length === 0) {
      warnings.push({ code: "NO_LAYERS", message: "World has no layers defined" });
    }

    const settings = await this.repo.getSettings(worldId);
    if (!settings) {
      warnings.push({ code: "MISSING_SETTINGS", message: "World has no settings configured" });
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
