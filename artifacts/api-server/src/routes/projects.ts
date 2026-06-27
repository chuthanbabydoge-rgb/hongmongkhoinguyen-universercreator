import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorProjectsTable,
  creatorDocumentsTable,
} from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/projects", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const statusFilter = req.query["status"] as string | undefined;

    const conditions = [eq(creatorProjectsTable.userId, req.auth!.userId)];
    if (statusFilter) {
      conditions.push(
        eq(
          creatorProjectsTable.status,
          statusFilter as "draft" | "published" | "archived",
        ),
      );
    }

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorProjectsTable)
        .where(and(...conditions))
        .orderBy(desc(creatorProjectsTable.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorProjectsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/projects", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, description, tags, templateId: _templateId } = req.body as {
      name: string;
      description?: string;
      tags?: string[];
      templateId?: number;
    };

    if (!name) {
      res.status(400).json({ error: "BadRequest", message: "name required" });
      return;
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const [project] = await db
      .insert(creatorProjectsTable)
      .values({
        userId: req.auth!.userId,
        name,
        slug,
        description,
        tags: tags ?? [],
      })
      .returning();

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/projects/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [project] = await db
      .select()
      .from(creatorProjectsTable)
      .where(
        and(
          eq(creatorProjectsTable.id, id),
          eq(creatorProjectsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "NotFound", message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/projects/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name, description, status, tags, thumbnailUrl, metadata } =
      req.body as {
        name?: string;
        description?: string;
        status?: "draft" | "published" | "archived";
        tags?: string[];
        thumbnailUrl?: string;
        metadata?: Record<string, unknown>;
      };

    const [existing] = await db
      .select()
      .from(creatorProjectsTable)
      .where(
        and(
          eq(creatorProjectsTable.id, id),
          eq(creatorProjectsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NotFound", message: "Project not found" });
      return;
    }

    const [updated] = await db
      .update(creatorProjectsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && { tags }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(metadata !== undefined && { metadata }),
        updatedAt: new Date(),
      })
      .where(eq(creatorProjectsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/projects/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [existing] = await db
      .select()
      .from(creatorProjectsTable)
      .where(
        and(
          eq(creatorProjectsTable.id, id),
          eq(creatorProjectsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NotFound", message: "Project not found" });
      return;
    }

    await db
      .delete(creatorProjectsTable)
      .where(eq(creatorProjectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
