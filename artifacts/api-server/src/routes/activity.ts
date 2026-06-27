import { Router } from "express";
import { db } from "@workspace/db";
import { creatorActivityTable, creatorProjectsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/activity", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);

    const items = await db
      .select({
        id: creatorActivityTable.id,
        type: creatorActivityTable.type,
        description: creatorActivityTable.description,
        projectId: creatorActivityTable.projectId,
        organizationId: creatorActivityTable.organizationId,
        metadata: creatorActivityTable.metadata,
        createdAt: creatorActivityTable.createdAt,
        projectName: creatorProjectsTable.name,
      })
      .from(creatorActivityTable)
      .leftJoin(
        creatorProjectsTable,
        eq(creatorActivityTable.projectId, creatorProjectsTable.id),
      )
      .where(eq(creatorActivityTable.userId, userId))
      .orderBy(desc(creatorActivityTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
