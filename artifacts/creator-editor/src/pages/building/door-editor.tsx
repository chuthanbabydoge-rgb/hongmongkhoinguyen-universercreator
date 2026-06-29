import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function DoorEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: doors = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/doors`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/doors`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: floors = [] } = await authFetch(`${BASE}/api/buildings/${id}/floors`).then(r => r.json().then((d: Record<string, unknown>[]) => ({ data: d })));
      const floorId = floors.length > 0 ? Number((floors[0] as Record<string, unknown>).id) : 1;
      const res = await authFetch(`${BASE}/api/buildings/${id}/doors`, {
        method: "POST",
        body: JSON.stringify({ doorType: "standard", width: 1, height: 2.1, floorId, isExterior: false }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/doors`] }); toast({ title: "Door added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (doorId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/doors/${doorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/doors`] }); toast({ title: "Door deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><DoorOpen className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Door Editor</h1></div>
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Door</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Doors ({doors.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : doors.map((d: Record<string, unknown>) => (
            <div key={String(d.id)} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium capitalize">{String(d.doorType)} Door</div>
                <div className="text-xs text-muted-foreground">{String(d.width)}×{String(d.height)}m</div>
              </div>
              <div className="flex items-center gap-2">
                {(d.isExterior as boolean) && <Badge variant="outline">Exterior</Badge>}
                {(d.isLocked as boolean) && <Badge variant="destructive">Locked</Badge>}
                {(d.isAutomatic as boolean) && <Badge variant="secondary">Auto</Badge>}
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(d.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {doors.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No doors yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
