import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const EQUIPMENT_SLOTS = ["head","chest","legs","feet","hands","mainHand","offHand","ring1","ring2","neck","back","waist"];

export default function NpcEquipmentEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({ itemName: "", statBonus: "{}" });

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: equipment = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "equipment"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/equipment`) });

  const upsertSlot = useMutation({
    mutationFn: ({ slot, data }: { slot: string; data: Record<string, unknown> }) =>
      apiFetch(`/api/npc-editor/${npcId}/equipment/${slot}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "equipment"] }); setEditSlot(null); },
  });

  const removeSlot = useMutation({
    mutationFn: (slotId: number) => apiFetch(`/api/npc-editor/${npcId}/equipment/${slotId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "equipment"] }),
  });

  const equipped = new Map((equipment as any[]).map((e: any) => [e.slot, e]));

  const saveSlot = () => {
    if (!editSlot) return;
    let statBonus: Record<string, unknown> = {};
    try { statBonus = JSON.parse(slotForm.statBonus); } catch {}
    upsertSlot.mutate({ slot: editSlot, data: { itemName: slotForm.itemName, statBonus } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Equipment Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {EQUIPMENT_SLOTS.map((slot) => {
            const item = equipped.get(slot);
            const isEditing = editSlot === slot;
            return (
              <Card key={slot} className={`${item ? "border-primary/40" : "border-dashed border-border/50"} ${isEditing ? "border-primary" : ""}`}>
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 capitalize">{slot}</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input placeholder="Item name" value={slotForm.itemName} onChange={(e) => setSlotForm({ ...slotForm, itemName: e.target.value })} className="h-7 text-xs" />
                      <Input placeholder='{"atk":5}' value={slotForm.statBonus} onChange={(e) => setSlotForm({ ...slotForm, statBonus: e.target.value })} className="h-7 text-xs font-mono" />
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-xs flex-1" onClick={saveSlot}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditSlot(null)}>×</Button>
                      </div>
                    </div>
                  ) : item ? (
                    <div>
                      <p className="text-sm font-medium">{item.itemName}</p>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" className="h-6 text-xs flex-1" onClick={() => { setEditSlot(slot); setSlotForm({ itemName: item.itemName ?? "", statBonus: JSON.stringify(item.statBonus ?? {}) }); }}>Edit</Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 text-destructive p-0" onClick={() => removeSlot.mutate(item.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground" onClick={() => { setEditSlot(slot); setSlotForm({ itemName: "", statBonus: "{}" }); }}>
                      <Plus className="w-3 h-3 mr-1" /> Equip
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Equipment Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(equipment as any[]).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No equipment</p>
                ) : (
                  (equipment as any[]).map((e: any) => (
                    <div key={e.id} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-xs text-muted-foreground capitalize">{e.slot}</p>
                        <p className="text-sm font-medium">{e.itemName}</p>
                      </div>
                      {Object.keys(e.statBonus ?? {}).length > 0 && (
                        <span className="text-xs text-emerald-400">{JSON.stringify(e.statBonus)}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
