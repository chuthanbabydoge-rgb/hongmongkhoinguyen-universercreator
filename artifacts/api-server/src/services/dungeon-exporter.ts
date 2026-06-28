import { createHash } from "crypto";
import type { DrizzleDungeonRepository } from "../repositories/dungeon-repository";

export class DungeonExporter {
  constructor(private repo: DrizzleDungeonRepository) {}

  async exportJson(dungeonId: number) {
    const full = await this.repo.getFullDungeon(dungeonId);
    const payload = { exportType: "json", schemaVersion: "1.0", ...full, exportedAt: new Date().toISOString() };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    return { payload, checksum };
  }

  async exportTemplate(dungeonId: number) {
    const full = await this.repo.getFullDungeon(dungeonId);
    const template = {
      exportType: "template",
      schemaVersion: "1.0",
      dungeon: {
        name: full.dungeon?.name,
        dungeonType: full.dungeon?.dungeonType,
        difficulty: full.dungeon?.difficulty,
        resetType: full.dungeon?.resetType,
        minLevel: full.dungeon?.minLevel,
        maxLevel: full.dungeon?.maxLevel,
        minPartySize: full.dungeon?.minPartySize,
        maxPartySize: full.dungeon?.maxPartySize,
        tags: full.dungeon?.tags,
      },
      rooms: full.rooms.map((r) => ({ name: r.name, roomType: r.roomType, width: r.width, height: r.height, depth: r.depth, isEntrance: r.isEntrance, isExit: r.isExit })),
      connections: full.connections.map((c) => ({ fromRoomId: c.fromRoomId, toRoomId: c.toRoomId, isBidirectional: c.isBidirectional, lockType: c.lockType })),
      traps: full.traps.map((t) => ({ name: t.name, trapType: t.trapType, damageFormula: t.damageFormula, damageAmount: t.damageAmount })),
      puzzles: full.puzzles.map((p) => ({ name: p.name, isRequired: p.isRequired, timeLimit: p.timeLimit })),
      rewards: full.rewards.map((r) => ({ name: r.name, rewardType: r.rewardType, isGuaranteed: r.isGuaranteed, dropChance: r.dropChance })),
      exportedAt: new Date().toISOString(),
    };
    const checksum = createHash("sha256").update(JSON.stringify(template)).digest("hex");
    return { payload: template, checksum };
  }

  async exportPackage(dungeonId: number) {
    const full = await this.repo.getFullDungeon(dungeonId);
    const versions = await this.repo.getVersions(dungeonId);
    const history = await this.repo.getHistory(dungeonId, 20);
    const statistics = await this.repo.getStatistics(dungeonId);
    const payload = {
      exportType: "package",
      schemaVersion: "1.0",
      ...full,
      versions,
      history,
      statistics,
      exportedAt: new Date().toISOString(),
    };
    const checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    return { payload, checksum };
  }
}
