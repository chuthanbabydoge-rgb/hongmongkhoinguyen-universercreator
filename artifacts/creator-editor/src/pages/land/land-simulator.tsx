import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function LandSimulator() {
  const { id } = useParams<{ id: string }>();
  const landId = id ? Number(id) : 0;
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: runtime, isLoading } = useQuery<Record<string, unknown> | null>({
    queryKey: [`/api/lands/${landId}/runtime`],
    queryFn: async () => {
      if (!landId) return null;
      const res = await fetch(`${BASE}/api/lands/${landId}/runtime`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!landId,
  });

  const mutOpts = (action: string) => ({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/runtime/${action}`, { method: "POST", headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/runtime`] }); toast({ title: `${action} executed` }); },
    onError: () => toast({ title: "Error", variant: "destructive" as const }),
  });

  const startMut = useMutation(mutOpts("start"));
  const stopMut = useMutation(mutOpts("stop"));
  const tickMut = useMutation(mutOpts("tick"));
  const trafficMut = useMutation(mutOpts("traffic-flow"));
  const ownerMut = useMutation(mutOpts("sync-ownership"));
  const zoneMut = useMutation(mutOpts("validate-zones"));
  const marketMut = useMutation(mutOpts("marketplace-sync"));
  const constructMut = useMutation(mutOpts("construction-tick"));

  if (!landId) return <div className="text-muted-foreground p-4">Select a land to simulate. Navigate to a land and open the simulator.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="w-6 h-6 text-emerald-500" /> Land Simulator</h1>
        <div className="flex gap-2">
          <Button onClick={() => startMut.mutate()} disabled={startMut.isPending} variant="default"><Play className="w-4 h-4 mr-2" />Start</Button>
          <Button onClick={() => stopMut.mutate()} disabled={stopMut.isPending} variant="outline"><Square className="w-4 h-4 mr-2" />Stop</Button>
          <Button onClick={() => tickMut.mutate()} disabled={tickMut.isPending} variant="secondary"><RefreshCw className="w-4 h-4 mr-2" />Tick</Button>
        </div>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading runtime status…</div>
        : runtime
          ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Streaming", value: runtime.isStreaming ? "Active" : "Stopped" },
              { label: "Sim Tick", value: String(runtime.simulationTick ?? 0) },
              { label: "Active Chunks", value: String((runtime.activeChunks as number[] | undefined)?.length ?? 0) },
              { label: "Loaded Parcels", value: String(runtime.loadedParcels ?? 0) },
              { label: "Road Network", value: String(runtime.roadNetworkStatus) },
              { label: "Utility Network", value: String(runtime.utilityNetworkStatus) },
              { label: "Teleport Network", value: String(runtime.teleportNetworkStatus) },
              { label: "Traffic Density", value: `${Math.round(Number(runtime.trafficDensity) * 100)}%` },
            ].map(({ label, value }) => (
              <Card key={label}><CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><div className="font-bold">{value}</div></CardContent></Card>
            ))}
          </div>
          : <Card><CardContent className="py-8 text-center text-muted-foreground">Runtime not initialized. Click Start to begin simulation.</CardContent></Card>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Traffic Flow", mut: trafficMut },
          { label: "Sync Ownership", mut: ownerMut },
          { label: "Validate Zones", mut: zoneMut },
          { label: "Marketplace Sync", mut: marketMut },
          { label: "Construction Tick", mut: constructMut },
        ].map(({ label, mut }) => (
          <Button key={label} variant="outline" onClick={() => mut.mutate()} disabled={mut.isPending}>{label}</Button>
        ))}
      </div>
    </div>
  );
}
