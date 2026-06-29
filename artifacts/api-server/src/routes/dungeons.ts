import { Router } from "express";
import { DungeonEditorService } from "../services/dungeon-editor-service";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new DungeonEditorService();

// ─── Dashboard ───────────────────────────────────────────────────────────────

router.get("/api/dungeons/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Dungeon CRUD ────────────────────────────────────────────────────────────

router.get("/api/dungeons", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    const search = req.query.search as string | undefined;
    res.json(await svc.listDungeons(req.auth!.userId, limit, offset, search));
  } catch (e) { next(e); }
});

router.post("/api/dungeons", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.status(201).json(await svc.createDungeon(req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.get("/api/dungeons/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const dungeon = await svc.getDungeon(Number(req.params.id));
    if (!dungeon) return res.status(404).json({ error: "Dungeon not found" });
    return res.json(dungeon);
  } catch (e) { return next(e); }
});

router.get("/api/dungeons/:id/full", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getFullDungeon(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updateDungeon(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { await svc.deleteDungeon(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Lifecycle ───────────────────────────────────────────────────────────────

router.post("/api/dungeons/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.status(201).json(await svc.duplicateDungeon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.status(201).json(await svc.forkDungeon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishDungeon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archiveDungeon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restoreDungeon(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates ───────────────────────────────────────────────────────────────

router.get("/api/dungeons/templates/global", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getGlobalTemplates()); } catch (e) { next(e); }
});

router.get("/api/dungeons/templates/my", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.listTemplates(req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/templates", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    res.status(201).json(await svc.createTemplate({ ...req.body, dungeonId: id, createdBy: req.auth!.userId }));
  } catch (e) { next(e); }
});

// ─── Rooms ───────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/rooms", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRooms(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/rooms", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createRoom({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/rooms/:roomId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateRoom(Number(req.params.roomId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/rooms/:roomId", requireAuth, async (req, res, next) => {
  try { await svc.deleteRoom(Number(req.params.roomId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Connections ─────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/connections", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getConnections(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/connections", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createConnection({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/connections/:connId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateConnection(Number(req.params.connId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/connections/:connId", requireAuth, async (req, res, next) => {
  try { await svc.deleteConnection(Number(req.params.connId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Spawn Points ─────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSpawnpoints(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createSpawnpoint({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/spawnpoints/:spId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpawnpoint(Number(req.params.spId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/spawnpoints/:spId", requireAuth, async (req, res, next) => {
  try { await svc.deleteSpawnpoint(Number(req.params.spId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Bosses ──────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/bosses", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBosses(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/bosses", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createBoss({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/bosses/:bossId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateBoss(Number(req.params.bossId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/bosses/:bossId", requireAuth, async (req, res, next) => {
  try { await svc.deleteBoss(Number(req.params.bossId)); res.status(204).send(); } catch (e) { next(e); }
});

// Simulate boss
router.post("/api/dungeons/:id/bosses/:bossId/simulate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateBoss(Number(req.params.id), Number(req.params.bossId))); } catch (e) { next(e); }
});

// ─── Monsters ─────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/monsters", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getMonsters(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/monsters", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createMonster({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/monsters/:mId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateMonster(Number(req.params.mId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/monsters/:mId", requireAuth, async (req, res, next) => {
  try { await svc.deleteMonster(Number(req.params.mId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Traps ───────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/traps", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getTraps(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/traps", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createTrap({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/traps/:trapId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateTrap(Number(req.params.trapId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/traps/:trapId", requireAuth, async (req, res, next) => {
  try { await svc.deleteTrap(Number(req.params.trapId)); res.status(204).send(); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/traps/:trapId/simulate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateTrap(Number(req.params.id), Number(req.params.trapId))); } catch (e) { next(e); }
});

// ─── Puzzles ─────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/puzzles", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getPuzzles(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/puzzles", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createPuzzle({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/puzzles/:pId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updatePuzzle(Number(req.params.pId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/puzzles/:pId", requireAuth, async (req, res, next) => {
  try { await svc.deletePuzzle(Number(req.params.pId)); res.status(204).send(); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/puzzles/:pId/simulate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulatePuzzle(Number(req.params.id), Number(req.params.pId))); } catch (e) { next(e); }
});

// ─── Rewards ─────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/rewards", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRewards(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/rewards", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createReward({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/rewards/:rId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateReward(Number(req.params.rId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/rewards/:rId", requireAuth, async (req, res, next) => {
  try { await svc.deleteReward(Number(req.params.rId)); res.status(204).send(); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/loot/simulate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateLoot(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Checkpoints ─────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/checkpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getCheckpoints(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/checkpoints", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createCheckpoint({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/checkpoints/:cpId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateCheckpoint(Number(req.params.cpId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/checkpoints/:cpId", requireAuth, async (req, res, next) => {
  try { await svc.deleteCheckpoint(Number(req.params.cpId)); res.status(204).send(); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/checkpoints/:cpId/simulate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateCheckpoint(Number(req.params.id), Number(req.params.cpId))); } catch (e) { next(e); }
});

// ─── Requirements ────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/requirements", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRequirements(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/requirements", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createRequirement({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/requirements/:rId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateRequirement(Number(req.params.rId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/requirements/:rId", requireAuth, async (req, res, next) => {
  try { await svc.deleteRequirement(Number(req.params.rId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Events ──────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/events", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getEvents(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/events", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createEvent({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/events/:eId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateEvent(Number(req.params.eId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/events/:eId", requireAuth, async (req, res, next) => {
  try { await svc.deleteEvent(Number(req.params.eId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Scripts ─────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/scripts", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getScripts(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/scripts", requireAuth, async (req, res, next) => {
  try { res.status(201).json(await svc.createScript({ ...req.body, dungeonId: Number(req.params.id) })); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/scripts/:sId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateScript(Number(req.params.sId), req.body)); } catch (e) { next(e); }
});

router.delete("/api/dungeons/:id/scripts/:sId", requireAuth, async (req, res, next) => {
  try { await svc.deleteScript(Number(req.params.sId)); res.status(204).send(); } catch (e) { next(e); }
});

// ─── Versions ────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getVersions(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/versions", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { label, changelog } = req.body;
    res.status(201).json(await svc.createVersion(Number(req.params.id), req.auth!.userId, label, changelog));
  } catch (e) { next(e); }
});

router.get("/api/dungeons/:id/versions/:vId", requireAuth, async (req, res, next) => {
  try {
    const version = await svc.getVersion(Number(req.params.vId));
    if (!version) return res.status(404).json({ error: "Version not found" });
    return res.json(version);
  } catch (e) { return next(e); }
});

// ─── History ─────────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getHistory(Number(req.params.id), Number(req.query.limit ?? 50))); } catch (e) { next(e); }
});

// ─── Statistics ──────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/api/dungeons/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertStatistics(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── Validation ──────────────────────────────────────────────────────────────

router.post("/api/dungeons/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Import/Export ───────────────────────────────────────────────────────────

router.post("/api/dungeons/:id/export", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const type = (req.body.type as string) ?? "json";
    res.json(await svc.exportDungeon(Number(req.params.id), type, req.auth!.userId));
  } catch (e) { next(e); }
});

router.get("/api/dungeons/:id/exports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getExports(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/import", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { type = "json", data } = req.body;
    res.status(201).json(await svc.importDungeon(req.auth!.userId, type, data));
  } catch (e) { next(e); }
});

router.get("/api/dungeons/:id/imports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getImports(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Simulation ──────────────────────────────────────────────────────────────

router.get("/api/dungeons/:id/simulate/preview", requireAuth, async (req, res, next) => {
  try { res.json(await svc.previewDungeon(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/simulate/run", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateRun(Number(req.params.id), Number(req.body.partySize ?? 3))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/simulate/spawn/:roomId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateSpawn(Number(req.params.id), Number(req.params.roomId))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/simulate/loot", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateLoot(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/simulate/respawn", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateRespawn(Number(req.params.id), req.body.checkpointId)); } catch (e) { next(e); }
});

router.post("/api/dungeons/:id/simulate/reset", requireAuth, async (req, res, next) => {
  try { res.json(await svc.resetDungeon(Number(req.params.id))); } catch (e) { next(e); }
});

export default router;
