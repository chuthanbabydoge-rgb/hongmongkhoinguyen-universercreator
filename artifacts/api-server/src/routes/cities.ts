import { Router } from "express";
import { CityEditorService } from "../services/city-editor-service";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new CityEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/cities/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates (global) ───────────────────────────────────────────────────────
router.get("/cities/templates/global", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(true)); } catch (e) { next(e); }
});

router.get("/cities/templates/my", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(false)); } catch (e) { next(e); }
});

router.delete("/cities/templates/:id", requireAuth, async (req, res, next) => {
  try { await svc.deleteTemplate(Number(req.params.id)); res.json({ ok: true }); } catch (e) { next(e); }
});

// ─── Import (top-level) ───────────────────────────────────────────────────────
router.post("/cities/import", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importJson(req.body.cityId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/import/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importTemplate(req.body.cityId, req.body.templateId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/import/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importPackage(req.body.cityId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

// ─── City CRUD ────────────────────────────────────────────────────────────────
router.get("/cities", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit, offset, search } = req.query;
    res.json(await svc.listCities(req.auth!.userId, Number(limit ?? 20), Number(offset ?? 0), search as string | undefined));
  } catch (e) { next(e); }
});

router.post("/cities", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createCity(req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getCity(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/cities/:id/full", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFullCity(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/cities/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updateCity(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.deleteCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── City Actions ─────────────────────────────────────────────────────────────
router.post("/cities/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.duplicateCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.forkCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archiveCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restoreCity(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/snapshot", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createSnapshot(Number(req.params.id), req.auth!.userId, req.body.label)); } catch (e) { next(e); }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get("/cities/:id/settings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSettings(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/cities/:id/settings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSettings(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── Districts ────────────────────────────────────────────────────────────────
router.get("/cities/:id/districts", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listDistricts(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/districts", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createDistrict(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/districts/:districtId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getDistrict(Number(req.params.districtId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/districts/:districtId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateDistrict(Number(req.params.districtId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/districts/:districtId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteDistrict(Number(req.params.districtId))); } catch (e) { next(e); }
});

// ─── Zones ────────────────────────────────────────────────────────────────────
router.get("/cities/:id/zones", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listZones(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/zones", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createZone(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/zones/:zoneId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getZone(Number(req.params.zoneId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/zones/:zoneId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateZone(Number(req.params.zoneId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/zones/:zoneId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteZone(Number(req.params.zoneId))); } catch (e) { next(e); }
});

// ─── Roads ────────────────────────────────────────────────────────────────────
router.get("/cities/:id/roads", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRoads(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/roads", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createRoad(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/roads/:roadId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRoad(Number(req.params.roadId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/roads/:roadId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateRoad(Number(req.params.roadId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/roads/:roadId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteRoad(Number(req.params.roadId))); } catch (e) { next(e); }
});

// ─── Intersections ────────────────────────────────────────────────────────────
router.get("/cities/:id/intersections", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listIntersections(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/intersections", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createIntersection(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/cities/:id/intersections/:intId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateIntersection(Number(req.params.intId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/intersections/:intId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteIntersection(Number(req.params.intId))); } catch (e) { next(e); }
});

// ─── Buildings ────────────────────────────────────────────────────────────────
router.get("/cities/:id/buildings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listBuildings(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/buildings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createBuilding(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/buildings/:buildingId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBuilding(Number(req.params.buildingId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/buildings/:buildingId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateBuilding(Number(req.params.buildingId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/buildings/:buildingId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteBuilding(Number(req.params.buildingId))); } catch (e) { next(e); }
});

// ─── Utilities ────────────────────────────────────────────────────────────────
router.get("/cities/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listUtilities(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createUtility(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getUtility(Number(req.params.utilityId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateUtility(Number(req.params.utilityId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteUtility(Number(req.params.utilityId))); } catch (e) { next(e); }
});

// ─── Transport ────────────────────────────────────────────────────────────────
router.get("/cities/:id/transport", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listTransport(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/transport", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createTransport(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/transport/:transportId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getTransport(Number(req.params.transportId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/transport/:transportId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateTransport(Number(req.params.transportId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/transport/:transportId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteTransport(Number(req.params.transportId))); } catch (e) { next(e); }
});

// ─── Population ───────────────────────────────────────────────────────────────
router.get("/cities/:id/population", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getPopulation(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/cities/:id/population", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updatePopulation(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── Services ─────────────────────────────────────────────────────────────────
router.get("/cities/:id/services", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listServices(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/services", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createService(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/cities/:id/services/:serviceId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getService(Number(req.params.serviceId))); } catch (e) { next(e); }
});

router.patch("/cities/:id/services/:serviceId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateService(Number(req.params.serviceId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/services/:serviceId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteService(Number(req.params.serviceId))); } catch (e) { next(e); }
});

// ─── Spawnpoints ──────────────────────────────────────────────────────────────
router.get("/cities/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listSpawnpoints(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createSpawnpoint(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/cities/:id/spawnpoints/:spawnId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpawnpoint(Number(req.params.spawnId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/spawnpoints/:spawnId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteSpawnpoint(Number(req.params.spawnId))); } catch (e) { next(e); }
});

// ─── Landmarks ────────────────────────────────────────────────────────────────
router.get("/cities/:id/landmarks", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listLandmarks(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/landmarks", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createLandmark(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/cities/:id/landmarks/:landmarkId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateLandmark(Number(req.params.landmarkId), req.body)); } catch (e) { next(e); }
});

router.delete("/cities/:id/landmarks/:landmarkId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteLandmark(Number(req.params.landmarkId))); } catch (e) { next(e); }
});

// ─── Versions ─────────────────────────────────────────────────────────────────
router.get("/cities/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listVersions(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── History ──────────────────────────────────────────────────────────────────
router.get("/cities/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listHistory(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Statistics ───────────────────────────────────────────────────────────────
router.get("/cities/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Validation ───────────────────────────────────────────────────────────────
router.get("/cities/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.post("/cities/:id/export/json", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportJson(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/export/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportTemplate(Number(req.params.id), req.body.name, req.body.description, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/export/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportPackage(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.get("/cities/:id/exports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listExports(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/cities/:id/imports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listImports(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Runtime / Simulation ─────────────────────────────────────────────────────
router.get("/cities/:id/runtime", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRuntime(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/start", requireAuth, async (req, res, next) => {
  try { res.json(await svc.startSimulation(Number(req.params.id), req.body.sessionId)); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/stop", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.stopSimulation(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/tick", requireAuth, async (req, res, next) => {
  try { res.json(await svc.tickSimulation(req.body.sessionId)); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/spawn-citizens", requireAuth, async (req, res, next) => {
  try { res.json(await svc.spawnCitizens(req.body.sessionId, Number(req.body.count ?? 10))); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/traffic", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateTraffic(req.body.sessionId)); } catch (e) { next(e); }
});

router.post("/cities/:id/simulate/economy", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateEconomy(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/cities/:id/runtime/emergency", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateEmergency(req.body.sessionId, req.body.type ?? "fire")); } catch (e) { next(e); }
});

export default router;
