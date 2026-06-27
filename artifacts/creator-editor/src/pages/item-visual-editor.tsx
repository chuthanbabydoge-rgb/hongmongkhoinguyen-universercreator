import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Palette, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Visual = { id: number; visualType: string; assetUrl?: string; colorTint?: string; scale: number; animationId?: string; particleEffect?: string };

const VISUAL_TYPES = ["icon", "model_3d", "2d_sprite", "particle", "shadow", "ui_overlay", "ground_marker"];

export default function ItemVisualEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/visuals`];

  const { data: visuals = [], isLoading } = useQuery<Visual[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/visuals`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ visualType: "icon", assetUrl: "", colorTint: "#ffffff", scale: 1.0, animationId: "", particleEffect: "" });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/visuals`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ visualType: "icon", assetUrl: "", colorTint: "#ffffff", scale: 1.0, animationId: "", particleEffect: "" }); },
    onError: () => toast({ title: "Error", description: "Failed to add visual", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (vId: number) => authFetch(`/api/item-editor/visuals/${vId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Visuals</span>
      </div>
      <h1 className="text-2xl font-bold">Visual Editor <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Visual</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Visual Type</label>
              <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.visualType} onChange={(e) => setForm((f) => ({ ...f, visualType: e.target.value }))}>
                {VISUAL_TYPES.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Asset URL</label>
              <Input className="mt-1" placeholder="https://..." value={form.assetUrl} onChange={(e) => setForm((f) => ({ ...f, assetUrl: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Color Tint</label>
              <div className="flex gap-2 mt-1"><input type="color" value={form.colorTint} onChange={(e) => setForm((f) => ({ ...f, colorTint: e.target.value }))} className="w-10 h-9 rounded cursor-pointer" /><Input value={form.colorTint} onChange={(e) => setForm((f) => ({ ...f, colorTint: e.target.value }))} /></div></div>
            <div><label className="text-xs text-muted-foreground">Scale</label>
              <Input type="number" step="0.1" className="mt-1" value={form.scale} onChange={(e) => setForm((f) => ({ ...f, scale: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Animation ID</label>
              <Input className="mt-1" value={form.animationId} onChange={(e) => setForm((f) => ({ ...f, animationId: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Particle Effect</label>
              <Input className="mt-1" value={form.particleEffect} onChange={(e) => setForm((f) => ({ ...f, particleEffect: e.target.value }))} /></div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Visual</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !visuals.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No visuals configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visuals.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: v.colorTint ?? "#888" }} />
                    <Badge variant="outline" className="text-xs capitalize">{v.visualType.replace(/_/g, " ")}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                {!!v.assetUrl && <p className="text-xs text-muted-foreground truncate">{v.assetUrl}</p>}
                <p className="text-xs text-muted-foreground mt-1">Scale: ×{v.scale}{v.animationId ? ` · Anim: ${v.animationId}` : ""}{v.particleEffect ? ` · FX: ${v.particleEffect}` : ""}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
