import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Anchor, Save, Plus } from "lucide-react";

const PORT_TYPES = ["seaport","river_port","ferry_terminal","fishing_port","naval_base","cargo_terminal","custom"];

export default function PortEditor() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", portType: "seaport", posX: 0, posZ: 0, berthCount: 4, cargoCapacity: 10000, passengerCapacity: 500 });
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ["transport-ports", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/ports`); return res.json(); } });
  const ports = data?.data ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/ports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed"); return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-ports", networkId] }); toast({ title: "Port added" }); setShowForm(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Anchor className="h-7 w-7 text-teal-400" />Port Editor — Network #{networkId}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4 mr-2" />Add Port</Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">New Port</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-gray-300 text-sm">Port Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Port Type</label><Select value={form.portType} onValueChange={v => setForm(f => ({ ...f, portType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{PORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-gray-300 text-sm">Berths</label><Input type="number" value={form.berthCount} onChange={e => setForm(f => ({ ...f, berthCount: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Cargo Capacity (t)</label><Input type="number" value={form.cargoCapacity} onChange={e => setForm(f => ({ ...f, cargoCapacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
              <div><label className="text-gray-300 text-sm">Passenger Capacity</label><Input type="number" value={form.passengerCapacity} onChange={e => setForm(f => ({ ...f, passengerCapacity: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-teal-600 hover:bg-teal-700"><Save className="h-4 w-4 mr-2" />Add Port</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Ports ({ports.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">{ports.map((p: any) => (
            <div key={p.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
              <div><p className="text-white text-sm">{p.name}</p><p className="text-gray-400 text-xs">{p.portType} · {p.berthCount} berths · {p.cargoCapacity}t cargo</p></div>
            </div>
          ))}{ports.length === 0 && <p className="text-gray-400 text-sm">No ports yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
