import type { DrizzleDungeonRepository } from "../repositories/dungeon-repository";

export class DungeonRuntimeBridge {
  constructor(private repo: DrizzleDungeonRepository) {}

  async previewDungeon(dungeonId: number) {
    const full = await this.repo.getFullDungeon(dungeonId);
    return {
      ok: true,
      dungeonId,
      name: full.dungeon?.name,
      rooms: full.rooms.length,
      connections: full.connections.length,
      bosses: full.bosses.length,
      monsters: full.monsters.length,
      traps: full.traps.length,
      puzzles: full.puzzles.length,
      rewards: full.rewards.length,
      checkpoints: full.checkpoints.length,
      preview: { rooms: full.rooms, connections: full.connections },
    };
  }

  async simulateRun(dungeonId: number, partySize: number) {
    const full = await this.repo.getFullDungeon(dungeonId);
    const dungeon = full.dungeon;
    if (!dungeon) return { ok: false, error: "Dungeon not found" };

    const timeline: Record<string, unknown>[] = [];
    let tick = 0;

    const entrance = full.rooms.find((r) => r.isEntrance);
    if (entrance) {
      timeline.push({ tick: tick++, event: "enter", room: entrance.name, partySize });
    }

    for (const room of full.rooms) {
      const roomMonsters = full.monsters.filter((m) => m.roomId === room.id);
      const roomTraps = full.traps.filter((t) => t.roomId === room.id);
      const roomBoss = full.bosses.find((b) => b.roomId === room.id);
      const roomPuzzle = full.puzzles.find((p) => p.roomId === room.id);
      const roomCheckpoint = full.checkpoints.find((c) => c.roomId === room.id);

      if (roomMonsters.length > 0) timeline.push({ tick: tick++, event: "encounter", room: room.name, monsterCount: roomMonsters.length });
      if (roomTraps.length > 0) timeline.push({ tick: tick++, event: "trap_triggered", room: room.name, trapCount: roomTraps.length });
      if (roomPuzzle) timeline.push({ tick: tick++, event: "puzzle", room: room.name, puzzle: roomPuzzle.name, required: roomPuzzle.isRequired });
      if (roomBoss) timeline.push({ tick: tick++, event: "boss_encounter", room: room.name, boss: roomBoss.name });
      if (roomCheckpoint) timeline.push({ tick: tick++, event: "checkpoint", room: room.name, checkpoint: roomCheckpoint.name });
    }

    const exit = full.rooms.find((r) => r.isExit);
    if (exit) timeline.push({ tick: tick++, event: "exit", room: exit.name });

    const loot = full.rewards.map((r) => ({ name: r.name, type: r.rewardType, guaranteed: r.isGuaranteed, chance: r.dropChance }));
    return { ok: true, dungeonId, timeline, loot, estimatedTicks: tick };
  }

  async simulateBoss(dungeonId: number, bossId: number) {
    const bosses = await this.repo.getBosses(dungeonId);
    const boss = bosses.find((b) => b.id === bossId);
    if (!boss) return { ok: false, error: "Boss not found" };

    const phases = [];
    const phaseCount = boss.phase ?? 1;
    for (let p = 1; p <= phaseCount; p++) {
      phases.push({
        phase: p,
        hpThreshold: p === 1 ? 1.0 : (phaseCount - p + 1) / phaseCount,
        hpMultiplier: boss.hpMultiplier,
        damageMultiplier: boss.damageMultiplier * (1 + (p - 1) * 0.2),
        enrageAt: boss.enrageTimer,
      });
    }

    return { ok: true, bossId, bossName: boss.name, phases, npcRef: boss.npcRef, combatRef: boss.combatRef };
  }

  async simulateSpawn(dungeonId: number, roomId: number) {
    const spawnpoints = await this.repo.getSpawnpoints(dungeonId);
    const roomSpawns = spawnpoints.filter((s) => s.roomId === roomId && s.isActive);
    const monsters = await this.repo.getMonsters(dungeonId);
    const roomMonsters = monsters.filter((m) => m.roomId === roomId);

    const waves: Record<string, unknown>[] = [];
    const waveNums = [...new Set(roomSpawns.map((s) => s.waveNumber))].sort((a, b) => a - b);
    for (const waveNum of waveNums) {
      const waveSpawns = roomSpawns.filter((s) => s.waveNumber === waveNum);
      waves.push({ wave: waveNum, spawns: waveSpawns.length, totalCount: waveSpawns.reduce((a, s) => a + s.count, 0) });
    }

    return { ok: true, dungeonId, roomId, spawnpoints: roomSpawns.length, monsters: roomMonsters.length, waves };
  }

  async simulatePuzzle(dungeonId: number, puzzleId: number) {
    const puzzles = await this.repo.getPuzzles(dungeonId);
    const puzzle = puzzles.find((p) => p.id === puzzleId);
    if (!puzzle) return { ok: false, error: "Puzzle not found" };

    return {
      ok: true,
      puzzleId,
      name: puzzle.name,
      timeLimit: puzzle.timeLimit,
      isRequired: puzzle.isRequired,
      hints: puzzle.hints,
      successTrigger: puzzle.successTrigger,
      failurePenalty: puzzle.failurePenalty,
      rewardRef: puzzle.rewardRef,
      simulation: { outcome: "success", timeTaken: Math.random() * (puzzle.timeLimit ?? 60) },
    };
  }

  async simulateTrap(dungeonId: number, trapId: number) {
    const traps = await this.repo.getTraps(dungeonId);
    const trap = traps.find((t) => t.id === trapId);
    if (!trap) return { ok: false, error: "Trap not found" };

    const disarmed = trap.canDisarm && Math.random() * 20 >= trap.disarmDifficulty;
    const damage = disarmed ? 0 : trap.damageAmount;

    return {
      ok: true,
      trapId,
      name: trap.name,
      trapType: trap.trapType,
      damageFormula: trap.damageFormula,
      maxDamage: trap.damageAmount,
      canDisarm: trap.canDisarm,
      disarmDifficulty: trap.disarmDifficulty,
      simulation: { triggered: true, disarmed, damageDealt: damage, statusEffect: trap.statusEffectRef },
    };
  }

  async simulateLoot(dungeonId: number) {
    const rewards = await this.repo.getRewards(dungeonId);
    const lootRolls = rewards.map((r) => ({
      rewardId: r.id,
      name: r.name,
      type: r.rewardType,
      guaranteed: r.isGuaranteed,
      dropChance: r.dropChance,
      dropped: r.isGuaranteed || Math.random() <= r.dropChance,
      quantity: r.quantity,
      itemRef: r.itemRef,
      lootTableRef: r.lootTableRef,
    }));

    return {
      ok: true,
      dungeonId,
      totalRewards: rewards.length,
      droppedRewards: lootRolls.filter((r) => r.dropped).length,
      loot: lootRolls,
    };
  }

  async simulateCheckpoint(dungeonId: number, checkpointId: number) {
    const checkpoints = await this.repo.getCheckpoints(dungeonId);
    const checkpoint = checkpoints.find((c) => c.id === checkpointId);
    if (!checkpoint) return { ok: false, error: "Checkpoint not found" };

    return {
      ok: true,
      checkpointId,
      name: checkpoint.name,
      index: checkpoint.checkpointIndex,
      savePartyState: checkpoint.savePartyState,
      healsParty: checkpoint.healsParty,
      healPercent: checkpoint.healPercent,
      simulation: {
        stateSaved: checkpoint.savePartyState,
        healApplied: checkpoint.healsParty,
        healAmount: checkpoint.healsParty ? `${checkpoint.healPercent * 100}%` : "0%",
      },
    };
  }

  async simulateRespawn(dungeonId: number, checkpointId?: number) {
    const checkpoints = await this.repo.getCheckpoints(dungeonId);
    const checkpoint = checkpointId ? checkpoints.find((c) => c.id === checkpointId) : checkpoints[0];

    return {
      ok: true,
      dungeonId,
      respawnAt: checkpoint ? { checkpointId: checkpoint.id, name: checkpoint.name, index: checkpoint.checkpointIndex } : { checkpointId: null, name: "Entrance" },
      simulation: { respawnDelay: 5, partyReformed: true },
    };
  }

  async resetDungeon(dungeonId: number) {
    const dungeon = await this.repo.getDungeon(dungeonId);
    if (!dungeon) return { ok: false, error: "Dungeon not found" };

    return {
      ok: true,
      dungeonId,
      name: dungeon.name,
      resetType: dungeon.resetType,
      resetIntervalHours: dungeon.resetIntervalHours,
      simulation: {
        monstersRespawned: true,
        trapsReset: true,
        checkpointsCleared: true,
        lootReset: true,
        puzzlesReset: true,
        bossesReset: true,
        resetAt: new Date().toISOString(),
      },
    };
  }
}
