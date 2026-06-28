import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossArenaEditor() {
  const [, params] = useRoute("/boss-arena-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: arenas, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "arenas"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/arenas`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/arenas`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Main Arena", arenaType: "enclosed", width: 50, height: 50, depth: 50 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "arenas"] }); toast({ title: "Arena created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ arenaId, data }: { arenaId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/arenas/${arenaId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "arenas"] }); setEditingId(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (arenaId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/arenas/${arenaId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "arenas"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Arena</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-green-500" />Arena Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Arena</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (arenas ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No arenas. Click "Add Arena" to create a boss arena.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(arenas ?? []).map((a: Record<string, unknown>) => (
            <Card key={String(a.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{String(a.name)}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(a.id)); setForm({ ...a }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete arena?")) deleteMutation.mutate(Number(a.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground capitalize">
                {String(a.arenaType).replace(/_/g, " ")} · {String(a.width)}×{String(a.height)}×{String(a.depth)} · Locks on start: {a.lockOnStart ? "Yes" : "No"}
              </CardContent>
              {editingId === Number(a.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Arena Type</Label><Input value={String(form.arenaType ?? "")} onChange={e => setForm(f => ({ ...f, arenaType: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["width","Width"],["height","Height"],["depth","Depth"]].map(([k,l]) => (
                      <div key={k} className="space-y-1"><Label>{l}</Label><Input type="number" value={String(form[k] ?? 50)} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>
                    ))}
                  </div>
                  <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={String(form.description ?? "")} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["lockOnStart","Lock on Start"],["resetOnWipe","Reset on Wipe"],["allowRanged","Allow Ranged"]].map(([k,l]) => (
                      <div key={k} className="flex items-center gap-2"><Switch checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: v }))} /><Label>{l}</Label></div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ arenaId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
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
