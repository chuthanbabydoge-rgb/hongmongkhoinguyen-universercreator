import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Route, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const ROAD_TYPES = ["main_street","alley","highway","path","bridge","tunnel","underground","elevated","waterway","railway","custom"];

export default function CityRoadEditor() {
  const [, params] = useRoute("/city-road-editor/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: roads = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/roads`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/roads`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load roads");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/roads`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Road", roadType: "main_street", startX: 0, startY: 0, endX: 100, endY: 0, width: 10 }) });
      if (!res.ok) throw new Error("Failed to create road");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/roads`] }); toast({ title: "Road created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create road", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (r: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/roads/${r.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(r) });
      if (!res.ok) throw new Error("Failed to save road");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/roads`] }); setEditing(null); toast({ title: "Road saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save road", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/roads/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete road");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/roads`] }); toast({ title: "Road deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete road", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Route className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold">Road Editor</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Road</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Road</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.roadType ?? "main_street")} onChange={(e) => setEditing({ ...editing, roadType: e.target.value })}>
                  {ROAD_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Start X</label><Input type="number" value={String(editing.startX ?? 0)} onChange={(e) => setEditing({ ...editing, startX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Start Y</label><Input type="number" value={String(editing.startY ?? 0)} onChange={(e) => setEditing({ ...editing, startY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">End X</label><Input type="number" value={String(editing.endX ?? 100)} onChange={(e) => setEditing({ ...editing, endX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">End Y</label><Input type="number" value={String(editing.endY ?? 0)} onChange={(e) => setEditing({ ...editing, endY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Width</label><Input type="number" value={String(editing.width ?? 10)} onChange={(e) => setEditing({ ...editing, width: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Speed Limit</label><Input type="number" value={String(editing.speedLimit ?? 30)} onChange={(e) => setEditing({ ...editing, speedLimit: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : roads.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No roads yet. Add roads to connect your city.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {roads.map((r: Record<string, unknown>) => (
            <Card key={String(r.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(r.name)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{String(r.roadType).replace(/_/g, " ")} • {String(r.width ?? 10)}m wide • {String(r.speedLimit ?? 30)} km/h</div>
                </div>
                <div className="flex items-center gap-2">
                  {(r.isOneWay as boolean) && <Badge variant="outline">One-way</Badge>}
                  {(r.isToll as boolean) && <Badge variant="secondary">Toll</Badge>}
                  {(r.isBlocked as boolean) && <Badge variant="destructive">Blocked</Badge>}
                  <Button size="sm" variant="outline" onClick={() => setEditing(r)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(r.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
