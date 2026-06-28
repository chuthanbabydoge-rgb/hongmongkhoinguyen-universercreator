import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Sword, Heart, TrendingUp, Star } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetStatistics() {
  const [, params] = useRoute("/pet-statistics/:id");
  const id = Number(params?.id);

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/statistics`], queryFn: () => apiFetch(`/api/pets/${id}/statistics`).then(r => r.json()), enabled: !!id });

  const stats = [
    { label: "Total Battles", value: data?.totalBattles, icon: Sword },
    { label: "Total Wins", value: data?.totalWins, icon: Star },
    { label: "Total Feeds", value: data?.totalFeeds, icon: Heart },
    { label: "Evolutions", value: data?.totalEvolutions, icon: TrendingUp },
    { label: "Breeds", value: data?.totalBreeds, icon: Heart },
    { label: "EXP Gained", value: data?.totalExpGained, icon: TrendingUp },
    { label: "Highest Level", value: data?.highestLevel, icon: Star },
    { label: "Playtime (s)", value: data?.playtime, icon: BarChart2 },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Statistics — Pet #{id}</h1>
      </div>
      {isLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <Skeleton key={i} className="h-24" />)}</div>
      : !data ? <Card><CardContent className="p-8 text-center text-muted-foreground">No statistics recorded yet</CardContent></Card>
      : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {data && data.totalBattles > 0 && (
        <Card>
          <CardHeader><CardTitle>Win Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-green-500">{Math.round((data.totalWins / data.totalBattles) * 100)}%</div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(data.totalWins / data.totalBattles) * 100}%` }} />
              </div>
              <span className="text-sm text-muted-foreground">{data.totalWins}/{data.totalBattles}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
