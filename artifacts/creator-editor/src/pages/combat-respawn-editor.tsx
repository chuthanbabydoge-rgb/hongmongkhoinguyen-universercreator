import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
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

export default function CombatRespawnEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ruleName: "", respawnDelay: 5, hpOnRespawn: 1, mpOnRespawn: 1, respawnLocation: "origin", invulnerabilityDuration: 3, clearStatusOnRespawn: true, maxRespawns: -1, isDefault: false });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: rules = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "respawn"], queryFn: () => apiFetch(`/api/combat/${id}/respawn`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/respawn`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "respawn"] }); toast({ title: "Respawn rule added" }); } });
  const del = useMutation({ mutationFn: (rId: number) => apiFetch(`/api/combat/respawn/${rId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "respawn"] }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><RotateCcw className="w-6 h-6 text-cyan-400" /><h1 className="text-2xl font-bold">Respawn Rule Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Respawn Rule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Name</Label><Input value={String(form["ruleName"] ?? "")} onChange={e => set("ruleName", e.target.value)} /></div>
          <div><Label>Respawn Delay (s)</Label><Input type="number" value={String(form["respawnDelay"] ?? 5)} onChange={e => set("respawnDelay", Number(e.target.value))} /></div>
          <div><Label>HP % on Respawn</Label><Input type="number" value={String(form["hpOnRespawn"] ?? 1)} onChange={e => set("hpOnRespawn", Number(e.target.value))} /></div>
          <div><Label>MP % on Respawn</Label><Input type="number" value={String(form["mpOnRespawn"] ?? 1)} onChange={e => set("mpOnRespawn", Number(e.target.value))} /></div>
          <div><Label>Invulnerability (s)</Label><Input type="number" value={String(form["invulnerabilityDuration"] ?? 3)} onChange={e => set("invulnerabilityDuration", Number(e.target.value))} /></div>
          <div><Label>Max Respawns (-1=∞)</Label><Input type="number" value={String(form["maxRespawns"] ?? -1)} onChange={e => set("maxRespawns", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["clearStatusOnRespawn"])} onCheckedChange={v => set("clearStatusOnRespawn", v)} /><Label>Clear Status</Label></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isDefault"])} onCheckedChange={v => set("isDefault", v)} /><Label>Default</Label></div>
          <Button onClick={() => create.mutate()} disabled={!form["ruleName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Respawn Rules ({(rules as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (rules as Array<{ id: number; ruleName: string; respawnDelay: number; hpOnRespawn: number; invulnerabilityDuration: number; isDefault: boolean }>).map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{r.ruleName} {r.isDefault && <span className="text-xs text-primary ml-1">(default)</span>}</p><p className="text-xs text-muted-foreground">delay: {r.respawnDelay}s · hp: {(r.hpOnRespawn * 100).toFixed(0)}% · invuln: {r.invulnerabilityDuration}s</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(rules as unknown[]).length && !isLoading && <p className="text-muted-foreground">No respawn rules yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
