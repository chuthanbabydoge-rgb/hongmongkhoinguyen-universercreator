import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Globe, Shield, BarChart2, Layers } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

export default function DungeonDashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/dungeons/dashboard"],
    queryFn: async () => { const r = await apiFetch("/api/dungeons/dashboard"); return r.json(); },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/dungeons", { method: "POST", body: JSON.stringify({ name: "New Dungeon" }) });
      return r.json();
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["/api/dungeons/dashboard"] }); toast({ title: "Dungeon created" }); window.location.href = `${BASE}/dungeon-editor/${d.id}`; },
    onError: () => toast({ title: "Error", description: "Failed to create dungeon", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dungeon Editor</h1>
          <p className="text-muted-foreground">Design and manage your dungeon experiences</p>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
          <Plus className="w-4 h-4 mr-2" /> New Dungeon
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Dungeons</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{data?.totalDungeons ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Published</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-500">{data?.publishedDungeons ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Archived</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-muted-foreground">{data?.archivedDungeons ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Templates</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-500">{data?.templateCount ?? 0}</div></CardContent></Card>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/dungeon-browser"><Card className="cursor-pointer hover:bg-muted/40 transition-colors"><CardContent className="pt-6 flex items-center gap-3"><Globe className="w-8 h-8 text-primary" /><div><p className="font-semibold">Dungeon Browser</p><p className="text-xs text-muted-foreground">Browse all dungeons</p></div></CardContent></Card></Link>
        <Link href="/dungeon-templates"><Card className="cursor-pointer hover:bg-muted/40 transition-colors"><CardContent className="pt-6 flex items-center gap-3"><BookOpen className="w-8 h-8 text-blue-500" /><div><p className="font-semibold">Templates</p><p className="text-xs text-muted-foreground">Start from a template</p></div></CardContent></Card></Link>
        <Link href="/dungeon-simulator"><Card className="cursor-pointer hover:bg-muted/40 transition-colors"><CardContent className="pt-6 flex items-center gap-3"><Shield className="w-8 h-8 text-yellow-500" /><div><p className="font-semibold">Simulator</p><p className="text-xs text-muted-foreground">Test dungeon runs</p></div></CardContent></Card></Link>
      </div>

      {data?.recentDungeons?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Dungeons</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentDungeons.map((d: { id: number; name: string; difficulty: string; isPublished: boolean }) => (
                <Link key={d.id} href={`/dungeon-editor/${d.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{d.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">{d.difficulty}</Badge>
                    </div>
                    {d.isPublished && <Badge variant="secondary" className="text-xs">Published</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
