import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2 } from "lucide-react";
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

export default function NpcManager() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [npcRef, setNpcRef] = useState("");

  const { data: npcs = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/npcs`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/npcs`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/npcs`, {
        method: "POST",
        body: JSON.stringify({ npcRef: npcRef || "npc_default", role: "resident", isResident: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setNpcRef(""); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/npcs`] }); toast({ title: "NPC added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (npcId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/npcs/${npcId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/npcs`] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Users className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">NPC Manager</h1></div>
      <Card>
        <CardHeader><CardTitle>Assign NPC</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="NPC reference (e.g. npc_shopkeeper)" value={npcRef} onChange={e => setNpcRef(e.target.value)} className="max-w-xs" />
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Assign</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Assigned NPCs ({npcs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : npcs.map((n: Record<string, unknown>) => (
            <div key={String(n.id)} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{String(n.npcName ?? n.npcRef)}</div>
                <div className="text-xs text-muted-foreground">Role: {String(n.role)} — Ref: {String(n.npcRef)}</div>
              </div>
              <div className="flex items-center gap-2">
                {n.isResident && <Badge variant="secondary">Resident</Badge>}
                {n.isWorker && <Badge variant="outline">Worker</Badge>}
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(n.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {npcs.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No NPCs assigned.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
