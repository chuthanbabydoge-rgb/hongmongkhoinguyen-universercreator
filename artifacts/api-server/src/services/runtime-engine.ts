import { DrizzleRuntimeRepository } from "../repositories/runtime-repository";
import type { RuntimeSession, RuntimeEntity, RuntimeEvent } from "@workspace/db";

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface EntityState {
  id: number;
  uuid: string;
  name: string;
  tag: string | null;
  layer: string;
  parentId: number | null;
  enabled: boolean;
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  components: ComponentState[];
  children: number[];
}

export interface ComponentState {
  id: number;
  type: string;
  name: string | null;
  enabled: boolean;
  data: Record<string, unknown>;
}

// ─── EntityManager ────────────────────────────────────────────────────────────

export class EntityManager {
  private entities = new Map<number, EntityState>();
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  async spawn(sessionId: number, name: string, tag?: string, parentId?: number): Promise<EntityState> {
    const dbEntity = await this.repo.spawnEntity({
      sessionId,
      name,
      tag: tag ?? null,
      parentId: parentId ?? null,
      enabled: true,
      destroyed: false,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      metadata: {},
    });

    const state: EntityState = {
      id: dbEntity.id,
      uuid: dbEntity.entityUuid,
      name: dbEntity.name,
      tag: dbEntity.tag,
      layer: dbEntity.layer,
      parentId: dbEntity.parentId,
      enabled: dbEntity.enabled,
      transform: dbEntity.transform as EntityState["transform"],
      components: [],
      children: [],
    };

    this.entities.set(state.id, state);

    if (parentId) {
      const parent = this.entities.get(parentId);
      if (parent) parent.children.push(state.id);
    }

    return state;
  }

  async destroy(entityId: number): Promise<void> {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    for (const childId of entity.children) {
      await this.destroy(childId);
    }

    await this.repo.destroyEntity(entityId);
    this.entities.delete(entityId);

    if (entity.parentId) {
      const parent = this.entities.get(entity.parentId);
      if (parent) {
        parent.children = parent.children.filter((id) => id !== entityId);
      }
    }
  }

  get(entityId: number): EntityState | undefined {
    return this.entities.get(entityId);
  }

  getAll(): EntityState[] {
    return Array.from(this.entities.values());
  }

  count(): number {
    return this.entities.size;
  }

  setTransform(entityId: number, transform: Partial<EntityState["transform"]>): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.transform = { ...entity.transform, ...transform };
  }

  setEnabled(entityId: number, enabled: boolean): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.enabled = enabled;
  }

  clear(): void {
    this.entities.clear();
  }
}

// ─── ComponentManager ─────────────────────────────────────────────────────────

export class ComponentManager {
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  async addComponent(sessionId: number, entityId: number, type: string, data: Record<string, unknown> = {}): Promise<ComponentState> {
    const dbComp = await this.repo.addComponent({
      sessionId,
      entityId,
      type: type as "transform",
      data,
      enabled: true,
      order: 0,
    });
    return {
      id: dbComp.id,
      type: dbComp.type,
      name: dbComp.name,
      enabled: dbComp.enabled,
      data: dbComp.data as Record<string, unknown>,
    };
  }

  async getComponents(sessionId: number, limit = 200, offset = 0) {
    return this.repo.findComponentsBySession(sessionId, limit, offset);
  }
}

// ─── SystemManager ────────────────────────────────────────────────────────────

export interface SystemState {
  id: number;
  name: string;
  systemType: string;
  enabled: boolean;
  priority: number;
  updateType: string;
  lastTickMs: number;
  totalTicks: number;
}

export class SystemManager {
  private systems: SystemState[] = [];
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  async initDefaultSystems(sessionId: number): Promise<void> {
    const defaultSystems = [
      { name: "Physics", systemType: "physics", priority: 0, updateType: "fixed" },
      { name: "Animation", systemType: "animation", priority: 1, updateType: "frame" },
      { name: "Audio", systemType: "audio", priority: 2, updateType: "frame" },
      { name: "Dialogue", systemType: "dialogue", priority: 3, updateType: "frame" },
      { name: "Quest", systemType: "quest", priority: 4, updateType: "frame" },
      { name: "Combat", systemType: "combat", priority: 5, updateType: "fixed" },
      { name: "Navigation", systemType: "navigation", priority: 6, updateType: "frame" },
      { name: "AI", systemType: "ai", priority: 7, updateType: "frame" },
      { name: "Weather", systemType: "weather", priority: 8, updateType: "late" },
      { name: "DayNight", systemType: "day_night", priority: 9, updateType: "late" },
      { name: "Particles", systemType: "particles", priority: 10, updateType: "frame" },
    ];

    for (const s of defaultSystems) {
      const db = await this.repo.upsertSystem({ sessionId, ...s, enabled: true });
      this.systems.push({
        id: db.id,
        name: db.name,
        systemType: db.systemType,
        enabled: db.enabled,
        priority: db.priority,
        updateType: db.updateType,
        lastTickMs: db.lastTickMs,
        totalTicks: db.totalTicks,
      });
    }
  }

  async loadFromDb(sessionId: number): Promise<void> {
    const rows = await this.repo.findSystemsBySession(sessionId);
    this.systems = rows.map((r) => ({
      id: r.id,
      name: r.name,
      systemType: r.systemType,
      enabled: r.enabled,
      priority: r.priority,
      updateType: r.updateType,
      lastTickMs: r.lastTickMs,
      totalTicks: r.totalTicks,
    }));
  }

  tick(entities: EntityState[], deltaMs: number): void {
    for (const system of this.systems) {
      if (!system.enabled) continue;
      const start = Date.now();
      // Simulate system tick cost (no real simulation yet — each system would have its own handler)
      system.totalTicks++;
      system.lastTickMs = Date.now() - start;
    }
  }

  getSystems(): SystemState[] {
    return [...this.systems];
  }

  getSystem(id: number): SystemState | undefined {
    return this.systems.find((s) => s.id === id);
  }

  setEnabled(id: number, enabled: boolean): void {
    const system = this.systems.find((s) => s.id === id);
    if (system) system.enabled = enabled;
  }
}

// ─── EventDispatcher ─────────────────────────────────────────────────────────

type EventHandler = (event: RuntimeEvent) => void | Promise<void>;

export class EventDispatcher {
  private handlers = new Map<string, EventHandler[]>();
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  on(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async dispatch(sessionId: number, type: string, payload: Record<string, unknown> = {}, tick = 0): Promise<RuntimeEvent> {
    const event = await this.repo.dispatchEvent({
      sessionId,
      type: type as "spawn",
      payload,
      tick,
      processed: false,
    });

    const handlers = this.handlers.get(type) ?? [];
    await Promise.all(handlers.map((h) => h(event)));

    return event;
  }

  clear(): void {
    this.handlers.clear();
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export interface ScheduledJob {
  id: string;
  name: string;
  type: "frame" | "fixed" | "late" | "background";
  priority: number;
  intervalTicks: number | null;
  lastRunTick: number;
  runCount: number;
  handler: () => void | Promise<void>;
}

export class Scheduler {
  private jobs: ScheduledJob[] = [];
  private currentTick = 0;

  register(job: Omit<ScheduledJob, "lastRunTick" | "runCount">): void {
    this.jobs.push({ ...job, lastRunTick: -1, runCount: 0 });
    this.jobs.sort((a, b) => a.priority - b.priority);
  }

  async tick(type: "frame" | "fixed" | "late" = "frame"): Promise<void> {
    this.currentTick++;
    const matching = this.jobs.filter((j) => j.type === type);

    for (const job of matching) {
      if (job.intervalTicks !== null) {
        if (this.currentTick - job.lastRunTick < job.intervalTicks) continue;
      }
      await job.handler();
      job.lastRunTick = this.currentTick;
      job.runCount++;
    }
  }

  getCurrentTick(): number {
    return this.currentTick;
  }

  reset(): void {
    this.currentTick = 0;
    this.jobs.forEach((j) => {
      j.lastRunTick = -1;
      j.runCount = 0;
    });
  }

  getJobs(): ScheduledJob[] {
    return [...this.jobs];
  }
}

// ─── TimerService ────────────────────────────────────────────────────────────

export interface TimerEntry {
  id: number;
  name: string;
  type: "delay" | "interval" | "cooldown" | "countdown";
  durationMs: number;
  remainingMs: number;
  intervalMs: number | null;
  isRunning: boolean;
  fireCount: number;
  maxFires: number | null;
  callback?: () => void;
}

export class TimerService {
  private timers = new Map<number, TimerEntry>();
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  async createTimer(sessionId: number, name: string, type: TimerEntry["type"], durationMs: number, callback?: () => void): Promise<TimerEntry> {
    const db = await this.repo.createTimer({
      sessionId,
      name,
      timerType: type,
      durationMs,
      remainingMs: durationMs,
      isRunning: true,
      fireCount: 0,
    });

    const timer: TimerEntry = {
      id: db.id,
      name: db.name,
      type,
      durationMs,
      remainingMs: durationMs,
      intervalMs: db.intervalMs,
      isRunning: true,
      fireCount: 0,
      maxFires: db.maxFires,
      callback,
    };

    this.timers.set(timer.id, timer);
    return timer;
  }

  tick(deltaMs: number): void {
    for (const timer of this.timers.values()) {
      if (!timer.isRunning) continue;

      timer.remainingMs = Math.max(0, timer.remainingMs - deltaMs);

      if (timer.remainingMs <= 0) {
        timer.fireCount++;
        timer.callback?.();

        if (timer.type === "interval" && timer.intervalMs !== null) {
          timer.remainingMs = timer.intervalMs;
        } else if (timer.maxFires !== null && timer.fireCount >= timer.maxFires) {
          timer.isRunning = false;
        } else if (timer.type !== "interval") {
          timer.isRunning = false;
        }
      }
    }
  }

  getTimers(): TimerEntry[] {
    return Array.from(this.timers.values());
  }

  stopTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) timer.isRunning = false;
  }

  clear(): void {
    this.timers.clear();
  }
}

// ─── DebugService ─────────────────────────────────────────────────────────────

export class DebugService {
  private watchedEntityIds = new Set<number>();
  private watchedVariables = new Set<string>();
  private isStepMode = false;
  private pauseOnError = true;
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  setStepMode(enabled: boolean): void {
    this.isStepMode = enabled;
  }

  isInStepMode(): boolean {
    return this.isStepMode;
  }

  watchEntity(entityId: number): void {
    this.watchedEntityIds.add(entityId);
  }

  unwatchEntity(entityId: number): void {
    this.watchedEntityIds.delete(entityId);
  }

  getWatchedEntities(): number[] {
    return Array.from(this.watchedEntityIds);
  }

  setPauseOnError(enabled: boolean): void {
    this.pauseOnError = enabled;
  }

  shouldPauseOnError(): boolean {
    return this.pauseOnError;
  }

  async syncToDb(sessionId: number): Promise<void> {
    await this.repo.updateDebug(sessionId, {
      watchedEntities: Array.from(this.watchedEntityIds),
      watchedVariables: Array.from(this.watchedVariables),
      isStepMode: this.isStepMode,
      pauseOnError: this.pauseOnError,
    });
  }
}

// ─── ProfilerService ──────────────────────────────────────────────────────────

export interface ProfileSample {
  label: string;
  startMs: number;
  durationMs: number;
}

export class ProfilerService {
  private activeSamples = new Map<string, number>();
  private completedSamples: ProfileSample[] = [];
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  begin(label: string): void {
    this.activeSamples.set(label, performance.now());
  }

  end(label: string): void {
    const start = this.activeSamples.get(label);
    if (start === undefined) return;
    this.completedSamples.push({ label, startMs: start, durationMs: performance.now() - start });
    this.activeSamples.delete(label);
  }

  getSamples(): ProfileSample[] {
    return [...this.completedSamples];
  }

  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const s of this.completedSamples) {
      summary[s.label] = (summary[s.label] ?? 0) + s.durationMs;
    }
    return summary;
  }

  async flush(sessionId: number, startTick: number, endTick: number): Promise<void> {
    if (this.completedSamples.length === 0) return;
    await this.repo.createProfile({
      sessionId,
      name: `Profile tick ${startTick}-${endTick}`,
      startTick,
      endTick,
      durationMs: this.completedSamples.reduce((a, s) => a + s.durationMs, 0),
      samples: this.completedSamples,
      summary: this.getSummary(),
    });
    this.completedSamples = [];
  }
}

// ─── SimulationEngine ─────────────────────────────────────────────────────────

export interface SimulationState {
  tick: number;
  elapsedMs: number;
  isRunning: boolean;
  isPaused: boolean;
  fps: number;
  frameTimeMs: number;
}

export class SimulationEngine {
  private state: SimulationState = {
    tick: 0,
    elapsedMs: 0,
    isRunning: false,
    isPaused: false,
    fps: 0,
    frameTimeMs: 0,
  };
  private tickRate: number;
  private lastTickTime: number = 0;
  private fpsWindow: number[] = [];

  constructor(tickRate = 60) {
    this.tickRate = tickRate;
  }

  start(): void {
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastTickTime = Date.now();
  }

  pause(): void {
    this.state.isPaused = true;
  }

  resume(): void {
    this.state.isPaused = false;
    this.lastTickTime = Date.now();
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
  }

  step(): number {
    const now = Date.now();
    const delta = now - this.lastTickTime;
    this.lastTickTime = now;
    this.state.tick++;
    this.state.elapsedMs += delta;
    this.state.frameTimeMs = delta;

    this.fpsWindow.push(delta);
    if (this.fpsWindow.length > 60) this.fpsWindow.shift();
    const avgDelta = this.fpsWindow.reduce((a, b) => a + b, 0) / this.fpsWindow.length;
    this.state.fps = avgDelta > 0 ? Math.round(1000 / avgDelta) : 0;

    return delta;
  }

  getState(): Readonly<SimulationState> {
    return this.state;
  }

  reset(): void {
    this.state = { tick: 0, elapsedMs: 0, isRunning: false, isPaused: false, fps: 0, frameTimeMs: 0 };
    this.fpsWindow = [];
  }
}

// ─── WorldRuntime ─────────────────────────────────────────────────────────────

export class WorldRuntime {
  entityManager: EntityManager;
  componentManager: ComponentManager;
  systemManager: SystemManager;
  eventDispatcher: EventDispatcher;
  timerService: TimerService;
  simulationEngine: SimulationEngine;

  private sessionId: number;
  private repo: DrizzleRuntimeRepository;

  constructor(sessionId: number, repo: DrizzleRuntimeRepository) {
    this.sessionId = sessionId;
    this.repo = repo;
    this.entityManager = new EntityManager(repo);
    this.componentManager = new ComponentManager(repo);
    this.systemManager = new SystemManager(repo);
    this.eventDispatcher = new EventDispatcher(repo);
    this.timerService = new TimerService(repo);
    this.simulationEngine = new SimulationEngine();
  }

  async initialize(): Promise<void> {
    await this.systemManager.initDefaultSystems(this.sessionId);
    await this.eventDispatcher.dispatch(this.sessionId, "system", { message: "World initialized" }, 0);
    await this.repo.addLog({ sessionId: this.sessionId, level: "info", system: "WorldRuntime", message: "World initialized", tick: 0, data: {} });
  }

  async tick(): Promise<number> {
    const sim = this.simulationEngine;
    if (!sim.getState().isRunning || sim.getState().isPaused) return 0;

    const deltaMs = sim.step();
    const state = sim.getState();

    this.timerService.tick(deltaMs);
    this.systemManager.tick(this.entityManager.getAll(), deltaMs);

    return deltaMs;
  }

  teardown(): void {
    this.entityManager.clear();
    this.eventDispatcher.clear();
    this.timerService.clear();
    this.simulationEngine.stop();
  }
}

// ─── PlayModeService ─────────────────────────────────────────────────────────

export class PlayModeService {
  private repo: DrizzleRuntimeRepository;

  constructor(repo: DrizzleRuntimeRepository) {
    this.repo = repo;
  }

  async startPlay(sessionId: number, userId: number, world: WorldRuntime): Promise<void> {
    world.simulationEngine.start();
    await this.repo.updateSession(sessionId, userId, { state: "running", mode: "play", startedAt: new Date() });
    await this.repo.addHistory({ sessionId, userId, action: "play_start", tick: 0, data: {} });
    await this.repo.addLog({ sessionId, level: "info", system: "PlayMode", message: "Play mode started", tick: 0, data: {} });
  }

  async pause(sessionId: number, userId: number, world: WorldRuntime): Promise<void> {
    world.simulationEngine.pause();
    const state = world.simulationEngine.getState();
    await this.repo.updateSession(sessionId, userId, { state: "paused", pausedAt: new Date(), currentTick: state.tick });
    await this.repo.addHistory({ sessionId, userId, action: "play_pause", tick: state.tick, data: {} });
  }

  async resume(sessionId: number, userId: number, world: WorldRuntime): Promise<void> {
    world.simulationEngine.resume();
    await this.repo.updateSession(sessionId, userId, { state: "running", pausedAt: null });
    await this.repo.addHistory({ sessionId, userId, action: "play_resume", tick: world.simulationEngine.getState().tick, data: {} });
  }

  async stop(sessionId: number, userId: number, world: WorldRuntime): Promise<void> {
    world.simulationEngine.stop();
    const state = world.simulationEngine.getState();
    await this.repo.updateSession(sessionId, userId, { state: "stopped", stoppedAt: new Date(), currentTick: state.tick, elapsedTime: state.elapsedMs / 1000 });
    await this.repo.addHistory({ sessionId, userId, action: "play_stop", tick: state.tick, data: {} });
    world.teardown();
  }

  async step(sessionId: number, userId: number, world: WorldRuntime): Promise<number> {
    const deltaMs = await world.tick();
    const tick = world.simulationEngine.getState().tick;
    await this.repo.updateSession(sessionId, userId, { currentTick: tick, state: "stepping" });
    return deltaMs;
  }

  async snapshot(sessionId: number, userId: number, world: WorldRuntime, name: string): Promise<void> {
    const state = world.simulationEngine.getState();
    const snap = await this.repo.createSnapshot({
      sessionId,
      name,
      tick: state.tick,
      elapsedTime: state.elapsedMs / 1000,
      entityCount: world.entityManager.count(),
      stateData: { simulation: state, systems: world.systemManager.getSystems() },
      worldData: { entities: world.entityManager.getAll() },
      isAutomatic: false,
    });
    await this.repo.createCheckpoint({ snapshotId: snap.id, sessionId, label: name, tick: state.tick });
    await this.repo.addHistory({ sessionId, userId, action: "snapshot", tick: state.tick, data: { snapshotId: snap.id } });
  }
}

// ─── RuntimeEngine ────────────────────────────────────────────────────────────

export class RuntimeEngine {
  private worlds = new Map<number, WorldRuntime>();
  private scheduler: Scheduler;
  private profiler: ProfilerService;
  private debugService: DebugService;
  private playMode: PlayModeService;
  private repo: DrizzleRuntimeRepository;

  constructor() {
    this.repo = new DrizzleRuntimeRepository();
    this.scheduler = new Scheduler();
    this.profiler = new ProfilerService(this.repo);
    this.debugService = new DebugService(this.repo);
    this.playMode = new PlayModeService(this.repo);
  }

  async initialize(sessionId: number, userId: number): Promise<WorldRuntime> {
    await this.repo.updateSession(sessionId, userId, { state: "initializing" });

    const world = new WorldRuntime(sessionId, this.repo);
    await world.initialize();
    this.worlds.set(sessionId, world);

    await this.repo.updateSession(sessionId, userId, { state: "idle" });
    await this.repo.addLog({ sessionId, level: "info", system: "RuntimeEngine", message: "Engine initialized", tick: 0, data: {} });

    return world;
  }

  getWorld(sessionId: number): WorldRuntime | undefined {
    return this.worlds.get(sessionId);
  }

  async start(sessionId: number, userId: number): Promise<void> {
    let world = this.worlds.get(sessionId);
    if (!world) world = await this.initialize(sessionId, userId);
    await this.playMode.startPlay(sessionId, userId, world);
  }

  async stop(sessionId: number, userId: number): Promise<void> {
    const world = this.worlds.get(sessionId);
    if (!world) return;
    await this.playMode.stop(sessionId, userId, world);
    this.worlds.delete(sessionId);
  }

  async pause(sessionId: number, userId: number): Promise<void> {
    const world = this.worlds.get(sessionId);
    if (!world) return;
    await this.playMode.pause(sessionId, userId, world);
  }

  async resume(sessionId: number, userId: number): Promise<void> {
    const world = this.worlds.get(sessionId);
    if (!world) return;
    await this.playMode.resume(sessionId, userId, world);
  }

  async step(sessionId: number, userId: number): Promise<number> {
    let world = this.worlds.get(sessionId);
    if (!world) world = await this.initialize(sessionId, userId);
    return this.playMode.step(sessionId, userId, world);
  }

  async snapshot(sessionId: number, userId: number, name: string): Promise<void> {
    const world = this.worlds.get(sessionId);
    if (!world) throw new Error("No active world for session");
    await this.playMode.snapshot(sessionId, userId, world, name);
  }

  async restore(sessionId: number, userId: number, snapshotId: number): Promise<void> {
    const snap = await this.repo.findSnapshotById(snapshotId);
    if (!snap || snap.sessionId !== sessionId) throw new Error("Snapshot not found");
    await this.repo.addHistory({ sessionId, userId, action: "restore", tick: snap.tick, data: { snapshotId } });
    await this.repo.addLog({ sessionId, level: "info", system: "RuntimeEngine", message: `Restored to snapshot ${snap.name}`, tick: snap.tick, data: {} });
  }

  async samplePerformance(sessionId: number): Promise<void> {
    const world = this.worlds.get(sessionId);
    const state = world?.simulationEngine.getState();
    const mem = process.memoryUsage();

    await this.repo.recordPerformance({
      sessionId,
      tick: state?.tick ?? 0,
      fps: state?.fps ?? 0,
      frameTimeMs: state?.frameTimeMs ?? 0,
      cpuTimeMs: 0,
      memoryMb: mem.heapUsed / 1024 / 1024,
      entityCount: world?.entityManager.count() ?? 0,
      componentCount: 0,
      eventCount: 0,
      systemTimings: world ? Object.fromEntries(world.systemManager.getSystems().map((s) => [s.name, s.lastTickMs])) : {},
    });

    await this.repo.recordMemory({
      sessionId,
      tick: state?.tick ?? 0,
      heapUsedMb: mem.heapUsed / 1024 / 1024,
      heapTotalMb: mem.heapTotal / 1024 / 1024,
      externalMb: mem.external / 1024 / 1024,
      arrayBuffersMb: mem.arrayBuffers / 1024 / 1024,
    });
  }

  getRepo(): DrizzleRuntimeRepository {
    return this.repo;
  }

  getDebug(): DebugService {
    return this.debugService;
  }

  getProfiler(): ProfilerService {
    return this.profiler;
  }
}
