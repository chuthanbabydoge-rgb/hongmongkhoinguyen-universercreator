import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bus, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityTransportManager() {
  const [, params] = useRoute("/city-transport-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: transport = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/transport`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/transport`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load transport");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/transport`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Route", transportType: "bus", capacity: 20, intervalMinutes: 15, fare: 0 }) });
      if (!res.ok) throw new Error("Failed to create transport route");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/transport`] }); toast({ title: "Transport route created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create route", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (t: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/transport/${t.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(t) });
      if (!res.ok) throw new Error("Failed to save transport");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/transport`] }); setEditing(null); toast({ title: "Transport saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save transport", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/transport/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete transport");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/transport`] }); toast({ title: "Route deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete route", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Bus className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-bold">Transport Manager</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Route</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Transport Route</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.transportType ?? "bus")} onChange={(e) => setEditing({ ...editing, transportType: e.target.value })}>
                  {["bus","tram","subway","taxi","ferry","gondola","airship","horse_carriage","teleport","custom"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Capacity</label><Input type="number" value={String(editing.capacity ?? 20)} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Interval (min)</label><Input type="number" value={String(editing.intervalMinutes ?? 15)} onChange={(e) => setEditing({ ...editing, intervalMinutes: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Fare</label><Input type="number" value={String(editing.fare ?? 0)} onChange={(e) => setEditing({ ...editing, fare: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Operating Start (hr)</label><Input type="number" min={0} max={23} value={String(editing.operatingHoursStart ?? 6)} onChange={(e) => setEditing({ ...editing, operatingHoursStart: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Operating End (hr)</label><Input type="number" min={0} max={23} value={String(editing.operatingHoursEnd ?? 22)} onChange={(e) => setEditing({ ...editing, operatingHoursEnd: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : transport.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No transport routes yet. Add routes to connect districts.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {transport.map((t: Record<string, unknown>) => (
            <Card key={String(t.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(t.name)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{String(t.transportType).replace(/_/g, " ")} • Every {String(t.intervalMinutes ?? 15)} min • Cap: {String(t.capacity ?? 20)} • Fare: {String(t.fare ?? 0)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.isActive ? "default" : "outline"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                  <span className="text-xs text-muted-foreground">{String(t.operatingHoursStart ?? 6)}:00 – {String(t.operatingHoursEnd ?? 22)}:00</span>
                  <Button size="sm" variant="outline" onClick={() => setEditing(t)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(t.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
