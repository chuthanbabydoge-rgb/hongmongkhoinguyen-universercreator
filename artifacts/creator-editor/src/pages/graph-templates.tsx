import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options?.headers } });

interface GraphTemplate { id: number; name: string; description?: string; type: string; category?: string; tags: string[]; usageCount: number; }

const FALLBACK_TEMPLATES = [
  { id: -1, name: "Simple Event Graph", description: "Start → Logic → End flow", type: "event_graph", category: "Starter", tags: ["beginner"], usageCount: 0 },
  { id: -2, name: "Behavior Tree", description: "AI behavior tree with branches", type: "behavior_tree", category: "AI", tags: ["ai", "npc"], usageCount: 0 },
  { id: -3, name: "Dialogue Flow", description: "NPC dialogue branching system", type: "dialogue_graph", category: "Narrative", tags: ["dialogue", "npc"], usageCount: 0 },
  { id: -4, name: "Quest Graph", description: "Quest objectives and completion", type: "quest_graph", category: "Quests", tags: ["quest"], usageCount: 0 },
];

export default function GraphTemplates() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: GraphTemplate[] }>({
    queryKey: ["/api/graphs/templates"],
    queryFn: () => apiFetch("/api/graphs/templates").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (tpl: Pick<GraphTemplate, "name" | "type">) =>
      apiFetch("/api/graphs", { method: "POST", body: JSON.stringify({ name: `${tpl.name} (from template)`, type: tpl.type }) }).then((r) => r.json()),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["/api/graphs"] });
      toast({ title: "Graph created from template", description: g.name });
    },
    onError: () => toast({ title: "Failed to create", variant: "destructive" }),
  });

  const templates = (data?.items?.length ?? 0) > 0 ? (data!.items) : FALLBACK_TEMPLATES;
  const categories = [...new Set(templates.map((t) => t.category ?? "General"))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Graph Templates</h1>
        <p className="text-muted-foreground">Start from a pre-built template.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="text-lg font-semibold mb-3">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {templates.filter((t) => (t.category ?? "General") === cat).map((tpl) => (
                  <Card key={tpl.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{tpl.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{tpl.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-[10px]">{tpl.type.replace(/_/g, " ")}</Badge>
                        {tpl.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{tpl.usageCount} uses</span>
                        <Button size="sm" onClick={() => createMutation.mutate({ name: tpl.name, type: tpl.type })} disabled={createMutation.isPending}>
                          <Plus className="h-3 w-3 mr-1" />Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
