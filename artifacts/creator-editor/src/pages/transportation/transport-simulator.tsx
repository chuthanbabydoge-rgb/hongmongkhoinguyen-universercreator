import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, Activity, Truck, Navigation } from "lucide-react";

export default function TransportSimulator() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  const { data: runtimeData, refetch } = useQuery({ queryKey: ["transport-runtime", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/runtime`); return res.json(); } });
  const { data: stateData } = useQuery({ queryKey: ["transport-state", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/state`); return res.json(); } });

  const runtime = runtimeData?.data;
  const state = stateData?.data;

  const start = useMutation({
    mutationFn: async () => { const res = await fetch(`/api/transportation/${networkId}/runtime/start`, { method: "POST" }); return res.json(); },
    onSuccess: () => { setIsRunning(true); toast({ title: "Simulation started" }); refetch(); },
  });
  const stop = useMutation({
    mutationFn: async () => { const res = await fetch(`/api/transportation/${networkId}/runtime/stop`, { method: "POST" }); return res.json(); },
    onSuccess: () => { setIsRunning(false); toast({ title: "Simulation stopped" }); refetch(); },
  });
  const tick = useMutation({
    mutationFn: async () => { const res = await fetch(`/api/transportation/${networkId}/runtime/tick`, { method: "POST" }); return res.json(); },
    onSuccess: () => { toast({ title: "Tick simulated" }); refetch(); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="h-7 w-7 text-cyan-400" />Transport Simulator — Network #{networkId}</h1>
        <div className="flex gap-2">
          {!isRunning ? <Button onClick={() => start.mutate()} className="bg-green-600 hover:bg-green-700"><Play className="h-4 w-4 mr-2" />Start</Button>
            : <Button onClick={() => stop.mutate()} className="bg-red-600 hover:bg-red-700"><Square className="h-4 w-4 mr-2" />Stop</Button>}
          <Button onClick={() => tick.mutate()} variant="outline"><Activity className="h-4 w-4 mr-2" />Tick</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Road Network", value: runtime?.roadNetworkStatus ?? "offline", color: runtime?.roadNetworkStatus === "online" ? "text-green-400" : "text-red-400" },
          { label: "Rail Network", value: runtime?.railNetworkStatus ?? "offline", color: runtime?.railNetworkStatus === "online" ? "text-green-400" : "text-red-400" },
          { label: "Air Network", value: runtime?.airNetworkStatus ?? "offline", color: runtime?.airNetworkStatus === "online" ? "text-green-400" : "text-red-400" },
          { label: "Sea Network", value: runtime?.seaNetworkStatus ?? "offline", color: runtime?.seaNetworkStatus === "online" ? "text-green-400" : "text-red-400" },
        ].map(s => (
          <Card key={s.label} className="bg-gray-800 border-gray-700">
            <CardContent className="pt-4"><p className="text-gray-400 text-xs">{s.label}</p><p className={`text-lg font-bold ${s.color}`}>{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">Runtime Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Active Vehicles", value: runtime?.activeVehicles ?? 0, unit: "" },
              { label: "Traffic Density", value: ((runtime?.trafficDensity ?? 0) * 100).toFixed(1), unit: "%" },
              { label: "Avg Speed", value: (runtime?.avgSpeed ?? 0).toFixed(1), unit: " km/h" },
              { label: "Congestion", value: ((runtime?.congestionLevel ?? 0) * 100).toFixed(1), unit: "%" },
              { label: "Simulation Tick", value: runtime?.simulationTick ?? 0, unit: "" },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{m.label}</span>
                <span className="text-white font-mono">{m.value}{m.unit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white">Network Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {state?.summary && Object.entries(state.summary).map(([k, v]: [string, any]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-gray-400 text-sm capitalize">{k}</span>
                <span className="text-white font-mono">{v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
