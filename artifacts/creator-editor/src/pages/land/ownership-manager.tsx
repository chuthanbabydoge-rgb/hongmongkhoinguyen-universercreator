import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function OwnershipManager() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: owners = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/owners`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/owners`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/owners`, { method: "POST", headers: auth(), body: JSON.stringify({ ownerType: "player", ownerRef: "player_1", ownerName: "New Owner", ownershipPercent: 100 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/owners`] }); toast({ title: "Owner added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (oid: number) => { await fetch(`${BASE}/api/lands/${landId}/owners/${oid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/owners`] }); toast({ title: "Owner removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-emerald-500" /> Ownership Manager</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Owner</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : owners.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No owners registered. Land is unclaimed.</CardContent></Card>
          : <div className="grid gap-3">{owners.map((o) => (
            <Card key={String(o.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(o.ownerName ?? o.ownerRef)}</div>
                  <div className="text-xs text-muted-foreground"><Badge variant="outline">{String(o.ownerType)}</Badge> · {String(o.ownershipPercent)}% ownership</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(o.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
