import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetEvolutionEditor() {
  const [, params] = useRoute("/pet-evolution-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ targetSpeciesId: 0, requiredLevel: 20, requiredItem: "", requiredLoyalty: 0, evolutionOrder: 1 });

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/evolutions`], queryFn: () => apiFetch(`/api/pets/${id}/evolutions`).then(r => r.json()), enabled: !!id });

  const addMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/evolutions`, { method: "POST", body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/evolutions`] }); toast({ title: "Evolution path added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (evoId: number) => apiFetch(`/api/pets/${id}/evolutions/${evoId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/evolutions`] }); toast({ title: "Evolution removed" }); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowRight className="w-6 h-6 text-purple-500" />Evolution Editor — Pet #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Add Evolution Path</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Target Species ID</Label><Input type="number" value={form.targetSpeciesId} onChange={e => setForm(f => ({ ...f, targetSpeciesId: Number(e.target.value) }))} /></div>
            <div><Label>Required Level</Label><Input type="number" value={form.requiredLevel} onChange={e => setForm(f => ({ ...f, requiredLevel: Number(e.target.value) }))} /></div>
            <div><Label>Required Item (optional)</Label><Input value={form.requiredItem} onChange={e => setForm(f => ({ ...f, requiredItem: e.target.value }))} placeholder="e.g. evolution_stone" /></div>
            <div><Label>Required Loyalty</Label><Input type="number" min={0} max={100} value={form.requiredLoyalty} onChange={e => setForm(f => ({ ...f, requiredLoyalty: Number(e.target.value) }))} /></div>
            <div><Label>Evolution Order</Label><Input type="number" value={form.evolutionOrder} onChange={e => setForm(f => ({ ...f, evolutionOrder: Number(e.target.value) }))} /></div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.targetSpeciesId || addMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Path</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Evolution Paths ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {!data?.length ? <p className="text-muted-foreground text-sm">No evolution paths defined</p> : (
            <div className="space-y-2">
              {data.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-muted-foreground">Pet #{id}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>Species #{e.targetSpeciesId}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Lv. {e.requiredLevel}
                      {e.requiredItem ? ` · ${e.requiredItem}` : ""}
                      {e.requiredLoyalty ? ` · Loyalty ≥ ${e.requiredLoyalty}` : ""}
                      {" · Order " + e.evolutionOrder}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
