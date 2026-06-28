import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const SPAWN_TYPES = ["player", "npc", "boss", "pet", "vehicle", "object"];

export default function WorldSpawnManagerSystem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [spawnEntityRef, setSpawnEntityRef] = useState("");
  const [spawnType, setSpawnType] = useState("npc");
  const [form, setForm] = useState({ name: "", spawnType: "player", positionX: 0, positionY: 0, positionZ: 0, maxConcurrent: 1, respawnDelay: 30, isActive: true });
  const [spawnResult, setSpawnResult] = useState<Record<string, unknown> | null>(null);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: spawnpoints, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "spawnpoints"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/spawnpoints`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const { data: npcs } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "npcs"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/npcs`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/spawnpoints`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "spawnpoints"] }); setShowDialog(false); toast({ title: "Spawnpoint created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/spawnpoints/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "spawnpoints"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const spawnMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/spawnpoints/spawn`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ entityType: spawnType, entityRef: spawnEntityRef }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setSpawnResult(data); qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "npcs"] }); toast({ title: "Entity spawned" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-emerald-500" />Spawn Manager</h1>
          <p className="text-muted-foreground">Manage spawn points and spawn entities at runtime.</p>
        </div>
        {worldId && <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Spawnpoint</Button>}
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {worldId && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="text-sm font-medium">Spawn Entity</div>
            <div className="flex gap-2">
              <Select value={spawnType} onValueChange={setSpawnType}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{SPAWN_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select>
              <Input value={spawnEntityRef} onChange={e => setSpawnEntityRef(e.target.value)} placeholder="Entity ref (e.g. npc_goblin)" className="flex-1" />
              <Button onClick={() => spawnMutation.mutate()} disabled={!spawnEntityRef || spawnMutation.isPending}><Play className="w-4 h-4 mr-2" />Spawn</Button>
            </div>
            {spawnResult && <div className="text-xs text-green-500">Spawned at ({String((spawnResult as Record<string, unknown>).positionX ?? 0)},{String((spawnResult as Record<string, unknown>).positionY ?? 0)}) · {new Date(String(spawnResult.spawnedAt)).toLocaleTimeString()}</div>}
          </CardContent>
        </Card>
      )}

      {worldId && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Spawnpoints ({(spawnpoints ?? []).length})</h2>
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : (spawnpoints ?? []).length === 0 ? (
            <Card><CardContent className="py-6 text-center text-muted-foreground">No spawnpoints defined.</CardContent></Card>
          ) : (spawnpoints ?? []).map(s => (
            <Card key={String(s.id)}>
              <CardContent className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{String(s.name)}</div>
                  <div className="text-xs text-muted-foreground">({String(s.positionX)},{String(s.positionY)},{String(s.positionZ)}) · respawn: {String(s.respawnDelay)}s</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{String(s.spawnType)}</Badge>
                  <Badge variant={s.isActive ? "default" : "outline"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(Number(s.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Spawnpoint</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Type</Label><Select value={form.spawnType} onValueChange={v => setForm(f => ({ ...f, spawnType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SPAWN_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-3 gap-2">
              {["positionX", "positionY", "positionZ"].map(k => <div key={k}><Label className="text-xs">{k}</Label><Input type="number" value={(form as Record<string, unknown>)[k] as number} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Max Concurrent</Label><Input type="number" value={form.maxConcurrent} onChange={e => setForm(f => ({ ...f, maxConcurrent: Number(e.target.value) }))} /></div>
              <div><Label>Respawn Delay (s)</Label><Input type="number" value={form.respawnDelay} onChange={e => setForm(f => ({ ...f, respawnDelay: Number(e.target.value) }))} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button><Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
