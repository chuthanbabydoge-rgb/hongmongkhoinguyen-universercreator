import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorProjectStarsTable,
  creatorProjectWatchersTable,
  creatorProjectsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activity";

const router = Router();

router.post("/projects/:id/star", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    const [project] = await db
      .select()
      .from(creatorProjectsTable)
      .where(eq(creatorProjectsTable.id, projectId))
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    await db
      .insert(creatorProjectStarsTable)
      .values({ projectId, userId })
      .onConflictDoNothing();

    await logActivity({
      userId,
      type: "starred",
      description: `Starred project ${project.name}`,
      projectId,
    });

    res.status(201).json({ starred: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/projects/:id/star", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    await db
      .delete(creatorProjectStarsTable)
      .where(
        and(
          eq(creatorProjectStarsTable.projectId, projectId),
          eq(creatorProjectStarsTable.userId, userId),
        ),
      );

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/projects/:id/watch", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    const [project] = await db
      .select()
      .from(creatorProjectsTable)
      .where(eq(creatorProjectsTable.id, projectId))
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    await db
      .insert(creatorProjectWatchersTable)
      .values({ projectId, userId })
      .onConflictDoNothing();

    await logActivity({
      userId,
      type: "watched",
      description: `Watching project ${project.name}`,
      projectId,
    });

    res.status(201).json({ watching: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/projects/:id/watch", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    await db
      .delete(creatorProjectWatchersTable)
      .where(
        and(
          eq(creatorProjectWatchersTable.projectId, projectId),
          eq(creatorProjectWatchersTable.userId, userId),
        ),
      );

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
