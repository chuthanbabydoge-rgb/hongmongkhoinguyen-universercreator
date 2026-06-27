import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Globe, Edit2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const TERRAIN_COLORS: Record<string, string> = {
  flat: "bg-green-500/20 text-green-400",
  hills: "bg-lime-500/20 text-lime-400",
  mountains: "bg-zinc-500/20 text-zinc-400",
  ocean: "bg-blue-500/20 text-blue-400",
  desert: "bg-yellow-500/20 text-yellow-400",
  forest: "bg-emerald-500/20 text-emerald-400",
  arctic: "bg-cyan-500/20 text-cyan-400",
  volcanic: "bg-red-500/20 text-red-400",
  custom: "bg-purple-500/20 text-purple-400",
};

export default function WorldRegions() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", terrain: "flat", color: "#4f8ef7" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const { data: world } = useQuery({
    queryKey: ["/api/world-editor", worldId],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}`),
  });

  const { data: regions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/world-editor", worldId, "regions"],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}/regions`),
    enabled: !!worldId,
  });

  const createRegion = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/api/world-editor/${worldId}/regions`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "regions"] }); setCreating(false); setForm({ name: "", terrain: "flat", color: "#4f8ef7" }); },
  });

  const updateRegion = useMutation({
    mutationFn: ({ regionId, data }: { regionId: number; data: Record<string, unknown> }) =>
      apiFetch(`/api/world-editor/${worldId}/regions/${regionId}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "regions"] }); setEditId(null); },
  });

  const deleteRegion = useMutation({
    mutationFn: (regionId: number) =>
      apiFetch(`/api/world-editor/${worldId}/regions/${regionId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "regions"] }),
  });

  const terrains = ["flat", "hills", "mountains", "ocean", "desert", "forest", "arctic", "volcanic", "custom"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Regions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" />Add Region</Button>
        </div>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardHeader><CardTitle className="text-base">New Region</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input
              autoFocus
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Region name..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex gap-3">
              <select
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
                value={form.terrain}
                onChange={(e) => setForm({ ...form, terrain: e.target.value })}
              >
                {terrains.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Color</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-border" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createRegion.mutate({ name: form.name, terrain: form.terrain, color: form.color })} disabled={!form.name.trim() || createRegion.isPending}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : regions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No regions yet. Add your first region!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {regions.map((region: any) => (
            <Card key={region.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: region.color }} />
                    {editId === region.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          className="bg-background border border-border rounded px-2 py-1 text-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateRegion.mutate({ regionId: region.id, data: { name: editName } });
                            if (e.key === "Escape") setEditId(null);
                          }}
                        />
                        <Button size="sm" onClick={() => updateRegion.mutate({ regionId: region.id, data: { name: editName } })}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-sm">{region.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {region.posX.toFixed(0)}, {region.posY.toFixed(0)}, {region.posZ.toFixed(0)} · {region.sizeX}×{region.sizeZ}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs capitalize ${TERRAIN_COLORS[region.terrain] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                      {region.terrain}
                    </Badge>
                    {editId !== region.id && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditId(region.id); setEditName(region.name); }}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRegion.mutate(region.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
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
