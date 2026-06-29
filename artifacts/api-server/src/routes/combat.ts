import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { CombatEditorService } from "../services/combat-editor-service";

const router = Router();
const service = new CombatEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/api/combat/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDashboard(req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Import ───────────────────────────────────────────────────────────────────
router.post("/api/combat/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, name, projectId } = req.body as { data: string; name?: string; projectId?: number };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    res.status(201).json(await service.importer.importFromTemplate(req.auth!.userId, data, { name, projectId }));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Combat CRUD ──────────────────────────────────────────────────────────────
router.get("/api/combat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const search = req.query["search"] as string | undefined;
    res.json(await service.listCombats(req.auth!.userId, limit, offset, search));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    res.status(201).json(await service.createCombat(req.auth!.userId, req.body as object));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/combat/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getCombat(Number(req.params["id"]))); }
  catch (err) { res.status(404).json({ error: "NotFound", message: String(err) }); }
});

router.patch("/api/combat/:id", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateCombat(Number(req.params["id"]), req.auth!.userId, req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.delete("/api/combat/:id", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteCombat(Number(req.params["id"]), req.auth!.userId); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.duplicateCombat(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.publishCombat(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.archiveCombat(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.restoreCombat(Number(req.params["id"]), req.auth!.userId)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.post("/api/combat/:id/snapshot", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.snapshotVersion(Number(req.params["id"]), req.auth!.userId, (req.body as { changelog?: string }).changelog)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Combat Rules ─────────────────────────────────────────────────────────────
router.get("/api/combat/:id/rules", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/rules", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/rules/:ruleId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateRule(Number(req.params["ruleId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/rules/:ruleId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteRule(Number(req.params["ruleId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Damage Formulas ──────────────────────────────────────────────────────────
router.get("/api/combat/:id/formulas", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDamageFormulas(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/formulas", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createDamageFormula(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/formulas/:fId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDamageFormula(Number(req.params["fId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/formulas/:fId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDamageFormula(Number(req.params["fId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Damage Modifiers ─────────────────────────────────────────────────────────
router.get("/api/combat/:id/modifiers", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDamageModifiers(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/modifiers", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createDamageModifier(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/modifiers/:mId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDamageModifier(Number(req.params["mId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/modifiers/:mId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDamageModifier(Number(req.params["mId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Defense Rules ────────────────────────────────────────────────────────────
router.get("/api/combat/:id/defense", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDefenseRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/defense", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createDefenseRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/defense/:dId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDefenseRule(Number(req.params["dId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/defense/:dId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDefenseRule(Number(req.params["dId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Resistances ──────────────────────────────────────────────────────────────
router.get("/api/combat/:id/resistances", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getResistances(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/resistances", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createResistance(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/resistances/:rId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateResistance(Number(req.params["rId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/resistances/:rId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteResistance(Number(req.params["rId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Hit Rules ────────────────────────────────────────────────────────────────
router.get("/api/combat/:id/hit-rules", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getHitRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/hit-rules", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createHitRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/hit-rules/:hId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateHitRule(Number(req.params["hId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/hit-rules/:hId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteHitRule(Number(req.params["hId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Critical Rules ───────────────────────────────────────────────────────────
router.get("/api/combat/:id/crits", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getCriticalRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/crits", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createCriticalRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/crits/:cId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateCriticalRule(Number(req.params["cId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/crits/:cId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteCriticalRule(Number(req.params["cId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Block Rules ──────────────────────────────────────────────────────────────
router.get("/api/combat/:id/blocks", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getBlockRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/blocks", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createBlockRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/blocks/:bId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateBlockRule(Number(req.params["bId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/blocks/:bId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteBlockRule(Number(req.params["bId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Dodge Rules ──────────────────────────────────────────────────────────────
router.get("/api/combat/:id/dodges", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getDodgeRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/dodges", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createDodgeRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/dodges/:dId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateDodgeRule(Number(req.params["dId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/dodges/:dId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteDodgeRule(Number(req.params["dId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Parry Rules ──────────────────────────────────────────────────────────────
router.get("/api/combat/:id/parries", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getParryRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/parries", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createParryRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/parries/:pId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateParryRule(Number(req.params["pId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/parries/:pId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteParryRule(Number(req.params["pId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Combo Rules ──────────────────────────────────────────────────────────────
router.get("/api/combat/:id/combos", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getComboRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/combos", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createComboRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/combos/:cId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateComboRule(Number(req.params["cId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/combos/:cId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteComboRule(Number(req.params["cId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Status Effects ───────────────────────────────────────────────────────────
router.get("/api/combat/:id/status", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getStatusEffects(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/status", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createStatusEffect(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/status/:sId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateStatusEffect(Number(req.params["sId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/status/:sId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteStatusEffect(Number(req.params["sId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

router.get("/api/combat/status/:sId/stacks", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getStatusStacks(Number(req.params["sId"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/status/:sId/stacks", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.upsertStatusStack(Number(req.params["sId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/status/stacks/:stackId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteStatusStack(Number(req.params["stackId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Threat Rules ─────────────────────────────────────────────────────────────
router.get("/api/combat/:id/threat", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getThreatRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/threat", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createThreatRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/threat/:tId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateThreatRule(Number(req.params["tId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/threat/:tId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteThreatRule(Number(req.params["tId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Respawn Rules ────────────────────────────────────────────────────────────
router.get("/api/combat/:id/respawn", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getRespawnRules(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/respawn", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createRespawnRule(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/respawn/:rId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateRespawnRule(Number(req.params["rId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/respawn/:rId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteRespawnRule(Number(req.params["rId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Combat Zones ─────────────────────────────────────────────────────────────
router.get("/api/combat/:id/zones", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getCombatZones(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/zones", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createCombatZone(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/zones/:zId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateCombatZone(Number(req.params["zId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/zones/:zId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteCombatZone(Number(req.params["zId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Target Filters ───────────────────────────────────────────────────────────
router.get("/api/combat/:id/filters", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getTargetFilters(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/filters", requireAuth, async (req: AuthRequest, res) => {
  try { res.status(201).json(await service.createTargetFilter(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.patch("/api/combat/filters/:fId", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.updateTargetFilter(Number(req.params["fId"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.delete("/api/combat/filters/:fId", requireAuth, async (req: AuthRequest, res) => {
  try { await service.deleteTargetFilter(Number(req.params["fId"])); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Versions & History ───────────────────────────────────────────────────────
router.get("/api/combat/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.getVersions(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.get("/api/combat/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    res.json(await service.getHistory(Number(req.params["id"]), limit, offset));
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Validation ───────────────────────────────────────────────────────────────
router.post("/api/combat/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.validator.validate(Number(req.params["id"]))); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.post("/api/combat/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try { res.json({ payload: await service.exporter.exportToJson(Number(req.params["id"]), req.auth!.userId) }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/export/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const name = (req.body as { name?: string }).name ?? "template";
    res.json({ payload: await service.exporter.exportAsTemplate(Number(req.params["id"]), req.auth!.userId, name) });
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/export/package", requireAuth, async (req: AuthRequest, res) => {
  try { res.json({ payload: await service.exporter.exportAsPackage(Number(req.params["id"]), req.auth!.userId) }); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

// ─── Simulation ───────────────────────────────────────────────────────────────
router.post("/api/combat/:id/simulate/attack", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateAttack(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/defense", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateDefense(Number(Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"]), req.body as any)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/crit", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateCrit(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/dodge", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateDodge(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/block", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateBlock(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/parry", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateParry(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/combo", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateCombo(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/aggro", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateAggro(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/status", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateStatus(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/death", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateDeath(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});
router.post("/api/combat/:id/simulate/respawn", requireAuth, async (req: AuthRequest, res) => {
  try { res.json(await service.runtime.simulateRespawn(Number(req.params["id"]), req.body as object)); }
  catch (err) { res.status(500).json({ error: "InternalError", message: String(err) }); }
});

export default router;
