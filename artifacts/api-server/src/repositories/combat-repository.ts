import { db } from "@workspace/db";
import {
  creatorCombats, creatorCombatRules, creatorDamageFormulas, creatorDamageModifiers,
  creatorDefenseRules, creatorResistances, creatorHitRules, creatorCriticalRules,
  creatorBlockRules, creatorDodgeRules, creatorParryRules, creatorComboRules,
  creatorStatusEffects, creatorStatusEffectStacks, creatorThreatRules, creatorRespawnRules,
  creatorCombatZones, creatorTargetFilters, creatorCombatHistory, creatorCombatVersions,
  type InsertCombat,
} from "@workspace/db/schema";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";

export class DrizzleCombatRepository {

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(userId: number) {
    const [total, published, archived, templates] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(creatorCombats).where(eq(creatorCombats.createdBy, userId)),
      db.select({ count: sql<number>`count(*)` }).from(creatorCombats).where(and(eq(creatorCombats.createdBy, userId), eq(creatorCombats.isPublished, true))),
      db.select({ count: sql<number>`count(*)` }).from(creatorCombats).where(and(eq(creatorCombats.createdBy, userId), eq(creatorCombats.isArchived, true))),
      db.select({ count: sql<number>`count(*)` }).from(creatorCombats).where(and(eq(creatorCombats.createdBy, userId), eq(creatorCombats.isTemplate, true))),
    ]);
    const recent = await db.select().from(creatorCombats).where(eq(creatorCombats.createdBy, userId)).orderBy(desc(creatorCombats.updatedAt)).limit(5);
    return {
      totalCombats: Number(total[0]?.count ?? 0),
      publishedCombats: Number(published[0]?.count ?? 0),
      archivedCombats: Number(archived[0]?.count ?? 0),
      templateCount: Number(templates[0]?.count ?? 0),
      recentCombats: recent,
    };
  }

  // ─── Combat CRUD ─────────────────────────────────────────────────────────────

  async listCombats(userId: number, limit: number, offset: number, search?: string) {
    const where = search
      ? and(eq(creatorCombats.createdBy, userId), or(ilike(creatorCombats.name, `%${search}%`), ilike(creatorCombats.description, `%${search}%`)))
      : eq(creatorCombats.createdBy, userId);
    const [items, countResult] = await Promise.all([
      db.select().from(creatorCombats).where(where).orderBy(desc(creatorCombats.updatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creatorCombats).where(where),
    ]);
    return { items, total: Number(countResult[0]?.count ?? 0), limit, offset };
  }

  async createCombat(data: InsertCombat) {
    const [row] = await db.insert(creatorCombats).values(data).returning();
    return row!;
  }

  async getCombat(id: number) {
    const [row] = await db.select().from(creatorCombats).where(eq(creatorCombats.id, id));
    return row ?? null;
  }

  async updateCombat(id: number, data: Partial<InsertCombat>) {
    const [row] = await db.update(creatorCombats).set({ ...data, updatedAt: new Date() }).where(eq(creatorCombats.id, id)).returning();
    return row!;
  }

  async deleteCombat(id: number) {
    await db.delete(creatorCombats).where(eq(creatorCombats.id, id));
  }

  // ─── Combat Rules ─────────────────────────────────────────────────────────────

  async getRules(combatId: number) {
    return db.select().from(creatorCombatRules).where(eq(creatorCombatRules.combatId, combatId)).orderBy(creatorCombatRules.displayOrder);
  }

  async createRule(data: typeof creatorCombatRules.$inferInsert) {
    const [row] = await db.insert(creatorCombatRules).values(data).returning();
    return row!;
  }

  async updateRule(id: number, data: Partial<typeof creatorCombatRules.$inferInsert>) {
    const [row] = await db.update(creatorCombatRules).set(data).where(eq(creatorCombatRules.id, id)).returning();
    return row!;
  }

  async deleteRule(id: number) {
    await db.delete(creatorCombatRules).where(eq(creatorCombatRules.id, id));
  }

  // ─── Damage Formulas ──────────────────────────────────────────────────────────

  async getDamageFormulas(combatId: number) {
    return db.select().from(creatorDamageFormulas).where(eq(creatorDamageFormulas.combatId, combatId)).orderBy(creatorDamageFormulas.displayOrder);
  }

  async createDamageFormula(data: typeof creatorDamageFormulas.$inferInsert) {
    const [row] = await db.insert(creatorDamageFormulas).values(data).returning();
    return row!;
  }

  async updateDamageFormula(id: number, data: Partial<typeof creatorDamageFormulas.$inferInsert>) {
    const [row] = await db.update(creatorDamageFormulas).set(data).where(eq(creatorDamageFormulas.id, id)).returning();
    return row!;
  }

  async deleteDamageFormula(id: number) {
    await db.delete(creatorDamageFormulas).where(eq(creatorDamageFormulas.id, id));
  }

  // ─── Damage Modifiers ─────────────────────────────────────────────────────────

  async getDamageModifiers(combatId: number) {
    return db.select().from(creatorDamageModifiers).where(eq(creatorDamageModifiers.combatId, combatId)).orderBy(creatorDamageModifiers.displayOrder);
  }

  async createDamageModifier(data: typeof creatorDamageModifiers.$inferInsert) {
    const [row] = await db.insert(creatorDamageModifiers).values(data).returning();
    return row!;
  }

  async updateDamageModifier(id: number, data: Partial<typeof creatorDamageModifiers.$inferInsert>) {
    const [row] = await db.update(creatorDamageModifiers).set(data).where(eq(creatorDamageModifiers.id, id)).returning();
    return row!;
  }

  async deleteDamageModifier(id: number) {
    await db.delete(creatorDamageModifiers).where(eq(creatorDamageModifiers.id, id));
  }

  // ─── Defense Rules ────────────────────────────────────────────────────────────

  async getDefenseRules(combatId: number) {
    return db.select().from(creatorDefenseRules).where(eq(creatorDefenseRules.combatId, combatId)).orderBy(creatorDefenseRules.displayOrder);
  }

  async createDefenseRule(data: typeof creatorDefenseRules.$inferInsert) {
    const [row] = await db.insert(creatorDefenseRules).values(data).returning();
    return row!;
  }

  async updateDefenseRule(id: number, data: Partial<typeof creatorDefenseRules.$inferInsert>) {
    const [row] = await db.update(creatorDefenseRules).set(data).where(eq(creatorDefenseRules.id, id)).returning();
    return row!;
  }

  async deleteDefenseRule(id: number) {
    await db.delete(creatorDefenseRules).where(eq(creatorDefenseRules.id, id));
  }

  // ─── Resistances ──────────────────────────────────────────────────────────────

  async getResistances(combatId: number) {
    return db.select().from(creatorResistances).where(eq(creatorResistances.combatId, combatId)).orderBy(creatorResistances.displayOrder);
  }

  async createResistance(data: typeof creatorResistances.$inferInsert) {
    const [row] = await db.insert(creatorResistances).values(data).returning();
    return row!;
  }

  async updateResistance(id: number, data: Partial<typeof creatorResistances.$inferInsert>) {
    const [row] = await db.update(creatorResistances).set(data).where(eq(creatorResistances.id, id)).returning();
    return row!;
  }

  async deleteResistance(id: number) {
    await db.delete(creatorResistances).where(eq(creatorResistances.id, id));
  }

  // ─── Hit Rules ────────────────────────────────────────────────────────────────

  async getHitRules(combatId: number) {
    return db.select().from(creatorHitRules).where(eq(creatorHitRules.combatId, combatId)).orderBy(creatorHitRules.displayOrder);
  }

  async createHitRule(data: typeof creatorHitRules.$inferInsert) {
    const [row] = await db.insert(creatorHitRules).values(data).returning();
    return row!;
  }

  async updateHitRule(id: number, data: Partial<typeof creatorHitRules.$inferInsert>) {
    const [row] = await db.update(creatorHitRules).set(data).where(eq(creatorHitRules.id, id)).returning();
    return row!;
  }

  async deleteHitRule(id: number) {
    await db.delete(creatorHitRules).where(eq(creatorHitRules.id, id));
  }

  // ─── Critical Rules ───────────────────────────────────────────────────────────

  async getCriticalRules(combatId: number) {
    return db.select().from(creatorCriticalRules).where(eq(creatorCriticalRules.combatId, combatId)).orderBy(creatorCriticalRules.displayOrder);
  }

  async createCriticalRule(data: typeof creatorCriticalRules.$inferInsert) {
    const [row] = await db.insert(creatorCriticalRules).values(data).returning();
    return row!;
  }

  async updateCriticalRule(id: number, data: Partial<typeof creatorCriticalRules.$inferInsert>) {
    const [row] = await db.update(creatorCriticalRules).set(data).where(eq(creatorCriticalRules.id, id)).returning();
    return row!;
  }

  async deleteCriticalRule(id: number) {
    await db.delete(creatorCriticalRules).where(eq(creatorCriticalRules.id, id));
  }

  // ─── Block Rules ──────────────────────────────────────────────────────────────

  async getBlockRules(combatId: number) {
    return db.select().from(creatorBlockRules).where(eq(creatorBlockRules.combatId, combatId)).orderBy(creatorBlockRules.displayOrder);
  }

  async createBlockRule(data: typeof creatorBlockRules.$inferInsert) {
    const [row] = await db.insert(creatorBlockRules).values(data).returning();
    return row!;
  }

  async updateBlockRule(id: number, data: Partial<typeof creatorBlockRules.$inferInsert>) {
    const [row] = await db.update(creatorBlockRules).set(data).where(eq(creatorBlockRules.id, id)).returning();
    return row!;
  }

  async deleteBlockRule(id: number) {
    await db.delete(creatorBlockRules).where(eq(creatorBlockRules.id, id));
  }

  // ─── Dodge Rules ──────────────────────────────────────────────────────────────

  async getDodgeRules(combatId: number) {
    return db.select().from(creatorDodgeRules).where(eq(creatorDodgeRules.combatId, combatId)).orderBy(creatorDodgeRules.displayOrder);
  }

  async createDodgeRule(data: typeof creatorDodgeRules.$inferInsert) {
    const [row] = await db.insert(creatorDodgeRules).values(data).returning();
    return row!;
  }

  async updateDodgeRule(id: number, data: Partial<typeof creatorDodgeRules.$inferInsert>) {
    const [row] = await db.update(creatorDodgeRules).set(data).where(eq(creatorDodgeRules.id, id)).returning();
    return row!;
  }

  async deleteDodgeRule(id: number) {
    await db.delete(creatorDodgeRules).where(eq(creatorDodgeRules.id, id));
  }

  // ─── Parry Rules ──────────────────────────────────────────────────────────────

  async getParryRules(combatId: number) {
    return db.select().from(creatorParryRules).where(eq(creatorParryRules.combatId, combatId)).orderBy(creatorParryRules.displayOrder);
  }

  async createParryRule(data: typeof creatorParryRules.$inferInsert) {
    const [row] = await db.insert(creatorParryRules).values(data).returning();
    return row!;
  }

  async updateParryRule(id: number, data: Partial<typeof creatorParryRules.$inferInsert>) {
    const [row] = await db.update(creatorParryRules).set(data).where(eq(creatorParryRules.id, id)).returning();
    return row!;
  }

  async deleteParryRule(id: number) {
    await db.delete(creatorParryRules).where(eq(creatorParryRules.id, id));
  }

  // ─── Combo Rules ──────────────────────────────────────────────────────────────

  async getComboRules(combatId: number) {
    return db.select().from(creatorComboRules).where(eq(creatorComboRules.combatId, combatId)).orderBy(creatorComboRules.displayOrder);
  }

  async createComboRule(data: typeof creatorComboRules.$inferInsert) {
    const [row] = await db.insert(creatorComboRules).values(data).returning();
    return row!;
  }

  async updateComboRule(id: number, data: Partial<typeof creatorComboRules.$inferInsert>) {
    const [row] = await db.update(creatorComboRules).set(data).where(eq(creatorComboRules.id, id)).returning();
    return row!;
  }

  async deleteComboRule(id: number) {
    await db.delete(creatorComboRules).where(eq(creatorComboRules.id, id));
  }

  // ─── Status Effects ───────────────────────────────────────────────────────────

  async getStatusEffects(combatId: number) {
    return db.select().from(creatorStatusEffects).where(eq(creatorStatusEffects.combatId, combatId)).orderBy(creatorStatusEffects.displayOrder);
  }

  async createStatusEffect(data: typeof creatorStatusEffects.$inferInsert) {
    const [row] = await db.insert(creatorStatusEffects).values(data).returning();
    return row!;
  }

  async updateStatusEffect(id: number, data: Partial<typeof creatorStatusEffects.$inferInsert>) {
    const [row] = await db.update(creatorStatusEffects).set(data).where(eq(creatorStatusEffects.id, id)).returning();
    return row!;
  }

  async deleteStatusEffect(id: number) {
    await db.delete(creatorStatusEffects).where(eq(creatorStatusEffects.id, id));
  }

  async getStatusStacks(statusEffectId: number) {
    return db.select().from(creatorStatusEffectStacks).where(eq(creatorStatusEffectStacks.statusEffectId, statusEffectId)).orderBy(creatorStatusEffectStacks.stackLevel);
  }

  async upsertStatusStack(data: typeof creatorStatusEffectStacks.$inferInsert) {
    const [row] = await db.insert(creatorStatusEffectStacks).values(data)
      .onConflictDoUpdate({ target: [creatorStatusEffectStacks.statusEffectId, creatorStatusEffectStacks.stackLevel], set: { durationMultiplier: data.durationMultiplier, damageMultiplier: data.damageMultiplier, additionalEffect: data.additionalEffect } })
      .returning();
    return row!;
  }

  async deleteStatusStack(id: number) {
    await db.delete(creatorStatusEffectStacks).where(eq(creatorStatusEffectStacks.id, id));
  }

  // ─── Threat Rules ─────────────────────────────────────────────────────────────

  async getThreatRules(combatId: number) {
    return db.select().from(creatorThreatRules).where(eq(creatorThreatRules.combatId, combatId)).orderBy(creatorThreatRules.displayOrder);
  }

  async createThreatRule(data: typeof creatorThreatRules.$inferInsert) {
    const [row] = await db.insert(creatorThreatRules).values(data).returning();
    return row!;
  }

  async updateThreatRule(id: number, data: Partial<typeof creatorThreatRules.$inferInsert>) {
    const [row] = await db.update(creatorThreatRules).set(data).where(eq(creatorThreatRules.id, id)).returning();
    return row!;
  }

  async deleteThreatRule(id: number) {
    await db.delete(creatorThreatRules).where(eq(creatorThreatRules.id, id));
  }

  // ─── Respawn Rules ────────────────────────────────────────────────────────────

  async getRespawnRules(combatId: number) {
    return db.select().from(creatorRespawnRules).where(eq(creatorRespawnRules.combatId, combatId)).orderBy(creatorRespawnRules.displayOrder);
  }

  async createRespawnRule(data: typeof creatorRespawnRules.$inferInsert) {
    const [row] = await db.insert(creatorRespawnRules).values(data).returning();
    return row!;
  }

  async updateRespawnRule(id: number, data: Partial<typeof creatorRespawnRules.$inferInsert>) {
    const [row] = await db.update(creatorRespawnRules).set(data).where(eq(creatorRespawnRules.id, id)).returning();
    return row!;
  }

  async deleteRespawnRule(id: number) {
    await db.delete(creatorRespawnRules).where(eq(creatorRespawnRules.id, id));
  }

  // ─── Combat Zones ─────────────────────────────────────────────────────────────

  async getCombatZones(combatId: number) {
    return db.select().from(creatorCombatZones).where(eq(creatorCombatZones.combatId, combatId));
  }

  async createCombatZone(data: typeof creatorCombatZones.$inferInsert) {
    const [row] = await db.insert(creatorCombatZones).values(data).returning();
    return row!;
  }

  async updateCombatZone(id: number, data: Partial<typeof creatorCombatZones.$inferInsert>) {
    const [row] = await db.update(creatorCombatZones).set(data).where(eq(creatorCombatZones.id, id)).returning();
    return row!;
  }

  async deleteCombatZone(id: number) {
    await db.delete(creatorCombatZones).where(eq(creatorCombatZones.id, id));
  }

  // ─── Target Filters ───────────────────────────────────────────────────────────

  async getTargetFilters(combatId: number) {
    return db.select().from(creatorTargetFilters).where(eq(creatorTargetFilters.combatId, combatId)).orderBy(creatorTargetFilters.displayOrder);
  }

  async createTargetFilter(data: typeof creatorTargetFilters.$inferInsert) {
    const [row] = await db.insert(creatorTargetFilters).values(data).returning();
    return row!;
  }

  async updateTargetFilter(id: number, data: Partial<typeof creatorTargetFilters.$inferInsert>) {
    const [row] = await db.update(creatorTargetFilters).set(data).where(eq(creatorTargetFilters.id, id)).returning();
    return row!;
  }

  async deleteTargetFilter(id: number) {
    await db.delete(creatorTargetFilters).where(eq(creatorTargetFilters.id, id));
  }

  // ─── History & Versions ───────────────────────────────────────────────────────

  async recordHistory(data: typeof creatorCombatHistory.$inferInsert) {
    const [row] = await db.insert(creatorCombatHistory).values(data).returning();
    return row!;
  }

  async getHistory(combatId: number, limit: number, offset: number) {
    const [items, countResult] = await Promise.all([
      db.select().from(creatorCombatHistory).where(eq(creatorCombatHistory.combatId, combatId)).orderBy(desc(creatorCombatHistory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creatorCombatHistory).where(eq(creatorCombatHistory.combatId, combatId)),
    ]);
    return { items, total: Number(countResult[0]?.count ?? 0) };
  }

  async createVersion(data: typeof creatorCombatVersions.$inferInsert) {
    const [row] = await db.insert(creatorCombatVersions).values(data)
      .onConflictDoUpdate({ target: [creatorCombatVersions.combatId, creatorCombatVersions.version], set: { snapshot: data.snapshot, changelog: data.changelog } })
      .returning();
    return row!;
  }

  async getVersions(combatId: number) {
    return db.select().from(creatorCombatVersions).where(eq(creatorCombatVersions.combatId, combatId)).orderBy(desc(creatorCombatVersions.version));
  }
}
