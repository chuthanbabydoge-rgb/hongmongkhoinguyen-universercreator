import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CitySpawnManager() {
  const [, params] = useRoute("/city-spawn-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: spawns = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/spawnpoints`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/spawnpoints`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load spawnpoints");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/spawnpoints`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Spawnpoint", spawnType: "player", positionX: 0, positionY: 0, positionZ: 0, isDefault: spawns.length === 0 }) });
      if (!res.ok) throw new Error("Failed to create spawnpoint");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/spawnpoints`] }); toast({ title: "Spawnpoint created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create spawnpoint", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (s: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/spawnpoints/${s.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(s) });
      if (!res.ok) throw new Error("Failed to save spawnpoint");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/spawnpoints`] }); setEditing(null); toast({ title: "Spawnpoint saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save spawnpoint", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/spawnpoints/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete spawnpoint");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/spawnpoints`] }); toast({ title: "Spawnpoint deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete spawnpoint", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <MapPin className="w-6 h-6 text-red-400" />
          <h1 className="text-xl font-bold">Spawn Manager</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Spawnpoint</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Spawnpoint</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Spawn Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.spawnType ?? "player")} onChange={(e) => setEditing({ ...editing, spawnType: e.target.value })}>
                  {["player","npc","vehicle","mount","item","custom"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Position X</label><Input type="number" value={String(editing.positionX ?? 0)} onChange={(e) => setEditing({ ...editing, positionX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Position Y</label><Input type="number" value={String(editing.positionY ?? 0)} onChange={(e) => setEditing({ ...editing, positionY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Position Z</label><Input type="number" value={String(editing.positionZ ?? 0)} onChange={(e) => setEditing({ ...editing, positionZ: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Max Concurrent</label><Input type="number" value={String(editing.maxConcurrent ?? 10)} onChange={(e) => setEditing({ ...editing, maxConcurrent: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Respawn Delay (s)</label><Input type="number" value={String(editing.respawnDelay ?? 5)} onChange={(e) => setEditing({ ...editing, respawnDelay: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Required Level</label><Input type="number" value={String(editing.requiredLevel ?? 1)} onChange={(e) => setEditing({ ...editing, requiredLevel: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : spawns.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No spawnpoints yet. Add at least one default spawnpoint.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {spawns.map((s: Record<string, unknown>) => (
            <Card key={String(s.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${s.isDefault ? "text-yellow-500" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">{String(s.name)}</div>
                    <div className="text-xs text-muted-foreground">({String(s.positionX ?? 0)}, {String(s.positionY ?? 0)}, {String(s.positionZ ?? 0)}) • Max {String(s.maxConcurrent ?? 10)} concurrent</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{String(s.spawnType)}</Badge>
                  {s.isDefault && <Badge>Default</Badge>}
                  {!s.isActive && <Badge variant="destructive">Inactive</Badge>}
                  <Button size="sm" variant="outline" onClick={() => setEditing(s)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(s.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
