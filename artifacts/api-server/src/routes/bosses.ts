import { Router } from "express";
import { BossEditorService } from "../services/boss-editor-service";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new BossEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/api/bosses/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates (global) ───────────────────────────────────────────────────────
router.get("/api/bosses/templates/global", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(true)); } catch (e) { next(e); }
});

router.get("/api/bosses/templates/my", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(false)); } catch (e) { next(e); }
});

router.delete("/api/bosses/templates/:id", requireAuth, async (req, res, next) => {
  try { await svc.deleteTemplate(Number(req.params.id)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Import (top-level) ───────────────────────────────────────────────────────
router.post("/api/bosses/import", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importJson(req.body.bossId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/import/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importTemplate(req.body.bossId, req.body.templateId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/import/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importPackage(req.body.bossId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Boss CRUD ────────────────────────────────────────────────────────────────
router.get("/api/bosses", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit, offset, search } = req.query;
    res.json(await svc.listBosses(req.auth!.userId, Number(limit ?? 20), Number(offset ?? 0), search as string | undefined));
  } catch (e) { next(e); }
});

router.post("/api/bosses", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createBoss(req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.get("/api/bosses/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBoss(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/api/bosses/:id/full", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFullBoss(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updateBoss(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.deleteBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Boss actions ─────────────────────────────────────────────────────────────
router.post("/api/bosses/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.duplicateBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.forkBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archiveBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restoreBoss(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/snapshot", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createSnapshot(Number(req.params.id), req.auth!.userId, req.body.label)); } catch (e) { next(e); }
});

// ─── Phases ───────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/phases", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listPhases(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/phases", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createPhase(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/phases/:phaseId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updatePhase(Number(req.params.phaseId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/phases/:phaseId", requireAuth, async (req, res, next) => {
  try { await svc.deletePhase(Number(req.params.phaseId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Skills ───────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/skills", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listSkills(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/skills", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createSkill(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/skills/:skillId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSkill(Number(req.params.skillId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/skills/:skillId", requireAuth, async (req, res, next) => {
  try { await svc.deleteSkill(Number(req.params.skillId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Patterns ─────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/patterns", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listPatterns(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/patterns", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createPattern(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/patterns/:patternId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updatePattern(Number(req.params.patternId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/patterns/:patternId", requireAuth, async (req, res, next) => {
  try { await svc.deletePattern(Number(req.params.patternId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Attacks ──────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/attacks", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listAttacks(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/attacks", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createAttack(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/attacks/:attackId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateAttack(Number(req.params.attackId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/attacks/:attackId", requireAuth, async (req, res, next) => {
  try { await svc.deleteAttack(Number(req.params.attackId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Weak Points ──────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/weakpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listWeakpoints(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/weakpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createWeakpoint(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/weakpoints/:wpId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateWeakpoint(Number(req.params.wpId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/weakpoints/:wpId", requireAuth, async (req, res, next) => {
  try { await svc.deleteWeakpoint(Number(req.params.wpId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Enrage ───────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/enrage", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listEnrage(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/enrage", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createEnrage(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/enrage/:enrageId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateEnrage(Number(req.params.enrageId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/enrage/:enrageId", requireAuth, async (req, res, next) => {
  try { await svc.deleteEnrage(Number(req.params.enrageId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Loot ─────────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/loot", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listLoot(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/loot", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createLoot(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/loot/:lootId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateLoot(Number(req.params.lootId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/loot/:lootId", requireAuth, async (req, res, next) => {
  try { await svc.deleteLoot(Number(req.params.lootId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Rewards ──────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/rewards", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRewards(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/rewards", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createReward(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/rewards/:rewardId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateReward(Number(req.params.rewardId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/rewards/:rewardId", requireAuth, async (req, res, next) => {
  try { await svc.deleteReward(Number(req.params.rewardId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Spawn Rules ──────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/spawn-rules", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listSpawnRules(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/spawn-rules", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createSpawnRule(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/spawn-rules/:ruleId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpawnRule(Number(req.params.ruleId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/spawn-rules/:ruleId", requireAuth, async (req, res, next) => {
  try { await svc.deleteSpawnRule(Number(req.params.ruleId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Arenas ───────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/arenas", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listArenas(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/arenas", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createArena(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/api/bosses/:id/arenas/:arenaId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getArena(Number(req.params.arenaId))); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/arenas/:arenaId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateArena(Number(req.params.arenaId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/arenas/:arenaId", requireAuth, async (req, res, next) => {
  try { await svc.deleteArena(Number(req.params.arenaId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Cinematics ───────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/cinematics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listCinematics(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/cinematics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createCinematic(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/cinematics/:cinematicId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateCinematic(Number(req.params.cinematicId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/cinematics/:cinematicId", requireAuth, async (req, res, next) => {
  try { await svc.deleteCinematic(Number(req.params.cinematicId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Dialogues ────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/dialogues", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listDialogues(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/dialogues", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createDialogue(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/api/bosses/:id/dialogues/:dialogueId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateDialogue(Number(req.params.dialogueId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/bosses/:id/dialogues/:dialogueId", requireAuth, async (req, res, next) => {
  try { await svc.deleteDialogue(Number(req.params.dialogueId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Versions ─────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listVersions(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── History ──────────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listHistory(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Statistics ───────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Validation ───────────────────────────────────────────────────────────────
router.get("/api/bosses/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.post("/api/bosses/:id/export/json", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportJson(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/export/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportTemplate(Number(req.params.id), req.body.name, req.body.description, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/export/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportPackage(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.get("/api/bosses/:id/exports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listExports(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/api/bosses/:id/imports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listImports(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Runtime / Simulation ─────────────────────────────────────────────────────
router.get("/api/bosses/:id/runtime", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRuntime(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/spawn", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.spawnBoss(Number(req.params.id), req.body.sessionId, req.body.participantIds ?? [])); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/despawn", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.despawnBoss(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/enter-combat", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.enterCombat(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/exit-combat", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exitCombat(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/change-phase", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.changePhase(req.body.sessionId, req.body.phase, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/trigger-ultimate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.triggerUltimate(req.body.sessionId, req.body.skillRef, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/trigger-enrage", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.triggerEnrage(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/spawn-minions", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.spawnMinions(req.body.sessionId, req.body.minionIds ?? [], req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/drop-loot", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.dropLoot(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/simulate/battle", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateBattle(Number(req.params.id), Number(req.body.playerCount ?? 1), Number(req.body.playerLevel ?? 1))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/simulate/raid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateRaid(Number(req.params.id), Number(req.body.raidSize ?? 10), Number(req.body.averageLevel ?? 1))); } catch (e) { next(e); }
});

router.post("/api/bosses/:id/runtime/reset", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.resetBoss(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

export default router;
