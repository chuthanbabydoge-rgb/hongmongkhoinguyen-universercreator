import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw, ChevronRight, Activity, Plus } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function stateBadge(state: string) {
  const map: Record<string, string> = {
    running: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    stopped: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    idle: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[state] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export default function SimulationCenter() {
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({
    queryKey: ["/api/runtime/dashboard"],
    queryFn: () => apiFetch("/api/runtime/dashboard"),
    refetchInterval: 3000,
  });

  const createSession = useMutation({
    mutationFn: (mode: string) => apiFetch("/api/runtime", { method: "POST", body: JSON.stringify({ name: `${mode} Session`, mode }) }),
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: ["/api/runtime/dashboard"] }); nav(`/runtime-play/${s.id}`); },
  });

  const startSession = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/runtime/${id}/start`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime/dashboard"] }),
  });

  const stopSession = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/runtime/${id}/stop`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime/dashboard"] }),
  });

  const sessions: any[] = dashboard?.recentSessions ?? [];

  const MODES = [
    { id: "editor", label: "Editor Mode", desc: "Simulate with full editor tooling active. Hot-reload supported.", color: "border-blue-500/30 bg-blue-500/5" },
    { id: "play", label: "Play Mode", desc: "Full game simulation. Entities spawn, systems tick, events fire.", color: "border-emerald-500/30 bg-emerald-500/5" },
    { id: "simulation", label: "Simulation Mode", desc: "Headless simulation without rendering. Max tick rate for testing.", color: "border-purple-500/30 bg-purple-500/5" },
    { id: "debug", label: "Debug Mode", desc: "Step-frame execution, breakpoints, variable watch, profiler.", color: "border-orange-500/30 bg-orange-500/5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulation Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Launch and manage simulation sessions in any mode</p>
      </div>

      {/* Mode launcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODES.map((mode) => (
          <Card key={mode.id} className={`border ${mode.color} hover:border-primary/50 transition-colors`}>
            <CardContent className="p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold">{mode.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
              </div>
              <Button size="sm" className="ml-4 shrink-0" onClick={() => createSession.mutate(mode.id)} disabled={createSession.isPending}>
                <Plus className="w-3 h-3 mr-1" />Launch
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Sessions</h2>
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No sessions yet. Launch one above.</p>
            </CardContent>
          </Card>
        ) : sessions.map((s: any) => (
          <Card key={s.id} className="mb-3">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => nav(`/runtime-play/${s.id}`)} style={{ cursor: "pointer" }}>
                <div className="p-2 rounded bg-primary/10"><Play className="w-4 h-4 text-primary" /></div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Tick {s.currentTick} · {s.mode} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`border text-xs ${stateBadge(s.state)}`}>{s.state}</Badge>
                {(s.state === "idle" || s.state === "stopped") && (
                  <Button size="sm" variant="outline" onClick={() => startSession.mutate(s.id)} disabled={startSession.isPending}>
                    <Play className="w-3 h-3 mr-1" />Start
                  </Button>
                )}
                {s.state === "running" && (
                  <Button size="sm" variant="outline" onClick={() => stopSession.mutate(s.id)} disabled={stopSession.isPending}>
                    <Square className="w-3 h-3 mr-1" />Stop
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => nav(`/runtime-play/${s.id}`)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Systems overview */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Engine Systems</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">All sessions initialize these systems on start:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              ["Physics", "Fixed update, collision detection"],
              ["Animation", "Frame update, state machine"],
              ["Audio", "Frame update, spatial audio"],
              ["Dialogue", "Frame update, NPC conversations"],
              ["Quest", "Frame update, objective tracking"],
              ["Combat", "Fixed update, damage calculation"],
              ["Navigation", "Frame update, pathfinding"],
              ["AI", "Frame update, behavior trees"],
              ["Weather", "Late update, environment sim"],
              ["DayNight", "Late update, time cycle"],
              ["Particles", "Frame update, VFX"],
            ].map(([name, desc]) => (
              <div key={name as string} className="p-2 border border-border rounded text-xs">
                <p className="font-medium">{name as string}</p>
                <p className="text-muted-foreground">{desc as string}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
