import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Map, Save, Play, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function LandEditorPage() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: land, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/lands/${landId}`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}`, { headers: auth() });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: full } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/lands/${landId}/full`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/full`, { headers: auth() });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}`, { method: "PUT", headers: auth(), body: JSON.stringify({ ...land, ...form }) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}`] }); toast({ title: "Land saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const publishMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/publish`, { method: "POST", headers: auth() });
      if (!res.ok) throw new Error("Publish failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}`] }); toast({ title: "Land published" }); },
  });

  if (isLoading) return <div className="text-muted-foreground p-4">Loading…</div>;
  if (!land) return <div className="text-destructive p-4">Land not found</div>;

  const fullData = full as { parcels?: unknown[]; boundaries?: unknown[]; zones?: unknown[]; roads?: unknown[]; utilities?: unknown[]; teleports?: unknown[]; buildings?: unknown[] } | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Map className="w-5 h-5 text-emerald-500" />{String(land.name)}</h1>
        <div className="flex gap-2">
          <Badge variant={land.isPublished ? "default" : "secondary"}>{land.isPublished ? "Published" : "Draft"}</Badge>
          <Button size="sm" variant="outline" onClick={() => publishMut.mutate()}><Play className="w-4 h-4 mr-1" />Publish</Button>
          <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}><Save className="w-4 h-4 mr-1" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          {["general", "parcels", "boundaries", "ownership", "zones", "terrain", "buildings", "roads", "utilities", "teleports", "marketplace", "statistics", "simulation", "history"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Land Properties</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-sm font-medium">Name</label><Input defaultValue={String(land.name)} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Slug</label><Input defaultValue={String(land.slug ?? "")} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><label className="text-sm font-medium">Description</label><Textarea defaultValue={String(land.description ?? "")} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Type</label><Input defaultValue={String(land.landType)} onChange={(e) => setForm((f) => ({ ...f, landType: e.target.value }))} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Zone</label><Input defaultValue={String(land.landZone ?? "")} onChange={(e) => setForm((f) => ({ ...f, landZone: e.target.value }))} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Width</label><Input type="number" defaultValue={String(land.width ?? 100)} onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))} /></div>
              <div className="space-y-1"><label className="text-sm font-medium">Depth</label><Input type="number" defaultValue={String(land.depth ?? 100)} onChange={(e) => setForm((f) => ({ ...f, depth: e.target.value }))} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {["parcels", "boundaries", "zones", "roads", "utilities", "teleports", "buildings"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card><CardHeader><CardTitle className="capitalize">{tab}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">{(fullData?.[tab as keyof typeof fullData] as unknown[] | undefined)?.length ?? 0} {tab} defined</div>
                <div className="text-muted-foreground text-sm">Use the dedicated {tab} editor via the sidebar to manage {tab}.</div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="ownership" className="mt-4">
          <Card><CardHeader><CardTitle>Ownership</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">Manage land owners via the Ownership Manager.</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="terrain" className="mt-4">
          <Card><CardHeader><CardTitle>Terrain</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">Configure terrain via the Terrain Editor.</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="marketplace" className="mt-4">
          <Card><CardHeader><CardTitle>Marketplace</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">Manage marketplace listings for this land.</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="statistics" className="mt-4">
          <Card><CardHeader><CardTitle>Statistics</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">View land statistics and analytics.</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="simulation" className="mt-4">
          <Card><CardHeader><CardTitle>Simulation</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">Run land simulation via the Land Simulator.</div></CardContent></Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card><CardHeader><CardTitle>History</CardTitle></CardHeader><CardContent><div className="text-muted-foreground text-sm">View land change history.</div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
