import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Plus, Globe, Play, ShieldAlert, Download, Train, Plane, Anchor } from "lucide-react";

export default function TransportDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["transport-networks"],
    queryFn: async () => {
      const res = await fetch("/api/transportation");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const networks = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Transportation Editor</h1>
            <p className="text-gray-400 text-sm">Manage transport networks, roads, routes & infrastructure</p>
          </div>
        </div>
        <Link href="/transport-editor/new">
          <Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />New Network</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Networks", value: networks.length, icon: Globe, color: "text-cyan-400" },
          { label: "Active", value: networks.filter((n: any) => n.transportStatus === "active").length, icon: Play, color: "text-green-400" },
          { label: "Draft", value: networks.filter((n: any) => n.transportStatus === "draft").length, icon: Navigation, color: "text-yellow-400" },
          { label: "Archived", value: networks.filter((n: any) => n.transportStatus === "archived").length, icon: ShieldAlert, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Road Editor", href: "/road-editor/new", icon: Navigation, color: "bg-cyan-900/50 border-cyan-700" },
          { label: "Route Planner", href: "/route-editor/new", icon: Globe, color: "bg-blue-900/50 border-blue-700" },
          { label: "Railway Editor", href: "/railway-editor/new", icon: Train, color: "bg-purple-900/50 border-purple-700" },
          { label: "Airport Editor", href: "/airport-editor/new", icon: Plane, color: "bg-indigo-900/50 border-indigo-700" },
          { label: "Port Editor", href: "/port-editor/new", icon: Anchor, color: "bg-teal-900/50 border-teal-700" },
          { label: "Station Manager", href: "/station-editor/new", icon: Navigation, color: "bg-emerald-900/50 border-emerald-700" },
          { label: "Vehicle Manager", href: "/vehicle-manager/new", icon: Navigation, color: "bg-orange-900/50 border-orange-700" },
          { label: "Signal Editor", href: "/traffic-signal-editor/new", icon: ShieldAlert, color: "bg-red-900/50 border-red-700" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className={`${item.color} border cursor-pointer hover:opacity-80 transition-opacity`}>
              <CardContent className="pt-4 flex items-center gap-3">
                <item.icon className="h-5 w-5 text-white" />
                <span className="text-white text-sm font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white text-lg">Recent Networks</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : networks.length === 0 ? (
            <p className="text-gray-400">No transport networks yet. Create your first one!</p>
          ) : (
            <div className="space-y-2">
              {networks.slice(0, 10).map((n: any) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Navigation className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{n.name}</p>
                      <p className="text-gray-400 text-xs">{n.transportType} · v{n.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={n.transportStatus === "active" ? "default" : "secondary"}>{n.transportStatus}</Badge>
                    <Link href={`/transport-editor/${n.id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
