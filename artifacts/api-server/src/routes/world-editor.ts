import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { WorldEditorService } from "../services/world-editor-service";

const router = Router();
const service = new WorldEditorService();

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/world-editor/dashboard
router.get("/world-editor/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await service.getDashboard(req.auth!.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Templates ────────────────────────────────────────────────────────────────

// GET /api/world-editor/templates
router.get("/world-editor/templates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const templates = await service.listTemplates(limit, offset);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Worlds ───────────────────────────────────────────────────────────────────

// GET /api/world-editor
router.get("/world-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const worlds = await service.listWorlds(req.auth!.userId, limit, offset);
    res.json(worlds);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor
router.post("/world-editor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, projectId, worldType, description, tags } = req.body as {
      name: string; projectId?: number; worldType?: string; description?: string; tags?: string[];
    };
    if (!name) { res.status(400).json({ error: "ValidationError", message: "name is required" }); return; }
    const world = await service.createWorld(req.auth!.userId, { name, projectId, worldType, description, tags });
    res.status(201).json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/world-editor/:id
router.get("/world-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const world = await service.getWorld(id, req.auth!.userId);
    if (!world) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id
router.patch("/world-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const world = await service.updateWorld(id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!world) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/world-editor/:id
router.delete("/world-editor/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const ok = await service.deleteWorld(id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/duplicate
router.post("/world-editor/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name?: string };
    const world = await service.duplicateWorld(id, req.auth!.userId, name);
    res.status(201).json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/fork
router.post("/world-editor/:id/fork", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { label } = req.body as { label?: string };
    const world = await service.forkWorld(id, req.auth!.userId, label);
    res.status(201).json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/publish
router.post("/world-editor/:id/publish", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const world = await service.publishWorld(id, req.auth!.userId);
    if (!world) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/archive
router.post("/world-editor/:id/archive", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const world = await service.archiveWorld(id, req.auth!.userId);
    if (!world) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/restore
router.post("/world-editor/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const world = await service.restoreWorld(id, req.auth!.userId);
    if (!world) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/world-editor/:id/settings
router.get("/world-editor/:id/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const settings = await service.getSettings(id, req.auth!.userId);
    res.json(settings ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/settings
router.patch("/world-editor/:id/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const settings = await service.updateSettings(id, req.auth!.userId, req.body as Record<string, unknown>);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Regions ──────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/regions
router.get("/world-editor/:id/regions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const regions = await service.listRegions(id, req.auth!.userId);
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/regions
router.post("/world-editor/:id/regions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const region = await service.createRegion(id, req.auth!.userId, req.body as Parameters<typeof service.createRegion>[2]);
    res.status(201).json(region);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/regions/:regionId
router.patch("/world-editor/:id/regions/:regionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const regionId = Number(req.params["regionId"]);
    const region = await service.updateRegion(regionId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!region) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(region);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/world-editor/:id/regions/:regionId
router.delete("/world-editor/:id/regions/:regionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const regionId = Number(req.params["regionId"]);
    const ok = await service.deleteRegion(regionId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Layers ───────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/layers
router.get("/world-editor/:id/layers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const layers = await service.listLayers(id, req.auth!.userId);
    res.json(layers);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/layers
router.post("/world-editor/:id/layers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const layer = await service.createLayer(id, req.auth!.userId, req.body as Parameters<typeof service.createLayer>[2]);
    res.status(201).json(layer);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/layers/:layerId
router.patch("/world-editor/:id/layers/:layerId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const layerId = Number(req.params["layerId"]);
    const layer = await service.updateLayer(layerId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!layer) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(layer);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Spawnpoints ──────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/spawnpoints
router.get("/world-editor/:id/spawnpoints", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawns = await service.listSpawnpoints(id, req.auth!.userId);
    res.json(spawns);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/spawnpoints
router.post("/world-editor/:id/spawnpoints", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawn = await service.createSpawnpoint(id, req.auth!.userId, req.body as Parameters<typeof service.createSpawnpoint>[2]);
    res.status(201).json(spawn);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/spawnpoints/:spawnId
router.patch("/world-editor/:id/spawnpoints/:spawnId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawnId = Number(req.params["spawnId"]);
    const spawn = await service.updateSpawnpoint(spawnId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!spawn) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(spawn);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/world-editor/:id/spawnpoints/:spawnId
router.delete("/world-editor/:id/spawnpoints/:spawnId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const spawnId = Number(req.params["spawnId"]);
    const ok = await service.deleteSpawnpoint(spawnId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Portals ──────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/portals
router.get("/world-editor/:id/portals", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const portals = await service.listPortals(id, req.auth!.userId);
    res.json(portals);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/portals
router.post("/world-editor/:id/portals", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const portal = await service.createPortal(id, req.auth!.userId, req.body as Parameters<typeof service.createPortal>[2]);
    res.status(201).json(portal);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/portals/:portalId
router.patch("/world-editor/:id/portals/:portalId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const portalId = Number(req.params["portalId"]);
    const portal = await service.updatePortal(portalId, id, req.auth!.userId, req.body as Record<string, unknown>);
    if (!portal) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(portal);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/world-editor/:id/portals/:portalId
router.delete("/world-editor/:id/portals/:portalId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const portalId = Number(req.params["portalId"]);
    const ok = await service.deletePortal(portalId, id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Environment ──────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/environment
router.get("/world-editor/:id/environment", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const env = await service.getEnvironment(id, req.auth!.userId);
    res.json(env ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/environment
router.patch("/world-editor/:id/environment", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const env = await service.updateEnvironment(id, req.auth!.userId, req.body as Record<string, unknown>);
    res.json(env);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Weather ──────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/weather
router.get("/world-editor/:id/weather", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const weather = await service.listWeather(id, req.auth!.userId);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Lighting ─────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/lighting
router.get("/world-editor/:id/lighting", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const lighting = await service.getLighting(id, req.auth!.userId);
    res.json(lighting ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/world-editor/:id/lighting
router.patch("/world-editor/:id/lighting", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const lighting = await service.updateLighting(id, req.auth!.userId, req.body as Record<string, unknown>);
    res.json(lighting);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Navigation ───────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/navigation
router.get("/world-editor/:id/navigation", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const nav = await service.getNavigation(id, req.auth!.userId);
    res.json(nav ?? {});
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/statistics
router.get("/world-editor/:id/statistics", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const stats = await service.getStatistics(id, req.auth!.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Versions ─────────────────────────────────────────────────────────────────

// GET /api/world-editor/:id/versions
router.get("/world-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const versions = await service.listVersions(id, req.auth!.userId);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/versions
router.post("/world-editor/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { label, description } = req.body as { label?: string; description?: string };
    const version = await service.createVersion(id, req.auth!.userId, label, description);
    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Validate ─────────────────────────────────────────────────────────────────

// POST /api/world-editor/:id/validate
router.post("/world-editor/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.validator.validate(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

// POST /api/world-editor/:id/export
router.post("/world-editor/:id/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { format } = req.body as { format?: string };
    if (format === "template") {
      const { name, description } = req.body as { name: string; description?: string };
      const record = await service.exporter.exportAsTemplate(id, req.auth!.userId, name, description);
      res.json(record);
    } else {
      const { exportRecord, data } = await service.exporter.exportAsJson(id, req.auth!.userId);
      res.json({ exportRecord, data });
    }
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Import ───────────────────────────────────────────────────────────────────

// POST /api/world-editor/import
router.post("/world-editor/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, projectId, nameOverride } = req.body as { data: string; projectId?: number; nameOverride?: string };
    if (!data) { res.status(400).json({ error: "ValidationError", message: "data is required" }); return; }
    const result = await service.importer.importFromJson(req.auth!.userId, data, { projectId, nameOverride });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/import/template
router.post("/world-editor/import/template", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { templateId, name, projectId } = req.body as { templateId: number; name: string; projectId?: number };
    if (!templateId || !name) { res.status(400).json({ error: "ValidationError", message: "templateId and name are required" }); return; }
    const world = await service.importer.importFromTemplate(req.auth!.userId, templateId, { name, projectId });
    res.status(201).json(world);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Preview / Play ───────────────────────────────────────────────────────────

// POST /api/world-editor/:id/preview
router.post("/world-editor/:id/preview", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.runtimeBridge.preview(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/world-editor/:id/play
router.post("/world-editor/:id/play", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.runtimeBridge.play(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
