import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Search, Plus, Trash2, Copy, GitBranch, Eye } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const TYPE_COLORS: Record<string, string> = {
  humanoid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  creature: "bg-green-500/20 text-green-400 border-green-500/30",
  boss: "bg-red-500/20 text-red-400 border-red-500/30",
  merchant: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quest_giver: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  guard: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  enemy: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  companion: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function NpcBrowser() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: npcs = [], isLoading } = useQuery({
    queryKey: ["/api/npc-editor"],
    queryFn: () => apiFetch("/api/npc-editor?limit=100"),
  });

  const deleteNpc = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/npc-editor/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor"] }),
  });

  const duplicateNpc = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/npc-editor/${id}/duplicate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor"] }),
  });

  const filtered = (npcs as any[]).filter((n) =>
    !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.npcType.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NPC Browser</h1>
          <p className="text-muted-foreground mt-1">{(npcs as any[]).length} characters total</p>
        </div>
        <Button onClick={() => nav("/npc-dashboard")}><Plus className="w-4 h-4 mr-2" /> New NPC</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search NPCs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Bot className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No NPCs found</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((npc: any) => (
            <Card key={npc.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{npc.name}</p>
                      <p className="text-xs text-muted-foreground">Lv.{npc.level} · {npc.behavior}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs border ${TYPE_COLORS[npc.npcType] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>{npc.npcType}</Badge>
                </div>
                {npc.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{npc.description}</p>}
                <div className="flex gap-1 mt-2">
                  <Button size="sm" className="flex-1 h-7" onClick={() => nav(`/npc-editor/${npc.id}`)}>
                    <Eye className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateNpc.mutate(npc.id)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteNpc.mutate(npc.id)}>
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
