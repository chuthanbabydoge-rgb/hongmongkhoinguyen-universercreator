import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { BarChart2, Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Stats = { timesUsed: number; timesSimulated: number; avgDamageDealt: number; avgHealDealt: number; lastSimulatedAt?: string };

export default function SkillStatistics() {
  const { id } = useParams<{ id: string }>();

  const { data: skill } = useQuery<{ name: string }>({
    queryKey: [`/api/skills/${id}`],
    queryFn: () => authFetch(`/api/skills/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: [`/api/skills/${id}/statistics`],
    queryFn: () => authFetch(`/api/skills/${id}/statistics`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">{skill?.name ?? `Skill #${id}`}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Times Used", value: stats?.timesUsed ?? 0, icon: Zap, color: "text-primary" },
          { label: "Times Simulated", value: stats?.timesSimulated ?? 0, icon: Activity, color: "text-blue-400" },
          { label: "Avg Damage", value: stats ? stats.avgDamageDealt.toFixed(1) : "0.0", icon: BarChart2, color: "text-red-400" },
          { label: "Avg Heal", value: stats ? stats.avgHealDealt.toFixed(1) : "0.0", icon: BarChart2, color: "text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div></CardContent>
          </Card>
        ))}
      </div>

      {stats?.lastSimulatedAt && (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Last simulated: {new Date(stats.lastSimulatedAt).toLocaleString()}
          </CardContent>
        </Card>
      )}

      {!stats && (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No statistics yet. Run the simulator to generate data.</p>
        </div>
      )}
    </div>
  );
}
