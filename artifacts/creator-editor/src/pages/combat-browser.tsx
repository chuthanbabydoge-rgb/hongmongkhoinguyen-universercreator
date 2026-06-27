import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Swords, Plus, Search, Copy, Archive, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatBrowser() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/combat", search],
    queryFn: () => apiFetch(`/api/combat?search=${encodeURIComponent(search)}&limit=50`).then(r => r.json()),
  });

  const createCombat = useMutation({
    mutationFn: () => apiFetch("/api/combat", { method: "POST", body: JSON.stringify({ name: "New Combat" }) }).then(r => r.json()),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); window.location.href = `${BASE}/combat-editor/${c.id}`; },
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/combat/${id}/duplicate`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); toast({ title: "Combat duplicated" }); },
  });

  const archive = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/combat/${id}/archive`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); toast({ title: "Combat archived" }); },
  });

  const restore = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/combat/${id}/restore`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); toast({ title: "Combat restored" }); },
  });

  const deleteCombat = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/combat/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); toast({ title: "Combat deleted" }); },
  });

  const combats: Array<{ id: number; name: string; description: string; combatMode: string; isPublished: boolean; isArchived: boolean; updatedAt: string }> = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-red-400" />Combat Browser</h1>
        <Button onClick={() => createCombat.mutate()} disabled={createCombat.isPending}><Plus className="w-4 h-4 mr-2" />New Combat</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search combats…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !combats.length ? (
        <div className="text-center py-16 text-muted-foreground"><Swords className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No combats found.</p></div>
      ) : (
        <div className="grid gap-3">
          {combats.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <Link href={`/combat-editor/${c.id}`}>
                  <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.name}</p>
                      {c.isPublished && <Badge variant="default" className="text-xs">Published</Badge>}
                      {c.isArchived && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description || <span className="italic opacity-50">No description</span>} · {c.combatMode?.replace(/_/g, " ")}</p>
                  </div>
                </Link>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => duplicate.mutate(c.id)} title="Duplicate"><Copy className="w-4 h-4" /></Button>
                  {c.isArchived
                    ? <Button size="icon" variant="ghost" onClick={() => restore.mutate(c.id)} title="Restore"><RotateCcw className="w-4 h-4" /></Button>
                    : <Button size="icon" variant="ghost" onClick={() => archive.mutate(c.id)} title="Archive"><Archive className="w-4 h-4" /></Button>}
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCombat.mutate(c.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
