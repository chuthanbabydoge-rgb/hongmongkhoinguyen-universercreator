import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function TeleportManager() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: teleports = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/teleports`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/teleports`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/teleports`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "Waypoint", teleportType: "waypoint", posX: 0, posY: 0, posZ: 0, isPublic: true, requiredLevel: 1, cooldownSeconds: 0 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/teleports`] }); toast({ title: "Teleport added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (tid: number) => { await fetch(`${BASE}/api/lands/${landId}/teleports/${tid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/teleports`] }); toast({ title: "Teleport removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-emerald-500" /> Teleport Manager</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Teleport</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : teleports.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No teleports placed yet.</CardContent></Card>
          : <div className="grid gap-3">{teleports.map((t) => (
            <Card key={String(t.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(t.name)}</div>
                  <div className="text-xs text-muted-foreground"><Badge variant="outline">{String(t.teleportType)}</Badge> · Pos: ({String(t.posX)}, {String(t.posZ)}) · CD: {String(t.cooldownSeconds)}s · Level {String(t.requiredLevel)}+</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(t.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
