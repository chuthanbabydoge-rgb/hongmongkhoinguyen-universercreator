import type { DrizzleQuestEditorRepository } from "../repositories/quest-editor-repository";

export interface ValidationIssue {
  type: "error" | "warning";
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export class QuestValidator {
  constructor(private repo: DrizzleQuestEditorRepository) {}

  async validate(questId: number, userId: number): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    const quest = await this.repo.findQuestById(questId, userId);
    if (!quest) {
      return { valid: false, errors: [{ type: "error", code: "QUEST_NOT_FOUND", message: "Quest not found" }], warnings: [] };
    }

    const [objectives, rewards, branches, dialogues, steps, conditions] = await Promise.all([
      this.repo.listObjectives(questId),
      this.repo.listRewards(questId),
      this.repo.listBranches(questId),
      this.repo.listDialogues(questId),
      this.repo.listSteps(questId),
      this.repo.listConditions(questId),
    ]);

    // ─── Errors ───────────────────────────────────────────────────────────────

    if (objectives.length === 0) {
      errors.push({ type: "error", code: "MISSING_OBJECTIVE", message: "Quest has no objectives" });
    }

    // Check duplicate objectives
    const objectiveNames = objectives.map((o) => o.name);
    const duplicateObjectives = objectiveNames.filter((n, i) => objectiveNames.indexOf(n) !== i);
    if (duplicateObjectives.length > 0) {
      errors.push({ type: "error", code: "DUPLICATE_OBJECTIVE", message: `Duplicate objective names: ${duplicateObjectives.join(", ")}` });
    }

    // Check broken steps referenced by objectives
    const stepIds = new Set(steps.map((s) => s.id));
    for (const obj of objectives) {
      if (obj.stepId && !stepIds.has(obj.stepId)) {
        errors.push({ type: "error", code: "BROKEN_STEP", message: `Objective "${obj.name}" references a missing step` });
      }
    }

    // Check invalid conditions (custom conditions with no target)
    for (const cond of conditions) {
      if (cond.conditionType !== "custom" && !cond.targetValue) {
        errors.push({ type: "error", code: "INVALID_CONDITION", message: `Condition "${cond.name}" is missing a target value` });
      }
    }

    // Check for broken dialogues (branch references that don't exist)
    const branchIds = new Set(branches.map((b) => b.id));
    for (const d of dialogues) {
      if (d.branchId && !branchIds.has(d.branchId)) {
        errors.push({ type: "error", code: "BROKEN_DIALOGUE", message: `Dialogue "${d.title ?? d.id}" references a missing branch` });
      }
    }

    // Check for circular branches (parent chain)
    for (const branch of branches) {
      if (this.hasCircularBranch(branch.id, branches)) {
        errors.push({ type: "error", code: "INFINITE_BRANCH", message: `Branch "${branch.name}" creates a circular reference` });
      }
    }

    // ─── Warnings ─────────────────────────────────────────────────────────────

    if (rewards.length === 0) {
      warnings.push({ type: "warning", code: "NO_REWARD", message: "Quest has no rewards" });
    }

    if (!quest.description) {
      warnings.push({ type: "warning", code: "NO_DESCRIPTION", message: "Quest has no description" });
    }

    if (!quest.icon) {
      warnings.push({ type: "warning", code: "NO_ICON", message: "Quest has no icon" });
    }

    if (!quest.thumbnail) {
      warnings.push({ type: "warning", code: "NO_THUMBNAIL", message: "Quest has no thumbnail" });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private hasCircularBranch(branchId: number, branches: Array<{ id: number; parentId: number | null }>): boolean {
    const visited = new Set<number>();
    let current: number | null = branchId;
    while (current != null) {
      if (visited.has(current)) return true;
      visited.add(current);
      const parent = branches.find((b) => b.id === current);
      current = parent?.parentId ?? null;
    }
    return false;
  }
}
