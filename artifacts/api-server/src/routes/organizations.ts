import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorOrganizationsTable,
  creatorOrganizationMembersTable,
  creatorUsersTable,
  creatorInvitationsTable,
} from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { requireOrganizationRole } from "../middlewares/permission";
import { logActivity, createNotification } from "../lib/activity";
import crypto from "crypto";

const router = Router();

router.get("/organizations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const memberships = await db
      .select({
        org: creatorOrganizationsTable,
        role: creatorOrganizationMembersTable.role,
      })
      .from(creatorOrganizationMembersTable)
      .innerJoin(
        creatorOrganizationsTable,
        eq(creatorOrganizationMembersTable.organizationId, creatorOrganizationsTable.id),
      )
      .where(eq(creatorOrganizationMembersTable.userId, userId))
      .orderBy(desc(creatorOrganizationsTable.createdAt));

    res.json({ items: memberships, total: memberships.length });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/organizations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const { name, description, website } = req.body as {
      name: string;
      description?: string;
      website?: string;
    };

    if (!name) {
      res.status(400).json({ error: "BadRequest", message: "name required" });
      return;
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const [org] = await db
      .insert(creatorOrganizationsTable)
      .values({ name, slug, description, website, ownerId: userId })
      .returning();

    await db.insert(creatorOrganizationMembersTable).values({
      organizationId: org.id,
      userId,
      role: "owner",
    });

    await logActivity({
      userId,
      type: "joined",
      description: `Created organization ${name}`,
      organizationId: org.id,
    });

    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/organizations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orgId = Number(req.params["id"]);
    const [org] = await db
      .select()
      .from(creatorOrganizationsTable)
      .where(eq(creatorOrganizationsTable.id, orgId))
      .limit(1);

    if (!org) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const members = await db
      .select({
        id: creatorOrganizationMembersTable.id,
        userId: creatorOrganizationMembersTable.userId,
        role: creatorOrganizationMembersTable.role,
        joinedAt: creatorOrganizationMembersTable.joinedAt,
        username: creatorUsersTable.username,
        displayName: creatorUsersTable.displayName,
        email: creatorUsersTable.email,
        avatarUrl: creatorUsersTable.avatarUrl,
      })
      .from(creatorOrganizationMembersTable)
      .innerJoin(
        creatorUsersTable,
        eq(creatorOrganizationMembersTable.userId, creatorUsersTable.id),
      )
      .where(eq(creatorOrganizationMembersTable.organizationId, orgId));

    const [{ total }] = await db
      .select({ total: count() })
      .from(creatorOrganizationMembersTable)
      .where(eq(creatorOrganizationMembersTable.organizationId, orgId));

    res.json({ ...org, members, memberCount: total });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post(
  "/organizations/:id/invite",
  requireAuth,
  requireOrganizationRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const orgId = Number(req.params["id"]);
      const userId = req.auth!.userId;
      const { email, role } = req.body as { email: string; role?: string };

      if (!email) {
        res.status(400).json({ error: "BadRequest", message: "email required" });
        return;
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [inviteeUser] = await db
        .select()
        .from(creatorUsersTable)
        .where(eq(creatorUsersTable.email, email))
        .limit(1);

      const [invitation] = await db
        .insert(creatorInvitationsTable)
        .values({
          organizationId: orgId,
          inviterId: userId,
          inviteeEmail: email,
          inviteeId: inviteeUser?.id,
          role: (role as "viewer" | "developer" | "designer" | "writer" | "tester" | "admin" | "owner") ?? "viewer",
          token,
          expiresAt,
        })
        .returning();

      if (inviteeUser) {
        await createNotification({
          userId: inviteeUser.id,
          type: "invite_received",
          title: "Organization Invitation",
          message: `You have been invited to join an organization`,
          referenceId: invitation.id,
          referenceType: "invitation",
        });
      }

      res.status(201).json({ id: invitation.id, token, expiresAt });
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  },
);

export default router;
