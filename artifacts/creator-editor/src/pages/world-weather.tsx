import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Cloud, Sun, CloudRain, CloudSnow } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const WEATHER_ICONS: Record<string, React.FC<any>> = {
  clear: Sun, rain: CloudRain, storm: CloudRain, snow: CloudSnow, fog: Cloud, dynamic: Cloud, custom: Cloud,
};
const WEATHER_COLORS: Record<string, string> = {
  clear: "text-yellow-400", rain: "text-blue-400", storm: "text-purple-400", snow: "text-cyan-400", fog: "text-zinc-400", dynamic: "text-emerald-400", custom: "text-orange-400",
};

export default function WorldWeather() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", weatherType: "clear", intensity: 0.5 });

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: weather = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/world-editor", worldId, "weather"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/weather`), enabled: !!worldId });

  const createWeather = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/world-editor/${worldId}/weather`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "weather"] }); setCreating(false); },
  });

  const weatherTypes = ["clear", "rain", "storm", "snow", "fog", "dynamic", "custom"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Weather Editor</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto"><Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />Add Preset</Button></div>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-5 space-y-3">
            <input autoFocus className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="Preset name..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.weatherType} onChange={(e) => setForm({ ...form, weatherType: e.target.value })}>
              {weatherTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Intensity: {form.intensity.toFixed(2)}</span>
              <input type="range" min={0} max={1} step={0.01} value={form.intensity} onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })} className="w-full accent-primary" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createWeather.mutate(form)} disabled={!form.name.trim()}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : weather.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Cloud className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No weather presets. Add a preset to configure weather conditions.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weather.map((w: any) => {
            const Icon = WEATHER_ICONS[w.weatherType] ?? Cloud;
            return (
              <Card key={w.id} className={`${w.isActive ? "border-primary/50" : ""} transition-colors`}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${WEATHER_COLORS[w.weatherType] ?? "text-zinc-400"}`} />
                      <span className="font-medium text-sm">{w.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {w.isActive && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active</Badge>}
                      {w.isDynamic && <Badge variant="secondary" className="text-xs">Dynamic</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{w.weatherType}</span>
                      <span>Intensity {Math.round(w.intensity * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${w.intensity * 100}%` }} />
                    </div>
                  </div>
                  {w.lightningEnabled && <p className="text-xs text-purple-400 mt-1">⚡ Lightning</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
