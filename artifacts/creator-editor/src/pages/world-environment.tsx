import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Cloud, Wind, Save } from "lucide-react";
import { useEffect, useState } from "react";

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

function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

export default function WorldEnvironment() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: env, isLoading } = useQuery({ queryKey: ["/api/world-editor", worldId, "environment"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/environment`), enabled: !!worldId });

  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => { if (env) setForm(env); }, [env]);

  const updateEnv = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/api/world-editor/${worldId}/environment`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "environment"] }),
  });

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Environment</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => updateEnv.mutate(form)} disabled={updateEnv.isPending}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-lg bg-muted/30 animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-400" /> Sun & Sky</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sun Enabled</span>
                <input type="checkbox" checked={!!form.sunEnabled} onChange={(e) => set("sunEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <Slider label="Sun Intensity" value={Number(form.sunIntensity ?? 1)} max={5} onChange={(v) => set("sunIntensity", v)} />
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Sun Color</span>
                <input type="color" value={String(form.sunColor ?? "#fffbe6")} onChange={(e) => set("sunColor", e.target.value)} className="w-full h-9 rounded border border-border cursor-pointer" />
              </div>
              <Slider label="Sun X Angle" value={Number(form.sunPosX ?? 45)} min={0} max={180} step={1} onChange={(v) => set("sunPosX", v)} />
              <Slider label="Sun Y Angle" value={Number(form.sunPosY ?? 75)} min={0} max={360} step={1} onChange={(v) => set("sunPosY", v)} />
              <div className="flex items-center justify-between">
                <span className="text-sm">Moon Enabled</span>
                <input type="checkbox" checked={!!form.moonEnabled} onChange={(e) => set("moonEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <Slider label="Moon Intensity" value={Number(form.moonIntensity ?? 0.3)} onChange={(v) => set("moonIntensity", v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-400" /> Fog & Ambient</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Fog Enabled</span>
                <input type="checkbox" checked={!!form.fogEnabled} onChange={(e) => set("fogEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Fog Color</span>
                <input type="color" value={String(form.fogColor ?? "#c0c8d8")} onChange={(e) => set("fogColor", e.target.value)} className="w-full h-9 rounded border border-border cursor-pointer" />
              </div>
              <Slider label="Fog Density" value={Number(form.fogDensity ?? 0.01)} max={0.1} step={0.001} onChange={(v) => set("fogDensity", v)} />
              <Slider label="Fog Start" value={Number(form.fogStart ?? 50)} min={0} max={1000} step={10} onChange={(v) => set("fogStart", v)} />
              <Slider label="Fog End" value={Number(form.fogEnd ?? 500)} min={50} max={2000} step={10} onChange={(v) => set("fogEnd", v)} />
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Ambient Color</span>
                <input type="color" value={String(form.ambientColor ?? "#404060")} onChange={(e) => set("ambientColor", e.target.value)} className="w-full h-9 rounded border border-border cursor-pointer" />
              </div>
              <Slider label="Ambient Intensity" value={Number(form.ambientIntensity ?? 0.4)} onChange={(v) => set("ambientIntensity", v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wind className="w-4 h-4 text-sky-400" /> Wind & Clouds</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Slider label="Wind Speed" value={Number(form.windSpeed ?? 0)} max={50} step={0.5} onChange={(v) => set("windSpeed", v)} />
              <Slider label="Wind Direction (°)" value={Number(form.windDirection ?? 0)} max={360} step={1} onChange={(v) => set("windDirection", v)} />
              <Slider label="Cloud Coverage" value={Number(form.cloudCoverage ?? 0.3)} onChange={(v) => set("cloudCoverage", v)} />
              <Slider label="Cloud Speed" value={Number(form.cloudSpeed ?? 0.01)} max={0.1} step={0.001} onChange={(v) => set("cloudSpeed", v)} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
