import { db } from "@workspace/db";
import {
  creatorGraphsTable,
  creatorGraphNodesTable,
  creatorGraphPinsTable,
  creatorGraphConnectionsTable,
  creatorGraphVariablesTable,
  creatorGraphFunctionsTable,
  creatorGraphEventsTable,
  creatorGraphMacrosTable,
  creatorGraphCommentsTable,
  creatorGraphGroupsTable,
  creatorGraphExecutionLogsTable,
  creatorGraphBreakpointsTable,
  creatorGraphTemplatesTable,
  creatorGraphHistoryTable,
  creatorGraphVersionsTable,
  creatorGraphCompilerCacheTable,
  creatorGraphRuntimeTable,
  creatorGraphSnapshotsTable,
  type CreatorGraph,
  type InsertGraph,
  type CreatorGraphNode,
  type InsertGraphNode,
  type CreatorGraphPin,
  type InsertGraphPin,
  type CreatorGraphConnection,
  type InsertGraphConnection,
  type CreatorGraphVariable,
  type InsertGraphVariable,
} from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";

export interface GraphWithDetails {
  graph: CreatorGraph;
  nodes: CreatorGraphNode[];
  pins: CreatorGraphPin[];
  connections: CreatorGraphConnection[];
  variables: CreatorGraphVariable[];
}

export class DrizzleGraphRepository {
  async findAll(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<{ items: CreatorGraph[]; total: number }> {
    const [items, [row]] = await Promise.all([
      db
        .select()
        .from(creatorGraphsTable)
        .where(eq(creatorGraphsTable.userId, userId))
        .orderBy(desc(creatorGraphsTable.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(creatorGraphsTable)
        .where(eq(creatorGraphsTable.userId, userId)),
    ]);
    return { items, total: row?.total ?? 0 };
  }

  async findById(id: number, userId: number): Promise<CreatorGraph | null> {
    const [graph] = await db
      .select()
      .from(creatorGraphsTable)
      .where(and(eq(creatorGraphsTable.id, id), eq(creatorGraphsTable.userId, userId)))
      .limit(1);
    return graph ?? null;
  }

  async create(data: InsertGraph): Promise<CreatorGraph> {
    const [graph] = await db.insert(creatorGraphsTable).values(data).returning();
    return graph!;
  }

  async update(id: number, userId: number, data: Partial<InsertGraph>): Promise<CreatorGraph | null> {
    const [updated] = await db
      .update(creatorGraphsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creatorGraphsTable.id, id), eq(creatorGraphsTable.userId, userId)))
      .returning();
    return updated ?? null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(creatorGraphsTable)
      .where(and(eq(creatorGraphsTable.id, id), eq(creatorGraphsTable.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async loadWithDetails(id: number, userId: number): Promise<GraphWithDetails | null> {
    const graph = await this.findById(id, userId);
    if (!graph) return null;

    const [nodes, pins, connections, variables] = await Promise.all([
      db.select().from(creatorGraphNodesTable).where(eq(creatorGraphNodesTable.graphId, id)),
      db.select().from(creatorGraphPinsTable).where(eq(creatorGraphPinsTable.graphId, id)),
      db.select().from(creatorGraphConnectionsTable).where(eq(creatorGraphConnectionsTable.graphId, id)),
      db.select().from(creatorGraphVariablesTable).where(eq(creatorGraphVariablesTable.graphId, id)),
    ]);

    return { graph, nodes, pins, connections, variables };
  }

  async upsertNodes(graphId: number, nodes: InsertGraphNode[]): Promise<CreatorGraphNode[]> {
    if (nodes.length === 0) return [];
    return db.insert(creatorGraphNodesTable).values(nodes).returning();
  }

  async upsertPins(pins: InsertGraphPin[]): Promise<CreatorGraphPin[]> {
    if (pins.length === 0) return [];
    return db.insert(creatorGraphPinsTable).values(pins).returning();
  }

  async upsertConnections(connections: InsertGraphConnection[]): Promise<CreatorGraphConnection[]> {
    if (connections.length === 0) return [];
    return db.insert(creatorGraphConnectionsTable).values(connections).returning();
  }

  async upsertVariables(variables: InsertGraphVariable[]): Promise<CreatorGraphVariable[]> {
    if (variables.length === 0) return [];
    return db.insert(creatorGraphVariablesTable).values(variables).returning();
  }

  async clearGraph(graphId: number): Promise<void> {
    await Promise.all([
      db.delete(creatorGraphConnectionsTable).where(eq(creatorGraphConnectionsTable.graphId, graphId)),
      db.delete(creatorGraphPinsTable).where(eq(creatorGraphPinsTable.graphId, graphId)),
      db.delete(creatorGraphNodesTable).where(eq(creatorGraphNodesTable.graphId, graphId)),
      db.delete(creatorGraphVariablesTable).where(eq(creatorGraphVariablesTable.graphId, graphId)),
    ]);
  }

  async getHistory(graphId: number, limit = 20) {
    return db
      .select()
      .from(creatorGraphHistoryTable)
      .where(eq(creatorGraphHistoryTable.graphId, graphId))
      .orderBy(desc(creatorGraphHistoryTable.createdAt))
      .limit(limit);
  }

  async addHistory(entry: {
    graphId: number;
    userId: number;
    action: string;
    snapshot: unknown;
    description?: string;
  }) {
    const [row] = await db.insert(creatorGraphHistoryTable).values(entry).returning();
    return row!;
  }

  async getVersions(graphId: number) {
    return db
      .select()
      .from(creatorGraphVersionsTable)
      .where(eq(creatorGraphVersionsTable.graphId, graphId))
      .orderBy(desc(creatorGraphVersionsTable.version));
  }

  async saveVersion(data: {
    graphId: number;
    userId: number;
    version: number;
    label?: string;
    description?: string;
    snapshot: unknown;
    compiledOutput?: unknown;
  }) {
    const [row] = await db.insert(creatorGraphVersionsTable).values({
      ...data,
      compiledOutput: data.compiledOutput ?? {},
    }).returning();
    return row!;
  }

  async getTemplates() {
    return db
      .select()
      .from(creatorGraphTemplatesTable)
      .where(eq(creatorGraphTemplatesTable.isPublic, true))
      .orderBy(desc(creatorGraphTemplatesTable.usageCount));
  }

  async getCompilerCache(graphId: number) {
    const [row] = await db
      .select()
      .from(creatorGraphCompilerCacheTable)
      .where(eq(creatorGraphCompilerCacheTable.graphId, graphId))
      .limit(1);
    return row ?? null;
  }

  async upsertCompilerCache(data: {
    graphId: number;
    checksum: string;
    compiledOutput: unknown;
    isValid: boolean;
    errorMessage?: string;
  }) {
    const existing = await this.getCompilerCache(data.graphId);
    if (existing) {
      const [row] = await db
        .update(creatorGraphCompilerCacheTable)
        .set({ ...data, compiledAt: new Date() })
        .where(eq(creatorGraphCompilerCacheTable.graphId, data.graphId))
        .returning();
      return row!;
    }
    const [row] = await db
      .insert(creatorGraphCompilerCacheTable)
      .values(data)
      .returning();
    return row!;
  }

  async saveRuntime(data: {
    graphId: number;
    runtimeId: string;
    state: string;
    currentNodeId?: number;
    variables: unknown;
    stack: unknown;
    startedAt?: Date;
    pausedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
    errorMessage?: string;
  }) {
    const [row] = await db
      .insert(creatorGraphRuntimeTable)
      .values({
        graphId: data.graphId,
        runtimeId: data.runtimeId,
        state: data.state as "idle" | "running" | "paused" | "completed" | "failed" | "stopped",
        currentNodeId: data.currentNodeId,
        variables: data.variables as Record<string, unknown>,
        stack: data.stack as unknown[],
        startedAt: data.startedAt,
        pausedAt: data.pausedAt,
        completedAt: data.completedAt,
        durationMs: data.durationMs,
        errorMessage: data.errorMessage,
      })
      .returning();
    return row!;
  }

  async saveExecutionLogs(
    graphId: number,
    runtimeId: string,
    logs: Array<{ nodeId: number | null; level: string; message: string; data: unknown }>,
  ) {
    if (logs.length === 0) return;
    await db.insert(creatorGraphExecutionLogsTable).values(
      logs.map((l) => ({
        graphId,
        runtimeId,
        nodeId: l.nodeId ?? undefined,
        level: l.level,
        message: l.message,
        data: l.data as Record<string, unknown>,
      })),
    );
  }

  async getBreakpoints(graphId: number) {
    return db
      .select()
      .from(creatorGraphBreakpointsTable)
      .where(eq(creatorGraphBreakpointsTable.graphId, graphId));
  }

  async getMacros(userId: number) {
    return db
      .select()
      .from(creatorGraphMacrosTable)
      .where(eq(creatorGraphMacrosTable.userId, userId));
  }

  async getSnapshots(graphId: number) {
    return db
      .select()
      .from(creatorGraphSnapshotsTable)
      .where(eq(creatorGraphSnapshotsTable.graphId, graphId))
      .orderBy(desc(creatorGraphSnapshotsTable.createdAt));
  }

  async getComments(graphId: number) {
    return db
      .select()
      .from(creatorGraphCommentsTable)
      .where(eq(creatorGraphCommentsTable.graphId, graphId));
  }

  async getGroups(graphId: number) {
    return db
      .select()
      .from(creatorGraphGroupsTable)
      .where(eq(creatorGraphGroupsTable.graphId, graphId));
  }

  async getFunctions(graphId: number) {
    return db
      .select()
      .from(creatorGraphFunctionsTable)
      .where(eq(creatorGraphFunctionsTable.graphId, graphId));
  }

  async getEvents(graphId: number) {
    return db
      .select()
      .from(creatorGraphEventsTable)
      .where(eq(creatorGraphEventsTable.graphId, graphId));
  }
}
