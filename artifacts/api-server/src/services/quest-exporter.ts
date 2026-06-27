import type { DrizzleQuestEditorRepository } from "../repositories/quest-editor-repository";

export interface QuestPackage {
  version: string;
  exportedAt: string;
  quest: Record<string, unknown>;
  steps: unknown[];
  objectives: unknown[];
  conditions: unknown[];
  rewards: unknown[];
  dialogues: unknown[];
  branches: unknown[];
  variables: unknown[];
  flags: unknown[];
  npcs: unknown[];
  regions: unknown[];
  events: unknown[];
  scripts: unknown[];
  checkpoints: unknown[];
}

export class QuestExporter {
  constructor(private repo: DrizzleQuestEditorRepository) {}

  async exportToJson(questId: number, userId: number): Promise<string> {
    const pkg = await this.buildPackage(questId, userId);
    return JSON.stringify(pkg, null, 2);
  }

  async exportToPackage(questId: number, userId: number): Promise<QuestPackage> {
    return this.buildPackage(questId, userId);
  }

  async exportAsTemplate(questId: number, userId: number, templateName: string): Promise<Record<string, unknown>> {
    const pkg = await this.buildPackage(questId, userId);
    return {
      name: templateName,
      description: (pkg.quest as { description?: string }).description ?? "",
      questType: (pkg.quest as { questType?: string }).questType ?? "side",
      data: pkg,
      tags: (pkg.quest as { tags?: string[] }).tags ?? [],
      isOfficial: false,
    };
  }

  private async buildPackage(questId: number, userId: number): Promise<QuestPackage> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");

    const [steps, objectives, conditions, rewards, dialogues, branches, variables, flags, npcs, regions, events, scripts, checkpoints] =
      await Promise.all([
        this.repo.listSteps(questId),
        this.repo.listObjectives(questId),
        this.repo.listConditions(questId),
        this.repo.listRewards(questId),
        this.repo.listDialogues(questId),
        this.repo.listBranches(questId),
        this.repo.listVariables(questId),
        this.repo.listFlags(questId),
        this.repo.listNpcs(questId),
        this.repo.listRegions(questId),
        this.repo.listEvents(questId),
        this.repo.listScripts(questId),
        this.repo.listCheckpoints(questId),
      ]);

    // Record export
    await this.repo.createExport({
      questId,
      userId,
      exportFormat: "json",
      filename: `quest-${quest.slug}-${Date.now()}.json`,
      data: quest as unknown as Record<string, unknown>,
      size: 0,
    });

    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      quest: quest as unknown as Record<string, unknown>,
      steps,
      objectives,
      conditions,
      rewards,
      dialogues,
      branches,
      variables,
      flags,
      npcs,
      regions,
      events,
      scripts,
      checkpoints,
    };
  }
}
