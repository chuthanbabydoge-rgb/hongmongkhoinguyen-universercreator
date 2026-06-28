import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plane, Save, Plus } from "lucide-react";

export default function AirportEditor() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", iataCode: "", posX: 0, posZ: 0, runwayCount: 2, terminalCount: 1, gateCount: 10, passengerCapacity: 5000, cargoCapacity: 50000 });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-airports", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/airports`); return res.json(); } });
  const airports = data?.data ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/airports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-airports", networkId] }); toast({ title: "Airport added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Plane className="h-7 w-7 text-indigo-400" />Airport Editor — Network #{networkId}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Airport</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Airport</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-300 text-sm">Airport Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">IATA Code</label><Input value={form.iataCode} onChange={e => setForm(f => ({ ...f, iataCode: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" placeholder="ABC" /></div>
              <div><label className="text-gray-300 text-sm">Runways</label><Input type="number" value={form.runwayCount} onChange={e => setForm(f => ({ ...f, runwayCount: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Terminals</label><Input type="number" value={form.terminalCount} onChange={e => setForm(f => ({ ...f, terminalCount: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Gates</label><Input type="number" value={form.gateCount} onChange={e => setForm(f => ({ ...f, gateCount: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Passenger Capacity</label><Input type="number" value={form.passengerCapacity} onChange={e => setForm(f => ({ ...f, passengerCapacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" />Add Airport</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Airports ({airports.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{airports.map((a: any) => (
            <div key={a.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
              <div><p className="text-white text-sm">{a.name} {a.iataCode ? `(${a.iataCode})` : ""}</p><p className="text-gray-400 text-xs">{a.runwayCount} runways · {a.terminalCount} terminals · {a.passengerCapacity} pax</p></div>
            </div>
          ))}{airports.length === 0 && <p className="text-gray-400 text-sm">No airports yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
