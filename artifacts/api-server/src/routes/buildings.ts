import { Router } from "express";
import { BuildingEditorService } from "../services/building-editor-service";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new BuildingEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/buildings/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates ────────────────────────────────────────────────────────────────
router.get("/buildings/templates/global", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(true)); } catch (e) { next(e); }
});

router.get("/buildings/templates/my", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(false)); } catch (e) { next(e); }
});

router.delete("/buildings/templates/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteTemplate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Import (top-level) ───────────────────────────────────────────────────────
router.post("/buildings/import", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importJson(req.body.buildingId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/import/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importTemplate(req.body.buildingId, req.body.templateId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/import/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importPackage(req.body.buildingId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Bookmarks ────────────────────────────────────────────────────────────────
router.get("/buildings/bookmarks", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.listBookmarks(req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/bookmarks", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.addBookmark(req.auth!.userId, req.body.buildingId, req.body.label)); } catch (e) { next(e); }
});

router.delete("/buildings/bookmarks/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteBookmark(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Building CRUD ────────────────────────────────────────────────────────────
router.get("/buildings", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit, offset, search } = req.query;
    res.json(await svc.listBuildings(req.auth!.userId, Number(limit ?? 20), Number(offset ?? 0), search as string | undefined));
  } catch (e) { next(e); }
});

router.post("/buildings", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createBuilding(req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBuilding(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/buildings/:id/full", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFullBuilding(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/buildings/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updateBuilding(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.deleteBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Building Actions ─────────────────────────────────────────────────────────
router.post("/buildings/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.duplicateBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.forkBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archiveBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restoreBuilding(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/snapshot", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createSnapshot(Number(req.params.id), req.auth!.userId, req.body.label ?? "snapshot")); } catch (e) { next(e); }
});

// ─── Floors ───────────────────────────────────────────────────────────────────
router.get("/buildings/:id/floors", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listFloors(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/floors", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createFloor(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/floors/:floorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFloor(Number(req.params.floorId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/floors/:floorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateFloor(Number(req.params.floorId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/floors/:floorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteFloor(Number(req.params.floorId))); } catch (e) { next(e); }
});

// ─── Rooms ────────────────────────────────────────────────────────────────────
router.get("/buildings/:id/rooms", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRooms(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/rooms", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createRoom(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/rooms/:roomId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRoom(Number(req.params.roomId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/rooms/:roomId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateRoom(Number(req.params.roomId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/rooms/:roomId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteRoom(Number(req.params.roomId))); } catch (e) { next(e); }
});

// ─── Doors ────────────────────────────────────────────────────────────────────
router.get("/buildings/:id/doors", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listDoors(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/doors", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createDoor(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/doors/:doorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getDoor(Number(req.params.doorId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/doors/:doorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateDoor(Number(req.params.doorId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/doors/:doorId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteDoor(Number(req.params.doorId))); } catch (e) { next(e); }
});

// ─── Windows ──────────────────────────────────────────────────────────────────
router.get("/buildings/:id/windows", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listWindows(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/windows", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createWindow(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/windows/:windowId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getWindow(Number(req.params.windowId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/windows/:windowId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateWindow(Number(req.params.windowId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/windows/:windowId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteWindow(Number(req.params.windowId))); } catch (e) { next(e); }
});

// ─── Furniture ────────────────────────────────────────────────────────────────
router.get("/buildings/:id/furniture", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listFurniture(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/furniture", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createFurniture(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/furniture/:furnitureId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFurniture(Number(req.params.furnitureId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/furniture/:furnitureId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateFurniture(Number(req.params.furnitureId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/furniture/:furnitureId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteFurniture(Number(req.params.furnitureId))); } catch (e) { next(e); }
});

// ─── Utilities ────────────────────────────────────────────────────────────────
router.get("/buildings/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listUtilities(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createUtility(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getUtility(Number(req.params.utilityId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateUtility(Number(req.params.utilityId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/utilities/:utilityId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteUtility(Number(req.params.utilityId))); } catch (e) { next(e); }
});

// ─── NPCs ─────────────────────────────────────────────────────────────────────
router.get("/buildings/:id/npcs", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listNpcs(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/npcs", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createNpc(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.get("/buildings/:id/npcs/:npcId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getNpc(Number(req.params.npcId))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/npcs/:npcId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateNpc(Number(req.params.npcId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/npcs/:npcId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteNpc(Number(req.params.npcId))); } catch (e) { next(e); }
});

// ─── Permissions ──────────────────────────────────────────────────────────────
router.get("/buildings/:id/permissions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listPermissions(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/permissions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createPermission(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/buildings/:id/permissions/:permId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updatePermission(Number(req.params.permId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/permissions/:permId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deletePermission(Number(req.params.permId))); } catch (e) { next(e); }
});

// ─── Security ─────────────────────────────────────────────────────────────────
router.get("/buildings/:id/security", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getSecurity(Number(req.params.id))); } catch (e) { next(e); }
});

router.patch("/buildings/:id/security", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSecurity(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── Spawnpoints ──────────────────────────────────────────────────────────────
router.get("/buildings/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listSpawnpoints(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/spawnpoints", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createSpawnpoint(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/buildings/:id/spawnpoints/:spawnId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateSpawnpoint(Number(req.params.spawnId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/spawnpoints/:spawnId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteSpawnpoint(Number(req.params.spawnId))); } catch (e) { next(e); }
});

// ─── Events ───────────────────────────────────────────────────────────────────
router.get("/buildings/:id/events", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listEvents(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/events", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createEvent(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.patch("/buildings/:id/events/:eventId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateEvent(Number(req.params.eventId), req.body)); } catch (e) { next(e); }
});

router.delete("/buildings/:id/events/:eventId", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteEvent(Number(req.params.eventId))); } catch (e) { next(e); }
});

// ─── Versions / History ───────────────────────────────────────────────────────
router.get("/buildings/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listVersions(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/buildings/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listHistory(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Statistics ───────────────────────────────────────────────────────────────
router.get("/buildings/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Validation ───────────────────────────────────────────────────────────────
router.get("/buildings/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.post("/buildings/:id/export/json", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportJson(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/export/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportTemplate(Number(req.params.id), req.body.name, req.body.description, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/export/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportPackage(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

router.get("/buildings/:id/exports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listExports(Number(req.params.id))); } catch (e) { next(e); }
});

router.get("/buildings/:id/imports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listImports(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Runtime / Simulation ─────────────────────────────────────────────────────
router.get("/buildings/:id/runtime", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRuntime(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/start", requireAuth, async (req, res, next) => {
  try { res.json(await svc.startSimulation(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/stop", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.stopSimulation(req.body.sessionId, req.auth!.userId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/open", requireAuth, async (req, res, next) => {
  try { res.json(await svc.openBuilding(req.body.sessionId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/close", requireAuth, async (req, res, next) => {
  try { res.json(await svc.closeBuilding(req.body.sessionId)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/power", requireAuth, async (req, res, next) => {
  try { res.json(await svc.setPower(req.body.sessionId, req.body.state)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/water", requireAuth, async (req, res, next) => {
  try { res.json(await svc.setWater(req.body.sessionId, req.body.on)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/lighting", requireAuth, async (req, res, next) => {
  try { res.json(await svc.setLighting(req.body.sessionId, req.body.on)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/security", requireAuth, async (req, res, next) => {
  try { res.json(await svc.setSecurityLevel(req.body.sessionId, req.body.level)); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/emergency", requireAuth, async (req, res, next) => {
  try { res.json(await svc.triggerEmergency(req.body.sessionId, req.body.type ?? "fire")); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/spawn-visitors", requireAuth, async (req, res, next) => {
  try { res.json(await svc.spawnVisitors(req.body.sessionId, Number(req.body.count ?? 5))); } catch (e) { next(e); }
});

router.post("/buildings/:id/runtime/tick", requireAuth, async (req, res, next) => {
  try { res.json(await svc.tickSimulation(req.body.sessionId)); } catch (e) { next(e); }
});

router.get("/buildings/:id/stream", requireAuth, async (req, res, next) => {
  try { res.json(await svc.streamBuilding(Number(req.params.id))); } catch (e) { next(e); }
});

export default router;
