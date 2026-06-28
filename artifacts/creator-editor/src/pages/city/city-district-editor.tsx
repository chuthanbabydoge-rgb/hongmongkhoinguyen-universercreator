import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const DISTRICT_TYPES = ["residential","commercial","industrial","cultural","governmental","military","religious","education","entertainment","mixed","slum","elite","custom"];

export default function CityDistrictEditor() {
  const [, params] = useRoute("/city-district-editor/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: districts = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/districts`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/districts`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load districts");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/districts`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New District", districtType: "residential", positionX: 0, positionY: 0, sizeX: 100, sizeY: 100 }) });
      if (!res.ok) throw new Error("Failed to create district");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/districts`] }); toast({ title: "District created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create district", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (d: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/districts/${d.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(d) });
      if (!res.ok) throw new Error("Failed to save district");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/districts`] }); setEditing(null); toast({ title: "District saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save district", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/districts/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete district");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/districts`] }); toast({ title: "District deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete district", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Map className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">District Editor</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add District</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit District</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.districtType ?? "residential")} onChange={(e) => setEditing({ ...editing, districtType: e.target.value })}>
                  {DISTRICT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Position X</label><Input type="number" value={String(editing.positionX ?? 0)} onChange={(e) => setEditing({ ...editing, positionX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Position Y</label><Input type="number" value={String(editing.positionY ?? 0)} onChange={(e) => setEditing({ ...editing, positionY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Size X</label><Input type="number" value={String(editing.sizeX ?? 100)} onChange={(e) => setEditing({ ...editing, sizeX: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Size Y</label><Input type="number" value={String(editing.sizeY ?? 100)} onChange={(e) => setEditing({ ...editing, sizeY: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Max Population</label><Input type="number" value={String(editing.maxPopulation ?? 1000)} onChange={(e) => setEditing({ ...editing, maxPopulation: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Tax Multiplier</label><Input type="number" step={0.1} value={String(editing.taxMultiplier ?? 1.0)} onChange={(e) => setEditing({ ...editing, taxMultiplier: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : districts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No districts yet. Add one to start.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {districts.map((d: Record<string, unknown>) => (
            <Card key={String(d.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: String(d.color ?? "#4a90e2") }} />
                  <div>
                    <div className="font-medium">{String(d.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{String(d.districtType).replace(/_/g, " ")} • {String(d.sizeX ?? 0)}×{String(d.sizeY ?? 0)} units</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Pop: {String(d.population ?? 0)}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setEditing(d)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(d.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
