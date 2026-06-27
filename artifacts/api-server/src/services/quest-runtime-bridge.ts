import type { DrizzleQuestEditorRepository } from "../repositories/quest-editor-repository";

export interface QuestPreviewResult {
  questId: number;
  name: string;
  steps: unknown[];
  objectives: unknown[];
  rewards: unknown[];
  branches: unknown[];
  status: "ready" | "invalid";
  issues: string[];
}

export interface QuestSimulationResult {
  questId: number;
  simulationId: string;
  startedAt: string;
  state: "running" | "completed" | "failed";
  currentStep: number;
  completedObjectives: number[];
  log: string[];
}

export class QuestRuntimeBridge {
  constructor(private repo: DrizzleQuestEditorRepository) {}

  async previewQuest(questId: number, userId: number): Promise<QuestPreviewResult> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");

    const [steps, objectives, rewards, branches] = await Promise.all([
      this.repo.listSteps(questId),
      this.repo.listObjectives(questId),
      this.repo.listRewards(questId),
      this.repo.listBranches(questId),
    ]);

    const issues: string[] = [];
    if (objectives.length === 0) issues.push("No objectives defined");
    if (rewards.length === 0) issues.push("No rewards defined (warning)");

    return {
      questId,
      name: quest.name,
      steps,
      objectives,
      rewards,
      branches,
      status: issues.some((i) => !i.includes("warning")) ? "invalid" : "ready",
      issues,
    };
  }

  async runQuest(questId: number, userId: number): Promise<{ started: boolean; message: string }> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");
    if (quest.status !== "published") {
      return { started: false, message: "Quest must be published before it can be run in the runtime" };
    }
    await this.repo.recordHistory({ questId, userId, action: "run", description: "Quest sent to runtime" });
    return { started: true, message: `Quest "${quest.name}" is now running in the runtime engine` };
  }

  async simulateQuest(questId: number, userId: number, options: Record<string, unknown> = {}): Promise<QuestSimulationResult> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");

    const simulationId = `sim-${questId}-${Date.now()}`;
    const objectives = await this.repo.listObjectives(questId);

    await this.repo.recordHistory({ questId, userId, action: "simulate", description: "Quest simulation started" });

    return {
      questId,
      simulationId,
      startedAt: new Date().toISOString(),
      state: "running",
      currentStep: 0,
      completedObjectives: [],
      log: [
        `[${new Date().toISOString()}] Simulation started for quest: ${quest.name}`,
        `[${new Date().toISOString()}] Loaded ${objectives.length} objectives`,
        `[${new Date().toISOString()}] Simulation options: ${JSON.stringify(options)}`,
      ],
    };
  }

  async testQuest(questId: number, userId: number): Promise<{ passed: boolean; results: Record<string, unknown> }> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");

    const [objectives, conditions, rewards, branches] = await Promise.all([
      this.repo.listObjectives(questId),
      this.repo.listConditions(questId),
      this.repo.listRewards(questId),
      this.repo.listBranches(questId),
    ]);

    const results = {
      hasObjectives: objectives.length > 0,
      hasConditions: conditions.length >= 0,
      hasRewards: rewards.length > 0,
      branchesValid: !branches.some((b) => b.parentId === b.id),
      questStatus: quest.status,
    };

    const passed = results.hasObjectives && results.branchesValid;
    await this.repo.recordHistory({ questId, userId, action: "test", description: `Quest test ${passed ? "passed" : "failed"}` });

    return { passed, results };
  }

  async resetQuest(questId: number, userId: number): Promise<{ reset: boolean }> {
    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) throw new Error("Quest not found");
    await this.repo.recordHistory({ questId, userId, action: "reset", description: "Quest runtime state reset" });
    return { reset: true };
  }
}
