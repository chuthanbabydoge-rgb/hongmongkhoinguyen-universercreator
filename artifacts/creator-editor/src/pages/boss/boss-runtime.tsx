import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, Play, Pause, Zap, AlertTriangle, Package, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossRuntime() {
  const [, params] = useRoute("/boss-runtime/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [phase, setPhase] = useState(2);
  const [skillRef, setSkillRef] = useState("");
  const [lastAction, setLastAction] = useState<Record<string, unknown> | null>(null);

  const { data: boss } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/bosses", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: runtimeSessions } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "runtime"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/runtime`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const action = (endpoint: string, body?: Record<string, unknown>) => async () => {
    const res = await fetch(`${BASE}/api/bosses/${id}/runtime/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...body }),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  };

  const makeMutation = (endpoint: string, body?: Record<string, unknown>, label?: string) => useMutation({
    mutationFn: action(endpoint, body),
    onSuccess: (data) => { setLastAction({ action: endpoint, ...data }); qc.invalidateQueries({ queryKey: ["/api/bosses", id, "runtime"] }); toast({ title: label ?? endpoint.replace(/-/g, " ") }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const spawnMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/runtime/spawn`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, participantIds: [1] }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setLastAction(data); qc.invalidateQueries({ queryKey: ["/api/bosses", id, "runtime"] }); toast({ title: "Boss spawned" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const enterCombat = makeMutation("enter-combat", {}, "Entered combat");
  const exitCombat = makeMutation("exit-combat", {}, "Exited combat");
  const triggerEnrage = makeMutation("trigger-enrage", {}, "Enrage triggered!");
  const dropLoot = makeMutation("drop-loot", {}, "Loot dropped");
  const resetBoss = makeMutation("reset", {}, "Boss reset");

  const changePhase = useMutation({
    mutationFn: async () => { const res = await fetch(`${BASE}/api/bosses/${id}/runtime/change-phase`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, phase }) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: (data) => { setLastAction(data); toast({ title: `Phase changed to ${phase}` }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const triggerUltimate = useMutation({
    mutationFn: async () => { const res = await fetch(`${BASE}/api/bosses/${id}/runtime/trigger-ultimate`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, skillRef }) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: (data) => { setLastAction(data); toast({ title: "Ultimate triggered" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Runtime</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Server className="w-5 h-5 text-cyan-500" />Boss Runtime — {String(boss?.name ?? id)}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Session</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Session ID</Label><Input value={sessionId} onChange={e => setSessionId(e.target.value)} /></div>
            <Button className="w-full" onClick={() => spawnMutation.mutate()} disabled={spawnMutation.isPending}><Play className="w-4 h-4 mr-2" />Spawn Boss</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => enterCombat.mutate()} disabled={enterCombat.isPending}><Play className="w-3 h-3 mr-1" />Enter Combat</Button>
            <Button variant="outline" size="sm" onClick={() => exitCombat.mutate()} disabled={exitCombat.isPending}><Pause className="w-3 h-3 mr-1" />Exit Combat</Button>
            <Button variant="outline" size="sm" onClick={() => triggerEnrage.mutate()} disabled={triggerEnrage.isPending}><AlertTriangle className="w-3 h-3 mr-1 text-red-500" />Trigger Enrage</Button>
            <Button variant="outline" size="sm" onClick={() => dropLoot.mutate()} disabled={dropLoot.isPending}><Package className="w-3 h-3 mr-1" />Drop Loot</Button>
            <Button variant="outline" size="sm" onClick={() => resetBoss.mutate()} disabled={resetBoss.isPending}><RefreshCw className="w-3 h-3 mr-1" />Reset Boss</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Phase Control</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input type="number" value={phase} onChange={e => setPhase(Number(e.target.value))} className="w-24" />
            <Button variant="outline" onClick={() => changePhase.mutate()} disabled={changePhase.isPending}>Change Phase</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ultimate Trigger</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input value={skillRef} onChange={e => setSkillRef(e.target.value)} placeholder="skill_ref" />
            <Button variant="outline" onClick={() => triggerUltimate.mutate()} disabled={!skillRef || triggerUltimate.isPending}><Zap className="w-4 h-4 mr-1" />Trigger</Button>
          </CardContent>
        </Card>
      </div>

      {lastAction && (
        <Card><CardHeader><CardTitle className="text-sm">Last Action Result</CardTitle></CardHeader>
          <CardContent><pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{JSON.stringify(lastAction, null, 2)}</pre></CardContent>
        </Card>
      )}

      {(runtimeSessions ?? []).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Recent Sessions</h2>
          <div className="space-y-2">
            {(runtimeSessions ?? []).slice(0, 5).map((s: Record<string, unknown>) => (
              <Card key={String(s.id)}><CardContent className="py-2 flex items-center justify-between text-sm">
                <span className="font-mono text-xs">{String(s.sessionId)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{String(s.state)}</Badge>
                  <span className="text-muted-foreground text-xs">Phase {String(s.currentPhase)}</span>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
