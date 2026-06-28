import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, Shield, Swords, AlertCircle, Gift, CheckSquare } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Dungeon { id: number; name: string; difficulty: string; }

export default function DungeonSimulator() {
  const { toast } = useToast();
  const [selectedDungeon, setSelectedDungeon] = useState<string>("");
  const [partySize, setPartySize] = useState(3);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [simType, setSimType] = useState("run");

  const { data: dungeons } = useQuery<{ items: Dungeon[] }>({
    queryKey: ["/api/dungeons"],
    queryFn: async () => { const r = await apiFetch("/api/dungeons?limit=100"); return r.json(); },
  });

  const runMut = useMutation({
    mutationFn: async () => {
      if (!selectedDungeon) throw new Error("No dungeon selected");
      const id = selectedDungeon;
      let r;
      if (simType === "run") r = await apiFetch(`/api/dungeons/${id}/simulate/run`, { method: "POST", body: JSON.stringify({ partySize }) });
      else if (simType === "loot") r = await apiFetch(`/api/dungeons/${id}/simulate/loot`, { method: "POST" });
      else if (simType === "respawn") r = await apiFetch(`/api/dungeons/${id}/simulate/respawn`, { method: "POST" });
      else if (simType === "reset") r = await apiFetch(`/api/dungeons/${id}/simulate/reset`, { method: "POST" });
      else r = await apiFetch(`/api/dungeons/${id}/simulate/preview`);
      return r!.json();
    },
    onSuccess: (d) => setResult(d),
    onError: () => toast({ title: "Simulation failed", variant: "destructive" }),
  });

  const resetMut = useMutation({
    mutationFn: async () => {
      if (!selectedDungeon) throw new Error("No dungeon selected");
      const r = await apiFetch(`/api/dungeons/${selectedDungeon}/simulate/reset`, { method: "POST" });
      return r.json();
    },
    onSuccess: (d) => { setResult(d); toast({ title: "Dungeon reset" }); },
  });

  const timeline = (result as { timeline?: Array<{ tick: number; event: string; room?: string; monsterCount?: number; bossCount?: number }> })?.timeline ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dungeon Simulator</h1>
        <p className="text-muted-foreground">Test dungeon run simulations in real time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-sm">Simulation Config</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Dungeon</Label>
              <Select value={selectedDungeon} onValueChange={setSelectedDungeon}>
                <SelectTrigger><SelectValue placeholder="Select dungeon…" /></SelectTrigger>
                <SelectContent>
                  {(dungeons?.items ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Simulation Type</Label>
              <Select value={simType} onValueChange={setSimType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="run">Full Run</SelectItem>
                  <SelectItem value="loot">Loot Roll</SelectItem>
                  <SelectItem value="respawn">Respawn</SelectItem>
                  <SelectItem value="reset">Reset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {simType === "run" && (
              <div className="space-y-1">
                <Label>Party Size</Label>
                <Input type="number" min={1} max={10} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
              </div>
            )}
            <Button className="w-full" onClick={() => runMut.mutate()} disabled={!selectedDungeon || runMut.isPending}>
              <Play className="w-4 h-4 mr-2" />{runMut.isPending ? "Simulating…" : "Run Simulation"}
            </Button>
            <Button className="w-full" variant="outline" onClick={() => resetMut.mutate()} disabled={!selectedDungeon || resetMut.isPending}>
              <RotateCcw className="w-4 h-4 mr-2" />Reset Dungeon
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm">Simulation Results</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-16 text-muted-foreground">Run a simulation to see results here.</div>
            ) : (
              <div className="space-y-4">
                {result.ok === false && <p className="text-destructive text-sm">{String(result.error ?? "Simulation failed")}</p>}
                {timeline.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Timeline ({timeline.length} events)</p>
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {timeline.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                          <Badge variant="outline" className="text-xs shrink-0">t{ev.tick}</Badge>
                          <span className="font-medium capitalize">{ev.event.replace(/_/g, " ")}</span>
                          {ev.room && <span className="text-muted-foreground">→ {ev.room}</span>}
                          {ev.monsterCount && <span className="text-yellow-500">×{ev.monsterCount} monsters</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as { loot?: unknown[] }).loot && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Loot</p>
                    <div className="space-y-1">
                      {((result as { loot: Array<{ name: string; type: string; dropped: boolean; chance: number }> }).loot ?? []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Gift className="w-3 h-3" />
                            <span>{item.name}</span>
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          </div>
                          <Badge className={item.dropped ? "bg-green-600" : "bg-muted"}>{item.dropped ? "Dropped" : "Missed"}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!timeline.length && !((result as { loot?: unknown[] }).loot) && (
                  <pre className="text-xs bg-muted/30 rounded p-3 overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
