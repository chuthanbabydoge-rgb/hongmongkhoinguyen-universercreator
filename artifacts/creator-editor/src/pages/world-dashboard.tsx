import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe, Plus, Archive, Play, Star, Clock, Layers, Users,
  ChevronRight, Trash2, Copy, GitBranch, Upload,
} from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    archived: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    deprecated: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[status] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export default function WorldDashboard() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["/api/world-editor/dashboard"],
    queryFn: () => apiFetch("/api/world-editor/dashboard"),
    refetchInterval: 30000,
  });

  const createWorld = useMutation({
    mutationFn: (name: string) =>
      apiFetch("/api/world-editor", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: (w) => {
      qc.invalidateQueries({ queryKey: ["/api/world-editor/dashboard"] });
      nav(`/world-editor/${w.id}`);
    },
  });

  const deleteWorld = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/world-editor/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor/dashboard"] }),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorld.mutate(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const recent: any[] = dashboard?.recentWorlds ?? [];
  const published: any[] = dashboard?.published ?? [];
  const templates: any[] = dashboard?.templates ?? [];
  const totalCount: number = dashboard?.totalCount ?? 0;
  const draftsCount: number = dashboard?.drafts?.length ?? 0;
  const archivedCount: number = dashboard?.archived?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">World Editor</h1>
          <p className="text-muted-foreground mt-1">Create and manage your game worlds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav("/world-browser")}>
            <Globe className="w-4 h-4 mr-2" /> Browse Worlds
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> New World
          </Button>
        </div>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center">
              <input
                autoFocus
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="World name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              />
              <Button onClick={handleCreate} disabled={createWorld.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Worlds", value: totalCount, icon: Globe, color: "text-blue-400" },
          { label: "Published", value: published.length, icon: Star, color: "text-emerald-400" },
          { label: "Drafts", value: draftsCount, icon: Clock, color: "text-yellow-400" },
          { label: "Archived", value: archivedCount, icon: Archive, color: "text-orange-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "…" : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Worlds</h2>
            <Button variant="ghost" size="sm" onClick={() => nav("/world-browser")}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
            ))}</div>
          ) : recent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No worlds yet. Create your first world!</p>
                <Button className="mt-4" onClick={() => setCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create World
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recent.map((world: any) => (
                <Card key={world.id} className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => nav(`/world-editor/${world.id}`)}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{world.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{world.worldType} · {world.environment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border ${statusBadge(world.status)}`}>{world.status}</Badge>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => nav(`/world-editor/${world.id}`)}>
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteWorld.mutate(world.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Templates</h2>
          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Layers className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No templates yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {templates.map((tpl: any) => (
                <Card key={tpl.id} className="hover:border-primary/40 cursor-pointer transition-colors" onClick={() => nav("/world-templates")}>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium text-sm">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{tpl.worldType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={() => nav("/world-templates")}>
            <Layers className="w-4 h-4 mr-2" /> View All Templates
          </Button>
        </div>
      </div>

      {published.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Published Worlds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {published.slice(0, 4).map((world: any) => (
              <Card key={world.id} className="hover:border-emerald-500/40 cursor-pointer transition-colors" onClick={() => nav(`/world-editor/${world.id}`)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{world.name}</p>
                      <p className="text-xs text-muted-foreground">Published · {world.worldType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
