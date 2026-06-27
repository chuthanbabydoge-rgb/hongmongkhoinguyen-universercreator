import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorInvitationsTable,
  creatorOrganizationMembersTable,
  creatorProjectMembersTable,
} from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logActivity, createNotification } from "../lib/activity";

const router = Router();

router.get("/invitations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const items = await db
      .select()
      .from(creatorInvitationsTable)
      .where(
        or(
          eq(creatorInvitationsTable.inviteeId, userId),
          eq(creatorInvitationsTable.inviterId, userId),
        ),
      );
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/invitations/:id/accept", requireAuth, async (req: AuthRequest, res) => {
  try {
    const invId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    const [inv] = await db
      .select()
      .from(creatorInvitationsTable)
      .where(eq(creatorInvitationsTable.id, invId))
      .limit(1);

    if (!inv) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    if (inv.inviteeId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (inv.status !== "pending") {
      res.status(400).json({ error: "BadRequest", message: `Invitation is ${inv.status}` });
      return;
    }

    if (inv.expiresAt < new Date()) {
      await db
        .update(creatorInvitationsTable)
        .set({ status: "expired" })
        .where(eq(creatorInvitationsTable.id, invId));
      res.status(400).json({ error: "BadRequest", message: "Invitation expired" });
      return;
    }

    await db
      .update(creatorInvitationsTable)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(creatorInvitationsTable.id, invId));

    if (inv.organizationId) {
      await db
        .insert(creatorOrganizationMembersTable)
        .values({
          organizationId: inv.organizationId,
          userId,
          role: inv.role,
        })
        .onConflictDoNothing();

      await logActivity({
        userId,
        type: "joined",
        description: "Joined organization via invitation",
        organizationId: inv.organizationId,
      });

      await createNotification({
        userId: inv.inviterId,
        type: "invite_accepted",
        title: "Invitation Accepted",
        message: `Your organization invitation was accepted`,
        referenceId: inv.organizationId,
        referenceType: "organization",
      });
    }

    if (inv.projectId && inv.permission) {
      await db
        .insert(creatorProjectMembersTable)
        .values({
          projectId: inv.projectId,
          userId,
          permission: inv.permission,
          addedBy: inv.inviterId,
        })
        .onConflictDoNothing();
    }

    res.json({ status: "accepted" });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/invitations/:id/reject", requireAuth, async (req: AuthRequest, res) => {
  try {
    const invId = Number(req.params["id"]);
    const userId = req.auth!.userId;

    const [inv] = await db
      .select()
      .from(creatorInvitationsTable)
      .where(
        and(
          eq(creatorInvitationsTable.id, invId),
          eq(creatorInvitationsTable.inviteeId, userId),
        ),
      )
      .limit(1);

    if (!inv) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    if (inv.status !== "pending") {
      res.status(400).json({ error: "BadRequest", message: `Invitation is ${inv.status}` });
      return;
    }

    await db
      .update(creatorInvitationsTable)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(creatorInvitationsTable.id, invId));

    res.json({ status: "rejected" });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
