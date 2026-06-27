import { DrizzleGraphRepository, type GraphWithDetails } from "../repositories/graph-repository";
import { GraphCompiler, type CompiledGraph } from "./graph-compiler";
import { GraphRuntime, ExecutionEngine, type ExecutionContext } from "./graph-runtime";
import { GraphValidator, type ValidationResult } from "./graph-validator";
import type { CreatorGraph, InsertGraph, InsertGraphNode, InsertGraphPin, InsertGraphConnection, InsertGraphVariable } from "@workspace/db";

export class GraphService {
  private repo: DrizzleGraphRepository;
  private compiler: GraphCompiler;
  private runtime: GraphRuntime;
  private engine: ExecutionEngine;
  private validator: GraphValidator;

  constructor() {
    this.repo = new DrizzleGraphRepository();
    this.compiler = new GraphCompiler();
    this.runtime = new GraphRuntime();
    this.engine = new ExecutionEngine(this.runtime);
    this.validator = new GraphValidator();
  }

  async listGraphs(userId: number, limit = 20, offset = 0) {
    return this.repo.findAll(userId, limit, offset);
  }

  async createGraph(userId: number, data: Omit<InsertGraph, "userId">): Promise<CreatorGraph> {
    return this.repo.create({ ...data, userId });
  }

  async getGraph(id: number, userId: number): Promise<CreatorGraph | null> {
    return this.repo.findById(id, userId);
  }

  async updateGraph(id: number, userId: number, data: Partial<InsertGraph>): Promise<CreatorGraph | null> {
    return this.repo.update(id, userId, data);
  }

  async deleteGraph(id: number, userId: number): Promise<boolean> {
    return this.repo.delete(id, userId);
  }

  async loadGraph(id: number, userId: number): Promise<GraphWithDetails | null> {
    return this.repo.loadWithDetails(id, userId);
  }

  async saveGraph(
    id: number,
    userId: number,
    payload: {
      nodes?: InsertGraphNode[];
      pins?: InsertGraphPin[];
      connections?: InsertGraphConnection[];
      variables?: InsertGraphVariable[];
      viewport?: { x: number; y: number; zoom: number };
    },
  ): Promise<GraphWithDetails | null> {
    const graph = await this.repo.findById(id, userId);
    if (!graph) return null;

    await this.repo.clearGraph(id);

    const [nodes, pins, connections, variables] = await Promise.all([
      this.repo.upsertNodes(id, payload.nodes ?? []),
      Promise.resolve([] as Awaited<ReturnType<DrizzleGraphRepository["upsertPins"]>>),
      Promise.resolve([] as Awaited<ReturnType<DrizzleGraphRepository["upsertConnections"]>>),
      this.repo.upsertVariables(payload.variables ?? []),
    ]);

    const pinsResult = await this.repo.upsertPins(payload.pins ?? []);
    const connectionsResult = await this.repo.upsertConnections(payload.connections ?? []);

    if (payload.viewport) {
      await this.repo.update(id, userId, { viewport: payload.viewport });
    }

    await this.repo.update(id, userId, {});

    await this.repo.addHistory({
      graphId: id,
      userId,
      action: "save",
      snapshot: { nodes, pins: pinsResult, connections: connectionsResult, variables },
      description: "Graph saved",
    });

    return this.repo.loadWithDetails(id, userId);
  }

  async duplicateGraph(id: number, userId: number): Promise<CreatorGraph | null> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) return null;

    return this.repo.create({
      userId,
      projectId: existing.projectId,
      name: `${existing.name} (Copy)`,
      description: existing.description,
      type: existing.type,
      tags: existing.tags,
      metadata: existing.metadata,
      viewport: existing.viewport,
      isTemplate: false,
      isPublic: false,
    });
  }

  async validate(id: number, userId: number): Promise<ValidationResult> {
    const details = await this.repo.loadWithDetails(id, userId);
    if (!details) {
      return {
        valid: false,
        errors: [{ type: "error", code: "NOT_FOUND", message: "Graph not found" }],
        warnings: [],
      };
    }
    return this.validator.validate({
      nodes: details.nodes,
      pins: details.pins,
      connections: details.connections,
    });
  }

  async compile(id: number, userId: number): Promise<{ result?: CompiledGraph; validation: ValidationResult }> {
    const details = await this.repo.loadWithDetails(id, userId);
    if (!details) {
      return {
        validation: {
          valid: false,
          errors: [{ type: "error", code: "NOT_FOUND", message: "Graph not found" }],
          warnings: [],
        },
      };
    }

    const outcome = this.compiler.compile(
      id,
      details.nodes,
      details.pins,
      details.connections,
      details.variables,
    );

    await this.repo.upsertCompilerCache({
      graphId: id,
      checksum: outcome.result?.checksum ?? "",
      compiledOutput: outcome.result ?? {},
      isValid: outcome.validation.valid,
      errorMessage: outcome.validation.errors.map((e) => e.message).join("; ") || undefined,
    });

    return outcome;
  }

  async execute(
    id: number,
    userId: number,
    breakpointNodeIds: number[] = [],
  ): Promise<ExecutionContext | null> {
    const compileResult = await this.compile(id, userId);
    if (!compileResult.result) return null;

    const ctx = await this.engine.execute(compileResult.result, breakpointNodeIds);

    await this.repo.saveRuntime({
      graphId: id,
      runtimeId: ctx.runtimeId,
      state: ctx.state,
      currentNodeId: ctx.currentNodeId ?? undefined,
      variables: Object.fromEntries(ctx.variables),
      stack: ctx.stack,
      startedAt: ctx.startedAt ?? undefined,
      completedAt: ctx.completedAt ?? undefined,
      durationMs: ctx.durationMs ?? undefined,
      errorMessage: ctx.errorMessage ?? undefined,
    });

    await this.repo.saveExecutionLogs(
      id,
      ctx.runtimeId,
      ctx.executionLog.map((l) => ({
        nodeId: l.nodeId,
        level: l.level,
        message: l.message,
        data: l.data,
      })),
    );

    return ctx;
  }

  pauseRuntime(runtimeId: string): boolean {
    return this.runtime.pause(runtimeId);
  }

  resumeRuntime(runtimeId: string): boolean {
    return this.runtime.resume(runtimeId);
  }

  stopRuntime(runtimeId: string): boolean {
    return this.runtime.stop(runtimeId);
  }

  getRuntimeContext(runtimeId: string) {
    const ctx = this.runtime.getContext(runtimeId);
    if (!ctx) return null;
    return this.runtime.serializeContext(ctx);
  }

  async getHistory(graphId: number, userId: number, limit = 20) {
    const graph = await this.repo.findById(graphId, userId);
    if (!graph) return null;
    return this.repo.getHistory(graphId, limit);
  }

  async getVersions(graphId: number, userId: number) {
    const graph = await this.repo.findById(graphId, userId);
    if (!graph) return null;
    return this.repo.getVersions(graphId);
  }

  async restoreVersion(graphId: number, userId: number, versionId: number) {
    const versions = await this.repo.getVersions(graphId);
    const version = versions.find((v) => v.id === versionId);
    if (!version) return null;
    return version;
  }

  async getTemplates() {
    return this.repo.getTemplates();
  }
}
