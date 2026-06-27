import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookOpen, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Template = { id: number; name: string; description: string | null; questType: string; tags: string[]; isOfficial: boolean };

export default function QuestTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/quest-editor/templates"],
    queryFn: () => authFetch("/api/quest-editor/templates").then(r => r.json()),
  });

  const importMutation = useMutation({
    mutationFn: (templateId: number) => authFetch("/api/quest-editor/import/template", { method: "POST", body: JSON.stringify({ templateId, name: "Quest from Template" }) }).then(r => r.json()),
    onSuccess: (q: { id: number }) => { queryClient.invalidateQueries({ queryKey: ["/api/quest-editor"] }); setLocation(`/quest-editor/${q.id}`); },
    onError: () => toast({ title: "Error", description: "Failed to create from template", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quest Templates</h1><p className="text-muted-foreground text-sm">Start from a pre-built template</p></div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading templates...</div>
      ) : !templates.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No templates available yet.</p>
          <p className="text-sm mt-1">Save a quest as a template to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  {t.isOfficial && <Badge className="text-xs">Official</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">{t.questType}</Badge>
                  {t.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
                <Button size="sm" className="w-full" onClick={() => importMutation.mutate(t.id)} disabled={importMutation.isPending}>
                  <Download className="w-3 h-3 mr-1" />Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
