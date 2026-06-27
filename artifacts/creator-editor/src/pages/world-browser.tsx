import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Globe, Search, Plus, Trash2, Copy, GitBranch, Play, Archive, Star,
  Filter,
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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  archived: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function WorldBrowser() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: worlds = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/world-editor"],
    queryFn: () => apiFetch("/api/world-editor?limit=100"),
  });

  const deleteWorld = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/world-editor/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor"] }),
  });

  const duplicateWorld = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/world-editor/${id}/duplicate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor"] }),
  });

  const archiveWorld = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/world-editor/${id}/archive`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor"] }),
  });

  const filtered = worlds.filter((w: any) => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", "draft", "active", "published", "archived"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">World Browser</h1>
          <p className="text-muted-foreground mt-1">{worlds.length} world{worlds.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => nav("/world-editor-dashboard")}>
          <Plus className="w-4 h-4 mr-2" /> New World
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search worlds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "secondary" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              {search || filterStatus !== "all" ? "No worlds match your filters" : "No worlds yet"}
            </p>
            {!search && filterStatus === "all" && (
              <Button className="mt-4" onClick={() => nav("/world-editor-dashboard")}>
                <Plus className="w-4 h-4 mr-2" /> Create First World
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((world: any) => (
            <Card
              key={world.id}
              className="hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => nav(`/world-editor/${world.id}`)}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm leading-tight">{world.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{world.worldType}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs border ${STATUS_COLORS[world.status] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                    {world.status}
                  </Badge>
                </div>
                {world.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{world.description}</p>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span className="capitalize">{world.environment}</span>
                  <span>·</span>
                  <span>v{world.version}</span>
                </div>
                <div
                  className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Open Editor" onClick={() => nav(`/world-editor/${world.id}`)}>
                    <Play className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate" onClick={() => duplicateWorld.mutate(world.id)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Archive" onClick={() => archiveWorld.mutate(world.id)}>
                    <Archive className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title="Delete"
                    onClick={() => deleteWorld.mutate(world.id)}
                  >
                    <Trash2 className="w-3 h-3" />
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
