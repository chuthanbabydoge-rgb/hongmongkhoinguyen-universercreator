import { db } from "@workspace/db";
import {
  creatorQuests,
  creatorQuestSteps,
  creatorQuestObjectives,
  creatorQuestConditions,
  creatorQuestRewards,
  creatorQuestDialogues,
  creatorQuestNpcs,
  creatorQuestRegions,
  creatorQuestEvents,
  creatorQuestScripts,
  creatorQuestVariables,
  creatorQuestFlags,
  creatorQuestBranches,
  creatorQuestCheckpoints,
  creatorQuestHistory,
  creatorQuestVersions,
  creatorQuestTemplates,
  creatorQuestStatistics,
  creatorQuestExports,
  creatorQuestImports,
  type CreatorQuest,
  type InsertCreatorQuest,
  type CreatorQuestStep,
  type InsertCreatorQuestStep,
  type CreatorQuestObjective,
  type InsertCreatorQuestObjective,
  type CreatorQuestCondition,
  type InsertCreatorQuestCondition,
  type CreatorQuestReward,
  type InsertCreatorQuestReward,
  type CreatorQuestDialogue,
  type InsertCreatorQuestDialogue,
  type CreatorQuestNpc,
  type InsertCreatorQuestNpc,
  type CreatorQuestRegion,
  type InsertCreatorQuestRegion,
  type CreatorQuestEvent,
  type InsertCreatorQuestEvent,
  type CreatorQuestScript,
  type InsertCreatorQuestScript,
  type CreatorQuestVariable,
  type InsertCreatorQuestVariable,
  type CreatorQuestFlag,
  type InsertCreatorQuestFlag,
  type CreatorQuestBranch,
  type InsertCreatorQuestBranch,
  type CreatorQuestCheckpoint,
  type InsertCreatorQuestCheckpoint,
  type CreatorQuestHistoryRow,
  type InsertCreatorQuestHistory,
  type CreatorQuestVersion,
  type InsertCreatorQuestVersion,
  type CreatorQuestTemplate,
  type InsertCreatorQuestTemplate,
  type CreatorQuestStatistics,
  type InsertCreatorQuestStatistics,
  type CreatorQuestExport,
  type InsertCreatorQuestExport,
  type CreatorQuestImport,
  type InsertCreatorQuestImport,
} from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export class DrizzleQuestEditorRepository {
  // ─── Quests ───────────────────────────────────────────────────────────────

  async createQuest(data: InsertCreatorQuest): Promise<CreatorQuest> {
    const [row] = await db.insert(creatorQuests).values(data).returning();
    return row!;
  }

  async findQuestById(id: number, userId: number): Promise<CreatorQuest | null> {
    const [row] = await db.select().from(creatorQuests)
      .where(and(eq(creatorQuests.id, id), eq(creatorQuests.userId, userId)));
    return row ?? null;
  }

  async findQuestByUuid(uuid: string): Promise<CreatorQuest | null> {
    const [row] = await db.select().from(creatorQuests).where(eq(creatorQuests.uuid, uuid));
    return row ?? null;
  }

  async listQuests(userId: number, limit = 20, offset = 0): Promise<CreatorQuest[]> {
    return db.select().from(creatorQuests)
      .where(eq(creatorQuests.userId, userId))
      .orderBy(desc(creatorQuests.updatedAt))
      .limit(limit).offset(offset);
  }

  async listQuestsByProject(projectId: number, userId: number): Promise<CreatorQuest[]> {
    return db.select().from(creatorQuests)
      .where(and(eq(creatorQuests.projectId, projectId), eq(creatorQuests.userId, userId)))
      .orderBy(desc(creatorQuests.updatedAt));
  }

  async updateQuest(id: number, userId: number, data: Partial<InsertCreatorQuest>): Promise<CreatorQuest | null> {
    const [row] = await db.update(creatorQuests)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorQuests.id, id), eq(creatorQuests.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteQuest(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(creatorQuests)
      .where(and(eq(creatorQuests.id, id), eq(creatorQuests.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async countQuests(userId: number): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(creatorQuests)
      .where(eq(creatorQuests.userId, userId));
    return Number(row?.count ?? 0);
  }

  // ─── Steps ────────────────────────────────────────────────────────────────

  async createStep(data: InsertCreatorQuestStep): Promise<CreatorQuestStep> {
    const [row] = await db.insert(creatorQuestSteps).values(data).returning();
    return row!;
  }

  async listSteps(questId: number): Promise<CreatorQuestStep[]> {
    return db.select().from(creatorQuestSteps)
      .where(eq(creatorQuestSteps.questId, questId))
      .orderBy(asc(creatorQuestSteps.order));
  }

  async updateStep(id: number, data: Partial<InsertCreatorQuestStep>): Promise<CreatorQuestStep | null> {
    const [row] = await db.update(creatorQuestSteps).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestSteps.id, id)).returning();
    return row ?? null;
  }

  async deleteStep(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestSteps).where(eq(creatorQuestSteps.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Objectives ───────────────────────────────────────────────────────────

  async createObjective(data: InsertCreatorQuestObjective): Promise<CreatorQuestObjective> {
    const [row] = await db.insert(creatorQuestObjectives).values(data).returning();
    return row!;
  }

  async listObjectives(questId: number): Promise<CreatorQuestObjective[]> {
    return db.select().from(creatorQuestObjectives)
      .where(eq(creatorQuestObjectives.questId, questId))
      .orderBy(asc(creatorQuestObjectives.order));
  }

  async updateObjective(id: number, data: Partial<InsertCreatorQuestObjective>): Promise<CreatorQuestObjective | null> {
    const [row] = await db.update(creatorQuestObjectives).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestObjectives.id, id)).returning();
    return row ?? null;
  }

  async deleteObjective(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestObjectives).where(eq(creatorQuestObjectives.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Conditions ───────────────────────────────────────────────────────────

  async createCondition(data: InsertCreatorQuestCondition): Promise<CreatorQuestCondition> {
    const [row] = await db.insert(creatorQuestConditions).values(data).returning();
    return row!;
  }

  async listConditions(questId: number): Promise<CreatorQuestCondition[]> {
    return db.select().from(creatorQuestConditions)
      .where(eq(creatorQuestConditions.questId, questId));
  }

  async updateCondition(id: number, data: Partial<InsertCreatorQuestCondition>): Promise<CreatorQuestCondition | null> {
    const [row] = await db.update(creatorQuestConditions).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestConditions.id, id)).returning();
    return row ?? null;
  }

  async deleteCondition(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestConditions).where(eq(creatorQuestConditions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Rewards ──────────────────────────────────────────────────────────────

  async createReward(data: InsertCreatorQuestReward): Promise<CreatorQuestReward> {
    const [row] = await db.insert(creatorQuestRewards).values(data).returning();
    return row!;
  }

  async listRewards(questId: number): Promise<CreatorQuestReward[]> {
    return db.select().from(creatorQuestRewards)
      .where(eq(creatorQuestRewards.questId, questId));
  }

  async updateReward(id: number, data: Partial<InsertCreatorQuestReward>): Promise<CreatorQuestReward | null> {
    const [row] = await db.update(creatorQuestRewards).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestRewards.id, id)).returning();
    return row ?? null;
  }

  async deleteReward(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestRewards).where(eq(creatorQuestRewards.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Dialogues ────────────────────────────────────────────────────────────

  async createDialogue(data: InsertCreatorQuestDialogue): Promise<CreatorQuestDialogue> {
    const [row] = await db.insert(creatorQuestDialogues).values(data).returning();
    return row!;
  }

  async listDialogues(questId: number): Promise<CreatorQuestDialogue[]> {
    return db.select().from(creatorQuestDialogues)
      .where(eq(creatorQuestDialogues.questId, questId))
      .orderBy(asc(creatorQuestDialogues.order));
  }

  async updateDialogue(id: number, data: Partial<InsertCreatorQuestDialogue>): Promise<CreatorQuestDialogue | null> {
    const [row] = await db.update(creatorQuestDialogues).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestDialogues.id, id)).returning();
    return row ?? null;
  }

  async deleteDialogue(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestDialogues).where(eq(creatorQuestDialogues.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── NPCs ─────────────────────────────────────────────────────────────────

  async createNpc(data: InsertCreatorQuestNpc): Promise<CreatorQuestNpc> {
    const [row] = await db.insert(creatorQuestNpcs).values(data).returning();
    return row!;
  }

  async listNpcs(questId: number): Promise<CreatorQuestNpc[]> {
    return db.select().from(creatorQuestNpcs).where(eq(creatorQuestNpcs.questId, questId));
  }

  async deleteNpc(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestNpcs).where(eq(creatorQuestNpcs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Regions ──────────────────────────────────────────────────────────────

  async createRegion(data: InsertCreatorQuestRegion): Promise<CreatorQuestRegion> {
    const [row] = await db.insert(creatorQuestRegions).values(data).returning();
    return row!;
  }

  async listRegions(questId: number): Promise<CreatorQuestRegion[]> {
    return db.select().from(creatorQuestRegions).where(eq(creatorQuestRegions.questId, questId));
  }

  async deleteRegion(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestRegions).where(eq(creatorQuestRegions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  async createEvent(data: InsertCreatorQuestEvent): Promise<CreatorQuestEvent> {
    const [row] = await db.insert(creatorQuestEvents).values(data).returning();
    return row!;
  }

  async listEvents(questId: number): Promise<CreatorQuestEvent[]> {
    return db.select().from(creatorQuestEvents)
      .where(eq(creatorQuestEvents.questId, questId))
      .orderBy(asc(creatorQuestEvents.order));
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestEvents).where(eq(creatorQuestEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Scripts ──────────────────────────────────────────────────────────────

  async createScript(data: InsertCreatorQuestScript): Promise<CreatorQuestScript> {
    const [row] = await db.insert(creatorQuestScripts).values(data).returning();
    return row!;
  }

  async listScripts(questId: number): Promise<CreatorQuestScript[]> {
    return db.select().from(creatorQuestScripts).where(eq(creatorQuestScripts.questId, questId));
  }

  async deleteScript(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestScripts).where(eq(creatorQuestScripts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Variables ────────────────────────────────────────────────────────────

  async createVariable(data: InsertCreatorQuestVariable): Promise<CreatorQuestVariable> {
    const [row] = await db.insert(creatorQuestVariables).values(data).returning();
    return row!;
  }

  async listVariables(questId: number): Promise<CreatorQuestVariable[]> {
    return db.select().from(creatorQuestVariables).where(eq(creatorQuestVariables.questId, questId));
  }

  async deleteVariable(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestVariables).where(eq(creatorQuestVariables.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Flags ────────────────────────────────────────────────────────────────

  async createFlag(data: InsertCreatorQuestFlag): Promise<CreatorQuestFlag> {
    const [row] = await db.insert(creatorQuestFlags).values(data).returning();
    return row!;
  }

  async listFlags(questId: number): Promise<CreatorQuestFlag[]> {
    return db.select().from(creatorQuestFlags).where(eq(creatorQuestFlags.questId, questId));
  }

  async deleteFlag(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestFlags).where(eq(creatorQuestFlags.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Branches ─────────────────────────────────────────────────────────────

  async createBranch(data: InsertCreatorQuestBranch): Promise<CreatorQuestBranch> {
    const [row] = await db.insert(creatorQuestBranches).values(data).returning();
    return row!;
  }

  async listBranches(questId: number): Promise<CreatorQuestBranch[]> {
    return db.select().from(creatorQuestBranches)
      .where(eq(creatorQuestBranches.questId, questId))
      .orderBy(asc(creatorQuestBranches.order));
  }

  async updateBranch(id: number, data: Partial<InsertCreatorQuestBranch>): Promise<CreatorQuestBranch | null> {
    const [row] = await db.update(creatorQuestBranches).set({ ...data, updatedAt: new Date() })
      .where(eq(creatorQuestBranches.id, id)).returning();
    return row ?? null;
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestBranches).where(eq(creatorQuestBranches.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Checkpoints ──────────────────────────────────────────────────────────

  async createCheckpoint(data: InsertCreatorQuestCheckpoint): Promise<CreatorQuestCheckpoint> {
    const [row] = await db.insert(creatorQuestCheckpoints).values(data).returning();
    return row!;
  }

  async listCheckpoints(questId: number): Promise<CreatorQuestCheckpoint[]> {
    return db.select().from(creatorQuestCheckpoints)
      .where(eq(creatorQuestCheckpoints.questId, questId))
      .orderBy(asc(creatorQuestCheckpoints.order));
  }

  async deleteCheckpoint(id: number): Promise<boolean> {
    const result = await db.delete(creatorQuestCheckpoints).where(eq(creatorQuestCheckpoints.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async recordHistory(data: InsertCreatorQuestHistory): Promise<CreatorQuestHistoryRow> {
    const [row] = await db.insert(creatorQuestHistory).values(data).returning();
    return row!;
  }

  async listHistory(questId: number, limit = 50): Promise<CreatorQuestHistoryRow[]> {
    return db.select().from(creatorQuestHistory)
      .where(eq(creatorQuestHistory.questId, questId))
      .orderBy(desc(creatorQuestHistory.createdAt)).limit(limit);
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async createVersion(data: InsertCreatorQuestVersion): Promise<CreatorQuestVersion> {
    const [row] = await db.insert(creatorQuestVersions).values(data).returning();
    return row!;
  }

  async listVersions(questId: number): Promise<CreatorQuestVersion[]> {
    return db.select().from(creatorQuestVersions)
      .where(eq(creatorQuestVersions.questId, questId))
      .orderBy(desc(creatorQuestVersions.version));
  }

  async findVersion(id: number): Promise<CreatorQuestVersion | null> {
    const [row] = await db.select().from(creatorQuestVersions).where(eq(creatorQuestVersions.id, id));
    return row ?? null;
  }

  async getNextVersion(questId: number): Promise<number> {
    const [row] = await db.select({ max: sql<number>`coalesce(max(version), 0)` })
      .from(creatorQuestVersions).where(eq(creatorQuestVersions.questId, questId));
    return (Number(row?.max ?? 0)) + 1;
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(limit = 20, offset = 0): Promise<CreatorQuestTemplate[]> {
    return db.select().from(creatorQuestTemplates)
      .orderBy(desc(creatorQuestTemplates.updatedAt)).limit(limit).offset(offset);
  }

  async findTemplate(id: number): Promise<CreatorQuestTemplate | null> {
    const [row] = await db.select().from(creatorQuestTemplates).where(eq(creatorQuestTemplates.id, id));
    return row ?? null;
  }

  async createTemplate(data: InsertCreatorQuestTemplate): Promise<CreatorQuestTemplate> {
    const [row] = await db.insert(creatorQuestTemplates).values(data).returning();
    return row!;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async upsertStatistics(questId: number, data: Partial<InsertCreatorQuestStatistics>): Promise<CreatorQuestStatistics> {
    const [row] = await db.insert(creatorQuestStatistics)
      .values({ questId, ...data })
      .onConflictDoUpdate({ target: creatorQuestStatistics.questId, set: { ...data, updatedAt: new Date() } })
      .returning();
    return row!;
  }

  async findStatistics(questId: number): Promise<CreatorQuestStatistics | null> {
    const [row] = await db.select().from(creatorQuestStatistics)
      .where(eq(creatorQuestStatistics.questId, questId));
    return row ?? null;
  }

  // ─── Export / Import ──────────────────────────────────────────────────────

  async createExport(data: InsertCreatorQuestExport): Promise<CreatorQuestExport> {
    const [row] = await db.insert(creatorQuestExports).values(data).returning();
    return row!;
  }

  async createImport(data: InsertCreatorQuestImport): Promise<CreatorQuestImport> {
    const [row] = await db.insert(creatorQuestImports).values(data).returning();
    return row!;
  }

  async updateImport(id: number, data: Partial<InsertCreatorQuestImport>): Promise<CreatorQuestImport | null> {
    const [row] = await db.update(creatorQuestImports).set(data)
      .where(eq(creatorQuestImports.id, id)).returning();
    return row ?? null;
  }
}
