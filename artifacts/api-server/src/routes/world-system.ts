import { Router } from "express";
import { worldSystemRepo } from "../repositories/world-system-repository";
import { worldSystemService } from "../services/world-system-service";
import { worldRuntimeEngine } from "../services/world-runtime-engine";

const router = Router();
const uid = () => 1; // dev user

// ── World Instances ───────────────────────────────────────────────────────────
router.get("/world-system", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);
    const filters: Record<string, unknown> = {};
    if (req.query.runtimeState) filters.runtimeState = req.query.runtimeState;
    const [items, total] = await Promise.all([worldSystemRepo.listWorlds(limit, offset, filters), worldSystemRepo.countWorlds()]);
    res.json({ items, total, limit, offset });
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system", async (req, res) => {
  try { res.status(201).json(await worldSystemService.createWorld(req.body, uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id", async (req, res) => {
  try {
    const world = await worldSystemRepo.getWorld(Number(req.params.id));
    if (!world) return res.status(404).json({ error: "Not found" });
    res.json(world);
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id", async (req, res) => {
  try { res.json(await worldSystemRepo.updateWorld(Number(req.params.id), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id", async (req, res) => {
  try { res.json(await worldSystemRepo.deleteWorld(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/duplicate", async (req, res) => {
  try { res.status(201).json(await worldSystemService.duplicateWorld(Number(req.params.id), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/archive", async (req, res) => {
  try { res.json(await worldSystemService.archiveWorld(Number(req.params.id), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/publish", async (req, res) => {
  try { res.json(await worldSystemService.publishWorld(Number(req.params.id), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/restore/:versionId", async (req, res) => {
  try { res.json(await worldSystemService.restoreWorld(Number(req.params.id), Number(req.params.versionId), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/validate", async (req, res) => {
  try { res.json(await worldSystemService.validate(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Runtime ───────────────────────────────────────────────────────────────────
router.post("/world-system/:id/start", async (req, res) => {
  try { res.json(await worldSystemService.startWorld(Number(req.params.id), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/stop", async (req, res) => {
  try {
    const { sessionId } = req.body;
    res.json(await worldSystemService.stopWorld(Number(req.params.id), sessionId, uid()));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/runtime", async (req, res) => {
  try { res.json(await worldSystemRepo.listRuntimes(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/runtime/:sessionId/state", async (req, res) => {
  try { res.json(await worldRuntimeEngine.getWorldState(Number(req.params.id), req.params.sessionId)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Chunks ────────────────────────────────────────────────────────────────────
router.get("/world-system/:id/chunks", async (req, res) => {
  try { res.json(await worldSystemRepo.listChunks(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/chunks/load", async (req, res) => {
  try {
    const { chunkX, chunkY, chunkZ } = req.body;
    res.json(await worldRuntimeEngine.loadChunk(Number(req.params.id), chunkX, chunkY, chunkZ));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/chunks/unload", async (req, res) => {
  try {
    const { chunkX, chunkY } = req.body;
    res.json(await worldRuntimeEngine.unloadChunk(Number(req.params.id), chunkX, chunkY));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/chunks/:chunkId/state", async (req, res) => {
  try { res.json(await worldSystemRepo.updateChunkState(Number(req.params.chunkId), req.body.state)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Regions ───────────────────────────────────────────────────────────────────
router.get("/world-system/:id/regions", async (req, res) => {
  try { res.json(await worldSystemRepo.listRegions(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/regions", async (req, res) => {
  try { res.status(201).json(await worldSystemRepo.createRegion({ ...req.body, worldInstanceId: Number(req.params.id) })); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/regions/:regionId", async (req, res) => {
  try { res.json(await worldSystemRepo.updateRegion(Number(req.params.regionId), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id/regions/:regionId", async (req, res) => {
  try { res.json(await worldSystemRepo.deleteRegion(Number(req.params.regionId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Streaming ─────────────────────────────────────────────────────────────────
router.get("/world-system/:id/streaming", async (req, res) => {
  try { res.json(await worldSystemRepo.listStreaming(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/streaming/update", async (req, res) => {
  try {
    const { sessionId, ...data } = req.body;
    res.json(await worldRuntimeEngine.updateStreaming(Number(req.params.id), sessionId, data));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Spawnpoints ───────────────────────────────────────────────────────────────
router.get("/world-system/:id/spawnpoints", async (req, res) => {
  try { res.json(await worldSystemRepo.listSpawnpoints(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/spawnpoints", async (req, res) => {
  try { res.status(201).json(await worldSystemRepo.createSpawnpoint({ ...req.body, worldInstanceId: Number(req.params.id) })); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/spawnpoints/:spawnId", async (req, res) => {
  try { res.json(await worldSystemRepo.updateSpawnpoint(Number(req.params.spawnId), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id/spawnpoints/:spawnId", async (req, res) => {
  try { res.json(await worldSystemRepo.deleteSpawnpoint(Number(req.params.spawnId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/spawnpoints/spawn", async (req, res) => {
  try {
    const { entityType, entityRef, spawnpointId } = req.body;
    res.json(await worldRuntimeEngine.spawnEntity(Number(req.params.id), entityType, entityRef, spawnpointId));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/npcs/:npcId/respawn", async (req, res) => {
  try { res.json(await worldRuntimeEngine.respawnEntity(Number(req.params.id), Number(req.params.npcId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Teleports ─────────────────────────────────────────────────────────────────
router.get("/world-system/:id/teleports", async (req, res) => {
  try { res.json(await worldSystemRepo.listTeleports(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/teleports", async (req, res) => {
  try { res.status(201).json(await worldSystemRepo.createTeleport({ ...req.body, worldInstanceId: Number(req.params.id) })); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/teleports/:tpId", async (req, res) => {
  try { res.json(await worldSystemRepo.updateTeleport(Number(req.params.tpId), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id/teleports/:tpId", async (req, res) => {
  try { res.json(await worldSystemRepo.deleteTeleport(Number(req.params.tpId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Weather ───────────────────────────────────────────────────────────────────
router.get("/world-system/:id/weather", async (req, res) => {
  try { res.json(await worldSystemRepo.getWeather(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/weather/change", async (req, res) => {
  try { res.json(await worldRuntimeEngine.changeWeather(Number(req.params.id), req.body.weather, req.body.transitionDuration)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/weather/forecast", async (req, res) => {
  try { res.json(await worldRuntimeEngine.forecastWeather(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/weather/simulate", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateWeather(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Day/Night ─────────────────────────────────────────────────────────────────
router.get("/world-system/:id/daynight", async (req, res) => {
  try { res.json(await worldSystemRepo.getDayNight(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/daynight/set-time", async (req, res) => {
  try { res.json(await worldRuntimeEngine.setTime(Number(req.params.id), req.body.hour)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/daynight/pause", async (req, res) => {
  try { res.json(await worldRuntimeEngine.pauseTime(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/daynight/resume", async (req, res) => {
  try { res.json(await worldRuntimeEngine.resumeTime(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/daynight/speed", async (req, res) => {
  try { res.json(await worldRuntimeEngine.setTimeScale(Number(req.params.id), req.body.scale)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Portals ───────────────────────────────────────────────────────────────────
router.get("/world-system/:id/portals", async (req, res) => {
  try { res.json(await worldSystemRepo.listPortals(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/portals", async (req, res) => {
  try { res.status(201).json(await worldSystemRepo.createPortal({ ...req.body, worldInstanceId: Number(req.params.id) })); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/portals/:portalId", async (req, res) => {
  try { res.json(await worldSystemRepo.updatePortal(Number(req.params.portalId), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id/portals/:portalId", async (req, res) => {
  try { res.json(await worldSystemRepo.deletePortal(Number(req.params.portalId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/portals/:portalId/traverse", async (req, res) => {
  try { res.json(await worldRuntimeEngine.traversePortal(Number(req.params.id), Number(req.params.portalId), req.body.playerId ?? uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Events ────────────────────────────────────────────────────────────────────
router.get("/world-system/:id/events", async (req, res) => {
  try { res.json(await worldSystemRepo.listEvents(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/events", async (req, res) => {
  try { res.status(201).json(await worldSystemRepo.createEvent({ ...req.body, worldInstanceId: Number(req.params.id) })); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.patch("/world-system/:id/events/:eventId", async (req, res) => {
  try { res.json(await worldSystemRepo.updateEvent(Number(req.params.eventId), req.body)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/world-system/:id/events/:eventId", async (req, res) => {
  try { res.json(await worldSystemRepo.deleteEvent(Number(req.params.eventId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/events/:eventId/trigger", async (req, res) => {
  try { res.json(await worldRuntimeEngine.triggerEvent(Number(req.params.id), Number(req.params.eventId))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── States & Checkpoints ──────────────────────────────────────────────────────
router.get("/world-system/:id/states", async (req, res) => {
  try { res.json(await worldSystemRepo.listStates(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/save-state", async (req, res) => {
  try {
    const { sessionId, label } = req.body;
    res.json(await worldSystemService.saveState(Number(req.params.id), sessionId ?? `s_${Date.now()}`, uid(), label));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/checkpoints", async (req, res) => {
  try { res.json(await worldSystemRepo.listCheckpoints(Number(req.params.id), req.query.sessionId as string)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/checkpoints", async (req, res) => {
  try {
    const { sessionId, label } = req.body;
    res.json(await worldRuntimeEngine.createCheckpoint(Number(req.params.id), sessionId, label, uid()));
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/checkpoints/:cpId/rollback", async (req, res) => {
  try { res.json(await worldRuntimeEngine.rollbackToCheckpoint(Number(req.params.id), Number(req.params.cpId), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Players & NPCs ────────────────────────────────────────────────────────────
router.get("/world-system/:id/players", async (req, res) => {
  try { res.json(await worldSystemRepo.listPlayers(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.get("/world-system/:id/npcs", async (req, res) => {
  try { res.json(await worldSystemRepo.listNpcs(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Statistics ────────────────────────────────────────────────────────────────
router.get("/world-system/:id/statistics", async (req, res) => {
  try { res.json(await worldSystemRepo.getStatistics(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── History ───────────────────────────────────────────────────────────────────
router.get("/world-system/:id/history", async (req, res) => {
  try { res.json(await worldSystemRepo.listHistory(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Versions ──────────────────────────────────────────────────────────────────
router.get("/world-system/:id/versions", async (req, res) => {
  try { res.json(await worldSystemRepo.listVersions(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Export / Import ───────────────────────────────────────────────────────────
router.post("/world-system/:id/export", async (req, res) => {
  try { res.json(await worldSystemService.exportWorld(Number(req.params.id), uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/import", async (req, res) => {
  try { res.json(await worldSystemService.importWorld(Number(req.params.id), req.body.payload, uid())); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Simulation ────────────────────────────────────────────────────────────────
router.post("/world-system/:id/simulate/day", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateDay(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/simulate/weather", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateWeather(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/simulate/streaming", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateStreaming(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/simulate/portal", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulatePortal(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/simulate/respawn", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateRespawn(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

router.post("/world-system/:id/simulate/checkpoint", async (req, res) => {
  try { res.json(await worldRuntimeEngine.simulateCheckpoint(Number(req.params.id))); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

export default router;
