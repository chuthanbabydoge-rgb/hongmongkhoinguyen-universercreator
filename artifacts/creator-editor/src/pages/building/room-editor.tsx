import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Grid3X3, Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

const ROOM_TYPES = ["generic", "bedroom", "living_room", "kitchen", "bathroom", "office", "storage", "corridor", "lobby", "shop_floor", "vault"];

export default function RoomEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", roomType: "generic", floorId: "" });

  const { data: floors = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/floors`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/floors`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: rooms = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/rooms`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/rooms`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const floorId = Number(form.floorId) || (floors[0] ? Number((floors[0] as Record<string, unknown>).id) : 0);
      const res = await authFetch(`${BASE}/api/buildings/${id}/rooms`, {
        method: "POST",
        body: JSON.stringify({ name: form.name || "New Room", roomType: form.roomType, floorId, width: 4, depth: 4, height: 3 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setForm({ name: "", roomType: "generic", floorId: "" }); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/rooms`] }); toast({ title: "Room added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/rooms`] }); toast({ title: "Room deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Grid3X3 className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Room Editor</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Room</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input placeholder="Room name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-48" />
          <Select value={form.roomType} onValueChange={v => setForm(f => ({ ...f, roomType: v }))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.floorId} onValueChange={v => setForm(f => ({ ...f, floorId: v }))}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Floor" /></SelectTrigger>
            <SelectContent>{floors.map((f: Record<string, unknown>) => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.name)}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rooms.map((r: Record<string, unknown>) => (
            <Card key={String(r.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">{String(r.name)}{r.isLocked && <Lock className="w-3 h-3 text-destructive" />}</div>
                  <div className="text-xs text-muted-foreground">{String(r.roomType)} — {String(r.width)}×{String(r.depth)}m, max {String(r.maxOccupancy)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.accessType === "public" ? "secondary" : "outline"}>{String(r.accessType)}</Badge>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(r.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {rooms.length === 0 && <div className="text-muted-foreground text-sm col-span-2">No rooms yet.</div>}
        </div>
      )}
    </div>
  );
}
