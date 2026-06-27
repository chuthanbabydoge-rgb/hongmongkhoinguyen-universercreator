import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const BEHAVIOR_TYPES = ["aggressive","defensive","passive","cowardly","neutral","friendly","territorial","custom"];

export default function NpcBehaviorEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", behaviorType: "neutral", priority: 0 });
  const [treeJson, setTreeJson] = useState("");
  const [editingTree, setEditingTree] = useState(false);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: behaviors = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "behaviors"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/behaviors`) });
  const { data: tree } = useQuery({ queryKey: ["/api/npc-editor", npcId, "behavior-tree"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/behavior-tree`) });

  const createBehavior = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/behaviors`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "behaviors"] }); setCreating(false); setNewForm({ name: "", behaviorType: "neutral", priority: 0 }); },
  });

  const deleteBehavior = useMutation({
    mutationFn: (bId: number) => apiFetch(`/api/npc-editor/${npcId}/behaviors/${bId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "behaviors"] }),
  });

  const updateTree = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/behavior-tree`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "behavior-tree"] }); setEditingTree(false); },
  });

  const saveTree = () => {
    try { updateTree.mutate(JSON.parse(treeJson)); }
    catch { alert("Invalid JSON"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> Behavior Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> Add Behavior</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Behavior name" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={newForm.behaviorType} onChange={(e) => setNewForm({ ...newForm, behaviorType: e.target.value })}>
                {BEHAVIOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input type="number" placeholder="Priority" value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createBehavior.mutate(newForm)} disabled={!newForm.name || createBehavior.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Behaviors ({(behaviors as any[]).length})</h2>
          {(behaviors as any[]).length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Brain className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" /><p className="text-muted-foreground text-sm">No behaviors defined</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {(behaviors as any[]).map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">Priority {b.priority} · <span className="capitalize">{b.behaviorType}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={b.isActive ? "default" : "secondary"} className="text-xs">{b.isActive ? "Active" : "Inactive"}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBehavior.mutate(b.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Behavior Tree</h2>
            <Button variant="outline" size="sm" onClick={() => { setTreeJson(JSON.stringify(tree ?? {}, null, 2)); setEditingTree(!editingTree); }}>
              {editingTree ? "Cancel" : "Edit JSON"}
            </Button>
          </div>
          {editingTree ? (
            <Card>
              <CardContent className="pt-4">
                <textarea
                  className="w-full bg-muted/30 border border-border rounded-md p-3 text-xs font-mono h-64 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  value={treeJson}
                  onChange={(e) => setTreeJson(e.target.value)}
                />
                <Button className="mt-3" onClick={saveTree} disabled={updateTree.isPending}><Save className="w-4 h-4 mr-2" /> Save Tree</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                {tree?.name ? (
                  <div className="space-y-3">
                    <p className="font-medium text-sm">{tree.name}</p>
                    <p className="text-xs text-muted-foreground">Root: {tree.rootNodeId ?? "none"}</p>
                    <p className="text-xs text-muted-foreground">{(tree.nodes as unknown[])?.length ?? 0} nodes · {(tree.edges as unknown[])?.length ?? 0} edges</p>
                    <pre className="text-xs bg-muted/20 rounded p-3 overflow-auto max-h-48">{JSON.stringify({ nodes: tree.nodes, edges: tree.edges }, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Brain className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No behavior tree defined</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => { setTreeJson(JSON.stringify({ name: "Main Behavior Tree", rootNodeId: "root", nodes: [], edges: [] }, null, 2)); setEditingTree(true); }}>Create Tree</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
