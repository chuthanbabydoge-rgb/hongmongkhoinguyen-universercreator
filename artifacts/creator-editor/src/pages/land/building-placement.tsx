import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function BuildingPlacement() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: buildings = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/buildings`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/buildings`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const delMut = useMutation({
    mutationFn: async (bid: number) => { await fetch(`${BASE}/api/lands/${landId}/buildings/${bid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/buildings`] }); toast({ title: "Building removed from land" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-emerald-500" /> Building Placement</h1>
      </div>
      <Card><CardContent className="py-3 text-sm text-muted-foreground">Place buildings from the Building Editor onto this land's parcels. Buildings are linked via their parcel assignment.</CardContent></Card>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : buildings.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No buildings placed on this land yet.</CardContent></Card>
          : <div className="grid gap-3">{buildings.map((b) => (
            <Card key={String(b.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">Building #{String(b.buildingId)}</div>
                  <div className="text-xs text-muted-foreground">Pos: ({String(b.posX)}, {String(b.posZ)}) · Rot: {String(b.rotY)}° {b.parcelId ? `· Parcel #${b.parcelId}` : ""}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(b.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
