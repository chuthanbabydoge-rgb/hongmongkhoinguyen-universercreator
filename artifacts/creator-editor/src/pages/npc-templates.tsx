import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Layers, Plus, Bot, Search } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NpcTemplates() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [importId, setImportId] = useState("");
  const [importName, setImportName] = useState("");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/npc-editor/templates"],
    queryFn: () => apiFetch("/api/npc-editor/templates?limit=50"),
  });

  const useTemplate = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      apiFetch("/api/npc-editor/import/template", { method: "POST", body: JSON.stringify({ templateId, name }) }),
    onSuccess: (n: any) => { qc.invalidateQueries({ queryKey: ["/api/npc-editor"] }); nav(`/npc-editor/${n.id}`); },
  });

  const filtered = (templates as any[]).filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NPC Templates</h1>
          <p className="text-muted-foreground mt-1">Reusable NPC blueprints</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No templates yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Export an NPC as a template to create one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl: any) => (
            <Card key={tpl.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground">Used {tpl.useCount}×</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{tpl.npcType}</Badge>
                </div>
                {tpl.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{tpl.description}</p>}
                <Button size="sm" className="w-full h-7" onClick={() => {
                  const name = prompt("New NPC name:", tpl.name);
                  if (name) useTemplate.mutate({ templateId: tpl.id, name });
                }}>
                  <Bot className="w-3 h-3 mr-1" /> Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
