import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, ShieldOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Restriction = { id: number; restrictionType: string; restrictionValue: string; isBlacklist: boolean; reason?: string };

const RESTRICTION_TYPES = ["class", "faction", "level", "race", "region", "quest_status", "alignment", "skill"];

export default function ItemRestrictionsEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/restrictions`];

  const { data: restrictions = [], isLoading } = useQuery<Restriction[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/restrictions`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ restrictionType: "class", restrictionValue: "", isBlacklist: true, reason: "" });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/restrictions`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ restrictionType: "class", restrictionValue: "", isBlacklist: true, reason: "" }); },
    onError: () => toast({ title: "Error", description: "Failed to add restriction", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (rId: number) => authFetch(`/api/item-editor/restrictions/${rId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Restrictions</span>
      </div>
      <h1 className="text-2xl font-bold">Restrictions <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Restriction</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-xs text-muted-foreground">Type</label>
              <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.restrictionType} onChange={(e) => setForm((f) => ({ ...f, restrictionType: e.target.value }))}>
                {RESTRICTION_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Value</label>
              <Input className="mt-1" placeholder="e.g. warrior, 10, elf..." value={form.restrictionValue} onChange={(e) => setForm((f) => ({ ...f, restrictionValue: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground">Reason</label>
              <Input className="mt-1" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isBlacklist} onChange={(e) => setForm((f) => ({ ...f, isBlacklist: e.target.checked }))} className="rounded" />Blacklist
              </label>
            </div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.restrictionValue || addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Restriction</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !restrictions.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShieldOff className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No restrictions configured.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {restrictions.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={r.isBlacklist ? "destructive" : "default"} className="text-xs">{r.isBlacklist ? "block" : "allow"}</Badge>
                  <div>
                    <p className="font-medium text-sm capitalize">{r.restrictionType}: {r.restrictionValue}</p>
                    {!!r.reason && <p className="text-xs text-muted-foreground">{r.reason}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
