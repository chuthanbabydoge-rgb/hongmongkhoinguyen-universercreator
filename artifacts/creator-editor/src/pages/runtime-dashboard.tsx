import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play, Square, Pause, RotateCcw, Plus, Activity,
  Cpu, Database, Zap, Clock, Server, AlertTriangle,
  ChevronRight, Trash2,
} from "lucide-react";

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
    initializing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return map[state] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export default function RuntimeDashboard() {
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["/api/runtime/dashboard"],
    queryFn: () => apiFetch("/api/runtime/dashboard"),
    refetchInterval: 5000,
  });

  const createSession = useMutation({
    mutationFn: (name: string) => apiFetch("/api/runtime", { method: "POST", body: JSON.stringify({ name, mode: "editor" }) }),
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: ["/api/runtime/dashboard"] }); nav(`/runtime-play/${s.id}`); },
  });

  const deleteSession = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/runtime/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime/dashboard"] }),
  });

  const sessions: any[] = dashboard?.recentSessions ?? [];
  const perf: any[] = dashboard?.performance ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Runtime Engine</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor game runtime sessions</p>
        </div>
        <Button onClick={() => createSession.mutate(`Session ${Date.now()}`)} disabled={createSession.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Session
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Server className="w-5 h-5 text-blue-400" /></div>
              <div><p className="text-xs text-muted-foreground">Total Sessions</p><p className="text-2xl font-bold">{dashboard?.totalSessions ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><Activity className="w-5 h-5 text-emerald-400" /></div>
              <div><p className="text-xs text-muted-foreground">Active Sessions</p><p className="text-2xl font-bold">{dashboard?.activeSessions ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Zap className="w-5 h-5 text-purple-400" /></div>
              <div><p className="text-xs text-muted-foreground">Avg FPS</p>
                <p className="text-2xl font-bold">{perf.length > 0 ? Math.round(perf.reduce((a: number, p: any) => a + (p?.fps ?? 0), 0) / perf.length) : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10"><Cpu className="w-5 h-5 text-orange-400" /></div>
              <div><p className="text-xs text-muted-foreground">Avg Memory</p>
                <p className="text-2xl font-bold">{perf.length > 0 ? `${Math.round(perf.reduce((a: number, p: any) => a + (p?.memoryMb ?? 0), 0) / perf.length)}MB` : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading...</div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No runtime sessions yet.</p>
                <Button className="mt-4" size="sm" onClick={() => createSession.mutate("My First Session")}>
                  <Plus className="w-4 h-4 mr-2" />Create Session
                </Button>
              </CardContent>
            </Card>
          ) : sessions.map((s: any) => (
            <Card key={s.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => nav(`/runtime-play/${s.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><Play className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Tick {s.currentTick} · {s.mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${stateBadge(s.state)}`}>{s.state}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteSession.mutate(s.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Engine Architecture</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                ["Graph Compiler", "Compiles visual scripts to instructions"],
                ["Runtime Engine", "Executes compiled instructions"],
                ["Entity System", "Manages game objects"],
                ["Component System", "Attach behaviours"],
                ["Systems", "Physics, AI, Quest, Audio…"],
                ["Simulation", "Drives game loop"],
                ["Play Mode", "Real-time testing"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <div><span className="text-foreground font-medium">{title}</span><br />{desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Supported Systems</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Physics", "Animation", "Audio", "Dialogue", "Quest", "Combat", "Navigation", "AI", "Weather", "DayNight", "Particles"].map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{s}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
