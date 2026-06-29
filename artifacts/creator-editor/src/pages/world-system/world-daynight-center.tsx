import { useQuery, useMutation } from "@tanstack/react-query";
import { Moon, Sun, Play, Pause, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const CYCLES = ["sunrise", "morning", "noon", "afternoon", "evening", "sunset", "night", "midnight"];
const CYCLE_HOURS: Record<string, number> = { sunrise: 5, morning: 8, noon: 12, afternoon: 14, evening: 17, sunset: 18, night: 21, midnight: 0 };

export default function WorldDayNightCenter() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [targetHour, setTargetHour] = useState(12);
  const [speedScale, setSpeedScale] = useState(1.0);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: daynight, refetch } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/world-system", worldId, "daynight"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/daynight`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
    refetchInterval: 10000,
  });

  const call = (endpoint: string, body?: Record<string, unknown>) => async () => {
    const res = await fetch(`${BASE}/api/world-system/${worldId}/daynight/${endpoint}`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  };

  const setTimeMutation = useMutation({ mutationFn: call("set-time", { hour: targetHour }), onSuccess: () => { refetch(); toast({ title: `Time set to ${targetHour}:00` }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  const pauseMutation = useMutation({ mutationFn: call("pause"), onSuccess: () => { refetch(); toast({ title: "Time paused" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  const resumeMutation = useMutation({ mutationFn: call("resume"), onSuccess: () => { refetch(); toast({ title: "Time resumed" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  const speedMutation = useMutation({ mutationFn: call("speed", { scale: speedScale }), onSuccess: () => { refetch(); toast({ title: `Speed set to ${speedScale}x` }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });

  const hour = Number(daynight?.currentHour ?? 12);
  const isDaytime = hour >= 6 && hour < 20;
  const progressPct = (hour / 24) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {isDaytime ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-blue-300" />}
          Day/Night Center
        </h1>
        <p className="text-muted-foreground">Control time of day and day/night cycles.</p>
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {daynight && (
        <>
          <Card>
            <CardHeader><CardTitle>Current Time</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{String(hour).padStart(2, "0")}:00</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{String(daynight.currentCycle)}</Badge>
                  {(daynight.isPaused as boolean) && <Badge variant="outline">Paused</Badge>}
                  <Badge variant="outline">{String(daynight.timeScale)}x speed</Badge>
                </div>
              </div>
              <div className="relative h-4 bg-gradient-to-r from-gray-800 via-yellow-400 to-gray-800 rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2" style={{ left: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Set Time</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Jump to Hour (0–23)</Label><Input type="number" min={0} max={23} value={targetHour} onChange={e => setTargetHour(Number(e.target.value))} /></div>
                <div className="grid grid-cols-4 gap-1">
                  {CYCLES.map(c => <Button key={c} size="sm" variant="outline" className="text-xs capitalize" onClick={() => { setTargetHour(CYCLE_HOURS[c]); setTimeMutation.mutate(); }}>{c}</Button>)}
                </div>
                <Button className="w-full" onClick={() => setTimeMutation.mutate()} disabled={setTimeMutation.isPending}>Set Time to {targetHour}:00</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => pauseMutation.mutate()} disabled={!!daynight.isPaused || pauseMutation.isPending}><Pause className="w-4 h-4 mr-2" />Pause</Button>
                  <Button className="flex-1" variant="outline" onClick={() => resumeMutation.mutate()} disabled={!daynight.isPaused || resumeMutation.isPending}><Play className="w-4 h-4 mr-2" />Resume</Button>
                </div>
                <div><Label>Time Speed Multiplier</Label><Input type="number" min={0.1} max={100} step={0.1} value={speedScale} onChange={e => setSpeedScale(Number(e.target.value))} /></div>
                <Button variant="outline" className="w-full" onClick={() => speedMutation.mutate()} disabled={speedMutation.isPending}><Zap className="w-4 h-4 mr-2" />Set Speed {speedScale}x</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Lighting</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Ambient</span><div className="flex items-center gap-2 mt-1"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: String(daynight.ambientLightColor) }} />{String(daynight.ambientLightColor)}</div></div>
              <div><span className="text-muted-foreground">Sun</span><div className="flex items-center gap-2 mt-1"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: String(daynight.sunColor) }} />{String(daynight.sunColor)}</div></div>
              <div><span className="text-muted-foreground">Moon</span><div className="flex items-center gap-2 mt-1"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: String(daynight.moonColor) }} />{String(daynight.moonColor)}</div></div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
