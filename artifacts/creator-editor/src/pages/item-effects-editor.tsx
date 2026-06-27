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

type Effect = { id: number; effectName: string; effectType: string; trigger: string; targetType: string; magnitude: number; chance: number; duration?: number; description?: string; isActive: boolean };

const TRIGGERS = ["on_use", "on_equip", "on_hit", "on_kill", "on_damage", "on_tick", "passive"];
const TARGETS = ["self", "target", "aoe", "ally", "enemy"];

export default function ItemEffectsEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/effects`];

  const { data: effects = [], isLoading } = useQuery<Effect[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/effects`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ effectName: "", effectType: "", trigger: "on_use", targetType: "self", magnitude: 0, chance: 1.0, duration: 0, description: "" });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/effects`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ effectName: "", effectType: "", trigger: "on_use", targetType: "self", magnitude: 0, chance: 1.0, duration: 0, description: "" }); },
    onError: () => toast({ title: "Error", description: "Failed to add effect", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (effectId: number) => authFetch(`/api/item-editor/effects/${effectId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Effects</span>
      </div>
      <h1 className="text-2xl font-bold">Item Effects <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Effect</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[["Effect Name","effectName","text"],["Effect Type","effectType","text"],["Magnitude","magnitude","number"],["Chance (0-1)","chance","number"],["Duration (ms)","duration","number"]].map(([label, key, type]) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type={type} className="mt-1" value={String(form[key as keyof typeof form])}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} /></div>
            ))}
            {([["Trigger","trigger",TRIGGERS],["Target","targetType",TARGETS]] as [string, string, string[]][]).map(([label, key, opts]) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                  value={String(form[key as keyof typeof form])} onChange={(e) => setForm((f) => ({ ...f, [key as string]: e.target.value }))}>
                  {opts.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div><label className="text-xs text-muted-foreground">Description</label>
            <Input className="mt-1" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.effectName || !form.effectType || addMutation.isPending}>
            <Plus className="w-4 h-4 mr-1" />Add Effect
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !effects.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No effects defined yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {effects.map((ef) => (
            <Card key={ef.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{ef.effectName}</p>
                    <Badge variant="outline" className="text-xs">{ef.trigger}</Badge>
                    <Badge variant="secondary" className="text-xs">{ef.targetType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Type: {ef.effectType} · Magnitude: {ef.magnitude} · Chance: {(ef.chance * 100).toFixed(0)}%{ef.duration ? ` · ${ef.duration}ms` : ""}</p>
                  {!!ef.description && <p className="text-xs text-muted-foreground italic mt-1">{ef.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(ef.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
