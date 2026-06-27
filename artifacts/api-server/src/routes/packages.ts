import { Router } from "express";
import { db } from "@workspace/db";
import { creatorPackagesTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/packages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const projectId = req.query["projectId"]
      ? Number(req.query["projectId"])
      : undefined;

    const conditions = projectId
      ? [eq(creatorPackagesTable.projectId, projectId)]
      : [];

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorPackagesTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(creatorPackagesTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorPackagesTable)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/packages/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [pkg] = await db
      .select()
      .from(creatorPackagesTable)
      .where(eq(creatorPackagesTable.id, id))
      .limit(1);

    if (!pkg) {
      res.status(404).json({ error: "NotFound", message: "Package not found" });
      return;
    }
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
