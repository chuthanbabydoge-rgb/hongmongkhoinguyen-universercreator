import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Save, Layers, DoorOpen, Grid3X3, Sofa, Zap, Users, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function BuildingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: building, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/buildings/${id}`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}`);
      if (!res.ok) throw new Error("Failed");
      const b = await res.json();
      setForm({ name: String(b.name ?? ""), description: String(b.description ?? "") });
      return b;
    },
    enabled: !!id,
  });

  const { data: floors } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/floors`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/floors`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: rooms } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/rooms`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/rooms`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}`, { method: "PATCH", body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}`] }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save", variant: "destructive" }),
  });

  if (isLoading) return <div className="text-muted-foreground p-8">Loading building...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold">{String(building?.name ?? "Building Editor")}</h1>
            <div className="text-xs text-muted-foreground capitalize">{String(building?.buildingType ?? "").replace("_", " ")} — {String(building?.buildingCategory ?? "")}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={building?.isPublished ? "default" : "secondary"}>{building?.isPublished ? "Published" : "Draft"}</Badge>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-1" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="floors"><Layers className="w-3 h-3 mr-1" />Floors ({floors?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="rooms"><Grid3X3 className="w-3 h-3 mr-1" />Rooms ({rooms?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="doors"><DoorOpen className="w-3 h-3 mr-1" />Doors</TabsTrigger>
          <TabsTrigger value="windows">Windows</TabsTrigger>
          <TabsTrigger value="furniture"><Sofa className="w-3 h-3 mr-1" />Furniture</TabsTrigger>
          <TabsTrigger value="utilities"><Zap className="w-3 h-3 mr-1" />Utilities</TabsTrigger>
          <TabsTrigger value="npcs"><Users className="w-3 h-3 mr-1" />NPCs</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-3 h-3 mr-1" />Security</TabsTrigger>
          <TabsTrigger value="spawn"><MapPin className="w-3 h-3 mr-1" />Spawn</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Name</label>
                <Input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Description</label>
                <Textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" rows={3} /></div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Floors</div><div className="text-xl font-bold">{String(building?.floorCount ?? 1)}</div></div>
                <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Max Occupancy</div><div className="text-xl font-bold">{String(building?.maxOccupancy ?? 10)}</div></div>
                <div className="bg-muted/40 rounded p-3"><div className="text-muted-foreground">Current</div><div className="text-xl font-bold">{String(building?.currentOccupancy ?? 0)}</div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floors" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Floors ({floors?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(floors ?? []).map((f: Record<string, unknown>) => (
                <div key={String(f.id)} className="flex items-center justify-between p-3 border rounded">
                  <div><div className="font-medium">{String(f.name)}</div><div className="text-xs text-muted-foreground">Floor {String(f.floorNumber)} — {String(f.height)}m height</div></div>
                </div>
              ))}
              {(floors ?? []).length === 0 && <div className="text-muted-foreground text-sm">No floors configured.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Rooms ({rooms?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(rooms ?? []).map((r: Record<string, unknown>) => (
                <div key={String(r.id)} className="flex items-center justify-between p-3 border rounded">
                  <div><div className="font-medium">{String(r.name)}</div><div className="text-xs text-muted-foreground">{String(r.roomType)} — {String(r.width)}×{String(r.depth)}m</div></div>
                  <Badge variant={r.isLocked ? "destructive" : "secondary"}>{r.isLocked ? "Locked" : "Open"}</Badge>
                </div>
              ))}
              {(rooms ?? []).length === 0 && <div className="text-muted-foreground text-sm">No rooms configured.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {["doors", "windows", "furniture", "utilities", "npcs", "security", "spawn"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card><CardContent className="py-8 text-center text-muted-foreground capitalize">{tab} management — use the dedicated {tab} editor page for full control.</CardContent></Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
