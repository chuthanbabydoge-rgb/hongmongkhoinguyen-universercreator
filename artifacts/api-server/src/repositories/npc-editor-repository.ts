import { db } from "@workspace/db";
import {
  creatorNpcs,
  creatorNpcProfiles,
  creatorNpcAttributes,
  creatorNpcStats,
  creatorNpcSkills,
  creatorNpcInventory,
  creatorNpcEquipment,
  creatorNpcBehaviors,
  creatorNpcBehaviorTrees,
  creatorNpcDialogues,
  creatorNpcDialogueNodes,
  creatorNpcDialogueChoices,
  creatorNpcSpawnPoints,
  creatorNpcPatrolPaths,
  creatorNpcRelations,
  creatorNpcFactions,
  creatorNpcSchedules,
  creatorNpcVersions,
  creatorNpcHistory,
  creatorNpcTemplates,
  type CreatorNpc,
  type InsertCreatorNpc,
  type CreatorNpcProfile,
  type InsertCreatorNpcProfile,
  type CreatorNpcAttributes,
  type InsertCreatorNpcAttributes,
  type CreatorNpcStats,
  type InsertCreatorNpcStats,
  type CreatorNpcSkill,
  type InsertCreatorNpcSkill,
  type CreatorNpcInventoryItem,
  type InsertCreatorNpcInventoryItem,
  type CreatorNpcEquipmentSlot,
  type InsertCreatorNpcEquipmentSlot,
  type CreatorNpcBehavior,
  type InsertCreatorNpcBehavior,
  type CreatorNpcBehaviorTree,
  type InsertCreatorNpcBehaviorTree,
  type CreatorNpcDialogue,
  type InsertCreatorNpcDialogue,
  type CreatorNpcDialogueNode,
  type InsertCreatorNpcDialogueNode,
  type CreatorNpcDialogueChoice,
  type InsertCreatorNpcDialogueChoice,
  type CreatorNpcSpawnPoint,
  type InsertCreatorNpcSpawnPoint,
  type CreatorNpcPatrolPath,
  type InsertCreatorNpcPatrolPath,
  type CreatorNpcRelation,
  type InsertCreatorNpcRelation,
  type CreatorNpcFaction,
  type InsertCreatorNpcFaction,
  type CreatorNpcSchedule,
  type InsertCreatorNpcSchedule,
  type CreatorNpcVersion,
  type InsertCreatorNpcVersion,
  type CreatorNpcHistoryRow,
  type InsertCreatorNpcHistory,
  type CreatorNpcTemplate,
  type InsertCreatorNpcTemplate,
} from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export class DrizzleNpcEditorRepository {
  // ─── NPCs ─────────────────────────────────────────────────────────────────

  async createNpc(data: InsertCreatorNpc): Promise<CreatorNpc> {
    const [row] = await db.insert(creatorNpcs).values(data).returning();
    return row!;
  }

  async findNpcById(id: number, userId: number): Promise<CreatorNpc | null> {
    const [row] = await db
      .select()
      .from(creatorNpcs)
      .where(and(eq(creatorNpcs.id, id), eq(creatorNpcs.userId, userId)));
    return row ?? null;
  }

  async findNpcByUuid(uuid: string): Promise<CreatorNpc | null> {
    const [row] = await db.select().from(creatorNpcs).where(eq(creatorNpcs.uuid, uuid));
    return row ?? null;
  }

  async listNpcs(userId: number, limit = 20, offset = 0): Promise<CreatorNpc[]> {
    return db
      .select()
      .from(creatorNpcs)
      .where(eq(creatorNpcs.userId, userId))
      .orderBy(desc(creatorNpcs.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async listNpcsByProject(projectId: number, userId: number): Promise<CreatorNpc[]> {
    return db
      .select()
      .from(creatorNpcs)
      .where(and(eq(creatorNpcs.projectId, projectId), eq(creatorNpcs.userId, userId)))
      .orderBy(desc(creatorNpcs.updatedAt));
  }

  async updateNpc(id: number, userId: number, data: Partial<InsertCreatorNpc>): Promise<CreatorNpc | null> {
    const [row] = await db
      .update(creatorNpcs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcs.id, id), eq(creatorNpcs.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteNpc(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(creatorNpcs)
      .where(and(eq(creatorNpcs.id, id), eq(creatorNpcs.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Profiles ─────────────────────────────────────────────────────────────

  async getProfile(npcId: number): Promise<CreatorNpcProfile | null> {
    const [row] = await db.select().from(creatorNpcProfiles).where(eq(creatorNpcProfiles.npcId, npcId));
    return row ?? null;
  }

  async upsertProfile(npcId: number, data: Partial<InsertCreatorNpcProfile>): Promise<CreatorNpcProfile> {
    const existing = await this.getProfile(npcId);
    if (existing) {
      const [row] = await db
        .update(creatorNpcProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcProfiles.npcId, npcId))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcProfiles).values({ npcId, ...data }).returning();
    return row!;
  }

  // ─── Attributes ───────────────────────────────────────────────────────────

  async getAttributes(npcId: number): Promise<CreatorNpcAttributes | null> {
    const [row] = await db.select().from(creatorNpcAttributes).where(eq(creatorNpcAttributes.npcId, npcId));
    return row ?? null;
  }

  async upsertAttributes(npcId: number, data: Partial<InsertCreatorNpcAttributes>): Promise<CreatorNpcAttributes> {
    const existing = await this.getAttributes(npcId);
    if (existing) {
      const [row] = await db
        .update(creatorNpcAttributes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcAttributes.npcId, npcId))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcAttributes).values({ npcId, ...data }).returning();
    return row!;
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  async getStats(npcId: number): Promise<CreatorNpcStats | null> {
    const [row] = await db.select().from(creatorNpcStats).where(eq(creatorNpcStats.npcId, npcId));
    return row ?? null;
  }

  async upsertStats(npcId: number, data: Partial<InsertCreatorNpcStats>): Promise<CreatorNpcStats> {
    const existing = await this.getStats(npcId);
    if (existing) {
      const [row] = await db
        .update(creatorNpcStats)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcStats.npcId, npcId))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcStats).values({ npcId, ...data }).returning();
    return row!;
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  async listSkills(npcId: number): Promise<CreatorNpcSkill[]> {
    return db.select().from(creatorNpcSkills).where(eq(creatorNpcSkills.npcId, npcId)).orderBy(asc(creatorNpcSkills.id));
  }

  async createSkill(data: InsertCreatorNpcSkill): Promise<CreatorNpcSkill> {
    const [row] = await db.insert(creatorNpcSkills).values(data).returning();
    return row!;
  }

  async updateSkill(id: number, npcId: number, data: Partial<InsertCreatorNpcSkill>): Promise<CreatorNpcSkill | null> {
    const [row] = await db
      .update(creatorNpcSkills)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcSkills.id, id), eq(creatorNpcSkills.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteSkill(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcSkills).where(and(eq(creatorNpcSkills.id, id), eq(creatorNpcSkills.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Inventory ────────────────────────────────────────────────────────────

  async listInventory(npcId: number): Promise<CreatorNpcInventoryItem[]> {
    return db.select().from(creatorNpcInventory).where(eq(creatorNpcInventory.npcId, npcId)).orderBy(asc(creatorNpcInventory.slotIndex));
  }

  async createInventoryItem(data: InsertCreatorNpcInventoryItem): Promise<CreatorNpcInventoryItem> {
    const [row] = await db.insert(creatorNpcInventory).values(data).returning();
    return row!;
  }

  async updateInventoryItem(id: number, npcId: number, data: Partial<InsertCreatorNpcInventoryItem>): Promise<CreatorNpcInventoryItem | null> {
    const [row] = await db
      .update(creatorNpcInventory)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcInventory.id, id), eq(creatorNpcInventory.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteInventoryItem(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcInventory).where(and(eq(creatorNpcInventory.id, id), eq(creatorNpcInventory.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Equipment ────────────────────────────────────────────────────────────

  async listEquipment(npcId: number): Promise<CreatorNpcEquipmentSlot[]> {
    return db.select().from(creatorNpcEquipment).where(eq(creatorNpcEquipment.npcId, npcId)).orderBy(asc(creatorNpcEquipment.slot));
  }

  async upsertEquipmentSlot(npcId: number, slot: string, data: Partial<InsertCreatorNpcEquipmentSlot>): Promise<CreatorNpcEquipmentSlot> {
    const [existing] = await db
      .select()
      .from(creatorNpcEquipment)
      .where(and(eq(creatorNpcEquipment.npcId, npcId), eq(creatorNpcEquipment.slot, slot)));
    if (existing) {
      const [row] = await db
        .update(creatorNpcEquipment)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcEquipment.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcEquipment).values({ npcId, slot, ...data }).returning();
    return row!;
  }

  async deleteEquipmentSlot(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcEquipment).where(and(eq(creatorNpcEquipment.id, id), eq(creatorNpcEquipment.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Behaviors ────────────────────────────────────────────────────────────

  async listBehaviors(npcId: number): Promise<CreatorNpcBehavior[]> {
    return db.select().from(creatorNpcBehaviors).where(eq(creatorNpcBehaviors.npcId, npcId)).orderBy(desc(creatorNpcBehaviors.priority));
  }

  async createBehavior(data: InsertCreatorNpcBehavior): Promise<CreatorNpcBehavior> {
    const [row] = await db.insert(creatorNpcBehaviors).values(data).returning();
    return row!;
  }

  async updateBehavior(id: number, npcId: number, data: Partial<InsertCreatorNpcBehavior>): Promise<CreatorNpcBehavior | null> {
    const [row] = await db
      .update(creatorNpcBehaviors)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcBehaviors.id, id), eq(creatorNpcBehaviors.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteBehavior(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcBehaviors).where(and(eq(creatorNpcBehaviors.id, id), eq(creatorNpcBehaviors.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Behavior Trees ───────────────────────────────────────────────────────

  async getBehaviorTree(npcId: number): Promise<CreatorNpcBehaviorTree | null> {
    const [row] = await db.select().from(creatorNpcBehaviorTrees).where(and(eq(creatorNpcBehaviorTrees.npcId, npcId), eq(creatorNpcBehaviorTrees.isActive, true)));
    return row ?? null;
  }

  async upsertBehaviorTree(npcId: number, data: Partial<InsertCreatorNpcBehaviorTree>): Promise<CreatorNpcBehaviorTree> {
    const existing = await this.getBehaviorTree(npcId);
    if (existing) {
      const [row] = await db
        .update(creatorNpcBehaviorTrees)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcBehaviorTrees.id, existing.id))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcBehaviorTrees).values({ npcId, isActive: true, ...data }).returning();
    return row!;
  }

  // ─── Dialogues ────────────────────────────────────────────────────────────

  async listDialogues(npcId: number): Promise<CreatorNpcDialogue[]> {
    return db.select().from(creatorNpcDialogues).where(eq(creatorNpcDialogues.npcId, npcId)).orderBy(desc(creatorNpcDialogues.priority));
  }

  async createDialogue(data: InsertCreatorNpcDialogue): Promise<CreatorNpcDialogue> {
    const [row] = await db.insert(creatorNpcDialogues).values(data).returning();
    return row!;
  }

  async updateDialogue(id: number, npcId: number, data: Partial<InsertCreatorNpcDialogue>): Promise<CreatorNpcDialogue | null> {
    const [row] = await db
      .update(creatorNpcDialogues)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcDialogues.id, id), eq(creatorNpcDialogues.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteDialogue(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcDialogues).where(and(eq(creatorNpcDialogues.id, id), eq(creatorNpcDialogues.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Dialogue Nodes ───────────────────────────────────────────────────────

  async listDialogueNodes(dialogueId: number): Promise<CreatorNpcDialogueNode[]> {
    return db.select().from(creatorNpcDialogueNodes).where(eq(creatorNpcDialogueNodes.dialogueId, dialogueId)).orderBy(asc(creatorNpcDialogueNodes.id));
  }

  async createDialogueNode(data: InsertCreatorNpcDialogueNode): Promise<CreatorNpcDialogueNode> {
    const [row] = await db.insert(creatorNpcDialogueNodes).values(data).returning();
    return row!;
  }

  async updateDialogueNode(id: number, data: Partial<InsertCreatorNpcDialogueNode>): Promise<CreatorNpcDialogueNode | null> {
    const [row] = await db
      .update(creatorNpcDialogueNodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorNpcDialogueNodes.id, id))
      .returning();
    return row ?? null;
  }

  async deleteDialogueNode(id: number): Promise<boolean> {
    const result = await db.delete(creatorNpcDialogueNodes).where(eq(creatorNpcDialogueNodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Dialogue Choices ─────────────────────────────────────────────────────

  async listDialogueChoices(nodeId: number): Promise<CreatorNpcDialogueChoice[]> {
    return db.select().from(creatorNpcDialogueChoices).where(eq(creatorNpcDialogueChoices.nodeId, nodeId)).orderBy(asc(creatorNpcDialogueChoices.order));
  }

  async createDialogueChoice(data: InsertCreatorNpcDialogueChoice): Promise<CreatorNpcDialogueChoice> {
    const [row] = await db.insert(creatorNpcDialogueChoices).values(data).returning();
    return row!;
  }

  async updateDialogueChoice(id: number, data: Partial<InsertCreatorNpcDialogueChoice>): Promise<CreatorNpcDialogueChoice | null> {
    const [row] = await db
      .update(creatorNpcDialogueChoices)
      .set(data)
      .where(eq(creatorNpcDialogueChoices.id, id))
      .returning();
    return row ?? null;
  }

  async deleteDialogueChoice(id: number): Promise<boolean> {
    const result = await db.delete(creatorNpcDialogueChoices).where(eq(creatorNpcDialogueChoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Spawn Points ─────────────────────────────────────────────────────────

  async listSpawnPoints(npcId: number): Promise<CreatorNpcSpawnPoint[]> {
    return db.select().from(creatorNpcSpawnPoints).where(eq(creatorNpcSpawnPoints.npcId, npcId)).orderBy(asc(creatorNpcSpawnPoints.id));
  }

  async createSpawnPoint(data: InsertCreatorNpcSpawnPoint): Promise<CreatorNpcSpawnPoint> {
    const [row] = await db.insert(creatorNpcSpawnPoints).values(data).returning();
    return row!;
  }

  async updateSpawnPoint(id: number, npcId: number, data: Partial<InsertCreatorNpcSpawnPoint>): Promise<CreatorNpcSpawnPoint | null> {
    const [row] = await db
      .update(creatorNpcSpawnPoints)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcSpawnPoints.id, id), eq(creatorNpcSpawnPoints.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteSpawnPoint(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcSpawnPoints).where(and(eq(creatorNpcSpawnPoints.id, id), eq(creatorNpcSpawnPoints.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Patrol Paths ─────────────────────────────────────────────────────────

  async listPatrolPaths(npcId: number): Promise<CreatorNpcPatrolPath[]> {
    return db.select().from(creatorNpcPatrolPaths).where(eq(creatorNpcPatrolPaths.npcId, npcId)).orderBy(asc(creatorNpcPatrolPaths.id));
  }

  async createPatrolPath(data: InsertCreatorNpcPatrolPath): Promise<CreatorNpcPatrolPath> {
    const [row] = await db.insert(creatorNpcPatrolPaths).values(data).returning();
    return row!;
  }

  async updatePatrolPath(id: number, npcId: number, data: Partial<InsertCreatorNpcPatrolPath>): Promise<CreatorNpcPatrolPath | null> {
    const [row] = await db
      .update(creatorNpcPatrolPaths)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcPatrolPaths.id, id), eq(creatorNpcPatrolPaths.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deletePatrolPath(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcPatrolPaths).where(and(eq(creatorNpcPatrolPaths.id, id), eq(creatorNpcPatrolPaths.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Relations ────────────────────────────────────────────────────────────

  async listRelations(npcId: number): Promise<CreatorNpcRelation[]> {
    return db.select().from(creatorNpcRelations).where(eq(creatorNpcRelations.npcId, npcId)).orderBy(asc(creatorNpcRelations.id));
  }

  async createRelation(data: InsertCreatorNpcRelation): Promise<CreatorNpcRelation> {
    const [row] = await db.insert(creatorNpcRelations).values(data).returning();
    return row!;
  }

  async updateRelation(id: number, npcId: number, data: Partial<InsertCreatorNpcRelation>): Promise<CreatorNpcRelation | null> {
    const [row] = await db
      .update(creatorNpcRelations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcRelations.id, id), eq(creatorNpcRelations.npcId, npcId)))
      .returning();
    return row ?? null;
  }

  async deleteRelation(id: number, npcId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcRelations).where(and(eq(creatorNpcRelations.id, id), eq(creatorNpcRelations.npcId, npcId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Factions ─────────────────────────────────────────────────────────────

  async listFactions(userId: number): Promise<CreatorNpcFaction[]> {
    return db.select().from(creatorNpcFactions).where(eq(creatorNpcFactions.userId, userId)).orderBy(asc(creatorNpcFactions.name));
  }

  async getFactionById(id: number): Promise<CreatorNpcFaction | null> {
    const [row] = await db.select().from(creatorNpcFactions).where(eq(creatorNpcFactions.id, id));
    return row ?? null;
  }

  async createFaction(data: InsertCreatorNpcFaction): Promise<CreatorNpcFaction> {
    const [row] = await db.insert(creatorNpcFactions).values(data).returning();
    return row!;
  }

  async updateFaction(id: number, userId: number, data: Partial<InsertCreatorNpcFaction>): Promise<CreatorNpcFaction | null> {
    const [row] = await db
      .update(creatorNpcFactions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorNpcFactions.id, id), eq(creatorNpcFactions.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteFaction(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(creatorNpcFactions).where(and(eq(creatorNpcFactions.id, id), eq(creatorNpcFactions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Schedules ────────────────────────────────────────────────────────────

  async getSchedule(npcId: number): Promise<CreatorNpcSchedule | null> {
    const [row] = await db.select().from(creatorNpcSchedules).where(eq(creatorNpcSchedules.npcId, npcId));
    return row ?? null;
  }

  async upsertSchedule(npcId: number, data: Partial<InsertCreatorNpcSchedule>): Promise<CreatorNpcSchedule> {
    const existing = await this.getSchedule(npcId);
    if (existing) {
      const [row] = await db
        .update(creatorNpcSchedules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(creatorNpcSchedules.npcId, npcId))
        .returning();
      return row!;
    }
    const [row] = await db.insert(creatorNpcSchedules).values({ npcId, ...data }).returning();
    return row!;
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async createVersion(data: InsertCreatorNpcVersion): Promise<CreatorNpcVersion> {
    const [row] = await db.insert(creatorNpcVersions).values(data).returning();
    return row!;
  }

  async listVersions(npcId: number): Promise<CreatorNpcVersion[]> {
    return db.select().from(creatorNpcVersions).where(eq(creatorNpcVersions.npcId, npcId)).orderBy(desc(creatorNpcVersions.version));
  }

  async getVersion(id: number, npcId: number): Promise<CreatorNpcVersion | null> {
    const [row] = await db
      .select()
      .from(creatorNpcVersions)
      .where(and(eq(creatorNpcVersions.id, id), eq(creatorNpcVersions.npcId, npcId)));
    return row ?? null;
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async recordHistory(data: InsertCreatorNpcHistory): Promise<CreatorNpcHistoryRow> {
    const [row] = await db.insert(creatorNpcHistory).values(data).returning();
    return row!;
  }

  async listHistory(npcId: number, limit = 50): Promise<CreatorNpcHistoryRow[]> {
    return db
      .select()
      .from(creatorNpcHistory)
      .where(eq(creatorNpcHistory.npcId, npcId))
      .orderBy(desc(creatorNpcHistory.createdAt))
      .limit(limit);
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(limit = 20, offset = 0): Promise<CreatorNpcTemplate[]> {
    return db.select().from(creatorNpcTemplates).orderBy(desc(creatorNpcTemplates.useCount)).limit(limit).offset(offset);
  }

  async createTemplate(data: InsertCreatorNpcTemplate): Promise<CreatorNpcTemplate> {
    const [row] = await db.insert(creatorNpcTemplates).values(data).returning();
    return row!;
  }

  async getTemplateById(id: number): Promise<CreatorNpcTemplate | null> {
    const [row] = await db.select().from(creatorNpcTemplates).where(eq(creatorNpcTemplates.id, id));
    return row ?? null;
  }

  async incrementTemplateUseCount(id: number): Promise<void> {
    await db
      .update(creatorNpcTemplates)
      .set({ useCount: sql<number>`use_count + 1`, updatedAt: new Date() })
      .where(eq(creatorNpcTemplates.id, id));
  }

  // ─── Statistics (computed) ────────────────────────────────────────────────

  async computeStatistics(npcId: number): Promise<Record<string, number>> {
    const [skillCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcSkills).where(eq(creatorNpcSkills.npcId, npcId));
    const [inventoryCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcInventory).where(eq(creatorNpcInventory.npcId, npcId));
    const [behaviorCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcBehaviors).where(eq(creatorNpcBehaviors.npcId, npcId));
    const [dialogueCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcDialogues).where(eq(creatorNpcDialogues.npcId, npcId));
    const [spawnCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcSpawnPoints).where(eq(creatorNpcSpawnPoints.npcId, npcId));
    const [patrolCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcPatrolPaths).where(eq(creatorNpcPatrolPaths.npcId, npcId));
    const [relationCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcRelations).where(eq(creatorNpcRelations.npcId, npcId));
    const [versionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorNpcVersions).where(eq(creatorNpcVersions.npcId, npcId));
    return {
      skillCount: skillCount?.count ?? 0,
      inventoryCount: inventoryCount?.count ?? 0,
      behaviorCount: behaviorCount?.count ?? 0,
      dialogueCount: dialogueCount?.count ?? 0,
      spawnCount: spawnCount?.count ?? 0,
      patrolCount: patrolCount?.count ?? 0,
      relationCount: relationCount?.count ?? 0,
      versionCount: versionCount?.count ?? 0,
    };
  }
}
