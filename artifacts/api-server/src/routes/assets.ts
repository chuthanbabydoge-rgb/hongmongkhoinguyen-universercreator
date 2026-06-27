import { Router } from "express";
import { db } from "@workspace/db";
import { creatorAssetsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/assets", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const projectId = req.query["projectId"]
      ? Number(req.query["projectId"])
      : undefined;
    const typeFilter = req.query["type"] as string | undefined;

    const conditions = [eq(creatorAssetsTable.userId, req.auth!.userId)];
    if (projectId) conditions.push(eq(creatorAssetsTable.projectId, projectId));
    if (typeFilter)
      conditions.push(
        eq(
          creatorAssetsTable.type,
          typeFilter as "image" | "audio" | "video" | "model" | "document" | "other",
        ),
      );

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorAssetsTable)
        .where(and(...conditions))
        .orderBy(desc(creatorAssetsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorAssetsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/assets", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, filename, url, type, projectId, size, mimeType, metadata } =
      req.body as {
        name: string;
        filename: string;
        url: string;
        type: "image" | "audio" | "video" | "model" | "document" | "other";
        projectId?: number;
        size?: number;
        mimeType?: string;
        metadata?: Record<string, unknown>;
      };

    if (!name || !filename || !url || !type) {
      res
        .status(400)
        .json({ error: "BadRequest", message: "name, filename, url, type required" });
      return;
    }

    const [asset] = await db
      .insert(creatorAssetsTable)
      .values({
        userId: req.auth!.userId,
        name,
        filename,
        url,
        type,
        projectId,
        size,
        mimeType,
        metadata: metadata ?? {},
      })
      .returning();

    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/assets/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [asset] = await db
      .select()
      .from(creatorAssetsTable)
      .where(
        and(
          eq(creatorAssetsTable.id, id),
          eq(creatorAssetsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!asset) {
      res.status(404).json({ error: "NotFound", message: "Asset not found" });
      return;
    }
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/assets/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    await db.delete(creatorAssetsTable).where(
      and(
        eq(creatorAssetsTable.id, id),
        eq(creatorAssetsTable.userId, req.auth!.userId),
      ),
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
