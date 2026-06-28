import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, Search, Trash2, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/cities", search],
    queryFn: async () => {
      const url = new URL(`${BASE}/api/cities`, window.location.href);
      if (search) url.searchParams.set("search", search);
      const res = await fetch(url.toString(), { headers: headers() });
      if (!res.ok) throw new Error("Failed to load cities");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "New City", cityType: "city" }) });
      if (!res.ok) throw new Error("Failed to create city");
      return res.json();
    },
    onSuccess: (city) => { qc.invalidateQueries({ queryKey: ["/api/cities"] }); toast({ title: "City created" }); window.location.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/city-editor/${city.id}`; },
    onError: () => toast({ title: "Error", description: "Failed to create city", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete city");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cities"] }); toast({ title: "City deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete city", variant: "destructive" }),
  });

  const dupMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${id}/duplicate`, { method: "POST", headers: headers() });
      if (!res.ok) throw new Error("Failed to duplicate city");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cities"] }); toast({ title: "City duplicated" }); },
    onError: () => toast({ title: "Error", description: "Failed to duplicate city", variant: "destructive" }),
  });

  const publishMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/${id}/publish`, { method: "POST", headers: headers() });
      if (!res.ok) throw new Error("Failed to publish city");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/cities"] }); toast({ title: "City published" }); },
    onError: () => toast({ title: "Error", description: "Failed to publish city", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-blue-500" /> City Browser</h1>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}><Plus className="w-4 h-4 mr-2" />New City</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (data?.items ?? []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No cities found. Create your first city to get started.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {(data?.items ?? []).map((city: Record<string, unknown>) => (
            <Card key={String(city.id)} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{String(city.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {String(city.cityType).replace(/_/g, " ")} • Pop: {String(city.population ?? 0)} • Prosperity: {String(city.prosperity ?? 0)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={city.isPublished ? "default" : "secondary"}>{city.isPublished ? "Published" : "Draft"}</Badge>
                  <Link href={`/city-editor/${city.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                  {!city.isPublished && (
                    <Button size="sm" variant="outline" onClick={() => publishMut.mutate(Number(city.id))} disabled={publishMut.isPending}>
                      <Globe className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => dupMut.mutate(Number(city.id))} disabled={dupMut.isPending}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(city.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(data?.total ?? 0) > 0 && (
        <div className="text-sm text-muted-foreground text-right">Showing {data?.items.length} of {data?.total} cities</div>
      )}
    </div>
  );
}
