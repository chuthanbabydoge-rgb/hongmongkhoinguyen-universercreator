import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Search, Plus, Star } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WorldTemplates() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: templates = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/world-editor/templates"],
    queryFn: () => apiFetch("/api/world-editor/templates?limit=50"),
  });

  const importFromTemplate = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      apiFetch("/api/world-editor/import/template", {
        method: "POST",
        body: JSON.stringify({ templateId, name }),
      }),
    onSuccess: (w) => {
      qc.invalidateQueries({ queryKey: ["/api/world-editor"] });
      nav(`/world-editor/${w.id}`);
    },
  });

  const filtered = templates.filter((t: any) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_COLORS: Record<string, string> = {
    fantasy: "text-purple-400",
    sci_fi: "text-cyan-400",
    modern: "text-blue-400",
    historical: "text-amber-400",
    post_apocalyptic: "text-orange-400",
    underwater: "text-teal-400",
    space: "text-indigo-400",
    custom: "text-zinc-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">World Templates</h1>
          <p className="text-muted-foreground mt-1">Start from a pre-built world template</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No templates available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Publish a world as a template to see it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tpl: any) => (
            <Card key={tpl.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{tpl.name}</p>
                    <p className={`text-xs font-medium capitalize mt-0.5 ${TYPE_COLORS[tpl.worldType] ?? "text-zinc-400"}`}>
                      {tpl.worldType?.replace("_", " ")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tpl.useCount} uses
                  </Badge>
                </div>
                {tpl.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{tpl.description}</p>
                )}
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    const name = prompt(`World name from template "${tpl.name}":`, tpl.name);
                    if (name) importFromTemplate.mutate({ templateId: tpl.id, name });
                  }}
                  disabled={importFromTemplate.isPending}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
