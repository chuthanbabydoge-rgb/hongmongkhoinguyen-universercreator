import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layers, Search, Filter } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function EntityExplorer() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState("all");

  const { data } = useQuery({
    queryKey: ["/api/runtime", sessionId, "entities"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/entities?limit=500`),
    refetchInterval: 4000,
  });

  const entities: any[] = data?.items ?? [];
  const layers = ["all", ...Array.from(new Set(entities.map((e: any) => e.layer as string)))];

  const filtered = entities.filter((e: any) => {
    if (layerFilter !== "all" && e.layer !== layerFilter) return false;
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase()) && !e.tag?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6" />Entity Explorer</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · {data?.total ?? 0} entities</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or tag…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {layers.map((l) => (
            <Button key={l} size="sm" variant={layerFilter === l ? "secondary" : "ghost"} className="text-xs capitalize" onClick={() => setLayerFilter(l)}>{l}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{filtered.length} entities</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No entities match the current filter.</p>
              <p className="text-xs mt-1">Start a runtime session to spawn entities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground border-b border-border text-xs">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Tag</th>
                  <th className="text-left p-2">Layer</th>
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Parent</th>
                  <th className="text-left p-2">State</th>
                </tr></thead>
                <tbody>
                  {filtered.map((e: any) => {
                    const pos = e.transform?.position ?? { x: 0, y: 0, z: 0 };
                    return (
                      <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/20">
                        <td className="p-2 font-mono text-xs text-muted-foreground">{e.id}</td>
                        <td className="p-2 font-medium">{e.name}</td>
                        <td className="p-2">{e.tag ? <Badge variant="outline" className="text-xs">{e.tag}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="p-2"><Badge variant="outline" className="text-xs">{e.layer}</Badge></td>
                        <td className="p-2 font-mono text-xs text-muted-foreground">({pos.x.toFixed(1)}, {pos.y.toFixed(1)}, {pos.z.toFixed(1)})</td>
                        <td className="p-2 text-xs text-muted-foreground">{e.parentId ?? "—"}</td>
                        <td className="p-2">
                          <Badge className={`text-xs ${e.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                            {e.enabled ? "active" : "disabled"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
