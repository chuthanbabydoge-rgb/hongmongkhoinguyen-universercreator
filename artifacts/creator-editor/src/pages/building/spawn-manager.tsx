import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function SpawnManager() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [label, setLabel] = useState("");

  const { data: spawnpoints = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/spawnpoints`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/spawnpoints`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/spawnpoints`, {
        method: "POST",
        body: JSON.stringify({ label: label || "default", spawnType: "player", posX: 0, posY: 0, posZ: 0, rotY: 0, isDefault: spawnpoints.length === 0 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setLabel(""); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/spawnpoints`] }); toast({ title: "Spawnpoint added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (spawnId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/spawnpoints/${spawnId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/spawnpoints`] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><MapPin className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Spawn Manager</h1></div>
      <Card>
        <CardHeader><CardTitle>Add Spawnpoint</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="Label (e.g. entrance, roof)" value={label} onChange={e => setLabel(e.target.value)} className="max-w-xs" />
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Spawnpoints ({spawnpoints.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : spawnpoints.map((s: Record<string, unknown>) => (
            <div key={String(s.id)} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {(s.isDefault as boolean) && <Star className="w-4 h-4 text-yellow-500" />}
                <div>
                  <div className="font-medium">{String(s.label)}</div>
                  <div className="text-xs text-muted-foreground">{String(s.spawnType)} — ({String(s.posX)}, {String(s.posY)}, {String(s.posZ)})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(s.isDefault as boolean) && <Badge>Default</Badge>}
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(s.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {spawnpoints.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No spawnpoints yet. Add one to set where players spawn.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
