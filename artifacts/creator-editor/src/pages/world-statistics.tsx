import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, MapPin, Zap, Layers, History, BarChart2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WorldStatistics() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const worldId = Number(id);

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: stats, isLoading } = useQuery({ queryKey: ["/api/world-editor", worldId, "statistics"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/statistics`), enabled: !!worldId, refetchInterval: 30000 });

  const statCards = [
    { label: "Regions", value: stats?.regionCount ?? 0, icon: Globe, color: "text-blue-400" },
    { label: "Chunks", value: stats?.chunkCount ?? 0, icon: BarChart2, color: "text-purple-400" },
    { label: "Spawn Points", value: stats?.spawnpointCount ?? 0, icon: MapPin, color: "text-emerald-400" },
    { label: "Portals", value: stats?.portalCount ?? 0, icon: Zap, color: "text-cyan-400" },
    { label: "Layers", value: stats?.layerCount ?? 0, icon: Layers, color: "text-amber-400" },
    { label: "Versions", value: stats?.versionCount ?? 0, icon: History, color: "text-violet-400" },
    { label: "Exports", value: stats?.exportCount ?? 0, icon: BarChart2, color: "text-orange-400" },
    { label: "Play Sessions", value: stats?.playCount ?? 0, icon: Globe, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">World Statistics</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-3xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">World Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Total Edit Time", value: stats?.totalEditTimeMs ? `${Math.round(stats.totalEditTimeMs / 60000)} min` : "0 min" },
                { label: "Last Played", value: stats?.lastPlayedAt ? new Date(stats.lastPlayedAt).toLocaleString() : "Never" },
                { label: "Statistics Updated", value: stats?.updatedAt ? new Date(stats.updatedAt).toLocaleString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
