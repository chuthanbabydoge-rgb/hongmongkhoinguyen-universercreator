import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Gift, Play } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Reward { id: number; name: string; rewardType: string; currencyAmount: number; xpAmount: number; isGuaranteed: boolean; dropChance: number; quantity: number; itemRef: string | null; lootTableRef: string | null; }
const REWARD_TYPES = ["item","currency","experience","skill_point","loot_table","chest","blueprint","cosmetic","reputation","custom"];

export default function RewardEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Reward>>({ name: "Completion Reward", rewardType: "item", currencyAmount: 0, xpAmount: 100, isGuaranteed: false, dropChance: 1.0, quantity: 1 });
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: rewards } = useQuery<Reward[]>({ queryKey: ["/api/dungeons", dungeonId, "rewards"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rewards`); return r.json(); } });

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rewards`, { method: "POST", body: JSON.stringify({ ...form, triggerCondition: "on_completion" }) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "rewards"] }); toast({ title: "Reward added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (rid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/rewards/${rid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "rewards"] }); toast({ title: "Reward removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/loot/simulate`, { method: "POST" }); return r.json(); },
    onSuccess: (d) => setSimResult(d),
    onError: () => toast({ title: "Simulation failed", variant: "destructive" }),
  });

  const set = (k: keyof Reward, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Reward Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Reward</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Reward Type</Label>
              <Select value={form.rewardType ?? "item"} onValueChange={(v) => set("rewardType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REWARD_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Item Reference (CREATOR-10)</Label><Input value={form.itemRef ?? ""} onChange={(e) => set("itemRef", e.target.value)} placeholder="item-slug" /></div>
            <div className="space-y-1"><Label>Loot Table Reference (CREATOR-10)</Label><Input value={form.lootTableRef ?? ""} onChange={(e) => set("lootTableRef", e.target.value)} placeholder="loot-table-id" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Currency</Label><Input type="number" value={form.currencyAmount ?? 0} onChange={(e) => set("currencyAmount", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>XP</Label><Input type="number" value={form.xpAmount ?? 0} onChange={(e) => set("xpAmount", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Qty</Label><Input type="number" min={1} value={form.quantity ?? 1} onChange={(e) => set("quantity", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-2"><Switch checked={form.isGuaranteed ?? false} onCheckedChange={(v) => set("isGuaranteed", v)} /><Label>Guaranteed</Label></div>
              {!form.isGuaranteed && <div className="space-y-1"><Label>Drop Chance (0-1)</Label><Input type="number" step={0.01} min={0} max={1} value={form.dropChance ?? 1} onChange={(e) => set("dropChance", Number(e.target.value))} /></div>}
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Reward</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{rewards?.length ?? 0} Rewards</p>
            <Button size="sm" variant="outline" onClick={() => simMut.mutate()} disabled={simMut.isPending || (rewards ?? []).length === 0}><Play className="w-3 h-3 mr-1" />Simulate Loot</Button>
          </div>
          {(rewards ?? []).map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-xs capitalize">{r.rewardType.replace(/_/g," ")}</Badge>
                      {r.isGuaranteed ? <Badge className="text-xs bg-green-600">Guaranteed</Badge> : <span className="text-xs text-muted-foreground">{(r.dropChance * 100).toFixed(0)}%</span>}
                      <span className="text-xs text-muted-foreground">×{r.quantity}</span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(r.id)}><Trash2 className="w-3 h-3" /></Button>
              </CardContent>
            </Card>
          ))}
          {simResult && <Card><CardHeader><CardTitle className="text-xs">Loot Simulation</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto max-h-36">{JSON.stringify(simResult, null, 2)}</pre></CardContent></Card>}
          {(rewards ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No rewards yet.</p>}
        </div>
      </div>
    </div>
  );
}
