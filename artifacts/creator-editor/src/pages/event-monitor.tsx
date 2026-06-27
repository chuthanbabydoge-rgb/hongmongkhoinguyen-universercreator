import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Search } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const EVENT_COLORS: Record<string, string> = {
  spawn: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  destroy: "bg-red-500/20 text-red-400 border-red-500/30",
  move: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  rotate: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  scale: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  collision: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  interaction: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quest: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  dialogue: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  timer: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  tick: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  system: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  custom: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

export default function EventMonitor() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["/api/runtime", sessionId, "events"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/events?limit=200`),
    refetchInterval: 2000,
  });

  const events: any[] = data?.items ?? [];
  const types = ["all", ...Array.from(new Set(events.map((e: any) => e.type as string)))];

  const filtered = events.filter((e: any) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (search && !e.type?.includes(search.toLowerCase()) && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byType = events.reduce((acc: Record<string, number>, e: any) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6" />Event Monitor</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · {data?.total ?? 0} events dispatched</p>
      </div>

      {/* Event type breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${EVENT_COLORS[type] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}
            onClick={() => setTypeFilter(type === typeFilter ? "all" : type)}>
            {type} ({count as number})
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" variant="ghost" onClick={() => { setTypeFilter("all"); setSearch(""); }}>Clear</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{filtered.length} events</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No events dispatched yet.</p>
              <p className="text-xs mt-1">Events appear as the runtime engine processes game logic.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground border-b border-border text-xs">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Target</th>
                  <th className="text-left p-2">Tick</th>
                  <th className="text-left p-2">State</th>
                  <th className="text-left p-2">Time</th>
                </tr></thead>
                <tbody>
                  {filtered.map((e: any) => (
                    <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="p-2 font-mono text-xs text-muted-foreground">{e.id}</td>
                      <td className="p-2">
                        <Badge className={`text-xs border ${EVENT_COLORS[e.type] ?? ""}`}>{e.type}</Badge>
                      </td>
                      <td className="p-2 text-xs">{e.name ?? "—"}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{e.sourceEntityId ?? "—"}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{e.targetEntityId ?? "—"}</td>
                      <td className="p-2 font-mono text-xs">{e.tick}</td>
                      <td className="p-2">
                        <Badge className={`text-xs ${e.processed ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {e.processed ? "processed" : "pending"}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(e.dispatchedAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
