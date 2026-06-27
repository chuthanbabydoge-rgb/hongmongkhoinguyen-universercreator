import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Trash2 } from "lucide-react";
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

export default function CombatAggroEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ruleName: "", baseThreatMultiplier: 1, healingThreatMultiplier: 0.5, tankingThreatBonus: 1.5, aggroDecayRate: 0, aggroTransferChance: 0, isDefault: false });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: threat = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "threat"], queryFn: () => apiFetch(`/api/combat/${id}/threat`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/threat`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "threat"] }); toast({ title: "Threat rule added" }); } });
  const del = useMutation({ mutationFn: (tId: number) => apiFetch(`/api/combat/threat/${tId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "threat"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Target className="w-6 h-6 text-red-400" /><h1 className="text-2xl font-bold">Aggro / Threat Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Threat Rule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Name</Label><Input value={String(form["ruleName"] ?? "")} onChange={e => set("ruleName", e.target.value)} /></div>
          <div><Label>Base Threat Multiplier</Label><Input type="number" value={String(form["baseThreatMultiplier"] ?? 1)} onChange={e => set("baseThreatMultiplier", Number(e.target.value))} /></div>
          <div><Label>Healing Threat</Label><Input type="number" value={String(form["healingThreatMultiplier"] ?? 0.5)} onChange={e => set("healingThreatMultiplier", Number(e.target.value))} /></div>
          <div><Label>Tanking Bonus</Label><Input type="number" value={String(form["tankingThreatBonus"] ?? 1.5)} onChange={e => set("tankingThreatBonus", Number(e.target.value))} /></div>
          <div><Label>Decay Rate</Label><Input type="number" value={String(form["aggroDecayRate"] ?? 0)} onChange={e => set("aggroDecayRate", Number(e.target.value))} /></div>
          <div><Label>Transfer Chance</Label><Input type="number" value={String(form["aggroTransferChance"] ?? 0)} onChange={e => set("aggroTransferChance", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isDefault"])} onCheckedChange={v => set("isDefault", v)} /><Label>Default</Label></div>
          <Button onClick={() => create.mutate()} disabled={!form["ruleName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Threat Rules ({(threat as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (threat as Array<{ id: number; ruleName: string; baseThreatMultiplier: number; tankingThreatBonus: number; isDefault: boolean }>).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{t.ruleName} {t.isDefault && <span className="text-xs text-primary ml-1">(default)</span>}</p><p className="text-xs text-muted-foreground">base: ×{t.baseThreatMultiplier} · tank bonus: ×{t.tankingThreatBonus}</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(t.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(threat as unknown[]).length && !isLoading && <p className="text-muted-foreground">No threat rules yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
