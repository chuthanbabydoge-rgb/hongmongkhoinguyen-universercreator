import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Zap, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WorldPortalManager() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", posX: 0, posY: 0, posZ: 0, targetWorldUuid: "", cooldownSeconds: 0 });

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: portals = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/world-editor", worldId, "portals"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/portals`), enabled: !!worldId });

  const createPortal = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/world-editor/${worldId}/portals`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "portals"] }); setCreating(false); },
  });

  const deletePortal = useMutation({
    mutationFn: (portalId: number) => apiFetch(`/api/world-editor/${worldId}/portals/${portalId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "portals"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ portalId, isActive }: { portalId: number; isActive: boolean }) =>
      apiFetch(`/api/world-editor/${worldId}/portals/${portalId}`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "portals"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Portal Manager</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`} · {portals.length} portal{portals.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="ml-auto"><Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />Add Portal</Button></div>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-5 space-y-3">
            <input autoFocus className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="Portal name..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              {["posX", "posY", "posZ"].map((axis) => (
                <div key={axis}>
                  <label className="text-xs text-muted-foreground">{axis.slice(-1).toUpperCase()}</label>
                  <input type="number" className="w-full bg-background border border-border rounded-md px-2 py-1 text-sm" value={(form as any)[axis]} onChange={(e) => setForm({ ...form, [axis]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="Target world UUID (optional)..." value={form.targetWorldUuid} onChange={(e) => setForm({ ...form, targetWorldUuid: e.target.value })} />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Cooldown (seconds): {form.cooldownSeconds}</label>
              <input type="range" min={0} max={300} value={form.cooldownSeconds} onChange={(e) => setForm({ ...form, cooldownSeconds: Number(e.target.value) })} className="w-full accent-primary" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createPortal.mutate(form)} disabled={!form.name.trim()}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : portals.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No portals yet. Add a teleportation portal.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {portals.map((portal: any) => (
            <Card key={portal.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-4 h-4 shrink-0 ${portal.isActive ? "text-cyan-400" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium text-sm">{portal.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-mono">{portal.posX.toFixed(1)}, {portal.posY.toFixed(1)}, {portal.posZ.toFixed(1)}</span>
                        {portal.targetWorldUuid && (
                          <><ArrowRight className="w-3 h-3" /><span className="font-mono text-cyan-400/70 truncate max-w-[120px]">{portal.targetWorldUuid}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {portal.cooldownSeconds > 0 && <Badge variant="secondary" className="text-xs">{portal.cooldownSeconds}s cooldown</Badge>}
                    {portal.isBidirectional && <Badge variant="outline" className="text-xs">2-way</Badge>}
                    <Badge className={`text-xs cursor-pointer ${portal.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}
                      onClick={() => toggleActive.mutate({ portalId: portal.id, isActive: !portal.isActive })}>
                      {portal.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePortal.mutate(portal.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
