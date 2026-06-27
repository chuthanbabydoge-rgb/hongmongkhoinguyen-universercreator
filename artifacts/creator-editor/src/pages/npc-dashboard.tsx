import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Plus, Archive, Star, Clock, Layers, ChevronRight, Trash2, Play, Users, Shield } from "lucide-react";
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

function typeBadge(type: string) {
  const map: Record<string, string> = {
    humanoid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    creature: "bg-green-500/20 text-green-400 border-green-500/30",
    boss: "bg-red-500/20 text-red-400 border-red-500/30",
    merchant: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quest_giver: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    guard: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    enemy: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    companion: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return map[type] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

export default function NpcDashboard() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["/api/npc-editor/dashboard"],
    queryFn: () => apiFetch("/api/npc-editor/dashboard"),
    refetchInterval: 30000,
  });

  const createNpc = useMutation({
    mutationFn: (name: string) =>
      apiFetch("/api/npc-editor", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["/api/npc-editor/dashboard"] });
      nav(`/npc-editor/${n.id}`);
    },
  });

  const deleteNpc = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/npc-editor/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor/dashboard"] }),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createNpc.mutate(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const recent: any[] = dashboard?.recentNpcs ?? [];
  const published: any[] = dashboard?.published ?? [];
  const templates: any[] = dashboard?.templates ?? [];
  const totalCount: number = dashboard?.totalCount ?? 0;
  const draftsCount: number = dashboard?.drafts?.length ?? 0;
  const archivedCount: number = dashboard?.archived?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NPC Editor</h1>
          <p className="text-muted-foreground mt-1">Design and manage your game characters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav("/npc-browser")}>
            <Bot className="w-4 h-4 mr-2" /> Browse NPCs
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> New NPC
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
                placeholder="NPC name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              />
              <Button onClick={handleCreate} disabled={createNpc.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total NPCs", value: totalCount, icon: Bot, color: "text-blue-400" },
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
            <h2 className="text-lg font-semibold">Recent NPCs</h2>
            <Button variant="ghost" size="sm" onClick={() => nav("/npc-browser")}>
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
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No NPCs yet. Create your first character!</p>
                <Button className="mt-4" onClick={() => setCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create NPC
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recent.map((npc: any) => (
                <Card key={npc.id} className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => nav(`/npc-editor/${npc.id}`)}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{npc.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">Lv.{npc.level} · {npc.behavior}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border ${typeBadge(npc.npcType)}`}>{npc.npcType}</Badge>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => nav(`/npc-editor/${npc.id}`)}>
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteNpc.mutate(npc.id)}>
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
                <Card key={tpl.id} className="hover:border-primary/40 cursor-pointer transition-colors" onClick={() => nav("/npc-templates")}>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium text-sm">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{tpl.npcType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={() => nav("/npc-templates")}>
            <Layers className="w-4 h-4 mr-2" /> View All Templates
          </Button>
        </div>
      </div>

      {published.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Published NPCs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {published.slice(0, 4).map((npc: any) => (
              <Card key={npc.id} className="hover:border-emerald-500/40 cursor-pointer transition-colors" onClick={() => nav(`/npc-editor/${npc.id}`)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{npc.name}</p>
                      <p className="text-xs text-muted-foreground">Published · {npc.npcType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "NPC Browser", icon: Bot, href: "/npc-browser", desc: "Search & manage all NPCs" },
          { label: "Faction Manager", icon: Shield, href: "/npc-faction-manager", desc: "Define factions & alliances" },
          { label: "Import / Export", icon: Archive, href: "/npc-import-export", desc: "Backup & share NPC packs" },
        ].map((item) => (
          <Card key={item.href} className="hover:border-primary/40 cursor-pointer transition-colors" onClick={() => nav(item.href)}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
