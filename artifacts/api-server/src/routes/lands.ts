import { Router } from "express";
import { LandEditorService } from "../services/land-editor-service";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const svc = new LandEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/lands/dashboard", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getDashboard(req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Templates ────────────────────────────────────────────────────────────────
router.get("/lands/templates/global", requireAuth, async (_req, res, next) => {
  try { res.json(await svc.getTemplates(true)); } catch (e) { next(e); }
});
router.get("/lands/templates/my", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.getTemplates(false)); } catch (e) { next(e); }
});
router.post("/lands/templates", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createTemplate({ ...req.body, createdBy: req.auth!.userId })); } catch (e) { next(e); }
});
router.delete("/lands/templates/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteTemplate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Import ───────────────────────────────────────────────────────────────────
router.post("/lands/import", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importJson(req.body.landId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/import/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importTemplate(req.body.landId, req.body.templateId, req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/import/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.importPackage(req.body.landId, req.body.payload, req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Bookmarks ────────────────────────────────────────────────────────────────
router.get("/lands/bookmarks", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.listBookmarks(req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/bookmarks", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.addBookmark(req.auth!.userId, req.body.landId, req.body.label)); } catch (e) { next(e); }
});
router.delete("/lands/bookmarks/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteBookmark(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Land CRUD ────────────────────────────────────────────────────────────────
router.get("/lands", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { limit, offset, search } = req.query;
    res.json(await svc.listLands(req.auth!.userId, Number(limit ?? 20), Number(offset ?? 0), search as string | undefined));
  } catch (e) { next(e); }
});
router.post("/lands", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createLand(req.auth!.userId, req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getLand(Number(req.params.id))); } catch (e) { next(e); }
});
router.get("/lands/:id/full", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getFullLand(Number(req.params.id))); } catch (e) { next(e); }
});
router.put("/lands/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.updateLand(Number(req.params.id), req.auth!.userId, req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.deleteLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/duplicate", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.duplicateLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/fork", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.forkLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/publish", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.publishLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/archive", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.archiveLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/restore", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.restoreLand(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});

// ─── Parcels ──────────────────────────────────────────────────────────────────
router.get("/lands/:id/parcels", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listParcels(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/parcels", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createParcel(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/parcels/:pid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getParcel(Number(req.params.pid))); } catch (e) { next(e); }
});
router.put("/lands/:id/parcels/:pid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateParcel(Number(req.params.pid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/parcels/:pid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteParcel(Number(req.params.pid))); } catch (e) { next(e); }
});

// ─── Boundaries ───────────────────────────────────────────────────────────────
router.get("/lands/:id/boundaries", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listBoundaries(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/boundaries", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createBoundary(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/boundaries/:bid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getBoundary(Number(req.params.bid))); } catch (e) { next(e); }
});
router.put("/lands/:id/boundaries/:bid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateBoundary(Number(req.params.bid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/boundaries/:bid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteBoundary(Number(req.params.bid))); } catch (e) { next(e); }
});

// ─── Owners ───────────────────────────────────────────────────────────────────
router.get("/lands/:id/owners", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listOwners(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/owners", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createOwner(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.put("/lands/:id/owners/:oid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateOwner(Number(req.params.oid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/owners/:oid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteOwner(Number(req.params.oid))); } catch (e) { next(e); }
});

// ─── Zones ────────────────────────────────────────────────────────────────────
router.get("/lands/:id/zones", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listZones(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/zones", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createZone(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/zones/:zid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getZone(Number(req.params.zid))); } catch (e) { next(e); }
});
router.put("/lands/:id/zones/:zid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateZone(Number(req.params.zid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/zones/:zid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteZone(Number(req.params.zid))); } catch (e) { next(e); }
});

// ─── Terrain ──────────────────────────────────────────────────────────────────
router.get("/lands/:id/terrain", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getTerrain(Number(req.params.id))); } catch (e) { next(e); }
});
router.put("/lands/:id/terrain", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertTerrain(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── Utilities ────────────────────────────────────────────────────────────────
router.get("/lands/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listUtilities(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/utilities", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createUtility(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/utilities/:uid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getUtility(Number(req.params.uid))); } catch (e) { next(e); }
});
router.put("/lands/:id/utilities/:uid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateUtility(Number(req.params.uid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/utilities/:uid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteUtility(Number(req.params.uid))); } catch (e) { next(e); }
});

// ─── Roads ────────────────────────────────────────────────────────────────────
router.get("/lands/:id/roads", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listRoads(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/roads", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createRoad(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/roads/:rid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRoad(Number(req.params.rid))); } catch (e) { next(e); }
});
router.put("/lands/:id/roads/:rid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateRoad(Number(req.params.rid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/roads/:rid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteRoad(Number(req.params.rid))); } catch (e) { next(e); }
});

// ─── Buildings ────────────────────────────────────────────────────────────────
router.get("/lands/:id/buildings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listLandBuildings(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/buildings", requireAuth, async (req, res, next) => {
  try { res.json(await svc.placeLandBuilding(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.put("/lands/:id/buildings/:bid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateLandBuilding(Number(req.params.bid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/buildings/:bid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.removeLandBuilding(Number(req.params.bid))); } catch (e) { next(e); }
});

// ─── Teleports ────────────────────────────────────────────────────────────────
router.get("/lands/:id/teleports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listTeleports(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/teleports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.createTeleport(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.get("/lands/:id/teleports/:tid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getTeleport(Number(req.params.tid))); } catch (e) { next(e); }
});
router.put("/lands/:id/teleports/:tid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateTeleport(Number(req.params.tid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/teleports/:tid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteTeleport(Number(req.params.tid))); } catch (e) { next(e); }
});

// ─── Marketplace ──────────────────────────────────────────────────────────────
router.get("/lands/:id/marketplace", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listMarketplace(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/marketplace", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.createListing(Number(req.params.id), { ...req.body, sellerId: req.auth!.userId })); } catch (e) { next(e); }
});
router.put("/lands/:id/marketplace/:lid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.updateListing(Number(req.params.lid), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/marketplace/:lid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deleteListing(Number(req.params.lid))); } catch (e) { next(e); }
});

// ─── Permissions ──────────────────────────────────────────────────────────────
router.get("/lands/:id/permissions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listPermissions(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/permissions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.upsertPermission(Number(req.params.id), req.body)); } catch (e) { next(e); }
});
router.delete("/lands/:id/permissions/:pid", requireAuth, async (req, res, next) => {
  try { res.json(await svc.deletePermission(Number(req.params.pid))); } catch (e) { next(e); }
});

// ─── History & Versions ───────────────────────────────────────────────────────
router.get("/lands/:id/history", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getHistory(Number(req.params.id))); } catch (e) { next(e); }
});
router.get("/lands/:id/versions", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listVersions(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/versions", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.saveVersion(Number(req.params.id), req.auth!.userId, req.body.changelog)); } catch (e) { next(e); }
});

// ─── Statistics ───────────────────────────────────────────────────────────────
router.get("/lands/:id/statistics", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getStatistics(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.get("/lands/:id/exports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listExports(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/export/json", requireAuth, async (req, res, next) => {
  try { res.json(await svc.exportJson(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/export/template", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportTemplate(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.post("/lands/:id/export/package", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await svc.exportPackage(Number(req.params.id), req.auth!.userId)); } catch (e) { next(e); }
});
router.get("/lands/:id/imports", requireAuth, async (req, res, next) => {
  try { res.json(await svc.listImports(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Validate ─────────────────────────────────────────────────────────────────
router.post("/lands/:id/validate", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validate(Number(req.params.id))); } catch (e) { next(e); }
});

// ─── Simulation / Runtime ─────────────────────────────────────────────────────
router.get("/lands/:id/runtime", requireAuth, async (req, res, next) => {
  try { res.json(await svc.getRuntimeStatus(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/start", requireAuth, async (req, res, next) => {
  try { res.json(await svc.startStreaming(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/stop", requireAuth, async (req, res, next) => {
  try { res.json(await svc.stopStreaming(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/tick", requireAuth, async (req, res, next) => {
  try { res.json(await svc.simulateTick(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/chunk/:chunkId/load", requireAuth, async (req, res, next) => {
  try { res.json(await svc.loadChunk(Number(req.params.id), Number(req.params.chunkId))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/chunk/:chunkId/unload", requireAuth, async (req, res, next) => {
  try { res.json(await svc.unloadChunk(Number(req.params.id), Number(req.params.chunkId))); } catch (e) { next(e); }
});
router.get("/lands/:id/runtime/preview", requireAuth, async (req, res, next) => {
  try { res.json(await svc.previewRuntime(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/sync-ownership", requireAuth, async (req, res, next) => {
  try { res.json(await svc.syncOwnership(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/validate-zones", requireAuth, async (req, res, next) => {
  try { res.json(await svc.validateZones(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/traffic-flow", requireAuth, async (req, res, next) => {
  try { res.json(await svc.runTrafficFlow(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/marketplace-sync", requireAuth, async (req, res, next) => {
  try { res.json(await svc.marketplaceSync(Number(req.params.id))); } catch (e) { next(e); }
});
router.post("/lands/:id/runtime/construction-tick", requireAuth, async (req, res, next) => {
  try { res.json(await svc.constructionTick(Number(req.params.id))); } catch (e) { next(e); }
});

export default router;
