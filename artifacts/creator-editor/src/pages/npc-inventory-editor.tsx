import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Backpack, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const ITEM_TYPES = ["weapon","armor","consumable","quest","misc","currency","material","accessory"];

export default function NpcInventoryEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ itemName: "", itemType: "misc", quantity: 1, dropChance: 0, isSellable: false, sellPrice: 0 });

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: inventory = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "inventory"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/inventory`) });

  const addItem = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/inventory`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "inventory"] }); setCreating(false); setForm({ itemName: "", itemType: "misc", quantity: 1, dropChance: 0, isSellable: false, sellPrice: 0 }); },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => apiFetch(`/api/npc-editor/${npcId}/inventory/${itemId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "inventory"] }),
  });

  const totalSlots = 20;
  const usedSlots = (inventory as any[]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Backpack className="w-6 h-6 text-primary" /> Inventory Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`} · {usedSlots}/{totalSlots} slots</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Input placeholder="Item name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
                {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input type="number" placeholder="Quantity" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <Input type="number" placeholder="Drop chance (0-1)" step={0.01} min={0} max={1} value={form.dropChance} onChange={(e) => setForm({ ...form, dropChance: Number(e.target.value) })} />
              <Input type="number" placeholder="Sell price" min={0} value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addItem.mutate(form)} disabled={!form.itemName || addItem.isPending}>Add Item</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const item = (inventory as any[])[i];
          return (
            <div key={i} className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 text-center relative ${item ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-muted/10"}`}>
              {item ? (
                <>
                  <Backpack className="w-4 h-4 text-primary mb-0.5" />
                  <p className="text-[10px] leading-tight truncate w-full text-center">{item.itemName}</p>
                  <p className="text-[10px] text-muted-foreground">×{item.quantity}</p>
                  <button className="absolute top-0.5 right-0.5 text-destructive hover:opacity-80" onClick={() => removeItem.mutate(item.id)}>
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground/30">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Item List</CardTitle></CardHeader>
        <CardContent>
          {(inventory as any[]).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No items in inventory</p>
          ) : (
            <div className="space-y-2">
              {(inventory as any[]).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Backpack className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.itemType} · Drop: {(item.dropChance * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">×{item.quantity}</Badge>
                    {item.isSellable && <Badge variant="outline" className="text-xs text-yellow-400">{item.sellPrice}g</Badge>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem.mutate(item.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
