import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, Play, Pause, Square, RefreshCw, ChevronRight, Users, Layers, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldRuntimePage() {
  const [, params] = useRoute("/world-runtime/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);

  const { data: world } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/world-system", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: runtimes } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", id, "runtime"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${id}/runtime`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      qc.invalidateQueries({ queryKey: ["/api/world-system", id] });
      toast({ title: "World started", description: `Session: ${data.sessionId}` });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${id}/stop`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/world-system", id] });
      toast({ title: "World stopped", description: `Uptime: ${data.uptime}s` });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const stateColor: Record<string, string> = { running: "bg-green-500", offline: "bg-gray-400", loading: "bg-yellow-500", error: "bg-red-500" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/world-system-dashboard"><span className="hover:text-foreground cursor-pointer">World System</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Runtime — {String(world?.name ?? id)}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stateColor[String(world?.runtimeState)] ?? "bg-gray-400"}`} />
          <Server className="w-5 h-5 text-cyan-500" />{String(world?.name ?? "World Runtime")}
        </h1>
        <Badge variant="outline" className="capitalize">{String(world?.runtimeState ?? "offline")}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Session ID</Label><Input value={sessionId} onChange={e => setSessionId(e.target.value)} /></div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => startMutation.mutate()} disabled={startMutation.isPending || world?.runtimeState === "running"}>
                <Play className="w-4 h-4 mr-2" />Start
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending || world?.runtimeState === "offline"}>
                <Square className="w-4 h-4 mr-2" />Stop
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>World Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Max Players</span><span>{String(world?.maxPlayers)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Current Players</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{String(world?.currentPlayers)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Chunk Size</span><span>{String(world?.chunkSize)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">View Distance</span><span>{String(world?.viewDistance)} chunks</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Stream Mode</span><span className="capitalize">{String(world?.streamMode)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Weather</span><span className="capitalize">{String(world?.currentWeather)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time Cycle</span><span className="capitalize">{String(world?.currentTimeCycle)}</span></div>
          </CardContent>
        </Card>
      </div>

      {(runtimes ?? []).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Recent Sessions</h2>
          <div className="space-y-2">
            {(runtimes ?? []).map(r => (
              <Card key={String(r.id)}>
                <CardContent className="py-2 flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{String(r.sessionId)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-muted-foreground"><Layers className="w-3 h-3" />{String(r.activeChunks)} chunks</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3 h-3" />{String(r.activePlayers)} players</span>
                    <Badge variant="secondary" className="capitalize">{String(r.runtimeState)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
