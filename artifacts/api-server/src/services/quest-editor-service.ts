import { DrizzleQuestEditorRepository } from "../repositories/quest-editor-repository";
import { QuestValidator } from "./quest-validator";
import { QuestExporter } from "./quest-exporter";
import { QuestImporter } from "./quest-importer";
import { QuestRuntimeBridge } from "./quest-runtime-bridge";
import type { CreatorQuest, InsertCreatorQuest } from "@workspace/db";

export class QuestEditorService {
  private repo: DrizzleQuestEditorRepository;
  readonly validator: QuestValidator;
  readonly exporter: QuestExporter;
  readonly importer: QuestImporter;
  readonly runtimeBridge: QuestRuntimeBridge;

  constructor() {
    this.repo = new DrizzleQuestEditorRepository();
    this.validator = new QuestValidator(this.repo);
    this.exporter = new QuestExporter(this.repo);
    this.importer = new QuestImporter(this.repo);
    this.runtimeBridge = new QuestRuntimeBridge(this.repo);
  }

  private makeSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  private async assertOwner(id: number, userId: number): Promise<CreatorQuest> {
    const quest = await this.repo.findQuestById(id, userId);
    if (!quest) throw new Error("Quest not found");
    return quest;
  }

  // ─── Quest CRUD ───────────────────────────────────────────────────────────

  async createQuest(
    userId: number,
    data: { name: string; projectId?: number; questType?: string; description?: string; tags?: string[] }
  ): Promise<CreatorQuest> {
    const quest = await this.repo.createQuest({
      userId,
      projectId: data.projectId ?? null,
      name: data.name,
      slug: this.makeSlug(data.name),
      description: data.description ?? null,
      questType: (data.questType as "side") ?? "side",
      status: "draft",
      level: 1,
      tags: data.tags ?? [],
      isRepeatable: false,
      isOptional: false,
      isTemplate: false,
    });
    await this.repo.upsertStatistics(quest.id, {});
    await this.repo.recordHistory({ questId: quest.id, userId, action: "create", description: "Quest created" });
    return quest;
  }

  async listQuests(userId: number, limit = 20, offset = 0): Promise<CreatorQuest[]> {
    return this.repo.listQuests(userId, limit, offset);
  }

  async getQuest(id: number, userId: number): Promise<CreatorQuest | null> {
    return this.repo.findQuestById(id, userId);
  }

  async updateQuest(id: number, userId: number, data: Partial<InsertCreatorQuest>): Promise<CreatorQuest | null> {
    const updated = await this.repo.updateQuest(id, userId, data);
    if (updated) {
      await this.repo.recordHistory({ questId: id, userId, action: "update", description: "Quest updated", after: data as Record<string, unknown> });
    }
    return updated;
  }

  async deleteQuest(id: number, userId: number): Promise<boolean> {
    return this.repo.deleteQuest(id, userId);
  }

  async duplicateQuest(id: number, userId: number, newName?: string): Promise<CreatorQuest> {
    const quest = await this.assertOwner(id, userId);
    const pkg = await this.exporter.exportToPackage(id, userId);
    const name = newName ?? `${quest.name} (Copy)`;
    return this.importer.importFromPackage(userId, pkg, { projectId: quest.projectId ?? undefined, nameOverride: name });
  }

  async forkQuest(id: number, userId: number): Promise<CreatorQuest> {
    const quest = await this.assertOwner(id, userId);
    const pkg = await this.exporter.exportToPackage(id, userId);
    return this.importer.importFromPackage(userId, pkg, { nameOverride: `Fork of ${quest.name}` });
  }

  async publishQuest(id: number, userId: number): Promise<CreatorQuest | null> {
    await this.assertOwner(id, userId);
    const result = await this.validator.validate(id, userId);
    if (!result.valid) {
      throw new Error(`Cannot publish: ${result.errors.map((e) => e.message).join(", ")}`);
    }
    const updated = await this.repo.updateQuest(id, userId, { status: "published" });
    await this.repo.recordHistory({ questId: id, userId, action: "publish", description: "Quest published" });
    return updated;
  }

  async archiveQuest(id: number, userId: number): Promise<CreatorQuest | null> {
    const updated = await this.repo.updateQuest(id, userId, { status: "archived" });
    if (updated) await this.repo.recordHistory({ questId: id, userId, action: "archive", description: "Quest archived" });
    return updated;
  }

  async restoreQuest(id: number, userId: number): Promise<CreatorQuest | null> {
    const updated = await this.repo.updateQuest(id, userId, { status: "draft" });
    if (updated) await this.repo.recordHistory({ questId: id, userId, action: "restore", description: "Quest restored to draft" });
    return updated;
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  async saveVersion(id: number, userId: number, label?: string, changelog?: string) {
    await this.assertOwner(id, userId);
    const version = await this.repo.getNextVersion(id);
    const pkg = await this.exporter.exportToPackage(id, userId);
    return this.repo.createVersion({ questId: id, userId, version, label: label ?? null, snapshot: pkg as unknown as Record<string, unknown>, changelog: changelog ?? null });
  }

  async listVersions(id: number, userId: number) {
    await this.assertOwner(id, userId);
    return this.repo.listVersions(id);
  }

  async restoreVersion(questId: number, versionId: number, userId: number): Promise<CreatorQuest> {
    await this.assertOwner(questId, userId);
    const version = await this.repo.findVersion(versionId);
    if (!version || version.questId !== questId) throw new Error("Version not found");
    return this.importer.importFromPackage(userId, version.snapshot as Parameters<typeof this.importer.importFromPackage>[1], { nameOverride: undefined });
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates(limit = 20, offset = 0) {
    return this.repo.listTemplates(limit, offset);
  }

  async createTemplate(id: number, userId: number, name: string) {
    const pkg = await this.exporter.exportAsTemplate(id, userId, name);
    const quest = await this.assertOwner(id, userId);
    return this.repo.createTemplate({
      name,
      description: pkg["description"] as string | undefined ?? null,
      questType: quest.questType,
      icon: quest.icon ?? null,
      thumbnail: quest.thumbnail ?? null,
      data: pkg as unknown as Record<string, unknown>,
      tags: quest.tags,
      isOfficial: false,
    });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async getStatistics(id: number, userId: number) {
    await this.assertOwner(id, userId);
    const [steps, objectives, rewards, dialogues, branches, stats] = await Promise.all([
      this.repo.listSteps(id),
      this.repo.listObjectives(id),
      this.repo.listRewards(id),
      this.repo.listDialogues(id),
      this.repo.listBranches(id),
      this.repo.findStatistics(id),
    ]);
    const updated = await this.repo.upsertStatistics(id, {
      totalSteps: steps.length,
      totalObjectives: objectives.length,
      totalRewards: rewards.length,
      totalDialogues: dialogues.length,
      totalBranches: branches.length,
    });
    return updated;
  }

  async getDashboard(userId: number) {
    const [quests, total] = await Promise.all([
      this.repo.listQuests(userId, 10, 0),
      this.repo.countQuests(userId),
    ]);
    const published = quests.filter((q) => q.status === "published").length;
    const drafts = quests.filter((q) => q.status === "draft").length;
    return { total, published, drafts, recent: quests };
  }

  // ─── Steps ────────────────────────────────────────────────────────────────

  async listSteps(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listSteps(questId);
  }

  async createStep(questId: number, userId: number, data: { name: string; description?: string; order?: number }) {
    await this.assertOwner(questId, userId);
    return this.repo.createStep({ questId, name: data.name, description: data.description ?? null, order: data.order ?? 0 });
  }

  async updateStep(questId: number, stepId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateStep(stepId, data);
  }

  async deleteStep(questId: number, stepId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteStep(stepId);
  }

  // ─── Objectives ───────────────────────────────────────────────────────────

  async listObjectives(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listObjectives(questId);
  }

  async createObjective(questId: number, userId: number, data: { name: string; objectiveType?: string; targetCount?: number; description?: string }) {
    await this.assertOwner(questId, userId);
    return this.repo.createObjective({ questId, name: data.name, objectiveType: (data.objectiveType as "kill") ?? "kill", targetCount: data.targetCount ?? 1, description: data.description ?? null, order: 0 });
  }

  async updateObjective(questId: number, objId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateObjective(objId, data);
  }

  async deleteObjective(questId: number, objId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteObjective(objId);
  }

  // ─── Conditions ───────────────────────────────────────────────────────────

  async listConditions(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listConditions(questId);
  }

  async createCondition(questId: number, userId: number, data: { name: string; conditionType?: string; targetValue?: string }) {
    await this.assertOwner(questId, userId);
    return this.repo.createCondition({ questId, name: data.name, conditionType: (data.conditionType as "level") ?? "level", targetValue: data.targetValue ?? null });
  }

  async updateCondition(questId: number, condId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateCondition(condId, data);
  }

  async deleteCondition(questId: number, condId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteCondition(condId);
  }

  // ─── Rewards ──────────────────────────────────────────────────────────────

  async listRewards(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listRewards(questId);
  }

  async createReward(questId: number, userId: number, data: { name: string; rewardType?: string; amount?: number }) {
    await this.assertOwner(questId, userId);
    return this.repo.createReward({ questId, name: data.name, rewardType: (data.rewardType as "xp") ?? "xp", amount: data.amount ?? 1 });
  }

  async updateReward(questId: number, rewardId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateReward(rewardId, data);
  }

  async deleteReward(questId: number, rewardId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteReward(rewardId);
  }

  // ─── Dialogues ────────────────────────────────────────────────────────────

  async listDialogues(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listDialogues(questId);
  }

  async createDialogue(questId: number, userId: number, data: { content: string; dialogueType?: string; title?: string }) {
    await this.assertOwner(questId, userId);
    return this.repo.createDialogue({ questId, content: data.content, dialogueType: (data.dialogueType as "start") ?? "start", title: data.title ?? null, order: 0 });
  }

  async updateDialogue(questId: number, dlgId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateDialogue(dlgId, data);
  }

  async deleteDialogue(questId: number, dlgId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteDialogue(dlgId);
  }

  // ─── Branches ─────────────────────────────────────────────────────────────

  async listBranches(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listBranches(questId);
  }

  async createBranch(questId: number, userId: number, data: { name: string; branchType?: string; parentId?: number }) {
    await this.assertOwner(questId, userId);
    return this.repo.createBranch({ questId, name: data.name, branchType: (data.branchType as "choice") ?? "choice", parentId: data.parentId ?? null, order: 0 });
  }

  async updateBranch(questId: number, branchId: number, userId: number, data: Record<string, unknown>) {
    await this.assertOwner(questId, userId);
    return this.repo.updateBranch(branchId, data);
  }

  async deleteBranch(questId: number, branchId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.deleteBranch(branchId);
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async listHistory(questId: number, userId: number) {
    await this.assertOwner(questId, userId);
    return this.repo.listHistory(questId);
  }
}
