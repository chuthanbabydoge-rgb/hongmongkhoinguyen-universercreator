import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorTemplatesTable,
  creatorProjectsTable,
} from "@workspace/db";
import { eq, count, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/templates", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorTemplatesTable)
        .where(eq(creatorTemplatesTable.isPublic, true))
        .orderBy(desc(creatorTemplatesTable.usageCount))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorTemplatesTable)
        .where(eq(creatorTemplatesTable.isPublic, true)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/templates/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [template] = await db
      .select()
      .from(creatorTemplatesTable)
      .where(eq(creatorTemplatesTable.id, id))
      .limit(1);

    if (!template) {
      res
        .status(404)
        .json({ error: "NotFound", message: "Template not found" });
      return;
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post(
  "/templates/:id/use",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params["id"]);
      const { name } = req.body as { name: string };

      if (!name) {
        res
          .status(400)
          .json({ error: "BadRequest", message: "name required" });
        return;
      }

      const [template] = await db
        .select()
        .from(creatorTemplatesTable)
        .where(eq(creatorTemplatesTable.id, id))
        .limit(1);

      if (!template) {
        res
          .status(404)
          .json({ error: "NotFound", message: "Template not found" });
        return;
      }

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const [project] = await db
        .insert(creatorProjectsTable)
        .values({
          userId: req.auth!.userId,
          name,
          slug,
          description: `Created from template: ${template.name}`,
          tags: template.tags,
          metadata: template.content as Record<string, unknown>,
        })
        .returning();

      await db
        .update(creatorTemplatesTable)
        .set({ usageCount: sql`${creatorTemplatesTable.usageCount} + 1` })
        .where(eq(creatorTemplatesTable.id, id));

      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

export default router;
