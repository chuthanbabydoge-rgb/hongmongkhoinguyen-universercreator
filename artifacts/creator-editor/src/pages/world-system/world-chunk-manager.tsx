import { useQuery, useMutation } from "@tanstack/react-query";
import { Layers, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldChunkManager() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: chunks, refetch, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "chunks"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/chunks`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const updateState = useMutation({
    mutationFn: async ({ chunkId, state }: { chunkId: number; state: string }) => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/chunks/${chunkId}/state`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ state }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { refetch(); toast({ title: "Chunk state updated" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const stateColor: Record<string, string> = { loaded: "text-green-500", active: "text-blue-500", loading: "text-yellow-500", unloaded: "text-gray-400", error: "text-red-500", unloading: "text-orange-500" };
  const stateVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = { loaded: "default", active: "default", loading: "secondary", unloaded: "outline", error: "destructive" };

  const byState = (chunks ?? []).reduce((acc, c) => {
    const s = String(c.chunkState);
    acc[s] = ((acc[s] as number) || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-500" />Chunk Manager</h1>
          <p className="text-muted-foreground">Manage individual world chunks and their states.</p>
        </div>
        {worldId && <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>}
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {worldId && Object.keys(byState).length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(byState).map(([state, count]) => (
            <div key={state} className="flex items-center gap-1.5 text-sm">
              <span className={`font-medium ${stateColor[state] ?? ""}`}>{String(count)}</span>
              <span className="text-muted-foreground capitalize">{state}</span>
            </div>
          ))}
        </div>
      )}

      {worldId && (
        <Card>
          <CardHeader><CardTitle>Chunks ({(chunks ?? []).length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="text-muted-foreground">Loading...</div> : (chunks ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No chunks. Load chunks via Streaming Center first.</div>
            ) : (
              <div className="space-y-1">
                {(chunks ?? []).map(c => (
                  <div key={String(c.id)} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs">({String(c.chunkX)},{String(c.chunkY)},{String(c.chunkZ)})</span>
                      <Badge variant={stateVariant[String(c.chunkState)] ?? "outline"} className="capitalize text-xs">{String(c.chunkState)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{String(c.activeEntities)} entities</span>
                      <Select value={String(c.chunkState)} onValueChange={state => updateState.mutate({ chunkId: Number(c.id), state })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["unloaded", "loading", "loaded", "active", "unloading"].map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
