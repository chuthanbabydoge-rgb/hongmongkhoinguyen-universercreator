import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityBuildingManager() {
  const [, params] = useRoute("/city-building-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: buildings = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/buildings`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/buildings`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load buildings");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/buildings`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Building", buildingType: "house", positionX: 0, positionY: 0, positionZ: 0, width: 10, depth: 10, height: 10 }) });
      if (!res.ok) throw new Error("Failed to create building");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/buildings`] }); toast({ title: "Building created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create building", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (b: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/buildings/${b.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(b) });
      if (!res.ok) throw new Error("Failed to save building");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/buildings`] }); setEditing(null); toast({ title: "Building saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save building", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/buildings/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete building");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/buildings`] }); toast({ title: "Building deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete building", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Building2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold">Building Manager</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Building</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Building</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Building Type</label><Input value={String(editing.buildingType ?? "house")} onChange={(e) => setEditing({ ...editing, buildingType: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Width</label><Input type="number" value={String(editing.width ?? 10)} onChange={(e) => setEditing({ ...editing, width: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Depth</label><Input type="number" value={String(editing.depth ?? 10)} onChange={(e) => setEditing({ ...editing, depth: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Height</label><Input type="number" value={String(editing.height ?? 10)} onChange={(e) => setEditing({ ...editing, height: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Floors</label><Input type="number" value={String(editing.floors ?? 1)} onChange={(e) => setEditing({ ...editing, floors: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Capacity</label><Input type="number" value={String(editing.capacity ?? 10)} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Owner</label><Input value={String(editing.owner ?? "")} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : buildings.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No buildings yet. Add buildings to populate your city.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {buildings.map((b: Record<string, unknown>) => (
            <Card key={String(b.id)}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{String(b.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{String(b.buildingType)} • {String(b.floors ?? 1)} floor(s)</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(b)}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(b.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{String(b.width ?? 0)}×{String(b.depth ?? 0)}×{String(b.height ?? 0)}m</Badge>
                  <Badge variant="outline">Cap: {String(b.capacity ?? 0)}</Badge>
                  {b.isEnterable && <Badge variant="secondary">Enterable</Badge>}
                  {!b.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
