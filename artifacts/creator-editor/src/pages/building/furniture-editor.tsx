import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sofa, Plus, Trash2, Package } from "lucide-react";
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

export default function FurnitureEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");

  const { data: furniture = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/furniture`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/furniture`);
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
      const res = await authFetch(`${BASE}/api/buildings/${id}/furniture`, {
        method: "POST",
        body: JSON.stringify({ name: name || "New Furniture", furnitureType: "generic", floorId, isInteractable: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/furniture`] }); toast({ title: "Furniture added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (fId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/furniture/${fId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/furniture`] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Sofa className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Furniture Editor</h1></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Add Furniture</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="Item name" value={name} onChange={e => setName(e.target.value)} className="max-w-xs" />
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Furniture ({furniture.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : furniture.map((f: Record<string, unknown>) => (
            <div key={String(f.id)} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {f.isContainer ? <Package className="w-4 h-4 text-muted-foreground" /> : <Sofa className="w-4 h-4 text-muted-foreground" />}
                <div>
                  <div className="font-medium">{String(f.name)}</div>
                  <div className="text-xs text-muted-foreground">{String(f.furnitureType)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {f.isInteractable && <Badge variant="secondary">Interactable</Badge>}
                {f.isContainer && <Badge variant="outline">Container</Badge>}
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(f.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {furniture.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No furniture yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
