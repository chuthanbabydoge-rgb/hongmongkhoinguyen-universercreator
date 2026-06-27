import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatDefenseEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ruleName: "", armorValue: 0, armorReduction: 0, maxReductionPct: 0.75, flatReduction: 0, defenseScaling: 0.01, isDefault: false });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: rules = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "defense"], queryFn: () => apiFetch(`/api/combat/${id}/defense`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/defense`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "defense"] }); toast({ title: "Defense rule added" }); } });
  const del = useMutation({ mutationFn: (dId: number) => apiFetch(`/api/combat/defense/${dId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "defense"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Shield className="w-6 h-6 text-blue-400" /><h1 className="text-2xl font-bold">Defense Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Defense Rule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Name</Label><Input value={String(form["ruleName"] ?? "")} onChange={e => set("ruleName", e.target.value)} /></div>
          <div><Label>Armor Value</Label><Input type="number" value={String(form["armorValue"] ?? 0)} onChange={e => set("armorValue", Number(e.target.value))} /></div>
          <div><Label>Max Reduction %</Label><Input type="number" value={String(form["maxReductionPct"] ?? 0.75)} onChange={e => set("maxReductionPct", Number(e.target.value))} /></div>
          <div><Label>Flat Reduction</Label><Input type="number" value={String(form["flatReduction"] ?? 0)} onChange={e => set("flatReduction", Number(e.target.value))} /></div>
          <div><Label>Defense Scaling</Label><Input type="number" value={String(form["defenseScaling"] ?? 0.01)} onChange={e => set("defenseScaling", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isDefault"])} onCheckedChange={v => set("isDefault", v)} /><Label>Default</Label></div>
          <div className="flex items-end"><Button onClick={() => create.mutate()} disabled={!form["ruleName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Rules ({(rules as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (rules as Array<{ id: number; ruleName: string; armorValue: number; maxReductionPct: number; isDefault: boolean }>).map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{r.ruleName} {r.isDefault && <span className="text-xs text-primary ml-1">(default)</span>}</p><p className="text-xs text-muted-foreground">armor: {r.armorValue} · max reduction: {(r.maxReductionPct * 100).toFixed(0)}%</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(rules as unknown[]).length && !isLoading && <p className="text-muted-foreground">No defense rules yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
