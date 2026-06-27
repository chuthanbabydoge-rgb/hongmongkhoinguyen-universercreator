import type { CreatorGraphNode, CreatorGraphPin, CreatorGraphConnection } from "@workspace/db";

export interface ValidationError {
  type: "error" | "warning";
  code: string;
  message: string;
  nodeId?: number;
  pinId?: number;
  connectionId?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface GraphSnapshot {
  nodes: CreatorGraphNode[];
  pins: CreatorGraphPin[];
  connections: CreatorGraphConnection[];
}

export class GraphValidator {
  validate(graph: GraphSnapshot): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    this.checkMissingConnections(graph, errors, warnings);
    this.checkDuplicateExecutionOutputs(graph, errors);
    this.checkCycles(graph, errors);
    this.checkUnusedNodes(graph, warnings);
    this.checkBrokenLinks(graph, errors);
    this.checkStartNode(graph, errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private checkStartNode(graph: GraphSnapshot, errors: ValidationError[]): void {
    const startNodes = graph.nodes.filter((n) => n.type === "start");
    if (startNodes.length === 0) {
      errors.push({
        type: "error",
        code: "MISSING_START_NODE",
        message: "Graph must have at least one Start node",
      });
    }
  }

  private checkMissingConnections(
    graph: GraphSnapshot,
    errors: ValidationError[],
    warnings: ValidationError[],
  ): void {
    const connectedPinIds = new Set<number>();
    for (const conn of graph.connections) {
      connectedPinIds.add(conn.sourcePinId);
      connectedPinIds.add(conn.targetPinId);
    }

    for (const pin of graph.pins) {
      if (pin.isRequired && !connectedPinIds.has(pin.id)) {
        errors.push({
          type: "error",
          code: "MISSING_REQUIRED_CONNECTION",
          message: `Required pin "${pin.label}" on node ${pin.nodeId} is not connected`,
          nodeId: pin.nodeId,
          pinId: pin.id,
        });
      }
    }
  }

  private checkDuplicateExecutionOutputs(
    graph: GraphSnapshot,
    errors: ValidationError[],
  ): void {
    const executionOutputPins = graph.pins.filter(
      (p) => p.type === "execution" && !p.isInput,
    );

    const pinConnectionCount = new Map<number, number>();
    for (const conn of graph.connections) {
      if (conn.type === "execution") {
        const count = pinConnectionCount.get(conn.sourcePinId) ?? 0;
        pinConnectionCount.set(conn.sourcePinId, count + 1);
      }
    }

    for (const pin of executionOutputPins) {
      const count = pinConnectionCount.get(pin.id) ?? 0;
      if (count > 1) {
        errors.push({
          type: "error",
          code: "DUPLICATE_EXECUTION_OUTPUT",
          message: `Execution output pin "${pin.label}" on node ${pin.nodeId} has multiple connections`,
          nodeId: pin.nodeId,
          pinId: pin.id,
        });
      }
    }
  }

  private checkCycles(graph: GraphSnapshot, errors: ValidationError[]): void {
    const nodeIds = graph.nodes.map((n) => n.id);
    const pinToNode = new Map<number, number>();
    for (const pin of graph.pins) {
      pinToNode.set(pin.id, pin.nodeId);
    }

    const adjacency = new Map<number, Set<number>>();
    for (const id of nodeIds) adjacency.set(id, new Set());

    for (const conn of graph.connections) {
      if (conn.type === "execution") {
        const srcNode = pinToNode.get(conn.sourcePinId);
        const tgtNode = pinToNode.get(conn.targetPinId);
        if (srcNode !== undefined && tgtNode !== undefined && srcNode !== tgtNode) {
          adjacency.get(srcNode)?.add(tgtNode);
        }
      }
    }

    const visited = new Set<number>();
    const recStack = new Set<number>();

    const hasCycle = (nodeId: number): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      recStack.delete(nodeId);
      return false;
    };

    for (const id of nodeIds) {
      if (!visited.has(id)) {
        if (hasCycle(id)) {
          errors.push({
            type: "error",
            code: "CYCLE_DETECTED",
            message: "Infinite loop detected in execution graph",
            nodeId: id,
          });
          break;
        }
      }
    }
  }

  private checkUnusedNodes(
    graph: GraphSnapshot,
    warnings: ValidationError[],
  ): void {
    const connectedNodeIds = new Set<number>();
    const pinToNode = new Map<number, number>();
    for (const pin of graph.pins) pinToNode.set(pin.id, pin.nodeId);

    for (const conn of graph.connections) {
      const s = pinToNode.get(conn.sourcePinId);
      const t = pinToNode.get(conn.targetPinId);
      if (s !== undefined) connectedNodeIds.add(s);
      if (t !== undefined) connectedNodeIds.add(t);
    }

    for (const node of graph.nodes) {
      if (node.type === "comment" || node.type === "group") continue;
      if (!connectedNodeIds.has(node.id)) {
        warnings.push({
          type: "warning",
          code: "UNUSED_NODE",
          message: `Node "${node.title}" (id: ${node.id}) is not connected to any other node`,
          nodeId: node.id,
        });
      }
    }
  }

  private checkBrokenLinks(
    graph: GraphSnapshot,
    errors: ValidationError[],
  ): void {
    const pinIds = new Set(graph.pins.map((p) => p.id));
    for (const conn of graph.connections) {
      if (!pinIds.has(conn.sourcePinId) || !pinIds.has(conn.targetPinId)) {
        errors.push({
          type: "error",
          code: "BROKEN_CONNECTION",
          message: `Connection ${conn.id} references a missing pin`,
          connectionId: conn.id,
        });
      }
    }
  }
}
