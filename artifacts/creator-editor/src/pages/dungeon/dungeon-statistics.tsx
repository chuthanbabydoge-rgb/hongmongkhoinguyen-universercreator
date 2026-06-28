import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BarChart2, TrendingUp, Users, Clock, Swords, Shield } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string) {
  return fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token()}` } });
}

interface DungeonStats {
  totalRuns: number; completedRuns: number; failedRuns: number;
  averageCompletionTime: number | null; fastestCompletionTime: number | null;
  totalBossKills: number; totalDeaths: number; averagePartySize: number | null;
}

export default function DungeonStatistics() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);

  const { data: stats, isLoading } = useQuery<DungeonStats>({
    queryKey: ["/api/dungeons", dungeonId, "statistics"],
    queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/statistics`); return r.json(); },
  });

  const completionRate = stats && stats.totalRuns > 0 ? ((stats.completedRuns / stats.totalRuns) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Dungeon Statistics</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : !stats ? (
        <div className="text-center py-16 text-muted-foreground">No statistics recorded yet. Run some simulations first.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><BarChart2 className="w-3 h-3" />Total Runs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalRuns}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />Completion Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{completionRate}%</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Swords className="w-3 h-3" />Boss Kills</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-500">{stats.totalBossKills}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" />Total Deaths</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-500">{stats.totalDeaths}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Avg Time</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.averageCompletionTime ? `${Math.round(stats.averageCompletionTime)}s` : "—"}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Fastest</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.fastestCompletionTime ? `${Math.round(stats.fastestCompletionTime)}s` : "—"}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />Avg Party</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.averagePartySize ? stats.averagePartySize.toFixed(1) : "—"}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" />Failed Runs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{stats.failedRuns}</div></CardContent></Card>
          </div>
        </>
      )}
    </div>
  );
}
