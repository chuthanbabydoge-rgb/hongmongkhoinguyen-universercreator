import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Server, Download, Upload, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldStreamingCenter() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [chunkX, setChunkX] = useState(0);
  const [chunkY, setChunkY] = useState(0);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: chunks } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "chunks"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/chunks`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const { data: streaming } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "streaming"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/streaming`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const loadChunk = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/chunks/load`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ chunkX, chunkY }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: `Chunk (${chunkX},${chunkY}) loaded` }),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const unloadChunk = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/chunks/unload`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ chunkX, chunkY }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: `Chunk (${chunkX},${chunkY}) unloaded` }),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simulateStreaming = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/simulate/streaming`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setSimResult(data),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const chunkStateColor: Record<string, string> = { loaded: "bg-green-500", active: "bg-blue-500", loading: "bg-yellow-500", unloaded: "bg-gray-400", error: "bg-red-500" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="w-6 h-6 text-cyan-500" />Streaming Center</h1>
        <p className="text-muted-foreground">Monitor and control chunk streaming for world instances.</p>
      </div>

      <div className="max-w-xs">
        <Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {worldId && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Chunk Controls</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label>Chunk X</Label><Input type="number" value={chunkX} onChange={e => setChunkX(Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Chunk Y</Label><Input type="number" value={chunkY} onChange={e => setChunkY(Number(e.target.value))} /></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => loadChunk.mutate()} disabled={loadChunk.isPending}><Download className="w-4 h-4 mr-2" />Load</Button>
                <Button variant="outline" className="flex-1" onClick={() => unloadChunk.mutate()} disabled={unloadChunk.isPending}><Upload className="w-4 h-4 mr-2" />Unload</Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => simulateStreaming.mutate()} disabled={simulateStreaming.isPending}><Zap className="w-4 h-4 mr-2" />Simulate Streaming</Button>
            </CardContent>
          </Card>

          {simResult && (
            <Card>
              <CardHeader><CardTitle>Simulation Result</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["Loaded Chunks", `${simResult.loadedChunks}/${simResult.totalChunks}`],
                  ["Active Chunks", String(simResult.activeChunks)],
                  ["Cache Hit Rate", `${(Number(simResult.cacheHitRate) * 100).toFixed(1)}%`],
                  ["Memory", `${Number(simResult.memoryUsageMb).toFixed(1)} MB`],
                  ["Stream Latency", `${Number(simResult.streamLatencyMs).toFixed(0)} ms`],
                  ["Bandwidth", `${Number(simResult.bandwidthKbps).toFixed(0)} kbps`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="w-4 h-4" />Active Chunks ({(chunks ?? []).length})</CardTitle></CardHeader>
            <CardContent>
              {(chunks ?? []).length === 0 ? <div className="text-muted-foreground text-sm">No chunks loaded yet.</div> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(chunks ?? []).map(c => (
                    <div key={String(c.id)} className="flex items-center gap-2 text-xs p-2 border rounded-md">
                      <div className={`w-2 h-2 rounded-full ${chunkStateColor[String(c.chunkState)] ?? "bg-gray-400"}`} />
                      <span>({String(c.chunkX)},{String(c.chunkY)})</span>
                      <Badge variant="secondary" className="text-xs capitalize">{String(c.chunkState)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
