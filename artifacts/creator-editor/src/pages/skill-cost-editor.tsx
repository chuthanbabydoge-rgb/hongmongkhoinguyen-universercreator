import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Cost = { id: number; resourceType: string; amount: number; amountPerLevel: number; isPercentage: boolean; chargeCount: number; rechargeDuration: number };

const RESOURCE_TYPES = ["mana", "energy", "stamina", "rage", "none"];
const RESOURCE_COLORS: Record<string, string> = { mana: "text-blue-400", energy: "text-yellow-400", stamina: "text-green-400", rage: "text-red-400", none: "text-gray-400" };

export default function SkillCostEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ resourceType: "mana", amount: 20, amountPerLevel: 5, isPercentage: false, chargeCount: 1, rechargeDuration: 0 });

  const { data: costs = [], isLoading } = useQuery<Cost[]>({
    queryKey: [`/api/skills/${id}/costs`],
    queryFn: () => authFetch(`/api/skills/${id}/costs`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/costs`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/costs`] }); toast({ title: "Cost added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (costId: number) => authFetch(`/api/skills/costs/${costId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/costs`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Costs · Skill #{id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cost Editor</h1>
        <Badge variant="outline">{costs.length} costs</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Resource Cost</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Resource Type</label>
              <select value={form.resourceType} onChange={e => setForm(f => ({ ...f, resourceType: e.target.value }))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Amount</label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Amount Per Level</label>
              <Input type="number" value={form.amountPerLevel} onChange={e => setForm(f => ({ ...f, amountPerLevel: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Charges</label>
              <Input type="number" min="1" value={form.chargeCount} onChange={e => setForm(f => ({ ...f, chargeCount: Number(e.target.value) }))} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Recharge Duration (s)</label>
              <Input type="number" step="0.1" value={form.rechargeDuration} onChange={e => setForm(f => ({ ...f, rechargeDuration: Number(e.target.value) }))} className="mt-1" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPercentage} onChange={e => setForm(f => ({ ...f, isPercentage: e.target.checked }))} className="rounded" />
            Amount is percentage of max resource
          </label>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Cost
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {costs.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Flame className={`w-4 h-4 ${RESOURCE_COLORS[c.resourceType] ?? "text-primary"}`} />
                <div>
                  <p className={`font-medium text-sm capitalize ${RESOURCE_COLORS[c.resourceType] ?? ""}`}>{c.resourceType}</p>
                  <p className="text-xs text-muted-foreground">{c.amount}{c.isPercentage ? "%" : ""} base · +{c.amountPerLevel}/lvl{c.chargeCount > 1 ? ` · ${c.chargeCount} charges` : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {costs.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No costs defined.</div>}
        </div>
      )}
    </div>
  );
}
