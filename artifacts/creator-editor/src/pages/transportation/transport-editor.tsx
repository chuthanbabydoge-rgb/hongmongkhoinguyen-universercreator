import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Navigation, Globe, Train, Plane, Anchor } from "lucide-react";

const TRANSPORT_TYPES = ["road","highway","railway","metro","airport","seaport","bus_route","taxi","parking","teleport","logistics","navigation","bridge","tunnel","custom"];
const STATUSES = ["draft","active","under_construction","maintenance","closed","archived","deprecated"];

export default function TransportEditor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isNew = id === "new";

  const [form, setForm] = useState({ name: "", description: "", transportType: "road", transportStatus: "draft" });

  const { data } = useQuery({
    queryKey: ["transport-network", id],
    queryFn: async () => { const res = await fetch(`/api/transportation/${id}`); if (!res.ok) throw new Error("Not found"); return res.json(); },
    enabled: !isNew,
  });

  useEffect(() => { if (data?.data) setForm({ name: data.data.name ?? "", description: data.data.description ?? "", transportType: data.data.transportType ?? "road", transportStatus: data.data.transportStatus ?? "draft" }); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const url = isNew ? "/api/transportation" : `/api/transportation/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, createdBy: 1 }) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["transport-networks"] });
      toast({ title: "Saved", description: "Transport network saved." });
      if (isNew && result?.data?.id) navigate(`/transport-editor/${result.data.id}`);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const networkId = isNew ? null : Number(id);

  const { data: roadsData } = useQuery({ queryKey: ["transport-roads", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/roads`); return res.json(); }, enabled: !!networkId });
  const { data: routesData } = useQuery({ queryKey: ["transport-routes", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/routes`); return res.json(); }, enabled: !!networkId });
  const { data: stationsData } = useQuery({ queryKey: ["transport-stations", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/stations`); return res.json(); }, enabled: !!networkId });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Navigation className="h-7 w-7 text-cyan-400" />{isNew ? "New Transport Network" : form.name}</h1>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-cyan-600 hover:bg-cyan-700"><Save className="h-4 w-4 mr-2" />Save</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-gray-800">
          {["general","roads","routes","stations","vehicles","signals","railways","airports","ports","parking","statistics","simulation","history","settings"].map(t => (
            <TabsTrigger key={t} value={t} className="capitalize text-xs">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader><CardTitle className="text-white">Network Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-gray-300 text-sm">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-300 text-sm">Transport Type</label><Select value={form.transportType} onValueChange={v => setForm(f => ({ ...f, transportType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{TRANSPORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-gray-300 text-sm">Status</label><Select value={form.transportStatus} onValueChange={v => setForm(f => ({ ...f, transportStatus: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roads">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader><CardTitle className="text-white">Roads ({roadsData?.data?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">{(roadsData?.data ?? []).map((r: any) => <div key={r.id} className="p-2 bg-gray-700 rounded flex justify-between"><span className="text-white text-sm">{r.name}</span><span className="text-gray-400 text-xs">{r.transportRoadType} · {r.lanes} lanes</span></div>)}</div>
              {(roadsData?.data ?? []).length === 0 && <p className="text-gray-400 text-sm">No roads yet. Use the Road Editor to add roads.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader><CardTitle className="text-white">Routes ({routesData?.data?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">{(routesData?.data ?? []).map((r: any) => <div key={r.id} className="p-2 bg-gray-700 rounded flex justify-between"><span className="text-white text-sm">{r.name}</span><span className="text-gray-400 text-xs">{r.routeType} · {r.vehicleType}</span></div>)}</div>
              {(routesData?.data ?? []).length === 0 && <p className="text-gray-400 text-sm">No routes yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader><CardTitle className="text-white">Stations ({stationsData?.data?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">{(stationsData?.data ?? []).map((s: any) => <div key={s.id} className="p-2 bg-gray-700 rounded flex justify-between"><span className="text-white text-sm">{s.name}</span><span className="text-gray-400 text-xs">{s.stationType} · cap: {s.capacity}</span></div>)}</div>
              {(stationsData?.data ?? []).length === 0 && <p className="text-gray-400 text-sm">No stations yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {["vehicles","signals","railways","airports","ports","parking","statistics","simulation","history","settings"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-white capitalize">{tab}</CardTitle></CardHeader>
              <CardContent><p className="text-gray-400 text-sm">{isNew ? `Save the network first to manage ${tab}.` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} management for network #${id}.`}</p></CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
