import { DrizzleRuntimeRepository } from "../repositories/runtime-repository";
import { RuntimeEngine } from "./runtime-engine";
import type {
  RuntimeSession,
  InsertRuntimeSession,
  RuntimeSnapshot,
} from "@workspace/db";

export class RuntimeService {
  private repo: DrizzleRuntimeRepository;
  private engine: RuntimeEngine;

  constructor() {
    this.repo = new DrizzleRuntimeRepository();
    this.engine = new RuntimeEngine();
  }

  // ─── Sessions ────────────────────────────────────────────────────────────────

  async createSession(userId: number, data: { name?: string; projectId?: number; mode?: string }): Promise<RuntimeSession> {
    return this.repo.createSession({
      userId,
      projectId: data.projectId ?? null,
      name: data.name ?? "Runtime Session",
      mode: (data.mode as "editor") ?? "editor",
      state: "idle",
      tickRate: 60,
      currentTick: 0,
      elapsedTime: 0,
      metadata: {},
    });
  }

  async listSessions(userId: number, limit = 20, offset = 0) {
    return this.repo.listSessions(userId, limit, offset);
  }

  async getSession(id: number, userId: number): Promise<RuntimeSession | null> {
    return this.repo.findSessionById(id, userId);
  }

  async deleteSession(id: number, userId: number): Promise<boolean> {
    this.engine.getWorld(id); // side-effect check
    return this.repo.deleteSession(id, userId);
  }

  // ─── Engine lifecycle ────────────────────────────────────────────────────────

  async start(sessionId: number, userId: number): Promise<{ ok: boolean; state: string }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.start(sessionId, userId);
    return { ok: true, state: "running" };
  }

  async stop(sessionId: number, userId: number): Promise<{ ok: boolean; state: string }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.stop(sessionId, userId);
    return { ok: true, state: "stopped" };
  }

  async pause(sessionId: number, userId: number): Promise<{ ok: boolean; state: string }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.pause(sessionId, userId);
    return { ok: true, state: "paused" };
  }

  async resume(sessionId: number, userId: number): Promise<{ ok: boolean; state: string }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.resume(sessionId, userId);
    return { ok: true, state: "running" };
  }

  async restart(sessionId: number, userId: number): Promise<{ ok: boolean; state: string }> {
    await this.engine.stop(sessionId, userId);
    await this.engine.start(sessionId, userId);
    return { ok: true, state: "running" };
  }

  async step(sessionId: number, userId: number): Promise<{ ok: boolean; tick: number; deltaMs: number }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    const deltaMs = await this.engine.step(sessionId, userId);
    const updated = await this.repo.findSessionById(sessionId, userId);
    return { ok: true, tick: updated?.currentTick ?? 0, deltaMs };
  }

  // ─── Snapshot ────────────────────────────────────────────────────────────────

  async snapshot(sessionId: number, userId: number, name: string): Promise<{ ok: boolean }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.snapshot(sessionId, userId, name);
    return { ok: true };
  }

  async restore(sessionId: number, userId: number, snapshotId: number): Promise<{ ok: boolean }> {
    const session = await this.repo.findSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");
    await this.engine.restore(sessionId, userId, snapshotId);
    return { ok: true };
  }

  async getSnapshots(sessionId: number): Promise<RuntimeSnapshot[]> {
    return this.repo.findSnapshotsBySession(sessionId);
  }

  // ─── Observability ───────────────────────────────────────────────────────────

  async getLogs(sessionId: number, limit = 100, offset = 0) {
    return this.repo.findLogsBySession(sessionId, limit, offset);
  }

  async getPerformance(sessionId: number, limit = 300) {
    return this.repo.findPerformanceBySession(sessionId, limit);
  }

  async samplePerformance(sessionId: number): Promise<void> {
    return this.engine.samplePerformance(sessionId);
  }

  async getEntities(sessionId: number, limit = 100, offset = 0) {
    return this.repo.findEntitiesBySession(sessionId, limit, offset);
  }

  async getComponents(sessionId: number, limit = 200, offset = 0) {
    return this.repo.findComponentsBySession(sessionId, limit, offset);
  }

  async getSystems(sessionId: number) {
    return this.repo.findSystemsBySession(sessionId);
  }

  async getEvents(sessionId: number, limit = 50, offset = 0) {
    return this.repo.findEventsBySession(sessionId, limit, offset);
  }

  async getJobs(sessionId: number, limit = 50, offset = 0) {
    return this.repo.findJobsBySession(sessionId, limit, offset);
  }

  async getTimers(sessionId: number) {
    return this.repo.findTimersBySession(sessionId);
  }

  async getHistory(sessionId: number, limit = 50, offset = 0) {
    return this.repo.findHistoryBySession(sessionId, limit, offset);
  }

  async getErrors(sessionId: number, limit = 50, offset = 0) {
    return this.repo.findErrorsBySession(sessionId, limit, offset);
  }

  async getProfiles(sessionId: number) {
    return this.repo.findProfilesBySession(sessionId);
  }

  async getDashboard(userId: number) {
    const { items: sessions, total } = await this.repo.listSessions(userId, 5, 0);
    const activeSessions = sessions.filter((s) => s.state === "running" || s.state === "paused");

    const perfResults = await Promise.all(
      sessions.map((s) => this.repo.getLatestPerformance(s.id))
    );

    return {
      totalSessions: total,
      activeSessions: activeSessions.length,
      recentSessions: sessions,
      performance: perfResults.filter(Boolean),
    };
  }
}
