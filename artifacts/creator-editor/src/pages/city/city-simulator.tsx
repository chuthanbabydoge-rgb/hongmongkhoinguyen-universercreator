import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Play, Square, Zap, Users, Car, AlertTriangle, BarChart2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CitySimulator() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<Record<string, unknown> | null>(null);

  const { data: citiesData } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load cities");
      return res.json();
    },
  });

  const startMut = useMutation({
    mutationFn: async () => {
      const sid = `sim-${Date.now()}`;
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/runtime/start`, { method: "POST", headers: headers(), body: JSON.stringify({ sessionId: sid }) });
      if (!res.ok) throw new Error("Failed to start simulation");
      const data = await res.json();
      setSessionId(sid);
      setRuntime(data);
      return data;
    },
    onSuccess: () => toast({ title: "Simulation started" }),
    onError: () => toast({ title: "Error", description: "Failed to start simulation", variant: "destructive" }),
  });

  const stopMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/runtime/stop`, { method: "POST", headers: headers(), body: JSON.stringify({ sessionId }) });
      if (!res.ok) throw new Error("Failed to stop simulation");
      return res.json();
    },
    onSuccess: () => { setRuntime(null); setSessionId(null); toast({ title: "Simulation stopped" }); },
    onError: () => toast({ title: "Error", description: "Failed to stop simulation", variant: "destructive" }),
  });

  const tickMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/runtime/tick`, { method: "POST", headers: headers(), body: JSON.stringify({ sessionId }) });
      if (!res.ok) throw new Error("Failed to tick");
      return res.json();
    },
    onSuccess: (data) => setRuntime(data),
    onError: () => toast({ title: "Error", description: "Failed to advance tick", variant: "destructive" }),
  });

  const spawnMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/runtime/spawn-citizens`, { method: "POST", headers: headers(), body: JSON.stringify({ sessionId, count: 10 }) });
      if (!res.ok) throw new Error("Failed to spawn citizens");
      return res.json();
    },
    onSuccess: (data) => { setRuntime(data); toast({ title: "Spawned 10 citizens" }); },
    onError: () => toast({ title: "Error", description: "Failed to spawn citizens", variant: "destructive" }),
  });

  const emergencyMut = useMutation({
    mutationFn: async (type: string) => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/runtime/emergency`, { method: "POST", headers: headers(), body: JSON.stringify({ sessionId, type }) });
      if (!res.ok) throw new Error("Failed to trigger emergency");
      return res.json();
    },
    onSuccess: (data) => { setRuntime(data); toast({ title: "Emergency triggered!", variant: "destructive" }); },
    onError: () => toast({ title: "Error", description: "Failed to trigger emergency", variant: "destructive" }),
  });

  const economyMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/simulate/economy`, { method: "POST", headers: headers(), body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Failed to run economy");
      return res.json();
    },
    onSuccess: (data) => toast({ title: `Economy: +${Math.round(Number(data.revenue ?? 0))} / -${Math.round(Number(data.expenses ?? 0))}` }),
    onError: () => toast({ title: "Error", description: "Failed to run economy simulation", variant: "destructive" }),
  });

  const cities = citiesData?.items ?? [];
  const hour = Number(runtime?.currentHour ?? 8);
  const timeStr = `Day ${runtime?.currentDay ?? 1}, ${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Play className="w-6 h-6 text-blue-500" /> City Simulator</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Select City</CardTitle></CardHeader>
        <CardContent>
          <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={selectedCityId ?? ""} onChange={(e) => setSelectedCityId(Number(e.target.value))}>
            <option value="">-- Select a city --</option>
            {cities.map((c: Record<string, unknown>) => (
              <option key={String(c.id)} value={String(c.id)}>{String(c.name)} ({String(c.cityType).replace(/_/g, " ")})</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedCityId && (
        <>
          <div className="flex gap-2 flex-wrap">
            {!sessionId ? (
              <Button onClick={() => startMut.mutate()} disabled={startMut.isPending || !selectedCityId}><Play className="w-4 h-4 mr-2" />Start Simulation</Button>
            ) : (
              <>
                <Button variant="destructive" onClick={() => stopMut.mutate()} disabled={stopMut.isPending}><Square className="w-4 h-4 mr-2" />Stop</Button>
                <Button variant="outline" onClick={() => tickMut.mutate()} disabled={tickMut.isPending}>Advance Tick</Button>
                <Button variant="outline" onClick={() => spawnMut.mutate()} disabled={spawnMut.isPending}><Users className="w-4 h-4 mr-2" />Spawn Citizens</Button>
                <Button variant="outline" onClick={() => economyMut.mutate()} disabled={economyMut.isPending}><DollarSign className="w-4 h-4 mr-2" />Run Economy</Button>
                <Button variant="outline" onClick={() => emergencyMut.mutate("fire")} disabled={emergencyMut.isPending}><AlertTriangle className="w-4 h-4 mr-2" />Fire!</Button>
                <Button variant="outline" onClick={() => emergencyMut.mutate("flood")} disabled={emergencyMut.isPending}><AlertTriangle className="w-4 h-4 mr-2" />Flood!</Button>
              </>
            )}
          </div>

          {runtime && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Time</CardTitle></CardHeader>
                  <CardContent><div className="text-xl font-bold">{timeStr}</div><div className="text-xs text-muted-foreground capitalize">{String(runtime.weather ?? "clear")}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Citizens</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{String(runtime.activeCitizens ?? 0)}</div><div className="text-xs text-muted-foreground">{String(runtime.activeVehicles ?? 0)} vehicles</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> Grid Load</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(Number(runtime.powerLoad ?? 0))}%</div>
                    <div className="text-xs text-muted-foreground">Water: {Math.round(Number(runtime.waterLoad ?? 0))}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Economy</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(Number(runtime.economyBalance ?? 0))}</div>
                    <div className="text-xs text-muted-foreground">Crime: {Math.round(Number(runtime.crimeLevel ?? 0))}%</div>
                  </CardContent>
                </Card>
              </div>

              {runtime.emergencyActive && (
                <Card className="border-red-500">
                  <CardContent className="py-3 flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">EMERGENCY ACTIVE — City response in progress</span>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle className="text-sm">Simulation Info</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Session ID:</span> <code className="text-xs">{String(sessionId)}</code></div>
                    <div><span className="text-muted-foreground">Tick:</span> {String(runtime.simulationTick ?? 0)}</div>
                    <div><span className="text-muted-foreground">Status:</span> <Badge variant={runtime.isRunning ? "default" : "outline"}>{runtime.isRunning ? "Running" : "Stopped"}</Badge></div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
