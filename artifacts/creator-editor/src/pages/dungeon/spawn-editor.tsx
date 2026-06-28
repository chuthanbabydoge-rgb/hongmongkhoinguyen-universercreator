import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Spawnpoint { id: number; name: string; roomId: number; spawnType: string; count: number; maxCount: number; respawnDelay: number; waveNumber: number; isActive: boolean; }
const SPAWN_TYPES = ["fixed","random","wave","triggered","respawn","boss","elite","patrol"];

export default function SpawnEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Spawnpoint>>({ name: "Spawn Point", roomId: 0, spawnType: "fixed", count: 1, maxCount: 1, respawnDelay: 30, waveNumber: 1, isActive: true });

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: spawns } = useQuery<Spawnpoint[]>({ queryKey: ["/api/dungeons", dungeonId, "spawnpoints"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/spawnpoints`); return r.json(); } });
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/spawnpoints`, { method: "POST", body: JSON.stringify({ ...form, positionX: 0, positionY: 0, positionZ: 0 }) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "spawnpoints"] }); toast({ title: "Spawn point added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (sid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/spawnpoints/${sid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "spawnpoints"] }); toast({ title: "Spawn point removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const set = (k: keyof Spawnpoint, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Spawn Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Spawn Point</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Room</Label>
              <Select value={String(form.roomId)} onValueChange={(v) => set("roomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Spawn Type</Label>
              <Select value={form.spawnType ?? "fixed"} onValueChange={(v) => set("spawnType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SPAWN_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Count</Label><Input type="number" min={1} value={form.count ?? 1} onChange={(e) => set("count", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Wave #</Label><Input type="number" min={1} value={form.waveNumber ?? 1} onChange={(e) => set("waveNumber", Number(e.target.value))} /></div>
            </div>
            <div className="space-y-1"><Label>Respawn Delay (s)</Label><Input type="number" value={form.respawnDelay ?? 30} onChange={(e) => set("respawnDelay", Number(e.target.value))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive ?? true} onCheckedChange={(v) => set("isActive", v)} /><Label>Active</Label></div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.roomId} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Spawn Point</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{spawns?.length ?? 0} Spawn Points</p>
          {(spawns ?? []).map((s) => (
            <Card key={s.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    <Badge variant="outline" className="text-xs">{roomMap[s.roomId] ?? `Room ${s.roomId}`}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{s.spawnType}</Badge>
                    <span className="text-xs text-muted-foreground">×{s.count} wave {s.waveNumber}</span>
                    {!s.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(s.id)}><Trash2 className="w-3 h-3" /></Button>
              </CardContent>
            </Card>
          ))}
          {(spawns ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No spawn points yet.</p>}
        </div>
      </div>
    </div>
  );
}
