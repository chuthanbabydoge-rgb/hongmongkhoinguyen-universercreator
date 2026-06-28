import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { History, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

export default function CityHistory() {
  const [, params] = useRoute("/city-history/:id");
  const cityId = Number(params?.id);

  const { data: history = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/history`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/history`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    },
    enabled: !!cityId,
  });

  const { data: versions = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${cityId}/versions`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/versions`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load versions");
      return res.json();
    },
    enabled: !!cityId,
  });

  const actionColor = (action: string) => {
    if (action === "created") return "default";
    if (action === "deleted") return "destructive";
    if (action === "published") return "default";
    if (action === "archived") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <History className="w-6 h-6 text-slate-400" />
        <h1 className="text-xl font-bold">City History</h1>
      </div>

      {versions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Snapshots</h2>
          <div className="flex gap-2 flex-wrap">
            {versions.map((v: Record<string, unknown>) => (
              <Badge key={String(v.id)} variant="outline" className="text-xs">
                {String(v.label ?? `v${v.version}`)} — {new Date(String(v.createdAt)).toLocaleDateString()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Change Log</h2>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : history.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No history yet.</CardContent></Card>
        ) : (
          <div className="space-y-1">
            {history.map((h: Record<string, unknown>) => (
              <Card key={String(h.id)}>
                <CardContent className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={actionColor(String(h.action))} className="text-xs capitalize">{String(h.action)}</Badge>
                    {h.field && <span className="text-sm text-muted-foreground">{String(h.field)}</span>}
                    {h.newValue && <span className="text-sm font-mono text-xs bg-muted px-1 rounded">{String(h.newValue).slice(0, 40)}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(String(h.createdAt)).toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
