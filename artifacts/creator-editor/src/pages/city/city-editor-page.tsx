import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Save, Map, Cpu, Users, ArrowLeft, Layers, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityEditorPage() {
  const [, params] = useRoute("/city-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: city, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/cities/${id}`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${id}`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load city");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: full } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/cities/${id}/full`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${id}/full`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load city");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => { if (city) setForm(city); }, [city]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${id}`, { method: "PATCH", headers: headers(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed to save city");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${id}`] }); toast({ title: "City saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save city", variant: "destructive" }),
  });

  const snapshotMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${id}/snapshot`, { method: "POST", headers: headers(), body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Failed to create snapshot");
      return res.json();
    },
    onSuccess: () => toast({ title: "Snapshot created" }),
    onError: () => toast({ title: "Error", description: "Failed to create snapshot", variant: "destructive" }),
  });

  if (isLoading) return <div className="text-muted-foreground p-8">Loading city...</div>;
  if (!city) return <div className="text-muted-foreground p-8">City not found.</div>;

  const districts = (full?.districts as unknown[]) ?? [];
  const zones = (full?.zones as unknown[]) ?? [];
  const buildings = (full?.buildings as unknown[]) ?? [];
  const roads = (full?.roads as unknown[]) ?? [];
  const utilities = (full?.utilities as unknown[]) ?? [];
  const services = (full?.services as unknown[]) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/city-browser"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Building2 className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">{String(city.name)}</h1>
            <div className="text-xs text-muted-foreground capitalize">{String(city.cityType).replace(/_/g, " ")} • v{String(city.version)}</div>
          </div>
          <Badge variant={city.isPublished ? "default" : "secondary"}>{city.isPublished ? "Published" : "Draft"}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => snapshotMut.mutate()} disabled={snapshotMut.isPending}>Snapshot</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
        {[
          { label: "Districts", count: districts.length, href: `/city-district-editor/${id}`, icon: Map },
          { label: "Zones", count: zones.length, href: `/city-zone-editor/${id}`, icon: Layers },
          { label: "Buildings", count: buildings.length, href: `/city-building-manager/${id}`, icon: Building2 },
          { label: "Roads", count: roads.length, href: `/city-road-editor/${id}`, icon: Map },
          { label: "Utilities", count: utilities.length, href: `/city-utility-manager/${id}`, icon: Cpu },
          { label: "Services", count: services.length, href: `/city-service-manager/${id}`, icon: Users },
        ].map(({ label, count, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="py-3">
                <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="economy">Economy</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-4 h-4" />General Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">City Name</label>
                  <Input value={String(form.name ?? "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">City Type</label>
                  <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(form.cityType ?? "city")} onChange={(e) => setForm({ ...form, cityType: e.target.value })}>
                    {["metropolis","city","town","village","capital","port","fortress","trade_hub","resort","underground","floating","custom"].map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={String(form.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Population</label>
                  <Input type="number" value={String(form.population ?? 0)} onChange={(e) => setForm({ ...form, population: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Max Population</label>
                  <Input type="number" value={String(form.maxPopulation ?? 10000)} onChange={(e) => setForm({ ...form, maxPopulation: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ruler</label>
                  <Input value={String(form.ruler ?? "")} onChange={(e) => setForm({ ...form, ruler: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Prosperity (0-100)</label>
                  <Input type="number" min={0} max={100} value={String(form.prosperity ?? 50)} onChange={(e) => setForm({ ...form, prosperity: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Safety (0-100)</label>
                  <Input type="number" min={0} max={100} value={String(form.safety ?? 50)} onChange={(e) => setForm({ ...form, safety: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Faction</label>
                  <Input value={String(form.faction ?? "")} onChange={(e) => setForm({ ...form, faction: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economy" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Economy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Currency</label>
                  <Input value={String(form.currency ?? "gold")} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tax Rate (0-1)</label>
                  <Input type="number" min={0} max={1} step={0.01} value={String(form.taxRate ?? 0.1)} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Environment Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Climate</label>
                  <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={String(form.climate ?? "temperate")} onChange={(e) => setForm({ ...form, climate: e.target.value })}>
                    {["tropical","arid","temperate","continental","polar","mediterranean","subarctic","custom"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Elevation (m)</label>
                  <Input type="number" value={String(form.elevation ?? 0)} onChange={(e) => setForm({ ...form, elevation: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Founded</label>
                  <Input value={String(form.founded ?? "")} onChange={(e) => setForm({ ...form, founded: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Size X (units)</label>
                  <Input type="number" value={String(form.sizeX ?? 1000)} onChange={(e) => setForm({ ...form, sizeX: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Size Y (units)</label>
                  <Input type="number" value={String(form.sizeY ?? 1000)} onChange={(e) => setForm({ ...form, sizeY: Number(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>References</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">World Ref</label>
                  <Input value={String(form.worldRef ?? "")} onChange={(e) => setForm({ ...form, worldRef: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Region Ref</label>
                  <Input value={String(form.regionRef ?? "")} onChange={(e) => setForm({ ...form, regionRef: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Graph Ref</label>
                  <Input value={String(form.graphRef ?? "")} onChange={(e) => setForm({ ...form, graphRef: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ambient Music Ref</label>
                  <Input value={String(form.ambientMusicRef ?? "")} onChange={(e) => setForm({ ...form, ambientMusicRef: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
