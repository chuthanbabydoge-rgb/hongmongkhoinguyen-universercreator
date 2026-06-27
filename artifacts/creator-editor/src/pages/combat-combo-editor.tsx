import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swords, Plus, Trash2 } from "lucide-react";
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

export default function CombatComboEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ comboName: "", requiredHits: 3, windowDuration: 2, bonusDamageMultiplier: 1.5, maxComboCount: 10, resetOnMiss: true, isActive: true });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: combos = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "combos"], queryFn: () => apiFetch(`/api/combat/${id}/combos`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/combos`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "combos"] }); toast({ title: "Combo added" }); } });
  const del = useMutation({ mutationFn: (cId: number) => apiFetch(`/api/combat/combos/${cId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "combos"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Swords className="w-6 h-6 text-orange-400" /><h1 className="text-2xl font-bold">Combo Rule Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Combo Rule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Combo Name</Label><Input value={String(form["comboName"] ?? "")} onChange={e => set("comboName", e.target.value)} /></div>
          <div><Label>Required Hits</Label><Input type="number" value={String(form["requiredHits"] ?? 3)} onChange={e => set("requiredHits", Number(e.target.value))} /></div>
          <div><Label>Window (s)</Label><Input type="number" value={String(form["windowDuration"] ?? 2)} onChange={e => set("windowDuration", Number(e.target.value))} /></div>
          <div><Label>Bonus Multiplier</Label><Input type="number" value={String(form["bonusDamageMultiplier"] ?? 1.5)} onChange={e => set("bonusDamageMultiplier", Number(e.target.value))} /></div>
          <div><Label>Max Combo Count</Label><Input type="number" value={String(form["maxComboCount"] ?? 10)} onChange={e => set("maxComboCount", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["resetOnMiss"])} onCheckedChange={v => set("resetOnMiss", v)} /><Label>Reset on Miss</Label></div>
          <Button onClick={() => create.mutate()} disabled={!form["comboName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Combo Rules ({(combos as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (combos as Array<{ id: number; comboName: string; requiredHits: number; bonusDamageMultiplier: number; isActive: boolean }>).map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{c.comboName} {!c.isActive && <span className="text-xs text-muted-foreground ml-1">(inactive)</span>}</p><p className="text-xs text-muted-foreground">hits: {c.requiredHits} · ×{c.bonusDamageMultiplier} bonus</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(c.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(combos as unknown[]).length && !isLoading && <p className="text-muted-foreground">No combo rules yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
