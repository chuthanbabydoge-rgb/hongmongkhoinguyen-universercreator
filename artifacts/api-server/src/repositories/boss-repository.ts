import { db } from "@workspace/db";
import {
  creatorBosses, creatorBossPhases, creatorBossSkills, creatorBossPatterns,
  creatorBossAttacks, creatorBossWeakpoints, creatorBossEnrage, creatorBossLoot,
  creatorBossRewards, creatorBossSpawnRules, creatorBossArenas, creatorBossCinematics,
  creatorBossDialogues, creatorBossTemplates, creatorBossVersions, creatorBossHistory,
  creatorBossStatistics, creatorBossExports, creatorBossImports, creatorBossRuntime,
} from "@workspace/db";
import { eq, desc, ilike, and, or } from "drizzle-orm";

export class BossRepository {
  // ─── Bosses ────────────────────────────────────────────────────────────────
  async list(userId: number, limit = 20, offset = 0, search?: string) {
    const q = db.select().from(creatorBosses);
    if (search) {
      return q.where(and(eq(creatorBosses.createdBy, userId), ilike(creatorBosses.name, `%${search}%`))).limit(limit).offset(offset).orderBy(desc(creatorBosses.updatedAt));
    }
    return q.where(eq(creatorBosses.createdBy, userId)).limit(limit).offset(offset).orderBy(desc(creatorBosses.updatedAt));
  }

  async count(userId: number) {
    const rows = await db.select().from(creatorBosses).where(eq(creatorBosses.createdBy, userId));
    return rows.length;
  }

  async get(id: number) {
    const [row] = await db.select().from(creatorBosses).where(eq(creatorBosses.id, id));
    return row ?? null;
  }

  async create(data: typeof creatorBosses.$inferInsert) {
    const [row] = await db.insert(creatorBosses).values(data).returning();
    return row;
  }

  async update(id: number, data: Partial<typeof creatorBosses.$inferInsert>) {
    const [row] = await db.update(creatorBosses).set({ ...data, updatedAt: new Date() }).where(eq(creatorBosses.id, id)).returning();
    return row;
  }

  async delete(id: number) {
    await db.delete(creatorBosses).where(eq(creatorBosses.id, id));
  }

  // ─── Phases ───────────────────────────────────────────────────────────────
  async listPhases(bossId: number) {
    return db.select().from(creatorBossPhases).where(eq(creatorBossPhases.bossId, bossId)).orderBy(creatorBossPhases.displayOrder);
  }

  async getPhase(id: number) {
    const [row] = await db.select().from(creatorBossPhases).where(eq(creatorBossPhases.id, id));
    return row ?? null;
  }

  async createPhase(data: typeof creatorBossPhases.$inferInsert) {
    const [row] = await db.insert(creatorBossPhases).values(data).returning();
    return row;
  }

  async updatePhase(id: number, data: Partial<typeof creatorBossPhases.$inferInsert>) {
    const [row] = await db.update(creatorBossPhases).set({ ...data, updatedAt: new Date() }).where(eq(creatorBossPhases.id, id)).returning();
    return row;
  }

  async deletePhase(id: number) {
    await db.delete(creatorBossPhases).where(eq(creatorBossPhases.id, id));
  }

  // ─── Skills ───────────────────────────────────────────────────────────────
  async listSkills(bossId: number) {
    return db.select().from(creatorBossSkills).where(eq(creatorBossSkills.bossId, bossId)).orderBy(creatorBossSkills.displayOrder);
  }

  async getSkill(id: number) {
    const [row] = await db.select().from(creatorBossSkills).where(eq(creatorBossSkills.id, id));
    return row ?? null;
  }

  async createSkill(data: typeof creatorBossSkills.$inferInsert) {
    const [row] = await db.insert(creatorBossSkills).values(data).returning();
    return row;
  }

  async updateSkill(id: number, data: Partial<typeof creatorBossSkills.$inferInsert>) {
    const [row] = await db.update(creatorBossSkills).set(data).where(eq(creatorBossSkills.id, id)).returning();
    return row;
  }

  async deleteSkill(id: number) {
    await db.delete(creatorBossSkills).where(eq(creatorBossSkills.id, id));
  }

  // ─── Patterns ─────────────────────────────────────────────────────────────
  async listPatterns(bossId: number) {
    return db.select().from(creatorBossPatterns).where(eq(creatorBossPatterns.bossId, bossId)).orderBy(desc(creatorBossPatterns.priority));
  }

  async getPattern(id: number) {
    const [row] = await db.select().from(creatorBossPatterns).where(eq(creatorBossPatterns.id, id));
    return row ?? null;
  }

  async createPattern(data: typeof creatorBossPatterns.$inferInsert) {
    const [row] = await db.insert(creatorBossPatterns).values(data).returning();
    return row;
  }

  async updatePattern(id: number, data: Partial<typeof creatorBossPatterns.$inferInsert>) {
    const [row] = await db.update(creatorBossPatterns).set(data).where(eq(creatorBossPatterns.id, id)).returning();
    return row;
  }

  async deletePattern(id: number) {
    await db.delete(creatorBossPatterns).where(eq(creatorBossPatterns.id, id));
  }

  // ─── Attacks ──────────────────────────────────────────────────────────────
  async listAttacks(bossId: number) {
    return db.select().from(creatorBossAttacks).where(eq(creatorBossAttacks.bossId, bossId));
  }

  async getAttack(id: number) {
    const [row] = await db.select().from(creatorBossAttacks).where(eq(creatorBossAttacks.id, id));
    return row ?? null;
  }

  async createAttack(data: typeof creatorBossAttacks.$inferInsert) {
    const [row] = await db.insert(creatorBossAttacks).values(data).returning();
    return row;
  }

  async updateAttack(id: number, data: Partial<typeof creatorBossAttacks.$inferInsert>) {
    const [row] = await db.update(creatorBossAttacks).set(data).where(eq(creatorBossAttacks.id, id)).returning();
    return row;
  }

  async deleteAttack(id: number) {
    await db.delete(creatorBossAttacks).where(eq(creatorBossAttacks.id, id));
  }

  // ─── Weak Points ──────────────────────────────────────────────────────────
  async listWeakpoints(bossId: number) {
    return db.select().from(creatorBossWeakpoints).where(eq(creatorBossWeakpoints.bossId, bossId));
  }

  async getWeakpoint(id: number) {
    const [row] = await db.select().from(creatorBossWeakpoints).where(eq(creatorBossWeakpoints.id, id));
    return row ?? null;
  }

  async createWeakpoint(data: typeof creatorBossWeakpoints.$inferInsert) {
    const [row] = await db.insert(creatorBossWeakpoints).values(data).returning();
    return row;
  }

  async updateWeakpoint(id: number, data: Partial<typeof creatorBossWeakpoints.$inferInsert>) {
    const [row] = await db.update(creatorBossWeakpoints).set(data).where(eq(creatorBossWeakpoints.id, id)).returning();
    return row;
  }

  async deleteWeakpoint(id: number) {
    await db.delete(creatorBossWeakpoints).where(eq(creatorBossWeakpoints.id, id));
  }

  // ─── Enrage ───────────────────────────────────────────────────────────────
  async listEnrage(bossId: number) {
    return db.select().from(creatorBossEnrage).where(eq(creatorBossEnrage.bossId, bossId));
  }

  async createEnrage(data: typeof creatorBossEnrage.$inferInsert) {
    const [row] = await db.insert(creatorBossEnrage).values(data).returning();
    return row;
  }

  async updateEnrage(id: number, data: Partial<typeof creatorBossEnrage.$inferInsert>) {
    const [row] = await db.update(creatorBossEnrage).set(data).where(eq(creatorBossEnrage.id, id)).returning();
    return row;
  }

  async deleteEnrage(id: number) {
    await db.delete(creatorBossEnrage).where(eq(creatorBossEnrage.id, id));
  }

  // ─── Loot ─────────────────────────────────────────────────────────────────
  async listLoot(bossId: number) {
    return db.select().from(creatorBossLoot).where(eq(creatorBossLoot.bossId, bossId));
  }

  async createLoot(data: typeof creatorBossLoot.$inferInsert) {
    const [row] = await db.insert(creatorBossLoot).values(data).returning();
    return row;
  }

  async updateLoot(id: number, data: Partial<typeof creatorBossLoot.$inferInsert>) {
    const [row] = await db.update(creatorBossLoot).set(data).where(eq(creatorBossLoot.id, id)).returning();
    return row;
  }

  async deleteLoot(id: number) {
    await db.delete(creatorBossLoot).where(eq(creatorBossLoot.id, id));
  }

  // ─── Rewards ──────────────────────────────────────────────────────────────
  async listRewards(bossId: number) {
    return db.select().from(creatorBossRewards).where(eq(creatorBossRewards.bossId, bossId));
  }

  async createReward(data: typeof creatorBossRewards.$inferInsert) {
    const [row] = await db.insert(creatorBossRewards).values(data).returning();
    return row;
  }

  async updateReward(id: number, data: Partial<typeof creatorBossRewards.$inferInsert>) {
    const [row] = await db.update(creatorBossRewards).set(data).where(eq(creatorBossRewards.id, id)).returning();
    return row;
  }

  async deleteReward(id: number) {
    await db.delete(creatorBossRewards).where(eq(creatorBossRewards.id, id));
  }

  // ─── Spawn Rules ──────────────────────────────────────────────────────────
  async listSpawnRules(bossId: number) {
    return db.select().from(creatorBossSpawnRules).where(eq(creatorBossSpawnRules.bossId, bossId));
  }

  async createSpawnRule(data: typeof creatorBossSpawnRules.$inferInsert) {
    const [row] = await db.insert(creatorBossSpawnRules).values(data).returning();
    return row;
  }

  async updateSpawnRule(id: number, data: Partial<typeof creatorBossSpawnRules.$inferInsert>) {
    const [row] = await db.update(creatorBossSpawnRules).set(data).where(eq(creatorBossSpawnRules.id, id)).returning();
    return row;
  }

  async deleteSpawnRule(id: number) {
    await db.delete(creatorBossSpawnRules).where(eq(creatorBossSpawnRules.id, id));
  }

  // ─── Arenas ───────────────────────────────────────────────────────────────
  async listArenas(bossId: number) {
    return db.select().from(creatorBossArenas).where(eq(creatorBossArenas.bossId, bossId));
  }

  async getArena(id: number) {
    const [row] = await db.select().from(creatorBossArenas).where(eq(creatorBossArenas.id, id));
    return row ?? null;
  }

  async createArena(data: typeof creatorBossArenas.$inferInsert) {
    const [row] = await db.insert(creatorBossArenas).values(data).returning();
    return row;
  }

  async updateArena(id: number, data: Partial<typeof creatorBossArenas.$inferInsert>) {
    const [row] = await db.update(creatorBossArenas).set({ ...data, updatedAt: new Date() }).where(eq(creatorBossArenas.id, id)).returning();
    return row;
  }

  async deleteArena(id: number) {
    await db.delete(creatorBossArenas).where(eq(creatorBossArenas.id, id));
  }

  // ─── Cinematics ───────────────────────────────────────────────────────────
  async listCinematics(bossId: number) {
    return db.select().from(creatorBossCinematics).where(eq(creatorBossCinematics.bossId, bossId)).orderBy(creatorBossCinematics.displayOrder);
  }

  async createCinematic(data: typeof creatorBossCinematics.$inferInsert) {
    const [row] = await db.insert(creatorBossCinematics).values(data).returning();
    return row;
  }

  async updateCinematic(id: number, data: Partial<typeof creatorBossCinematics.$inferInsert>) {
    const [row] = await db.update(creatorBossCinematics).set(data).where(eq(creatorBossCinematics.id, id)).returning();
    return row;
  }

  async deleteCinematic(id: number) {
    await db.delete(creatorBossCinematics).where(eq(creatorBossCinematics.id, id));
  }

  // ─── Dialogues ────────────────────────────────────────────────────────────
  async listDialogues(bossId: number) {
    return db.select().from(creatorBossDialogues).where(eq(creatorBossDialogues.bossId, bossId)).orderBy(creatorBossDialogues.displayOrder);
  }

  async createDialogue(data: typeof creatorBossDialogues.$inferInsert) {
    const [row] = await db.insert(creatorBossDialogues).values(data).returning();
    return row;
  }

  async updateDialogue(id: number, data: Partial<typeof creatorBossDialogues.$inferInsert>) {
    const [row] = await db.update(creatorBossDialogues).set(data).where(eq(creatorBossDialogues.id, id)).returning();
    return row;
  }

  async deleteDialogue(id: number) {
    await db.delete(creatorBossDialogues).where(eq(creatorBossDialogues.id, id));
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  async listTemplates(isPublic?: boolean) {
    if (isPublic !== undefined) {
      return db.select().from(creatorBossTemplates).where(eq(creatorBossTemplates.isPublic, isPublic)).orderBy(desc(creatorBossTemplates.usageCount));
    }
    return db.select().from(creatorBossTemplates).orderBy(desc(creatorBossTemplates.usageCount));
  }

  async getTemplate(id: number) {
    const [row] = await db.select().from(creatorBossTemplates).where(eq(creatorBossTemplates.id, id));
    return row ?? null;
  }

  async createTemplate(data: typeof creatorBossTemplates.$inferInsert) {
    const [row] = await db.insert(creatorBossTemplates).values(data).returning();
    return row;
  }

  async deleteTemplate(id: number) {
    await db.delete(creatorBossTemplates).where(eq(creatorBossTemplates.id, id));
  }

  // ─── Versions ─────────────────────────────────────────────────────────────
  async listVersions(bossId: number) {
    return db.select().from(creatorBossVersions).where(eq(creatorBossVersions.bossId, bossId)).orderBy(desc(creatorBossVersions.version));
  }

  async createVersion(data: typeof creatorBossVersions.$inferInsert) {
    const [row] = await db.insert(creatorBossVersions).values(data).returning();
    return row;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  async listHistory(bossId: number) {
    return db.select().from(creatorBossHistory).where(eq(creatorBossHistory.bossId, bossId)).orderBy(desc(creatorBossHistory.createdAt)).limit(100);
  }

  async addHistory(bossId: number, action: string, changedBy: number, field?: string, oldValue?: string, newValue?: string) {
    await db.insert(creatorBossHistory).values({ bossId, action, changedBy, field, oldValue, newValue });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────
  async getStatistics(bossId: number) {
    const [row] = await db.select().from(creatorBossStatistics).where(eq(creatorBossStatistics.bossId, bossId));
    return row ?? null;
  }

  async upsertStatistics(bossId: number, data: Partial<typeof creatorBossStatistics.$inferInsert>) {
    const existing = await this.getStatistics(bossId);
    if (existing) {
      const [row] = await db.update(creatorBossStatistics).set({ ...data, updatedAt: new Date() }).where(eq(creatorBossStatistics.bossId, bossId)).returning();
      return row;
    }
    const [row] = await db.insert(creatorBossStatistics).values({ bossId, ...data }).returning();
    return row;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────
  async listExports(bossId: number) {
    return db.select().from(creatorBossExports).where(eq(creatorBossExports.bossId, bossId)).orderBy(desc(creatorBossExports.createdAt));
  }

  async createExport(data: typeof creatorBossExports.$inferInsert) {
    const [row] = await db.insert(creatorBossExports).values(data).returning();
    return row;
  }

  // ─── Imports ──────────────────────────────────────────────────────────────
  async listImports(bossId: number) {
    return db.select().from(creatorBossImports).where(eq(creatorBossImports.bossId, bossId)).orderBy(desc(creatorBossImports.createdAt));
  }

  async createImport(data: typeof creatorBossImports.$inferInsert) {
    const [row] = await db.insert(creatorBossImports).values(data).returning();
    return row;
  }

  // ─── Runtime ──────────────────────────────────────────────────────────────
  async listRuntime(bossId: number) {
    return db.select().from(creatorBossRuntime).where(eq(creatorBossRuntime.bossId, bossId)).orderBy(desc(creatorBossRuntime.createdAt));
  }

  async getRuntime(sessionId: string) {
    const [row] = await db.select().from(creatorBossRuntime).where(eq(creatorBossRuntime.sessionId, sessionId));
    return row ?? null;
  }

  async createRuntime(data: typeof creatorBossRuntime.$inferInsert) {
    const [row] = await db.insert(creatorBossRuntime).values(data).returning();
    return row;
  }

  async updateRuntime(sessionId: string, data: Partial<typeof creatorBossRuntime.$inferInsert>) {
    const [row] = await db.update(creatorBossRuntime).set({ ...data, updatedAt: new Date() }).where(eq(creatorBossRuntime.sessionId, sessionId)).returning();
    return row;
  }

  // ─── Full Boss ────────────────────────────────────────────────────────────
  async getFull(id: number) {
    const boss = await this.get(id);
    if (!boss) return null;
    const [phases, skills, patterns, attacks, weakpoints, enrage, loot, rewards, spawnRules, arenas, cinematics, dialogues] = await Promise.all([
      this.listPhases(id), this.listSkills(id), this.listPatterns(id), this.listAttacks(id),
      this.listWeakpoints(id), this.listEnrage(id), this.listLoot(id), this.listRewards(id),
      this.listSpawnRules(id), this.listArenas(id), this.listCinematics(id), this.listDialogues(id),
    ]);
    return { ...boss, phases, skills, patterns, attacks, weakpoints, enrage, loot, rewards, spawnRules, arenas, cinematics, dialogues };
  }
}
