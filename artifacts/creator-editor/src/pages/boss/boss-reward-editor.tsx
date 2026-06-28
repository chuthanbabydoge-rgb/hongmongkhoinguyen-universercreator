import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const REWARD_TYPES = ["item","currency","experience","skill_point","equipment","cosmetic","blueprint","title","mount","custom"];

export default function BossRewardEditor() {
  const [, params] = useRoute("/boss-reward-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: rewards, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "rewards"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/rewards`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/rewards`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Kill Reward", rewardType: "currency", currencyAmount: 1000, triggerCondition: "on_kill" }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "rewards"] }); toast({ title: "Reward added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ rewardId, data }: { rewardId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/rewards/${rewardId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "rewards"] }); setEditingId(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/rewards/${rewardId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "rewards"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Rewards</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500" />Reward Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Reward</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (rewards ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No rewards configured. Click "Add Reward" to add kill rewards.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(rewards ?? []).map((r: Record<string, unknown>) => (
            <Card key={String(r.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{String(r.name)}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(r.id)); setForm({ ...r }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Remove reward?")) deleteMutation.mutate(Number(r.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground capitalize">
                Type: {String(r.rewardType).replace(/_/g, " ")} · Trigger: {String(r.triggerCondition).replace(/_/g, " ")} · XP: {String(r.xpAmount)} · Gold: {String(r.currencyAmount)}
              </CardContent>
              {editingId === Number(r.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Reward Type</Label>
                      <Select value={String(form.rewardType ?? "currency")} onValueChange={v => setForm(f => ({ ...f, rewardType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{REWARD_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Currency Amount</Label><Input type="number" value={String(form.currencyAmount ?? 0)} onChange={e => setForm(f => ({ ...f, currencyAmount: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>XP Amount</Label><Input type="number" value={String(form.xpAmount ?? 0)} onChange={e => setForm(f => ({ ...f, xpAmount: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Skill Points</Label><Input type="number" value={String(form.skillPointAmount ?? 0)} onChange={e => setForm(f => ({ ...f, skillPointAmount: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="space-y-1"><Label>Trigger Condition</Label><Input value={String(form.triggerCondition ?? "on_kill")} onChange={e => setForm(f => ({ ...f, triggerCondition: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[["isFirstKillOnly","First Kill Only"],["isWeeklyLimit","Weekly Limit"]].map(([k,l]) => (
                      <div key={k} className="flex items-center gap-2"><Switch checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: v }))} /><Label>{l}</Label></div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ rewardId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
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
