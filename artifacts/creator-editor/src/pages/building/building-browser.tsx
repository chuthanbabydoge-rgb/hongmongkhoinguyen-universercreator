import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, Search, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function BuildingBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/buildings", search],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings?limit=50&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings`, { method: "POST", body: JSON.stringify({ name: "New Building", buildingType: "house" }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/buildings"] }); toast({ title: "Building created" }); },
    onError: () => toast({ title: "Error", description: "Failed to create building", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/buildings"] }); toast({ title: "Deleted" }); },
  });

  const dupMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/buildings"] }); toast({ title: "Duplicated" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-orange-500" /> Building Browser</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />New Building</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search buildings..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.items ?? []).map((b: Record<string, unknown>) => (
            <Card key={String(b.id)} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{String(b.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{String(b.buildingType).replace("_", " ")} — {String(b.buildingCategory)}</div>
                  </div>
                  <Badge variant={b.isPublished ? "default" : "secondary"}>{b.isPublished ? "Published" : "Draft"}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{String(b.floorCount ?? 1)} floor(s) • {String(b.maxOccupancy ?? 10)} max occupancy</div>
                <div className="flex gap-2">
                  <Link href={`/building-editor/${b.id}`} className="flex-1">
                    <Button size="sm" className="w-full" variant="outline"><Eye className="w-3 h-3 mr-1" />Edit</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => dupMutation.mutate(Number(b.id))}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(b.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(data?.items ?? []).length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">No buildings found. Create your first one!</div>
          )}
        </div>
      )}
    </div>
  );
}
