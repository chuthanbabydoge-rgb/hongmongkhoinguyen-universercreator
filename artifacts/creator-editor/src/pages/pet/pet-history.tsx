import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const ACTION_COLORS: Record<string, string> = { created: "default", updated: "secondary", published: "default", archived: "destructive", restored: "outline", duplicated: "secondary", forked: "secondary", evolved: "default" };

export default function PetHistory() {
  const [, params] = useRoute("/pet-history/:id");
  const id = Number(params?.id);

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/history`], queryFn: () => apiFetch(`/api/pets/${id}/history`).then(r => r.json()), enabled: !!id });
  const { data: versions } = useQuery({ queryKey: [`/api/pets/${id}/versions`], queryFn: () => apiFetch(`/api/pets/${id}/versions`).then(r => r.json()), enabled: !!id });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">History — Pet #{id}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Versions ({versions?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {!versions?.length ? <p className="text-muted-foreground text-sm">No versions saved</p> : (
            <div className="space-y-2">
              {versions.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-2 border rounded">
                  <div><span className="font-medium">v{v.version}</span>{v.changelog && <span className="ml-2 text-xs text-muted-foreground">{v.changelog}</span>}</div>
                  <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Activity Log ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2">{[...Array(5)].map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : !data?.length ? <p className="text-muted-foreground text-sm">No history</p>
          : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={(ACTION_COLORS[h.action] ?? "secondary") as any}>{h.action}</Badge>
                    {h.detail && <span className="text-xs text-muted-foreground">{h.detail}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
