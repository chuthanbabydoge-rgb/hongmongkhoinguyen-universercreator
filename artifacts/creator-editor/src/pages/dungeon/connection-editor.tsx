import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, ArrowRight, ArrowLeftRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; }
interface Connection { id: number; fromRoomId: number; toRoomId: number; isBidirectional: boolean; isLocked: boolean; lockType: string; }

export default function ConnectionEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Connection>>({ fromRoomId: 0, toRoomId: 0, isBidirectional: true, isLocked: false, lockType: "none" });

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: connections } = useQuery<Connection[]>({ queryKey: ["/api/dungeons", dungeonId, "connections"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/connections`); return r.json(); } });

  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r.name]));

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/connections`, { method: "POST", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "connections"] }); toast({ title: "Connection added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (cid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/connections/${cid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "connections"] }); toast({ title: "Connection removed" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const set = (k: keyof Connection, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Connection Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Connection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>From Room</Label>
              <Select value={String(form.fromRoomId)} onValueChange={(v) => set("fromRoomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>To Room</Label>
              <Select value={String(form.toRoomId)} onValueChange={(v) => set("toRoomId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>{(rooms ?? []).map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isBidirectional ?? true} onCheckedChange={(v) => set("isBidirectional", v)} /><Label>Bidirectional</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isLocked ?? false} onCheckedChange={(v) => set("isLocked", v)} /><Label>Locked</Label></div>
            </div>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.fromRoomId || !form.toRoomId} className="w-full">
              <Plus className="w-4 h-4 mr-2" />Add Connection
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{connections?.length ?? 0} Connections</p>
          {(connections ?? []).map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{roomMap[c.fromRoomId] ?? `Room ${c.fromRoomId}`}</span>
                  {c.isBidirectional ? <ArrowLeftRight className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="font-medium">{roomMap[c.toRoomId] ?? `Room ${c.toRoomId}`}</span>
                  {c.isLocked && <Badge variant="outline" className="text-xs">Locked</Badge>}
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button>
              </CardContent>
            </Card>
          ))}
          {(connections ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No connections yet.</p>}
        </div>
      </div>
    </div>
  );
}
