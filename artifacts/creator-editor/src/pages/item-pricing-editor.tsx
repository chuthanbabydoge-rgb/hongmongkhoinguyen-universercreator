import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Coins, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Pricing = { id: number; currencyType: string; buyPrice: number; sellPrice: number; repairCost: number; discountRate: number; isActive: boolean };

export default function ItemPricingEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/pricing`];

  const { data: pricing = [], isLoading } = useQuery<Pricing[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/pricing`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ currencyType: "gold", buyPrice: 0, sellPrice: 0, repairCost: 0, discountRate: 0 });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/pricing`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ currencyType: "gold", buyPrice: 0, sellPrice: 0, repairCost: 0, discountRate: 0 }); },
    onError: () => toast({ title: "Error", description: "Failed to add pricing", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (pricingId: number) => authFetch(`/api/item-editor/pricing/${pricingId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Pricing</span>
      </div>
      <h1 className="text-2xl font-bold">Pricing <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Price Entry</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Currency Type</label>
              <Input className="mt-1" placeholder="gold, silver, gems..." value={form.currencyType} onChange={(e) => setForm((f) => ({ ...f, currencyType: e.target.value }))} /></div>
            {[["Buy Price","buyPrice"],["Sell Price","sellPrice"],["Repair Cost","repairCost"],["Discount Rate","discountRate"]].map(([label, key]) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type="number" className="mt-1" value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} /></div>
            ))}
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.currencyType || addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Pricing</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !pricing.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No pricing configured yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pricing.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm capitalize">{p.currencyType}</p>
                  <p className="text-xs text-muted-foreground">Buy: {p.buyPrice} · Sell: {p.sellPrice} · Repair: {p.repairCost} · Discount: {(p.discountRate * 100).toFixed(0)}%</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
