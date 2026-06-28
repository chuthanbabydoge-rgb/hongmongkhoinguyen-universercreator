import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function ParcelEditor() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: parcels = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/parcels`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/parcels`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/parcels`, { method: "POST", headers: auth(), body: JSON.stringify({ name: `Parcel ${parcels.length + 1}`, posX: 0, posZ: 0, width: 20, depth: 20 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/parcels`] }); toast({ title: "Parcel added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (pid: number) => {
      await fetch(`${BASE}/api/lands/${landId}/parcels/${pid}`, { method: "DELETE", headers: auth() });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/parcels`] }); toast({ title: "Parcel removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> Parcel Editor</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Parcel</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : parcels.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No parcels yet. Add your first parcel!</CardContent></Card>
          : <div className="grid gap-3">{parcels.map((p) => (
            <Card key={String(p.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(p.name)}</div>
                  <div className="text-xs text-muted-foreground">Pos: ({String(p.posX)}, {String(p.posZ)}) · {String(p.width)}×{String(p.depth)}m · <Badge variant="outline">{String(p.landType)}</Badge></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(p.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
