import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hexagon, Plus, Trash2, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const PORTAL_TYPES = ["dungeon_entrance", "city_gate", "teleport", "world_gate", "instance_portal", "fast_travel"];

export default function WorldPortalManagerSystem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [traverseResult, setTraverseResult] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", portalType: "world_gate", fromX: 0, fromY: 0, fromZ: 0, toX: 0, toY: 0, toZ: 0, requiredLevel: 1, isActive: true, isBidirectional: true });

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: portals, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "portals"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/portals`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/portals`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "portals"] }); setShowDialog(false); toast({ title: "Portal created" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/portals/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-system", worldId, "portals"] }); toast({ title: "Portal deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const traverseMutation = useMutation({
    mutationFn: async (portalId: number) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/portals/${portalId}/traverse`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ playerId: 1 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setTraverseResult(data); toast({ title: "Portal traversed!" }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Hexagon className="w-6 h-6 text-violet-500" />Portal Manager</h1>
          <p className="text-muted-foreground">Configure world portals, teleports, and dungeon entrances.</p>
        </div>
        {worldId && <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Portal</Button>}
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {traverseResult && (
        <Card className="border-violet-500/50">
          <CardContent className="py-3 text-sm">
            <div className="font-medium text-violet-500 mb-1">Portal Traversal Result</div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Destination:</span>
              <span>({String(traverseResult.destination && (traverseResult.destination as Record<string, unknown>).x)},{String(traverseResult.destination && (traverseResult.destination as Record<string, unknown>).y)},{String(traverseResult.destination && (traverseResult.destination as Record<string, unknown>).z)})</span>
            </div>
          </CardContent>
        </Card>
      )}

      {worldId && (
        <div className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : (portals ?? []).length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No portals defined.</CardContent></Card>
          ) : (portals ?? []).map(p => (
            <Card key={String(p.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">{String(p.name)}
                    {(p.isBidirectional as boolean) && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <div className="text-xs text-muted-foreground">From ({String(p.fromX)},{String(p.fromY)},{String(p.fromZ)}) → To ({String(p.toX)},{String(p.toY)},{String(p.toZ)})</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">{String(p.portalType).replace(/_/g, " ")}</Badge>
                  <Badge variant={p.isActive ? "default" : "outline"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => traverseMutation.mutate(Number(p.id))} disabled={!p.isActive}><Zap className="w-3 h-3 mr-1" />Test</Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(Number(p.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Portal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Type</Label>
              <Select value={form.portalType} onValueChange={v => setForm(f => ({ ...f, portalType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PORTAL_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["fromX", "fromY", "fromZ"].map(k => <div key={k}><Label className="text-xs">{k}</Label><Input type="number" value={(form as Record<string, unknown>)[k] as number} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>)}
              {["toX", "toY", "toZ"].map(k => <div key={k}><Label className="text-xs">{k}</Label><Input type="number" value={(form as Record<string, unknown>)[k] as number} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>)}
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
