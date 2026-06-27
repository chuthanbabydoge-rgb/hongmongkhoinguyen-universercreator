import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { creatorUsersTable, creatorProjectsTable } from "./creator";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orgMemberRoleEnum = pgEnum("org_member_role", [
  "owner",
  "admin",
  "developer",
  "designer",
  "writer",
  "tester",
  "viewer",
]);

export const projectPermissionEnum = pgEnum("project_permission", [
  "view",
  "comment",
  "edit",
  "build",
  "publish",
  "admin",
  "owner",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "private",
  "internal",
  "public",
  "marketplace",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "project_created",
  "project_deleted",
  "joined",
  "forked",
  "published",
  "commented",
  "asset_uploaded",
  "permission_changed",
  "starred",
  "watched",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "invite_received",
  "invite_accepted",
  "role_changed",
  "project_published",
  "asset_uploaded",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorProfilesTable = pgTable("creator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  username: text("username").unique(),
  avatar: text("avatar"),
  bio: text("bio"),
  website: text("website"),
  location: text("location"),
  socialLinks: jsonb("social_links").default({}).notNull(),
  verified: boolean("verified").default(false).notNull(),
  creatorLevel: integer("creator_level").default(1).notNull(),
  reputation: integer("reputation").default(0).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  followingCount: integer("following_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorOrganizationsTable = pgTable("creator_organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorOrganizationMembersTable = pgTable(
  "creator_organization_members",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => creatorOrganizationsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    role: orgMemberRoleEnum("role").default("viewer").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.organizationId, t.userId)],
);

export const creatorInvitationsTable = pgTable("creator_invitations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(
    () => creatorOrganizationsTable.id,
    { onDelete: "cascade" },
  ),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "cascade",
  }),
  inviterId: integer("inviter_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  inviteeEmail: text("invitee_email").notNull(),
  inviteeId: integer("invitee_id").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  role: orgMemberRoleEnum("role").default("viewer").notNull(),
  permission: projectPermissionEnum("permission"),
  status: invitationStatusEnum("status").default("pending").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorProjectMembersTable = pgTable(
  "creator_project_members",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    permission: projectPermissionEnum("permission").default("view").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
    addedBy: integer("added_by").references(() => creatorUsersTable.id, {
      onDelete: "set null",
    }),
  },
  (t) => [unique().on(t.projectId, t.userId)],
);

export const creatorProjectStarsTable = pgTable(
  "creator_project_stars",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.projectId, t.userId)],
);

export const creatorProjectWatchersTable = pgTable(
  "creator_project_watchers",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.projectId, t.userId)],
);

export const creatorActivityTable = pgTable("creator_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "set null",
  }),
  organizationId: integer("organization_id").references(
    () => creatorOrganizationsTable.id,
    { onDelete: "set null" },
  ),
  type: activityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorNotificationsTable = pgTable("creator_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Insert Schemas ───────────────────────────────────────────────────────────

export const insertCreatorProfileSchema = createInsertSchema(
  creatorProfilesTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorOrganizationSchema = createInsertSchema(
  creatorOrganizationsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorOrganizationMemberSchema = createInsertSchema(
  creatorOrganizationMembersTable,
).omit({ id: true, joinedAt: true });

export const insertCreatorInvitationSchema = createInsertSchema(
  creatorInvitationsTable,
).omit({ id: true, createdAt: true });

export const insertCreatorProjectMemberSchema = createInsertSchema(
  creatorProjectMembersTable,
).omit({ id: true, addedAt: true });

export const insertCreatorProjectStarSchema = createInsertSchema(
  creatorProjectStarsTable,
).omit({ id: true, createdAt: true });

export const insertCreatorProjectWatcherSchema = createInsertSchema(
  creatorProjectWatchersTable,
).omit({ id: true, createdAt: true });

export const insertCreatorActivitySchema = createInsertSchema(
  creatorActivityTable,
).omit({ id: true, createdAt: true });

export const insertCreatorNotificationSchema = createInsertSchema(
  creatorNotificationsTable,
).omit({ id: true, createdAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorProfile = typeof creatorProfilesTable.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;

export type CreatorOrganization = typeof creatorOrganizationsTable.$inferSelect;
export type InsertCreatorOrganization = z.infer<typeof insertCreatorOrganizationSchema>;

export type CreatorOrganizationMember = typeof creatorOrganizationMembersTable.$inferSelect;
export type InsertCreatorOrganizationMember = z.infer<typeof insertCreatorOrganizationMemberSchema>;

export type CreatorInvitation = typeof creatorInvitationsTable.$inferSelect;
export type InsertCreatorInvitation = z.infer<typeof insertCreatorInvitationSchema>;

export type CreatorProjectMember = typeof creatorProjectMembersTable.$inferSelect;
export type InsertCreatorProjectMember = z.infer<typeof insertCreatorProjectMemberSchema>;

export type CreatorProjectStar = typeof creatorProjectStarsTable.$inferSelect;
export type CreatorProjectWatcher = typeof creatorProjectWatchersTable.$inferSelect;

export type CreatorActivity = typeof creatorActivityTable.$inferSelect;
export type InsertCreatorActivity = z.infer<typeof insertCreatorActivitySchema>;

export type CreatorNotification = typeof creatorNotificationsTable.$inferSelect;
export type InsertCreatorNotification = z.infer<typeof insertCreatorNotificationSchema>;
