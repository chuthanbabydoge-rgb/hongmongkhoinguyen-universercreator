import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navigation, Save } from "lucide-react";

const ROAD_TYPES = ["local_road","arterial","highway","expressway","alley","path","bridge_road","tunnel_road","elevated","underground","custom"];

export default function RoadEditorPage() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", transportRoadType: "local_road", lanes: 2, speedLimit: 50, width: 8, isOneWay: false, hasSidewalk: true });

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/roads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport-roads", Number(networkId)] }); toast({ title: "Road added" }); setForm({ name: "", transportRoadType: "local_road", lanes: 2, speedLimit: 50, width: 8, isOneWay: false, hasSidewalk: true }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Navigation className="h-7 w-7 text-cyan-400" />Road Editor — Network #{networkId}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Add Road Segment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-gray-300 text-sm">Road Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white mt-1" placeholder="Main Street" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-gray-300 text-sm">Road Type</label><Select value={form.transportRoadType} onValueChange={v => setForm(f => ({ ...f, transportRoadType: v }))}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent>{ROAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-gray-300 text-sm">Lanes</label><Input type="number" value={form.lanes} onChange={e => setForm(f => ({ ...f, lanes: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Speed Limit (km/h)</label><Input type="number" value={form.speedLimit} onChange={e => setForm(f => ({ ...f, speedLimit: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
            <div><label className="text-gray-300 text-sm">Width (m)</label><Input type="number" value={form.width} onChange={e => setForm(f => ({ ...f, width: Number(e.target.value) }))} className="bg-gray-700 border-gray-600 text-white mt-1" /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.isOneWay} onChange={e => setForm(f => ({ ...f, isOneWay: e.target.checked }))} />One Way</label>
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer"><input type="checkbox" checked={form.hasSidewalk} onChange={e => setForm(f => ({ ...f, hasSidewalk: e.target.checked }))} />Has Sidewalk</label>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name} className="bg-cyan-600 hover:bg-cyan-700"><Save className="h-4 w-4 mr-2" />Add Road</Button>
        </CardContent>
      </Card>
    </div>
  );
}
