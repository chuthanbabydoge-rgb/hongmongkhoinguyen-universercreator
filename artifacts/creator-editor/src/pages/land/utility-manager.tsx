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

export default function UtilityManager() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: utilities = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/utilities`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/utilities`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/utilities`, { method: "POST", headers: auth(), body: JSON.stringify({ name: "Power Grid Node", utilityType: "power", posX: 0, posZ: 0, capacity: 100, currentLoad: 0, radius: 50, isActive: true }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/utilities`] }); toast({ title: "Utility added" }); },
  });

  const delMut = useMutation({
    mutationFn: async (uid: number) => { await fetch(`${BASE}/api/lands/${landId}/utilities/${uid}`, { method: "DELETE", headers: auth() }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/utilities`] }); toast({ title: "Utility removed" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-emerald-500" /> Utility Manager</h1>
        <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}><Plus className="w-4 h-4 mr-2" />Add Utility</Button>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : utilities.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No utilities placed yet.</CardContent></Card>
          : <div className="grid gap-3">{utilities.map((u) => (
            <Card key={String(u.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(u.name)}</div>
                  <div className="text-xs text-muted-foreground"><Badge variant="outline">{String(u.utilityType)}</Badge> · Load: {String(u.currentLoad)}/{String(u.capacity)} · Radius: {String(u.radius)}m · {u.isActive ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => delMut.mutate(Number(u.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
