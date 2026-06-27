import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const RELATIONS = ["ally","enemy","neutral","friend","rival","leader","follower","custom"];
const RELATION_COLORS: Record<string, string> = {
  ally: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  enemy: "text-red-400 border-red-500/30 bg-red-500/10",
  friend: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  rival: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  leader: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  follower: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
};

export default function NpcRelationEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ targetNpcId: 0, relation: "neutral", affinity: 0, notes: "" });

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: relations = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "relations"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/relations`) });
  const { data: allNpcs = [] } = useQuery({ queryKey: ["/api/npc-editor"], queryFn: () => apiFetch("/api/npc-editor?limit=100") });

  const createRelation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/relations`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "relations"] }); setCreating(false); setForm({ targetNpcId: 0, relation: "neutral", affinity: 0, notes: "" }); },
  });

  const deleteRelation = useMutation({
    mutationFn: (relId: number) => apiFetch(`/api/npc-editor/${npcId}/relations/${relId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "relations"] }),
  });

  const otherNpcs = (allNpcs as any[]).filter((n) => n.id !== npcId);
  const getNpcName = (id: number) => (allNpcs as any[]).find((n) => n.id === id)?.name ?? `NPC #${id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Relation Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`} · {(relations as any[]).length} relations</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={otherNpcs.length === 0}><Plus className="w-4 h-4 mr-2" /> Add Relation</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm col-span-2" value={form.targetNpcId} onChange={(e) => setForm({ ...form, targetNpcId: Number(e.target.value) })}>
                <option value={0}>Select NPC…</option>
                {otherNpcs.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
                {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Input type="number" placeholder="Affinity (-100…100)" min={-100} max={100} value={form.affinity} onChange={(e) => setForm({ ...form, affinity: Number(e.target.value) })} />
            </div>
            <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={() => createRelation.mutate(form)} disabled={!form.targetNpcId || createRelation.isPending}>Add Relation</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {otherNpcs.length === 0 && (
        <Card><CardContent className="py-8 text-center"><p className="text-sm text-muted-foreground">Create more NPCs to define relations between them.</p></CardContent></Card>
      )}

      {(relations as any[]).length === 0 && otherNpcs.length > 0 ? (
        <Card><CardContent className="py-16 text-center"><Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No relations defined</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(relations as any[]).map((r: any) => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{getNpcName(r.targetNpcId)}</p>
                      {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border capitalize ${RELATION_COLORS[r.relation] ?? "text-zinc-400 border-zinc-500/30 bg-zinc-500/10"}`}>{r.relation}</Badge>
                    <span className={`text-xs font-mono ${r.affinity > 0 ? "text-emerald-400" : r.affinity < 0 ? "text-red-400" : "text-muted-foreground"}`}>{r.affinity > 0 ? "+" : ""}{r.affinity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRelation.mutate(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
