import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, Map, Cpu, BarChart2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function CityDashboard() {
  const { data, isLoading } = useQuery<{ cities: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/cities/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-blue-500" /> City Editor</h1>
          <p className="text-muted-foreground">Design rich cities with districts, zones, buildings, roads and live simulation</p>
        </div>
        <Link href="/city-browser">
          <Button><Plus className="w-4 h-4 mr-2" />New City</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Cities</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data?.total ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Browse</CardTitle></CardHeader>
          <CardContent><Link href="/city-browser"><Button variant="outline" className="w-full">Open Browser</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Simulator</CardTitle></CardHeader>
          <CardContent><Link href="/city-simulator"><Button variant="outline" className="w-full">Run Simulation</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Validator</CardTitle></CardHeader>
          <CardContent><Link href="/city-validator"><Button variant="outline" className="w-full">Validate All</Button></Link></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/city-browser", label: "District Editor", icon: Map },
          { href: "/city-browser", label: "Zone Editor", icon: Map },
          { href: "/city-browser", label: "Building Manager", icon: Building2 },
          { href: "/city-browser", label: "Utility Manager", icon: Cpu },
          { href: "/city-browser", label: "Transport Manager", icon: BarChart2 },
          { href: "/city-browser", label: "Population", icon: BarChart2 },
          { href: "/city-browser", label: "Services", icon: ShieldAlert },
          { href: "/city-browser", label: "Spawn Manager", icon: Map },
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
        <h2 className="text-lg font-semibold mb-3">Recent Cities</h2>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (data?.cities ?? []).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No cities yet. <Link href="/city-browser"><span className="text-primary cursor-pointer">Create your first city</span></Link></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {(data?.cities ?? []).map((city: Record<string, unknown>) => (
              <Card key={String(city.id)} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{String(city.name)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{String(city.cityType).replace("_", " ")} • Pop: {String(city.population ?? 0)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={city.isPublished ? "default" : "secondary"}>{city.isPublished ? "Published" : "Draft"}</Badge>
                    <Link href={`/city-editor/${city.id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
