import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Effect = { id: number; effectName: string; effectType: string; trigger: string; magnitude: number; duration: number; chance: number; isActive: boolean };

const EFFECT_TYPES = ["buff", "debuff", "dot", "hot", "control", "summon", "trigger"];
const TRIGGERS = ["on_cast", "on_hit", "on_kill", "on_damage_taken", "on_death", "on_tick", "on_combo"];

export default function SkillEffectsEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ effectName: "New Effect", effectType: "buff", trigger: "on_cast", magnitude: 10, duration: 5, chance: 1.0 });

  const { data: effects = [], isLoading } = useQuery<Effect[]>({
    queryKey: [`/api/skills/${id}/effects`],
    queryFn: () => authFetch(`/api/skills/${id}/effects`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/effects`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/effects`] }); toast({ title: "Effect added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (effectId: number) => authFetch(`/api/skills/effects/${effectId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/effects`] }),
  });

  const EFFECT_COLORS: Record<string, string> = { buff: "text-green-400", debuff: "text-red-400", dot: "text-orange-400", hot: "text-blue-400", control: "text-purple-400", summon: "text-yellow-400", trigger: "text-cyan-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground">Skill Editor</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Effects · Skill #{id}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Effects Editor</h1>
        <Badge variant="outline">{effects.length} effects</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Effect</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <Input value={form.effectName} onChange={e => setForm(f => ({ ...f, effectName: e.target.value }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Type</label>
              <select value={form.effectType} onChange={e => setForm(f => ({ ...f, effectType: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Trigger</label>
              <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {TRIGGERS.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Magnitude</label>
              <Input type="number" value={form.magnitude} onChange={e => setForm(f => ({ ...f, magnitude: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Duration (s)</label>
              <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Chance (0–1)</label>
              <Input type="number" step="0.05" min="0" max="1" value={form.chance} onChange={e => setForm(f => ({ ...f, chance: Number(e.target.value) }))} className="mt-1" /></div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Effect
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {effects.map((eff) => (
            <div key={eff.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Zap className={`w-4 h-4 ${EFFECT_COLORS[eff.effectType] ?? "text-primary"}`} />
                <div>
                  <p className="font-medium text-sm">{eff.effectName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{eff.trigger.replace(/_/g, " ")} · magnitude {eff.magnitude} · {eff.duration}s · {(eff.chance * 100).toFixed(0)}% chance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs capitalize ${EFFECT_COLORS[eff.effectType] ?? ""}`}>{eff.effectType}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(eff.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {effects.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No effects yet.</div>}
        </div>
      )}
    </div>
  );
}
