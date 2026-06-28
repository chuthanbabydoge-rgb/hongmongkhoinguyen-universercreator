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
import { Plus, Trash2, ArrowLeft, Swords } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Monster { id: number; roomId: number; npcRef: string | null; combatRef: string | null; hpMultiplier: number; damageMultiplier: number; xpReward: number; aggroRange: number; lootTableRef: string | null; }

export default function MonsterEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Monster>>({ roomId: 0, hpMultiplier: 1, damageMultiplier: 1, xpReward: 50, aggroRange: 10 });

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: monsters } = useQuery<Monster[]>({ queryKey: ["/api/dungeons", dungeonId, "monsters"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/monsters`); return r.json(); } });
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/monsters`, { method: "POST", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "monsters"] }); toast({ title: "Monster added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (mid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/monsters/${mid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "monsters"] }); toast({ title: "Monster removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const set = (k: keyof Monster, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Monster Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Monster</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Room</Label>
              <Select value={String(form.roomId)} onValueChange={(v) => set("roomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>NPC Reference (CREATOR-08)</Label><Input value={form.npcRef ?? ""} onChange={(e) => set("npcRef", e.target.value)} placeholder="npc-slug" /></div>
            <div className="space-y-1"><Label>Loot Table Reference (CREATOR-10)</Label><Input value={form.lootTableRef ?? ""} onChange={(e) => set("lootTableRef", e.target.value)} placeholder="loot-table-id" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>HP Multiplier</Label><Input type="number" step={0.1} value={form.hpMultiplier ?? 1} onChange={(e) => set("hpMultiplier", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Dmg Multiplier</Label><Input type="number" step={0.1} value={form.damageMultiplier ?? 1} onChange={(e) => set("damageMultiplier", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>XP Reward</Label><Input type="number" value={form.xpReward ?? 50} onChange={(e) => set("xpReward", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Aggro Range</Label><Input type="number" value={form.aggroRange ?? 10} onChange={(e) => set("aggroRange", Number(e.target.value))} /></div>
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.roomId} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Monster</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{monsters?.length ?? 0} Monsters</p>
          {(monsters ?? []).map((m, i) => (
            <Card key={m.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Monster #{i + 1}</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-xs">{roomMap[m.roomId] ?? `Room ${m.roomId}`}</Badge>
                      <span className="text-xs text-muted-foreground">HP ×{m.hpMultiplier} · {m.xpReward} XP</span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(m.id)}><Trash2 className="w-3 h-3" /></Button>
              </CardContent>
            </Card>
          ))}
          {(monsters ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No monsters yet.</p>}
        </div>
      </div>
    </div>
  );
}
