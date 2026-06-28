import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, Plus, Search, Trash2, Copy, Archive, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldSystemBrowser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "New World Instance", createdBy: 1 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system"] }); toast({ title: "World created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/world-system/${id}/duplicate`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system"] }); toast({ title: "Duplicated" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/world-system/${id}/archive`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system"] }); toast({ title: "Archived" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const filtered = (data?.items ?? []).filter(w => {
    const matchesSearch = !search || String(w.name).toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || w.runtimeState === stateFilter;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6 text-blue-500" />World Browser</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />New World</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search worlds..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No worlds found.</CardContent></Card>
          ) : filtered.map(w => (
            <Card key={String(w.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(w.name)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{String(w.description ?? "No description")} · v{String(w.version)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{String(w.runtimeState)}</Badge>
                  <Badge variant="outline" className="capitalize">{String(w.streamMode)}</Badge>
                  <Link href={`/world-runtime/${w.id}`}><Button size="sm" variant="ghost"><Play className="w-3 h-3" /></Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => duplicateMutation.mutate(Number(w.id))}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Archive this world?")) archiveMutation.mutate(Number(w.id)); }}><Archive className="w-3 h-3 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
