import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Plus, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldCheckpointCenter() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [label, setLabel] = useState("");

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: checkpoints, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "checkpoints"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/checkpoints`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/checkpoints`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, label }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "checkpoints"] }); toast({ title: "Checkpoint created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveStateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/save-state`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, label }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "checkpoints"] }); toast({ title: "World state saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const rollbackMutation = useMutation({
    mutationFn: async (cpId: number) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/checkpoints/${cpId}/rollback`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "Rolled back to checkpoint" }),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/simulate/checkpoint`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => toast({ title: "Checkpoint simulation", description: `Save ~${Number(data.estimatedSaveTimeMs).toFixed(0)}ms · ${data.rollbackFeasible ? "Rollback possible" : "No rollback available"}` }),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bookmark className="w-6 h-6 text-amber-500" />Checkpoint Center</h1>
        <p className="text-muted-foreground">Save, restore, and rollback world checkpoints.</p>
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {worldId && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Create Checkpoint</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Session ID</Label><Input value={sessionId} onChange={e => setSessionId(e.target.value)} /></div>
              <div><Label>Label (optional)</Label><Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Before Boss Fight" /></div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Checkpoint</Button>
                <Button variant="outline" className="flex-1" onClick={() => saveStateMutation.mutate()} disabled={saveStateMutation.isPending}><Save className="w-4 h-4 mr-2" />Save State</Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>Simulate Save Performance</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Checkpoints ({(checkpoints ?? []).length})</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <div className="text-muted-foreground">Loading...</div> : (checkpoints ?? []).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">No checkpoints yet.</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(checkpoints ?? []).map(cp => (
                    <div key={String(cp.id)} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm">
                      <div>
                        <div className="font-medium">{String(cp.label ?? `Checkpoint #${cp.id}`)}</div>
                        <div className="text-xs text-muted-foreground">{new Date(String(cp.createdAt)).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cp.isAutoSave && <Badge variant="secondary" className="text-xs">Auto</Badge>}
                        <Button size="sm" variant="outline" onClick={() => { if (confirm("Rollback to this checkpoint?")) rollbackMutation.mutate(Number(cp.id)); }}>
                          <RotateCcw className="w-3 h-3 mr-1" />Rollback
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
