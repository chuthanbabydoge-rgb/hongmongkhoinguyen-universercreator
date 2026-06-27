import { DrizzleNpcEditorRepository } from "../repositories/npc-editor-repository";
import { NpcSerializer } from "./npc-serializer";
import { NpcValidator } from "./npc-validator";
import { NpcExporter } from "./npc-exporter";
import { NpcImporter } from "./npc-importer";
import { NpcRuntimeBridge } from "./npc-runtime-bridge";
import type {
  CreatorNpc,
  InsertCreatorNpc,
  CreatorNpcSkill,
  InsertCreatorNpcSkill,
  CreatorNpcBehavior,
  InsertCreatorNpcBehavior,
  CreatorNpcDialogue,
  InsertCreatorNpcDialogue,
  CreatorNpcDialogueNode,
  InsertCreatorNpcDialogueNode,
  CreatorNpcSpawnPoint,
  InsertCreatorNpcSpawnPoint,
  CreatorNpcPatrolPath,
  InsertCreatorNpcPatrolPath,
  CreatorNpcRelation,
  InsertCreatorNpcRelation,
  CreatorNpcFaction,
  InsertCreatorNpcFaction,
} from "@workspace/db";

export class NpcEditorService {
  private repo: DrizzleNpcEditorRepository;
  readonly serializer: NpcSerializer;
  readonly validator: NpcValidator;
  readonly exporter: NpcExporter;
  readonly importer: NpcImporter;
  readonly runtimeBridge: NpcRuntimeBridge;

  constructor() {
    this.repo = new DrizzleNpcEditorRepository();
    this.serializer = new NpcSerializer(this.repo);
    this.validator = new NpcValidator(this.repo);
    this.exporter = new NpcExporter(this.repo);
    this.importer = new NpcImporter(this.repo);
    this.runtimeBridge = new NpcRuntimeBridge(this.repo);
  }

  // ─── NPC CRUD ─────────────────────────────────────────────────────────────

  async createNpc(
    userId: number,
    data: { name: string; projectId?: number; npcType?: string; description?: string; tags?: string[] }
  ): Promise<CreatorNpc> {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const npc = await this.repo.createNpc({
      userId,
      projectId: data.projectId ?? null,
      name: data.name,
      slug,
      description: data.description ?? null,
      npcType: (data.npcType as "humanoid") ?? "humanoid",
      state: "idle",
      behavior: "neutral",
      level: 1,
      tags: data.tags ?? [],
      visibility: "private",
      isTemplate: false,
    });
    // Initialize default sub-records
    await Promise.all([
      this.repo.upsertProfile(npc.id, {}),
      this.repo.upsertAttributes(npc.id, {}),
      this.repo.upsertStats(npc.id, {}),
    ]);
    await this.repo.recordHistory({ npcId: npc.id, userId, action: "create", description: "NPC created" });
    return npc;
  }

  async listNpcs(userId: number, limit = 20, offset = 0): Promise<CreatorNpc[]> {
    return this.repo.listNpcs(userId, limit, offset);
  }

  async getNpc(id: number, userId: number): Promise<CreatorNpc | null> {
    return this.repo.findNpcById(id, userId);
  }

  async updateNpc(id: number, userId: number, data: Partial<InsertCreatorNpc>): Promise<CreatorNpc | null> {
    const updated = await this.repo.updateNpc(id, userId, data);
    if (updated) {
      await this.repo.recordHistory({ npcId: id, userId, action: "update", description: "NPC updated", after: data as Record<string, unknown> });
    }
    return updated;
  }

  async deleteNpc(id: number, userId: number): Promise<boolean> {
    return this.repo.deleteNpc(id, userId);
  }

  async duplicateNpc(id: number, userId: number, newName?: string): Promise<CreatorNpc> {
    const npc = await this.repo.findNpcById(id, userId);
    if (!npc) throw new Error("NPC not found");
    const pkg = await this.serializer.serialize(id, userId);
    const name = newName ?? `${npc.name} (Copy)`;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newNpc = await this.repo.createNpc({
      userId,
      projectId: npc.projectId ?? null,
      name,
      slug,
      description: npc.description ?? null,
      npcType: npc.npcType,
      state: "idle",
      behavior: npc.behavior,
      level: npc.level,
      tags: npc.tags,
      visibility: "private",
      isTemplate: false,
    });
    if (pkg["profile"]) await this.repo.upsertProfile(newNpc.id, pkg["profile"] as Record<string, unknown>);
    if (pkg["attributes"]) await this.repo.upsertAttributes(newNpc.id, pkg["attributes"] as Record<string, unknown>);
    if (pkg["stats"]) await this.repo.upsertStats(newNpc.id, pkg["stats"] as Record<string, unknown>);
    for (const skill of (pkg["skills"] as Record<string, unknown>[]) ?? []) {
      const { id: _id, npcId: _n, createdAt: _c, updatedAt: _u, ...rest } = skill;
      await this.repo.createSkill({ npcId: newNpc.id, ...rest } as Parameters<typeof this.repo.createSkill>[0]);
    }
    await this.repo.recordHistory({ npcId: newNpc.id, userId, action: "duplicate", description: `Duplicated from NPC #${id}` });
    return newNpc;
  }

  async forkNpc(id: number, userId: number, label?: string): Promise<CreatorNpc> {
    const npc = await this.repo.findNpcById(id, userId);
    if (!npc) throw new Error("NPC not found");
    const name = label ?? `${npc.name} (Fork)`;
    const forked = await this.duplicateNpc(id, userId, name);
    await this.repo.updateNpc(forked.id, userId, { parentNpcId: id });
    return forked;
  }

  async publishNpc(id: number, userId: number): Promise<CreatorNpc | null> {
    return this.repo.updateNpc(id, userId, { isPublished: true, publishedAt: new Date(), visibility: "public" });
  }

  async archiveNpc(id: number, userId: number): Promise<CreatorNpc | null> {
    return this.repo.updateNpc(id, userId, { isActive: false, archivedAt: new Date() });
  }

  async restoreNpc(id: number, userId: number): Promise<CreatorNpc | null> {
    return this.repo.updateNpc(id, userId, { isActive: true, archivedAt: null });
  }

  async getDashboard(userId: number) {
    const npcs = await this.repo.listNpcs(userId, 10, 0);
    const allNpcs = await this.repo.listNpcs(userId, 200, 0);
    const published = allNpcs.filter((n) => n.isPublished);
    const drafts = allNpcs.filter((n) => !n.isPublished && n.isActive);
    const archived = allNpcs.filter((n) => !n.isActive);
    const templates = await this.repo.listTemplates(6, 0);
    return { recentNpcs: npcs, published, drafts, archived, templates, totalCount: allNpcs.length };
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  async getProfile(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.getProfile(npcId);
  }

  async updateProfile(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertProfile(npcId, data);
  }

  // ─── Attributes & Stats ───────────────────────────────────────────────────

  async getAttributes(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.getAttributes(npcId);
  }

  async updateAttributes(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertAttributes(npcId, data);
  }

  async getStats(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.getStats(npcId);
  }

  async updateStats(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertStats(npcId, data);
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  async listSkills(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listSkills(npcId);
  }

  async createSkill(npcId: number, userId: number, data: Omit<InsertCreatorNpcSkill, "npcId">): Promise<CreatorNpcSkill> {
    await this.assertOwner(npcId, userId);
    return this.repo.createSkill({ ...data, npcId });
  }

  async updateSkill(skillId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcSkill>): Promise<CreatorNpcSkill | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateSkill(skillId, npcId, data);
  }

  async deleteSkill(skillId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteSkill(skillId, npcId);
  }

  // ─── Inventory ────────────────────────────────────────────────────────────

  async listInventory(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listInventory(npcId);
  }

  async addInventoryItem(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.createInventoryItem({ npcId, ...data } as Parameters<typeof this.repo.createInventoryItem>[0]);
  }

  async updateInventoryItem(itemId: number, npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.updateInventoryItem(itemId, npcId, data);
  }

  async removeInventoryItem(itemId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteInventoryItem(itemId, npcId);
  }

  // ─── Equipment ────────────────────────────────────────────────────────────

  async listEquipment(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listEquipment(npcId);
  }

  async upsertEquipmentSlot(npcId: number, userId: number, slot: string, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertEquipmentSlot(npcId, slot, data);
  }

  async removeEquipmentSlot(slotId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteEquipmentSlot(slotId, npcId);
  }

  // ─── Behaviors ────────────────────────────────────────────────────────────

  async listBehaviors(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listBehaviors(npcId);
  }

  async createBehavior(npcId: number, userId: number, data: Omit<InsertCreatorNpcBehavior, "npcId">): Promise<CreatorNpcBehavior> {
    await this.assertOwner(npcId, userId);
    return this.repo.createBehavior({ ...data, npcId });
  }

  async updateBehavior(behaviorId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcBehavior>): Promise<CreatorNpcBehavior | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateBehavior(behaviorId, npcId, data);
  }

  async deleteBehavior(behaviorId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteBehavior(behaviorId, npcId);
  }

  async getBehaviorTree(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.getBehaviorTree(npcId);
  }

  async updateBehaviorTree(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertBehaviorTree(npcId, data);
  }

  // ─── Dialogues ────────────────────────────────────────────────────────────

  async listDialogues(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listDialogues(npcId);
  }

  async createDialogue(npcId: number, userId: number, data: Omit<InsertCreatorNpcDialogue, "npcId">): Promise<CreatorNpcDialogue> {
    await this.assertOwner(npcId, userId);
    return this.repo.createDialogue({ ...data, npcId });
  }

  async updateDialogue(dialogueId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcDialogue>): Promise<CreatorNpcDialogue | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateDialogue(dialogueId, npcId, data);
  }

  async deleteDialogue(dialogueId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteDialogue(dialogueId, npcId);
  }

  async listDialogueNodes(dialogueId: number, npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listDialogueNodes(dialogueId);
  }

  async createDialogueNode(dialogueId: number, npcId: number, userId: number, data: Omit<InsertCreatorNpcDialogueNode, "dialogueId">): Promise<CreatorNpcDialogueNode> {
    await this.assertOwner(npcId, userId);
    return this.repo.createDialogueNode({ ...data, dialogueId });
  }

  async updateDialogueNode(nodeId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcDialogueNode>): Promise<CreatorNpcDialogueNode | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateDialogueNode(nodeId, data);
  }

  async deleteDialogueNode(nodeId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteDialogueNode(nodeId);
  }

  // ─── Spawn Points ─────────────────────────────────────────────────────────

  async listSpawnPoints(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listSpawnPoints(npcId);
  }

  async createSpawnPoint(npcId: number, userId: number, data: Omit<InsertCreatorNpcSpawnPoint, "npcId">): Promise<CreatorNpcSpawnPoint> {
    await this.assertOwner(npcId, userId);
    return this.repo.createSpawnPoint({ ...data, npcId });
  }

  async updateSpawnPoint(spawnId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcSpawnPoint>): Promise<CreatorNpcSpawnPoint | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateSpawnPoint(spawnId, npcId, data);
  }

  async deleteSpawnPoint(spawnId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteSpawnPoint(spawnId, npcId);
  }

  // ─── Patrol Paths ─────────────────────────────────────────────────────────

  async listPatrolPaths(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listPatrolPaths(npcId);
  }

  async createPatrolPath(npcId: number, userId: number, data: Omit<InsertCreatorNpcPatrolPath, "npcId">): Promise<CreatorNpcPatrolPath> {
    await this.assertOwner(npcId, userId);
    return this.repo.createPatrolPath({ ...data, npcId });
  }

  async updatePatrolPath(pathId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcPatrolPath>): Promise<CreatorNpcPatrolPath | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updatePatrolPath(pathId, npcId, data);
  }

  async deletePatrolPath(pathId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deletePatrolPath(pathId, npcId);
  }

  // ─── Relations ────────────────────────────────────────────────────────────

  async listRelations(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listRelations(npcId);
  }

  async createRelation(npcId: number, userId: number, data: Omit<InsertCreatorNpcRelation, "npcId">): Promise<CreatorNpcRelation> {
    await this.assertOwner(npcId, userId);
    if (data.targetNpcId === npcId) throw new Error("NPC cannot have a relation with itself");
    return this.repo.createRelation({ ...data, npcId });
  }

  async updateRelation(relationId: number, npcId: number, userId: number, data: Partial<InsertCreatorNpcRelation>): Promise<CreatorNpcRelation | null> {
    await this.assertOwner(npcId, userId);
    return this.repo.updateRelation(relationId, npcId, data);
  }

  async deleteRelation(relationId: number, npcId: number, userId: number): Promise<boolean> {
    await this.assertOwner(npcId, userId);
    return this.repo.deleteRelation(relationId, npcId);
  }

  // ─── Factions ─────────────────────────────────────────────────────────────

  async listFactions(userId: number) {
    return this.repo.listFactions(userId);
  }

  async createFaction(userId: number, data: Omit<InsertCreatorNpcFaction, "userId">): Promise<CreatorNpcFaction> {
    return this.repo.createFaction({ ...data, userId });
  }

  async updateFaction(factionId: number, userId: number, data: Partial<InsertCreatorNpcFaction>): Promise<CreatorNpcFaction | null> {
    return this.repo.updateFaction(factionId, userId, data);
  }

  async deleteFaction(factionId: number, userId: number): Promise<boolean> {
    return this.repo.deleteFaction(factionId, userId);
  }

  // ─── Schedules ────────────────────────────────────────────────────────────

  async getSchedule(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.getSchedule(npcId);
  }

  async updateSchedule(npcId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(npcId, userId);
    return this.repo.upsertSchedule(npcId, data);
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async listVersions(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listVersions(npcId);
  }

  async createVersion(npcId: number, userId: number, label?: string, description?: string) {
    await this.assertOwner(npcId, userId);
    const pkg = await this.serializer.serialize(npcId, userId);
    const versions = await this.repo.listVersions(npcId);
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    return this.repo.createVersion({
      npcId,
      userId,
      version: nextVersion,
      label: label ?? null,
      description: description ?? null,
      snapshot: pkg as Record<string, unknown>,
      isAutomatic: !label,
    });
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async listHistory(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.listHistory(npcId);
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async getStatistics(npcId: number, userId: number) {
    await this.assertOwner(npcId, userId);
    return this.repo.computeStatistics(npcId);
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(limit = 20, offset = 0) {
    return this.repo.listTemplates(limit, offset);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async assertOwner(npcId: number, userId: number): Promise<void> {
    const npc = await this.repo.findNpcById(npcId, userId);
    if (!npc) throw new Error("NPC not found or access denied");
  }
}
