import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatDamageEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ formulaName: "", formulaType: "flat", baseValue: 10, attackScaling: 1, defenseScaling: 0, randomMin: 0.9, randomMax: 1.1, isDefault: false });

  const { data: formulas = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "formulas"], queryFn: () => apiFetch(`/api/combat/${id}/formulas`).then(r => r.json()) });
  const { data: modifiers = [] } = useQuery({ queryKey: ["/api/combat", id, "modifiers"], queryFn: () => apiFetch(`/api/combat/${id}/modifiers`).then(r => r.json()) });

  const createFormula = useMutation({
    mutationFn: () => apiFetch(`/api/combat/${id}/formulas`, { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "formulas"] }); toast({ title: "Formula added" }); setForm({ formulaName: "", formulaType: "flat", baseValue: 10, attackScaling: 1, defenseScaling: 0, randomMin: 0.9, randomMax: 1.1, isDefault: false }); },
  });
  const deleteFormula = useMutation({
    mutationFn: (fId: number) => apiFetch(`/api/combat/formulas/${fId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "formulas"] }),
  });

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-red-400" /><h1 className="text-2xl font-bold">Damage Formula Editor</h1></div>
      <Card>
        <CardHeader><CardTitle>Add Damage Formula</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Name</Label><Input value={String(form["formulaName"] ?? "")} onChange={e => set("formulaName", e.target.value)} /></div>
          <div><Label>Type</Label>
            <Select value={String(form["formulaType"] ?? "flat")} onValueChange={v => set("formulaType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["flat","percentage","scaling","hybrid","custom"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Base Value</Label><Input type="number" value={String(form["baseValue"] ?? 10)} onChange={e => set("baseValue", Number(e.target.value))} /></div>
          <div><Label>Attack Scaling</Label><Input type="number" value={String(form["attackScaling"] ?? 1)} onChange={e => set("attackScaling", Number(e.target.value))} /></div>
          <div><Label>Defense Scaling</Label><Input type="number" value={String(form["defenseScaling"] ?? 0)} onChange={e => set("defenseScaling", Number(e.target.value))} /></div>
          <div><Label>Random Min</Label><Input type="number" value={String(form["randomMin"] ?? 0.9)} onChange={e => set("randomMin", Number(e.target.value))} /></div>
          <div><Label>Random Max</Label><Input type="number" value={String(form["randomMax"] ?? 1.1)} onChange={e => set("randomMax", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isDefault"])} onCheckedChange={v => set("isDefault", v)} /><Label>Default</Label></div>
          <div className="flex items-end"><Button onClick={() => createFormula.mutate()} disabled={!form["formulaName"] || createFormula.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Formulas ({(formulas as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (formulas as Array<{ id: number; formulaName: string; formulaType: string; baseValue: number; attackScaling: number; isDefault: boolean }>).map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{f.formulaName} {f.isDefault && <span className="text-xs text-primary ml-1">(default)</span>}</p><p className="text-xs text-muted-foreground">{f.formulaType} · base: {f.baseValue} · atk×{f.attackScaling}</p></div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteFormula.mutate(f.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(formulas as unknown[]).length && !isLoading && <p className="text-muted-foreground">No formulas yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
