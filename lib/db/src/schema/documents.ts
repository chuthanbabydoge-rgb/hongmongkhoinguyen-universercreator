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
import {
  creatorUsersTable,
  creatorProjectsTable,
  creatorDocumentsTable,
} from "./creator";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const relationTypeEnum = pgEnum("relation_type", [
  "parent",
  "child",
  "reference",
  "dependency",
  "linked",
]);

export const exportFormatEnum = pgEnum("export_format", [
  "json",
  "zip",
  "package",
]);

// ─── Folders ─────────────────────────────────────────────────────────────────

export const creatorDocumentFoldersTable = pgTable("creator_document_folders", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Document Versions ────────────────────────────────────────────────────────

export const creatorDocumentVersionsTable = pgTable(
  "creator_document_versions",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .notNull()
      .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    name: text("name").notNull(),
    content: jsonb("content").default({}).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    status: text("status").default("draft").notNull(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// ─── Document Relations ───────────────────────────────────────────────────────

export const creatorDocumentRelationsTable = pgTable(
  "creator_document_relations",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
    targetId: integer("target_id")
      .notNull()
      .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
    relationType: relationTypeEnum("relation_type").notNull(),
    label: text("label"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.sourceId, t.targetId, t.relationType)],
);

// ─── Document Locks ───────────────────────────────────────────────────────────

export const creatorDocumentLocksTable = pgTable("creator_document_locks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .unique()
    .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
  lockedBy: integer("locked_by")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  lockedAt: timestamp("locked_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// ─── Document Bookmarks ───────────────────────────────────────────────────────

export const creatorDocumentBookmarksTable = pgTable(
  "creator_document_bookmarks",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .notNull()
      .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.documentId, t.userId)],
);

// ─── Document History ─────────────────────────────────────────────────────────

export const creatorDocumentHistoryTable = pgTable("creator_document_history", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  description: text("description"),
  before: jsonb("before").default({}).notNull(),
  after: jsonb("after").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Document Exports ─────────────────────────────────────────────────────────

export const creatorDocumentExportsTable = pgTable("creator_document_exports", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .references(() => creatorDocumentsTable.id, { onDelete: "set null" }),
  projectId: integer("project_id")
    .references(() => creatorProjectsTable.id, { onDelete: "set null" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  format: exportFormatEnum("format").notNull(),
  status: text("status").default("pending").notNull(),
  downloadUrl: text("download_url"),
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Document Imports ─────────────────────────────────────────────────────────

export const creatorDocumentImportsTable = pgTable("creator_document_imports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => creatorProjectsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  format: exportFormatEnum("format").notNull(),
  status: text("status").default("pending").notNull(),
  errorMessage: text("error_message"),
  payload: jsonb("payload").default({}).notNull(),
  importedCount: integer("imported_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Extended Document Tags ───────────────────────────────────────────────────

export const creatorDocumentTagsTable = pgTable(
  "creator_document_tags",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .notNull()
      .references(() => creatorDocumentsTable.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.documentId, t.tag)],
);

// ─── Insert Schemas ───────────────────────────────────────────────────────────

export const insertDocumentFolderSchema = createInsertSchema(
  creatorDocumentFoldersTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertDocumentVersionSchema = createInsertSchema(
  creatorDocumentVersionsTable,
).omit({ id: true, createdAt: true });

export const insertDocumentRelationSchema = createInsertSchema(
  creatorDocumentRelationsTable,
).omit({ id: true, createdAt: true });

export const insertDocumentLockSchema = createInsertSchema(
  creatorDocumentLocksTable,
).omit({ id: true, lockedAt: true });

export const insertDocumentBookmarkSchema = createInsertSchema(
  creatorDocumentBookmarksTable,
).omit({ id: true, createdAt: true });

export const insertDocumentHistorySchema = createInsertSchema(
  creatorDocumentHistoryTable,
).omit({ id: true, createdAt: true });

export const insertDocumentExportSchema = createInsertSchema(
  creatorDocumentExportsTable,
).omit({ id: true, createdAt: true });

export const insertDocumentImportSchema = createInsertSchema(
  creatorDocumentImportsTable,
).omit({ id: true, createdAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentFolder = typeof creatorDocumentFoldersTable.$inferSelect;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;

export type DocumentVersion = typeof creatorDocumentVersionsTable.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export type DocumentRelation =
  typeof creatorDocumentRelationsTable.$inferSelect;
export type InsertDocumentRelation = z.infer<
  typeof insertDocumentRelationSchema
>;

export type DocumentLock = typeof creatorDocumentLocksTable.$inferSelect;
export type DocumentBookmark =
  typeof creatorDocumentBookmarksTable.$inferSelect;

export type DocumentHistory = typeof creatorDocumentHistoryTable.$inferSelect;
export type DocumentExport = typeof creatorDocumentExportsTable.$inferSelect;
export type DocumentImport = typeof creatorDocumentImportsTable.$inferSelect;
