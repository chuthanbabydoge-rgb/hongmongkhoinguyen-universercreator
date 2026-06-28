import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Copy } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/pets", search],
    queryFn: () => apiFetch(`/api/pets?search=${encodeURIComponent(search)}`).then(r => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/pets/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/pets"] }); toast({ title: "Pet deleted" }); },
  });

  const dupMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/pets/${id}/duplicate`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/pets"] }); toast({ title: "Pet duplicated" }); },
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/pets", { method: "POST", body: JSON.stringify({ name: "New Pet" }) }).then(r => r.json()),
    onSuccess: (p) => { qc.invalidateQueries({ queryKey: ["/api/pets"] }); window.location.href = `${BASE}/pet-editor/${p.id}`; },
  });

  const rarityColor: Record<string, string> = { common: "secondary", uncommon: "outline", rare: "default", epic: "default", legendary: "default", mythic: "destructive" };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pet Browser</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" /> New Pet
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search pets..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !data?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No pets found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {data.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{p.petType}</Badge>
                      <Badge variant={(rarityColor[p.rarity] ?? "secondary") as any}>{p.rarity}</Badge>
                      <span className="text-xs text-muted-foreground">Lv. {p.level}</span>
                      {p.isPublished && <Badge>Published</Badge>}
                      {p.isArchived && <Badge variant="secondary">Archived</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => dupMutation.mutate(p.id)}><Copy className="w-4 h-4" /></Button>
                  <Link href={`/pet-editor/${p.id}`}><Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button></Link>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
