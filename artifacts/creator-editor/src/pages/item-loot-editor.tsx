import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Dices, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type LootTable = { id: number; tableName: string; rollType: string; minRolls: number; maxRolls: number; isActive: boolean };
type Drop = { id: number; itemId: number; dropChance: number; minQuantity: number; maxQuantity: number; weight: number };

function LootTableCard({ table }: { table: LootTable }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const qk = [`/api/item-editor/loot-tables/${table.id}/drops`];

  const { data: drops = [] } = useQuery<Drop[]>({
    queryKey: qk,
    queryFn: () => authFetch(`/api/item-editor/loot-tables/${table.id}/drops`).then((r) => r.json()),
    enabled: open,
  });

  const [dropForm, setDropForm] = useState({ itemId: 0, dropChance: 0.1, minQuantity: 1, maxQuantity: 1, weight: 1 });

  const addDropMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/loot-tables/${table.id}/drops`, { method: "POST", body: JSON.stringify(dropForm) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setDropForm({ itemId: 0, dropChance: 0.1, minQuantity: 1, maxQuantity: 1, weight: 1 }); },
    onError: () => toast({ title: "Error", description: "Failed to add drop", variant: "destructive" }),
  });

  const deleteDropMutation = useMutation({
    mutationFn: (dropId: number) => authFetch(`/api/item-editor/drops/${dropId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  const deleteTableMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/loot-tables/${table.id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/item-editor/loot-tables"] }),
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{table.tableName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{table.rollType} · {table.minRolls}–{table.maxRolls} rolls</p>
          </div>
          <div className="flex gap-1 items-center">
            <Badge variant={table.isActive ? "default" : "secondary"} className="text-xs">{table.isActive ? "active" : "inactive"}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
            <Button variant="ghost" size="sm" onClick={() => deleteTableMutation.mutate()}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-3 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">Drops</p>
          {drops.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span>Item #{d.itemId} · {(d.dropChance * 100).toFixed(1)}% · Qty {d.minQuantity}–{d.maxQuantity} · Wt {d.weight}</span>
              <Button variant="ghost" size="sm" onClick={() => deleteDropMutation.mutate(d.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {[["Item ID","itemId","number"],["Chance","dropChance","number"],["Min Qty","minQuantity","number"],["Max Qty","maxQuantity","number"],["Weight","weight","number"]].map(([label, key, type]) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type={type} className="w-24 mt-1" value={String(dropForm[key as keyof typeof dropForm])}
                  onChange={(e) => setDropForm((f) => ({ ...f, [key]: Number(e.target.value) }))} /></div>
            ))}
            <div className="flex items-end pb-1">
              <Button size="sm" onClick={() => addDropMutation.mutate()} disabled={!dropForm.itemId}><Plus className="w-3 h-3 mr-1" />Add</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ItemLootEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tables = [], isLoading } = useQuery<LootTable[]>({
    queryKey: ["/api/item-editor/loot-tables"],
    queryFn: () => authFetch("/api/item-editor/loot-tables?limit=100").then((r) => r.json()),
  });

  const [form, setForm] = useState({ tableName: "", rollType: "single", minRolls: 1, maxRolls: 1 });

  const addMutation = useMutation({
    mutationFn: () => authFetch("/api/item-editor/loot-tables", { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/item-editor/loot-tables"] }); setForm({ tableName: "", rollType: "single", minRolls: 1, maxRolls: 1 }); },
    onError: () => toast({ title: "Error", description: "Failed to create loot table", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Loot Tables</h1>
      <Card>
        <CardHeader><CardTitle className="text-sm">New Loot Table</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-xs text-muted-foreground">Table Name</label>
              <Input className="mt-1" value={form.tableName} onChange={(e) => setForm((f) => ({ ...f, tableName: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Roll Type</label>
              <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.rollType} onChange={(e) => setForm((f) => ({ ...f, rollType: e.target.value }))}>
                {["single","multi","all","weighted"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Min Rolls</label>
              <Input type="number" className="mt-1" value={form.minRolls} onChange={(e) => setForm((f) => ({ ...f, minRolls: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Max Rolls</label>
              <Input type="number" className="mt-1" value={form.maxRolls} onChange={(e) => setForm((f) => ({ ...f, maxRolls: Number(e.target.value) }))} /></div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.tableName || addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Create Loot Table</Button>
        </CardContent>
      </Card>
      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !tables.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Dices className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No loot tables yet.</p>
        </div>
      ) : (
        <div className="space-y-3">{tables.map((t) => <LootTableCard key={t.id} table={t} />)}</div>
      )}
    </div>
  );
}
