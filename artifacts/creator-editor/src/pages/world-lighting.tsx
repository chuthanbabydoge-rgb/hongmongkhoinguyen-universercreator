import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Save } from "lucide-react";
import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{Number(value).toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

export default function WorldLighting() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: lighting, isLoading } = useQuery({ queryKey: ["/api/world-editor", worldId, "lighting"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/lighting`), enabled: !!worldId });

  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => { if (lighting) setForm(lighting); }, [lighting]);

  const updateLighting = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/world-editor/${worldId}/lighting`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "lighting"] }),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const MODES = ["realtime", "baked", "mixed", "custom"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Lighting Editor</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto"><Button onClick={() => updateLighting.mutate(form)} disabled={updateLighting.isPending}><Save className="w-4 h-4 mr-2" />Save</Button></div>
      </div>

      {isLoading ? <div className="h-64 rounded-lg bg-muted/30 animate-pulse" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />Lighting Mode</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((mode) => (
                  <Button key={mode} variant={form.lightingMode === mode ? "secondary" : "outline"} size="sm" className="capitalize" onClick={() => set("lightingMode", mode)}>
                    {mode}
                  </Button>
                ))}
              </div>
              <Slider label="Intensity" value={Number(form.intensity ?? 1)} max={5} onChange={(v: number) => set("intensity", v)} />
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Light Color</span>
                <input type="color" value={String(form.color ?? "#ffffff")} onChange={(e) => set("color", e.target.value)} className="w-full h-9 rounded border border-border cursor-pointer" />
              </div>
              <Slider label="Exposure" value={Number(form.exposure ?? 1)} max={5} onChange={(v: number) => set("exposure", v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Shadows & Post-Process</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Shadows</span>
                <input type="checkbox" checked={!!form.shadowsEnabled} onChange={(e) => set("shadowsEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <Slider label="Shadow Distance" value={Number(form.shadowDistance ?? 100)} min={10} max={1000} step={10} onChange={(v: number) => set("shadowDistance", v)} />
              <div className="flex items-center justify-between">
                <span className="text-sm">Ambient Occlusion</span>
                <input type="checkbox" checked={!!form.ambientOcclusionEnabled} onChange={(e) => set("ambientOcclusionEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bloom</span>
                <input type="checkbox" checked={!!form.bloomEnabled} onChange={(e) => set("bloomEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              {(form.bloomEnabled as boolean) && (
                <Slider label="Bloom Intensity" value={Number(form.bloomIntensity ?? 0.5)} onChange={(v: number) => set("bloomIntensity", v)} />
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">Tone Mapping</span>
                <input type="checkbox" checked={!!form.toneMappingEnabled} onChange={(e) => set("toneMappingEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
