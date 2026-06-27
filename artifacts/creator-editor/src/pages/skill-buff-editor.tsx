import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Buff = { id: number; buffName: string; statAffected: string; modifierType: string; value: number; valuePerLevel: number; duration: number; isStackable: boolean; maxStacks: number };

const STATS = ["attack", "defense", "speed", "health", "mana", "critical_chance", "critical_damage", "armor", "magic_resist", "evasion"];
const MOD_TYPES = ["flat", "percent", "multiplier"];

export default function SkillBuffEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ buffName: "New Buff", statAffected: "attack", modifierType: "flat", value: 10, valuePerLevel: 2, duration: 5, isStackable: false, maxStacks: 1 });

  const { data: buffs = [], isLoading } = useQuery<Buff[]>({
    queryKey: [`/api/skills/${id}/buffs`],
    queryFn: () => authFetch(`/api/skills/${id}/buffs`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/buffs`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/buffs`] }); toast({ title: "Buff added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (buffId: number) => authFetch(`/api/skills/buffs/${buffId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/buffs`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Buffs · Skill #{id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Buff Editor</h1>
        <Badge variant="outline">{buffs.length} buffs</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Buff</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <Input value={form.buffName} onChange={e => setForm(f => ({ ...f, buffName: e.target.value }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Stat Affected</label>
              <select value={form.statAffected} onChange={e => setForm(f => ({ ...f, statAffected: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {STATS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Modifier Type</label>
              <select value={form.modifierType} onChange={e => setForm(f => ({ ...f, modifierType: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {MOD_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Value</label>
              <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Value Per Level</label>
              <Input type="number" value={form.valuePerLevel} onChange={e => setForm(f => ({ ...f, valuePerLevel: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Duration (s)</label>
              <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="mt-1" /></div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isStackable} onChange={e => setForm(f => ({ ...f, isStackable: e.target.checked }))} className="rounded" />
              Stackable
            </label>
            {form.isStackable && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Max Stacks</label>
                <Input type="number" value={form.maxStacks} onChange={e => setForm(f => ({ ...f, maxStacks: Number(e.target.value) }))} className="w-20" />
              </div>
            )}
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Buff
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {buffs.map(buff => (
            <div key={buff.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-400" />
                <div>
                  <p className="font-medium text-sm">{buff.buffName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{buff.statAffected.replace(/_/g, " ")} +{buff.value} ({buff.modifierType}) · {buff.duration}s{buff.isStackable ? ` · ${buff.maxStacks}x` : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(buff.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {buffs.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No buffs yet.</div>}
        </div>
      )}
    </div>
  );
}
