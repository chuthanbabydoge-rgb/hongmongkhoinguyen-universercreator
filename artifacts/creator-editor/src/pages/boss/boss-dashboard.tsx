import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skull, Plus, BarChart2, Shield, Swords, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossDashboard() {
  const { data, isLoading } = useQuery<{ bosses: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/bosses/dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/dashboard`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Skull className="w-6 h-6 text-red-500" /> Boss Editor</h1>
          <p className="text-muted-foreground">Design powerful bosses with phases, mechanics and raid encounters</p>
        </div>
        <Link href="/boss-browser">
          <Button><Plus className="w-4 h-4 mr-2" />New Boss</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bosses</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data?.total ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Browse</CardTitle></CardHeader>
          <CardContent><Link href="/boss-browser"><Button variant="outline" className="w-full">Open Browser</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Simulator</CardTitle></CardHeader>
          <CardContent><Link href="/boss-simulator"><Button variant="outline" className="w-full">Run Simulation</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Validator</CardTitle></CardHeader>
          <CardContent><Link href="/boss-validator"><Button variant="outline" className="w-full">Validate All</Button></Link></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Bosses</h2>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (data?.bosses ?? []).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No bosses yet. <Link href="/boss-browser"><span className="text-primary cursor-pointer">Create your first boss</span></Link></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {(data?.bosses ?? []).map((boss: Record<string, unknown>) => (
              <Card key={String(boss.id)}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skull className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium">{String(boss.name)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{String(boss.bossType ?? "").replace(/_/g, " ")} · Lv.{String(boss.level)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={boss.isPublished ? "default" : "secondary"}>{boss.isPublished ? "Published" : "Draft"}</Badge>
                    <Link href={`/boss-editor/${boss.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/boss-templates", icon: Star, label: "Templates" },
          { href: "/boss-simulator", icon: Swords, label: "Simulator" },
          { href: "/boss-statistics", icon: BarChart2, label: "Statistics" },
          { href: "/boss-import-export", icon: Shield, label: "Import / Export" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="py-4 flex flex-col items-center gap-2">
                <Icon className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
