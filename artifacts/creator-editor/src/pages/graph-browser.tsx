import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, GitBranch, Plus, Clock, Trash2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options?.headers } });

interface Graph { id: number; name: string; description?: string; type: string; updatedAt: string; isPublic: boolean; }

const GRAPH_TYPES = ["all", "event_graph", "function_graph", "macro_graph", "behavior_tree", "dialogue_graph", "quest_graph", "ai_graph", "timeline_graph", "custom"];

export default function GraphBrowser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery<{ items: Graph[]; total: number }>({
    queryKey: ["/api/graphs"],
    queryFn: () => apiFetch("/api/graphs").then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/graphs/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/graphs"] }); toast({ title: "Graph deleted" }); },
    onError: () => toast({ title: "Error deleting graph", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/graphs/${id}/duplicate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (g) => { qc.invalidateQueries({ queryKey: ["/api/graphs"] }); toast({ title: "Duplicated", description: g.name }); },
    onError: () => toast({ title: "Error duplicating", variant: "destructive" }),
  });

  const graphs = (data?.items ?? []).filter((g) => {
    const matchType = typeFilter === "all" || g.type === typeFilter;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Browser</h1>
          <p className="text-muted-foreground">Browse and manage all your graphs.</p>
        </div>
        <Link href="/visual-scripting">
          <Button><Plus className="h-4 w-4 mr-2" />New Graph</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search graphs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {GRAPH_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All types" : t.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : graphs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No graphs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {graphs.map((g) => (
            <Card key={g.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <GitBranch className="h-4 w-4 text-primary shrink-0" />
                    <Link href={`/graph-editor/${g.id}`}>
                      <p className="text-sm font-semibold truncate hover:text-primary cursor-pointer">{g.name}</p>
                    </Link>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{g.type.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{g.description || "No description"}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(g.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateMutation.mutate(g.id)} disabled={duplicateMutation.isPending} title="Duplicate">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(g.id)} disabled={deleteMutation.isPending} title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
