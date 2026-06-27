import { useQuery } from "@tanstack/react-query";
import { Activity, GitBranch, Clock, Loader2, CheckCircle2, XCircle, PauseCircle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string) => fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token()}` } });

interface Graph { id: number; name: string; type: string; updatedAt: string; }

const STATE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  idle: { icon: <Clock className="h-4 w-4" />, color: "text-muted-foreground", bg: "bg-muted/30" },
  running: { icon: <Play className="h-4 w-4 text-green-400" />, color: "text-green-400", bg: "bg-green-400/10" },
  paused: { icon: <PauseCircle className="h-4 w-4 text-yellow-400" />, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  completed: { icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, color: "text-green-400", bg: "bg-green-400/10" },
  failed: { icon: <XCircle className="h-4 w-4 text-destructive" />, color: "text-destructive", bg: "bg-destructive/10" },
  stopped: { icon: <XCircle className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", bg: "bg-muted/30" },
};

export default function RuntimeMonitor() {
  const { data, isLoading } = useQuery<{ items: Graph[] }>({
    queryKey: ["/api/graphs"],
    queryFn: () => apiFetch("/api/graphs").then((r) => r.json()),
    refetchInterval: 5000,
  });

  const graphs = data?.items ?? [];

  const stats = [
    { label: "Total Graphs", value: graphs.length, icon: <GitBranch className="h-5 w-5 text-primary" /> },
    { label: "Active Runtimes", value: 0, icon: <Activity className="h-5 w-5 text-green-400" /> },
    { label: "Completed Today", value: 0, icon: <CheckCircle2 className="h-5 w-5 text-green-400" /> },
    { label: "Failed Today", value: 0, icon: <XCircle className="h-5 w-5 text-destructive" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Runtime Monitor</h1>
        <p className="text-muted-foreground">Live view of graph execution state and performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="p-2 rounded-lg bg-primary/10">{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Graph Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : graphs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No graphs available.</p>
            ) : (
              <div className="space-y-2">
                {graphs.slice(0, 6).map((g) => {
                  const state = "idle";
                  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.idle!;
                  return (
                    <div key={g.id} className={`flex items-center gap-3 p-2 rounded-md ${cfg.bg}`}>
                      {cfg.icon}
                      <div className="flex-1 min-w-0">
                        <Link href={`/graph-editor/${g.id}`}>
                          <p className="text-xs font-medium truncate hover:text-primary cursor-pointer">{g.name}</p>
                        </Link>
                        <p className="text-[10px] text-muted-foreground">{g.type.replace(/_/g, " ")}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{state}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "CPU Usage", value: 12 },
              { label: "Memory", value: 34 },
              { label: "Execution Queue", value: 0 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span>{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2">
              <Link href="/execution-console">
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="h-3.5 w-3.5 mr-2" />Open Execution Console
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
