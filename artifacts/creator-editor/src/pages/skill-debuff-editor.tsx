import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Debuff = { id: number; debuffName: string; debuffCategory: string; statAffected?: string; modifierType: string; value: number; duration: number; isCrowdControl: boolean; canBeDispelled: boolean };

const DEBUFF_CATEGORIES = ["slow", "stun", "silence", "blind", "poison", "bleed", "burn", "freeze", "weaken", "curse"];

export default function SkillDebuffEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ debuffName: "New Debuff", debuffCategory: "slow", statAffected: "speed", modifierType: "percent", value: -20, duration: 3, isCrowdControl: false, canBeDispelled: true });

  const { data: debuffs = [], isLoading } = useQuery<Debuff[]>({
    queryKey: [`/api/skills/${id}/debuffs`],
    queryFn: () => authFetch(`/api/skills/${id}/debuffs`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/debuffs`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/debuffs`] }); toast({ title: "Debuff added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (debuffId: number) => authFetch(`/api/skills/debuffs/${debuffId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/debuffs`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Debuffs · Skill #{id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Debuff Editor</h1>
        <Badge variant="outline">{debuffs.length} debuffs</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Debuff</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <Input value={form.debuffName} onChange={e => setForm(f => ({ ...f, debuffName: e.target.value }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Category</label>
              <select value={form.debuffCategory} onChange={e => setForm(f => ({ ...f, debuffCategory: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {DEBUFF_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Stat Affected</label>
              <Input value={form.statAffected ?? ""} onChange={e => setForm(f => ({ ...f, statAffected: e.target.value }))} className="mt-1" placeholder="speed, attack…" /></div>
            <div><label className="text-xs text-muted-foreground">Value</label>
              <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Duration (s)</label>
              <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="mt-1" /></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isCrowdControl} onChange={e => setForm(f => ({ ...f, isCrowdControl: e.target.checked }))} className="rounded" />
              Crowd Control
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.canBeDispelled} onChange={e => setForm(f => ({ ...f, canBeDispelled: e.target.checked }))} className="rounded" />
              Can Be Dispelled
            </label>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Debuff
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {debuffs.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <div>
                  <p className="font-medium text-sm">{d.debuffName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.debuffCategory} · value {d.value} · {d.duration}s{d.isCrowdControl ? " · CC" : ""}{d.canBeDispelled ? "" : " · Permanent"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {debuffs.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No debuffs yet.</div>}
        </div>
      )}
    </div>
  );
}
