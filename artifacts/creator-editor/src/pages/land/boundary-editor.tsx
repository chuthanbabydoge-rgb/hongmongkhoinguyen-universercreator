import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function BoundaryEditor() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: boundaries = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/boundaries`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/boundaries`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/boundaries`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "Perimeter", points: [{ x: 0, z: 0 }, { x: 100, z: 0 }, { x: 100, z: 100 }, { x: 0, z: 100 }], height: 2 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/boundaries`] }); toast({ title: "Boundary added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (bid: number) => { await fetch(`${BASE}/api/lands/${landId}/boundaries/${bid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/boundaries`] }); toast({ title: "Boundary removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> Boundary Editor</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Boundary</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : boundaries.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No boundaries defined yet.</CardContent></Card>
          : <div className="grid gap-3">{boundaries.map((b) => (
            <Card key={String(b.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(b.name)}</div>
                  <div className="text-xs text-muted-foreground">Height: {String(b.height)}m · <Badge variant="outline">{String(b.boundaryType)}</Badge> · {(b.points as unknown[] | undefined)?.length ?? 0} points</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(b.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
