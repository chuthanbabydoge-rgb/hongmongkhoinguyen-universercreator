import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossPatternEditor() {
  const [, params] = useRoute("/boss-pattern-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: patterns, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "patterns"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/patterns`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/patterns`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Pattern", patternType: "rotation", sequence: [], priority: 5 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "patterns"] }); toast({ title: "Pattern created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ patternId, data }: { patternId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/patterns/${patternId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "patterns"] }); setEditingId(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (patternId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/patterns/${patternId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "patterns"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Patterns</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><GitBranch className="w-5 h-5 text-purple-500" />Pattern Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Pattern</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (patterns ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No combat patterns. Click "Add Pattern" to define attack sequences.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(patterns ?? []).map((p: Record<string, unknown>) => (
            <Card key={String(p.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{String(p.name)}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(p.id)); setForm({ ...p }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete pattern?")) deleteMutation.mutate(Number(p.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground capitalize">
                Type: {String(p.patternType).replace(/_/g, " ")} · Phase: {String(p.phaseNumber)} · Priority: {String(p.priority)} · Active: {p.isActive ? "Yes" : "No"}
              </CardContent>
              {editingId === Number(p.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Pattern Type</Label><Input value={String(form.patternType ?? "")} onChange={e => setForm(f => ({ ...f, patternType: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Phase Number</Label><Input type="number" value={String(form.phaseNumber ?? 1)} onChange={e => setForm(f => ({ ...f, phaseNumber: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Priority</Label><Input type="number" value={String(form.priority ?? 5)} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Cooldown (s)</Label><Input type="number" value={String(form.cooldown ?? 0)} onChange={e => setForm(f => ({ ...f, cooldown: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="space-y-1"><Label>Trigger Condition</Label><Textarea rows={2} value={String(form.triggerCondition ?? "")} onChange={e => setForm(f => ({ ...f, triggerCondition: e.target.value }))} /></div>
                  <div className="flex items-center gap-2"><Switch checked={Boolean(form.isActive)} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ patternId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
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
