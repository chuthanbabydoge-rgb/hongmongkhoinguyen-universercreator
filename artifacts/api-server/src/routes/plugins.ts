import { Router } from "express";
import { db } from "@workspace/db";
import { creatorPluginsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/plugins", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorPluginsTable)
        .where(eq(creatorPluginsTable.isEnabled, true))
        .orderBy(desc(creatorPluginsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorPluginsTable)
        .where(eq(creatorPluginsTable.isEnabled, true)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/plugins/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [plugin] = await db
      .select()
      .from(creatorPluginsTable)
      .where(eq(creatorPluginsTable.id, id))
      .limit(1);

    if (!plugin) {
      res.status(404).json({ error: "NotFound", message: "Plugin not found" });
      return;
    }
    res.json(plugin);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
