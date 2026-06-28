import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const ZONE_TYPES = ["safe","pvp","combat","restricted","housing","market","farming","crafting","training","event","neutral","custom"];
const ZONE_COLORS: Record<string, string> = { safe: "#22c55e", pvp: "#ef4444", combat: "#f97316", restricted: "#8b5cf6", housing: "#3b82f6", market: "#f59e0b", farming: "#84cc16", crafting: "#06b6d4", training: "#ec4899", event: "#a855f7", neutral: "#6b7280", custom: "#94a3b8" };

export default function CityZoneEditor() {
  const [, params] = useRoute("/city-zone-editor/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: zones = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/zones`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/zones`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load zones");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/zones`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Zone", zoneType: "safe", positionX: 0, positionY: 0, radius: 50 }) });
      if (!res.ok) throw new Error("Failed to create zone");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/zones`] }); toast({ title: "Zone created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create zone", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (z: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/zones/${z.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(z) });
      if (!res.ok) throw new Error("Failed to save zone");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/zones`] }); setEditing(null); toast({ title: "Zone saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save zone", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/zones/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete zone");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/zones`] }); toast({ title: "Zone deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete zone", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Layers className="w-6 h-6 text-green-400" />
          <h1 className="text-xl font-bold">Zone Editor</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Zone</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Zone</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.zoneType ?? "safe")} onChange={(e) => setEditing({ ...editing, zoneType: e.target.value, color: ZONE_COLORS[e.target.value] ?? "#94a3b8" })}>
                  {ZONE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Position X</label><Input type="number" value={String(editing.positionX ?? 0)} onChange={(e) => setEditing({ ...editing, positionX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Position Y</label><Input type="number" value={String(editing.positionY ?? 0)} onChange={(e) => setEditing({ ...editing, positionY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Radius</label><Input type="number" value={String(editing.radius ?? 50)} onChange={(e) => setEditing({ ...editing, radius: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : zones.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No zones yet. Add one to define areas.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {zones.map((z: Record<string, unknown>) => (
            <Card key={String(z.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: String(z.color ?? ZONE_COLORS[String(z.zoneType)] ?? "#94a3b8") }} />
                  <div>
                    <div className="font-medium">{String(z.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{String(z.zoneType).replace(/_/g, " ")} • r={String(z.radius ?? 50)}u at ({String(z.positionX ?? 0)}, {String(z.positionY ?? 0)})</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={z.pvpEnabled ? "destructive" : "secondary"}>{z.pvpEnabled ? "PvP" : "Safe"}</Badge>
                  <Badge variant={z.isActive ? "default" : "outline"}>{z.isActive ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setEditing(z)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(z.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
