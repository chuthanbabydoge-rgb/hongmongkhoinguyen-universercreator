import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import Canvas, { type Viewport } from "@/components/graph/canvas";
import GraphNode, { type NodeData } from "@/components/graph/node";
import Connection, { ConnectionLayer } from "@/components/graph/connection";
import GraphToolbar from "@/components/graph/toolbar";
import NodeLibrary, { type NodeDefinition, BUILT_IN_NODES } from "@/components/graph/node-library";
import Inspector from "@/components/graph/inspector";
import MiniMap from "@/components/graph/mini-map";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options?.headers },
  });

interface Graph {
  id: number;
  name: string;
  type: string;
  viewport: { x: number; y: number; zoom: number };
}

interface GraphDetails {
  graph: Graph;
  nodes: Array<{
    id: number; nodeKey: string; type: string; title: string;
    x: number; y: number; width: number; height: number;
    collapsed: boolean; disabled: boolean; color?: string; comment?: string;
  }>;
  pins: Array<{
    id: number; nodeId: number; graphId: number; pinKey: string;
    label: string; type: string; isInput: boolean; isRequired: boolean;
  }>;
  connections: Array<{
    id: number; sourcePinId: number; targetPinId: number; type: string;
  }>;
}

let _nodeCounter = 1000;
const nextTmpId = () => --_nodeCounter;
let _pinCounter = 1000;
const nextTmpPinId = () => --_pinCounter;

function buildNodeData(
  rawNode: GraphDetails["nodes"][0],
  pins: GraphDetails["pins"],
): NodeData {
  const nodePins = pins.filter((p) => p.nodeId === rawNode.id);
  return {
    ...rawNode,
    inputPins: nodePins.filter((p) => p.isInput),
    outputPins: nodePins.filter((p) => !p.isInput),
  };
}

export default function GraphEditor() {
  const { id } = useParams<{ id: string }>();
  const graphId = Number(id);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [rawPins, setRawPins] = useState<GraphDetails["pins"]>([]);
  const [rawConns, setRawConns] = useState<GraphDetails["connections"]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [executionState, setExecutionState] = useState("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: details, isLoading, error } = useQuery<GraphDetails>({
    queryKey: ["/api/graphs", graphId, "load"],
    queryFn: () => apiFetch(`/api/graphs/${graphId}/load`).then((r) => r.json()),
    enabled: !isNaN(graphId),
  });

  useEffect(() => {
    if (!details) return;
    const { graph, nodes: rawNodes, pins } = details;
    setNodes(rawNodes.map((n) => buildNodeData(n, pins)));
    setRawPins(details.pins);
    setRawConns(details.connections);
    if (graph.viewport) setViewport(graph.viewport as Viewport);
  }, [details]);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setContainerSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const executeMutation = useMutation({
    mutationFn: () => apiFetch(`/api/graphs/${graphId}/execute`, { method: "POST", body: JSON.stringify({ breakpoints: [] }) }).then((r) => r.json()),
    onMutate: () => setExecutionState("running"),
    onSuccess: (ctx) => { setExecutionState(ctx.state ?? "completed"); toast({ title: "Execution completed", description: `State: ${ctx.state}` }); },
    onError: () => { setExecutionState("failed"); toast({ title: "Execution failed", variant: "destructive" }); },
  });

  const compileMutation = useMutation({
    mutationFn: () => apiFetch(`/api/graphs/${graphId}/compile`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.validation?.valid) toast({ title: "Compilation succeeded" });
      else toast({ title: "Compilation errors", description: res.validation?.errors?.[0]?.message, variant: "destructive" });
    },
    onError: () => toast({ title: "Compile failed", variant: "destructive" }),
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        nodes: nodes.map(({ inputPins: _i, outputPins: _o, ...n }) => ({ ...n, graphId })),
        pins: rawPins.map((p) => ({ ...p, graphId })),
        connections: rawConns.map((c) => ({ ...c, graphId })),
        variables: [],
        viewport,
      };
      await apiFetch(`/api/graphs/${graphId}/save`, { method: "POST", body: JSON.stringify(payload) });
      qc.invalidateQueries({ queryKey: ["/api/graphs", graphId, "load"] });
      toast({ title: "Graph saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [nodes, rawPins, rawConns, viewport, graphId, qc, toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Delete" || e.key === "Backspace") handleDeleteSelected();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, selectedIds]);

  const handleAddNode = useCallback((def: NodeDefinition) => {
    const id = nextTmpId();
    const cx = (-viewport.x / viewport.zoom) + containerSize.w / viewport.zoom / 2;
    const cy = (-viewport.y / viewport.zoom) + containerSize.h / viewport.zoom / 2;

    const defaultPins: NodeData["inputPins"] = def.type === "branch"
      ? [{ id: nextTmpPinId(), pinKey: "exec_in", label: "Exec", type: "execution", isInput: true, isRequired: false }]
      : def.type === "start" ? []
      : [{ id: nextTmpPinId(), pinKey: "exec_in", label: "Exec", type: "execution", isInput: true, isRequired: false }];

    const defaultOutPins: NodeData["outputPins"] = def.type === "end" ? []
      : def.type === "branch"
      ? [
          { id: nextTmpPinId(), pinKey: "exec_true", label: "True", type: "execution", isInput: false, isRequired: false },
          { id: nextTmpPinId(), pinKey: "exec_false", label: "False", type: "execution", isInput: false, isRequired: false },
        ]
      : [{ id: nextTmpPinId(), pinKey: "exec_out", label: "Exec", type: "execution", isInput: false, isRequired: false }];

    const newNode: NodeData = {
      id,
      nodeKey: `${def.type}_${Date.now()}`,
      type: def.type,
      title: def.title,
      x: Math.round(cx - 100),
      y: Math.round(cy - 40),
      width: 200,
      height: 80,
      collapsed: false,
      disabled: false,
      color: def.color,
      inputPins: defaultPins,
      outputPins: defaultOutPins,
    };
    setNodes((prev) => [...prev, newNode]);
  }, [viewport, containerSize]);

  const handleMoveNode = useCallback((id: number, dx: number, dy: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n));
  }, []);

  const handleSelectNode = useCallback((id: number, multi: boolean) => {
    setSelectedIds((prev) => {
      if (multi) {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      }
      return new Set([id]);
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setNodes((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleNodeChange = useCallback((id: number, changes: Partial<NodeData>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, ...changes } : n));
  }, []);

  const selectedNode = nodes.find((n) => selectedIds.size === 1 && selectedIds.has(n.id)) ?? null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error || !details) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load graph</span>
      </div>
    );
  }

  const pinPositions = new Map<number, { x: number; y: number }>();

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8">
      <GraphToolbar
        graphName={details.graph.name}
        executionState={executionState}
        zoom={viewport.zoom}
        isSaving={isSaving}
        onPlay={() => executeMutation.mutate()}
        onStop={() => setExecutionState("stopped")}
        onSave={handleSave}
        onCompile={() => compileMutation.mutate()}
        onDelete={handleDeleteSelected}
        onZoomIn={() => setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.2, 4) }))}
        onZoomOut={() => setViewport((v) => ({ ...v, zoom: Math.max(v.zoom * 0.8, 0.1) }))}
        onFitView={() => setViewport({ x: 0, y: 0, zoom: 1 })}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodeLibrary onAddNode={handleAddNode} />

        <div ref={containerRef} className="flex-1 relative bg-background">
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            showGrid
            onBackgroundClick={() => setSelectedIds(new Set())}
          >
            <ConnectionLayer width={containerSize.w / viewport.zoom} height={containerSize.h / viewport.zoom}>
              {rawConns.map((conn) => {
                const srcPos = pinPositions.get(conn.sourcePinId);
                const tgtPos = pinPositions.get(conn.targetPinId);
                if (!srcPos || !tgtPos) return null;
                return (
                  <Connection
                    key={conn.id}
                    x1={srcPos.x} y1={srcPos.y}
                    x2={tgtPos.x} y2={tgtPos.y}
                    type={conn.type}
                  />
                );
              })}
            </ConnectionLayer>

            {nodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                selected={selectedIds.has(node.id)}
                onSelect={handleSelectNode}
                onMove={handleMoveNode}
                zoom={viewport.zoom}
                onPinMouseDown={() => {}}
                onPinMouseUp={() => {}}
              />
            ))}
          </Canvas>

          <MiniMap
            nodes={nodes}
            viewport={viewport}
            containerWidth={containerSize.w}
            containerHeight={containerSize.h}
          />
        </div>

        <Inspector selectedNode={selectedNode} onNodeChange={handleNodeChange} />
      </div>
    </div>
  );
}
