import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swords, Play, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

type SimResult = { success: boolean; timeline?: Array<{ t: number; event: string; value?: number; detail?: string }>; [k: string]: unknown };

export default function CombatSimulator() {
  const [selectedCombat, setSelectedCombat] = useState("");
  const [simType, setSimType] = useState("attack");
  const [attackStat, setAttackStat] = useState("10");
  const [defenseStat, setDefenseStat] = useState("5");
  const [hitCount, setHitCount] = useState("3");
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: combatList } = useQuery({
    queryKey: ["/api/combat"],
    queryFn: () => apiFetch("/api/combat?limit=50").then(r => r.json()),
  });

  const run = async () => {
    if (!selectedCombat) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        attackerStats: { attack: Number(attackStat) },
        defenderStats: { defense: Number(defenseStat), agility: 5 },
        incomingDamage: Number(attackStat) * 2,
        hitCount: Number(hitCount),
      };
      const r = await apiFetch(`/api/combat/${selectedCombat}/simulate/${simType}`, { method: "POST", body: JSON.stringify(body) });
      setResult(await r.json());
    } finally { setLoading(false); }
  };

  const sims = ["attack","defense","crit","dodge","block","parry","combo","aggro","status","death","respawn"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold">Combat Simulator</h1>
          <p className="text-muted-foreground">Test and simulate combat formulas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Simulation Config</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Combat Definition</Label>
              <Select value={selectedCombat} onValueChange={setSelectedCombat}>
                <SelectTrigger><SelectValue placeholder="Select a combat…" /></SelectTrigger>
                <SelectContent>
                  {(combatList?.items ?? []).map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Simulation Type</Label>
              <Select value={simType} onValueChange={setSimType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{sims.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Attacker ATK</Label><Input type="number" value={attackStat} onChange={e => setAttackStat(e.target.value)} /></div>
              <div><Label>Defender DEF</Label><Input type="number" value={defenseStat} onChange={e => setDefenseStat(e.target.value)} /></div>
              <div><Label>Hit Count (Combo)</Label><Input type="number" value={hitCount} onChange={e => setHitCount(e.target.value)} /></div>
            </div>
            <Button className="w-full" onClick={run} disabled={!selectedCombat || loading}>
              <Play className="w-4 h-4 mr-2" />{loading ? "Simulating…" : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent>
            {!result ? <p className="text-muted-foreground">Run a simulation to see results.</p> : (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(result).filter(([k]) => k !== "timeline" && k !== "combatId").map(([k, v]) => (
                    <Badge key={k} variant={k === "success" ? (v ? "default" : "destructive") : "secondary"} className="text-xs">
                      {k}: {typeof v === "boolean" ? (v ? "yes" : "no") : typeof v === "number" ? v.toFixed(2) : String(v)}
                    </Badge>
                  ))}
                </div>
                {result.timeline && result.timeline.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Timeline</p>
                    <div className="space-y-1">
                      {result.timeline.map((e, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground w-12 text-right">{e.t.toFixed(2)}s</span>
                          <span className="flex-1 font-mono text-xs bg-secondary/30 px-2 py-0.5 rounded">{e.event}{e.detail ? ` (${e.detail})` : ""}</span>
                          {e.value !== undefined && <span className="text-primary font-medium">{typeof e.value === "number" ? e.value.toFixed(1) : String(e.value)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
