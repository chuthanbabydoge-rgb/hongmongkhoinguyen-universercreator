import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Layers, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Template = { id: number; templateName: string; category: string; useCount: number; isPublic: boolean; createdAt: string };

export default function ItemTemplates() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/item-editor/templates"],
    queryFn: () => authFetch("/api/item-editor/templates?limit=100").then((r) => r.json()),
  });

  const importMutation = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      authFetch("/api/item-editor/import/template", { method: "POST", body: JSON.stringify({ templateId, name }) }).then((r) => r.json()),
    onSuccess: (res: { item: { id: number } }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/item-editor"] });
      setLocation(`/item-editor/${res.item?.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to use template", variant: "destructive" }),
  });

  const filtered = templates.filter((t) => t.templateName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Item Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">Start from a pre-built item configuration</p></div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "No templates match." : "No templates yet. Save an item as a template to start."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <Card key={tpl.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{tpl.templateName}</CardTitle>
                  {tpl.isPublic && <Badge variant="outline" className="text-xs">Public</Badge>}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{tpl.category} · Used {tpl.useCount}×</p>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full" onClick={() => importMutation.mutate({ templateId: tpl.id, name: `${tpl.templateName} Copy` })}>
                  <Plus className="w-3 h-3 mr-1" />Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
