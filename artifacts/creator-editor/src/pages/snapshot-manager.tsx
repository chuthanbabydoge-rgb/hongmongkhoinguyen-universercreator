import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, RotateCcw, Clock, Database, Plus, Layers } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function SnapshotManager() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const qc = useQueryClient();
  const [snapName, setSnapName] = useState("");

  const { data: session } = useQuery({
    queryKey: ["/api/runtime", sessionId],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}`),
  });

  const { data: snapshots = [] } = useQuery<any[]>({
    queryKey: ["/api/runtime", sessionId, "snapshots"],
    queryFn: async () => {
      const s = await apiFetch(`/api/runtime/${sessionId}`);
      return [];
    },
  });

  const createSnap = useMutation({
    mutationFn: (name: string) => apiFetch(`/api/runtime/${sessionId}/snapshot`, { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId, "snapshots"] }); setSnapName(""); },
  });

  const restore = useMutation({
    mutationFn: (snapshotId: number) => apiFetch(`/api/runtime/${sessionId}/restore`, { method: "POST", body: JSON.stringify({ snapshotId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Camera className="w-6 h-6" />Snapshot Manager</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · Save and restore runtime state</p>
      </div>

      {/* Create Snapshot */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Create Snapshot</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Snapshot name (optional)…"
              value={snapName}
              onChange={(e) => setSnapName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => createSnap.mutate(snapName || `Snapshot ${new Date().toISOString()}`)} disabled={createSnap.isPending}>
              <Camera className="w-4 h-4 mr-2" />Capture
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Captures the full runtime state: entities, components, variables, simulation tick. Use checkpoints to label key moments.
          </p>
        </CardContent>
      </Card>

      {/* Snapshot Concept Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Camera, title: "Save Runtime", desc: "Captures full world state including all entities, components, and system state at current tick.", color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: RotateCcw, title: "Restore Runtime", desc: "Rolls back the simulation to any previously captured snapshot. Entity positions and variables are restored.", color: "text-purple-400", bg: "bg-purple-500/10" },
          { icon: Database, title: "Checkpoint", desc: "Label a snapshot as a named checkpoint. Checkpoints are used for rollback during debugging or play testing.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <Card key={title}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${bg} shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground mt-1">{desc}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Snapshots list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Snapshots ({snapshots.length})</span>
            <Badge variant="outline" className="text-xs">Session: {session?.state ?? "—"} · Tick {session?.currentTick ?? 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No snapshots yet.</p>
              <p className="text-xs mt-1">Start the runtime and capture snapshots during play mode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((s: any) => (
                <div key={s.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Camera className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Tick {s.tick} · {s.entityCount} entities · {new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.isAutomatic && <Badge variant="outline" className="text-xs">auto</Badge>}
                    <Button size="sm" variant="outline" onClick={() => restore.mutate(s.id)} disabled={restore.isPending}>
                      <RotateCcw className="w-3 h-3 mr-1" />Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
