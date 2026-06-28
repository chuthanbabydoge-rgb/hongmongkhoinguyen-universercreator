import { useQuery } from "@tanstack/react-query";
import { BarChart2, Globe, Users, Clock, Layers, Wind } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldSystemStatistics() {
  const [worldId, setWorldId] = useState("");

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: stats, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/world-system", worldId, "statistics"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/statistics`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const metrics = stats ? [
    { icon: Globe, label: "Total Sessions", value: String(stats.totalSessionsRun ?? 0), color: "text-blue-500" },
    { icon: Clock, label: "Total Uptime", value: `${Math.floor(Number(stats.totalUptimeSeconds ?? 0) / 3600)}h`, color: "text-green-500" },
    { icon: Users, label: "Players Hosted", value: String(stats.totalPlayersHosted ?? 0), color: "text-purple-500" },
    { icon: Users, label: "Peak Concurrent", value: String(stats.peakConcurrentPlayers ?? 0), color: "text-orange-500" },
    { icon: Layers, label: "Chunks Loaded", value: String(stats.totalChunksLoaded ?? 0), color: "text-cyan-500" },
    { icon: Wind, label: "Weather Changes", value: String(stats.totalWeatherChanges ?? 0), color: "text-sky-500" },
    { icon: Globe, label: "Portal Traversals", value: String(stats.totalPortalTraversals ?? 0), color: "text-violet-500" },
    { icon: BarChart2, label: "Events Triggered", value: String(stats.totalEventsTriggered ?? 0), color: "text-pink-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6 text-blue-500" />World Statistics</h1>
        <p className="text-muted-foreground">Runtime performance data per world instance.</p>
      </div>
      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!worldId && <Card><CardContent className="py-12 text-center text-muted-foreground">Select a world to view statistics.</CardContent></Card>}
      {worldId && isLoading && <div className="text-muted-foreground">Loading...</div>}
      {worldId && !isLoading && !stats && <Card><CardContent className="py-8 text-center text-muted-foreground">No statistics recorded yet.</CardContent></Card>}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Icon className={`w-3 h-3 ${color}`} />{label}</CardTitle></CardHeader>
              <CardContent><div className={`text-3xl font-bold ${color}`}>{value}</div></CardContent>
            </Card>
          ))}
          <Card className="col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Tick Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.averageTickRate ? `${Number(stats.averageTickRate).toFixed(1)} tps` : "—"}</div></CardContent></Card>
          <Card className="col-span-2"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Memory</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.averageMemoryMb ? `${Number(stats.averageMemoryMb).toFixed(0)} MB` : "—"}</div></CardContent></Card>
        </div>
      )}
    </div>
  );
}
