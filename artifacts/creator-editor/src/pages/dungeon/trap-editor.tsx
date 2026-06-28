import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, AlertCircle, Play } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Trap { id: number; name: string; roomId: number; trapType: string; damageAmount: number; canDisarm: boolean; disarmDifficulty: number; isActive: boolean; }
const TRAP_TYPES = ["pressure_plate","arrow_trap","spike_trap","poison_gas","fire_trap","ice_trap","electric_trap","magic_trap","alarm_trap","pit_trap"];

export default function TrapEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Trap>>({ name: "Trap", roomId: 0, trapType: "pressure_plate", damageAmount: 10, canDisarm: true, disarmDifficulty: 10, isActive: true });
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: traps } = useQuery<Trap[]>({ queryKey: ["/api/dungeons", dungeonId, "traps"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/traps`); return r.json(); } });
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/traps`, { method: "POST", body: JSON.stringify({ ...form, positionX: 0, positionY: 0, damageFormula: "flat" }) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "traps"] }); toast({ title: "Trap added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (tid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/traps/${tid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "traps"] }); toast({ title: "Trap removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simMut = useMutation({
    mutationFn: async (tid: number) => { const r = await apiFetch(`/api/dungeons/${dungeonId}/traps/${tid}/simulate`, { method: "POST" }); return r.json(); },
    onSuccess: (d) => setSimResult(d),
    onError: () => toast({ title: "Simulation failed", variant: "destructive" }),
  });

  const set = (k: keyof Trap, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Trap Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Trap</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Room</Label>
              <Select value={String(form.roomId)} onValueChange={(v) => set("roomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Trap Type</Label>
              <Select value={form.trapType ?? "pressure_plate"} onValueChange={(v) => set("trapType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRAP_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Damage Amount</Label><Input type="number" value={form.damageAmount ?? 10} onChange={(e) => set("damageAmount", Number(e.target.value))} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.canDisarm ?? true} onCheckedChange={(v) => set("canDisarm", v)} /><Label>Can Disarm</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive ?? true} onCheckedChange={(v) => set("isActive", v)} /><Label>Active</Label></div>
            </div>
            {form.canDisarm && <div className="space-y-1"><Label>Disarm Difficulty (1-20)</Label><Input type="number" min={1} max={20} value={form.disarmDifficulty ?? 10} onChange={(e) => set("disarmDifficulty", Number(e.target.value))} /></div>}
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.roomId} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Trap</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{traps?.length ?? 0} Traps</p>
          {(traps ?? []).map((t) => (
            <Card key={t.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-xs capitalize">{t.trapType.replace(/_/g," ")}</Badge>
                      <span className="text-xs text-muted-foreground">{t.damageAmount} dmg</span>
                      {t.canDisarm && <Badge variant="secondary" className="text-xs">Disarmable</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => simMut.mutate(t.id)} disabled={simMut.isPending}><Play className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(t.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {simResult && <Card><CardHeader><CardTitle className="text-xs">Trap Simulation</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto max-h-36">{JSON.stringify(simResult, null, 2)}</pre></CardContent></Card>}
          {(traps ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No traps yet.</p>}
        </div>
      </div>
    </div>
  );
}
