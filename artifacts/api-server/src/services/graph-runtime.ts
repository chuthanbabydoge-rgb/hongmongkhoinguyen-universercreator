import { randomUUID } from "crypto";
import type { CompiledGraph, CompiledInstruction } from "./graph-compiler";

export type RuntimeState = "idle" | "running" | "paused" | "completed" | "failed" | "stopped";

export interface ExecutionContext {
  runtimeId: string;
  graphId: number;
  state: RuntimeState;
  variables: Map<string, unknown>;
  stack: number[];
  currentNodeId: number | null;
  executionLog: ExecutionLogEntry[];
  startedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  durationMs: number | null;
  errorMessage: string | null;
  breakpoints: Set<number>;
}

export interface ExecutionLogEntry {
  nodeId: number | null;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export class GraphRuntime {
  private contexts = new Map<string, ExecutionContext>();

  createContext(graphId: number, breakpointNodeIds: number[] = []): ExecutionContext {
    const ctx: ExecutionContext = {
      runtimeId: randomUUID(),
      graphId,
      state: "idle",
      variables: new Map(),
      stack: [],
      currentNodeId: null,
      executionLog: [],
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      breakpoints: new Set(breakpointNodeIds),
    };
    this.contexts.set(ctx.runtimeId, ctx);
    return ctx;
  }

  getContext(runtimeId: string): ExecutionContext | undefined {
    return this.contexts.get(runtimeId);
  }

  pause(runtimeId: string): boolean {
    const ctx = this.contexts.get(runtimeId);
    if (!ctx || ctx.state !== "running") return false;
    ctx.state = "paused";
    ctx.pausedAt = new Date();
    this.log(ctx, null, "info", "Execution paused", {});
    return true;
  }

  resume(runtimeId: string): boolean {
    const ctx = this.contexts.get(runtimeId);
    if (!ctx || ctx.state !== "paused") return false;
    ctx.state = "running";
    ctx.pausedAt = null;
    this.log(ctx, null, "info", "Execution resumed", {});
    return true;
  }

  stop(runtimeId: string): boolean {
    const ctx = this.contexts.get(runtimeId);
    if (!ctx) return false;
    ctx.state = "stopped";
    ctx.completedAt = new Date();
    if (ctx.startedAt) {
      ctx.durationMs = ctx.completedAt.getTime() - ctx.startedAt.getTime();
    }
    this.log(ctx, null, "info", "Execution stopped", {});
    return true;
  }

  private log(
    ctx: ExecutionContext,
    nodeId: number | null,
    level: ExecutionLogEntry["level"],
    message: string,
    data: Record<string, unknown>,
  ): void {
    ctx.executionLog.push({ nodeId, level, message, data, timestamp: new Date() });
  }

  serializeContext(ctx: ExecutionContext): Record<string, unknown> {
    return {
      runtimeId: ctx.runtimeId,
      graphId: ctx.graphId,
      state: ctx.state,
      variables: Object.fromEntries(ctx.variables),
      stack: ctx.stack,
      currentNodeId: ctx.currentNodeId,
      startedAt: ctx.startedAt?.toISOString() ?? null,
      pausedAt: ctx.pausedAt?.toISOString() ?? null,
      completedAt: ctx.completedAt?.toISOString() ?? null,
      durationMs: ctx.durationMs,
      errorMessage: ctx.errorMessage,
      logCount: ctx.executionLog.length,
    };
  }
}

export class ExecutionEngine {
  private runtime: GraphRuntime;

  constructor(runtime: GraphRuntime) {
    this.runtime = runtime;
  }

  async execute(
    compiled: CompiledGraph,
    breakpointNodeIds: number[] = [],
  ): Promise<ExecutionContext> {
    const ctx = this.runtime.createContext(compiled.graphId, breakpointNodeIds);
    ctx.state = "running";
    ctx.startedAt = new Date();

    for (const variable of compiled.variables) {
      ctx.variables.set(variable.name, variable.defaultValue ?? null);
    }

    const instructionMap = new Map<number, CompiledInstruction>(
      compiled.instructions.map((i) => [i.nodeId, i]),
    );

    const queue: number[] = [...compiled.entryPoints];

    try {
      while (queue.length > 0 && ctx.state === "running") {
        const nodeId = queue.shift()!;
        if (ctx.breakpoints.has(nodeId)) {
          ctx.state = "paused";
          ctx.currentNodeId = nodeId;
          queue.unshift(nodeId);
          break;
        }

        ctx.currentNodeId = nodeId;
        ctx.stack.push(nodeId);

        const instr = instructionMap.get(nodeId);
        if (!instr) continue;

        await this.executeNode(ctx, instr);

        for (const nextId of instr.nextNodes) {
          queue.push(nextId);
        }
      }

      if (ctx.state === "running") {
        ctx.state = "completed";
        ctx.completedAt = new Date();
        ctx.durationMs = ctx.completedAt.getTime() - ctx.startedAt!.getTime();
      }
    } catch (err) {
      ctx.state = "failed";
      ctx.errorMessage = String(err);
      ctx.completedAt = new Date();
      ctx.durationMs = ctx.completedAt.getTime() - (ctx.startedAt?.getTime() ?? Date.now());
    }

    return ctx;
  }

  private async executeNode(
    ctx: ExecutionContext,
    instr: CompiledInstruction,
  ): Promise<void> {
    switch (instr.type) {
      case "log":
      case "print": {
        const msg = String((instr.inputs as Record<string, unknown>)["message"] ?? "");
        ctx.executionLog.push({
          nodeId: instr.nodeId,
          level: "info",
          message: msg,
          data: { nodeKey: instr.nodeKey },
          timestamp: new Date(),
        });
        break;
      }
      case "set_variable": {
        const varName = String((instr.config as Record<string, unknown>)["variableName"] ?? "");
        const value = (instr.inputs as Record<string, unknown>)["value"];
        if (varName) ctx.variables.set(varName, value);
        break;
      }
      case "delay": {
        const ms = Number((instr.config as Record<string, unknown>)["delayMs"] ?? 0);
        if (ms > 0 && ms <= 5000) await new Promise((r) => setTimeout(r, ms));
        break;
      }
      case "start":
      case "end":
      case "event":
      case "sequence":
        ctx.executionLog.push({
          nodeId: instr.nodeId,
          level: "debug",
          message: `Executed ${instr.type} node`,
          data: {},
          timestamp: new Date(),
        });
        break;
      default:
        ctx.executionLog.push({
          nodeId: instr.nodeId,
          level: "debug",
          message: `Executed node type: ${instr.type}`,
          data: {},
          timestamp: new Date(),
        });
    }
  }
}
