import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { GraphService } from "../services/graph-service";

const router = Router();
const service = new GraphService();

// GET /api/graphs
router.get("/graphs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const result = await service.listGraphs(req.auth!.userId, limit, offset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs
router.post("/graphs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, description, type, projectId, tags } = req.body as {
      name: string;
      description?: string;
      type?: string;
      projectId?: number;
      tags?: string[];
    };
    if (!name) {
      res.status(400).json({ error: "BadRequest", message: "name required" });
      return;
    }
    const graph = await service.createGraph(req.auth!.userId, {
      name,
      description,
      type: (type as "event_graph") ?? "event_graph",
      projectId: projectId ?? null,
      tags: tags ?? [],
      metadata: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      isTemplate: false,
      isPublic: false,
    });
    res.status(201).json(graph);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/graphs/templates
router.get("/graphs/templates", requireAuth, async (_req, res) => {
  try {
    const templates = await service.getTemplates();
    res.json({ items: templates });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/graphs/:id
router.get("/graphs/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const graph = await service.getGraph(id, req.auth!.userId);
    if (!graph) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// PATCH /api/graphs/:id
router.patch("/graphs/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const updated = await service.updateGraph(id, req.auth!.userId, req.body);
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// DELETE /api/graphs/:id
router.delete("/graphs/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const deleted = await service.deleteGraph(id, req.auth!.userId);
    if (!deleted) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/duplicate
router.post("/graphs/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const graph = await service.duplicateGraph(id, req.auth!.userId);
    if (!graph) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.status(201).json(graph);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/graphs/:id/load
router.get("/graphs/:id/load", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const details = await service.loadGraph(id, req.auth!.userId);
    if (!details) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/save
router.post("/graphs/:id/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.saveGraph(id, req.auth!.userId, req.body);
    if (!result) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/validate
router.post("/graphs/:id/validate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.validate(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/compile
router.post("/graphs/:id/compile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const result = await service.compile(id, req.auth!.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/execute
router.post("/graphs/:id/execute", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { breakpoints = [] } = req.body as { breakpoints?: number[] };
    const ctx = await service.execute(id, req.auth!.userId, breakpoints);
    if (!ctx) {
      res.status(422).json({ error: "CompileError", message: "Graph failed to compile" });
      return;
    }
    res.json(service.getRuntimeContext(ctx.runtimeId));
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/runtime/:runtimeId/pause
router.post("/graphs/runtime/:runtimeId/pause", requireAuth, async (req, res) => {
  try {
    const runtimeId = Array.isArray(req.params["runtimeId"]) ? req.params["runtimeId"][0] : req.params["runtimeId"];
    const ok = service.pauseRuntime(runtimeId);
    if (!ok) {
      res.status(404).json({ error: "NotFound", message: "Runtime not found or not running" });
      return;
    }
    res.json({ status: "paused" });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/runtime/:runtimeId/resume
router.post("/graphs/runtime/:runtimeId/resume", requireAuth, async (req, res) => {
  try {
    const runtimeId = Array.isArray(req.params["runtimeId"]) ? req.params["runtimeId"][0] : req.params["runtimeId"];
    const ok = service.resumeRuntime(runtimeId);
    if (!ok) {
      res.status(404).json({ error: "NotFound", message: "Runtime not found or not paused" });
      return;
    }
    res.json({ status: "running" });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/runtime/:runtimeId/stop
router.post("/graphs/runtime/:runtimeId/stop", requireAuth, async (req, res) => {
  try {
    const runtimeId = Array.isArray(req.params["runtimeId"]) ? req.params["runtimeId"][0] : req.params["runtimeId"];
    const ok = service.stopRuntime(runtimeId);
    if (!ok) {
      res.status(404).json({ error: "NotFound", message: "Runtime not found" });
      return;
    }
    res.json({ status: "stopped" });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/graphs/:id/history
router.get("/graphs/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const history = await service.getHistory(id, req.auth!.userId);
    if (!history) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json({ items: history });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// GET /api/graphs/:id/versions
router.get("/graphs/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const versions = await service.getVersions(id, req.auth!.userId);
    if (!versions) {
      res.status(404).json({ error: "NotFound", message: "Graph not found" });
      return;
    }
    res.json({ items: versions });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// POST /api/graphs/:id/restore
router.post("/graphs/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { versionId } = req.body as { versionId: number };
    const version = await service.restoreVersion(id, req.auth!.userId, versionId);
    if (!version) {
      res.status(404).json({ error: "NotFound", message: "Version not found" });
      return;
    }
    res.json(version);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
