import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorUsersTable,
  creatorProfilesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const [user] = await db
      .select()
      .from(creatorUsersTable)
      .where(eq(creatorUsersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "NotFound" });
      return;
    }

    const [profile] = await db
      .select()
      .from(creatorProfilesTable)
      .where(eq(creatorProfilesTable.userId, userId))
      .limit(1);

    res.json({ ...user, profile: profile ?? null });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const {
      displayName,
      username,
      avatar,
      bio,
      website,
      location,
      socialLinks,
    } = req.body as {
      displayName?: string;
      username?: string;
      avatar?: string;
      bio?: string;
      website?: string;
      location?: string;
      socialLinks?: Record<string, string>;
    };

    const [existing] = await db
      .select()
      .from(creatorProfilesTable)
      .where(eq(creatorProfilesTable.userId, userId))
      .limit(1);

    let profile;
    if (existing) {
      [profile] = await db
        .update(creatorProfilesTable)
        .set({
          ...(displayName !== undefined && { displayName }),
          ...(username !== undefined && { username }),
          ...(avatar !== undefined && { avatar }),
          ...(bio !== undefined && { bio }),
          ...(website !== undefined && { website }),
          ...(location !== undefined && { location }),
          ...(socialLinks !== undefined && { socialLinks }),
          updatedAt: new Date(),
        })
        .where(eq(creatorProfilesTable.userId, userId))
        .returning();
    } else {
      [profile] = await db
        .insert(creatorProfilesTable)
        .values({
          userId,
          displayName,
          username,
          avatar,
          bio,
          website,
          location,
          socialLinks: socialLinks ?? {},
        })
        .returning();
    }

    if (displayName) {
      await db
        .update(creatorUsersTable)
        .set({ displayName, updatedAt: new Date() })
        .where(eq(creatorUsersTable.id, userId));
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
