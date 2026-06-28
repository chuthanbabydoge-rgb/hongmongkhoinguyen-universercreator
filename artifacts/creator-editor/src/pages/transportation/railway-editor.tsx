import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Train, Save, Plus } from "lucide-react";

export default function RailwayEditor() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", railType: "standard", maxSpeed: 200, gaugeWidth: 1.435, isElectrified: true, isDoubleTrack: false });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-railways", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/railways`); return res.json(); } });
  const railways = data?.data ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/railways`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-railways", networkId] }); toast({ title: "Railway added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Train className="h-7 w-7 text-purple-400" />Railway Editor — Network #{networkId}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" />Add Railway</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Railway Track</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-300 text-sm">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Rail Type</label><Input value={form.railType} onChange={e => setForm(f => ({ ...f, railType: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Max Speed (km/h)</label><Input type="number" value={form.maxSpeed} onChange={e => setForm(f => ({ ...f, maxSpeed: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Gauge (m)</label><Input type="number" step="0.001" value={form.gaugeWidth} onChange={e => setForm(f => ({ ...f, gaugeWidth: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.isElectrified} onChange={e => setForm(f => ({ ...f, isElectrified: e.target.checked }))} />Electrified</label>
              <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.isDoubleTrack} onChange={e => setForm(f => ({ ...f, isDoubleTrack: e.target.checked }))} />Double Track</label>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-purple-600 hover:bg-purple-700"><Save className="h-4 w-4 mr-2" />Add Railway</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Railway Tracks ({railways.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{railways.map((r: any) => (
            <div key={r.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
              <div><p className="text-white text-sm">{r.name}</p><p className="text-gray-400 text-xs">{r.railType} · {r.maxSpeed}km/h{r.isElectrified ? " · electrified" : ""}{r.isDoubleTrack ? " · double" : ""}</p></div>
            </div>
          ))}{railways.length === 0 && <p className="text-gray-400 text-sm">No railways yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
