import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const SERVICE_TYPES = ["hospital","police","fire_station","school","library","bank","post_office","market","guild_hall","inn","stable","temple","blacksmith","enchanter","custom"];

export default function CityServiceManager() {
  const [, params] = useRoute("/city-service-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: services = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/services`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/services`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load services");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/services`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Service", serviceType: "market", serviceLevel: 1, coverageRadius: 150 }) });
      if (!res.ok) throw new Error("Failed to create service");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/services`] }); toast({ title: "Service created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create service", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (s: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/services/${s.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(s) });
      if (!res.ok) throw new Error("Failed to save service");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/services`] }); setEditing(null); toast({ title: "Service saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save service", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/services/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete service");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/services`] }); toast({ title: "Service deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete service", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Store className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold">Service Manager</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Service</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Service</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.serviceType ?? "market")} onChange={(e) => setEditing({ ...editing, serviceType: e.target.value })}>
                  {SERVICE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Service Level</label><Input type="number" min={1} value={String(editing.serviceLevel ?? 1)} onChange={(e) => setEditing({ ...editing, serviceLevel: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Coverage Radius</label><Input type="number" value={String(editing.coverageRadius ?? 150)} onChange={(e) => setEditing({ ...editing, coverageRadius: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Cost</label><Input type="number" value={String(editing.cost ?? 0)} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Required Level</label><Input type="number" value={String(editing.requiredLevel ?? 1)} onChange={(e) => setEditing({ ...editing, requiredLevel: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : services.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No services yet. Add hospitals, markets, guilds and more.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {services.map((s: Record<string, unknown>) => (
            <Card key={String(s.id)}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{String(s.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{String(s.serviceType).replace(/_/g, " ")} • Level {String(s.serviceLevel ?? 1)}/{String(s.maxServiceLevel ?? 5)}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(s.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={s.isActive ? "default" : "outline"}>{s.isActive ? "Active" : "Closed"}</Badge>
                  <Badge variant="outline">Coverage: {String(s.coverageRadius ?? 0)}u</Badge>
                  {(s.cost as number) > 0 && <Badge variant="secondary">Cost: {String(s.cost)}</Badge>}
                  {(s.requiredLevel as number) > 1 && <Badge variant="outline">Req Lvl {String(s.requiredLevel)}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
