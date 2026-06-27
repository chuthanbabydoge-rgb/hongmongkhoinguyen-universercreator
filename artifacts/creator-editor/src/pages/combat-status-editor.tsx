import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const CATEGORIES = ["buff","debuff","dot","hot","cc","shield","mark","aura"];

export default function CombatStatusEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ effectName: "", category: "debuff", duration: 5, tickInterval: 1, tickDamage: 0, tickHeal: 0, isCrowdControl: false, canBeDispelled: true, isStackable: false, maxStacks: 1, isActive: true });
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: effects = [], isLoading } = useQuery({ queryKey: ["/api/combat", id, "status"], queryFn: () => apiFetch(`/api/combat/${id}/status`).then(r => r.json()) });
  const create = useMutation({ mutationFn: () => apiFetch(`/api/combat/${id}/status`, { method: "POST", body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id, "status"] }); toast({ title: "Status effect added" }); } });
  const del = useMutation({ mutationFn: (sId: number) => apiFetch(`/api/combat/status/${sId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/combat", id, "status"] }) });

  const catColor: Record<string, string> = { buff: "bg-green-500/20 text-green-400", debuff: "bg-red-500/20 text-red-400", dot: "bg-orange-500/20 text-orange-400", hot: "bg-blue-500/20 text-blue-400", cc: "bg-purple-500/20 text-purple-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Sparkles className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold">Status Effect Editor</h1></div>
      <Card><CardHeader><CardTitle>Add Status Effect</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Effect Name</Label><Input value={String(form["effectName"] ?? "")} onChange={e => set("effectName", e.target.value)} /></div>
          <div><Label>Category</Label>
            <Select value={String(form["category"] ?? "debuff")} onValueChange={v => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Duration (s)</Label><Input type="number" value={String(form["duration"] ?? 5)} onChange={e => set("duration", Number(e.target.value))} /></div>
          <div><Label>Tick Interval (s)</Label><Input type="number" value={String(form["tickInterval"] ?? 1)} onChange={e => set("tickInterval", Number(e.target.value))} /></div>
          <div><Label>Tick Damage</Label><Input type="number" value={String(form["tickDamage"] ?? 0)} onChange={e => set("tickDamage", Number(e.target.value))} /></div>
          <div><Label>Tick Heal</Label><Input type="number" value={String(form["tickHeal"] ?? 0)} onChange={e => set("tickHeal", Number(e.target.value))} /></div>
          <div><Label>Max Stacks</Label><Input type="number" value={String(form["maxStacks"] ?? 1)} onChange={e => set("maxStacks", Number(e.target.value))} /></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isStackable"])} onCheckedChange={v => set("isStackable", v)} /><Label>Stackable</Label></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["isCrowdControl"])} onCheckedChange={v => set("isCrowdControl", v)} /><Label>CC</Label></div>
          <div className="flex items-center gap-2 mt-6"><Switch checked={Boolean(form["canBeDispelled"])} onCheckedChange={v => set("canBeDispelled", v)} /><Label>Dispellable</Label></div>
          <Button onClick={() => create.mutate()} disabled={!form["effectName"] || create.isPending}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Status Effects ({(effects as unknown[]).length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (effects as Array<{ id: number; effectName: string; category: string; duration: number; tickDamage: number; isActive: boolean }>).map(e => (
            <div key={e.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${catColor[e.category] ?? "bg-secondary"}`}>{e.category}</span>
                <div><p className="font-medium">{e.effectName}</p><p className="text-xs text-muted-foreground">{e.duration}s · tick dmg: {e.tickDamage}</p></div>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del.mutate(e.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {!(effects as unknown[]).length && !isLoading && <p className="text-muted-foreground">No status effects yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
