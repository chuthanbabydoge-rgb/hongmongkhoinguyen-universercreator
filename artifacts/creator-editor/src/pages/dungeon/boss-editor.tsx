import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Shield, Play } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Boss { id: number; name: string; roomId: number; npcRef: string | null; combatRef: string | null; hpMultiplier: number; damageMultiplier: number; phase: number; enrageTimer: number | null; }

export default function BossEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Boss>>({ name: "Boss", roomId: 0, hpMultiplier: 1, damageMultiplier: 1, phase: 1 });
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: bosses } = useQuery<Boss[]>({ queryKey: ["/api/dungeons", dungeonId, "bosses"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/bosses`); return r.json(); } });
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/bosses`, { method: "POST", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "bosses"] }); toast({ title: "Boss added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (bid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/bosses/${bid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "bosses"] }); toast({ title: "Boss removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simMut = useMutation({
    mutationFn: async (bid: number) => { const r = await apiFetch(`/api/dungeons/${dungeonId}/bosses/${bid}/simulate`, { method: "POST" }); return r.json(); },
    onSuccess: (d) => setSimResult(d),
    onError: () => toast({ title: "Simulation failed", variant: "destructive" }),
  });

  const set = (k: keyof Boss, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Boss Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Boss</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Room</Label>
              <Select value={String(form.roomId)} onValueChange={(v) => set("roomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>NPC Reference (CREATOR-08)</Label><Input value={form.npcRef ?? ""} onChange={(e) => set("npcRef", e.target.value)} placeholder="npc-slug" /></div>
            <div className="space-y-1"><Label>Combat Reference (CREATOR-12)</Label><Input value={form.combatRef ?? ""} onChange={(e) => set("combatRef", e.target.value)} placeholder="combat-slug" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>HP Multiplier</Label><Input type="number" step={0.1} value={form.hpMultiplier ?? 1} onChange={(e) => set("hpMultiplier", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Dmg Multiplier</Label><Input type="number" step={0.1} value={form.damageMultiplier ?? 1} onChange={(e) => set("damageMultiplier", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Phases</Label><Input type="number" min={1} max={5} value={form.phase ?? 1} onChange={(e) => set("phase", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Enrage Timer (s)</Label><Input type="number" value={form.enrageTimer ?? ""} onChange={(e) => set("enrageTimer", e.target.value ? Number(e.target.value) : null)} /></div>
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.roomId} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Boss</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{bosses?.length ?? 0} Bosses</p>
          {(bosses ?? []).map((b) => (
            <Card key={b.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">{b.name}</span>
                    <Badge variant="outline" className="text-xs">{roomMap[b.roomId] ?? `Room ${b.roomId}`}</Badge>
                    <Badge variant="outline" className="text-xs">{b.phase}P</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => simMut.mutate(b.id)} disabled={simMut.isPending}><Play className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(b.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">HP ×{b.hpMultiplier} · Dmg ×{b.damageMultiplier}</div>
              </CardContent>
            </Card>
          ))}
          {simResult && (
            <Card>
              <CardHeader><CardTitle className="text-xs">Simulation Result</CardTitle></CardHeader>
              <CardContent><pre className="text-xs overflow-auto max-h-48">{JSON.stringify(simResult, null, 2)}</pre></CardContent>
            </Card>
          )}
          {(bosses ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No bosses yet.</p>}
        </div>
      </div>
    </div>
  );
}
