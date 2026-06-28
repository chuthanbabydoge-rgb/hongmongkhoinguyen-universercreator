import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ParkingCircle, Save, Plus } from "lucide-react";

export default function ParkingManager() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", parkingType: "surface", posX: 0, posZ: 0, totalSpots: 50, hourlyRate: 0, maxDuration: 24 });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-parking", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/parking`); return res.json(); } });
  const parkings = data?.data ?? [];
  const totalSpots = parkings.reduce((s: number, p: any) => s + (p.totalSpots ?? 0), 0);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/parking`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-parking", networkId] }); toast({ title: "Parking added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ParkingCircle className="h-7 w-7 text-yellow-400" />Parking Manager — Network #{networkId}</h1>
          <p className="text-gray-400 text-sm mt-1">Total spots: {totalSpots} across {parkings.length} facilities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-yellow-600 hover:bg-yellow-700"><Plus className="h-4 w-4 mr-2" />Add Parking</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Parking Facility</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-300 text-sm">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Type</label><Input value={form.parkingType} onChange={e => setForm(f => ({ ...f, parkingType: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Total Spots</label><Input type="number" value={form.totalSpots} onChange={e => setForm(f => ({ ...f, totalSpots: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Hourly Rate</label><Input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Max Duration (h)</label><Input type="number" value={form.maxDuration} onChange={e => setForm(f => ({ ...f, maxDuration: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-yellow-600 hover:bg-yellow-700"><Save className="h-4 w-4 mr-2" />Add</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Parking Facilities ({parkings.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{parkings.map((p: any) => (
            <div key={p.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
              <div><p className="text-white text-sm">{p.name}</p><p className="text-gray-400 text-xs">{p.parkingType} · {p.totalSpots} spots · {p.hourlyRate}/hr</p></div>
            </div>
          ))}{parkings.length === 0 && <p className="text-gray-400 text-sm">No parking facilities yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
