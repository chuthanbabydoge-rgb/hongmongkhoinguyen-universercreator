import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GitBranch, Play, Clock, Code2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options?.headers },
  });

interface Graph {
  id: number;
  name: string;
  description?: string;
  type: string;
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
}

const GRAPH_TYPES = [
  "event_graph", "function_graph", "macro_graph", "behavior_tree",
  "dialogue_graph", "quest_graph", "ai_graph", "timeline_graph", "custom",
];

export default function VisualScriptDashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "event_graph" });

  const { data, isLoading } = useQuery<{ items: Graph[]; total: number }>({
    queryKey: ["/api/graphs"],
    queryFn: () => apiFetch("/api/graphs").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => apiFetch("/api/graphs", { method: "POST", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (graph) => {
      qc.invalidateQueries({ queryKey: ["/api/graphs"] });
      setCreating(false);
      setForm({ name: "", description: "", type: "event_graph" });
      toast({ title: "Graph created", description: graph.name });
    },
    onError: () => toast({ title: "Error", description: "Failed to create graph", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/graphs/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/graphs"] }); toast({ title: "Graph deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete graph", variant: "destructive" }),
  });

  const graphs = data?.items ?? [];
  const total = data?.total ?? 0;
  const recentExecutions = graphs.filter((g) => g.type).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visual Scripting</h1>
          <p className="text-muted-foreground">Build event graphs, behavior trees, dialogue flows and more.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />New Graph
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<GitBranch className="h-5 w-5 text-primary" />} label="Total Graphs" value={total} />
        <StatCard icon={<Play className="h-5 w-5 text-green-400" />} label="Recent Executions" value={recentExecutions.length} />
        <StatCard icon={<Code2 className="h-5 w-5 text-cyan-400" />} label="Graph Types" value={new Set(graphs.map((g) => g.type)).size} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Graphs</h2>
            <Link href="/graph-browser">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : graphs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                <GitBranch className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">No graphs yet. Create your first one!</p>
                <Button className="mt-3" size="sm" onClick={() => setCreating(true)}>
                  <Plus className="h-3 w-3 mr-1" />Create Graph
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {graphs.slice(0, 8).map((g) => (
                <Card key={g.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center gap-4 py-3">
                    <GitBranch className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/graph-editor/${g.id}`}>
                        <p className="text-sm font-medium hover:text-primary truncate cursor-pointer">{g.name}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{g.description || "No description"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{g.type.replace(/_/g, " ")}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(g.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/graph-editor/${g.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Play className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(g.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/graph-browser">
              <Button variant="outline" className="w-full justify-start gap-2">
                <GitBranch className="h-4 w-4" />Graph Browser
              </Button>
            </Link>
            <Link href="/graph-templates">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Code2 className="h-4 w-4" />Templates
              </Button>
            </Link>
            <Link href="/macro-library">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Code2 className="h-4 w-4" />Macro Library
              </Button>
            </Link>
            <Link href="/execution-console">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Play className="h-4 w-4" />Execution Console
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Compiler Status</CardTitle>
              <CardDescription className="text-xs">Last compile results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground">Compiler ready</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Graph</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1" placeholder="My Graph" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input className="mt-1" placeholder="Optional description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRAPH_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
