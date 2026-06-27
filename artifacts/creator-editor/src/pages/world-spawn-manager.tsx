import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MapPin, Trash2, Star } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const SPAWN_COLORS: Record<string, string> = {
  player: "bg-emerald-500/20 text-emerald-400",
  npc: "bg-blue-500/20 text-blue-400",
  boss: "bg-red-500/20 text-red-400",
  pet: "bg-pink-500/20 text-pink-400",
  vehicle: "bg-orange-500/20 text-orange-400",
  item: "bg-amber-500/20 text-amber-400",
  custom: "bg-purple-500/20 text-purple-400",
};

const SPAWN_TYPES = ["player", "npc", "boss", "pet", "vehicle", "item", "custom"];

export default function WorldSpawnManager() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", spawnType: "player", posX: 0, posY: 0, posZ: 0 });
  const [filterType, setFilterType] = useState("all");

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: spawns = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/world-editor", worldId, "spawnpoints"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/spawnpoints`), enabled: !!worldId });

  const createSpawn = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/world-editor/${worldId}/spawnpoints`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "spawnpoints"] }); setCreating(false); setForm({ name: "", spawnType: "player", posX: 0, posY: 0, posZ: 0 }); },
  });

  const deleteSpawn = useMutation({
    mutationFn: (spawnId: number) => apiFetch(`/api/world-editor/${worldId}/spawnpoints/${spawnId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "spawnpoints"] }),
  });

  const setDefault = useMutation({
    mutationFn: (spawnId: number) => apiFetch(`/api/world-editor/${worldId}/spawnpoints/${spawnId}`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "spawnpoints"] }),
  });

  const filtered = filterType === "all" ? spawns : spawns.filter((s: any) => s.spawnType === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Spawn Manager</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`} · {spawns.length} spawn points</p>
        </div>
        <div className="ml-auto"><Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />Add Spawn</Button></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...SPAWN_TYPES].map((t) => (
          <Button key={t} variant={filterType === t ? "secondary" : "outline"} size="sm" className="capitalize" onClick={() => setFilterType(t)}>{t}</Button>
        ))}
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-5 space-y-3">
            <input autoFocus className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="Spawn name..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.spawnType} onChange={(e) => setForm({ ...form, spawnType: e.target.value })}>
              {SPAWN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              {["posX", "posY", "posZ"].map((axis) => (
                <div key={axis}>
                  <label className="text-xs text-muted-foreground">{axis.slice(-1).toUpperCase()}</label>
                  <input type="number" className="w-full bg-background border border-border rounded-md px-2 py-1 text-sm" value={(form as any)[axis]} onChange={(e) => setForm({ ...form, [axis]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createSpawn.mutate(form)} disabled={!form.name.trim()}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No spawn points yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((spawn: any) => (
            <Card key={spawn.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{spawn.name}</p>
                        {spawn.isDefault && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{spawn.posX.toFixed(1)}, {spawn.posY.toFixed(1)}, {spawn.posZ.toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs capitalize ${SPAWN_COLORS[spawn.spawnType] ?? "bg-zinc-500/20 text-zinc-400"}`}>{spawn.spawnType}</Badge>
                    {!spawn.isDefault && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Set as default" onClick={() => setDefault.mutate(spawn.id)}>
                        <Star className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSpawn.mutate(spawn.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
