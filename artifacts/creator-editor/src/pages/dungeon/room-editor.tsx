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
import { Plus, Trash2, ArrowLeft, Layers } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Room { id: number; name: string; roomType: string; width: number; height: number; depth: number; isEntrance: boolean; isExit: boolean; isLocked: boolean; displayOrder: number; }

const ROOM_TYPES = ["entrance","corridor","chamber","boss_room","treasure_room","puzzle_room","spawn_room","checkpoint_room","exit_room","secret_room"];

export default function RoomEditor() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Room>>({ name: "New Room", roomType: "chamber", width: 10, height: 10, depth: 10, isEntrance: false, isExit: false, isLocked: false, displayOrder: 0 });
  const [editing, setEditing] = useState<Room | null>(null);

  const { data: rooms } = useQuery<Room[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });

  const createMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`, { method: "POST", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "rooms"] }); toast({ title: "Room added" }); setForm({ name: "New Room", roomType: "chamber", width: 10, height: 10, depth: 10, isEntrance: false, isExit: false, isLocked: false, displayOrder: 0 }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: async (r: Room) => { const res = await apiFetch(`/api/dungeons/${dungeonId}/rooms/${r.id}`, { method: "PATCH", body: JSON.stringify(r) }); return res.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "rooms"] }); toast({ title: "Room updated" }); setEditing(null); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (rid: number) => { await apiFetch(`/api/dungeons/${dungeonId}/rooms/${rid}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId, "rooms"] }); toast({ title: "Room deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const f = editing ?? form;
  const setF = (k: keyof Room, v: unknown) => editing ? setEditing((e) => e ? { ...e, [k]: v } : null) : setForm((fm) => ({ ...fm, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Room Editor</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">{editing ? `Edit: ${editing.name}` : "Add Room"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Name</Label><Input value={(f as Room).name ?? ""} onChange={(e) => setF("name", e.target.value)} /></div>
            <div className="space-y-1"><Label>Room Type</Label>
              <Select value={(f as Room).roomType ?? "chamber"} onValueChange={(v) => setF("roomType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROOM_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Width</Label><Input type="number" value={(f as Room).width ?? 10} onChange={(e) => setF("width", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Height</Label><Input type="number" value={(f as Room).height ?? 10} onChange={(e) => setF("height", Number(e.target.value))} /></div>
              <div className="space-y-1"><Label>Depth</Label><Input type="number" value={(f as Room).depth ?? 10} onChange={(e) => setF("depth", Number(e.target.value))} /></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={(f as Room).isEntrance ?? false} onCheckedChange={(v) => setF("isEntrance", v)} /><Label>Entrance</Label></div>
              <div className="flex items-center gap-2"><Switch checked={(f as Room).isExit ?? false} onCheckedChange={(v) => setF("isExit", v)} /><Label>Exit</Label></div>
              <div className="flex items-center gap-2"><Switch checked={(f as Room).isLocked ?? false} onCheckedChange={(v) => setF("isLocked", v)} /><Label>Locked</Label></div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={() => updateMut.mutate(editing)} disabled={updateMut.isPending} className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </>
              ) : (
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="flex-1"><Plus className="w-4 h-4 mr-2" />Add Room</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{rooms?.length ?? 0} Rooms</p>
          {(rooms ?? []).map((r) => (
            <Card key={r.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      <Badge variant="outline" className="text-xs capitalize">{r.roomType.replace(/_/g," ")}</Badge>
                      {r.isEntrance && <Badge className="text-xs bg-green-600">Entry</Badge>}
                      {r.isExit && <Badge className="text-xs bg-blue-600">Exit</Badge>}
                      {r.isLocked && <Badge className="text-xs bg-yellow-600">Locked</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMut.mutate(r.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(rooms ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No rooms yet.</p>}
        </div>
      </div>
    </div>
  );
}
