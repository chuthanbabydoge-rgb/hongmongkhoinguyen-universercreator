import type { DrizzleDungeonRepository } from "../repositories/dungeon-repository";

export class DungeonImporter {
  constructor(private repo: DrizzleDungeonRepository) {}

  async importJson(userId: number, raw: Record<string, unknown>) {
    const dungeonData = raw.dungeon as Record<string, unknown> | undefined;
    if (!dungeonData) throw new Error("Invalid dungeon JSON: missing dungeon field");

    const dungeon = await this.repo.createDungeon({
      createdBy: userId,
      name: (dungeonData.name as string) ?? "Imported Dungeon",
      dungeonType: (dungeonData.dungeonType as "linear") ?? "linear",
      difficulty: (dungeonData.difficulty as "normal") ?? "normal",
      resetType: (dungeonData.resetType as "daily") ?? "daily",
      minLevel: (dungeonData.minLevel as number) ?? 1,
      maxLevel: (dungeonData.maxLevel as number) ?? 100,
      minPartySize: (dungeonData.minPartySize as number) ?? 1,
      maxPartySize: (dungeonData.maxPartySize as number) ?? 5,
    });

    const id = dungeon.id;
    const rooms = (raw.rooms as Record<string, unknown>[]) ?? [];
    const connections = (raw.connections as Record<string, unknown>[]) ?? [];
    const spawnpoints = (raw.spawnpoints as Record<string, unknown>[]) ?? [];
    const bosses = (raw.bosses as Record<string, unknown>[]) ?? [];
    const monsters = (raw.monsters as Record<string, unknown>[]) ?? [];
    const traps = (raw.traps as Record<string, unknown>[]) ?? [];
    const puzzles = (raw.puzzles as Record<string, unknown>[]) ?? [];
    const rewards = (raw.rewards as Record<string, unknown>[]) ?? [];
    const checkpoints = (raw.checkpoints as Record<string, unknown>[]) ?? [];
    const requirements = (raw.requirements as Record<string, unknown>[]) ?? [];
    const events = (raw.events as Record<string, unknown>[]) ?? [];
    const scripts = (raw.scripts as Record<string, unknown>[]) ?? [];

    await Promise.all([
      ...rooms.map((r) => this.repo.createRoom({ dungeonId: id, name: (r.name as string) ?? "Room", roomType: (r.roomType as "chamber") ?? "chamber", width: (r.width as number) ?? 10, height: (r.height as number) ?? 10, depth: (r.depth as number) ?? 10, positionX: (r.positionX as number) ?? 0, positionY: (r.positionY as number) ?? 0, positionZ: (r.positionZ as number) ?? 0, isEntrance: (r.isEntrance as boolean) ?? false, isExit: (r.isExit as boolean) ?? false, isLocked: (r.isLocked as boolean) ?? false, displayOrder: (r.displayOrder as number) ?? 0 })),
      ...connections.map((c) => this.repo.createConnection({ dungeonId: id, fromRoomId: (c.fromRoomId as number) ?? 0, toRoomId: (c.toRoomId as number) ?? 0, isBidirectional: (c.isBidirectional as boolean) ?? true, isLocked: (c.isLocked as boolean) ?? false, lockType: (c.lockType as string) ?? "none", travelTime: (c.travelTime as number) ?? 0 })),
      ...spawnpoints.map((s) => this.repo.createSpawnpoint({ dungeonId: id, roomId: (s.roomId as number) ?? 0, name: (s.name as string) ?? "Spawn", spawnType: (s.spawnType as "fixed") ?? "fixed", count: (s.count as number) ?? 1, maxCount: (s.maxCount as number) ?? 1, respawnDelay: (s.respawnDelay as number) ?? 30, waveNumber: (s.waveNumber as number) ?? 1, positionX: (s.positionX as number) ?? 0, positionY: (s.positionY as number) ?? 0, positionZ: (s.positionZ as number) ?? 0, isActive: true })),
      ...bosses.map((b) => this.repo.createBoss({ dungeonId: id, roomId: (b.roomId as number) ?? 0, name: (b.name as string) ?? "Boss", hpMultiplier: (b.hpMultiplier as number) ?? 1, damageMultiplier: (b.damageMultiplier as number) ?? 1, phase: (b.phase as number) ?? 1 })),
      ...monsters.map((m) => this.repo.createMonster({ dungeonId: id, roomId: (m.roomId as number) ?? 0, hpMultiplier: (m.hpMultiplier as number) ?? 1, damageMultiplier: (m.damageMultiplier as number) ?? 1, xpReward: (m.xpReward as number) ?? 0, aggroRange: (m.aggroRange as number) ?? 10 })),
      ...traps.map((t) => this.repo.createTrap({ dungeonId: id, roomId: (t.roomId as number) ?? 0, name: (t.name as string) ?? "Trap", trapType: (t.trapType as "pressure_plate") ?? "pressure_plate", damageFormula: (t.damageFormula as string) ?? "flat", damageAmount: (t.damageAmount as number) ?? 10, canDisarm: (t.canDisarm as boolean) ?? true, disarmDifficulty: (t.disarmDifficulty as number) ?? 10, positionX: (t.positionX as number) ?? 0, positionY: (t.positionY as number) ?? 0, isActive: true })),
      ...puzzles.map((p) => this.repo.createPuzzle({ dungeonId: id, roomId: (p.roomId as number) ?? 0, name: (p.name as string) ?? "Puzzle", isRequired: (p.isRequired as boolean) ?? false, isActive: true })),
      ...rewards.map((r) => this.repo.createReward({ dungeonId: id, name: (r.name as string) ?? "Reward", rewardType: (r.rewardType as "item") ?? "item", currencyAmount: (r.currencyAmount as number) ?? 0, xpAmount: (r.xpAmount as number) ?? 0, triggerCondition: (r.triggerCondition as string) ?? "on_completion", isGuaranteed: (r.isGuaranteed as boolean) ?? false, dropChance: (r.dropChance as number) ?? 1, quantity: (r.quantity as number) ?? 1 })),
      ...checkpoints.map((c) => this.repo.createCheckpoint({ dungeonId: id, roomId: (c.roomId as number) ?? 0, name: (c.name as string) ?? "Checkpoint", checkpointIndex: (c.checkpointIndex as number) ?? 0, savePartyState: (c.savePartyState as boolean) ?? true, healsParty: (c.healsParty as boolean) ?? false, healPercent: (c.healPercent as number) ?? 0 })),
      ...requirements.map((r) => this.repo.createRequirement({ dungeonId: id, requirementType: (r.requirementType as string) ?? "level", isHardRequirement: (r.isHardRequirement as boolean) ?? true })),
      ...events.map((e) => this.repo.createEvent({ dungeonId: id, name: (e.name as string) ?? "Event", eventType: (e.eventType as string) ?? "trigger", trigger: (e.trigger as string) ?? "on_enter", action: (e.action as string) ?? "", priority: (e.priority as number) ?? 0, isOneShot: (e.isOneShot as boolean) ?? false, isActive: true })),
      ...scripts.map((s) => this.repo.createScript({ dungeonId: id, name: (s.name as string) ?? "Script", scriptType: (s.scriptType as string) ?? "lua", content: (s.content as string) ?? "", entrypoint: (s.entrypoint as string) ?? "main", triggerOn: (s.triggerOn as string) ?? "on_enter", isActive: true })),
    ]);

    return dungeon;
  }

  async importTemplate(userId: number, raw: Record<string, unknown>) {
    return this.importJson(userId, raw);
  }

  async importPackage(userId: number, raw: Record<string, unknown>) {
    return this.importJson(userId, raw);
  }
}
