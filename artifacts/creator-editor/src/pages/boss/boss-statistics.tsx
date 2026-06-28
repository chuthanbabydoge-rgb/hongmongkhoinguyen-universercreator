import { useQuery } from "@tanstack/react-query";
import { BarChart2, Skull, Trophy, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossStatistics() {
  const [selectedBoss, setSelectedBoss] = useState("");

  const { data: bosses } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/bosses"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: stats, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/bosses", selectedBoss, "statistics"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${selectedBoss}/statistics`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!selectedBoss,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6 text-blue-500" />Boss Statistics</h1>
        <p className="text-muted-foreground">Runtime performance data per boss</p>
      </div>

      <div className="max-w-xs">
        <Select value={selectedBoss} onValueChange={setSelectedBoss}>
          <SelectTrigger><SelectValue placeholder="Select a boss..." /></SelectTrigger>
          <SelectContent>
            {(bosses?.items ?? []).map((b: Record<string, unknown>) => (
              <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.name)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedBoss && <Card><CardContent className="py-12 text-center text-muted-foreground">Select a boss to view its statistics.</CardContent></Card>}
      {selectedBoss && isLoading && <div className="text-muted-foreground">Loading...</div>}
      {selectedBoss && !isLoading && !stats && <Card><CardContent className="py-8 text-center text-muted-foreground">No statistics recorded for this boss yet.</CardContent></Card>}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Skull, label: "Total Encounters", value: String(stats.totalEncounters ?? 0), color: "text-red-500" },
            { icon: Trophy, label: "Total Kills", value: String(stats.totalKills ?? 0), color: "text-yellow-500" },
            { icon: Zap, label: "Total Wipes", value: String(stats.totalWipes ?? 0), color: "text-orange-500" },
            { icon: Clock, label: "Fastest Kill", value: stats.fastestKillTime ? `${String(stats.fastestKillTime)}s` : "—", color: "text-green-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
              <CardContent><div className={`text-3xl font-bold ${color}`}>{value}</div></CardContent>
            </Card>
          ))}
          <Card className="col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Kill Time</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.averageKillTime ? `${String(stats.averageKillTime)}s` : "—"}</div></CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Enrage Count</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-500">{String(stats.enrageCount ?? 0)}</div></CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Loot Dropped</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{String(stats.totalLootDropped ?? 0)}</div></CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Player Count</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.averagePlayerCount ? Number(stats.averagePlayerCount).toFixed(1) : "—"}</div></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
