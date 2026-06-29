import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });
const UTILITY_TYPES = ["electricity","water","sewage","gas","telecom","waste","heating","cooling","magic_grid","custom"];

export default function CityUtilityManager() {
  const [, params] = useRoute("/city-utility-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: utilities = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/utilities`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/utilities`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load utilities");
      return res.json();
    },
    enabled: !!cityId,
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/utilities`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New Utility", utilityType: "electricity", capacity: 100, coverageRadius: 200 }) });
      if (!res.ok) throw new Error("Failed to create utility");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/utilities`] }); toast({ title: "Utility created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create utility", variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async (u: Record<string, unknown>) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/utilities/${u.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(u) });
      if (!res.ok) throw new Error("Failed to save utility");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/utilities`] }); setEditing(null); toast({ title: "Utility saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save utility", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/utilities/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete utility");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/utilities`] }); toast({ title: "Utility deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete utility", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Cpu className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl font-bold">Utility Manager</h1>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Utility</Button>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-sm">Edit Utility</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input value={String(editing.name ?? "")} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(editing.utilityType ?? "electricity")} onChange={(e) => setEditing({ ...editing, utilityType: e.target.value })}>
                  {UTILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Capacity</label><Input type="number" value={String(editing.capacity ?? 100)} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Coverage Radius</label><Input type="number" value={String(editing.coverageRadius ?? 200)} onChange={(e) => setEditing({ ...editing, coverageRadius: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Efficiency</label><Input type="number" step={0.1} value={String(editing.efficiency ?? 1.0)} onChange={(e) => setEditing({ ...editing, efficiency: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Maintenance Cost</label><Input type="number" value={String(editing.maintenanceCost ?? 10)} onChange={(e) => setEditing({ ...editing, maintenanceCost: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : utilities.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No utilities yet. Add power, water, and more.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {utilities.map((u: Record<string, unknown>) => (
            <Card key={String(u.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(u.name)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{String(u.utilityType).replace(/_/g, " ")} • Capacity: {String(u.capacity)} • Coverage: {String(u.coverageRadius)}u</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.isActive ? "default" : "outline"}>{u.isActive ? "Active" : "Offline"}</Badge>
                  {(u.isCritical as boolean) && <Badge variant="destructive">Critical</Badge>}
                  <span className="text-xs text-muted-foreground">Lvl {String(u.upgradeLevel ?? 1)}/{String(u.maxUpgradeLevel ?? 5)}</span>
                  <Button size="sm" variant="outline" onClick={() => setEditing(u)}><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(u.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
