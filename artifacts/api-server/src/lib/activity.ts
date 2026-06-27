import { db } from "@workspace/db";
import {
  creatorActivityTable,
  creatorNotificationsTable,
} from "@workspace/db";

export type ActivityType =
  | "project_created"
  | "project_deleted"
  | "joined"
  | "forked"
  | "published"
  | "commented"
  | "asset_uploaded"
  | "permission_changed"
  | "starred"
  | "watched";

export type NotificationType =
  | "invite_received"
  | "invite_accepted"
  | "role_changed"
  | "project_published"
  | "asset_uploaded";

export async function logActivity(opts: {
  userId: number;
  type: ActivityType;
  description: string;
  projectId?: number;
  organizationId?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(creatorActivityTable).values({
      userId: opts.userId,
      type: opts.type,
      description: opts.description,
      projectId: opts.projectId,
      organizationId: opts.organizationId,
      metadata: opts.metadata ?? {},
    });
  } catch {
    // Non-fatal — swallow activity log errors
  }
}

export async function createNotification(opts: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(creatorNotificationsTable).values({
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      referenceId: opts.referenceId,
      referenceType: opts.referenceType,
      metadata: opts.metadata ?? {},
    });
  } catch {
    // Non-fatal
  }
}
