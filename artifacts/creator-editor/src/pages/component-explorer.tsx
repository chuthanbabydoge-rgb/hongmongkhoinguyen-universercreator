import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Component, Search } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const COMPONENT_COLORS: Record<string, string> = {
  transform: "text-blue-400 bg-blue-500/10",
  renderer: "text-emerald-400 bg-emerald-500/10",
  collider: "text-orange-400 bg-orange-500/10",
  rigid_body: "text-red-400 bg-red-500/10",
  script: "text-purple-400 bg-purple-500/10",
  health: "text-pink-400 bg-pink-500/10",
  inventory: "text-yellow-400 bg-yellow-500/10",
  quest: "text-cyan-400 bg-cyan-500/10",
  dialogue: "text-indigo-400 bg-indigo-500/10",
  animation: "text-teal-400 bg-teal-500/10",
  audio: "text-violet-400 bg-violet-500/10",
  navigation: "text-lime-400 bg-lime-500/10",
  custom: "text-zinc-400 bg-zinc-500/10",
};

export default function ComponentExplorer() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["/api/runtime", sessionId, "components"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/components?limit=500`),
    refetchInterval: 5000,
  });

  const components: any[] = data?.items ?? [];
  const types = ["all", ...Array.from(new Set(components.map((c: any) => c.type as string)))];

  const filtered = components.filter((c: any) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (search && !c.type?.includes(search.toLowerCase()) && !String(c.entityId).includes(search)) return false;
    return true;
  });

  const byType = components.reduce((acc: Record<string, number>, c: any) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Component className="w-6 h-6" />Component Explorer</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · {data?.total ?? 0} components</p>
      </div>

      {/* Component type breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${COMPONENT_COLORS[type] ?? "text-zinc-400 bg-zinc-500/10"}`}>
            {type.replace("_", " ")} <span className="opacity-70">({count as number})</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter components…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <Button key={t} size="sm" variant={typeFilter === t ? "secondary" : "ghost"} className="text-xs capitalize" onClick={() => setTypeFilter(t)}>
              {t.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{filtered.length} components</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Component className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No components found. Attach components to entities in the inspector.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground border-b border-border text-xs">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Entity</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Order</th>
                  <th className="text-left p-2">State</th>
                </tr></thead>
                <tbody>
                  {filtered.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="p-2 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${COMPONENT_COLORS[c.type] ?? "text-zinc-400 bg-zinc-500/10"}`}>
                          {c.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">#{c.entityId}</td>
                      <td className="p-2">{c.name ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-2 font-mono text-xs">{c.order}</td>
                      <td className="p-2">
                        <Badge className={`text-xs ${c.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                          {c.enabled ? "enabled" : "disabled"}
                        </Badge>
                      </td>
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
