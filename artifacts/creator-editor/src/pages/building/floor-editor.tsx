import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Layers, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function FloorEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");

  const { data: floors = [], isLoading } = useQuery<Record<string, unknown>[]>({
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
      const res = await authFetch(`${BASE}/api/buildings/${id}/floors`, {
        method: "POST",
        body: JSON.stringify({ name: newName || `Floor ${floors.length}`, floorNumber: floors.length, height: 3, ceilingHeight: 3 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setNewName(""); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/floors`] }); toast({ title: "Floor added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (floorId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/floors/${floorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/floors`] }); toast({ title: "Floor deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Floor Editor</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Floor</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="Floor name" value={newName} onChange={e => setNewName(e.target.value)} className="max-w-xs" />
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Floor</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {floors.map((f: Record<string, unknown>) => (
            <Card key={String(f.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(f.name)}</div>
                  <div className="text-xs text-muted-foreground">Floor {String(f.floorNumber)} — {String(f.height)}m ceiling</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><Save className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(f.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {floors.length === 0 && <div className="text-muted-foreground text-sm">No floors yet.</div>}
        </div>
      )}
    </div>
  );
}
