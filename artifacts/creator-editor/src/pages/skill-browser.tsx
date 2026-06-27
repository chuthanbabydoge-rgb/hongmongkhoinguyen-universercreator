import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Plus, Zap, Search, Copy, Archive, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Skill = { id: number; name: string; skillType: string; damageType: string; castType: string; isPublished: boolean; isArchived: boolean; updatedAt: string };

const TYPE_COLORS: Record<string, string> = {
  active: "text-blue-400", passive: "text-green-400", toggle: "text-yellow-400",
  ultimate: "text-orange-400", aura: "text-purple-400", reaction: "text-cyan-400", summon: "text-red-400",
};

export default function SkillBrowser() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills", search],
    queryFn: () => authFetch(`/api/skills?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch("/api/skills", { method: "POST", body: JSON.stringify({ name: "New Skill" }) }).then((r) => r.json()),
    onSuccess: (s: Skill) => { queryClient.invalidateQueries({ queryKey: ["/api/skills"] }); setLocation(`/skill-editor/${s.id}`); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/skills/${id}/duplicate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (s: { skillId: number }) => { queryClient.invalidateQueries({ queryKey: ["/api/skills"] }); setLocation(`/skill-editor/${s.skillId}`); },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/skills/${id}/archive`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/skills"] }); toast({ title: "Archived" }); },
  });

  const filtered = skills.filter(s => !s.isArchived);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skill Browser</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Skill
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search skills…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No skills found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <Card key={skill.id} className="hover:border-primary/40 transition-colors group">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Link href={`/skill-editor/${skill.id}`}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Zap className="w-4 h-4 text-primary shrink-0" />
                      <p className="font-semibold hover:text-primary transition-colors">{skill.name}</p>
                    </div>
                  </Link>
                  <Badge variant={skill.isPublished ? "default" : "secondary"} className="text-xs shrink-0">
                    {skill.isPublished ? "live" : "draft"}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs capitalize ${TYPE_COLORS[skill.skillType] ?? ""}`}>{skill.skillType}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{skill.damageType}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{skill.castType}</Badge>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => duplicateMutation.mutate(skill.id)}>
                    <Copy className="w-3 h-3 mr-1" />Clone
                  </Button>
                  {skill.isPublished && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-green-500">
                      <Globe className="w-3 h-3 mr-1" />Live
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => archiveMutation.mutate(skill.id)}>
                    <Archive className="w-3 h-3 mr-1" />Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
