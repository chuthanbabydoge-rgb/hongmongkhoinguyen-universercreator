import { db } from "@workspace/db";
import {
  creatorPets, creatorPetSpecies, creatorPetLevels, creatorPetStats,
  creatorPetGrowth, creatorPetSkills, creatorPetEquipment, creatorPetLoyalty,
  creatorPetHunger, creatorPetPersonality, creatorPetEvolution, creatorPetBreeding,
  creatorPetSpawnRules, creatorPetTemplates, creatorPetVersions, creatorPetHistory,
  creatorPetStatistics, creatorPetExports, creatorPetImports, creatorPetRuntime,
  type InsertPet, type InsertPetSpecies, type InsertPetLevel, type InsertPetStat,
  type InsertPetGrowth, type InsertPetSkill, type InsertPetEquipment,
  type InsertPetLoyalty, type InsertPetHunger, type InsertPetPersonality,
  type InsertPetEvolution, type InsertPetBreeding, type InsertPetSpawnRule,
  type InsertPetTemplate, type InsertPetVersion, type InsertPetHistory,
  type InsertPetStatistic, type InsertPetRuntime,
} from "@workspace/db/schema";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";

export class DrizzlePetRepository {

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboard(userId: number) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(creatorPets).where(eq(creatorPets.createdBy, userId));
    const [published] = await db.select({ count: sql<number>`count(*)` }).from(creatorPets).where(and(eq(creatorPets.createdBy, userId), eq(creatorPets.isPublished, true)));
    const [templates] = await db.select({ count: sql<number>`count(*)` }).from(creatorPets).where(and(eq(creatorPets.createdBy, userId), eq(creatorPets.isTemplate, true)));
    const recent = await db.select().from(creatorPets).where(eq(creatorPets.createdBy, userId)).orderBy(desc(creatorPets.updatedAt)).limit(5);
    const species = await db.select({ count: sql<number>`count(*)` }).from(creatorPetSpecies).where(eq(creatorPetSpecies.projectId, 0));
    return { total: total?.count ?? 0, published: published?.count ?? 0, templates: templates?.count ?? 0, species: species[0]?.count ?? 0, recent };
  }

  // ─── Pet CRUD ───────────────────────────────────────────────────────────────
  async listPets(userId: number, limit = 20, offset = 0, search?: string) {
    const where = search
      ? and(eq(creatorPets.createdBy, userId), or(ilike(creatorPets.name, `%${search}%`), ilike(creatorPets.description ?? "", `%${search}%`)))
      : eq(creatorPets.createdBy, userId);
    return db.select().from(creatorPets).where(where).orderBy(desc(creatorPets.updatedAt)).limit(limit).offset(offset);
  }

  async getPet(id: number) {
    const [pet] = await db.select().from(creatorPets).where(eq(creatorPets.id, id));
    return pet ?? null;
  }

  async createPet(data: InsertPet) {
    const [pet] = await db.insert(creatorPets).values(data).returning();
    return pet!;
  }

  async updatePet(id: number, data: Partial<InsertPet>) {
    const [pet] = await db.update(creatorPets).set({ ...data, updatedAt: new Date() }).where(eq(creatorPets.id, id)).returning();
    return pet ?? null;
  }

  async deletePet(id: number) {
    await db.delete(creatorPets).where(eq(creatorPets.id, id));
  }

  async getFullPet(id: number) {
    const pet = await this.getPet(id);
    if (!pet) return null;
    const [stats, growth, loyalty, hunger, personality, evolution, breeding, skills, equipment, spawnRules] = await Promise.all([
      db.select().from(creatorPetStats).where(eq(creatorPetStats.petId, id)),
      db.select().from(creatorPetGrowth).where(eq(creatorPetGrowth.petId, id)),
      db.select().from(creatorPetLoyalty).where(eq(creatorPetLoyalty.petId, id)),
      db.select().from(creatorPetHunger).where(eq(creatorPetHunger.petId, id)),
      db.select().from(creatorPetPersonality).where(eq(creatorPetPersonality.petId, id)),
      db.select().from(creatorPetEvolution).where(eq(creatorPetEvolution.petId, id)),
      db.select().from(creatorPetBreeding).where(eq(creatorPetBreeding.petId, id)),
      db.select().from(creatorPetSkills).where(eq(creatorPetSkills.petId, id)),
      db.select().from(creatorPetEquipment).where(eq(creatorPetEquipment.petId, id)),
      db.select().from(creatorPetSpawnRules).where(eq(creatorPetSpawnRules.petId, id)),
    ]);
    return { pet, stats, growth, loyalty, hunger, personality, evolution, breeding, skills, equipment, spawnRules };
  }

  // ─── Species ─────────────────────────────────────────────────────────────
  async listSpecies(projectId: number) {
    return db.select().from(creatorPetSpecies).where(eq(creatorPetSpecies.projectId, projectId)).orderBy(creatorPetSpecies.name);
  }

  async getSpecies(id: number) {
    const [s] = await db.select().from(creatorPetSpecies).where(eq(creatorPetSpecies.id, id));
    return s ?? null;
  }

  async createSpecies(data: InsertPetSpecies) {
    const [s] = await db.insert(creatorPetSpecies).values(data).returning();
    return s!;
  }

  async updateSpecies(id: number, data: Partial<InsertPetSpecies>) {
    const [s] = await db.update(creatorPetSpecies).set(data).where(eq(creatorPetSpecies.id, id)).returning();
    return s ?? null;
  }

  async deleteSpecies(id: number) {
    await db.delete(creatorPetSpecies).where(eq(creatorPetSpecies.id, id));
  }

  // ─── Levels ─────────────────────────────────────────────────────────────
  async getLevels(petId: number) {
    return db.select().from(creatorPetLevels).where(eq(creatorPetLevels.petId, petId)).orderBy(creatorPetLevels.level);
  }

  async upsertLevel(data: InsertPetLevel) {
    const [l] = await db.insert(creatorPetLevels).values(data).returning();
    return l!;
  }

  async deleteLevel(id: number) {
    await db.delete(creatorPetLevels).where(eq(creatorPetLevels.id, id));
  }

  // ─── Stats ───────────────────────────────────────────────────────────────
  async getStats(petId: number) {
    const [s] = await db.select().from(creatorPetStats).where(eq(creatorPetStats.petId, petId));
    return s ?? null;
  }

  async upsertStats(data: InsertPetStat) {
    const existing = await this.getStats(data.petId);
    if (existing) {
      const [s] = await db.update(creatorPetStats).set({ ...data, updatedAt: new Date() }).where(eq(creatorPetStats.petId, data.petId)).returning();
      return s!;
    }
    const [s] = await db.insert(creatorPetStats).values(data).returning();
    return s!;
  }

  // ─── Growth ──────────────────────────────────────────────────────────────
  async getGrowth(petId: number) {
    const [g] = await db.select().from(creatorPetGrowth).where(eq(creatorPetGrowth.petId, petId));
    return g ?? null;
  }

  async upsertGrowth(data: InsertPetGrowth) {
    const existing = await this.getGrowth(data.petId);
    if (existing) {
      const [g] = await db.update(creatorPetGrowth).set(data).where(eq(creatorPetGrowth.petId, data.petId)).returning();
      return g!;
    }
    const [g] = await db.insert(creatorPetGrowth).values(data).returning();
    return g!;
  }

  // ─── Skills ──────────────────────────────────────────────────────────────
  async getSkills(petId: number) {
    return db.select().from(creatorPetSkills).where(eq(creatorPetSkills.petId, petId)).orderBy(creatorPetSkills.slotIndex);
  }

  async addSkill(data: InsertPetSkill) {
    const [s] = await db.insert(creatorPetSkills).values(data).returning();
    return s!;
  }

  async updateSkill(id: number, data: Partial<InsertPetSkill>) {
    const [s] = await db.update(creatorPetSkills).set(data).where(eq(creatorPetSkills.id, id)).returning();
    return s ?? null;
  }

  async deleteSkill(id: number) {
    await db.delete(creatorPetSkills).where(eq(creatorPetSkills.id, id));
  }

  // ─── Equipment ───────────────────────────────────────────────────────────
  async getEquipment(petId: number) {
    return db.select().from(creatorPetEquipment).where(eq(creatorPetEquipment.petId, petId));
  }

  async equipItem(data: InsertPetEquipment) {
    const [e] = await db.insert(creatorPetEquipment).values(data).returning();
    return e!;
  }

  async unequipItem(id: number) {
    await db.delete(creatorPetEquipment).where(eq(creatorPetEquipment.id, id));
  }

  // ─── Loyalty ─────────────────────────────────────────────────────────────
  async getLoyalty(petId: number) {
    const [l] = await db.select().from(creatorPetLoyalty).where(eq(creatorPetLoyalty.petId, petId));
    return l ?? null;
  }

  async upsertLoyalty(data: InsertPetLoyalty) {
    const existing = await this.getLoyalty(data.petId);
    if (existing) {
      const [l] = await db.update(creatorPetLoyalty).set({ ...data, updatedAt: new Date() }).where(eq(creatorPetLoyalty.petId, data.petId)).returning();
      return l!;
    }
    const [l] = await db.insert(creatorPetLoyalty).values(data).returning();
    return l!;
  }

  // ─── Hunger ──────────────────────────────────────────────────────────────
  async getHunger(petId: number) {
    const [h] = await db.select().from(creatorPetHunger).where(eq(creatorPetHunger.petId, petId));
    return h ?? null;
  }

  async upsertHunger(data: InsertPetHunger) {
    const existing = await this.getHunger(data.petId);
    if (existing) {
      const [h] = await db.update(creatorPetHunger).set({ ...data, updatedAt: new Date() }).where(eq(creatorPetHunger.petId, data.petId)).returning();
      return h!;
    }
    const [h] = await db.insert(creatorPetHunger).values(data).returning();
    return h!;
  }

  // ─── Personality ─────────────────────────────────────────────────────────
  async getPersonality(petId: number) {
    const [p] = await db.select().from(creatorPetPersonality).where(eq(creatorPetPersonality.petId, petId));
    return p ?? null;
  }

  async upsertPersonality(data: InsertPetPersonality) {
    const existing = await this.getPersonality(data.petId);
    if (existing) {
      const [p] = await db.update(creatorPetPersonality).set(data).where(eq(creatorPetPersonality.petId, data.petId)).returning();
      return p!;
    }
    const [p] = await db.insert(creatorPetPersonality).values(data).returning();
    return p!;
  }

  // ─── Evolution ───────────────────────────────────────────────────────────
  async getEvolutions(petId: number) {
    return db.select().from(creatorPetEvolution).where(eq(creatorPetEvolution.petId, petId)).orderBy(creatorPetEvolution.evolutionOrder);
  }

  async addEvolution(data: InsertPetEvolution) {
    const [e] = await db.insert(creatorPetEvolution).values(data).returning();
    return e!;
  }

  async updateEvolution(id: number, data: Partial<InsertPetEvolution>) {
    const [e] = await db.update(creatorPetEvolution).set(data).where(eq(creatorPetEvolution.id, id)).returning();
    return e ?? null;
  }

  async deleteEvolution(id: number) {
    await db.delete(creatorPetEvolution).where(eq(creatorPetEvolution.id, id));
  }

  // ─── Breeding ────────────────────────────────────────────────────────────
  async getBreeding(petId: number) {
    const [b] = await db.select().from(creatorPetBreeding).where(eq(creatorPetBreeding.petId, petId));
    return b ?? null;
  }

  async upsertBreeding(data: InsertPetBreeding) {
    const existing = await this.getBreeding(data.petId);
    if (existing) {
      const [b] = await db.update(creatorPetBreeding).set(data).where(eq(creatorPetBreeding.petId, data.petId)).returning();
      return b!;
    }
    const [b] = await db.insert(creatorPetBreeding).values(data).returning();
    return b!;
  }

  // ─── Spawn Rules ─────────────────────────────────────────────────────────
  async getSpawnRules(petId: number) {
    return db.select().from(creatorPetSpawnRules).where(eq(creatorPetSpawnRules.petId, petId));
  }

  async addSpawnRule(data: InsertPetSpawnRule) {
    const [r] = await db.insert(creatorPetSpawnRules).values(data).returning();
    return r!;
  }

  async updateSpawnRule(id: number, data: Partial<InsertPetSpawnRule>) {
    const [r] = await db.update(creatorPetSpawnRules).set(data).where(eq(creatorPetSpawnRules.id, id)).returning();
    return r ?? null;
  }

  async deleteSpawnRule(id: number) {
    await db.delete(creatorPetSpawnRules).where(eq(creatorPetSpawnRules.id, id));
  }

  // ─── Templates ───────────────────────────────────────────────────────────
  async getTemplates(global = false) {
    return db.select().from(creatorPetTemplates).where(eq(creatorPetTemplates.isGlobal, global)).orderBy(desc(creatorPetTemplates.createdAt));
  }

  async addTemplate(data: InsertPetTemplate) {
    const [t] = await db.insert(creatorPetTemplates).values(data).returning();
    return t!;
  }

  // ─── Versions ────────────────────────────────────────────────────────────
  async getVersions(petId: number) {
    return db.select().from(creatorPetVersions).where(eq(creatorPetVersions.petId, petId)).orderBy(desc(creatorPetVersions.version));
  }

  async addVersion(data: InsertPetVersion) {
    const [v] = await db.insert(creatorPetVersions).values(data).returning();
    return v!;
  }

  // ─── History ─────────────────────────────────────────────────────────────
  async getHistory(petId: number) {
    return db.select().from(creatorPetHistory).where(eq(creatorPetHistory.petId, petId)).orderBy(desc(creatorPetHistory.createdAt));
  }

  async addHistory(data: InsertPetHistory) {
    const [h] = await db.insert(creatorPetHistory).values(data).returning();
    return h!;
  }

  // ─── Statistics ──────────────────────────────────────────────────────────
  async getStatistics(petId: number) {
    const [s] = await db.select().from(creatorPetStatistics).where(eq(creatorPetStatistics.petId, petId));
    return s ?? null;
  }

  async upsertStatistics(data: InsertPetStatistic) {
    const existing = await this.getStatistics(data.petId);
    if (existing) {
      const [s] = await db.update(creatorPetStatistics).set({ ...data, updatedAt: new Date() }).where(eq(creatorPetStatistics.petId, data.petId)).returning();
      return s!;
    }
    const [s] = await db.insert(creatorPetStatistics).values(data).returning();
    return s!;
  }

  // ─── Exports / Imports ───────────────────────────────────────────────────
  async addExport(data: InsertPetStatistic & { petId: number; format: string; payload: object; checksum?: string; exportedBy: number }) {
    const [e] = await db.insert(creatorPetExports).values(data as any).returning();
    return e!;
  }

  async addImport(data: { petId: number; source: string; payload: object; status: string; error?: string; importedBy: number }) {
    const [i] = await db.insert(creatorPetImports).values(data as any).returning();
    return i!;
  }

  // ─── Runtime ─────────────────────────────────────────────────────────────
  async getRuntime(petId: number) {
    const [r] = await db.select().from(creatorPetRuntime).where(eq(creatorPetRuntime.petId, petId));
    return r ?? null;
  }

  async upsertRuntime(data: InsertPetRuntime) {
    const existing = await this.getRuntime(data.petId);
    if (existing) {
      const [r] = await db.update(creatorPetRuntime).set({ ...data, updatedAt: new Date() }).where(eq(creatorPetRuntime.petId, data.petId)).returning();
      return r!;
    }
    const [r] = await db.insert(creatorPetRuntime).values(data).returning();
    return r!;
  }
}
