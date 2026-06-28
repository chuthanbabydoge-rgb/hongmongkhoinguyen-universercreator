import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, Layers, ShieldAlert, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BuildingDashboard() {
  const { data, isLoading } = useQuery<{ buildings: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/buildings/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/buildings/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-orange-500" /> Building Editor</h1>
          <p className="text-muted-foreground">Create houses, shops, offices, dungeons and every interior in your Universe</p>
        </div>
        <Link href="/building-browser">
          <Button><Plus className="w-4 h-4 mr-2" />New Building</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Buildings</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data?.total ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Browse</CardTitle></CardHeader>
          <CardContent><Link href="/building-browser"><Button variant="outline" className="w-full">Open Browser</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Simulator</CardTitle></CardHeader>
          <CardContent><Link href="/building-simulator"><Button variant="outline" className="w-full">Run Simulation</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Validator</CardTitle></CardHeader>
          <CardContent><Link href="/building-validator"><Button variant="outline" className="w-full">Validate All</Button></Link></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/building-browser", label: "Floor Editor", icon: Layers },
          { href: "/building-browser", label: "Room Editor", icon: Building2 },
          { href: "/building-browser", label: "Door Editor", icon: Building2 },
          { href: "/building-browser", label: "Window Editor", icon: Building2 },
          { href: "/building-browser", label: "Furniture Editor", icon: Building2 },
          { href: "/building-browser", label: "Utility Editor", icon: Play },
          { href: "/building-browser", label: "NPC Manager", icon: Building2 },
          { href: "/building-browser", label: "Security Manager", icon: ShieldAlert },
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
        <h2 className="text-lg font-semibold mb-3">Recent Buildings</h2>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (data?.buildings ?? []).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No buildings yet. <Link href="/building-browser"><span className="text-primary cursor-pointer">Create your first building</span></Link></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {(data?.buildings ?? []).map((b: Record<string, unknown>) => (
              <Card key={String(b.id)} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium">{String(b.name)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{String(b.buildingType).replace("_", " ")} • {String(b.floorCount ?? 1)} floor(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.isPublished ? "default" : "secondary"}>{b.isPublished ? "Published" : "Draft"}</Badge>
                    <Link href={`/building-editor/${b.id}`}>
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
