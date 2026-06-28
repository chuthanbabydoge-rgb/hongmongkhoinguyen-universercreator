import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Save, Plus } from "lucide-react";

export default function TrafficSignalEditor() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", posX: 0, posY: 0, posZ: 0, redDuration: 30, yellowDuration: 5, greenDuration: 25, isAdaptive: false });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-signals", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/signals`); return res.json(); } });
  const signals = data?.data ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/signals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-signals", networkId] }); toast({ title: "Signal added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const stateColor: Record<string, string> = { red: "bg-red-500", yellow: "bg-yellow-500", green: "bg-green-500" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><AlertTriangle className="h-7 w-7 text-red-400" />Traffic Signal Editor — Network #{networkId}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" />Add Signal</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Traffic Signal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-gray-300 text-sm">Signal Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-gray-300 text-sm">Red (s)</label><Input type="number" value={form.redDuration} onChange={e => setForm(f => ({ ...f, redDuration: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Yellow (s)</label><Input type="number" value={form.yellowDuration} onChange={e => setForm(f => ({ ...f, yellowDuration: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Green (s)</label><Input type="number" value={form.greenDuration} onChange={e => setForm(f => ({ ...f, greenDuration: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.isAdaptive} onChange={e => setForm(f => ({ ...f, isAdaptive: e.target.checked }))} />Adaptive Signal</label>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-red-600 hover:bg-red-700"><Save className="h-4 w-4 mr-2" />Add Signal</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Signals ({signals.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{signals.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stateColor[s.trafficSignalState] ?? "bg-gray-400"}`} />
                <div><p className="text-white text-sm">{s.name}</p><p className="text-gray-400 text-xs">R:{s.redDuration}s G:{s.greenDuration}s</p></div>
              </div>
              <Badge variant={s.isAdaptive ? "default" : "secondary"}>{s.isAdaptive ? "Adaptive" : "Fixed"}</Badge>
            </div>
          ))}{signals.length === 0 && <p className="text-gray-400 text-sm">No signals yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
