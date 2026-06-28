import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossLootEditor() {
  const [, params] = useRoute("/boss-loot-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: loot, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "loot"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/loot`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/loot`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Loot", itemRef: "item_001", dropChance: 0.1, quantity: 1 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "loot"] }); toast({ title: "Loot added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ lootId, data }: { lootId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/loot/${lootId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "loot"] }); setEditingId(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (lootId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/loot/${lootId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "loot"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Loot</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-orange-500" />Loot Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Loot</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (loot ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No loot configured. Click "Add Loot" to add drops.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(loot ?? []).map((l: Record<string, unknown>) => (
            <Card key={String(l.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{String(l.name)}</CardTitle>
                  {l.isGuaranteed && <Badge>Guaranteed</Badge>}
                  {l.isUnique && <Badge variant="secondary">Unique</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(l.id)); setForm({ ...l }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Remove loot?")) deleteMutation.mutate(Number(l.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Item: {String(l.itemRef)} · Chance: {(Number(l.dropChance) * 100).toFixed(1)}% · Qty: {String(l.quantity)}–{String(l.maxQuantity)} · Phase: {String(l.requiredPhase)}
              </CardContent>
              {editingId === Number(l.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Item Ref</Label><Input value={String(form.itemRef ?? "")} onChange={e => setForm(f => ({ ...f, itemRef: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Drop Chance (0-1)</Label><Input type="number" step="0.01" value={String(form.dropChance ?? 0.1)} onChange={e => setForm(f => ({ ...f, dropChance: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={String(form.quantity ?? 1)} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Max Quantity</Label><Input type="number" value={String(form.maxQuantity ?? 1)} onChange={e => setForm(f => ({ ...f, maxQuantity: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="space-y-1"><Label>Required Phase</Label><Input type="number" value={String(form.requiredPhase ?? 1)} onChange={e => setForm(f => ({ ...f, requiredPhase: Number(e.target.value) }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[["isGuaranteed","Guaranteed"],["isUnique","Unique Drop"]].map(([k,l]) => (
                      <div key={k} className="flex items-center gap-2"><Switch checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: v }))} /><Label>{l}</Label></div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ lootId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
