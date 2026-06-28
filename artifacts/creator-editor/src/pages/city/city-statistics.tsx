import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Users, DollarSign, ShieldAlert, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export default function CityStatistics() {
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const { data: citiesData } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load cities");
      return res.json();
    },
  });

  const { data: stats, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/cities/${selectedCityId}/statistics`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/statistics`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load statistics");
      return res.json();
    },
    enabled: !!selectedCityId,
  });

  const { data: population } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/cities/${selectedCityId}/population`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/population`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load population");
      return res.json();
    },
    enabled: !!selectedCityId,
  });

  const cities = citiesData?.items ?? [];

  const statCards = stats ? [
    { label: "Total Visitors", value: String(stats.totalVisitors ?? 0), icon: Users, color: "text-blue-500" },
    { label: "Transactions", value: String(stats.totalTransactions ?? 0), icon: TrendingUp, color: "text-green-500" },
    { label: "Revenue", value: Math.round(Number(stats.totalRevenue ?? 0)).toLocaleString(), icon: DollarSign, color: "text-emerald-500" },
    { label: "Expenses", value: Math.round(Number(stats.totalExpenses ?? 0)).toLocaleString(), icon: DollarSign, color: "text-red-500" },
    { label: "Crime Events", value: String(stats.crimeEvents ?? 0), icon: ShieldAlert, color: "text-orange-500" },
    { label: "Disaster Events", value: String(stats.disasterEvents ?? 0), icon: ShieldAlert, color: "text-red-500" },
    { label: "Quests Done", value: String(stats.questsCompleted ?? 0), icon: TrendingUp, color: "text-purple-500" },
    { label: "Buildings Built", value: String(stats.buildingsConstructed ?? 0), icon: Home, color: "text-indigo-500" },
    { label: "Roads Built", value: String(stats.roadsBuilt ?? 0), icon: BarChart2, color: "text-cyan-500" },
    { label: "Peak Population", value: String(stats.peakPopulation ?? 0), icon: Users, color: "text-blue-500" },
    { label: "Avg Happiness", value: `${Math.round(Number(stats.averageHappiness ?? 75))}%`, icon: TrendingUp, color: "text-yellow-500" },
  ] : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6 text-blue-500" /> City Statistics</h1>

      <div>
        <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={selectedCityId ?? ""} onChange={(e) => setSelectedCityId(Number(e.target.value))}>
          <option value="">-- Select a city --</option>
          {cities.map((c: Record<string, unknown>) => (
            <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
          ))}
        </select>
      </div>

      {selectedCityId && (
        <>
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : !stats ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No statistics available for this city.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Icon className={`w-3 h-3 ${color}`} />{label}</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
                </Card>
              ))}
            </div>
          )}

          {population && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />Population Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total", value: population.totalCount },
                    { label: "NPCs", value: population.npcCount },
                    { label: "Players", value: population.playerCount },
                    { label: "Residents", value: population.residentCount },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className="text-2xl font-bold">{String(value ?? 0)}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Employment Rate</span><span>{Math.round(Number(population.employmentRate ?? 0.9) * 100)}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Happiness Score</span><span>{Math.round(Number(population.happinessScore ?? 75))}/100</span></div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Number(population.happinessScore ?? 75)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
