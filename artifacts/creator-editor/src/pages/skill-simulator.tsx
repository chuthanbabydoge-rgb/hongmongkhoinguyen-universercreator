import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Zap, BarChart2, Clock, Flame, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Skill = { id: number; name: string; skillType: string; damageType: string };
type SimResult = {
  skillId: number; skillLevel: number; castSuccess: boolean;
  damage?: number; heal?: number; cooldownTriggered: number;
  resourceConsumed: number; buffsApplied: string[]; debuffsApplied: string[];
  effectsTriggered: string[];
  timeline: Array<{ t: number; event: string; value?: number }>;
};

export default function SkillSimulator() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [skillLevel, setSkillLevel] = useState(1);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
    queryFn: () => authFetch("/api/skills?limit=200").then((r) => r.json()),
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      authFetch(`/api/skills/${selectedId}/simulate`, { method: "POST", body: JSON.stringify({ skillLevel }) }).then((r) => r.json()),
    onSuccess: (res: SimResult) => { setSimResult(res); toast({ title: "Simulation complete" }); },
    onError: () => toast({ title: "Error", description: "Simulation failed", variant: "destructive" }),
  });

  const selected = skills.find(s => s.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">Preview cast outcomes in real time</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Simulation Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Select Skill</label>
              <select value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                <option value={0}>— Choose a skill —</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.skillType})</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Skill Level</label>
              <Input type="number" min={1} max={20} value={skillLevel} onChange={e => setSkillLevel(Number(e.target.value))} className="mt-1" /></div>
          </div>
          {selected && (
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">{selected.skillType}</Badge>
              <Badge variant="outline" className="capitalize">{selected.damageType}</Badge>
            </div>
          )}
          <Button onClick={() => simulateMutation.mutate()} disabled={!selectedId || simulateMutation.isPending} size="lg">
            <Play className="w-5 h-5 mr-2" />Cast Skill
          </Button>
        </CardContent>
      </Card>

      {simResult && (
        <Tabs defaultValue="summary">
          <TabsList><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger></TabsList>

          <TabsContent value="summary" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Damage", value: simResult.damage != null ? simResult.damage.toFixed(1) : "—", icon: Zap, color: "text-red-400" },
                { label: "Heal", value: simResult.heal != null ? simResult.heal.toFixed(1) : "—", icon: BarChart2, color: "text-green-400" },
                { label: "Cooldown", value: `${simResult.cooldownTriggered.toFixed(1)}s`, icon: Clock, color: "text-blue-400" },
                { label: "Resource Cost", value: simResult.resourceConsumed.toFixed(1), icon: Flame, color: "text-orange-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium">{label}</CardTitle>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </CardHeader>
                  <CardContent><div className={`text-xl font-bold ${color}`}>{value}</div></CardContent>
                </Card>
              ))}
            </div>

            {simResult.buffsApplied.length > 0 && (
              <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" />Buffs Applied</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{simResult.buffsApplied.map(b => <Badge key={b} variant="outline" className="text-green-400">{b}</Badge>)}</div></CardContent>
              </Card>
            )}

            {simResult.debuffsApplied.length > 0 && (
              <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" />Debuffs Applied</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{simResult.debuffsApplied.map(d => <Badge key={d} variant="outline" className="text-red-400">{d}</Badge>)}</div></CardContent>
              </Card>
            )}

            {simResult.effectsTriggered.length > 0 && (
              <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Effects Triggered</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{simResult.effectsTriggered.map(e => <Badge key={e} variant="secondary">{e}</Badge>)}</div></CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="pt-4 space-y-2">
                {simResult.timeline.map((ev, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <span className="text-xs font-mono text-muted-foreground w-14 shrink-0">+{ev.t.toFixed(2)}s</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="capitalize">{ev.event.replace(/_/g, " ")}</span>
                      {ev.value != null && <Badge variant="outline" className="text-xs">{ev.value.toFixed(1)}</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
