import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FlaskConical, Sun, CloudRain, Server, Hexagon, Users, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface SimResult { type: string; result: Record<string, unknown> }

export default function WorldSimulationCenter() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [results, setResults] = useState<SimResult[]>([]);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const run = (type: string) => async () => {
    const res = await fetch(`${BASE}/api/world-system/${worldId}/simulate/${type}`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  };

  const makeSim = (type: string, label: string) => useMutation({
    mutationFn: run(type),
    onSuccess: (data) => { setResults(prev => [{ type: label, result: data }, ...prev.slice(0, 4)]); toast({ title: `${label} simulated` }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const daySim = makeSim("day", "Day Cycle");
  const weatherSim = makeSim("weather", "Weather");
  const streamSim = makeSim("streaming", "Streaming");
  const portalSim = makeSim("portal", "Portal");
  const respawnSim = makeSim("respawn", "Respawn");
  const checkpointSim = makeSim("checkpoint", "Checkpoint");

  const simulations = [
    { sim: daySim, icon: Sun, label: "Simulate Day", color: "text-yellow-500" },
    { sim: weatherSim, icon: CloudRain, label: "Simulate Weather", color: "text-blue-400" },
    { sim: streamSim, icon: Server, label: "Simulate Streaming", color: "text-cyan-500" },
    { sim: portalSim, icon: Hexagon, label: "Simulate Portal", color: "text-violet-500" },
    { sim: respawnSim, icon: Users, label: "Simulate Respawn", color: "text-emerald-500" },
    { sim: checkpointSim, icon: Bookmark, label: "Simulate Checkpoint", color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="w-6 h-6 text-pink-500" />Simulation Center</h1>
        <p className="text-muted-foreground">Run runtime simulations for world systems.</p>
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {simulations.map(({ sim, icon: Icon, label, color }) => (
          <Button key={label} variant="outline" className="h-20 flex-col gap-2" disabled={!worldId || sim.isPending} onClick={() => sim.mutate()}>
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Simulation Results</h2>
          {results.map((r, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{r.type}</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(r.result).filter(([k]) => !["simulatedAt", "sessionId", "worldInstanceId", "events"].includes(k)).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="capitalize">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                      <span className="font-medium text-foreground">{typeof v === "number" ? v.toFixed(v < 10 ? 2 : 0) : String(v)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
