import type { CreatorGraphNode, CreatorGraphPin, CreatorGraphConnection, CreatorGraphVariable } from "@workspace/db";
import { GraphValidator, type GraphSnapshot, type ValidationResult } from "./graph-validator";

export interface CompiledInstruction {
  nodeId: number;
  nodeKey: string;
  type: string;
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
  nextNodes: number[];
}

export interface CompiledGraph {
  graphId: number;
  instructions: CompiledInstruction[];
  entryPoints: number[];
  variables: CompiledVariable[];
  checksum: string;
  compiledAt: string;
}

export interface CompiledVariable {
  name: string;
  type: string;
  scope: string;
  defaultValue: unknown;
}

export class GraphCompiler {
  private validator = new GraphValidator();

  compile(
    graphId: number,
    nodes: CreatorGraphNode[],
    pins: CreatorGraphPin[],
    connections: CreatorGraphConnection[],
    variables: CreatorGraphVariable[],
  ): { result?: CompiledGraph; validation: ValidationResult } {
    const snapshot: GraphSnapshot = { nodes, pins, connections };
    const validation = this.validator.validate(snapshot);

    if (!validation.valid) {
      return { validation };
    }

    const sorted = this.topologicalSort(nodes, pins, connections);
    const pinToNode = new Map<number, number>();
    for (const pin of pins) pinToNode.set(pin.id, pin.nodeId);

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const inputPins = new Map<number, CreatorGraphPin[]>();
    const outputPins = new Map<number, CreatorGraphPin[]>();

    for (const pin of pins) {
      if (pin.isInput) {
        const list = inputPins.get(pin.nodeId) ?? [];
        list.push(pin);
        inputPins.set(pin.nodeId, list);
      } else {
        const list = outputPins.get(pin.nodeId) ?? [];
        list.push(pin);
        outputPins.set(pin.nodeId, list);
      }
    }

    const executionNextMap = new Map<number, number[]>();
    for (const conn of connections) {
      if (conn.type === "execution") {
        const srcNode = pinToNode.get(conn.sourcePinId);
        const tgtNode = pinToNode.get(conn.targetPinId);
        if (srcNode !== undefined && tgtNode !== undefined) {
          const list = executionNextMap.get(srcNode) ?? [];
          list.push(tgtNode);
          executionNextMap.set(srcNode, list);
        }
      }
    }

    const instructions: CompiledInstruction[] = sorted.map((nodeId) => {
      const node = nodeMap.get(nodeId)!;
      const ins = inputPins.get(nodeId) ?? [];
      const inputDefaults: Record<string, unknown> = {};
      for (const pin of ins) {
        if (pin.type !== "execution") {
          inputDefaults[pin.pinKey] = pin.defaultValue;
        }
      }

      return {
        nodeId: node.id,
        nodeKey: node.nodeKey,
        type: node.type,
        config: node.config as Record<string, unknown>,
        inputs: inputDefaults,
        nextNodes: executionNextMap.get(node.id) ?? [],
      };
    });

    const entryPoints = nodes
      .filter((n) => n.type === "start" || n.type === "event")
      .map((n) => n.id);

    const compiledVariables: CompiledVariable[] = variables.map((v) => ({
      name: v.name,
      type: v.type,
      scope: v.scope,
      defaultValue: v.defaultValue,
    }));

    const checksum = this.computeChecksum(graphId, nodes, connections);

    const result: CompiledGraph = {
      graphId,
      instructions,
      entryPoints,
      variables: compiledVariables,
      checksum,
      compiledAt: new Date().toISOString(),
    };

    return { result, validation };
  }

  private topologicalSort(
    nodes: CreatorGraphNode[],
    pins: CreatorGraphPin[],
    connections: CreatorGraphConnection[],
  ): number[] {
    const pinToNode = new Map<number, number>();
    for (const pin of pins) pinToNode.set(pin.id, pin.nodeId);

    const inDegree = new Map<number, number>();
    const adjacency = new Map<number, number[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }

    for (const conn of connections) {
      if (conn.type === "execution") {
        const src = pinToNode.get(conn.sourcePinId);
        const tgt = pinToNode.get(conn.targetPinId);
        if (src !== undefined && tgt !== undefined && src !== tgt) {
          adjacency.get(src)!.push(tgt);
          inDegree.set(tgt, (inDegree.get(tgt) ?? 0) + 1);
        }
      }
    }

    const queue: number[] = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    const sorted: number[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }

    return sorted;
  }

  private computeChecksum(
    graphId: number,
    nodes: CreatorGraphNode[],
    connections: CreatorGraphConnection[],
  ): string {
    const data = JSON.stringify({
      graphId,
      nodeCount: nodes.length,
      nodeIds: nodes.map((n) => n.id).sort(),
      connCount: connections.length,
    });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash * 31 + data.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16);
  }
}
