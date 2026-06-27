import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorProjectMembersTable,
  creatorProjectsTable,
  creatorUsersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { requireProjectPermission } from "../middlewares/permission";
import { logActivity, createNotification } from "../lib/activity";

const router = Router();

router.get(
  "/projects/:id/members",
  requireAuth,
  requireProjectPermission("view"),
  async (req: AuthRequest, res) => {
    try {
      const projectId = Number(req.params["id"]);
      const members = await db
        .select({
          id: creatorProjectMembersTable.id,
          userId: creatorProjectMembersTable.userId,
          permission: creatorProjectMembersTable.permission,
          addedAt: creatorProjectMembersTable.addedAt,
          username: creatorUsersTable.username,
          displayName: creatorUsersTable.displayName,
          email: creatorUsersTable.email,
          avatarUrl: creatorUsersTable.avatarUrl,
        })
        .from(creatorProjectMembersTable)
        .innerJoin(
          creatorUsersTable,
          eq(creatorProjectMembersTable.userId, creatorUsersTable.id),
        )
        .where(eq(creatorProjectMembersTable.projectId, projectId));

      res.json({ items: members, total: members.length });
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

router.post(
  "/projects/:id/members",
  requireAuth,
  requireProjectPermission("admin"),
  async (req: AuthRequest, res) => {
    try {
      const projectId = Number(req.params["id"]);
      const adderId = req.auth!.userId;
      const { userId, permission } = req.body as {
        userId: number;
        permission?: string;
      };

      if (!userId) {
        res.status(400).json({ error: "BadRequest", message: "userId required" });
        return;
      }

      const [member] = await db
        .insert(creatorProjectMembersTable)
        .values({
          projectId,
          userId,
          permission: (permission as "view" | "comment" | "edit" | "build" | "publish" | "admin" | "owner") ?? "view",
          addedBy: adderId,
        })
        .onConflictDoNothing()
        .returning();

      const [project] = await db
        .select()
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.id, projectId))
        .limit(1);

      await logActivity({
        userId: adderId,
        type: "permission_changed",
        description: `Added member to project ${project?.name ?? projectId}`,
        projectId,
      });

      await createNotification({
        userId,
        type: "role_changed",
        title: "Project Access",
        message: `You have been added to project ${project?.name ?? projectId} with ${permission ?? "view"} permission`,
        referenceId: projectId,
        referenceType: "project",
      });

      res.status(201).json(member);
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

router.patch(
  "/projects/:id/members/:memberId",
  requireAuth,
  requireProjectPermission("admin"),
  async (req: AuthRequest, res) => {
    try {
      const memberId = Number(req.params["memberId"]);
      const { permission } = req.body as { permission: string };

      const [updated] = await db
        .update(creatorProjectMembersTable)
        .set({
          permission: permission as "view" | "comment" | "edit" | "build" | "publish" | "admin" | "owner",
        })
        .where(eq(creatorProjectMembersTable.id, memberId))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "NotFound" });
        return;
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

router.delete(
  "/projects/:id/members/:memberId",
  requireAuth,
  requireProjectPermission("admin"),
  async (req: AuthRequest, res) => {
    try {
      const memberId = Number(req.params["memberId"]);

      await db
        .delete(creatorProjectMembersTable)
        .where(eq(creatorProjectMembersTable.id, memberId));

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

export default router;
