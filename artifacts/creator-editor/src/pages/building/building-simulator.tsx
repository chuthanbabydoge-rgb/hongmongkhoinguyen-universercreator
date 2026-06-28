import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Square, Zap, Droplets, Lightbulb, Shield, Flame, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function BuildingSimulator() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: runtimes = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/runtime`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/runtime`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/runtime/start`, { method: "POST", body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (d) => { setSessionId(d.sessionId); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/runtime`] }); toast({ title: "Simulation started" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/runtime/stop`, { method: "POST", body: JSON.stringify({ sessionId }) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { setSessionId(null); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/runtime`] }); toast({ title: "Simulation stopped" }); },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ endpoint, body }: { endpoint: string; body: Record<string, unknown> }) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/runtime/${endpoint}`, { method: "POST", body: JSON.stringify({ sessionId, ...body }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/runtime`] }); toast({ title: "Action executed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const activeRuntime = runtimes.find((r: Record<string, unknown>) => String(r.sessionId) === sessionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Play className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Building Simulator</h1></div>
        <div className="flex gap-2">
          {!sessionId ? (
            <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}><Play className="w-4 h-4 mr-1" />Start Simulation</Button>
          ) : (
            <Button variant="destructive" onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending}><Square className="w-4 h-4 mr-1" />Stop</Button>
          )}
        </div>
      </div>

      {sessionId && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Power On", icon: Zap, endpoint: "power", body: { state: "on" }, color: "text-yellow-500" },
            { label: "Power Off", icon: Zap, endpoint: "power", body: { state: "off" }, color: "text-muted-foreground" },
            { label: "Water On", icon: Droplets, endpoint: "water", body: { on: true }, color: "text-blue-500" },
            { label: "Lights On", icon: Lightbulb, endpoint: "lighting", body: { on: true }, color: "text-yellow-400" },
            { label: "High Security", icon: Shield, endpoint: "security", body: { level: "high" }, color: "text-red-500" },
            { label: "Fire Emergency", icon: Flame, endpoint: "emergency", body: { type: "fire" }, color: "text-orange-600" },
            { label: "Spawn Visitors", icon: Users, endpoint: "spawn-visitors", body: { count: 5 }, color: "text-green-500" },
            { label: "Tick", icon: Play, endpoint: "tick", body: {}, color: "text-primary" },
          ].map(({ label, icon: Icon, endpoint, body, color }) => (
            <Button key={label} variant="outline" className="h-16 flex flex-col gap-1" onClick={() => actionMutation.mutate({ endpoint, body })} disabled={actionMutation.isPending}>
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      )}

      {activeRuntime && (
        <Card>
          <CardHeader><CardTitle>Live State</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Power</div><Badge variant={activeRuntime.isPowered ? "default" : "secondary"}>{activeRuntime.isPowered ? "On" : "Off"}</Badge></div>
            <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Water</div><Badge variant={activeRuntime.isWaterOn ? "default" : "secondary"}>{activeRuntime.isWaterOn ? "On" : "Off"}</Badge></div>
            <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Lights</div><Badge variant={activeRuntime.isLightsOn ? "default" : "secondary"}>{activeRuntime.isLightsOn ? "On" : "Off"}</Badge></div>
            <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Occupancy</div><div className="text-xl font-bold">{String(activeRuntime.currentOccupancy)}</div></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Session History ({runtimes.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {runtimes.slice(0, 5).map((r: Record<string, unknown>) => (
            <div key={String(r.id)} className="flex items-center justify-between p-2 border rounded text-sm">
              <div className="font-mono text-xs">{String(r.sessionId).slice(0, 16)}…</div>
              <Badge variant={r.isOpen ? "default" : "secondary"}>{r.isOpen ? "Active" : "Stopped"}</Badge>
            </div>
          ))}
          {runtimes.length === 0 && <div className="text-muted-foreground text-sm">No simulation sessions yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
