import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Save } from "lucide-react";

const ROUTE_TYPES = ["commuter","express","freight","scenic","emergency","military","tourist","delivery","patrol","custom"];
const VEHICLE_TYPES = ["car","truck","bus","train","metro","tram","airplane","helicopter","ship","ferry","motorcycle","bicycle","drone","tank","custom"];

export default function RouteEditorPage() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", routeCode: "", routeType: "commuter", vehicleType: "bus", frequency: 30, capacity: 50, fare: 0, operatingHours: "06:00-22:00" });

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/routes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-routes", Number(networkId)] }); toast({ title: "Route added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe className="h-7 w-7 text-blue-400" />Route Editor — Network #{networkId}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Create Route</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-gray-300 text-sm">Route Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Route Code</label><Input value={form.routeCode} onChange={e => setForm(f => ({ ...f, routeCode: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" placeholder="BUS-01" /></div>
            <div><label className="text-gray-300 text-sm">Route Type</label><Select value={form.routeType} onValueChange={v => setForm(f => ({ ...f, routeType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{ROUTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-gray-300 text-sm">Vehicle Type</label><Select value={form.vehicleType} onValueChange={v => setForm(f => ({ ...f, vehicleType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-gray-300 text-sm">Frequency (min)</label><Input type="number" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Fare</label><Input type="number" value={form.fare} onChange={e => setForm(f => ({ ...f, fare: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Operating Hours</label><Input value={form.operatingHours} onChange={e => setForm(f => ({ ...f, operatingHours: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-blue-600 hover:bg-blue-700"><Save className="h-4 w-4 mr-2" />Create Route</Button>
        </CardContent>
      </Card>
    </div>
  );
}
