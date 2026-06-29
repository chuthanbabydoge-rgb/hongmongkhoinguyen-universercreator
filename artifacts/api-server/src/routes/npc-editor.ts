import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { NpcEditorService } from "../services/npc-editor-service";

const router = Router();
const service = new NpcEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/dashboard
router.get("/npc-editor/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await service.getDashboard(req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Templates ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/templates
router.get("/npc-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listTemplates(limit, offset));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Import (must be before /:id routes) ─────────────────────────────────────

// POST /api/npc-editor/import
router.post("/npc-editor/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride }));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/import/template
router.post("/npc-editor/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { templateId, name, projectId } = req.body as { templateId: number; name: string; projectId?: number };
    if (!templateId || !name) { res.status(400).json({ error: "ValidationError", message: "templateId and name are required" }); return; }
    res.status(201).json(await service.importer.importFromTemplate(req.auth!.userId, templateId, { name, projectId }));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Factions (global) ────────────────────────────────────────────────────────

// GET /api/npc-editor/factions
router.get("/npc-editor/factions", requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(await service.listFactions(req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/factions
router.post("/npc-editor/factions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createFaction(req.auth!.userId, req.body as Parameters<typeof service.createFaction>[1]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/factions/:factionId
router.patch("/npc-editor/factions/:factionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const factionId = Number(req.params["factionId"]);
    const faction = await service.updateFaction(factionId, req.auth!.userId, req.body as Record<string, unknown>);
    if (!faction) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(faction);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/factions/:factionId
router.delete("/npc-editor/factions/:factionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const factionId = Number(req.params["factionId"]);
    const ok = await service.deleteFaction(factionId, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── NPC CRUD ─────────────────────────────────────────────────────────────────

// GET /api/npc-editor
router.get("/npc-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listNpcs(req.auth!.userId, limit, offset));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor
router.post("/npc-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, projectId, npcType, description, tags } = req.body as {
      name: string; projectId?: number; npcType?: string; description?: string; tags?: string[];
    };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createNpc(req.auth!.userId, { name, projectId, npcType, description, tags }));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/npc-editor/:id
router.get("/npc-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const npc = await service.getNpc(id, req.auth!.userId);
    if (!npc) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(npc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id
router.patch("/npc-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const npc = await service.updateNpc(id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!npc) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(npc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id
router.delete("/npc-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const ok = await service.deleteNpc(id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/duplicate
router.post("/npc-editor/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name?: string };
    res.status(201).json(await service.duplicateNpc(id, req.auth!.userId, name));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/fork
router.post("/npc-editor/:id/fork", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { label } = req.body as { label?: string };
    res.status(201).json(await service.forkNpc(id, req.auth!.userId, label));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/publish
router.post("/npc-editor/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const npc = await service.publishNpc(id, req.auth!.userId);
    if (!npc) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(npc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/archive
router.post("/npc-editor/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const npc = await service.archiveNpc(id, req.auth!.userId);
    if (!npc) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(npc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/restore
router.post("/npc-editor/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const npc = await service.restoreNpc(id, req.auth!.userId);
    if (!npc) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(npc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Profile ──────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/profile
router.get("/npc-editor/:id/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json((await service.getProfile(id, req.auth!.userId)) ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/profile
router.patch("/npc-editor/:id/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.updateProfile(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Attributes ───────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/attributes
router.get("/npc-editor/:id/attributes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json((await service.getAttributes(id, req.auth!.userId)) ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/attributes
router.patch("/npc-editor/:id/attributes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.updateAttributes(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/stats
router.get("/npc-editor/:id/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json((await service.getStats(id, req.auth!.userId)) ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/stats
router.patch("/npc-editor/:id/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.updateStats(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Skills ───────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/skills
router.get("/npc-editor/:id/skills", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listSkills(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/skills
router.post("/npc-editor/:id/skills", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createSkill(id, req.auth!.userId, req.body as Parameters<typeof service.createSkill>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/skills/:skillId
router.patch("/npc-editor/:id/skills/:skillId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const skillId = Number(req.params["skillId"]);
    const skill = await service.updateSkill(skillId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!skill) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/skills/:skillId
router.delete("/npc-editor/:id/skills/:skillId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const skillId = Number(req.params["skillId"]);
    const ok = await service.deleteSkill(skillId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Inventory ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/inventory
router.get("/npc-editor/:id/inventory", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listInventory(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/inventory
router.post("/npc-editor/:id/inventory", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.addInventoryItem(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/inventory/:itemId
router.patch("/npc-editor/:id/inventory/:itemId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const itemId = Number(req.params["itemId"]);
    const item = await service.updateInventoryItem(itemId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!item) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/inventory/:itemId
router.delete("/npc-editor/:id/inventory/:itemId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const itemId = Number(req.params["itemId"]);
    const ok = await service.removeInventoryItem(itemId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Equipment ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/equipment
router.get("/npc-editor/:id/equipment", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listEquipment(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PUT /api/npc-editor/:id/equipment/:slot
router.put("/npc-editor/:id/equipment/:slot", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const slot = Array.isArray(req.params["slot"]) ? req.params["slot"][0] : req.params["slot"];
    res.json(await service.upsertEquipmentSlot(id, req.auth!.userId, slot, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/equipment/:slotId
router.delete("/npc-editor/:id/equipment/:slotId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const slotId = Number(req.params["slotId"]);
    const ok = await service.removeEquipmentSlot(slotId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Behaviors ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/behaviors
router.get("/npc-editor/:id/behaviors", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listBehaviors(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/behaviors
router.post("/npc-editor/:id/behaviors", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createBehavior(id, req.auth!.userId, req.body as Parameters<typeof service.createBehavior>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/behaviors/:behaviorId
router.patch("/npc-editor/:id/behaviors/:behaviorId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const behaviorId = Number(req.params["behaviorId"]);
    const b = await service.updateBehavior(behaviorId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!b) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(b);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/behaviors/:behaviorId
router.delete("/npc-editor/:id/behaviors/:behaviorId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const behaviorId = Number(req.params["behaviorId"]);
    const ok = await service.deleteBehavior(behaviorId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/npc-editor/:id/behavior-tree
router.get("/npc-editor/:id/behavior-tree", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json((await service.getBehaviorTree(id, req.auth!.userId)) ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/behavior-tree
router.patch("/npc-editor/:id/behavior-tree", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.updateBehaviorTree(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Dialogues ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/dialogues
router.get("/npc-editor/:id/dialogues", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listDialogues(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/dialogues
router.post("/npc-editor/:id/dialogues", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createDialogue(id, req.auth!.userId, req.body as Parameters<typeof service.createDialogue>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/dialogues/:dialogueId
router.patch("/npc-editor/:id/dialogues/:dialogueId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dialogueId = Number(req.params["dialogueId"]);
    const d = await service.updateDialogue(dialogueId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!d) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/dialogues/:dialogueId
router.delete("/npc-editor/:id/dialogues/:dialogueId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dialogueId = Number(req.params["dialogueId"]);
    const ok = await service.deleteDialogue(dialogueId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/npc-editor/:id/dialogues/:dialogueId/nodes
router.get("/npc-editor/:id/dialogues/:dialogueId/nodes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dialogueId = Number(req.params["dialogueId"]);
    res.json(await service.listDialogueNodes(dialogueId, id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/dialogues/:dialogueId/nodes
router.post("/npc-editor/:id/dialogues/:dialogueId/nodes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const dialogueId = Number(req.params["dialogueId"]);
    res.status(201).json(await service.createDialogueNode(dialogueId, id, req.auth!.userId, req.body as Parameters<typeof service.createDialogueNode>[3]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/dialogues/:dialogueId/nodes/:nodeId
router.patch("/npc-editor/:id/dialogues/:dialogueId/nodes/:nodeId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const nodeId = Number(req.params["nodeId"]);
    const node = await service.updateDialogueNode(nodeId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!node) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/dialogues/:dialogueId/nodes/:nodeId
router.delete("/npc-editor/:id/dialogues/:dialogueId/nodes/:nodeId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const nodeId = Number(req.params["nodeId"]);
    const ok = await service.deleteDialogueNode(nodeId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Spawn Points ─────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/spawn-points
router.get("/npc-editor/:id/spawn-points", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listSpawnPoints(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/spawn-points
router.post("/npc-editor/:id/spawn-points", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createSpawnPoint(id, req.auth!.userId, req.body as Parameters<typeof service.createSpawnPoint>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/spawn-points/:spawnId
router.patch("/npc-editor/:id/spawn-points/:spawnId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawnId = Number(req.params["spawnId"]);
    const sp = await service.updateSpawnPoint(spawnId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!sp) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(sp);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/spawn-points/:spawnId
router.delete("/npc-editor/:id/spawn-points/:spawnId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawnId = Number(req.params["spawnId"]);
    const ok = await service.deleteSpawnPoint(spawnId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Patrol Paths ─────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/patrol-paths
router.get("/npc-editor/:id/patrol-paths", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listPatrolPaths(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/patrol-paths
router.post("/npc-editor/:id/patrol-paths", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createPatrolPath(id, req.auth!.userId, req.body as Parameters<typeof service.createPatrolPath>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/patrol-paths/:pathId
router.patch("/npc-editor/:id/patrol-paths/:pathId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const pathId = Number(req.params["pathId"]);
    const path = await service.updatePatrolPath(pathId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!path) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/patrol-paths/:pathId
router.delete("/npc-editor/:id/patrol-paths/:pathId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const pathId = Number(req.params["pathId"]);
    const ok = await service.deletePatrolPath(pathId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Relations ────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/relations
router.get("/npc-editor/:id/relations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listRelations(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/relations
router.post("/npc-editor/:id/relations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.status(201).json(await service.createRelation(id, req.auth!.userId, req.body as Parameters<typeof service.createRelation>[2]));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/relations/:relationId
router.patch("/npc-editor/:id/relations/:relationId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const relationId = Number(req.params["relationId"]);
    const r = await service.updateRelation(relationId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!r) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/npc-editor/:id/relations/:relationId
router.delete("/npc-editor/:id/relations/:relationId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const relationId = Number(req.params["relationId"]);
    const ok = await service.deleteRelation(relationId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Schedule ─────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/schedule
router.get("/npc-editor/:id/schedule", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json((await service.getSchedule(id, req.auth!.userId)) ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/npc-editor/:id/schedule
router.patch("/npc-editor/:id/schedule", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.updateSchedule(id, req.auth!.userId, req.body as Record<string, unknown>));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Versions ─────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/versions
router.get("/npc-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listVersions(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/versions
router.post("/npc-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { label, description } = req.body as { label?: string; description?: string };
    res.status(201).json(await service.createVersion(id, req.auth!.userId, label, description));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── History ──────────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/history
router.get("/npc-editor/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.listHistory(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

// GET /api/npc-editor/:id/statistics
router.get("/npc-editor/:id/statistics", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.getStatistics(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Validate ─────────────────────────────────────────────────────────────────

// POST /api/npc-editor/:id/validate
router.post("/npc-editor/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.validator.validate(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

// POST /api/npc-editor/:id/export
router.post("/npc-editor/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { format } = req.body as { format?: string };
    if (format === "template") {
      const { name, description } = req.body as { name: string; description?: string };
      res.json(await service.exporter.exportAsTemplate(id, req.auth!.userId, name, description));
    } else {
      res.json(await service.exporter.exportAsJson(id, req.auth!.userId));
    }
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/export/package
router.post("/npc-editor/export/package", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { npcIds } = req.body as { npcIds: number[] };
    if (!npcIds?.length) { res.status(400).json({ error: "ValidationError", message: "npcIds required" }); return; }
    res.json(await service.exporter.exportNpcPackage(npcIds, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Preview / Runtime ────────────────────────────────────────────────────────

// POST /api/npc-editor/:id/preview
router.post("/npc-editor/:id/preview", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.preview(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/preview/behavior
router.post("/npc-editor/:id/preview/behavior", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.previewBehavior(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/preview/dialogue
router.post("/npc-editor/:id/preview/dialogue", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { dialogueId } = req.body as { dialogueId?: number };
    res.json(await service.runtimeBridge.previewDialogue(id, req.auth!.userId, dialogueId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/preview/animation
router.post("/npc-editor/:id/preview/animation", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.previewAnimation(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/npc-editor/:id/preview/spawn
router.post("/npc-editor/:id/preview/spawn", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    res.json(await service.runtimeBridge.previewSpawn(id, req.auth!.userId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
