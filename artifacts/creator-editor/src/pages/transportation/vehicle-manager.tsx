import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Truck, Save, Plus } from "lucide-react";

const VEHICLE_TYPES = ["car","truck","bus","train","metro","tram","airplane","helicopter","ship","ferry","motorcycle","bicycle","drone","tank","custom"];

export default function VehicleManager() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", vehicleType: "car", capacity: 4, maxSpeed: 120, fuelType: "gasoline", isNpcVehicle: false });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-vehicles", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/vehicles`); return res.json(); } });
  const vehicles = data?.data ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/vehicles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-vehicles", networkId] }); toast({ title: "Vehicle added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Truck className="h-7 w-7 text-orange-400" />Vehicle Manager — Network #{networkId}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700"><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-300 text-sm">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Type</label><Select value={form.vehicleType} onValueChange={v => setForm(f => ({ ...f, vehicleType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-gray-300 text-sm">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Max Speed (km/h)</label><Input type="number" value={form.maxSpeed} onChange={e => setForm(f => ({ ...f, maxSpeed: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.isNpcVehicle} onChange={e => setForm(f => ({ ...f, isNpcVehicle: e.target.checked }))} />NPC Vehicle</label>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-orange-600 hover:bg-orange-700"><Save className="h-4 w-4 mr-2" />Add</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Vehicles ({vehicles.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{vehicles.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div><p className="text-white text-sm font-medium">{v.name}</p><p className="text-gray-400 text-xs">{v.vehicleType} · speed: {v.maxSpeed} · cap: {v.capacity}</p></div>
              <Badge variant={v.isNpcVehicle ? "default" : "secondary"}>{v.isNpcVehicle ? "NPC" : "Player"}</Badge>
            </div>
          ))}{vehicles.length === 0 && <p className="text-gray-400 text-sm">No vehicles yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
