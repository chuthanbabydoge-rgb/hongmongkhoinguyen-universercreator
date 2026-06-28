import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Play, Swords, Users, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossSimulator() {
  const { toast } = useToast();
  const [bossId, setBossId] = useState("");
  const [playerCount, setPlayerCount] = useState(5);
  const [playerLevel, setPlayerLevel] = useState(50);
  const [raidSize, setRaidSize] = useState(20);
  const [simMode, setSimMode] = useState<"battle" | "raid">("battle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const { data: bosses } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/bosses"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const battleMutation = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const res = await fetch(`${BASE}/api/bosses/${bossId}/simulate/battle`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ playerCount, playerLevel }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const raidMutation = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const res = await fetch(`${BASE}/api/bosses/${bossId}/simulate/raid`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ raidSize, averageLevel: playerLevel }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const isLoading = battleMutation.isPending || raidMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Play className="w-6 h-6 text-green-500" />Boss Simulator</h1>
        <p className="text-muted-foreground">Simulate boss encounters and raid scenarios</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Simulation Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Select Boss</Label>
              <Select value={bossId} onValueChange={setBossId}>
                <SelectTrigger><SelectValue placeholder="Choose a boss..." /></SelectTrigger>
                <SelectContent>
                  {(bosses?.items ?? []).map((b: Record<string, unknown>) => (
                    <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mode</Label>
              <Select value={simMode} onValueChange={v => setSimMode(v as "battle" | "raid")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="battle">Battle (small group)</SelectItem>
                  <SelectItem value="raid">Raid (large group)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Average Player Level</Label>
              <Input type="number" value={playerLevel} onChange={e => setPlayerLevel(Number(e.target.value))} />
            </div>
            {simMode === "battle" ? (
              <div className="space-y-1">
                <Label>Player Count</Label>
                <Input type="number" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Raid Size</Label>
                <Input type="number" value={raidSize} onChange={e => setRaidSize(Number(e.target.value))} />
              </div>
            )}
            <Button className="w-full" disabled={!bossId || isLoading} onClick={() => simMode === "battle" ? battleMutation.mutate() : raidMutation.mutate()}>
              <Play className="w-4 h-4 mr-2" />{isLoading ? "Simulating..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5" />Simulation Result</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {result.wiped !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Outcome:</span>
                  <Badge variant={result.wiped ? "destructive" : "default"}>{result.wiped ? "WIPE" : "KILL"}</Badge>
                </div>
              )}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Kill Time</span><span>{result.estimatedKillTimeSeconds ?? result.estimatedDurationSeconds}s</span></div>
              {result.enrageAt && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Enrage Timer</span><span>{String(result.enrageAt)}s</span></div>}
              {result.phaseCount && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Phases</span><span>{String(result.phaseCount)}</span></div>}
              {result.enrageTriggered !== undefined && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Enrage Triggered</span><Badge variant={result.enrageTriggered ? "destructive" : "secondary"}>{result.enrageTriggered ? "Yes" : "No"}</Badge></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Difficulty</span><span className="capitalize">{String(result.difficulty ?? "normal")}</span></div>
              <div className="text-xs text-muted-foreground mt-2">Simulated at: {String(result.simulatedAt)}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
