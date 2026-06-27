import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Swords, Plus, BarChart2, CheckCircle, Archive, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatDashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/combat/dashboard"],
    queryFn: () => apiFetch("/api/combat/dashboard").then(r => r.json()),
  });

  const createCombat = useMutation({
    mutationFn: () => apiFetch("/api/combat", { method: "POST", body: JSON.stringify({ name: "New Combat" }) }).then(r => r.json()),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["/api/combat/dashboard"] }); toast({ title: "Combat created" }); window.location.href = `${BASE}/combat-editor/${c.id}`; },
  });

  const stats = [
    { label: "Total Combats", value: data?.totalCombats ?? 0, icon: Swords, color: "text-red-400" },
    { label: "Published", value: data?.publishedCombats ?? 0, icon: CheckCircle, color: "text-green-400" },
    { label: "Archived", value: data?.archivedCombats ?? 0, icon: Archive, color: "text-muted-foreground" },
    { label: "Templates", value: data?.templateCount ?? 0, icon: LayoutTemplate, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-red-400" />Combat Editor</h1>
          <p className="text-muted-foreground mt-1">Define combat rules, damage formulas, and AI behaviors</p>
        </div>
        <Button onClick={() => createCombat.mutate()} disabled={createCombat.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Combat
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{isLoading ? "—" : s.value}</p></div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="w-4 h-4" />Recent Combats</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading…</p> :
            !data?.recentCombats?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No combats yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentCombats.map((c: { id: number; name: string; combatMode: string; isPublished: boolean; isArchived: boolean }) => (
                  <Link key={c.id} href={`/combat-editor/${c.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Swords className="w-4 h-4 text-red-400" />
                        <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground capitalize">{c.combatMode?.replace(/_/g, " ")}</p></div>
                      </div>
                      <div className="flex gap-2">
                        {c.isPublished && <Badge variant="default" className="text-xs">Published</Badge>}
                        {c.isArchived && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/combat-browser", label: "Browse All Combats", icon: Swords, desc: "Search and manage all combat definitions" },
          { href: "/combat-validator", label: "Validator", icon: CheckCircle, desc: "Validate combat rules and detect issues" },
          { href: "/combat-simulator", label: "Simulator", icon: BarChart2, desc: "Run combat simulations and test formulas" },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-6 flex gap-3">
                <item.icon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div><p className="font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
