import { Router } from "express";
import { db } from "@workspace/db";
import { creatorNotificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const unreadOnly = req.query["unread"] === "true";

    const conditions = [
      eq(creatorNotificationsTable.userId, userId),
      eq(creatorNotificationsTable.isArchived, false),
    ];
    if (unreadOnly) {
      conditions.push(eq(creatorNotificationsTable.isRead, false));
    }

    const items = await db
      .select()
      .from(creatorNotificationsTable)
      .where(and(...conditions))
      .orderBy(desc(creatorNotificationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const unreadCount = items.filter((n) => !n.isRead).length;

    res.json({ items, total: items.length, unreadCount });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const userId = req.auth!.userId;

    const [updated] = await db
      .update(creatorNotificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(creatorNotificationsTable.id, id),
          eq(creatorNotificationsTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;

    await db
      .update(creatorNotificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(creatorNotificationsTable.userId, userId),
          eq(creatorNotificationsTable.isRead, false),
        ),
      );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
