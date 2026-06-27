import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Search, AlertTriangle, Info, AlertCircle, Zap } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const LEVEL_ICON: Record<string, React.ReactNode> = {
  info: <Info className="w-3 h-3 text-blue-400" />,
  warn: <AlertTriangle className="w-3 h-3 text-yellow-400" />,
  error: <AlertCircle className="w-3 h-3 text-red-400" />,
  debug: <Zap className="w-3 h-3 text-purple-400" />,
  trace: <Zap className="w-3 h-3 text-zinc-400" />,
  fatal: <AlertCircle className="w-3 h-3 text-red-600" />,
};

const LEVEL_COLOR: Record<string, string> = {
  info: "text-foreground",
  warn: "text-yellow-300",
  error: "text-red-400",
  fatal: "text-red-500 font-bold",
  debug: "text-purple-400",
  trace: "text-zinc-500",
};

export default function RuntimeLogs() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["/api/runtime", sessionId, "logs"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/logs?limit=200`),
    refetchInterval: 3000,
  });

  const logs: any[] = data?.items ?? [];

  const filtered = logs.filter((l) => {
    if (levelFilter !== "all" && l.level !== levelFilter) return false;
    if (search && !l.message?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Terminal className="w-6 h-6" />Runtime Logs</h1>
          <p className="text-muted-foreground text-sm">Session #{sessionId} · {logs.length} total entries</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter logs…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "info", "warn", "error", "debug", "trace"].map((l) => (
            <Button key={l} size="sm" variant={levelFilter === l ? "secondary" : "ghost"} className="text-xs capitalize" onClick={() => setLevelFilter(l)}>{l}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-mono">{filtered.length} entries</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm font-mono">No logs match the current filter.</p>
          ) : (
            <div className="space-y-0.5 font-mono text-xs max-h-[60vh] overflow-y-auto">
              {filtered.map((l) => (
                <div key={l.id} className={`flex items-start gap-2 p-1.5 rounded hover:bg-secondary/30 ${LEVEL_COLOR[l.level] ?? ""}`}>
                  <span className="mt-0.5 shrink-0">{LEVEL_ICON[l.level] ?? <Info className="w-3 h-3" />}</span>
                  <span className="text-muted-foreground w-6 shrink-0">{l.tick}</span>
                  {l.system && <span className="text-primary/70 shrink-0">[{l.system}]</span>}
                  <span className="flex-1 break-all">{l.message}</span>
                  <span className="text-muted-foreground/50 shrink-0 text-[10px]">{new Date(l.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
