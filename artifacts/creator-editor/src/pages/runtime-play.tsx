import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, Square, Pause, RotateCcw, ChevronRight, Camera,
  Activity, Cpu, Database, Layers, Terminal, Clock, Zap,
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
    stepping: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    initializing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return map[state] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export default function PlayMode() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const qc = useQueryClient();
  const [, nav] = useLocation();

  const { data: session } = useQuery({
    queryKey: ["/api/runtime", sessionId],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}`),
    refetchInterval: 2000,
  });

  const { data: perf } = useQuery({
    queryKey: ["/api/runtime", sessionId, "performance"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/performance?limit=1`),
    refetchInterval: 2000,
  });

  const { data: systems } = useQuery({
    queryKey: ["/api/runtime", sessionId, "systems"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/systems`),
  });

  const { data: entities } = useQuery({
    queryKey: ["/api/runtime", sessionId, "entities"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/entities`),
    refetchInterval: 3000,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["/api/runtime", sessionId, "logs"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/logs?limit=10`),
    refetchInterval: 3000,
  });

  const act = (action: string) => useMutation({
    mutationFn: () => apiFetch(`/api/runtime/${sessionId}/${action}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }),
  });

  const startMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/start`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const stopMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/stop`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const pauseMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/pause`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const resumeMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/resume`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const restartMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/restart`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const stepMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/step`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });
  const snapMut = useMutation({ mutationFn: () => apiFetch(`/api/runtime/${sessionId}/snapshot`, { method: "POST", body: JSON.stringify({ name: `Snapshot ${new Date().toISOString()}` }) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/runtime", sessionId] }) });

  const state = session?.state ?? "idle";
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isStopped = state === "stopped" || state === "idle";
  const latestPerf = perf?.items?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">{session?.name ?? "Play Mode"}</h1>
            <p className="text-xs text-muted-foreground">Session #{sessionId} · Tick {session?.currentTick ?? 0}</p>
          </div>
          <Badge className={`border ${stateBadge(state)}`}>{state}</Badge>
        </div>

        {/* Play Toolbar */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
          {isStopped && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => startMut.mutate()} disabled={startMut.isPending}>
              <Play className="w-4 h-4 mr-1" />Play
            </Button>
          )}
          {isRunning && (
            <Button size="sm" variant="outline" onClick={() => pauseMut.mutate()} disabled={pauseMut.isPending}>
              <Pause className="w-4 h-4 mr-1" />Pause
            </Button>
          )}
          {isPaused && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => resumeMut.mutate()} disabled={resumeMut.isPending}>
              <Play className="w-4 h-4 mr-1" />Resume
            </Button>
          )}
          {isPaused && (
            <Button size="sm" variant="outline" onClick={() => stepMut.mutate()} disabled={stepMut.isPending}>
              <ChevronRight className="w-4 h-4 mr-1" />Step
            </Button>
          )}
          {!isStopped && (
            <Button size="sm" variant="outline" onClick={() => stopMut.mutate()} disabled={stopMut.isPending}>
              <Square className="w-4 h-4 mr-1" />Stop
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => restartMut.mutate()} disabled={restartMut.isPending} title="Restart">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => snapMut.mutate()} title="Snapshot">
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Performance strip */}
      {latestPerf && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Zap, label: "FPS", value: Math.round(latestPerf.fps), color: "text-emerald-400" },
            { icon: Clock, label: "Frame", value: `${latestPerf.frameTimeMs?.toFixed(1)}ms`, color: "text-blue-400" },
            { icon: Database, label: "Memory", value: `${latestPerf.memoryMb?.toFixed(0)}MB`, color: "text-orange-400" },
            { icon: Layers, label: "Entities", value: latestPerf.entityCount, color: "text-purple-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-bold">{value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="entities">
        <TabsList>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="snapshots" onClick={() => nav(`/runtime-snapshots/${sessionId}`)}>Snapshots ↗</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Entities ({entities?.total ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {(entities?.items ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">No entities yet. Start the engine to spawn entities.</p>
              ) : (
                <div className="space-y-2">
                  {(entities?.items ?? []).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                      <span className="font-medium">{e.name}</span>
                      <div className="flex gap-2">
                        {e.tag && <Badge variant="outline" className="text-xs">{e.tag}</Badge>}
                        <Badge variant="outline" className="text-xs">{e.layer}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Systems ({(systems?.items ?? []).length})</CardTitle></CardHeader>
            <CardContent>
              {(systems?.items ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">No systems registered yet. Start the engine to initialize systems.</p>
              ) : (
                <div className="space-y-2">
                  {(systems?.items ?? []).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <Badge variant="outline" className="text-xs">{s.updateType}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{s.lastTickMs?.toFixed(2)}ms</span>
                        <Badge className={s.enabled ? "bg-emerald-500/20 text-emerald-400 text-xs" : "bg-zinc-500/20 text-zinc-400 text-xs"}>
                          {s.enabled ? "on" : "off"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Recent Logs</CardTitle></CardHeader>
            <CardContent>
              {(recentLogs?.items ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm font-mono text-xs">No logs yet.</p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {(recentLogs?.items ?? []).map((l: any) => (
                    <div key={l.id} className={`flex items-start gap-2 p-1 rounded ${l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-yellow-400" : "text-muted-foreground"}`}>
                      <span className="uppercase text-[10px] font-bold w-8 shrink-0 mt-0.5">{l.level}</span>
                      <span className="text-foreground">{l.message}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => nav(`/runtime-logs/${sessionId}`)}>
                View all logs <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
