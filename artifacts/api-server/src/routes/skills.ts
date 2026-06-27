import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { SkillEditorService } from "../services/skill-editor-service";

const router = Router();
const service = new SkillEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get("/api/skills/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDashboard(req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Templates ────────────────────────────────────────────────────────────────

router.get("/api/skills/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.listTemplates(limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { skillId, name } = req.body as { skillId: number; name: string };
    if (!skillId || !name) { res.status(400).json({ error: "ValidationError", message: "skillId and name are required" }); return; }
    res.status(201).json(await service.createTemplate(skillId, req.auth!.userId, name));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Import ───────────────────────────────────────────────────────────────────

router.post("/api/skills/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { templateId, name, projectId } = req.body as { templateId: number; name: string; projectId?: number };
    if (!templateId || !name) { res.status(400).json({ error: "ValidationError", message: "templateId and name are required" }); return; }
    res.status(201).json(await service.importer.importFromTemplate(req.auth!.userId, templateId, { name, projectId }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Skill CRUD ───────────────────────────────────────────────────────────────

router.get("/api/skills", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const search = req.query["search"] as string | undefined;
    res.json(await service.listSkills(req.auth!.userId, limit, offset, search));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createSkill(req.auth!.userId, req.body as object));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/skills/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getSkill(Number(req.params["id"]))); }
  catch (err) { res.status(404).json({ error: "NotFound", message: String(err) }); }
});

router.patch("/api/skills/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateSkill(Number(req.params["id"]), req.auth!.userId, req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/:id", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteSkill(Number(req.params["id"]), req.auth!.userId); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.duplicateSkill(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.publishSkill(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.archiveSkill(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.restoreSkill(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Levels ───────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/levels", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getLevels(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/levels", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.upsertLevel(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/levels/:levelId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteLevel(Number(req.params["levelId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Costs ────────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/costs", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getCosts(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/costs", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createCost(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/costs/:costId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateCost(Number(req.params["costId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/costs/:costId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteCost(Number(req.params["costId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Cooldowns ────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/cooldowns", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getCooldowns(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/cooldowns", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.upsertCooldown(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/cooldowns/:cdId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteCooldown(Number(req.params["cdId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Effects ──────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/effects", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getEffects(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/effects", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createEffect(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/effects/:effectId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateEffect(Number(req.params["effectId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/effects/:effectId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteEffect(Number(req.params["effectId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Buffs ────────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/buffs", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getBuffs(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/buffs", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createBuff(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/buffs/:buffId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateBuff(Number(req.params["buffId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/buffs/:buffId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteBuff(Number(req.params["buffId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Debuffs ──────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/debuffs", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDebuffs(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/debuffs", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createDebuff(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/debuffs/:debuffId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDebuff(Number(req.params["debuffId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/debuffs/:debuffId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDebuff(Number(req.params["debuffId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Projectiles ──────────────────────────────────────────────────────────────

router.get("/api/skills/:id/projectiles", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getProjectiles(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/projectiles", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createProjectile(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/projectiles/:projId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateProjectile(Number(req.params["projId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/projectiles/:projId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteProjectile(Number(req.params["projId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Hitboxes ─────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/hitboxes", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getHitboxes(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/hitboxes", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createHitbox(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/hitboxes/:hbId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteHitbox(Number(req.params["hbId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Animations ───────────────────────────────────────────────────────────────

router.get("/api/skills/:id/animations", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getAnimations(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/animations", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createAnimation(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/animations/:animId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateAnimation(Number(req.params["animId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/animations/:animId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteAnimation(Number(req.params["animId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Audio ────────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/audio", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getAudio(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/audio", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createAudio(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/audio/:audioId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateAudio(Number(req.params["audioId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/audio/:audioId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteAudio(Number(req.params["audioId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Visuals ──────────────────────────────────────────────────────────────────

router.get("/api/skills/:id/visuals", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getVisuals(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/visuals", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createVisual(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.patch("/api/skills/visuals/:visId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateVisual(Number(req.params["visId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/visuals/:visId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteVisual(Number(req.params["visId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Requirements ─────────────────────────────────────────────────────────────

router.get("/api/skills/:id/requirements", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getRequirements(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/requirements", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createRequirement(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/skills/requirements/:reqId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteRequirement(Number(req.params["reqId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Versions & History ───────────────────────────────────────────────────────

router.get("/api/skills/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getVersions(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/skills/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.getHistory(Number(req.params["id"]), limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

router.get("/api/skills/:id/statistics", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getStatistics(Number(req.params["id"])) ?? {}); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Validation ───────────────────────────────────────────────────────────────

router.post("/api/skills/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.validator.validate(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Export ───────────────────────────────────────────────────────────────────

router.post("/api/skills/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try { res.json({ payload: await service.exporter.exportToJson(Number(req.params["id"]), req.auth!.userId) }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/skills/:id/exports", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getExports(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Runtime / Simulation ─────────────────────────────────────────────────────

router.post("/api/skills/:id/simulate", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateCast(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/damage", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateDamage(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/heal", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateHeal(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/cooldown", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateCooldown(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/combo", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateCombo(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/passive", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulatePassive(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/skills/:id/simulate/aura", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateAura(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

export default router;
