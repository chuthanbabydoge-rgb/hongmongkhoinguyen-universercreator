import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  creatorSkills, creatorSkillLevels, creatorSkillCosts, creatorSkillCooldowns,
  creatorSkillEffects, creatorSkillBuffs, creatorSkillDebuffs, creatorSkillProjectiles,
  creatorSkillHitboxes, creatorSkillAnimations, creatorSkillAudio, creatorSkillVisuals,
  creatorSkillRequirements, creatorSkillTags, creatorSkillVersions, creatorSkillHistory,
  creatorSkillTemplates, creatorSkillStatistics, creatorSkillExports, creatorSkillImports,
  type Skill, type InsertSkill,
} from "@workspace/db/schema";

export class DrizzleSkillRepository {
  // ─── Skills ───────────────────────────────────────────────────────────────

  async listSkills(createdBy: number, limit: number, offset: number, search?: string): Promise<Skill[]> {
    const conditions = [eq(creatorSkills.createdBy, createdBy), eq(creatorSkills.isArchived, false)];
    if (search) conditions.push(ilike(creatorSkills.name, `%${search}%`));
    return db.select().from(creatorSkills).where(and(...conditions)).orderBy(desc(creatorSkills.updatedAt)).limit(limit).offset(offset);
  }

  async createSkill(data: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(creatorSkills).values(data).returning();
    return skill!;
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(creatorSkills).where(eq(creatorSkills.id, id));
    return skill;
  }

  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill> {
    const [skill] = await db.update(creatorSkills).set({ ...data, updatedAt: new Date() }).where(eq(creatorSkills.id, id)).returning();
    return skill!;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(creatorSkills).where(eq(creatorSkills.id, id));
  }

  async getDashboard(createdBy: number): Promise<{ total: number; published: number; drafts: number; archived: number; recent: Skill[] }> {
    const all = await db.select().from(creatorSkills).where(eq(creatorSkills.createdBy, createdBy));
    return {
      total: all.filter(s => !s.isArchived).length,
      published: all.filter(s => s.isPublished && !s.isArchived).length,
      drafts: all.filter(s => !s.isPublished && !s.isArchived).length,
      archived: all.filter(s => s.isArchived).length,
      recent: all.filter(s => !s.isArchived).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10),
    };
  }

  // ─── Levels ───────────────────────────────────────────────────────────────

  async getLevels(skillId: number) {
    return db.select().from(creatorSkillLevels).where(eq(creatorSkillLevels.skillId, skillId)).orderBy(creatorSkillLevels.level);
  }

  async upsertLevel(data: typeof creatorSkillLevels.$inferInsert) {
    const [row] = await db.insert(creatorSkillLevels).values(data)
      .onConflictDoUpdate({ target: [creatorSkillLevels.skillId, creatorSkillLevels.level], set: { ...data, createdAt: undefined } })
      .returning();
    return row!;
  }

  async deleteLevel(id: number) { await db.delete(creatorSkillLevels).where(eq(creatorSkillLevels.id, id)); }

  // ─── Costs ────────────────────────────────────────────────────────────────

  async getCosts(skillId: number) { return db.select().from(creatorSkillCosts).where(eq(creatorSkillCosts.skillId, skillId)).orderBy(creatorSkillCosts.displayOrder); }

  async createCost(data: typeof creatorSkillCosts.$inferInsert) {
    const [row] = await db.insert(creatorSkillCosts).values(data).returning();
    return row!;
  }

  async updateCost(id: number, data: Partial<typeof creatorSkillCosts.$inferInsert>) {
    const [row] = await db.update(creatorSkillCosts).set(data).where(eq(creatorSkillCosts.id, id)).returning();
    return row!;
  }

  async deleteCost(id: number) { await db.delete(creatorSkillCosts).where(eq(creatorSkillCosts.id, id)); }

  // ─── Cooldowns ────────────────────────────────────────────────────────────

  async getCooldowns(skillId: number) { return db.select().from(creatorSkillCooldowns).where(eq(creatorSkillCooldowns.skillId, skillId)); }

  async upsertCooldown(data: typeof creatorSkillCooldowns.$inferInsert) {
    const existing = await this.getCooldowns(data.skillId);
    if (existing.length > 0) {
      const [row] = await db.update(creatorSkillCooldowns).set(data).where(eq(creatorSkillCooldowns.id, existing[0]!.id)).returning();
      return row!;
    }
    const [row] = await db.insert(creatorSkillCooldowns).values(data).returning();
    return row!;
  }

  async deleteCooldown(id: number) { await db.delete(creatorSkillCooldowns).where(eq(creatorSkillCooldowns.id, id)); }

  // ─── Effects ──────────────────────────────────────────────────────────────

  async getEffects(skillId: number) { return db.select().from(creatorSkillEffects).where(eq(creatorSkillEffects.skillId, skillId)).orderBy(creatorSkillEffects.displayOrder); }

  async createEffect(data: typeof creatorSkillEffects.$inferInsert) {
    const [row] = await db.insert(creatorSkillEffects).values(data).returning();
    return row!;
  }

  async updateEffect(id: number, data: Partial<typeof creatorSkillEffects.$inferInsert>) {
    const [row] = await db.update(creatorSkillEffects).set(data).where(eq(creatorSkillEffects.id, id)).returning();
    return row!;
  }

  async deleteEffect(id: number) { await db.delete(creatorSkillEffects).where(eq(creatorSkillEffects.id, id)); }

  // ─── Buffs ────────────────────────────────────────────────────────────────

  async getBuffs(skillId: number) { return db.select().from(creatorSkillBuffs).where(eq(creatorSkillBuffs.skillId, skillId)).orderBy(creatorSkillBuffs.displayOrder); }

  async createBuff(data: typeof creatorSkillBuffs.$inferInsert) {
    const [row] = await db.insert(creatorSkillBuffs).values(data).returning();
    return row!;
  }

  async updateBuff(id: number, data: Partial<typeof creatorSkillBuffs.$inferInsert>) {
    const [row] = await db.update(creatorSkillBuffs).set(data).where(eq(creatorSkillBuffs.id, id)).returning();
    return row!;
  }

  async deleteBuff(id: number) { await db.delete(creatorSkillBuffs).where(eq(creatorSkillBuffs.id, id)); }

  // ─── Debuffs ──────────────────────────────────────────────────────────────

  async getDebuffs(skillId: number) { return db.select().from(creatorSkillDebuffs).where(eq(creatorSkillDebuffs.skillId, skillId)).orderBy(creatorSkillDebuffs.displayOrder); }

  async createDebuff(data: typeof creatorSkillDebuffs.$inferInsert) {
    const [row] = await db.insert(creatorSkillDebuffs).values(data).returning();
    return row!;
  }

  async updateDebuff(id: number, data: Partial<typeof creatorSkillDebuffs.$inferInsert>) {
    const [row] = await db.update(creatorSkillDebuffs).set(data).where(eq(creatorSkillDebuffs.id, id)).returning();
    return row!;
  }

  async deleteDebuff(id: number) { await db.delete(creatorSkillDebuffs).where(eq(creatorSkillDebuffs.id, id)); }

  // ─── Projectiles ──────────────────────────────────────────────────────────

  async getProjectiles(skillId: number) { return db.select().from(creatorSkillProjectiles).where(eq(creatorSkillProjectiles.skillId, skillId)); }

  async createProjectile(data: typeof creatorSkillProjectiles.$inferInsert) {
    const [row] = await db.insert(creatorSkillProjectiles).values(data).returning();
    return row!;
  }

  async updateProjectile(id: number, data: Partial<typeof creatorSkillProjectiles.$inferInsert>) {
    const [row] = await db.update(creatorSkillProjectiles).set(data).where(eq(creatorSkillProjectiles.id, id)).returning();
    return row!;
  }

  async deleteProjectile(id: number) { await db.delete(creatorSkillProjectiles).where(eq(creatorSkillProjectiles.id, id)); }

  // ─── Hitboxes ─────────────────────────────────────────────────────────────

  async getHitboxes(skillId: number) { return db.select().from(creatorSkillHitboxes).where(eq(creatorSkillHitboxes.skillId, skillId)); }

  async createHitbox(data: typeof creatorSkillHitboxes.$inferInsert) {
    const [row] = await db.insert(creatorSkillHitboxes).values(data).returning();
    return row!;
  }

  async deleteHitbox(id: number) { await db.delete(creatorSkillHitboxes).where(eq(creatorSkillHitboxes.id, id)); }

  // ─── Animations ───────────────────────────────────────────────────────────

  async getAnimations(skillId: number) { return db.select().from(creatorSkillAnimations).where(eq(creatorSkillAnimations.skillId, skillId)).orderBy(creatorSkillAnimations.displayOrder); }

  async createAnimation(data: typeof creatorSkillAnimations.$inferInsert) {
    const [row] = await db.insert(creatorSkillAnimations).values(data).returning();
    return row!;
  }

  async updateAnimation(id: number, data: Partial<typeof creatorSkillAnimations.$inferInsert>) {
    const [row] = await db.update(creatorSkillAnimations).set(data).where(eq(creatorSkillAnimations.id, id)).returning();
    return row!;
  }

  async deleteAnimation(id: number) { await db.delete(creatorSkillAnimations).where(eq(creatorSkillAnimations.id, id)); }

  // ─── Audio ────────────────────────────────────────────────────────────────

  async getAudio(skillId: number) { return db.select().from(creatorSkillAudio).where(eq(creatorSkillAudio.skillId, skillId)).orderBy(creatorSkillAudio.displayOrder); }

  async createAudio(data: typeof creatorSkillAudio.$inferInsert) {
    const [row] = await db.insert(creatorSkillAudio).values(data).returning();
    return row!;
  }

  async updateAudio(id: number, data: Partial<typeof creatorSkillAudio.$inferInsert>) {
    const [row] = await db.update(creatorSkillAudio).set(data).where(eq(creatorSkillAudio.id, id)).returning();
    return row!;
  }

  async deleteAudio(id: number) { await db.delete(creatorSkillAudio).where(eq(creatorSkillAudio.id, id)); }

  // ─── Visuals ──────────────────────────────────────────────────────────────

  async getVisuals(skillId: number) { return db.select().from(creatorSkillVisuals).where(eq(creatorSkillVisuals.skillId, skillId)).orderBy(creatorSkillVisuals.displayOrder); }

  async createVisual(data: typeof creatorSkillVisuals.$inferInsert) {
    const [row] = await db.insert(creatorSkillVisuals).values(data).returning();
    return row!;
  }

  async updateVisual(id: number, data: Partial<typeof creatorSkillVisuals.$inferInsert>) {
    const [row] = await db.update(creatorSkillVisuals).set(data).where(eq(creatorSkillVisuals.id, id)).returning();
    return row!;
  }

  async deleteVisual(id: number) { await db.delete(creatorSkillVisuals).where(eq(creatorSkillVisuals.id, id)); }

  // ─── Requirements ─────────────────────────────────────────────────────────

  async getRequirements(skillId: number) { return db.select().from(creatorSkillRequirements).where(eq(creatorSkillRequirements.skillId, skillId)).orderBy(creatorSkillRequirements.displayOrder); }

  async createRequirement(data: typeof creatorSkillRequirements.$inferInsert) {
    const [row] = await db.insert(creatorSkillRequirements).values(data).returning();
    return row!;
  }

  async deleteRequirement(id: number) { await db.delete(creatorSkillRequirements).where(eq(creatorSkillRequirements.id, id)); }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  async getTags(skillId: number) { return db.select().from(creatorSkillTags).where(eq(creatorSkillTags.skillId, skillId)); }

  async createTag(data: typeof creatorSkillTags.$inferInsert) {
    const [row] = await db.insert(creatorSkillTags).values(data).returning();
    return row!;
  }

  async deleteTag(id: number) { await db.delete(creatorSkillTags).where(eq(creatorSkillTags.id, id)); }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async getVersions(skillId: number) { return db.select().from(creatorSkillVersions).where(eq(creatorSkillVersions.skillId, skillId)).orderBy(desc(creatorSkillVersions.version)); }

  async createVersion(data: typeof creatorSkillVersions.$inferInsert) {
    const [row] = await db.insert(creatorSkillVersions).values(data).returning();
    return row!;
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async getHistory(skillId: number, limit: number, offset: number) { return db.select().from(creatorSkillHistory).where(eq(creatorSkillHistory.skillId, skillId)).orderBy(desc(creatorSkillHistory.createdAt)).limit(limit).offset(offset); }

  async recordHistory(data: typeof creatorSkillHistory.$inferInsert) {
    await db.insert(creatorSkillHistory).values(data);
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(limit: number, offset: number) { return db.select().from(creatorSkillTemplates).orderBy(desc(creatorSkillTemplates.useCount)).limit(limit).offset(offset); }

  async createTemplate(data: typeof creatorSkillTemplates.$inferInsert) {
    const [row] = await db.insert(creatorSkillTemplates).values(data).returning();
    return row!;
  }

  async getTemplate(id: number) {
    const [row] = await db.select().from(creatorSkillTemplates).where(eq(creatorSkillTemplates.id, id));
    return row;
  }

  async incrementTemplateUse(id: number) {
    await db.update(creatorSkillTemplates).set({ useCount: sql`${creatorSkillTemplates.useCount} + 1` }).where(eq(creatorSkillTemplates.id, id));
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async getStatistics(skillId: number) {
    const [row] = await db.select().from(creatorSkillStatistics).where(eq(creatorSkillStatistics.skillId, skillId));
    return row;
  }

  async upsertStatistics(skillId: number, data: Partial<typeof creatorSkillStatistics.$inferInsert>) {
    const [row] = await db.insert(creatorSkillStatistics).values({ skillId, ...data, updatedAt: new Date() })
      .onConflictDoUpdate({ target: creatorSkillStatistics.skillId, set: { ...data, updatedAt: new Date() } })
      .returning();
    return row!;
  }

  // ─── Exports / Imports ────────────────────────────────────────────────────

  async createExport(data: typeof creatorSkillExports.$inferInsert) {
    const [row] = await db.insert(creatorSkillExports).values(data).returning();
    return row!;
  }

  async getExports(skillId: number) { return db.select().from(creatorSkillExports).where(eq(creatorSkillExports.skillId, skillId)).orderBy(desc(creatorSkillExports.createdAt)); }

  async createImport(data: typeof creatorSkillImports.$inferInsert) {
    const [row] = await db.insert(creatorSkillImports).values(data).returning();
    return row!;
  }
}
