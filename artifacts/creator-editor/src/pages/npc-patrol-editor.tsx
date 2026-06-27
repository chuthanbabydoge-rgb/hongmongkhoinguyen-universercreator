import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Route, Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Waypoint = { x: number; y: number; z: number; waitSeconds?: number };

export default function NpcPatrolEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: "Patrol Route", isLooping: true, patrolSpeed: 1.5, waitTimeSeconds: 2 });
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: paths = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "patrol-paths"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/patrol-paths`) });

  const createPath = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/patrol-paths`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (p: any) => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "patrol-paths"] }); setSelectedPath(p.id); setWaypoints([]); setCreating(false); },
  });

  const updatePath = useMutation({
    mutationFn: ({ pathId, data }: { pathId: number; data: Record<string, unknown> }) => apiFetch(`/api/npc-editor/${npcId}/patrol-paths/${pathId}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "patrol-paths"] }),
  });

  const deletePath = useMutation({
    mutationFn: (pathId: number) => apiFetch(`/api/npc-editor/${npcId}/patrol-paths/${pathId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "patrol-paths"] }); setSelectedPath(null); },
  });

  const addWaypoint = () => setWaypoints([...waypoints, { x: 0, y: 0, z: 0, waitSeconds: 0 }]);
  const removeWaypoint = (i: number) => setWaypoints(waypoints.filter((_, j) => j !== i));
  const saveWaypoints = () => {
    if (!selectedPath) return;
    updatePath.mutate({ pathId: selectedPath, data: { waypoints } });
  };

  const selectedPathData = (paths as any[]).find((p: any) => p.id === selectedPath);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Route className="w-6 h-6 text-primary" /> Patrol Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> New Path</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Path name" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
              <Input type="number" placeholder="Speed (m/s)" step={0.1} value={newForm.patrolSpeed} onChange={(e) => setNewForm({ ...newForm, patrolSpeed: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createPath.mutate(newForm)} disabled={!newForm.name || createPath.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Patrol Paths</h2>
          {(paths as any[]).length === 0 ? (
            <Card><CardContent className="py-8 text-center"><Route className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-xs text-muted-foreground">No patrol paths</p></CardContent></Card>
          ) : (
            (paths as any[]).map((p: any) => (
              <Card key={p.id} className={`cursor-pointer transition-colors ${selectedPath === p.id ? "border-primary" : "hover:border-primary/40"}`} onClick={() => { setSelectedPath(p.id); setWaypoints((p.waypoints as Waypoint[]) ?? []); }}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{(p.waypoints as unknown[])?.length ?? 0} waypoints · {p.patrolSpeed}m/s</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deletePath.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedPath ? (
            <Card><CardContent className="py-16 text-center"><Route className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Select a patrol path to edit waypoints</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedPathData?.name} — Waypoints</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addWaypoint}><Plus className="w-3 h-3 mr-1" /> Waypoint</Button>
                  <Button size="sm" onClick={saveWaypoints} disabled={updatePath.isPending}><Save className="w-3 h-3 mr-1" /> Save</Button>
                </div>
              </div>
              <div className="space-y-2">
                {waypoints.map((wp, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <Input type="number" placeholder="X" value={wp.x} onChange={(e) => { const u = [...waypoints]; u[i] = { ...u[i], x: Number(e.target.value) }; setWaypoints(u); }} className="flex-1 h-8 text-xs" />
                    <Input type="number" placeholder="Y" value={wp.y} onChange={(e) => { const u = [...waypoints]; u[i] = { ...u[i], y: Number(e.target.value) }; setWaypoints(u); }} className="flex-1 h-8 text-xs" />
                    <Input type="number" placeholder="Z" value={wp.z} onChange={(e) => { const u = [...waypoints]; u[i] = { ...u[i], z: Number(e.target.value) }; setWaypoints(u); }} className="flex-1 h-8 text-xs" />
                    <Input type="number" placeholder="Wait(s)" value={wp.waitSeconds ?? 0} onChange={(e) => { const u = [...waypoints]; u[i] = { ...u[i], waitSeconds: Number(e.target.value) }; setWaypoints(u); }} className="w-20 h-8 text-xs" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeWaypoint(i)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
                {waypoints.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Add waypoints to define the patrol route</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
