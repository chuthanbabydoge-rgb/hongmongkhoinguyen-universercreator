import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorPipelineAssetsTable,
  creatorAssetFoldersTable,
  creatorAssetCollectionsTable,
  creatorAssetCollectionItemsTable,
  creatorAssetVersionsTable,
  creatorAssetTagsTable,
  creatorAssetDependenciesTable,
  creatorAssetProcessingJobsTable,
  creatorAssetThumbnailsTable,
  creatorAssetImportsTable,
  creatorAssetExportsTable,
  creatorAssetUsageTable,
  creatorAssetReferencesTable,
} from "@workspace/db";
import {
  eq,
  and,
  count,
  desc,
  asc,
  ilike,
  inArray,
  or,
} from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 100);
}

async function createProcessingJobs(assetId: number) {
  const steps = [
    "virus_scan",
    "checksum",
    "metadata_extract",
    "thumbnail",
    "optimize",
    "compress",
  ];
  await db.insert(creatorAssetProcessingJobsTable).values(
    steps.map((step, i) => ({
      assetId,
      step,
      status: i === 0 ? ("processing" as const) : ("pending" as const),
    })),
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────

router.get("/pipeline/search", requireAuth, async (req: AuthRequest, res) => {
  try {
    const q = (req.query["q"] as string) ?? "";
    const type = req.query["type"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const folderId = req.query["folderId"] ? Number(req.query["folderId"]) : undefined;
    const projectId = req.query["projectId"] ? Number(req.query["projectId"]) : undefined;
    const sort = (req.query["sort"] as string) ?? "newest";
    const limit = Math.min(Number(req.query["limit"] ?? 24), 100);
    const offset = Number(req.query["offset"] ?? 0);

    const conditions: ReturnType<typeof eq>[] = [
      eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId),
    ];
    if (q) conditions.push(ilike(creatorPipelineAssetsTable.name, `%${q}%`));
    if (type) conditions.push(eq(creatorPipelineAssetsTable.type, type as never));
    if (status) conditions.push(eq(creatorPipelineAssetsTable.status, status as never));
    if (folderId) conditions.push(eq(creatorPipelineAssetsTable.folderId, folderId));
    if (projectId) conditions.push(eq(creatorPipelineAssetsTable.projectId, projectId));

    const orderBy =
      sort === "oldest" ? asc(creatorPipelineAssetsTable.createdAt)
      : sort === "largest" ? desc(creatorPipelineAssetsTable.size)
      : sort === "smallest" ? asc(creatorPipelineAssetsTable.size)
      : sort === "alpha" ? asc(creatorPipelineAssetsTable.name)
      : desc(creatorPipelineAssetsTable.createdAt);

    const [items, [totRow]] = await Promise.all([
      db.select().from(creatorPipelineAssetsTable)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit).offset(offset),
      db.select({ total: count() }).from(creatorPipelineAssetsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Assets CRUD ──────────────────────────────────────────────────────────────

router.get("/pipeline", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 24), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const projectId = req.query["projectId"] ? Number(req.query["projectId"]) : undefined;
    const folderId = req.query["folderId"] ? Number(req.query["folderId"]) : undefined;
    const type = req.query["type"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const sort = (req.query["sort"] as string) ?? "newest";

    const conditions: ReturnType<typeof eq>[] = [
      eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId),
    ];
    if (projectId) conditions.push(eq(creatorPipelineAssetsTable.projectId, projectId));
    if (folderId) conditions.push(eq(creatorPipelineAssetsTable.folderId, folderId));
    if (type) conditions.push(eq(creatorPipelineAssetsTable.type, type as never));
    if (status) conditions.push(eq(creatorPipelineAssetsTable.status, status as never));

    const orderBy =
      sort === "oldest" ? asc(creatorPipelineAssetsTable.createdAt)
      : sort === "largest" ? desc(creatorPipelineAssetsTable.size)
      : sort === "smallest" ? asc(creatorPipelineAssetsTable.size)
      : sort === "alpha" ? asc(creatorPipelineAssetsTable.name)
      : desc(creatorPipelineAssetsTable.updatedAt);

    const [items, [totRow]] = await Promise.all([
      db.select().from(creatorPipelineAssetsTable)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit).offset(offset),
      db.select({ total: count() }).from(creatorPipelineAssetsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, filename, type, projectId, folderId, description, mimeType, extension, size, checksum, metadata, tags } =
      req.body as {
        name: string; filename: string;
        type: "image"|"audio"|"video"|"model"|"texture"|"icon"|"document"|"font"|"script"|"material"|"animation"|"prefab";
        projectId?: number; folderId?: number; description?: string;
        mimeType?: string; extension?: string; size?: number; checksum?: string;
        metadata?: Record<string, unknown>; tags?: string[];
      };

    if (!name || !filename || !type) {
      res.status(400).json({ error: "BadRequest", message: "name, filename, type required" });
      return;
    }

    const [asset] = await db.insert(creatorPipelineAssetsTable).values({
      name,
      slug: slugify(name),
      filename,
      type,
      projectId,
      folderId,
      description,
      mimeType,
      extension: extension ?? filename.split(".").pop(),
      size,
      checksum,
      metadata: metadata ?? {},
      tags: tags ?? [],
      status: "processing",
      createdBy: req.auth!.userId,
      updatedBy: req.auth!.userId,
    }).returning();

    await createProcessingJobs(asset!.id);

    if (tags?.length) {
      await db.insert(creatorAssetTagsTable).values(
        tags.map(t => ({ assetId: asset!.id, tag: t }))
      ).onConflictDoNothing();
    }

    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/pipeline/types", requireAuth, async (_req, res) => {
  res.json({
    types: ["image","audio","video","model","texture","icon","document","font","script","material","animation","prefab"],
    statuses: ["pending","uploading","processing","ready","failed"],
  });
});

router.get("/pipeline/jobs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 20), 100);
    const offset = Number(req.query["offset"] ?? 0);

    const myAssets = db.select({ id: creatorPipelineAssetsTable.id })
      .from(creatorPipelineAssetsTable)
      .where(eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId));

    const jobs = await db.select().from(creatorAssetProcessingJobsTable)
      .where(inArray(creatorAssetProcessingJobsTable.assetId, myAssets))
      .orderBy(desc(creatorAssetProcessingJobsTable.createdAt))
      .limit(limit).offset(offset);

    res.json({ items: jobs, total: jobs.length });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/pipeline/thumbnails", requireAuth, async (req: AuthRequest, res) => {
  try {
    const assetId = req.query["assetId"] ? Number(req.query["assetId"]) : undefined;
    const conditions = assetId
      ? [eq(creatorAssetThumbnailsTable.assetId, assetId)]
      : [];

    const thumbs = await db.select().from(creatorAssetThumbnailsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(creatorAssetThumbnailsTable.createdAt))
      .limit(50);

    res.json({ items: thumbs });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/pipeline/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [asset] = await db.select().from(creatorPipelineAssetsTable)
      .where(and(eq(creatorPipelineAssetsTable.id, id), eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId)))
      .limit(1);

    if (!asset) { res.status(404).json({ error: "NotFound", message: "Asset not found" }); return; }

    const [jobs, thumbs, deps, versions] = await Promise.all([
      db.select().from(creatorAssetProcessingJobsTable)
        .where(eq(creatorAssetProcessingJobsTable.assetId, id))
        .orderBy(asc(creatorAssetProcessingJobsTable.createdAt)),
      db.select().from(creatorAssetThumbnailsTable).where(eq(creatorAssetThumbnailsTable.assetId, id)),
      db.select().from(creatorAssetDependenciesTable).where(eq(creatorAssetDependenciesTable.assetId, id)),
      db.select().from(creatorAssetVersionsTable).where(eq(creatorAssetVersionsTable.assetId, id))
        .orderBy(desc(creatorAssetVersionsTable.version)).limit(10),
    ]);

    res.json({ ...asset, processingJobs: jobs, thumbnails: thumbs, dependencies: deps, versions });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/pipeline/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [existing] = await db.select().from(creatorPipelineAssetsTable)
      .where(and(eq(creatorPipelineAssetsTable.id, id), eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId)))
      .limit(1);

    if (!existing) { res.status(404).json({ error: "NotFound", message: "Asset not found" }); return; }

    const { name, description, folderId, tags, status, metadata } = req.body as {
      name?: string; description?: string; folderId?: number | null; tags?: string[];
      status?: "pending"|"uploading"|"processing"|"ready"|"failed";
      metadata?: Record<string, unknown>;
    };

    const updates: Partial<typeof existing> = { updatedAt: new Date(), updatedBy: req.auth!.userId };
    if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
    if (description !== undefined) updates.description = description;
    if (folderId !== undefined) updates.folderId = folderId;
    if (status !== undefined) updates.status = status;
    if (metadata !== undefined) updates.metadata = metadata;
    if (tags !== undefined) updates.tags = tags;

    const [updated] = await db.update(creatorPipelineAssetsTable)
      .set(updates)
      .where(eq(creatorPipelineAssetsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/pipeline/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);

    const usageCount = await db.select({ total: count() }).from(creatorAssetUsageTable)
      .where(eq(creatorAssetUsageTable.assetId, id));

    if ((usageCount[0]?.total ?? 0) > 0) {
      res.status(409).json({ error: "Conflict", message: "Asset is currently in use and cannot be deleted" });
      return;
    }

    await db.delete(creatorPipelineAssetsTable)
      .where(and(eq(creatorPipelineAssetsTable.id, id), eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId)));

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/:id/copy", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [original] = await db.select().from(creatorPipelineAssetsTable)
      .where(and(eq(creatorPipelineAssetsTable.id, id), eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId)))
      .limit(1);

    if (!original) { res.status(404).json({ error: "NotFound", message: "Asset not found" }); return; }

    const { name, folderId } = req.body as { name?: string; folderId?: number };
    const copyName = name ?? `${original.name} (copy)`;

    const [copy] = await db.insert(creatorPipelineAssetsTable).values({
      ...original,
      id: undefined as never,
      name: copyName,
      slug: slugify(copyName),
      folderId: folderId ?? original.folderId,
      status: "ready",
      createdBy: req.auth!.userId,
      updatedBy: req.auth!.userId,
      createdAt: undefined as never,
      updatedAt: undefined as never,
    }).returning();

    res.status(201).json(copy);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/:id/move", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { folderId } = req.body as { folderId: number | null };

    const [updated] = await db.update(creatorPipelineAssetsTable)
      .set({ folderId, updatedAt: new Date(), updatedBy: req.auth!.userId })
      .where(and(eq(creatorPipelineAssetsTable.id, id), eq(creatorPipelineAssetsTable.createdBy, req.auth!.userId)))
      .returning();

    if (!updated) { res.status(404).json({ error: "NotFound", message: "Asset not found" }); return; }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/:id/restore", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { versionId } = req.body as { versionId: number };

    const [version] = await db.select().from(creatorAssetVersionsTable)
      .where(and(eq(creatorAssetVersionsTable.id, versionId), eq(creatorAssetVersionsTable.assetId, id)))
      .limit(1);

    if (!version) { res.status(404).json({ error: "NotFound", message: "Version not found" }); return; }

    const [updated] = await db.update(creatorPipelineAssetsTable)
      .set({
        filename: version.filename,
        size: version.size,
        checksum: version.checksum,
        metadata: version.metadata,
        updatedAt: new Date(),
        updatedBy: req.auth!.userId,
      })
      .where(eq(creatorPipelineAssetsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Versions ─────────────────────────────────────────────────────────────────

router.get("/pipeline/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const versions = await db.select().from(creatorAssetVersionsTable)
      .where(eq(creatorAssetVersionsTable.assetId, id))
      .orderBy(desc(creatorAssetVersionsTable.version));

    res.json({ items: versions });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/:id/version", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { filename, size, checksum, note, metadata } = req.body as {
      filename: string; size?: number; checksum?: string; note?: string;
      metadata?: Record<string, unknown>;
    };

    const [lastVer] = await db.select({ v: creatorAssetVersionsTable.version })
      .from(creatorAssetVersionsTable)
      .where(eq(creatorAssetVersionsTable.assetId, id))
      .orderBy(desc(creatorAssetVersionsTable.version)).limit(1);

    const nextVersion = (lastVer?.v ?? 0) + 1;

    const [version] = await db.insert(creatorAssetVersionsTable).values({
      assetId: id,
      version: nextVersion,
      filename,
      size,
      checksum,
      note,
      metadata: metadata ?? {},
      createdBy: req.auth!.userId,
    }).returning();

    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Usage ────────────────────────────────────────────────────────────────────

router.get("/pipeline/:id/usage", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const usage = await db.select().from(creatorAssetUsageTable)
      .where(eq(creatorAssetUsageTable.assetId, id))
      .orderBy(desc(creatorAssetUsageTable.usedAt));

    res.json({ items: usage, total: usage.length });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Dependencies ─────────────────────────────────────────────────────────────

router.get("/pipeline/:id/dependencies", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [deps, refs] = await Promise.all([
      db.select().from(creatorAssetDependenciesTable)
        .where(or(
          eq(creatorAssetDependenciesTable.assetId, id),
          eq(creatorAssetDependenciesTable.dependsOnId, id),
        )),
      db.select().from(creatorAssetReferencesTable)
        .where(eq(creatorAssetReferencesTable.assetId, id)),
    ]);

    res.json({ dependencies: deps, references: refs });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Folders ──────────────────────────────────────────────────────────────────

router.get("/pipeline/folders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = req.query["projectId"] ? Number(req.query["projectId"]) : undefined;
    const conditions: ReturnType<typeof eq>[] = [eq(creatorAssetFoldersTable.userId, req.auth!.userId)];
    if (projectId) conditions.push(eq(creatorAssetFoldersTable.projectId, projectId));

    const folders = await db.select().from(creatorAssetFoldersTable)
      .where(and(...conditions))
      .orderBy(asc(creatorAssetFoldersTable.name));

    res.json({ items: folders });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/folders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, projectId, parentId, color, icon } = req.body as {
      name: string; projectId?: number; parentId?: number; color?: string; icon?: string;
    };

    if (!name) { res.status(400).json({ error: "BadRequest", message: "name required" }); return; }

    const [folder] = await db.insert(creatorAssetFoldersTable).values({
      name, userId: req.auth!.userId, projectId, parentId, color, icon,
    }).returning();

    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/pipeline/folders/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name, parentId, color, icon } = req.body as {
      name?: string; parentId?: number | null; color?: string; icon?: string;
    };

    const updates: Partial<{ name: string; parentId: number | null; color: string; icon: string; updatedAt: Date }> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (parentId !== undefined) updates.parentId = parentId;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;

    const [updated] = await db.update(creatorAssetFoldersTable)
      .set(updates)
      .where(and(eq(creatorAssetFoldersTable.id, id), eq(creatorAssetFoldersTable.userId, req.auth!.userId)))
      .returning();

    if (!updated) { res.status(404).json({ error: "NotFound", message: "Folder not found" }); return; }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/pipeline/folders/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);

    const assetCount = await db.select({ total: count() }).from(creatorPipelineAssetsTable)
      .where(eq(creatorPipelineAssetsTable.folderId, id));

    if ((assetCount[0]?.total ?? 0) > 0) {
      res.status(409).json({ error: "Conflict", message: "Folder is not empty. Move or delete assets first." });
      return;
    }

    await db.delete(creatorAssetFoldersTable)
      .where(and(eq(creatorAssetFoldersTable.id, id), eq(creatorAssetFoldersTable.userId, req.auth!.userId)));

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Collections ──────────────────────────────────────────────────────────────

router.get("/pipeline/collections", requireAuth, async (req: AuthRequest, res) => {
  try {
    const collections = await db.select().from(creatorAssetCollectionsTable)
      .where(eq(creatorAssetCollectionsTable.userId, req.auth!.userId))
      .orderBy(desc(creatorAssetCollectionsTable.updatedAt));

    const withCounts = await Promise.all(collections.map(async (col) => {
      const [row] = await db.select({ total: count() }).from(creatorAssetCollectionItemsTable)
        .where(eq(creatorAssetCollectionItemsTable.collectionId, col.id));
      return { ...col, assetCount: row?.total ?? 0 };
    }));

    res.json({ items: withCounts });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/collections", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, description, thumbnail, projectId, isPublic } = req.body as {
      name: string; description?: string; thumbnail?: string; projectId?: number; isPublic?: boolean;
    };

    if (!name) { res.status(400).json({ error: "BadRequest", message: "name required" }); return; }

    const [collection] = await db.insert(creatorAssetCollectionsTable).values({
      name, description, thumbnail, projectId,
      isPublic: isPublic ?? false,
      userId: req.auth!.userId,
    }).returning();

    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/pipeline/collections/:id/items", requireAuth, async (req: AuthRequest, res) => {
  try {
    const collectionId = Number(req.params["id"]);
    const { assetId } = req.body as { assetId: number };

    await db.insert(creatorAssetCollectionItemsTable)
      .values({ collectionId, assetId })
      .onConflictDoNothing();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/pipeline/collections/:id/items/:assetId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const collectionId = Number(req.params["id"]);
    const assetId = Number(req.params["assetId"]);

    await db.delete(creatorAssetCollectionItemsTable)
      .where(and(
        eq(creatorAssetCollectionItemsTable.collectionId, collectionId),
        eq(creatorAssetCollectionItemsTable.assetId, assetId),
      ));

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Import ───────────────────────────────────────────────────────────────────

router.post("/pipeline/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { source, projectId, filename, url, payload } = req.body as {
      source: "upload"|"url"|"package"|"marketplace";
      projectId?: number; filename?: string; url?: string;
      payload?: Record<string, unknown>;
    };

    if (!source) { res.status(400).json({ error: "BadRequest", message: "source required" }); return; }

    const [importJob] = await db.insert(creatorAssetImportsTable).values({
      source, projectId, filename, url,
      userId: req.auth!.userId,
      status: "processing",
      payload: payload ?? {},
    }).returning();

    const assets: { name: string; filename: string; type: string }[] = (payload?.assets as never[]) ?? [];
    let importedCount = 0;

    for (const a of assets) {
      if (!a.name || !a.filename || !a.type) continue;
      try {
        await db.insert(creatorPipelineAssetsTable).values({
          name: a.name,
          filename: a.filename,
          type: (a.type as never) ?? "document",
          slug: slugify(a.name),
          status: "ready",
          metadata: {},
          tags: [],
          createdBy: req.auth!.userId,
          updatedBy: req.auth!.userId,
          projectId,
        });
        importedCount++;
      } catch (_) {}
    }

    await db.update(creatorAssetImportsTable)
      .set({ status: "ready", importedCount, completedAt: new Date() })
      .where(eq(creatorAssetImportsTable.id, importJob!.id));

    res.status(201).json({ ...importJob, importedCount });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

router.post("/pipeline/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { assetIds, projectId, format } = req.body as {
      assetIds?: number[]; projectId?: number; format?: string;
    };

    const [exportJob] = await db.insert(creatorAssetExportsTable).values({
      userId: req.auth!.userId,
      projectId,
      assetIds: assetIds ?? [],
      format: format ?? "zip",
      status: "ready",
      downloadUrl: null,
      completedAt: new Date(),
    }).returning();

    res.status(201).json(exportJob);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
