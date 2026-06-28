import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const SLOTS = ["head","body","legs","feet","weapon","offhand","accessory1","accessory2"];

export default function PetEquipmentEditor() {
  const [, params] = useRoute("/pet-equipment-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ slot: "head", itemRef: "", attackBonus: 0, defenseBonus: 0, speedBonus: 0, hpBonus: 0 });

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/equipment`], queryFn: () => apiFetch(`/api/pets/${id}/equipment`).then(r => r.json()), enabled: !!id });

  const equipMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/equipment`, { method: "POST", body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/equipment`] }); toast({ title: "Item equipped" }); setForm({ slot: "head", itemRef: "", attackBonus: 0, defenseBonus: 0, speedBonus: 0, hpBonus: 0 }); },
  });

  const unequipMutation = useMutation({
    mutationFn: (equipId: number) => apiFetch(`/api/pets/${id}/equipment/${equipId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/equipment`] }); toast({ title: "Item unequipped" }); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Equipment Editor — Pet #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Equip Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Slot</Label>
              <select className="w-full border rounded px-2 py-1.5 text-sm bg-background" value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}>
                {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>Item Ref</Label><Input value={form.itemRef} onChange={e => setForm(f => ({ ...f, itemRef: e.target.value }))} placeholder="item:12345" /></div>
            {["attackBonus","defenseBonus","speedBonus","hpBonus"].map(k => (
              <div key={k}><Label className="capitalize">{k.replace(/([A-Z])/g, " $1")}</Label>
                <Input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>
            ))}
          </div>
          <Button onClick={() => equipMutation.mutate()} disabled={equipMutation.isPending}><Plus className="w-4 h-4 mr-2" />Equip</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Equipped Items</CardTitle></CardHeader>
        <CardContent>
          {!data?.length ? <p className="text-muted-foreground text-sm">No equipment</p> : (
            <div className="space-y-2">
              {data.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium capitalize">{e.slot}</span>
                    {e.itemRef && <span className="ml-2 text-xs text-muted-foreground">{e.itemRef}</span>}
                    <div className="text-xs text-muted-foreground mt-0.5">ATK+{e.attackBonus} DEF+{e.defenseBonus} SPD+{e.speedBonus} HP+{e.hpBonus}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => unequipMutation.mutate(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
