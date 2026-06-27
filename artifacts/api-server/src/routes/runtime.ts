import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { RuntimeService } from "../services/runtime-service";

const router = Router();
const service = new RuntimeService();

// GET /api/runtime — list sessions
router.get("/runtime", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.listSessions(req.auth!.userId, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime — create session
router.post("/runtime", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, projectId, mode } = req.body as { name?: string; projectId?: number; mode?: string };
    const session = await service.createSession(req.auth!.userId, { name, projectId, mode });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/dashboard
router.get("/runtime/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const dashboard = await service.getDashboard(req.auth!.userId);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id — get session
router.get("/runtime/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const session = await service.getSession(id, req.auth!.userId);
    if (!session) { res.status(404).json({ error: "NotFound" }); return; }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/runtime/:id — delete session
router.delete("/runtime/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const ok = await service.deleteSession(id, req.auth!.userId);
    if (!ok) { res.status(404).json({ error: "NotFound" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/start
router.post("/runtime/:id/start", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.start(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/stop
router.post("/runtime/:id/stop", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.stop(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/pause
router.post("/runtime/:id/pause", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.pause(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/resume
router.post("/runtime/:id/resume", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.resume(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/restart
router.post("/runtime/:id/restart", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.restart(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/step
router.post("/runtime/:id/step", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.step(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/snapshot
router.post("/runtime/:id/snapshot", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name } = req.body as { name?: string };
    const result = await service.snapshot(id, req.auth!.userId, name ?? `Snapshot ${new Date().toISOString()}`);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/runtime/:id/restore
router.post("/runtime/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { snapshotId } = req.body as { snapshotId: number };
    if (!snapshotId) { res.status(400).json({ error: "BadRequest", message: "snapshotId required" }); return; }
    const result = await service.restore(id, req.auth!.userId, snapshotId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/logs
router.get("/runtime/:id/logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 100), 500);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getLogs(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/performance
router.get("/runtime/:id/performance", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 300), 1000);
    await service.samplePerformance(id);
    const result = await service.getPerformance(id, limit);
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/entities
router.get("/runtime/:id/entities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 100), 500);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getEntities(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/components
router.get("/runtime/:id/components", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 200), 500);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getComponents(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/systems
router.get("/runtime/:id/systems", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.getSystems(id);
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/events
router.get("/runtime/:id/events", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getEvents(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/jobs
router.get("/runtime/:id/jobs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getJobs(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/timers
router.get("/runtime/:id/timers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.getTimers(id);
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/runtime/:id/history
router.get("/runtime/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.getHistory(id, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
