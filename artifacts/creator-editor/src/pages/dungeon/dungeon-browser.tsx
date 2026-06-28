import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Copy, Archive, Globe } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Dungeon { id: number; name: string; description: string | null; dungeonType: string; difficulty: string; status: string; isPublished: boolean; isArchived: boolean; isTemplate: boolean; }

export default function DungeonBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/dungeons", search],
    queryFn: async () => { const r = await apiFetch(`/api/dungeons?search=${encodeURIComponent(search)}&limit=50`); return r.json(); },
  });

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch("/api/dungeons", { method: "POST", body: JSON.stringify({ name: "New Dungeon" }) }); return r.json(); },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["/api/dungeons"] }); window.location.href = `${BASE}/dungeon-editor/${d.id}`; },
    onError: () => toast({ title: "Error", description: "Failed to create dungeon", variant: "destructive" }),
  });

  const dupMut = useMutation({
    mutationFn: async (id: number) => { const r = await apiFetch(`/api/dungeons/${id}/duplicate`, { method: "POST" }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons"] }); toast({ title: "Dungeon duplicated" }); },
    onError: () => toast({ title: "Error", description: "Failed to duplicate", variant: "destructive" }),
  });

  const archiveMut = useMutation({
    mutationFn: async (id: number) => { const r = await apiFetch(`/api/dungeons/${id}/archive`, { method: "POST" }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons"] }); toast({ title: "Archived" }); },
    onError: () => toast({ title: "Error", description: "Failed to archive", variant: "destructive" }),
  });

  const dungeons: Dungeon[] = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dungeon Browser</h1>
          <p className="text-muted-foreground">Browse and manage your dungeons</p>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />New Dungeon</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search dungeons…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : dungeons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No dungeons found. Create your first dungeon!</div>
      ) : (
        <div className="grid gap-3">
          {dungeons.map((d) => (
            <Card key={d.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <Link href={`/dungeon-editor/${d.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{d.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{d.description ?? "No description"}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Badge variant="outline" className="capitalize text-xs">{d.difficulty}</Badge>
                  <Badge variant="outline" className="capitalize text-xs">{d.dungeonType}</Badge>
                  {d.isPublished && <Badge className="text-xs">Published</Badge>}
                  {d.isTemplate && <Badge variant="secondary" className="text-xs">Template</Badge>}
                  <Button size="icon" variant="ghost" onClick={() => dupMut.mutate(d.id)}><Copy className="w-3 h-3" /></Button>
                  {!d.isArchived && <Button size="icon" variant="ghost" onClick={() => archiveMut.mutate(d.id)}><Archive className="w-3 h-3" /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
