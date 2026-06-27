import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2 } from "lucide-react";
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

export default function CombatCriticalEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ruleName: "", baseCritChance: 0.05, critChanceScaling: 0.01, baseCritMultiplier: 1.5, maxCritChance: 0.75, maxCritMultiplier: 5, isDefault: false });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: crits = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "crits"], queryFn: () => apiFetch(`/api/combat/${id}/crits`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/crits`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "crits"] }); toast({ title: "Crit rule added" }); } });
  const del = useMutation({ mutationFn: (cId: number) => apiFetch(`/api/combat/crits/${cId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "crits"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-yellow-400" /><h1 className="text-2xl font-bold">Critical Hit Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Critical Rule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Name</Label><Input value={String(form["ruleName"] ?? "")} onChange={e => set("ruleName", e.target.value)} /></div>
          <div><Label>Base Crit Chance</Label><Input type="number" value={String(form["baseCritChance"] ?? 0.05)} onChange={e => set("baseCritChance", Number(e.target.value))} /></div>
          <div><Label>Crit Multiplier</Label><Input type="number" value={String(form["baseCritMultiplier"] ?? 1.5)} onChange={e => set("baseCritMultiplier", Number(e.target.value))} /></div>
          <div><Label>Max Crit Chance</Label><Input type="number" value={String(form["maxCritChance"] ?? 0.75)} onChange={e => set("maxCritChance", Number(e.target.value))} /></div>
          <div><Label>Max Crit Multiplier</Label><Input type="number" value={String(form["maxCritMultiplier"] ?? 5)} onChange={e => set("maxCritMultiplier", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isDefault"])} onCheckedChange={v => set("isDefault", v)} /><Label>Default</Label></div>
          <Button onClick={() => create.mutate()} disabled={!form["ruleName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Critical Rules ({(crits as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (crits as Array<{ id: number; ruleName: string; baseCritChance: number; baseCritMultiplier: number; isDefault: boolean }>).map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{c.ruleName} {c.isDefault && <span className="text-xs text-primary ml-1">(default)</span>}</p><p className="text-xs text-muted-foreground">chance: {(c.baseCritChance * 100).toFixed(0)}% · ×{c.baseCritMultiplier}</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(c.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(crits as unknown[]).length && !isLoading && <p className="text-muted-foreground">No crit rules yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
