import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorProjectsTable,
  creatorAssetsTable,
  creatorDocumentsTable,
  creatorLogsTable,
} from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;

    const [
      [totalProjectsRow],
      [publishedProjectsRow],
      [totalAssetsRow],
      [totalDocumentsRow],
      recentProjects,
      recentActivity,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.userId, userId)),
      db
        .select({ total: count() })
        .from(creatorProjectsTable)
        .where(
          and(
            eq(creatorProjectsTable.userId, userId),
            eq(creatorProjectsTable.status, "published"),
          ),
        ),
      db
        .select({ total: count() })
        .from(creatorAssetsTable)
        .where(eq(creatorAssetsTable.userId, userId)),
      db
        .select({ total: count() })
        .from(creatorDocumentsTable)
        .where(eq(creatorDocumentsTable.userId, userId)),
      db
        .select()
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.userId, userId))
        .orderBy(desc(creatorProjectsTable.updatedAt))
        .limit(5),
      db
        .select()
        .from(creatorLogsTable)
        .where(eq(creatorLogsTable.userId, userId))
        .orderBy(desc(creatorLogsTable.createdAt))
        .limit(10),
    ]);

    res.json({
      totalProjects: totalProjectsRow?.total ?? 0,
      publishedProjects: publishedProjectsRow?.total ?? 0,
      totalAssets: totalAssetsRow?.total ?? 0,
      totalDocuments: totalDocumentsRow?.total ?? 0,
      recentProjects,
      recentActivity: recentActivity.map((l) => ({
        id: l.id,
        action: l.action,
        message: l.message,
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
