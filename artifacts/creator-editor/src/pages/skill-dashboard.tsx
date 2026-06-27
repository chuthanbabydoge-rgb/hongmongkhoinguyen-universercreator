import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Zap, CheckCircle, FileEdit, Archive, BarChart2, Layers, Play, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

interface DashboardData {
  total: number; published: number; drafts: number; archived: number;
  recent: Array<{ id: number; name: string; skillType: string; damageType: string; isPublished: boolean }>;
}

const TYPE_COLORS: Record<string, string> = {
  active: "text-blue-400", passive: "text-green-400", toggle: "text-yellow-400",
  ultimate: "text-orange-400", aura: "text-purple-400", reaction: "text-cyan-400", summon: "text-red-400",
};

export default function SkillDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/skills/dashboard"],
    queryFn: () => authFetch("/api/skills/dashboard").then((r) => r.json()),
  });
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (name: string) => authFetch("/api/skills", { method: "POST", body: JSON.stringify({ name }) }).then((r) => r.json()),
    onSuccess: (skill: { id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/dashboard"] });
      setLocation(`/skill-editor/${skill.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to create skill", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skill Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage reusable skills for your Universe</p>
        </div>
        <Button onClick={() => createMutation.mutate("New Skill")} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Skill
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Skills", value: data?.total ?? 0, icon: Zap, color: "text-primary" },
          { label: "Published", value: data?.published ?? 0, icon: CheckCircle, color: "text-green-500" },
          { label: "Drafts", value: data?.drafts ?? 0, icon: FileEdit, color: "text-yellow-500" },
          { label: "Archived", value: data?.archived ?? 0, icon: Archive, color: "text-muted-foreground" },
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

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Skills</CardTitle></CardHeader>
        <CardContent>
          {!data?.recent?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No skills yet. Create your first skill to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent.map((skill) => (
                <Link key={skill.id} href={`/skill-editor/${skill.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border border-border">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{skill.name}</p>
                        <p className={`text-xs capitalize ${TYPE_COLORS[skill.skillType] ?? "text-muted-foreground"}`}>
                          {skill.skillType} · {skill.damageType}
                        </p>
                      </div>
                    </div>
                    <Badge variant={skill.isPublished ? "default" : "secondary"}>
                      {skill.isPublished ? "published" : "draft"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/skill-browser", label: "Skill Browser", desc: "Browse and manage all skills", icon: BarChart2 },
          { href: "/skill-templates", label: "Templates", desc: "Start from a template", icon: Layers },
          { href: "/skill-simulator", label: "Simulator", desc: "Test skill behavior in real-time", icon: Play },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
