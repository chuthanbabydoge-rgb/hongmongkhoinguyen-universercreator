import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { creatorUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body as {
      username: string;
      email: string;
      password: string;
      displayName?: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ error: "BadRequest", message: "username, email and password required" });
      return;
    }

    const existing = await db
      .select()
      .from(creatorUsersTable)
      .where(eq(creatorUsersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(creatorUsersTable)
      .values({ username, email, passwordHash, displayName })
      .returning();

    const token = signToken({ userId: user!.id, email: user!.email });
    res.status(201).json({
      token,
      user: {
        id: user!.id,
        username: user!.username,
        email: user!.email,
        displayName: user!.displayName,
        avatarUrl: user!.avatarUrl,
        bio: user!.bio,
        createdAt: user!.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: "BadRequest", message: "email and password required" });
      return;
    }

    const [user] = await db
      .select()
      .from(creatorUsersTable)
      .where(eq(creatorUsersTable.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select()
      .from(creatorUsersTable)
      .where(eq(creatorUsersTable.id, req.auth!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err) });
  }
});

export default router;
