import type { Response, NextFunction } from "express";
import { db } from "@workspace/db";
import {
  creatorProjectMembersTable,
  creatorProjectsTable,
  creatorOrganizationMembersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { AuthRequest } from "./auth";

const PERMISSION_LEVELS: Record<string, number> = {
  view: 1,
  comment: 2,
  edit: 3,
  build: 4,
  publish: 5,
  admin: 6,
  owner: 7,
};

const ORG_ROLE_LEVELS: Record<string, number> = {
  viewer: 1,
  tester: 2,
  writer: 3,
  designer: 3,
  developer: 4,
  admin: 5,
  owner: 6,
};

export function requireProjectPermission(
  minPermission: "view" | "comment" | "edit" | "build" | "publish" | "admin" | "owner",
) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const projectId = Number(req.params["id"] ?? req.params["projectId"]);
    if (!projectId) {
      res.status(400).json({ error: "Missing project id" });
      return;
    }

    try {
      const [project] = await db
        .select()
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.id, projectId))
        .limit(1);

      if (!project) {
        res.status(404).json({ error: "NotFound", message: "Project not found" });
        return;
      }

      if (project.userId === userId) {
        next();
        return;
      }

      const [member] = await db
        .select()
        .from(creatorProjectMembersTable)
        .where(
          and(
            eq(creatorProjectMembersTable.projectId, projectId),
            eq(creatorProjectMembersTable.userId, userId),
          ),
        )
        .limit(1);

      if (!member) {
        res.status(403).json({ error: "Forbidden", message: "No project access" });
        return;
      }

      const userLevel = PERMISSION_LEVELS[member.permission] ?? 0;
      const requiredLevel = PERMISSION_LEVELS[minPermission] ?? 0;

      if (userLevel < requiredLevel) {
        res.status(403).json({ error: "Forbidden", message: `Requires ${minPermission} permission` });
        return;
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  };
}

export function requireOrganizationRole(
  minRole: "viewer" | "tester" | "writer" | "designer" | "developer" | "admin" | "owner",
) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const orgId = Number(req.params["id"] ?? req.params["orgId"]);
    if (!orgId) {
      res.status(400).json({ error: "Missing organization id" });
      return;
    }

    try {
      const [member] = await db
        .select()
        .from(creatorOrganizationMembersTable)
        .where(
          and(
            eq(creatorOrganizationMembersTable.organizationId, orgId),
            eq(creatorOrganizationMembersTable.userId, userId),
          ),
        )
        .limit(1);

      if (!member) {
        res.status(403).json({ error: "Forbidden", message: "Not a member of this organization" });
        return;
      }

      const userLevel = ORG_ROLE_LEVELS[member.role] ?? 0;
      const requiredLevel = ORG_ROLE_LEVELS[minRole] ?? 0;

      if (userLevel < requiredLevel) {
        res.status(403).json({ error: "Forbidden", message: `Requires ${minRole} role` });
        return;
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "InternalError", message: String(err) });
    }
  };
}
