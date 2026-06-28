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

export default function ZoneEditor() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: zones = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/zones`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/zones`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/zones`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "New Zone", zoneType: "urban", color: "#4ade80", shape: [], area: 0, maxBuildingHeight: 20, maxDensity: 10 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/zones`] }); toast({ title: "Zone added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (zid: number) => { await fetch(`${BASE}/api/lands/${landId}/zones/${zid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/zones`] }); toast({ title: "Zone removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> Zone Editor</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Zone</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : zones.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No zones defined yet.</CardContent></Card>
          : <div className="grid gap-3">{zones.map((z) => (
            <Card key={String(z.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: String(z.color) }} />
                  <div>
                    <div className="font-medium">{String(z.name)}</div>
                    <div className="text-xs text-muted-foreground"><Badge variant="outline">{String(z.zoneType)}</Badge> · Max H: {String(z.maxBuildingHeight)}m · Density: {String(z.maxDensity)}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(z.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
