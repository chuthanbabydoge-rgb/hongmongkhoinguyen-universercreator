import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossPhaseEditor() {
  const [, params] = useRoute("/boss-phase-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: phases, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "phases"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/phases`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const existing = phases ?? [];
      const res = await fetch(`${BASE}/api/bosses/${id}/phases`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: `Phase ${existing.length + 1}`, phaseNumber: existing.length + 1, hpThreshold: 1 - (existing.length * 0.3) }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "phases"] }); toast({ title: "Phase created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ phaseId, data }: { phaseId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/phases/${phaseId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "phases"] }); setEditingId(null); toast({ title: "Phase saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (phaseId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/phases/${phaseId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "phases"] }); toast({ title: "Phase deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Phases</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500" />Phase Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Phase</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (phases ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No phases yet. Click "Add Phase" to create one.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(phases ?? []).map((phase: Record<string, unknown>) => (
            <Card key={String(phase.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Phase {String(phase.phaseNumber)}: {String(phase.name)}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(phase.id)); setForm({ ...phase }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete phase?")) deleteMutation.mutate(Number(phase.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                HP Threshold: {(Number(phase.hpThreshold) * 100).toFixed(0)}% · Damage ×{String(phase.damageMultiplier)} · Speed ×{String(phase.speedMultiplier)}
                {phase.isEnragePhase && <span className="ml-2 text-red-500 font-medium">⚡ ENRAGE</span>}
              </CardContent>
              {editingId === Number(phase.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>HP Threshold (0-1)</Label><Input type="number" step="0.01" value={String(form.hpThreshold ?? 1)} onChange={e => setForm(f => ({ ...f, hpThreshold: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["damageMultiplier","Damage Mult"],["speedMultiplier","Speed Mult"],["defenseMultiplier","Defense Mult"]].map(([k,l]) => (
                      <div key={k} className="space-y-1"><Label>{l}</Label><Input type="number" step="0.01" value={String(form[k] ?? 1)} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>
                    ))}
                  </div>
                  <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={String(form.description ?? "")} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(form.isEnragePhase)} onCheckedChange={v => setForm(f => ({ ...f, isEnragePhase: v }))} />
                    <Label>Is Enrage Phase</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ phaseId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
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
