import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Layers, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Template = { id: number; templateName: string; description?: string; category?: string; useCount: number; tags?: string[] };

export default function SkillTemplates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/skills/templates"],
    queryFn: () => authFetch("/api/skills/templates?limit=50").then((r) => r.json()),
  });

  const importMutation = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      authFetch("/api/skills/import/template", { method: "POST", body: JSON.stringify({ templateId, name }) }).then((r) => r.json()),
    onSuccess: (res: { skillId: number }) => { queryClient.invalidateQueries({ queryKey: ["/api/skills"] }); setLocation(`/skill-editor/${res.skillId}`); },
    onError: () => toast({ title: "Error", description: "Failed to create from template", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skill Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">Start quickly from a community-built or saved template</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading…</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No templates yet. Publish a skill as a template from the skill editor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className={`cursor-pointer transition-colors ${selectedTemplate === t.id ? "border-primary" : "hover:border-primary/40"}`}
              onClick={() => setSelectedTemplate(t.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />{t.templateName}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{t.useCount} uses</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                {t.category && <Badge variant="secondary" className="text-xs capitalize">{t.category}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTemplate !== null && (
        <Card className="border-primary/50">
          <CardHeader><CardTitle className="text-sm">Create from Template</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <Input placeholder="New skill name…" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
            <Button onClick={() => { if (newName) importMutation.mutate({ templateId: selectedTemplate, name: newName }); }}
              disabled={!newName || importMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />Create
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
