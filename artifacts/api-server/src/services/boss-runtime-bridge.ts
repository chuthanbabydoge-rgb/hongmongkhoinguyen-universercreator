import { BossRepository } from "../repositories/boss-repository";

export class BossRuntimeBridge {
  private repo = new BossRepository();

  async spawnBoss(bossId: number, sessionId: string, participantIds: number[]) {
    const boss = await this.repo.get(bossId);
    if (!boss) throw new Error("Boss not found");
    const runtime = await this.repo.createRuntime({
      bossId,
      sessionId,
      currentPhase: 1,
      currentHp: boss.baseHp,
      maxHp: boss.baseHp,
      state: "idle",
      isEnraged: false,
      participantIds,
      startedAt: new Date(),
    });
    await this.repo.addHistory(bossId, "spawn", participantIds[0] ?? 0);
    return runtime;
  }

  async despawnBoss(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.updateRuntime(sessionId, { state: "idle" });
    await this.repo.addHistory(runtime.bossId, "despawn", userId);
    return { ok: true };
  }

  async enterCombat(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.updateRuntime(sessionId, { state: "combat" });
    await this.repo.addHistory(runtime.bossId, "enter_combat", userId);
    return { ok: true };
  }

  async exitCombat(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.updateRuntime(sessionId, { state: "idle" });
    await this.repo.addHistory(runtime.bossId, "exit_combat", userId);
    return { ok: true };
  }

  async changePhase(sessionId: string, phase: number, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    const updated = await this.repo.updateRuntime(sessionId, { currentPhase: phase, state: "phasing" });
    await this.repo.addHistory(runtime.bossId, "phase_change", userId, "phase", String(runtime.currentPhase), String(phase));
    return updated;
  }

  async triggerUltimate(sessionId: string, skillRef: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.addHistory(runtime.bossId, "ultimate", userId, "skill_ref", undefined, skillRef);
    return { ok: true, sessionId, skillRef, phase: runtime.currentPhase };
  }

  async triggerEnrage(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.updateRuntime(sessionId, { isEnraged: true, state: "enraged" });
    await this.repo.addHistory(runtime.bossId, "enrage", userId);
    const stats = await this.repo.getStatistics(runtime.bossId);
    await this.repo.upsertStatistics(runtime.bossId, { enrageCount: (stats?.enrageCount ?? 0) + 1 });
    return { ok: true, sessionId };
  }

  async spawnMinions(sessionId: string, minionIds: string[], userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    await this.repo.addHistory(runtime.bossId, "spawn_minions", userId, "minions", undefined, minionIds.join(","));
    return { ok: true, sessionId, minionIds };
  }

  async dropLoot(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    const loot = await this.repo.listLoot(runtime.bossId);
    const dropped = loot.filter(l => l.isGuaranteed || Math.random() < l.dropChance);
    await this.repo.addHistory(runtime.bossId, "loot_drop", userId, "items", undefined, dropped.map(d => d.name).join(","));
    const stats = await this.repo.getStatistics(runtime.bossId);
    await this.repo.upsertStatistics(runtime.bossId, { totalLootDropped: (stats?.totalLootDropped ?? 0) + dropped.length });
    return { ok: true, dropped };
  }

  async simulateBattle(bossId: number, playerCount: number, playerLevel: number) {
    const boss = await this.repo.get(bossId);
    if (!boss) throw new Error("Boss not found");
    const sessionId = `sim_${bossId}_${Date.now()}`;
    const estimatedDuration = Math.max(30, (boss.baseHp / (playerCount * playerLevel * 10)));
    const phases = await this.repo.listPhases(bossId);
    return {
      sessionId,
      bossId,
      estimatedDurationSeconds: Math.round(estimatedDuration),
      phaseCount: boss.totalPhases,
      phasesReached: phases.slice(0, Math.min(phases.length, playerCount)),
      enrageTriggered: estimatedDuration > (boss.enrageTimer ?? Infinity),
      simulatedAt: new Date().toISOString(),
    };
  }

  async simulateRaid(bossId: number, raidSize: number, averageLevel: number) {
    const boss = await this.repo.get(bossId);
    if (!boss) throw new Error("Boss not found");
    const dps = raidSize * averageLevel * 15;
    const killTime = boss.baseHp / dps;
    const wiped = killTime > (boss.enrageTimer ?? 999999);
    return {
      bossId,
      raidSize,
      averageLevel,
      estimatedKillTimeSeconds: Math.round(killTime),
      enrageAt: boss.enrageTimer,
      wiped,
      difficulty: boss.difficulty,
      simulatedAt: new Date().toISOString(),
    };
  }

  async resetBoss(sessionId: string, userId: number) {
    const runtime = await this.repo.getRuntime(sessionId);
    if (!runtime) throw new Error("Runtime session not found");
    const boss = await this.repo.get(runtime.bossId);
    if (!boss) throw new Error("Boss not found");
    await this.repo.updateRuntime(sessionId, { currentPhase: 1, currentHp: boss.baseHp, isEnraged: false, state: "idle" });
    await this.repo.addHistory(runtime.bossId, "reset", userId);
    return { ok: true };
  }
}
