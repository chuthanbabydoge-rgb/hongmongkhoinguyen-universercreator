import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CloudRain, Cloud, Sun, Snowflake, Wind, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const WEATHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sunny: Sun, cloudy: Cloud, rain: CloudRain, storm: CloudRain,
  snow: Snowflake, fog: Cloud, wind: Wind, sandstorm: Wind, blizzard: Snowflake, heatwave: Sun,
};

const WEATHERS = ["sunny", "cloudy", "rain", "storm", "snow", "fog", "wind", "sandstorm", "blizzard", "heatwave"];

export default function WorldWeatherCenter() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [nextWeather, setNextWeather] = useState("rain");
  const [transition, setTransition] = useState(60);
  const [forecast, setForecast] = useState<Record<string, unknown>[] | null>(null);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: weather, refetch } = useQuery<Record<string, unknown>>({
    queryKey: ["/api/world-system", worldId, "weather"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/weather`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  const changeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/weather/change`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ weather: nextWeather, transitionDuration: transition }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { refetch(); toast({ title: `Weather changed to ${nextWeather}` }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/weather/forecast`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setForecast(data),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/weather/simulate`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setSimResult(data),
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const CurrentIcon = WEATHER_ICONS[String(weather?.currentWeather ?? "sunny")] ?? Sun;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><CloudRain className="w-6 h-6 text-blue-400" />Weather Center</h1>
        <p className="text-muted-foreground">Control and simulate weather for world instances.</p>
      </div>

      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {weather && (
        <Card className="border-blue-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><CurrentIcon className="w-5 h-5 text-blue-400" />Current Weather</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Weather</span><div className="font-medium capitalize">{String(weather.currentWeather)}</div></div>
            <div><span className="text-muted-foreground">Intensity</span><div className="font-medium">{(Number(weather.intensity) * 100).toFixed(0)}%</div></div>
            <div><span className="text-muted-foreground">Wind Speed</span><div className="font-medium">{String(weather.windSpeed)} km/h</div></div>
            <div><span className="text-muted-foreground">Temperature</span><div className="font-medium">{String(weather.temperature)}°C</div></div>
            <div><span className="text-muted-foreground">Humidity</span><div className="font-medium">{String(weather.humidity)}%</div></div>
            <div><span className="text-muted-foreground">Override</span><Badge variant={weather.isManualOverride ? "default" : "outline"}>{weather.isManualOverride ? "Manual" : "Auto"}</Badge></div>
          </CardContent>
        </Card>
      )}

      {worldId && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Change Weather</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Target Weather</Label>
                <Select value={nextWeather} onValueChange={setNextWeather}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WEATHERS.map(w => <SelectItem key={w} value={w} className="capitalize">{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Transition (seconds)</Label><Input type="number" value={transition} onChange={e => setTransition(Number(e.target.value))} /></div>
              <Button className="w-full" onClick={() => changeMutation.mutate()} disabled={changeMutation.isPending}>Apply Weather Change</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tools</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => forecastMutation.mutate()} disabled={forecastMutation.isPending}><RefreshCw className="w-4 h-4 mr-2" />Generate Forecast</Button>
              <Button variant="outline" className="w-full" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>Simulate Next Weather</Button>
              {simResult && <div className="text-sm p-3 rounded-md bg-muted space-y-1">
                <div>Next: <span className="font-medium capitalize">{String(simResult.nextWeather)}</span></div>
                <div>In: <span className="font-medium">{String(simResult.estimatedTransitionIn)}s</span></div>
                <div>Intensity: <span className="font-medium">{(Number(simResult.intensity) * 100).toFixed(0)}%</span></div>
              </div>}
            </CardContent>
          </Card>
        </div>
      )}

      {forecast && (
        <Card>
          <CardHeader><CardTitle>7-Period Forecast</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {forecast.map((f, i) => {
              const Icon = WEATHER_ICONS[String(f.weather)] ?? Cloud;
              return (
                <div key={i} className="text-center text-xs space-y-1">
                  <div className="text-muted-foreground">{String(f.hour)}h</div>
                  <Icon className="w-5 h-5 mx-auto text-blue-400" />
                  <div className="capitalize font-medium">{String(f.weather)}</div>
                  <div className="text-muted-foreground">{String(f.temperature)}°C</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
