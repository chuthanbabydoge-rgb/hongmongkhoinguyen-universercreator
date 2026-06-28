import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { History, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token()}` } });

export default function BuildingHistory() {
  const { id } = useParams<{ id: string }>();

  const { data: history = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/history`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/history`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: versions = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/versions`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/versions`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const ACTION_COLORS: Record<string, string> = {
    created: "default",
    updated: "secondary",
    deleted: "destructive",
    published: "default",
    archived: "outline",
    restored: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><History className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Building History</h1></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="w-4 h-4" />Versions ({versions.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {versions.map((v: Record<string, unknown>) => (
              <div key={String(v.id)} className="flex items-center justify-between p-2 border rounded text-sm">
                <div><span className="font-mono">v{String(v.version)}</span> {v.label && <span className="text-muted-foreground">— {String(v.label)}</span>}</div>
                <div className="text-xs text-muted-foreground">{new Date(String(v.createdAt)).toLocaleDateString()}</div>
              </div>
            ))}
            {versions.length === 0 && <div className="text-muted-foreground text-sm">No versions yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activity Log ({history.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? <div className="text-muted-foreground">Loading...</div> : history.map((h: Record<string, unknown>) => (
              <div key={String(h.id)} className="flex items-center justify-between p-2 border rounded text-sm">
                <Badge variant={(ACTION_COLORS[String(h.action)] ?? "outline") as "default" | "secondary" | "destructive" | "outline"}>{String(h.action)}</Badge>
                <div className="text-xs text-muted-foreground">{new Date(String(h.createdAt)).toLocaleString()}</div>
              </div>
            ))}
            {history.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No activity yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
