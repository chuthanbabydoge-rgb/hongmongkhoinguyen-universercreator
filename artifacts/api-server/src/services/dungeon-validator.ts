import type { DrizzleDungeonRepository } from "../repositories/dungeon-repository";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class DungeonValidator {
  constructor(private repo: DrizzleDungeonRepository) {}

  async validate(dungeonId: number): Promise<ValidationResult> {
    const full = await this.repo.getFullDungeon(dungeonId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!full.dungeon) {
      return { valid: false, errors: ["Dungeon not found"], warnings: [] };
    }

    const { dungeon, rooms, connections, bosses, spawnpoints, monsters, rewards, checkpoints, puzzles } = full;

    // ─── Errors ─────────────────────────────────────────────────────────────

    // Isolated room check
    const connectedRoomIds = new Set<number>();
    connections.forEach((c) => {
      connectedRoomIds.add(c.fromRoomId);
      connectedRoomIds.add(c.toRoomId);
    });
    const isolatedRooms = rooms.filter((r) => !connectedRoomIds.has(r.id) && rooms.length > 1);
    isolatedRooms.forEach((r) => errors.push(`Room "${r.name}" is isolated — no connections.`));

    // Broken connection check
    const roomIds = new Set(rooms.map((r) => r.id));
    connections.forEach((c) => {
      if (!roomIds.has(c.fromRoomId)) errors.push(`Connection ${c.id} references missing from-room ${c.fromRoomId}.`);
      if (!roomIds.has(c.toRoomId)) errors.push(`Connection ${c.id} references missing to-room ${c.toRoomId}.`);
    });

    // Boss without spawn
    bosses.forEach((b) => {
      const hasSpawn = spawnpoints.some((sp) => sp.roomId === b.roomId && sp.spawnType === "boss");
      if (!hasSpawn) warnings.push(`Boss "${b.name}" has no boss spawn point in its room.`);
    });

    // Invalid spawn — spawn in non-existent room
    spawnpoints.forEach((sp) => {
      if (!roomIds.has(sp.roomId)) errors.push(`Spawn point "${sp.name}" references missing room ${sp.roomId}.`);
    });

    // Missing rewards
    if (rewards.length === 0) {
      errors.push("Dungeon has no rewards defined.");
    }

    // Duplicate checkpoint index
    const checkpointIndexes = checkpoints.map((c) => c.checkpointIndex);
    const dupIndexes = checkpointIndexes.filter((v, i) => checkpointIndexes.indexOf(v) !== i);
    dupIndexes.forEach((idx) => errors.push(`Duplicate checkpoint index: ${idx}.`));

    // Invalid difficulty ranges
    if (dungeon.minLevel > dungeon.maxLevel) {
      errors.push(`Min level (${dungeon.minLevel}) is greater than max level (${dungeon.maxLevel}).`);
    }
    if (dungeon.minPartySize > dungeon.maxPartySize) {
      errors.push(`Min party size (${dungeon.minPartySize}) is greater than max party size (${dungeon.maxPartySize}).`);
    }

    // Circular graph check (simple: same room connected to itself)
    connections.forEach((c) => {
      if (c.fromRoomId === c.toRoomId) errors.push(`Connection ${c.id} creates a self-loop on room ${c.fromRoomId}.`);
    });

    // Unreachable exit check
    const entranceRooms = rooms.filter((r) => r.isEntrance);
    const exitRooms = rooms.filter((r) => r.isExit);
    if (entranceRooms.length === 0) errors.push("Dungeon has no entrance room.");
    if (exitRooms.length === 0) errors.push("Dungeon has no exit room.");

    // Invalid reset configuration
    if (dungeon.resetType === "timed" && (!dungeon.resetIntervalHours || dungeon.resetIntervalHours <= 0)) {
      errors.push("Timed reset requires a positive reset interval.");
    }

    // ─── Warnings ────────────────────────────────────────────────────────────

    // Too many monsters
    if (monsters.length > 200) {
      warnings.push(`Dungeon has ${monsters.length} monsters — this may impact performance.`);
    }

    // Reward imbalance
    const guaranteedRewards = rewards.filter((r) => r.isGuaranteed).length;
    if (guaranteedRewards === 0 && rewards.length > 0) {
      warnings.push("No guaranteed rewards — players may complete without any drops.");
    }

    // Boss without loot
    bosses.forEach((b) => {
      if (!b.npcRef) warnings.push(`Boss "${b.name}" has no NPC reference assigned.`);
    });

    // Unused puzzle
    puzzles.forEach((p) => {
      if (!p.isRequired && !p.rewardRef) warnings.push(`Puzzle "${p.name}" is optional and has no reward — may be skipped.`);
    });

    // Oversized room
    rooms.forEach((r) => {
      if (r.width * r.height * r.depth > 100000) warnings.push(`Room "${r.name}" is very large — consider splitting.`);
    });

    return { valid: errors.length === 0, errors, warnings };
  }
}
