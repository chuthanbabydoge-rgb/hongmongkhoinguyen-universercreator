import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, BarChart2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Stat = { id: number; statName: string; baseValue: number; minValue: number; maxValue: number; scaling: number; isPrimary: boolean };

export default function ItemStatsEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/stats`];

  const { data: stats = [], isLoading } = useQuery<Stat[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/stats`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ statName: "", baseValue: 0, minValue: 0, maxValue: 100, scaling: 1, isPrimary: false });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/stats`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ statName: "", baseValue: 0, minValue: 0, maxValue: 100, scaling: 1, isPrimary: false }); },
    onError: () => toast({ title: "Error", description: "Failed to add stat", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (statId: number) => authFetch(`/api/item-editor/stats/${statId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Stats</span>
      </div>
      <h1 className="text-2xl font-bold">Item Stats <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Stat</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Stat Name</label>
              <Input className="mt-1" placeholder="attack, defense, speed..." value={form.statName} onChange={(e) => setForm((f) => ({ ...f, statName: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Base Value</label>
              <Input type="number" className="mt-1" value={form.baseValue} onChange={(e) => setForm((f) => ({ ...f, baseValue: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Min Value</label>
              <Input type="number" className="mt-1" value={form.minValue} onChange={(e) => setForm((f) => ({ ...f, minValue: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Max Value</label>
              <Input type="number" className="mt-1" value={form.maxValue} onChange={(e) => setForm((f) => ({ ...f, maxValue: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Scaling</label>
              <Input type="number" step="0.1" className="mt-1" value={form.scaling} onChange={(e) => setForm((f) => ({ ...f, scaling: Number(e.target.value) }))} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))} className="rounded" />
                Primary Stat
              </label>
            </div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.statName || addMutation.isPending}>
            <Plus className="w-4 h-4 mr-1" />Add Stat
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !stats.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No stats defined yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stats.map((stat) => (
            <Card key={stat.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!!stat.isPrimary && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                  <div>
                    <p className="font-medium text-sm capitalize">{stat.statName}</p>
                    <p className="text-xs text-muted-foreground">Base: {stat.baseValue} · Range: {stat.minValue}–{stat.maxValue} · Scale: ×{stat.scaling}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(stat.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
