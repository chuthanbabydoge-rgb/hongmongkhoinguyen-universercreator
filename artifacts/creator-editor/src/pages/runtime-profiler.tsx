import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, Zap, Database, Clock } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function sparkline(values: number[], max: number): string {
  const chars = "▁▂▃▄▅▆▇█";
  return values.map((v) => chars[Math.min(chars.length - 1, Math.floor((v / (max || 1)) * chars.length))]).join("");
}

export default function RuntimeProfiler() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);

  const { data: perf } = useQuery({
    queryKey: ["/api/runtime", sessionId, "performance"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/performance?limit=60`),
    refetchInterval: 3000,
  });

  const samples: any[] = (perf?.items ?? []).slice().reverse();
  const latest = samples[samples.length - 1];

  const fpsSeries = samples.map((s) => s.fps ?? 0);
  const memSeries = samples.map((s) => s.memoryMb ?? 0);
  const frameSeries = samples.map((s) => s.frameTimeMs ?? 0);

  const systemTimings: Record<string, number> = latest?.systemTimings ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Runtime Profiler</h1>
        <p className="text-muted-foreground text-sm mt-1">Session #{sessionId} · Live performance sampling</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "FPS", value: Math.round(latest?.fps ?? 0), unit: "", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Clock, label: "Frame Time", value: (latest?.frameTimeMs ?? 0).toFixed(2), unit: "ms", color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: Database, label: "Memory", value: (latest?.memoryMb ?? 0).toFixed(1), unit: "MB", color: "text-orange-400", bg: "bg-orange-500/10" },
          { icon: Activity, label: "Entities", value: latest?.entityCount ?? 0, unit: "", color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ icon: Icon, label, value, unit, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}<span className="text-sm text-muted-foreground ml-1">{unit}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "FPS", series: fpsSeries, max: Math.max(...fpsSeries, 60), color: "text-emerald-400", unit: "fps" },
          { title: "Frame Time", series: frameSeries, max: Math.max(...frameSeries, 16.67), color: "text-blue-400", unit: "ms" },
          { title: "Memory", series: memSeries, max: Math.max(...memSeries, 100), color: "text-orange-400", unit: "MB" },
        ].map(({ title, series, max, color, unit }) => (
          <Card key={title}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
            <CardContent>
              <p className={`font-mono text-lg tracking-widest ${color}`}>{sparkline(series, max)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                min {Math.min(...series, 0).toFixed(1)} / max {Math.max(...series, 0).toFixed(1)} / avg {(series.reduce((a, b) => a + b, 0) / (series.length || 1)).toFixed(1)} {unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System timings */}
      <Card>
        <CardHeader><CardTitle className="text-sm">System Timings (last frame)</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(systemTimings).length === 0 ? (
            <p className="text-muted-foreground text-sm">No system timing data yet. Start the runtime to collect samples.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(systemTimings)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([name, ms]) => {
                  const pct = Math.min(100, ((ms as number) / (latest?.frameTimeMs || 1)) * 100);
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-sm w-24 shrink-0">{name}</span>
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{(ms as number).toFixed(3)}ms</span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Samples table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Samples ({samples.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-muted-foreground border-b border-border">
                <th className="text-left p-2">Tick</th>
                <th className="text-right p-2">FPS</th>
                <th className="text-right p-2">Frame(ms)</th>
                <th className="text-right p-2">Memory(MB)</th>
                <th className="text-right p-2">Entities</th>
              </tr></thead>
              <tbody>
                {samples.slice(-20).reverse().map((s, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-2 font-mono">{s.tick}</td>
                    <td className="p-2 text-right font-mono text-emerald-400">{Math.round(s.fps)}</td>
                    <td className="p-2 text-right font-mono text-blue-400">{s.frameTimeMs?.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-orange-400">{s.memoryMb?.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono text-purple-400">{s.entityCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {samples.length === 0 && <p className="text-muted-foreground text-sm p-2">No samples yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
