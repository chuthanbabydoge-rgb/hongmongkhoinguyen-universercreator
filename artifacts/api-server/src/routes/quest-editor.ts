import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { QuestEditorService } from "../services/quest-editor-service";

const router = Router();
const service = new QuestEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await service.getDashboard(req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Templates (before /:id) ──────────────────────────────────────────────────

router.get("/api/quest-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listTemplates(limit, offset));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { questId, name } = req.body as { questId: number; name: string };
    if (!questId || !name) { res.status(400).json({ error: "ValidationError", message: "questId and name are required" }); return; }
    res.status(201).json(await service.createTemplate(questId, req.auth!.userId, name));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Import (before /:id) ─────────────────────────────────────────────────────

router.post("/api/quest-editor/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride }));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { templateId, name, projectId } = req.body as { templateId: number; name: string; projectId?: number };
    if (!templateId || !name) { res.status(400).json({ error: "ValidationError", message: "templateId and name are required" }); return; }
    res.status(201).json(await service.importer.importFromTemplate(req.auth!.userId, templateId, { name, projectId }));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Quest CRUD ───────────────────────────────────────────────────────────────

router.get("/api/quest-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listQuests(req.auth!.userId, limit, offset));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createQuest(req.auth!.userId, req.body as Parameters<typeof service.createQuest>[1]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/api/quest-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const quest = await service.getQuest(id, req.auth!.userId);
    if (!quest) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const quest = await service.updateQuest(id, req.auth!.userId, req.body as Parameters<typeof service.updateQuest>[2]);
    if (!quest) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const deleted = await service.deleteQuest(id, req.auth!.userId);
    if (!deleted) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Actions ──────────────────────────────────────────────────────────────────

router.post("/api/quest-editor/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.duplicateQuest(id, req.auth!.userId, (req.body as { name?: string }).name));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/fork", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.forkQuest(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const quest = await service.publishQuest(id, req.auth!.userId);
    if (!quest) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const quest = await service.archiveQuest(id, req.auth!.userId);
    if (!quest) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const quest = await service.restoreQuest(id, req.auth!.userId);
    if (!quest) { res.status(404).json({ error: "NotFound", message: "Quest not found" }); return; }
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Validation ───────────────────────────────────────────────────────────────

router.post("/api/quest-editor/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.validator.validate(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Preview / Simulate / Test ────────────────────────────────────────────────

router.post("/api/quest-editor/:id/preview", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.previewQuest(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/simulate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.simulateQuest(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/test", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.testQuest(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/run", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.runQuest(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/reset", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.resetQuest(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

router.post("/api/quest-editor/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { format } = req.body as { format?: string };
    if (format === "template") {
      const { name } = req.body as { name?: string };
      res.json(await service.exporter.exportAsTemplate(id, req.auth!.userId, name ?? "Exported Template"));
    } else {
      res.json({ data: await service.exporter.exportToJson(id, req.auth!.userId) });
    }
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Versions ─────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listVersions(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { label, changelog } = req.body as { label?: string; changelog?: string };
    res.status(201).json(await service.saveVersion(id, req.auth!.userId, label, changelog));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/restore-version", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { versionId } = req.body as { versionId: number };
    if (!versionId) { res.status(400).json({ error: "ValidationError", message: "versionId is required" }); return; }
    res.status(201).json(await service.restoreVersion(id, versionId, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── History ──────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listHistory(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/statistics", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.getStatistics(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Steps ────────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/steps", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listSteps(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/steps", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createStep(id, req.auth!.userId, req.body as Parameters<typeof service.createStep>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/steps/:stepId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const stepId = Number(req.params["stepId"]);
    res.json(await service.updateStep(id, stepId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/steps/:stepId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const stepId = Number(req.params["stepId"]);
    res.json({ deleted: await service.deleteStep(id, stepId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Objectives ───────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/objectives", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listObjectives(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/objectives", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createObjective(id, req.auth!.userId, req.body as Parameters<typeof service.createObjective>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/objectives/:objId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const objId = Number(req.params["objId"]);
    res.json(await service.updateObjective(id, objId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/objectives/:objId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const objId = Number(req.params["objId"]);
    res.json({ deleted: await service.deleteObjective(id, objId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Conditions ───────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/conditions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listConditions(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/conditions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createCondition(id, req.auth!.userId, req.body as Parameters<typeof service.createCondition>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/conditions/:condId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const condId = Number(req.params["condId"]);
    res.json(await service.updateCondition(id, condId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/conditions/:condId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const condId = Number(req.params["condId"]);
    res.json({ deleted: await service.deleteCondition(id, condId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Rewards ──────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/rewards", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listRewards(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/rewards", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createReward(id, req.auth!.userId, req.body as Parameters<typeof service.createReward>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/rewards/:rewardId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const rewardId = Number(req.params["rewardId"]);
    res.json(await service.updateReward(id, rewardId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/rewards/:rewardId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const rewardId = Number(req.params["rewardId"]);
    res.json({ deleted: await service.deleteReward(id, rewardId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Dialogues ────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/dialogues", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listDialogues(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/dialogues", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { content } = req.body as { content: string };
    if (!content) { res.status(400).json({ error: "ValidationError", message: "content is required" }); return; }
    res.status(201).json(await service.createDialogue(id, req.auth!.userId, req.body as Parameters<typeof service.createDialogue>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/dialogues/:dlgId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dlgId = Number(req.params["dlgId"]);
    res.json(await service.updateDialogue(id, dlgId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/dialogues/:dlgId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dlgId = Number(req.params["dlgId"]);
    res.json({ deleted: await service.deleteDialogue(id, dlgId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Branches ─────────────────────────────────────────────────────────────────

router.get("/api/quest-editor/:id/branches", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listBranches(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/quest-editor/:id/branches", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createBranch(id, req.auth!.userId, req.body as Parameters<typeof service.createBranch>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/quest-editor/:id/branches/:branchId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const branchId = Number(req.params["branchId"]);
    res.json(await service.updateBranch(id, branchId, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/quest-editor/:id/branches/:branchId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const branchId = Number(req.params["branchId"]);
    res.json({ deleted: await service.deleteBranch(id, branchId, req.auth!.userId) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
