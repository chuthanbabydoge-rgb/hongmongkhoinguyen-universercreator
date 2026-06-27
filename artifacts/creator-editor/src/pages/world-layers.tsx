import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Layers, Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const LAYER_TYPES = ["terrain", "object", "water", "sky", "effects", "gameplay", "navigation", "custom"];
const LAYER_COLORS: Record<string, string> = {
  terrain: "text-lime-400",
  object: "text-blue-400",
  water: "text-cyan-400",
  sky: "text-indigo-400",
  effects: "text-purple-400",
  gameplay: "text-emerald-400",
  navigation: "text-amber-400",
  custom: "text-zinc-400",
};

export default function WorldLayers() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", layerType: "terrain" });

  const { data: world } = useQuery({
    queryKey: ["/api/world-editor", worldId],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}`),
  });

  const { data: layers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/world-editor", worldId, "layers"],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}/layers`),
    enabled: !!worldId,
  });

  const createLayer = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/api/world-editor/${worldId}/layers`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "layers"] }); setCreating(false); setForm({ name: "", layerType: "terrain" }); },
  });

  const toggleVisible = useMutation({
    mutationFn: ({ layerId, isVisible }: { layerId: number; isVisible: boolean }) =>
      apiFetch(`/api/world-editor/${worldId}/layers/${layerId}`, { method: "PATCH", body: JSON.stringify({ isVisible }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "layers"] }),
  });

  const toggleLocked = useMutation({
    mutationFn: ({ layerId, isLocked }: { layerId: number; isLocked: boolean }) =>
      apiFetch(`/api/world-editor/${worldId}/layers/${layerId}`, { method: "PATCH", body: JSON.stringify({ isLocked }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "layers"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Layers</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />Add Layer</Button>
        </div>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-5 space-y-3">
            <input
              autoFocus
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              placeholder="Layer name..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              value={form.layerType}
              onChange={(e) => setForm({ ...form, layerType: e.target.value })}
            >
              {LAYER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={() => createLayer.mutate({ name: form.name, layerType: form.layerType, order: layers.length })} disabled={!form.name.trim()}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : layers.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No layers yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {layers.map((layer: any) => (
            <Card key={layer.id} className={`transition-colors ${!layer.isVisible ? "opacity-50" : ""}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 ${LAYER_COLORS[layer.layerType] ?? "text-zinc-400"}`} />
                    <div>
                      <p className="font-medium text-sm">{layer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{layer.layerType} · order {layer.order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisible.mutate({ layerId: layer.id, isVisible: !layer.isVisible })}>
                      {layer.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleLocked.mutate({ layerId: layer.id, isLocked: !layer.isLocked })}>
                      {layer.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                    </Button>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-xs text-muted-foreground">Opacity</span>
                      <span className="text-xs font-mono">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
