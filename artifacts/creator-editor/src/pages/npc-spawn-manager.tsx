import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const SPAWN_MODES = ["fixed","random","scripted","wave","respawn","one_time","custom"];

export default function NpcSpawnManager() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "Spawn Point", spawnMode: "fixed", posX: 0, posY: 0, posZ: 0, maxCount: 1, respawnTimeSeconds: 60, radius: 0 });

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: spawns = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "spawn-points"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/spawn-points`) });

  const createSpawn = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/spawn-points`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "spawn-points"] }); setCreating(false); },
  });

  const deleteSpawn = useMutation({
    mutationFn: (spawnId: number) => apiFetch(`/api/npc-editor/${npcId}/spawn-points/${spawnId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "spawn-points"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> Spawn Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`} · {(spawns as any[]).length} spawn points</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> Add Spawn Point</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.spawnMode} onChange={(e) => setForm({ ...form, spawnMode: e.target.value })}>
                {SPAWN_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <Input type="number" placeholder="Max Count" value={form.maxCount} onChange={(e) => setForm({ ...form, maxCount: Number(e.target.value) })} />
              <Input type="number" placeholder="Respawn (s)" value={form.respawnTimeSeconds} onChange={(e) => setForm({ ...form, respawnTimeSeconds: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" placeholder="X" value={form.posX} onChange={(e) => setForm({ ...form, posX: Number(e.target.value) })} />
              <Input type="number" placeholder="Y" value={form.posY} onChange={(e) => setForm({ ...form, posY: Number(e.target.value) })} />
              <Input type="number" placeholder="Z" value={form.posZ} onChange={(e) => setForm({ ...form, posZ: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createSpawn.mutate(form)} disabled={!form.name || createSpawn.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(spawns as any[]).length === 0 ? (
        <Card><CardContent className="py-16 text-center"><MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No spawn points defined</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(spawns as any[]).map((sp: any) => (
            <Card key={sp.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{sp.name}</p>
                    <Badge variant="outline" className="text-xs mt-1 capitalize">{sp.spawnMode}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSpawn.mutate(sp.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-3">
                  {[["X", sp.posX], ["Y", sp.posY], ["Z", sp.posZ]].map(([label, val]) => (
                    <div key={label} className="bg-muted/20 rounded p-2">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-mono">{typeof val === "number" ? val.toFixed(1) : val}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Max: {sp.maxCount}</span>
                  <span>Respawn: {sp.respawnTimeSeconds}s</span>
                  {sp.radius > 0 && <span>Radius: {sp.radius}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
