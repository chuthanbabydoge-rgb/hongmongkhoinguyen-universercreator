import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, Play, Pause, Users, Server, CloudRain, Sun, Moon, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const stateColor: Record<string, string> = {
  running: "bg-green-500",
  offline: "bg-gray-500",
  loading: "bg-yellow-500",
  paused: "bg-orange-500",
  error: "bg-red-500",
  saving: "bg-blue-500",
};

export default function WorldSystemDashboard() {
  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=50`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const worlds = data?.items ?? [];
  const running = worlds.filter(w => w.runtimeState === "running").length;
  const offline = worlds.filter(w => w.runtimeState === "offline").length;
  const totalPlayers = worlds.reduce((s, w) => s + (Number(w.currentPlayers) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6 text-blue-500" />World System</h1>
          <p className="text-muted-foreground">Runtime manager for all published worlds</p>
        </div>
        <Link href="/world-system/new"><Button><Plus className="w-4 h-4 mr-2" />New World Instance</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Worlds", value: data?.total ?? 0, icon: Globe, color: "text-blue-500" },
          { label: "Running", value: running, icon: Play, color: "text-green-500" },
          { label: "Offline", value: offline, icon: Pause, color: "text-gray-500" },
          { label: "Active Players", value: totalPlayers, icon: Users, color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><div className={`text-3xl font-bold ${color}`}>{value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">World Instances</h2>
        {isLoading ? <div className="text-muted-foreground">Loading...</div> : worlds.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No world instances yet. Create one to get started.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {worlds.map(w => (
              <Card key={String(w.id)} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${stateColor[String(w.runtimeState)] ?? "bg-gray-500"}`} />
                    <div>
                      <div className="font-medium">{String(w.name)}</div>
                      <div className="text-xs text-muted-foreground">{String(w.description ?? "No description")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{String(w.currentPlayers)}/{String(w.maxPlayers)}</div>
                    <Badge variant="secondary" className="capitalize">{String(w.currentWeather)}</Badge>
                    <Badge variant="outline" className="capitalize">{String(w.runtimeState)}</Badge>
                    <Link href={`/world-runtime/${w.id}`}><Button size="sm" variant="outline"><Server className="w-3 h-3 mr-1" />Runtime<ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: "/world-streaming", icon: Server, label: "Streaming Center", desc: "Monitor chunk loading and memory" },
          { href: "/world-weather-center", icon: CloudRain, label: "Weather Center", desc: "Control weather across all worlds" },
          { href: "/world-daynight-center", icon: Moon, label: "Day/Night Center", desc: "Manage time cycles" },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
