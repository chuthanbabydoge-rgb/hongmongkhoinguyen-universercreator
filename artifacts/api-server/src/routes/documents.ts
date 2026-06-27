import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorDocumentsTable,
  creatorProjectsTable,
  creatorProjectMembersTable,
} from "@workspace/db";
import {
  creatorDocumentVersionsTable,
  creatorDocumentRelationsTable,
  creatorDocumentLocksTable,
  creatorDocumentBookmarksTable,
  creatorDocumentHistoryTable,
  creatorDocumentFoldersTable,
  creatorDocumentExportsTable,
  creatorDocumentImportsTable,
} from "@workspace/db";
import {
  eq,
  and,
  count,
  desc,
  asc,
  or,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function canAccessProject(
  userId: number,
  projectId: number,
): Promise<boolean> {
  const [owner] = await db
    .select({ id: creatorProjectsTable.id })
    .from(creatorProjectsTable)
    .where(
      and(
        eq(creatorProjectsTable.id, projectId),
        eq(creatorProjectsTable.userId, userId),
      ),
    )
    .limit(1);
  if (owner) return true;

  const [member] = await db
    .select({ id: creatorProjectMembersTable.id })
    .from(creatorProjectMembersTable)
    .where(
      and(
        eq(creatorProjectMembersTable.projectId, projectId),
        eq(creatorProjectMembersTable.userId, userId),
      ),
    )
    .limit(1);
  return !!member;
}

async function recordHistory(
  documentId: number,
  userId: number,
  action: string,
  description: string,
  before: Record<string, unknown> = {},
  after: Record<string, unknown> = {},
) {
  await db.insert(creatorDocumentHistoryTable).values({
    documentId,
    userId,
    action,
    description,
    before,
    after,
  });
}

async function snapshotVersion(
  doc: typeof creatorDocumentsTable.$inferSelect,
) {
  await db.insert(creatorDocumentVersionsTable).values({
    documentId: doc.id,
    version: doc.version,
    name: doc.name,
    content: doc.content as Record<string, unknown>,
    metadata: doc.metadata as Record<string, unknown>,
    description: doc.description ?? null,
    thumbnail: doc.thumbnail ?? null,
    status: doc.status,
    createdBy: doc.userId,
  });
}

// ─── Document Types ───────────────────────────────────────────────────────────

router.get("/api/documents/types", requireAuth, (_req, res) => {
  const types = [
    { value: "world", label: "World", icon: "🌍" },
    { value: "npc", label: "NPC", icon: "👤" },
    { value: "quest", label: "Quest", icon: "📜" },
    { value: "boss", label: "Boss", icon: "🐉" },
    { value: "dungeon", label: "Dungeon", icon: "🏰" },
    { value: "item", label: "Item", icon: "⚔️" },
    { value: "skill", label: "Skill", icon: "✨" },
    { value: "pet", label: "Pet", icon: "🐾" },
    { value: "mount", label: "Mount", icon: "🐴" },
    { value: "dialogue", label: "Dialogue", icon: "💬" },
    { value: "company", label: "Company", icon: "🏢" },
    { value: "course", label: "Course", icon: "📚" },
    { value: "tournament", label: "Tournament", icon: "🏆" },
    { value: "city", label: "City", icon: "🏙️" },
    { value: "building", label: "Building", icon: "🏗️" },
    { value: "education", label: "Education", icon: "🎓" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "land", label: "Land", icon: "🗺️" },
    { value: "nation", label: "Nation", icon: "🚩" },
  ];
  res.json({ types });
});

// ─── Search ───────────────────────────────────────────────────────────────────

router.get("/api/documents/search", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      q,
      type,
      status,
      projectId,
      folderId,
      tag,
      sort = "updated",
      limit: lim = "20",
      offset: off = "0",
    } = req.query as Record<string, string>;

    const limit = Math.min(Number(lim), 100);
    const offset = Number(off);

    const conditions: ReturnType<typeof eq>[] = [];

    if (projectId) {
      const pid = Number(projectId);
      const accessible = await canAccessProject(req.auth!.userId, pid);
      if (!accessible) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      conditions.push(eq(creatorDocumentsTable.projectId, pid));
    } else {
      const userProjects = await db
        .select({ id: creatorProjectsTable.id })
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.userId, req.auth!.userId));
      const memberProjects = await db
        .select({ projectId: creatorProjectMembersTable.projectId })
        .from(creatorProjectMembersTable)
        .where(eq(creatorProjectMembersTable.userId, req.auth!.userId));
      const allIds = [
        ...userProjects.map((p) => p.id),
        ...memberProjects.map((p) => p.projectId),
      ];
      if (allIds.length === 0) {
        res.json({ items: [], total: 0, limit, offset });
        return;
      }
      conditions.push(inArray(creatorDocumentsTable.projectId, allIds));
    }

    if (q) {
      conditions.push(
        or(
          ilike(creatorDocumentsTable.name, `%${q}%`),
          ilike(creatorDocumentsTable.description, `%${q}%`),
        ) as ReturnType<typeof eq>,
      );
    }
    if (type) conditions.push(eq(creatorDocumentsTable.type, type as "world"));
    if (status)
      conditions.push(
        eq(creatorDocumentsTable.status, status as "draft"),
      );
    if (folderId)
      conditions.push(
        eq(creatorDocumentsTable.folderId, Number(folderId)),
      );
    if (tag) {
      conditions.push(
        sql`${creatorDocumentsTable.tags} @> ARRAY[${tag}]::text[]` as ReturnType<typeof eq>,
      );
    }

    const orderBy =
      sort === "newest"
        ? desc(creatorDocumentsTable.createdAt)
        : sort === "oldest"
          ? asc(creatorDocumentsTable.createdAt)
          : sort === "alpha"
            ? asc(creatorDocumentsTable.name)
            : desc(creatorDocumentsTable.updatedAt);

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorDocumentsTable)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorDocumentsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Folders ──────────────────────────────────────────────────────────────────

router.get("/api/documents/folders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = Number(req.query["projectId"]);
    if (!projectId) {
      res.status(400).json({ error: "BadRequest", message: "projectId required" });
      return;
    }
    const accessible = await canAccessProject(req.auth!.userId, projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const folders = await db
      .select()
      .from(creatorDocumentFoldersTable)
      .where(eq(creatorDocumentFoldersTable.projectId, projectId))
      .orderBy(asc(creatorDocumentFoldersTable.name));
    res.json({ items: folders });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/documents/folders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId, name, parentId, color, icon } = req.body as {
      projectId: number;
      name: string;
      parentId?: number;
      color?: string;
      icon?: string;
    };
    if (!projectId || !name) {
      res.status(400).json({ error: "BadRequest", message: "projectId and name required" });
      return;
    }
    const accessible = await canAccessProject(req.auth!.userId, projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [folder] = await db
      .insert(creatorDocumentFoldersTable)
      .values({
        projectId,
        userId: req.auth!.userId,
        name,
        parentId: parentId ?? null,
        color: color ?? null,
        icon: icon ?? null,
      })
      .returning();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.patch("/api/documents/folders/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const { name, parentId, color, icon } = req.body as {
      name?: string;
      parentId?: number | null;
      color?: string;
      icon?: string;
    };
    const [folder] = await db
      .update(creatorDocumentFoldersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(parentId !== undefined && { parentId }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(creatorDocumentFoldersTable.id, id),
          eq(creatorDocumentFoldersTable.userId, req.auth!.userId),
        ),
      )
      .returning();
    if (!folder) {
      res.status(404).json({ error: "NotFound" });
      return;
    }
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/documents/folders/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    await db
      .delete(creatorDocumentFoldersTable)
      .where(
        and(
          eq(creatorDocumentFoldersTable.id, id),
          eq(creatorDocumentFoldersTable.userId, req.auth!.userId),
        ),
      );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Export / Import ──────────────────────────────────────────────────────────

router.post("/api/documents/export", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { documentId, projectId, format = "json" } = req.body as {
      documentId?: number;
      projectId?: number;
      format?: "json" | "zip" | "package";
    };

    let exportData: unknown = {};

    if (documentId) {
      const [doc] = await db
        .select()
        .from(creatorDocumentsTable)
        .where(eq(creatorDocumentsTable.id, documentId))
        .limit(1);
      if (!doc) {
        res.status(404).json({ error: "NotFound" });
        return;
      }
      const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
      if (!accessible) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const versions = await db
        .select()
        .from(creatorDocumentVersionsTable)
        .where(eq(creatorDocumentVersionsTable.documentId, documentId))
        .orderBy(desc(creatorDocumentVersionsTable.version));
      exportData = { document: doc, versions, exportedAt: new Date() };
    } else if (projectId) {
      const accessible = await canAccessProject(req.auth!.userId, projectId);
      if (!accessible) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const docs = await db
        .select()
        .from(creatorDocumentsTable)
        .where(eq(creatorDocumentsTable.projectId, projectId));
      exportData = { documents: docs, projectId, exportedAt: new Date() };
    }

    const [exportRecord] = await db
      .insert(creatorDocumentExportsTable)
      .values({
        documentId: documentId ?? null,
        projectId: projectId ?? null,
        userId: req.auth!.userId,
        format: format as "json",
        status: "completed",
        payload: exportData as Record<string, unknown>,
        completedAt: new Date(),
      })
      .returning();

    res.json({ export: exportRecord, data: exportData });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/documents/import", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId, format = "json", data } = req.body as {
      projectId: number;
      format?: "json" | "zip" | "package";
      data: { documents?: Array<Record<string, unknown>>; document?: Record<string, unknown> };
    };

    if (!projectId || !data) {
      res.status(400).json({ error: "BadRequest", message: "projectId and data required" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const docs = data.documents ?? (data.document ? [data.document] : []);
    let imported = 0;

    for (const docData of docs) {
      const slug = `${String(docData["name"] ?? "document").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${imported}`;
      await db.insert(creatorDocumentsTable).values({
        projectId,
        userId: req.auth!.userId,
        type: (docData["type"] as "world") ?? "world",
        name: String(docData["name"] ?? "Imported Document"),
        slug,
        description: docData["description"] ? String(docData["description"]) : null,
        content: (docData["content"] as Record<string, unknown>) ?? {},
        metadata: (docData["metadata"] as Record<string, unknown>) ?? {},
        tags: (docData["tags"] as string[]) ?? [],
        status: "draft",
      });
      imported++;
    }

    const [importRecord] = await db
      .insert(creatorDocumentImportsTable)
      .values({
        projectId,
        userId: req.auth!.userId,
        format: format as "json",
        status: "completed",
        payload: data as Record<string, unknown>,
        importedCount: imported,
        completedAt: new Date(),
      })
      .returning();

    res.json({ import: importRecord, importedCount: imported });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── List Documents ───────────────────────────────────────────────────────────

router.get("/api/documents", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      projectId,
      type,
      status,
      folderId,
      sort = "updated",
      limit: lim = "20",
      offset: off = "0",
    } = req.query as Record<string, string>;

    const limit = Math.min(Number(lim), 100);
    const offset = Number(off);

    const conditions: ReturnType<typeof eq>[] = [];

    if (projectId) {
      const pid = Number(projectId);
      const accessible = await canAccessProject(req.auth!.userId, pid);
      if (!accessible) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      conditions.push(eq(creatorDocumentsTable.projectId, pid));
    } else {
      const userProjects = await db
        .select({ id: creatorProjectsTable.id })
        .from(creatorProjectsTable)
        .where(eq(creatorProjectsTable.userId, req.auth!.userId));
      const memberProjects = await db
        .select({ projectId: creatorProjectMembersTable.projectId })
        .from(creatorProjectMembersTable)
        .where(eq(creatorProjectMembersTable.userId, req.auth!.userId));
      const allIds = [
        ...userProjects.map((p) => p.id),
        ...memberProjects.map((p) => p.projectId),
      ];
      if (allIds.length === 0) {
        res.json({ items: [], total: 0, limit, offset });
        return;
      }
      conditions.push(inArray(creatorDocumentsTable.projectId, allIds));
    }

    if (type) conditions.push(eq(creatorDocumentsTable.type, type as "world"));
    if (status) conditions.push(eq(creatorDocumentsTable.status, status as "draft"));
    if (folderId) conditions.push(eq(creatorDocumentsTable.folderId, Number(folderId)));

    const orderBy =
      sort === "newest"
        ? desc(creatorDocumentsTable.createdAt)
        : sort === "oldest"
          ? asc(creatorDocumentsTable.createdAt)
          : sort === "alpha"
            ? asc(creatorDocumentsTable.name)
            : desc(creatorDocumentsTable.updatedAt);

    const [items, [totRow]] = await Promise.all([
      db
        .select()
        .from(creatorDocumentsTable)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorDocumentsTable)
        .where(and(...conditions)),
    ]);

    res.json({ items, total: totRow?.total ?? 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Create Document ──────────────────────────────────────────────────────────

router.post("/api/documents", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      projectId,
      type,
      name,
      description,
      thumbnail,
      icon,
      visibility,
      tags,
      metadata,
      content,
      folderId,
    } = req.body as {
      projectId: number;
      type: string;
      name: string;
      description?: string;
      thumbnail?: string;
      icon?: string;
      visibility?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      content?: Record<string, unknown>;
      folderId?: number;
    };

    if (!projectId || !type || !name) {
      res.status(400).json({
        error: "BadRequest",
        message: "projectId, type, and name are required",
      });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const [doc] = await db
      .insert(creatorDocumentsTable)
      .values({
        projectId,
        userId: req.auth!.userId,
        type: type as "world",
        name,
        slug,
        description: description ?? null,
        thumbnail: thumbnail ?? null,
        icon: icon ?? null,
        visibility: visibility ?? "private",
        tags: tags ?? [],
        metadata: metadata ?? {},
        content: content ?? {},
        folderId: folderId ?? null,
        status: "draft",
        version: 1,
      })
      .returning();

    await snapshotVersion(doc);
    await recordHistory(doc.id, req.auth!.userId, "created", `Created document "${doc.name}"`);

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Get Document ─────────────────────────────────────────────────────────────

router.get("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [lock] = await db
      .select()
      .from(creatorDocumentLocksTable)
      .where(eq(creatorDocumentLocksTable.documentId, id))
      .limit(1);

    const [bookmark] = await db
      .select()
      .from(creatorDocumentBookmarksTable)
      .where(
        and(
          eq(creatorDocumentBookmarksTable.documentId, id),
          eq(creatorDocumentBookmarksTable.userId, req.auth!.userId),
        ),
      )
      .limit(1);

    res.json({ ...doc, lock: lock ?? null, isBookmarked: !!bookmark });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Update Document ──────────────────────────────────────────────────────────

router.patch("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [existing] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, existing.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const lock = await db
      .select()
      .from(creatorDocumentLocksTable)
      .where(eq(creatorDocumentLocksTable.documentId, id))
      .limit(1);

    if (lock.length > 0 && lock[0]!.lockedBy !== req.auth!.userId) {
      res.status(409).json({ error: "Locked", message: "Document is locked by another user" });
      return;
    }

    const {
      name,
      description,
      thumbnail,
      icon,
      status,
      visibility,
      tags,
      metadata,
      content,
      folderId,
    } = req.body as {
      name?: string;
      description?: string;
      thumbnail?: string;
      icon?: string;
      status?: string;
      visibility?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      content?: Record<string, unknown>;
      folderId?: number | null;
    };

    const newVersion = existing.version + 1;

    const [updated] = await db
      .update(creatorDocumentsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(icon !== undefined && { icon }),
        ...(status !== undefined && { status: status as "draft" }),
        ...(visibility !== undefined && { visibility }),
        ...(tags !== undefined && { tags }),
        ...(metadata !== undefined && { metadata }),
        ...(content !== undefined && { content }),
        ...(folderId !== undefined && { folderId }),
        version: newVersion,
        updatedBy: req.auth!.userId,
        updatedAt: new Date(),
        ...(status === "published" && { publishedAt: new Date() }),
      })
      .where(eq(creatorDocumentsTable.id, id))
      .returning();

    await snapshotVersion(updated!);
    await recordHistory(
      id,
      req.auth!.userId,
      "updated",
      `Updated document "${updated!.name}"`,
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Delete Document ──────────────────────────────────────────────────────────

router.delete("/api/documents/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(creatorDocumentsTable).where(eq(creatorDocumentsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Duplicate ────────────────────────────────────────────────────────────────

router.post("/api/documents/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [original] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!original) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, original.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const slug = `${original.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copy-${Date.now()}`;

    const [duplicate] = await db
      .insert(creatorDocumentsTable)
      .values({
        projectId: original.projectId,
        userId: req.auth!.userId,
        type: original.type,
        name: `${original.name} (Copy)`,
        slug,
        description: original.description,
        thumbnail: original.thumbnail,
        icon: original.icon,
        visibility: original.visibility,
        tags: original.tags,
        metadata: original.metadata as Record<string, unknown>,
        content: original.content as Record<string, unknown>,
        folderId: original.folderId,
        status: "draft",
        version: 1,
      })
      .returning();

    await snapshotVersion(duplicate!);
    await recordHistory(
      duplicate!.id,
      req.auth!.userId,
      "duplicated",
      `Duplicated from document #${original.id}`,
    );

    res.status(201).json(duplicate);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Bookmark ─────────────────────────────────────────────────────────────────

router.post("/api/documents/:id/bookmark", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    await db
      .insert(creatorDocumentBookmarksTable)
      .values({ documentId: id, userId: req.auth!.userId })
      .onConflictDoNothing();

    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.delete("/api/documents/:id/bookmark", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    await db
      .delete(creatorDocumentBookmarksTable)
      .where(
        and(
          eq(creatorDocumentBookmarksTable.documentId, id),
          eq(creatorDocumentBookmarksTable.userId, req.auth!.userId),
        ),
      );
    res.json({ bookmarked: false });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Lock / Unlock ────────────────────────────────────────────────────────────

router.post("/api/documents/:id/lock", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [existing] = await db
      .select()
      .from(creatorDocumentLocksTable)
      .where(eq(creatorDocumentLocksTable.documentId, id))
      .limit(1);

    if (existing && existing.lockedBy !== req.auth!.userId) {
      res.status(409).json({
        error: "AlreadyLocked",
        message: "Document is locked by another user",
        lock: existing,
      });
      return;
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db
      .insert(creatorDocumentLocksTable)
      .values({ documentId: id, lockedBy: req.auth!.userId, expiresAt })
      .onConflictDoUpdate({
        target: creatorDocumentLocksTable.documentId,
        set: { lockedBy: req.auth!.userId, lockedAt: new Date(), expiresAt },
      });

    res.json({ locked: true, lockedBy: req.auth!.userId, expiresAt });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/documents/:id/unlock", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [lock] = await db
      .select()
      .from(creatorDocumentLocksTable)
      .where(eq(creatorDocumentLocksTable.documentId, id))
      .limit(1);

    if (!lock) {
      res.json({ locked: false });
      return;
    }

    if (lock.lockedBy !== req.auth!.userId) {
      res.status(403).json({ error: "Forbidden", message: "You did not lock this document" });
      return;
    }

    await db
      .delete(creatorDocumentLocksTable)
      .where(eq(creatorDocumentLocksTable.documentId, id));

    res.json({ locked: false });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── History ──────────────────────────────────────────────────────────────────

router.get("/api/documents/:id/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const history = await db
      .select()
      .from(creatorDocumentHistoryTable)
      .where(eq(creatorDocumentHistoryTable.documentId, id))
      .orderBy(desc(creatorDocumentHistoryTable.createdAt))
      .limit(50);

    res.json({ items: history });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Versions ─────────────────────────────────────────────────────────────────

router.get("/api/documents/:id/versions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const versions = await db
      .select()
      .from(creatorDocumentVersionsTable)
      .where(eq(creatorDocumentVersionsTable.documentId, id))
      .orderBy(desc(creatorDocumentVersionsTable.version));

    res.json({ items: versions });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Restore Version ──────────────────────────────────────────────────────────

router.post("/api/documents/:id/restore/:versionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const versionId = Number(req.params["versionId"]);

    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [version] = await db
      .select()
      .from(creatorDocumentVersionsTable)
      .where(
        and(
          eq(creatorDocumentVersionsTable.id, versionId),
          eq(creatorDocumentVersionsTable.documentId, id),
        ),
      )
      .limit(1);

    if (!version) {
      res.status(404).json({ error: "VersionNotFound" });
      return;
    }

    const newVersion = doc.version + 1;

    const [restored] = await db
      .update(creatorDocumentsTable)
      .set({
        name: version.name,
        content: version.content as Record<string, unknown>,
        metadata: version.metadata as Record<string, unknown>,
        description: version.description,
        thumbnail: version.thumbnail,
        status: version.status as "draft",
        version: newVersion,
        updatedBy: req.auth!.userId,
        updatedAt: new Date(),
      })
      .where(eq(creatorDocumentsTable.id, id))
      .returning();

    await snapshotVersion(restored!);
    await recordHistory(
      id,
      req.auth!.userId,
      "restored",
      `Restored to version ${version.version}`,
    );

    res.json(restored);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Relations ────────────────────────────────────────────────────────────────

router.get("/api/documents/:id/relations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params["id"]);
    const [doc] = await db
      .select()
      .from(creatorDocumentsTable)
      .where(eq(creatorDocumentsTable.id, id))
      .limit(1);

    if (!doc) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const accessible = await canAccessProject(req.auth!.userId, doc.projectId);
    if (!accessible) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const relations = await db
      .select()
      .from(creatorDocumentRelationsTable)
      .where(
        or(
          eq(creatorDocumentRelationsTable.sourceId, id),
          eq(creatorDocumentRelationsTable.targetId, id),
        ),
      );

    res.json({ items: relations });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/api/documents/:id/relations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sourceId = Number(req.params["id"]);
    const { targetId, relationType, label } = req.body as {
      targetId: number;
      relationType: string;
      label?: string;
    };

    if (!targetId || !relationType) {
      res.status(400).json({ error: "BadRequest", message: "targetId and relationType required" });
      return;
    }

    const [relation] = await db
      .insert(creatorDocumentRelationsTable)
      .values({
        sourceId,
        targetId,
        relationType: relationType as "parent",
        label: label ?? null,
        createdBy: req.auth!.userId,
      })
      .onConflictDoNothing()
      .returning();

    res.status(201).json(relation);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

// ─── Bookmarks list ───────────────────────────────────────────────────────────

router.get("/api/documents/bookmarks/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const bookmarks = await db
      .select({
        bookmark: creatorDocumentBookmarksTable,
        document: creatorDocumentsTable,
      })
      .from(creatorDocumentBookmarksTable)
      .innerJoin(
        creatorDocumentsTable,
        eq(creatorDocumentBookmarksTable.documentId, creatorDocumentsTable.id),
      )
      .where(eq(creatorDocumentBookmarksTable.userId, req.auth!.userId))
      .orderBy(desc(creatorDocumentBookmarksTable.createdAt));

    res.json({ items: bookmarks.map((b) => ({ ...b.document, bookmarkedAt: b.bookmark.createdAt })) });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
