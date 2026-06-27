import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatTemplates() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/combat"],
    queryFn: () => apiFetch("/api/combat?limit=50").then(r => r.json()),
  });

  const templates = (data?.items ?? []).filter((c: { isTemplate: boolean }) => c.isTemplate);

  const cloneTemplate = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/combat/${id}/duplicate`, { method: "POST" }).then(r => r.json()),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["/api/combat"] }); toast({ title: "Created from template" }); window.location.href = `${BASE}/combat-editor/${c.combat?.id ?? c.id}`; },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutTemplate className="w-6 h-6 text-red-400" />
        <div><h1 className="text-2xl font-bold">Combat Templates</h1><p className="text-muted-foreground">Reusable combat configurations</p></div>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !templates.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No templates yet. Mark a combat as template in its Settings tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t: { id: number; name: string; description: string; combatMode: string }) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t.name}</span>
                  <Badge variant="secondary">Template</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t.description || "No description"}</p>
                <p className="text-xs text-muted-foreground mb-4 capitalize">Mode: {t.combatMode?.replace(/_/g, " ")}</p>
                <Button size="sm" onClick={() => cloneTemplate.mutate(t.id)}>
                  <Copy className="w-4 h-4 mr-2" />Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
