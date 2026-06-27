import { Router } from "express";
import { db } from "@workspace/db";
import { creatorPublishJobsTable, creatorProjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/publish", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId, payload } = req.body as {
      projectId: number;
      payload?: Record<string, unknown>;
    };

    if (!projectId) {
      res
        .status(400)
        .json({ error: "BadRequest", message: "projectId required" });
      return;
    }

    const [project] = await db
      .select()
      .from(creatorProjectsTable)
      .where(
        and(
          eq(creatorProjectsTable.id, projectId),
          eq(creatorProjectsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!project) {
      res
        .status(404)
        .json({ error: "NotFound", message: "Project not found" });
      return;
    }

    const [job] = await db
      .insert(creatorPublishJobsTable)
      .values({
        projectId,
        userId: req.auth!.userId,
        status: "pending",
        payload: payload ?? {},
        result: {},
      })
      .returning();

    setTimeout(async () => {
      await db
        .update(creatorPublishJobsTable)
        .set({ status: "processing", startedAt: new Date() })
        .where(eq(creatorPublishJobsTable.id, job!.id));

      await new Promise((r) => setTimeout(r, 1000));

      await db
        .update(creatorPublishJobsTable)
        .set({
          status: "success",
          completedAt: new Date(),
          result: { message: "Published successfully" },
        })
        .where(eq(creatorPublishJobsTable.id, job!.id));

      await db
        .update(creatorProjectsTable)
        .set({ status: "published", updatedAt: new Date() })
        .where(eq(creatorProjectsTable.id, projectId));
    }, 500);

    res.status(202).json(job);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/publish/:jobId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const jobId = Number(req.params["jobId"]);
    const [job] = await db
      .select()
      .from(creatorPublishJobsTable)
      .where(
        and(
          eq(creatorPublishJobsTable.id, jobId),
          eq(creatorPublishJobsTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    if (!job) {
      res.status(404).json({ error: "NotFound", message: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
