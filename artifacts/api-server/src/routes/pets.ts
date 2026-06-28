import { Router } from "express";
import { PetEditorService } from "../services/pet-editor-service";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new PetEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/api/pets/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Import (top-level) ───────────────────────────────────────────────────────
router.post("/api/pets/import", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importJson(req.body.petId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/import/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importTemplate(req.body.petId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/import/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importPackage(req.body.petId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates (global) ───────────────────────────────────────────────────────
router.get("/api/pets/templates/global", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(true)); } catch (e) { next(e); }
});

router.get("/api/pets/templates/my", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(false)); } catch (e) { next(e); }
});

// ─── Species ─────────────────────────────────────────────────────────────────
router.get("/api/pets/species", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.listSpecies(Number(req.query.projectId ?? 0))); } catch (e) { next(e); }
});

router.post("/api/pets/species", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createSpecies({ ...req.body, projectId: req.body.projectId ?? 0 })); } catch (e) { next(e); }
});

router.get("/api/pets/species/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSpecies(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/api/pets/species/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpecies(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.delete("/api/pets/species/:id", requireAuth, async (req, res, next) => {
  try { await svc.deleteSpecies(Number(req.params.id)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Pet CRUD ─────────────────────────────────────────────────────────────────
router.get("/api/pets", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit, offset, search } = req.query;
    res.json(await svc.listPets(req.auth!.userId, Number(limit ?? 20), Number(offset ?? 0), search as string | undefined));
  } catch (e) { next(e); }
});

router.post("/api/pets", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createPet(req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.get("/api/pets/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getPet(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/api/pets/:id/full", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFullPet(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/api/pets/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updatePet(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.delete("/api/pets/:id", requireAuth, async (req, res, next) => {
  try { await svc.deletePet(Number(req.params.id)); res.json({ ok: true }); } catch (e) { next(e); }
});

router.post("/api/pets/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.duplicatePet(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.forkPet(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishPet(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archivePet(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restorePet(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates (per pet) ──────────────────────────────────────────────────────
router.post("/api/pets/:id/templates", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.addTemplate({ petId: Number(req.params.id), createdBy: req.auth!.userId, ...req.body })); } catch (e) { next(e); }
});

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/stats", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStats(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/stats", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertStats({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Growth ───────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/growth", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getGrowth(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/growth", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertGrowth({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Levels ───────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/levels", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getLevels(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/levels", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertLevel({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.delete("/api/pets/:id/levels/:levelId", requireAuth, async (req, res, next) => {
  try { await svc.deleteLevel(Number(req.params.levelId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Skills ───────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/skills", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSkills(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/skills", requireAuth, async (req, res, next) => {
  try { res.json(await svc.addSkill({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/pets/:id/skills/:skillId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSkill(Number(req.params.skillId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/pets/:id/skills/:skillId", requireAuth, async (req, res, next) => {
  try { await svc.deleteSkill(Number(req.params.skillId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Equipment ────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/equipment", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getEquipment(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/equipment", requireAuth, async (req, res, next) => {
  try { res.json(await svc.equipItem({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.delete("/api/pets/:id/equipment/:equipId", requireAuth, async (req, res, next) => {
  try { await svc.unequipItem(Number(req.params.equipId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Loyalty ─────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/loyalty", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getLoyalty(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/loyalty", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertLoyalty({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Hunger ──────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/hunger", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getHunger(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/hunger", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertHunger({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Personality ─────────────────────────────────────────────────────────────
router.get("/api/pets/:id/personality", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getPersonality(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/personality", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertPersonality({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Evolution ────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/evolutions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getEvolutions(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/evolutions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.addEvolution({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/pets/:id/evolutions/:evoId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateEvolution(Number(req.params.evoId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/pets/:id/evolutions/:evoId", requireAuth, async (req, res, next) => {
  try { await svc.deleteEvolution(Number(req.params.evoId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Breeding ─────────────────────────────────────────────────────────────────
router.get("/api/pets/:id/breeding", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBreeding(Number(req.params.id))); } catch (e) { next(e); }
});

router.put("/api/pets/:id/breeding", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertBreeding({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

// ─── Spawn Rules ──────────────────────────────────────────────────────────────
router.get("/api/pets/:id/spawn-rules", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSpawnRules(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/spawn-rules", requireAuth, async (req, res, next) => {
  try { res.json(await svc.addSpawnRule({ ...req.body, petId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/pets/:id/spawn-rules/:ruleId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpawnRule(Number(req.params.ruleId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/pets/:id/spawn-rules/:ruleId", requireAuth, async (req, res, next) => {
  try { await svc.deleteSpawnRule(Number(req.params.ruleId)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Versions / History / Statistics ─────────────────────────────────────────
router.get("/api/pets/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getVersions(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/api/pets/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getHistory(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/api/pets/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Validation ──────────────────────────────────────────────────────────────
router.get("/api/pets/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Export ──────────────────────────────────────────────────────────────────
router.post("/api/pets/:id/export/json", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportJson(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/export/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportTemplate(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/export/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportPackage(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Simulation ───────────────────────────────────────────────────────────────
router.post("/api/pets/:id/simulate/spawn", requireAuth, async (req, res, next) => {
  try { res.json(await svc.spawnPet(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/despawn", requireAuth, async (req, res, next) => {
  try { res.json(await svc.despawnPet(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/summon", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.summon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/dismiss", requireAuth, async (req, res, next) => {
  try { res.json(await svc.dismiss(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/feed", requireAuth, async (req, res, next) => {
  try { res.json(await svc.feed(Number(req.params.id), req.body.foodType ?? "meat", req.body.amount)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/gain-exp", requireAuth, async (req, res, next) => {
  try { res.json(await svc.gainExp(Number(req.params.id), req.body.amount ?? 100)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/level-up", requireAuth, async (req, res, next) => {
  try { res.json(await svc.levelUp(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/evolve", requireAuth, async (req, res, next) => {
  try { res.json(await svc.evolve(Number(req.params.id), req.body.targetSpeciesId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/breed", requireAuth, async (req, res, next) => {
  try { res.json(await svc.breed(Number(req.params.id), req.body.partnerId)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/combat", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateCombat(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/growth", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateGrowth(Number(req.params.id), req.body.levels ?? 10)); } catch (e) { next(e); }
});

router.post("/api/pets/:id/simulate/loyalty", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateLoyalty(Number(req.params.id), req.body.actions ?? [])); } catch (e) { next(e); }
});

export default router;
