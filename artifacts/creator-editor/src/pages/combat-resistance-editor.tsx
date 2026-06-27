import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatResistanceEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ resistanceName: "", damageType: "magic", resistValue: 0, maxResistPct: 0.75 });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: resistances = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "resistances"], queryFn: () => apiFetch(`/api/combat/${id}/resistances`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/resistances`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "resistances"] }); toast({ title: "Resistance added" }); } });
  const del = useMutation({ mutationFn: (rId: number) => apiFetch(`/api/combat/resistances/${rId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "resistances"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><ShieldOff className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold">Resistance Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Resistance</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={String(form["resistanceName"] ?? "")} onChange={e => set("resistanceName", e.target.value)} /></div>
          <div><Label>Damage Type</Label><Input value={String(form["damageType"] ?? "")} onChange={e => set("damageType", e.target.value)} /></div>
          <div><Label>Resist Value</Label><Input type="number" value={String(form["resistValue"] ?? 0)} onChange={e => set("resistValue", Number(e.target.value))} /></div>
          <div><Label>Max Resist %</Label><Input type="number" value={String(form["maxResistPct"] ?? 0.75)} onChange={e => set("maxResistPct", Number(e.target.value))} /></div>
          <Button onClick={() => create.mutate()} disabled={!form["resistanceName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Resistances ({(resistances as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (resistances as Array<{ id: number; resistanceName: string; damageType: string; resistValue: number; maxResistPct: number }>).map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{r.resistanceName}</p><p className="text-xs text-muted-foreground">{r.damageType} · resist: {r.resistValue} · max: {(r.maxResistPct * 100).toFixed(0)}%</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(resistances as unknown[]).length && !isLoading && <p className="text-muted-foreground">No resistances yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
