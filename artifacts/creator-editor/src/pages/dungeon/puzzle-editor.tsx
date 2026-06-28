import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, BookOpen, Play } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Puzzle { id: number; name: string; description: string | null; roomId: number; timeLimit: number | null; isRequired: boolean; isActive: boolean; }

export default function PuzzleEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Puzzle>>({ name: "Puzzle", roomId: 0, isRequired: false, isActive: true });
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: puzzles } = useQuery<Puzzle[]>({ queryKey: ["/api/dungeons", dungeonId, "puzzles"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/puzzles`); return r.json(); } });
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/puzzles`, { method: "POST", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "puzzles"] }); toast({ title: "Puzzle added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (pid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/puzzles/${pid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "puzzles"] }); toast({ title: "Puzzle removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simMut = useMutation({
    mutationFn: async (pid: number) => { const r = await apiFetch(`/api/dungeons/${dungeonId}/puzzles/${pid}/simulate`, { method: "POST" }); return r.json(); },
    onSuccess: (d) => setSimResult(d),
    onError: () => toast({ title: "Simulation failed", variant: "destructive" }),
  });

  const set = (k: keyof Puzzle, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Puzzle Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Puzzle</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} /></div>
            <div className="space-y-1"><Label>Room</Label>
              <Select value={String(form.roomId)} onValueChange={(v) => set("roomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Time Limit (s, blank = unlimited)</Label><Input type="number" value={form.timeLimit ?? ""} onChange={(e) => set("timeLimit", e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isRequired ?? false} onCheckedChange={(v) => set("isRequired", v)} /><Label>Required</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive ?? true} onCheckedChange={(v) => set("isActive", v)} /><Label>Active</Label></div>
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.roomId} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Puzzle</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{puzzles?.length ?? 0} Puzzles</p>
          {(puzzles ?? []).map((p) => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-xs">{roomMap[p.roomId] ?? `Room ${p.roomId}`}</Badge>
                      {p.isRequired && <Badge className="text-xs bg-red-600">Required</Badge>}
                      {p.timeLimit && <span className="text-xs text-muted-foreground">{p.timeLimit}s</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => simMut.mutate(p.id)} disabled={simMut.isPending}><Play className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(p.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {simResult && <Card><CardHeader><CardTitle className="text-xs">Puzzle Simulation</CardTitle></CardHeader><CardContent><pre className="text-xs overflow-auto max-h-36">{JSON.stringify(simResult, null, 2)}</pre></CardContent></Card>}
          {(puzzles ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No puzzles yet.</p>}
        </div>
      </div>
    </div>
  );
}
