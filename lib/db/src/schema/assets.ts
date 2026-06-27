import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  bigint,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { creatorUsersTable, creatorProjectsTable } from "./creator";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const assetPipelineTypeEnum = pgEnum("asset_pipeline_type", [
  "image",
  "audio",
  "video",
  "model",
  "texture",
  "icon",
  "document",
  "font",
  "script",
  "material",
  "animation",
  "prefab",
]);

export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "uploading",
  "processing",
  "ready",
  "failed",
]);

export const thumbnailTypeEnum = pgEnum("thumbnail_type", [
  "small",
  "medium",
  "large",
]);

export const importSourceEnum = pgEnum("import_source", [
  "upload",
  "url",
  "package",
  "marketplace",
]);

// ─── Asset Folders ────────────────────────────────────────────────────────────

export const creatorAssetFoldersTable = pgTable("creator_asset_folders", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "cascade",
  }),
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

// ─── Pipeline Assets (main table) ─────────────────────────────────────────────

export const creatorPipelineAssetsTable = pgTable("creator_pipeline_assets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "set null",
  }),
  folderId: integer("folder_id").references(
    () => creatorAssetFoldersTable.id,
    { onDelete: "set null" },
  ),
  type: assetPipelineTypeEnum("type").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  extension: text("extension"),
  size: bigint("size", { mode: "number" }),
  checksum: text("checksum"),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  polygonCount: integer("polygon_count"),
  thumbnail: text("thumbnail"),
  preview: text("preview"),
  status: processingStatusEnum("status").default("pending").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  tags: text("tags").array().default([]).notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  updatedBy: integer("updated_by").references(() => creatorUsersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Asset Collections ────────────────────────────────────────────────────────

export const creatorAssetCollectionsTable = pgTable(
  "creator_asset_collections",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(
      () => creatorProjectsTable.id,
      { onDelete: "cascade" },
    ),
    userId: integer("user_id")
      .notNull()
      .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

export const creatorAssetCollectionItemsTable = pgTable(
  "creator_asset_collection_items",
  {
    id: serial("id").primaryKey(),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => creatorAssetCollectionsTable.id, {
        onDelete: "cascade",
      }),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.collectionId, t.assetId)],
);

// ─── Asset Versions ───────────────────────────────────────────────────────────

export const creatorAssetVersionsTable = pgTable("creator_asset_versions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  filename: text("filename").notNull(),
  size: bigint("size", { mode: "number" }),
  checksum: text("checksum"),
  metadata: jsonb("metadata").default({}).notNull(),
  note: text("note"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Asset Tags ───────────────────────────────────────────────────────────────

export const creatorAssetTagsTable = pgTable(
  "creator_asset_tags",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.assetId, t.tag)],
);

// ─── Asset Metadata (rich extracted metadata) ─────────────────────────────────

export const creatorAssetMetadataTable = pgTable("creator_asset_metadata", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .unique()
    .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
  exifData: jsonb("exif_data").default({}).notNull(),
  colorPalette: text("color_palette").array().default([]).notNull(),
  aiTags: text("ai_tags").array().default([]).notNull(),
  customFields: jsonb("custom_fields").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Asset Dependencies ───────────────────────────────────────────────────────

export const creatorAssetDependenciesTable = pgTable(
  "creator_asset_dependencies",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    dependsOnId: integer("depends_on_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    label: text("label"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.assetId, t.dependsOnId)],
);

// ─── Asset References (entities that use this asset) ─────────────────────────

export const creatorAssetReferencesTable = pgTable(
  "creator_asset_references",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    fieldPath: text("field_path"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.assetId, t.entityType, t.entityId)],
);

// ─── Processing Jobs ──────────────────────────────────────────────────────────

export const creatorAssetProcessingJobsTable = pgTable(
  "creator_asset_processing_jobs",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    step: text("step").notNull(),
    status: processingStatusEnum("status").default("pending").notNull(),
    log: text("log"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// ─── Thumbnails ───────────────────────────────────────────────────────────────

export const creatorAssetThumbnailsTable = pgTable(
  "creator_asset_thumbnails",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    thumbnailType: thumbnailTypeEnum("thumbnail_type").notNull(),
    url: text("url").notNull(),
    width: integer("width"),
    height: integer("height"),
    size: integer("size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.assetId, t.thumbnailType)],
);

// ─── Imports ──────────────────────────────────────────────────────────────────

export const creatorAssetImportsTable = pgTable("creator_asset_imports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "cascade",
  }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  source: importSourceEnum("source").notNull(),
  status: processingStatusEnum("status").default("pending").notNull(),
  filename: text("filename"),
  url: text("url"),
  importedCount: integer("imported_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  errorMessage: text("error_message"),
  payload: jsonb("payload").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const creatorAssetExportsTable = pgTable("creator_asset_exports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => creatorProjectsTable.id, {
    onDelete: "set null",
  }),
  userId: integer("user_id")
    .notNull()
    .references(() => creatorUsersTable.id, { onDelete: "cascade" }),
  assetIds: integer("asset_ids").array().default([]).notNull(),
  format: text("format").default("zip").notNull(),
  status: processingStatusEnum("status").default("pending").notNull(),
  downloadUrl: text("download_url"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Usage ────────────────────────────────────────────────────────────────────

export const creatorAssetUsageTable = pgTable(
  "creator_asset_usage",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => creatorPipelineAssetsTable.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    entityName: text("entity_name"),
    usedAt: timestamp("used_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.assetId, t.entityType, t.entityId)],
);

// ─── Insert Schemas ───────────────────────────────────────────────────────────

export const insertAssetFolderSchema = createInsertSchema(
  creatorAssetFoldersTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPipelineAssetSchema = createInsertSchema(
  creatorPipelineAssetsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAssetCollectionSchema = createInsertSchema(
  creatorAssetCollectionsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAssetVersionSchema = createInsertSchema(
  creatorAssetVersionsTable,
).omit({ id: true, createdAt: true });

export const insertAssetProcessingJobSchema = createInsertSchema(
  creatorAssetProcessingJobsTable,
).omit({ id: true, createdAt: true });

export const insertAssetImportSchema = createInsertSchema(
  creatorAssetImportsTable,
).omit({ id: true, createdAt: true });

export const insertAssetExportSchema = createInsertSchema(
  creatorAssetExportsTable,
).omit({ id: true, createdAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssetFolder = typeof creatorAssetFoldersTable.$inferSelect;
export type InsertAssetFolder = z.infer<typeof insertAssetFolderSchema>;

export type PipelineAsset = typeof creatorPipelineAssetsTable.$inferSelect;
export type InsertPipelineAsset = z.infer<typeof insertPipelineAssetSchema>;

export type AssetCollection = typeof creatorAssetCollectionsTable.$inferSelect;
export type InsertAssetCollection = z.infer<typeof insertAssetCollectionSchema>;

export type AssetVersion = typeof creatorAssetVersionsTable.$inferSelect;
export type InsertAssetVersion = z.infer<typeof insertAssetVersionSchema>;

export type AssetProcessingJob =
  typeof creatorAssetProcessingJobsTable.$inferSelect;
export type AssetImport = typeof creatorAssetImportsTable.$inferSelect;
export type AssetExport = typeof creatorAssetExportsTable.$inferSelect;
export type AssetUsage = typeof creatorAssetUsageTable.$inferSelect;
export type AssetThumbnail = typeof creatorAssetThumbnailsTable.$inferSelect;
export type AssetDependency =
  typeof creatorAssetDependenciesTable.$inferSelect;
export type AssetReference = typeof creatorAssetReferencesTable.$inferSelect;
export type AssetMetadata = typeof creatorAssetMetadataTable.$inferSelect;
