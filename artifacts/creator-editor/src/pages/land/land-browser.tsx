import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Map, Plus, Search, Trash2, Copy, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function LandBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/lands", search],
    queryFn: async () => {
      const url = `${BASE}/api/lands?limit=50&offset=0${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url, { headers: auth() });
      if (!res.ok) throw new Error("Failed to load lands");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "New Land", landType: "residential" }) });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: (land) => { qc.invalidateQueries({ queryKey: ["/api/lands"] }); toast({ title: "Land created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/lands/${id}`, { method: "DELETE", headers: auth() });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/lands"] }); toast({ title: "Deleted" }); },
  });

  const dupMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/lands/${id}/duplicate`, { method: "POST", headers: auth() });
      if (!res.ok) throw new Error("Duplicate failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/lands"] }); toast({ title: "Duplicated" }); },
  });

  const lands = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> Land Browser</h1>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />New Land</Button>
      </div>

      <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input placeholder="Search lands…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : lands.length === 0
          ? <Card><CardContent className="py-12 text-center text-muted-foreground">No lands found. Create your first one!</CardContent></Card>
          : <div className="grid gap-3">
            {lands.map((l) => (
              <Card key={String(l.id)} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className="font-medium">{String(l.name)}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{String(l.landType)}</Badge>
                        <Badge variant="secondary">{String(l.landStatus)}</Badge>
                        <Badge variant="outline">{String(l.terrainType)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/land-editor/${l.id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                    <Button variant="ghost" size="sm" onClick={() => dupMut.mutate(Number(l.id))}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate(Number(l.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}
    </div>
  );
}
