import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Map, Plus, Globe, ShieldAlert, Download, Play, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function LandDashboard() {
  const { data, isLoading } = useQuery<{ lands: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/lands/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> Land Editor</h1>
          <p className="text-muted-foreground">Design and manage every territory, district, and zone in your Universe</p>
        </div>
        <Link href="/land-browser"><Button><Plus className="w-4 h-4 mr-2" />New Land</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Lands</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{isLoading ? "…" : (data?.total ?? 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Browse</CardTitle></CardHeader><CardContent><Link href="/land-browser"><Button variant="outline" className="w-full">Open Browser</Button></Link></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Simulator</CardTitle></CardHeader><CardContent><Link href="/land-simulator"><Button variant="outline" className="w-full">Run Simulation</Button></Link></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Validator</CardTitle></CardHeader><CardContent><Link href="/land-validator"><Button variant="outline" className="w-full">Validate All</Button></Link></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/land-browser", label: "Parcel Editor", icon: Map },
          { href: "/land-browser", label: "Boundary Editor", icon: Globe },
          { href: "/land-browser", label: "Zone Editor", icon: Map },
          { href: "/land-browser", label: "Terrain Editor", icon: Map },
          { href: "/land-browser", label: "Road Manager", icon: Globe },
          { href: "/land-browser", label: "Utility Manager", icon: Play },
          { href: "/land-browser", label: "Teleport Manager", icon: Globe },
          { href: "/land-browser", label: "Building Placement", icon: BarChart2 },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="py-4 flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Lands</h2>
        {isLoading ? <div className="text-muted-foreground">Loading…</div>
          : (data?.lands ?? []).length === 0
            ? <Card><CardContent className="py-8 text-center text-muted-foreground">No lands yet. <Link href="/land-browser"><span className="text-primary cursor-pointer">Create your first land</span></Link></CardContent></Card>
            : <div className="grid gap-3">{(data?.lands ?? []).map((l) => (
              <Card key={String(l.id)}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div><div className="font-medium">{String(l.name)}</div><div className="text-xs text-muted-foreground">{String(l.landType)} · {String(l.landStatus)}</div></div>
                  <Link href={`/land-editor/${l.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                </CardContent>
              </Card>
            ))}</div>}
      </div>
    </div>
  );
}
