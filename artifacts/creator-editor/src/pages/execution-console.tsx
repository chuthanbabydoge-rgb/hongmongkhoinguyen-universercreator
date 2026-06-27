import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Terminal, Clock, Loader2, AlertCircle, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string) => fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token()}` } });

interface Graph { id: number; name: string; type: string; }

const STATE_ICONS: Record<string, React.ReactNode> = {
  idle: <Terminal className="h-4 w-4 text-muted-foreground" />,
  running: <Play className="h-4 w-4 text-green-400" />,
  paused: <PauseCircle className="h-4 w-4 text-yellow-400" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  stopped: <XCircle className="h-4 w-4 text-muted-foreground" />,
};

const LOG_COLORS: Record<string, string> = {
  info: "text-foreground",
  debug: "text-muted-foreground",
  warn: "text-yellow-400",
  error: "text-destructive",
};

const MOCK_LOGS = [
  { nodeId: 1, level: "info", message: "Start node executed", timestamp: new Date().toISOString(), data: {} },
  { nodeId: 2, level: "debug", message: "Branch condition: true", timestamp: new Date().toISOString(), data: {} },
  { nodeId: 3, level: "info", message: "Sequence step 1 complete", timestamp: new Date().toISOString(), data: {} },
  { nodeId: 4, level: "info", message: "Graph execution completed", timestamp: new Date().toISOString(), data: {} },
];

export default function ExecutionConsole() {
  const [selectedGraph, setSelectedGraph] = useState<string>("all");

  const { data: graphsData, isLoading } = useQuery<{ items: Graph[] }>({
    queryKey: ["/api/graphs"],
    queryFn: () => apiFetch("/api/graphs").then((r) => r.json()),
  });

  const graphs = graphsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Execution Console</h1>
          <p className="text-muted-foreground">Monitor graph execution state and logs in real time.</p>
        </div>
        <Select value={selectedGraph} onValueChange={setSelectedGraph}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select graph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Graphs</SelectItem>
            {graphs.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4" />Execution Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] bg-black/30 rounded-md p-3 font-mono">
                  <div className="space-y-1">
                    {MOCK_LOGS.map((log, i) => (
                      <div key={i} className={`flex items-start gap-3 text-xs ${LOG_COLORS[log.level] ?? "text-foreground"}`}>
                        <span className="text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-[9px] h-4 shrink-0">{log.level.toUpperCase()}</Badge>
                        {log.nodeId && <span className="text-muted-foreground shrink-0">[node:{log.nodeId}]</span>}
                        <span>{log.message}</span>
                      </div>
                    ))}
                    {MOCK_LOGS.length === 0 && (
                      <p className="text-xs text-muted-foreground">No execution logs yet. Run a graph to see output here.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Runtime Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["idle", "running", "completed", "failed"].map((state) => (
                  <div key={state} className="flex items-center gap-2 text-xs">
                    {STATE_ICONS[state]}
                    <span className="capitalize">{state}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />Recent Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {graphs.slice(0, 5).map((g) => (
                  <div key={g.id} className="flex items-center gap-2 py-1.5 text-xs border-b border-border last:border-0">
                    <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                    <span className="flex-1 truncate">{g.name}</span>
                    <span className="text-muted-foreground">idle</span>
                  </div>
                ))}
                {graphs.length === 0 && <p className="text-xs text-muted-foreground">No runs yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />Breakpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Set breakpoints inside the Graph Editor to pause execution at specific nodes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
