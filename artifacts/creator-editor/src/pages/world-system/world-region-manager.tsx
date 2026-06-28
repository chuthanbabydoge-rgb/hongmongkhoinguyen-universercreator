import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldRegionManager() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", regionType: "open", boundsMinX: 0, boundsMinY: 0, boundsMaxX: 100, boundsMaxY: 100 });

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: regions, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "regions"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/regions`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/regions`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "regions"] }); setShowDialog(false); toast({ title: "Region created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (regionId: number) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/regions/${regionId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "regions"] }); toast({ title: "Region deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-green-500" />Region Manager</h1>
          <p className="text-muted-foreground">Define and manage world regions with custom properties.</p>
        </div>
        {worldId && <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Region</Button>}
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {worldId && (
        <div className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : (regions ?? []).length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No regions defined. Click "Add Region" to create one.</CardContent></Card>
          ) : (regions ?? []).map(r => (
            <Card key={String(r.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{String(r.name)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">({String(r.boundsMinX)},{String(r.boundsMinY)}) → ({String(r.boundsMaxX)},{String(r.boundsMaxY)})</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{String(r.regionType)}</Badge>
                  {r.pvpEnabled && <Badge variant="destructive" className="text-xs">PvP</Badge>}
                  <Badge variant="outline">Lv {String(r.levelMin)}–{String(r.levelMax)}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete region?")) deleteMutation.mutate(Number(r.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Region</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Type</Label>
              <Select value={form.regionType} onValueChange={v => setForm(f => ({ ...f, regionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["open", "safe", "pvp", "dungeon", "town", "boss", "instance"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Min X</Label><Input type="number" value={form.boundsMinX} onChange={e => setForm(f => ({ ...f, boundsMinX: Number(e.target.value) }))} /></div>
              <div><Label>Min Y</Label><Input type="number" value={form.boundsMinY} onChange={e => setForm(f => ({ ...f, boundsMinY: Number(e.target.value) }))} /></div>
              <div><Label>Max X</Label><Input type="number" value={form.boundsMaxX} onChange={e => setForm(f => ({ ...f, boundsMaxX: Number(e.target.value) }))} /></div>
              <div><Label>Max Y</Label><Input type="number" value={form.boundsMaxY} onChange={e => setForm(f => ({ ...f, boundsMaxY: Number(e.target.value) }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
