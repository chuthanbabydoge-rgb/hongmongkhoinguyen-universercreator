import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Square, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function WindowEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: windows = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/windows`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/windows`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: floors = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/floors`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/floors`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const floorId = floors.length > 0 ? Number((floors[0] as Record<string, unknown>).id) : 1;
      const res = await authFetch(`${BASE}/api/buildings/${id}/windows`, {
        method: "POST",
        body: JSON.stringify({ windowType: "standard", width: 1.2, height: 1.4, floorId, posY: 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/windows`] }); toast({ title: "Window added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (winId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/windows/${winId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/windows`] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Square className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Window Editor</h1></div>
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Window</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Windows ({windows.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : windows.map((w: Record<string, unknown>) => (
            <div key={String(w.id)} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium capitalize">{String(w.windowType)} Window</div>
                <div className="text-xs text-muted-foreground">{String(w.width)}×{String(w.height)}m, height offset {String(w.posY)}m</div>
              </div>
              <div className="flex items-center gap-2">
                {(w.isBreakable as boolean) && <Badge variant="outline">Breakable</Badge>}
                {(w.isOpen as boolean) && <Badge variant="secondary">Open</Badge>}
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(w.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {windows.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No windows yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
