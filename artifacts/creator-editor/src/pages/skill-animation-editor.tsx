import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Film, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Anim = { id: number; animationType: string; animationRef?: string; blendTime: number; speed: number; loop: boolean; interruptible: boolean };
const ANIM_TYPES = ["cast", "impact", "channel", "idle", "cancel", "combo_start", "combo_end", "ultimate"];

export default function SkillAnimationEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ animationType: "cast", animationRef: "", blendTime: 0.1, speed: 1.0, loop: false, interruptible: false, rootMotion: false });

  const { data: anims = [], isLoading } = useQuery<Anim[]>({
    queryKey: [`/api/skills/${id}/animations`],
    queryFn: () => authFetch(`/api/skills/${id}/animations`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/animations`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/animations`] }); toast({ title: "Animation added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (animId: number) => authFetch(`/api/skills/animations/${animId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/animations`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Animations · Skill #{id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Animation Editor</h1>
        <Badge variant="outline">{anims.length} animations</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Animation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Type</label>
              <select value={form.animationType} onChange={e => setForm(f => ({ ...f, animationType: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {ANIM_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Animation Ref</label>
              <Input value={form.animationRef} onChange={e => setForm(f => ({ ...f, animationRef: e.target.value }))} className="mt-1" placeholder="anim_skill_fireball…" /></div>
            <div><label className="text-xs text-muted-foreground">Blend Time</label>
              <Input type="number" step="0.05" value={form.blendTime} onChange={e => setForm(f => ({ ...f, blendTime: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Speed</label>
              <Input type="number" step="0.1" value={form.speed} onChange={e => setForm(f => ({ ...f, speed: Number(e.target.value) }))} className="mt-1" /></div>
          </div>
          <div className="flex gap-4">
            {[["loop", "Loop"], ["interruptible", "Interruptible"], ["rootMotion", "Root Motion"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                {label}
              </label>
            ))}
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Animation
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {anims.map(anim => (
            <div key={anim.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm capitalize">{anim.animationType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{anim.animationRef || "No ref"} · speed ×{anim.speed} · blend {anim.blendTime}s{anim.loop ? " · loop" : ""}{anim.interruptible ? " · interruptible" : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(anim.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {anims.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No animations yet.</div>}
        </div>
      )}
    </div>
  );
}
