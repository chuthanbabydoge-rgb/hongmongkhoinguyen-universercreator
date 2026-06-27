import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "published",
  "archived",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "image",
  "audio",
  "video",
  "model",
  "document",
  "other",
]);

export const publishStatusEnum = pgEnum("publish_status", [
  "pending",
  "processing",
  "success",
  "failed",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "world",
  "npc",
  "quest",
  "boss",
  "dungeon",
  "item",
  "skill",
  "pet",
  "company",
  "education",
  "sports",
  "land",
  "nation",
  "mount",
  "dialogue",
  "course",
  "tournament",
  "city",
  "building",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "review",
  "approved",
  "published",
  "archived",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const creatorUsersTable = pgTable("creator_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorProjectsTable = pgTable("creator_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  status: projectStatusEnum("status").default("draft").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  tags: text("tags").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorDocumentsTable = pgTable("creator_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  thumbnail: text("thumbnail"),
  icon: text("icon"),
  status: documentStatusEnum("status").default("draft").notNull(),
  visibility: text("visibility").default("private").notNull(),
  content: jsonb("content").default({}).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  version: integer("version").default(1).notNull(),
  tags: text("tags").array().default([]).notNull(),
  folderId: integer("folder_id"),
  updatedBy: integer("updated_by").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorAssetsTable = pgTable("creator_assets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "set null",
  }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  type: assetTypeEnum("type").notNull(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  mimeType: text("mime_type"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorPackagesTable = pgTable("creator_packages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: text("version").notNull(),
  description: text("description"),
  manifest: jsonb("manifest").default({}).notNull(),
  downloadUrl: text("download_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorTemplatesTable = pgTable("creator_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category"),
  content: jsonb("content").default({}).notNull(),
  tags: text("tags").array().default([]).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorPluginsTable = pgTable("creator_plugins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  version: text("version").notNull(),
  description: text("description"),
  authorId: integer("author_id").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  manifestUrl: text("manifest_url"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creatorPublishJobsTable = pgTable("creator_publish_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  status: publishStatusEnum("status").default("pending").notNull(),
  errorMessage: text("error_message"),
  payload: jsonb("payload").default({}).notNull(),
  result: jsonb("result").default({}).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorLogsTable = pgTable("creator_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  level: text("level").default("info").notNull(),
  message: text("message"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorSettingsTable = pgTable("creator_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" })
    .unique(),
  theme: text("theme").default("dark").notNull(),
  language: text("language").default("en").notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Insert Schemas ───────────────────────────────────────────────────────────

export const insertCreatorUserSchema = createInsertSchema(
  creatorUsersTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorProjectSchema = createInsertSchema(
  creatorProjectsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorDocumentSchema = createInsertSchema(
  creatorDocumentsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorAssetSchema = createInsertSchema(
  creatorAssetsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorPackageSchema = createInsertSchema(
  creatorPackagesTable,
).omit({ id: true, createdAt: true });

export const insertCreatorTemplateSchema = createInsertSchema(
  creatorTemplatesTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorPluginSchema = createInsertSchema(
  creatorPluginsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCreatorPublishJobSchema = createInsertSchema(
  creatorPublishJobsTable,
).omit({ id: true, createdAt: true });

export const insertCreatorLogSchema = createInsertSchema(
  creatorLogsTable,
).omit({ id: true, createdAt: true });

export const insertCreatorSettingsSchema = createInsertSchema(
  creatorSettingsTable,
).omit({ id: true, updatedAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreatorUser = typeof creatorUsersTable.$inferSelect;
export type InsertCreatorUser = z.infer<typeof insertCreatorUserSchema>;

export type CreatorProject = typeof creatorProjectsTable.$inferSelect;
export type InsertCreatorProject = z.infer<typeof insertCreatorProjectSchema>;

export type CreatorDocument = typeof creatorDocumentsTable.$inferSelect;
export type InsertCreatorDocument = z.infer<typeof insertCreatorDocumentSchema>;

export type CreatorAsset = typeof creatorAssetsTable.$inferSelect;
export type InsertCreatorAsset = z.infer<typeof insertCreatorAssetSchema>;

export type CreatorPackage = typeof creatorPackagesTable.$inferSelect;
export type InsertCreatorPackage = z.infer<typeof insertCreatorPackageSchema>;

export type CreatorTemplate = typeof creatorTemplatesTable.$inferSelect;
export type InsertCreatorTemplate = z.infer<typeof insertCreatorTemplateSchema>;

export type CreatorPlugin = typeof creatorPluginsTable.$inferSelect;
export type InsertCreatorPlugin = z.infer<typeof insertCreatorPluginSchema>;

export type CreatorPublishJob = typeof creatorPublishJobsTable.$inferSelect;
export type InsertCreatorPublishJob = z.infer<
  typeof insertCreatorPublishJobSchema
>;

export type CreatorLog = typeof creatorLogsTable.$inferSelect;
export type InsertCreatorLog = z.infer<typeof insertCreatorLogSchema>;

export type CreatorSettings = typeof creatorSettingsTable.$inferSelect;
export type InsertCreatorSettings = z.infer<typeof insertCreatorSettingsSchema>;
