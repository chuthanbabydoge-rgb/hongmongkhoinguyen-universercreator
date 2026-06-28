import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetTemplates() {
  const { data: global, isLoading: loadingGlobal } = useQuery({ queryKey: ["/api/pets/templates/global"], queryFn: () => apiFetch("/api/pets/templates/global").then(r => r.json()) });
  const { data: my, isLoading: loadingMy } = useQuery({ queryKey: ["/api/pets/templates/my"], queryFn: () => apiFetch("/api/pets/templates/my").then(r => r.json()) });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold">Pet Templates</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Global Templates</CardTitle></CardHeader>
        <CardContent>
          {loadingGlobal ? <div className="space-y-2">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          : !global?.length ? <p className="text-muted-foreground text-sm">No global templates available</p>
          : <div className="space-y-2">{global.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{t.name}</p>{t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}</div>
              <Badge>Global</Badge>
            </div>
          ))}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My Templates</CardTitle></CardHeader>
        <CardContent>
          {loadingMy ? <div className="space-y-2">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          : !my?.length ? <p className="text-muted-foreground text-sm">No personal templates saved</p>
          : <div className="space-y-2">{my.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-3 border rounded">
              <div><p className="font-medium">{t.name}</p>{t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}</div>
              <Badge variant="secondary">Personal</Badge>
            </div>
          ))}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
