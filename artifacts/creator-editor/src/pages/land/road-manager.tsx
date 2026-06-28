import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function RoadManager() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: roads = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/roads`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/roads`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/roads`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "Main Street", roadType: "street", points: [], width: 8, speedLimit: 50, isOneWay: false, hasFootpath: true }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/roads`] }); toast({ title: "Road added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (rid: number) => { await fetch(`${BASE}/api/lands/${landId}/roads/${rid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/roads`] }); toast({ title: "Road removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Navigation className="w-6 h-6 text-emerald-500" /> Road Manager</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Road</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : roads.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No roads defined yet.</CardContent></Card>
          : <div className="grid gap-3">{roads.map((r) => (
            <Card key={String(r.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(r.name)}</div>
                  <div className="text-xs text-muted-foreground"><Badge variant="outline">{String(r.roadType)}</Badge> · Width: {String(r.width)}m · Limit: {String(r.speedLimit)}km/h {r.isOneWay ? "· One-way" : ""}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(r.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
