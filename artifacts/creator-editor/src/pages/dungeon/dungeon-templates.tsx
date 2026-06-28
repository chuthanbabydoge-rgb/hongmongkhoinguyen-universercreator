import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface DungeonTemplate { id: number; name: string; description: string | null; category: string; usageCount: number; }

export default function DungeonTemplates() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: global, isLoading: gLoad } = useQuery<DungeonTemplate[]>({
    queryKey: ["/api/dungeons/templates/global"],
    queryFn: async () => { const r = await apiFetch("/api/dungeons/templates/global"); return r.json(); },
  });

  const { data: my, isLoading: mLoad } = useQuery<DungeonTemplate[]>({
    queryKey: ["/api/dungeons/templates/my"],
    queryFn: async () => { const r = await apiFetch("/api/dungeons/templates/my"); return r.json(); },
  });

  const useMut = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/dungeons", { method: "POST", body: JSON.stringify({ name: "From Template", isTemplate: false }) });
      return r.json();
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["/api/dungeons"] }); toast({ title: "Dungeon created from template" }); window.location.href = `${BASE}/dungeon-editor/${d.id}`; },
    onError: () => toast({ title: "Error", description: "Failed to create from template", variant: "destructive" }),
  });

  function TemplateCard({ t }: { t: DungeonTemplate }) {
    return (
      <Card className="hover:bg-muted/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="font-semibold text-sm truncate">{t.name}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{t.description ?? "No description"}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{t.category}</Badge>
                <span className="text-xs text-muted-foreground">{t.usageCount} uses</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => useMut.mutate()} disabled={useMut.isPending}>
              <Plus className="w-3 h-3 mr-1" />Use
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dungeon Templates</h1>
        <p className="text-muted-foreground">Start from a pre-built dungeon template</p>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Global Templates</h2>
        {gLoad ? <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          : (global ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No global templates available.</p>
          : <div className="grid gap-3">{global!.map((t) => <TemplateCard key={t.id} t={t} />)}</div>
        }
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">My Templates</h2>
        {mLoad ? <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          : (my ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No personal templates yet. Save a dungeon as a template from the editor.</p>
          : <div className="grid gap-3">{my!.map((t) => <TemplateCard key={t.id} t={t} />)}</div>
        }
      </div>
    </div>
  );
}
