import type { DrizzleQuestEditorRepository } from "../repositories/quest-editor-repository";
import type { QuestPackage } from "./quest-exporter";
import type { CreatorQuest } from "@workspace/db";

export class QuestImporter {
  constructor(private repo: DrizzleQuestEditorRepository) {}

  async importFromJson(
    userId: number,
    jsonData: string,
    opts: { projectId?: number; nameOverride?: string } = {}
  ): Promise<CreatorQuest> {
    let pkg: QuestPackage;
    try {
      pkg = JSON.parse(jsonData) as QuestPackage;
    } catch {
      throw new Error("Invalid JSON data");
    }
    return this.importPackage(userId, pkg, opts);
  }

  async importFromTemplate(
    userId: number,
    templateId: number,
    opts: { name: string; projectId?: number }
  ): Promise<CreatorQuest> {
    const template = await this.repo.findTemplate(templateId);
    if (!template) throw new Error("Template not found");
    const pkg = template.data as unknown as QuestPackage;
    return this.importPackage(userId, pkg, { projectId: opts.projectId, nameOverride: opts.name });
  }

  async importFromPackage(
    userId: number,
    pkg: QuestPackage,
    opts: { projectId?: number; nameOverride?: string } = {}
  ): Promise<CreatorQuest> {
    return this.importPackage(userId, pkg, opts);
  }

  private async importPackage(
    userId: number,
    pkg: QuestPackage,
    opts: { projectId?: number; nameOverride?: string }
  ): Promise<CreatorQuest> {
    const importRecord = await this.repo.createImport({ userId, importFormat: "json", status: "processing" });

    try {
      const questData = pkg.quest as Record<string, unknown>;
      const name = opts.nameOverride ?? `${questData["name"] ?? "Imported Quest"} (Import)`;
      const slug = String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const quest = await this.repo.createQuest({
        userId,
        projectId: opts.projectId ?? (questData["projectId"] as number | undefined) ?? null,
        name,
        slug,
        description: questData["description"] as string | undefined ?? null,
        questType: (questData["questType"] as "side") ?? "side",
        status: "draft",
        icon: questData["icon"] as string | undefined ?? null,
        thumbnail: questData["thumbnail"] as string | undefined ?? null,
        level: (questData["level"] as number | undefined) ?? 1,
        tags: (questData["tags"] as string[] | undefined) ?? [],
        isRepeatable: false,
        isOptional: false,
        isTemplate: false,
      });

      // Import sub-resources
      const stepMap = new Map<number, number>();
      for (const step of (pkg.steps ?? [])) {
        const s = step as Record<string, unknown>;
        const newStep = await this.repo.createStep({ questId: quest.id, name: String(s["name"] ?? "Step"), order: Number(s["order"] ?? 0) });
        if (s["id"]) stepMap.set(Number(s["id"]), newStep.id);
      }

      for (const obj of (pkg.objectives ?? [])) {
        const o = obj as Record<string, unknown>;
        await this.repo.createObjective({ questId: quest.id, name: String(o["name"] ?? "Objective"), objectiveType: (o["objectiveType"] as "kill") ?? "kill", order: Number(o["order"] ?? 0), targetCount: Number(o["targetCount"] ?? 1) });
      }

      for (const cond of (pkg.conditions ?? [])) {
        const c = cond as Record<string, unknown>;
        await this.repo.createCondition({ questId: quest.id, name: String(c["name"] ?? "Condition"), conditionType: (c["conditionType"] as "level") ?? "level" });
      }

      for (const reward of (pkg.rewards ?? [])) {
        const r = reward as Record<string, unknown>;
        await this.repo.createReward({ questId: quest.id, name: String(r["name"] ?? "Reward"), rewardType: (r["rewardType"] as "xp") ?? "xp", amount: Number(r["amount"] ?? 1) });
      }

      for (const dlg of (pkg.dialogues ?? [])) {
        const d = dlg as Record<string, unknown>;
        await this.repo.createDialogue({ questId: quest.id, content: String(d["content"] ?? ""), dialogueType: (d["dialogueType"] as "start") ?? "start", order: Number(d["order"] ?? 0) });
      }

      for (const branch of (pkg.branches ?? [])) {
        const b = branch as Record<string, unknown>;
        await this.repo.createBranch({ questId: quest.id, name: String(b["name"] ?? "Branch"), branchType: (b["branchType"] as "choice") ?? "choice", order: Number(b["order"] ?? 0) });
      }

      for (const variable of (pkg.variables ?? [])) {
        const v = variable as Record<string, unknown>;
        await this.repo.createVariable({ questId: quest.id, name: String(v["name"] ?? "variable"), variableType: String(v["variableType"] ?? "integer") });
      }

      for (const flag of (pkg.flags ?? [])) {
        const f = flag as Record<string, unknown>;
        await this.repo.createFlag({ questId: quest.id, name: String(f["name"] ?? "flag") });
      }

      await this.repo.recordHistory({ questId: quest.id, userId, action: "import", description: "Quest imported" });
      await this.repo.updateImport(importRecord.id, { questId: quest.id, status: "completed" });

      return quest;
    } catch (err) {
      await this.repo.updateImport(importRecord.id, { status: "failed", error: String(err) });
      throw err;
    }
  }
}
