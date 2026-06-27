import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const FACTION_COLORS = ["#4f8ef7","#ef4444","#22c55e","#f59e0b","#a855f7","#06b6d4","#ec4899","#f97316"];

export default function NpcFactionManager() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#4f8ef7", isPlayerFaction: false });
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});

  const { data: factions = [] } = useQuery({ queryKey: ["/api/npc-editor/factions"], queryFn: () => apiFetch("/api/npc-editor/factions") });

  const createFaction = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch("/api/npc-editor/factions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor/factions"] }); setCreating(false); setForm({ name: "", description: "", color: "#4f8ef7", isPlayerFaction: false }); },
  });

  const updateFaction = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => apiFetch(`/api/npc-editor/factions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor/factions"] }); setEditId(null); },
  });

  const deleteFaction = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/npc-editor/factions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor/factions"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Flag className="w-6 h-6 text-primary" /> Faction Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">{(factions as any[]).length} factions defined</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> New Faction</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Faction name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Color:</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-8 w-12 rounded cursor-pointer" />
                <div className="flex gap-1 flex-wrap">
                  {FACTION_COLORS.map((c) => (
                    <button key={c} className="w-5 h-5 rounded-full border-2 border-transparent hover:border-white" style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                  ))}
                </div>
              </div>
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="flex gap-2">
              <Button onClick={() => createFaction.mutate(form)} disabled={!form.name || createFaction.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(factions as any[]).length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Flag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No factions yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(factions as any[]).map((faction: any) => (
            <Card key={faction.id} style={{ borderColor: `${faction.color}40` }}>
              <CardContent className="pt-4 pb-3">
                {editId === faction.id ? (
                  <div className="space-y-2">
                    <Input value={String(editForm.name ?? faction.name)} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-sm" />
                    <Textarea value={String(editForm.description ?? faction.description ?? "")} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="text-xs" />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-xs" onClick={() => updateFaction.mutate({ id: faction.id, data: editForm })} disabled={updateFaction.isPending}><Check className="w-3 h-3 mr-1" /> Save</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditId(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ background: faction.color }} />
                        <p className="font-medium text-sm">{faction.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {faction.isPlayerFaction && <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Player</Badge>}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditId(faction.id); setEditForm({ name: faction.name, description: faction.description, color: faction.color }); }}><Edit2 className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteFaction.mutate(faction.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    {faction.description && <p className="text-xs text-muted-foreground">{faction.description}</p>}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
