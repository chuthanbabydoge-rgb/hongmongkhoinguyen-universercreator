import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Activity, Clock, BarChart2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const UPDATE_TYPE_COLOR: Record<string, string> = {
  frame: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fixed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  late: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  background: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function SystemMonitor() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);

  const { data } = useQuery({
    queryKey: ["/api/runtime", sessionId, "systems"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/systems`),
    refetchInterval: 2000,
  });

  const { data: perfData } = useQuery({
    queryKey: ["/api/runtime", sessionId, "performance-latest"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/performance?limit=1`),
    refetchInterval: 2000,
  });

  const systems: any[] = data?.items ?? [];
  const latestPerf = perfData?.items?.[0];
  const systemTimings: Record<string, number> = latestPerf?.systemTimings ?? {};
  const maxTiming = Math.max(...Object.values(systemTimings).map(Number), 1);

  const enabledCount = systems.filter((s: any) => s.enabled).length;
  const totalTicks = systems.reduce((a: number, s: any) => a + (s.totalTicks ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Cpu className="w-6 h-6" />System Monitor</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · Game engine systems</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><Activity className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Systems</p><p className="text-xl font-bold">{systems.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Activity className="w-5 h-5 text-emerald-400" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold">{enabledCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart2 className="w-5 h-5 text-blue-400" /></div>
          <div><p className="text-xs text-muted-foreground">Total Ticks</p><p className="text-xl font-bold">{totalTicks.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      {/* System list */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Registered Systems</CardTitle></CardHeader>
        <CardContent>
          {systems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No systems registered. Start the runtime engine to initialize systems.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systems.map((s: any) => {
                const timing = systemTimings[s.name] as number | undefined ?? 0;
                const pct = Math.min(100, (timing / maxTiming) * 100);
                return (
                  <div key={s.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <Badge className={`text-xs border ${UPDATE_TYPE_COLOR[s.updateType] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                          {s.updateType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">P{s.priority}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono">{timing.toFixed(3)}ms</span>
                        <span className="text-xs text-muted-foreground">{(s.totalTicks ?? 0).toLocaleString()} ticks</span>
                        <Badge className={`text-xs ${s.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                          {s.enabled ? "on" : "off"}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
