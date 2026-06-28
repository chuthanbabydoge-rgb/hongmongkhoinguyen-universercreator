import { BossRepository } from "../repositories/boss-repository";
import { BossValidator } from "./boss-validator";
import { BossExporter } from "./boss-exporter";
import { BossImporter } from "./boss-importer";
import { BossRuntimeBridge } from "./boss-runtime-bridge";

export class BossEditorService {
  private repo = new BossRepository();
  private validator = new BossValidator();
  private exporter = new BossExporter();
  private importer = new BossImporter();
  private runtime = new BossRuntimeBridge();

  // ─── Dashboard ────────────────────────────────────────────────────────────
  async getDashboard(userId: number) {
    const [bosses, total] = await Promise.all([
      this.repo.list(userId, 5, 0),
      this.repo.count(userId),
    ]);
    return { bosses, total, recentCount: bosses.length };
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async listBosses(userId: number, limit = 20, offset = 0, search?: string) {
    const [items, total] = await Promise.all([
      this.repo.list(userId, limit, offset, search),
      this.repo.count(userId),
    ]);
    return { items, total, limit, offset };
  }

  async getBoss(id: number) {
    const boss = await this.repo.get(id);
    if (!boss) throw new Error("Boss not found");
    return boss;
  }

  async getFullBoss(id: number) {
    const boss = await this.repo.getFull(id);
    if (!boss) throw new Error("Boss not found");
    return boss;
  }

  async createBoss(userId: number, data: Record<string, unknown>) {
    const boss = await this.repo.create({ ...data, createdBy: userId } as Parameters<typeof this.repo.create>[0]);
    await this.repo.upsertStatistics(boss.id, {});
    await this.repo.addHistory(boss.id, "created", userId);
    return boss;
  }

  async updateBoss(id: number, userId: number, data: Record<string, unknown>) {
    const boss = await this.repo.update(id, data as Parameters<typeof this.repo.update>[1]);
    await this.repo.addHistory(id, "updated", userId);
    return boss;
  }

  async deleteBoss(id: number, userId: number) {
    await this.repo.addHistory(id, "deleted", userId);
    await this.repo.delete(id);
    return { ok: true };
  }

  async duplicateBoss(id: number, userId: number) {
    const boss = await this.repo.getFull(id);
    if (!boss) throw new Error("Boss not found");
    const { id: _, createdAt, updatedAt, phases, skills, patterns, attacks, weakpoints, enrage, loot, rewards, spawnRules, arenas, cinematics, dialogues, ...rest } = boss;
    const newBoss = await this.repo.create({ ...rest, name: `${boss.name} (Copy)`, createdBy: userId, isPublished: false, version: 1 });
    for (const phase of phases) { const { id: __, bossId: ___, ...p } = phase; await this.repo.createPhase({ ...p, bossId: newBoss.id }); }
    for (const skill of skills) { const { id: __, bossId: ___, ...s } = skill; await this.repo.createSkill({ ...s, bossId: newBoss.id }); }
    await this.repo.addHistory(newBoss.id, "duplicated", userId, "source_id", String(id));
    return newBoss;
  }

  async forkBoss(id: number, userId: number) {
    return this.duplicateBoss(id, userId);
  }

  async publishBoss(id: number, userId: number) {
    const boss = await this.repo.update(id, { isPublished: true });
    await this.repo.addHistory(id, "published", userId);
    await this.snapshotVersion(id, userId, "Published");
    return boss;
  }

  async archiveBoss(id: number, userId: number) {
    const boss = await this.repo.update(id, { isArchived: true, isPublished: false });
    await this.repo.addHistory(id, "archived", userId);
    return boss;
  }

  async restoreBoss(id: number, userId: number) {
    const boss = await this.repo.update(id, { isArchived: false });
    await this.repo.addHistory(id, "restored", userId);
    return boss;
  }

  private async snapshotVersion(id: number, userId: number, label?: string) {
    const boss = await this.repo.getFull(id);
    if (!boss) return;
    const versions = await this.repo.listVersions(id);
    const version = (versions[0]?.version ?? 0) + 1;
    await this.repo.createVersion({ bossId: id, version, label: label ?? `v${version}`, snapshot: boss as Record<string, unknown>, createdBy: userId });
    await this.repo.update(id, { version });
  }

  // ─── Phases ───────────────────────────────────────────────────────────────
  async listPhases(bossId: number) { return this.repo.listPhases(bossId); }
  async createPhase(bossId: number, data: Record<string, unknown>) { return this.repo.createPhase({ ...data, bossId } as Parameters<typeof this.repo.createPhase>[0]); }
  async updatePhase(id: number, data: Record<string, unknown>) { return this.repo.updatePhase(id, data as Parameters<typeof this.repo.updatePhase>[1]); }
  async deletePhase(id: number) { return this.repo.deletePhase(id); }

  // ─── Skills ───────────────────────────────────────────────────────────────
  async listSkills(bossId: number) { return this.repo.listSkills(bossId); }
  async createSkill(bossId: number, data: Record<string, unknown>) { return this.repo.createSkill({ ...data, bossId } as Parameters<typeof this.repo.createSkill>[0]); }
  async updateSkill(id: number, data: Record<string, unknown>) { return this.repo.updateSkill(id, data as Parameters<typeof this.repo.updateSkill>[1]); }
  async deleteSkill(id: number) { return this.repo.deleteSkill(id); }

  // ─── Patterns ─────────────────────────────────────────────────────────────
  async listPatterns(bossId: number) { return this.repo.listPatterns(bossId); }
  async createPattern(bossId: number, data: Record<string, unknown>) { return this.repo.createPattern({ ...data, bossId } as Parameters<typeof this.repo.createPattern>[0]); }
  async updatePattern(id: number, data: Record<string, unknown>) { return this.repo.updatePattern(id, data as Parameters<typeof this.repo.updatePattern>[1]); }
  async deletePattern(id: number) { return this.repo.deletePattern(id); }

  // ─── Attacks ──────────────────────────────────────────────────────────────
  async listAttacks(bossId: number) { return this.repo.listAttacks(bossId); }
  async createAttack(bossId: number, data: Record<string, unknown>) { return this.repo.createAttack({ ...data, bossId } as Parameters<typeof this.repo.createAttack>[0]); }
  async updateAttack(id: number, data: Record<string, unknown>) { return this.repo.updateAttack(id, data as Parameters<typeof this.repo.updateAttack>[1]); }
  async deleteAttack(id: number) { return this.repo.deleteAttack(id); }

  // ─── Weakpoints ───────────────────────────────────────────────────────────
  async listWeakpoints(bossId: number) { return this.repo.listWeakpoints(bossId); }
  async createWeakpoint(bossId: number, data: Record<string, unknown>) { return this.repo.createWeakpoint({ ...data, bossId } as Parameters<typeof this.repo.createWeakpoint>[0]); }
  async updateWeakpoint(id: number, data: Record<string, unknown>) { return this.repo.updateWeakpoint(id, data as Parameters<typeof this.repo.updateWeakpoint>[1]); }
  async deleteWeakpoint(id: number) { return this.repo.deleteWeakpoint(id); }

  // ─── Enrage ───────────────────────────────────────────────────────────────
  async listEnrage(bossId: number) { return this.repo.listEnrage(bossId); }
  async createEnrage(bossId: number, data: Record<string, unknown>) { return this.repo.createEnrage({ ...data, bossId } as Parameters<typeof this.repo.createEnrage>[0]); }
  async updateEnrage(id: number, data: Record<string, unknown>) { return this.repo.updateEnrage(id, data as Parameters<typeof this.repo.updateEnrage>[1]); }
  async deleteEnrage(id: number) { return this.repo.deleteEnrage(id); }

  // ─── Loot ─────────────────────────────────────────────────────────────────
  async listLoot(bossId: number) { return this.repo.listLoot(bossId); }
  async createLoot(bossId: number, data: Record<string, unknown>) { return this.repo.createLoot({ ...data, bossId } as Parameters<typeof this.repo.createLoot>[0]); }
  async updateLoot(id: number, data: Record<string, unknown>) { return this.repo.updateLoot(id, data as Parameters<typeof this.repo.updateLoot>[1]); }
  async deleteLoot(id: number) { return this.repo.deleteLoot(id); }

  // ─── Rewards ──────────────────────────────────────────────────────────────
  async listRewards(bossId: number) { return this.repo.listRewards(bossId); }
  async createReward(bossId: number, data: Record<string, unknown>) { return this.repo.createReward({ ...data, bossId } as Parameters<typeof this.repo.createReward>[0]); }
  async updateReward(id: number, data: Record<string, unknown>) { return this.repo.updateReward(id, data as Parameters<typeof this.repo.updateReward>[1]); }
  async deleteReward(id: number) { return this.repo.deleteReward(id); }

  // ─── Spawn Rules ──────────────────────────────────────────────────────────
  async listSpawnRules(bossId: number) { return this.repo.listSpawnRules(bossId); }
  async createSpawnRule(bossId: number, data: Record<string, unknown>) { return this.repo.createSpawnRule({ ...data, bossId } as Parameters<typeof this.repo.createSpawnRule>[0]); }
  async updateSpawnRule(id: number, data: Record<string, unknown>) { return this.repo.updateSpawnRule(id, data as Parameters<typeof this.repo.updateSpawnRule>[1]); }
  async deleteSpawnRule(id: number) { return this.repo.deleteSpawnRule(id); }

  // ─── Arenas ───────────────────────────────────────────────────────────────
  async listArenas(bossId: number) { return this.repo.listArenas(bossId); }
  async getArena(id: number) { return this.repo.getArena(id); }
  async createArena(bossId: number, data: Record<string, unknown>) { return this.repo.createArena({ ...data, bossId } as Parameters<typeof this.repo.createArena>[0]); }
  async updateArena(id: number, data: Record<string, unknown>) { return this.repo.updateArena(id, data as Parameters<typeof this.repo.updateArena>[1]); }
  async deleteArena(id: number) { return this.repo.deleteArena(id); }

  // ─── Cinematics ───────────────────────────────────────────────────────────
  async listCinematics(bossId: number) { return this.repo.listCinematics(bossId); }
  async createCinematic(bossId: number, data: Record<string, unknown>) { return this.repo.createCinematic({ ...data, bossId } as Parameters<typeof this.repo.createCinematic>[0]); }
  async updateCinematic(id: number, data: Record<string, unknown>) { return this.repo.updateCinematic(id, data as Parameters<typeof this.repo.updateCinematic>[1]); }
  async deleteCinematic(id: number) { return this.repo.deleteCinematic(id); }

  // ─── Dialogues ────────────────────────────────────────────────────────────
  async listDialogues(bossId: number) { return this.repo.listDialogues(bossId); }
  async createDialogue(bossId: number, data: Record<string, unknown>) { return this.repo.createDialogue({ ...data, bossId } as Parameters<typeof this.repo.createDialogue>[0]); }
  async updateDialogue(id: number, data: Record<string, unknown>) { return this.repo.updateDialogue(id, data as Parameters<typeof this.repo.updateDialogue>[1]); }
  async deleteDialogue(id: number) { return this.repo.deleteDialogue(id); }

  // ─── Templates ────────────────────────────────────────────────────────────
  async getTemplates(isPublic: boolean) { return this.repo.listTemplates(isPublic); }
  async deleteTemplate(id: number) { return this.repo.deleteTemplate(id); }

  // ─── Versions ─────────────────────────────────────────────────────────────
  async listVersions(bossId: number) { return this.repo.listVersions(bossId); }
  async createSnapshot(bossId: number, userId: number, label?: string) {
    await this.snapshotVersion(bossId, userId, label);
    return { ok: true };
  }

  // ─── History ──────────────────────────────────────────────────────────────
  async listHistory(bossId: number) { return this.repo.listHistory(bossId); }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(bossId: number) { return this.repo.getStatistics(bossId); }

  // ─── Validation ───────────────────────────────────────────────────────────
  async validate(bossId: number) { return this.validator.validate(bossId); }

  // ─── Export ───────────────────────────────────────────────────────────────
  async exportJson(bossId: number, userId: number) { return this.exporter.exportJson(bossId, userId); }
  async exportTemplate(bossId: number, name: string, description: string, userId: number) { return this.exporter.exportTemplate(bossId, name, description, userId); }
  async exportPackage(bossId: number, userId: number) { return this.exporter.exportPackage(bossId, userId); }
  async listExports(bossId: number) { return this.repo.listExports(bossId); }

  // ─── Import ───────────────────────────────────────────────────────────────
  async importJson(bossId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importJson(bossId, payload, userId); }
  async importTemplate(bossId: number, templateId: number, userId: number) { return this.importer.importTemplate(bossId, templateId, userId); }
  async importPackage(bossId: number, payload: Record<string, unknown>, userId: number) { return this.importer.importPackage(bossId, payload, userId); }
  async listImports(bossId: number) { return this.repo.listImports(bossId); }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async listRuntime(bossId: number) { return this.repo.listRuntime(bossId); }
  async spawnBoss(bossId: number, sessionId: string, participantIds: number[]) { return this.runtime.spawnBoss(bossId, sessionId, participantIds); }
  async despawnBoss(sessionId: string, userId: number) { return this.runtime.despawnBoss(sessionId, userId); }
  async enterCombat(sessionId: string, userId: number) { return this.runtime.enterCombat(sessionId, userId); }
  async exitCombat(sessionId: string, userId: number) { return this.runtime.exitCombat(sessionId, userId); }
  async changePhase(sessionId: string, phase: number, userId: number) { return this.runtime.changePhase(sessionId, phase, userId); }
  async triggerUltimate(sessionId: string, skillRef: string, userId: number) { return this.runtime.triggerUltimate(sessionId, skillRef, userId); }
  async triggerEnrage(sessionId: string, userId: number) { return this.runtime.triggerEnrage(sessionId, userId); }
  async spawnMinions(sessionId: string, minionIds: string[], userId: number) { return this.runtime.spawnMinions(sessionId, minionIds, userId); }
  async dropLoot(sessionId: string, userId: number) { return this.runtime.dropLoot(sessionId, userId); }
  async simulateBattle(bossId: number, playerCount: number, playerLevel: number) { return this.runtime.simulateBattle(bossId, playerCount, playerLevel); }
  async simulateRaid(bossId: number, raidSize: number, averageLevel: number) { return this.runtime.simulateRaid(bossId, raidSize, averageLevel); }
  async resetBoss(sessionId: string, userId: number) { return this.runtime.resetBoss(sessionId, userId); }
}
