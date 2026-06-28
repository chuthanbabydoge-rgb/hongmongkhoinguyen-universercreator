import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Save } from "lucide-react";

const STATION_TYPES = ["bus_stop","train_station","metro_station","airport_terminal","seaport_terminal","taxi_stand","parking_lot","checkpoint","waypoint","teleport_hub","custom"];

export default function StationEditorPage() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", stationType: "bus_stop", posX: 0, posY: 0, posZ: 0, platformCount: 1, capacity: 100 });

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/stations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-stations", Number(networkId)] }); toast({ title: "Station added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><MapPin className="h-7 w-7 text-emerald-400" />Station Editor — Network #{networkId}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Add Station</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-gray-300 text-sm">Station Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Station Type</label><Select value={form.stationType} onValueChange={v => setForm(f => ({ ...f, stationType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{STATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-gray-300 text-sm">Position X</label><Input type="number" value={form.posX} onChange={e => setForm(f => ({ ...f, posX: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Position Z</label><Input type="number" value={form.posZ} onChange={e => setForm(f => ({ ...f, posZ: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Platforms</label><Input type="number" value={form.platformCount} onChange={e => setForm(f => ({ ...f, platformCount: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-emerald-600 hover:bg-emerald-700"><Save className="h-4 w-4 mr-2" />Add Station</Button>
        </CardContent>
      </Card>
    </div>
  );
}
