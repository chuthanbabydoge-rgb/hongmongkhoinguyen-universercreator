import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Inventory = { id: number; inventoryName: string; ownerType: string; ownerId?: number; maxSlots: number; maxWeight: number; isShared: boolean };

const OWNER_TYPES = ["npc", "player", "chest", "vendor", "world", "quest"];

export default function ItemInventoryEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: inventories = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/item-editor/inventories"],
    queryFn: () => authFetch("/api/item-editor/inventories").then((r) => r.json()),
  });

  const [form, setForm] = useState({ inventoryName: "", ownerType: "npc", ownerId: 0, maxSlots: 20, maxWeight: 100, isShared: false });

  const addMutation = useMutation({
    mutationFn: () => authFetch("/api/item-editor/inventories", { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/item-editor/inventories"] }); setForm({ inventoryName: "", ownerType: "npc", ownerId: 0, maxSlots: 20, maxWeight: 100, isShared: false }); },
    onError: () => toast({ title: "Error", description: "Failed to create inventory", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Editor</h1>
      <p className="text-muted-foreground text-sm">Define inventories for NPCs, vendors, chests, and world containers.</p>

      <Card>
        <CardHeader><CardTitle className="text-sm">New Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <Input className="mt-1" value={form.inventoryName} onChange={(e) => setForm((f) => ({ ...f, inventoryName: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Owner Type</label>
              <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.ownerType} onChange={(e) => setForm((f) => ({ ...f, ownerType: e.target.value }))}>
                {OWNER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Owner ID</label>
              <Input type="number" className="mt-1" value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Max Slots</label>
              <Input type="number" className="mt-1" value={form.maxSlots} onChange={(e) => setForm((f) => ({ ...f, maxSlots: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Max Weight</label>
              <Input type="number" className="mt-1" value={form.maxWeight} onChange={(e) => setForm((f) => ({ ...f, maxWeight: Number(e.target.value) }))} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isShared} onChange={(e) => setForm((f) => ({ ...f, isShared: e.target.checked }))} className="rounded" />Shared
              </label>
            </div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.inventoryName || addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Create Inventory</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !inventories.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Grid3X3 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No inventories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventories.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{inv.inventoryName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{inv.ownerType}{inv.ownerId ? ` #${inv.ownerId}` : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    {!!inv.isShared && <Badge variant="outline" className="text-xs">Shared</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-secondary/40 rounded p-2 text-center">
                    <p className="text-muted-foreground">Slots</p>
                    <p className="font-bold text-lg">{inv.maxSlots}</p>
                  </div>
                  <div className="bg-secondary/40 rounded p-2 text-center">
                    <p className="text-muted-foreground">Max Weight</p>
                    <p className="font-bold text-lg">{inv.maxWeight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
