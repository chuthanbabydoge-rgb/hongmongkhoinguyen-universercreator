import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wand2, Swords, Hammer, Grid3X3, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Item = { id: number; name: string; itemType: string };

export default function ItemSimulator() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [simResult, setSimResult] = useState<unknown>(null);
  const [craftResult, setCraftResult] = useState<unknown>(null);
  const [combatResult, setCombatResult] = useState<unknown>(null);

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/item-editor"],
    queryFn: () => authFetch("/api/item-editor?limit=200").then((r) => r.json()),
  });

  const simulateMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${selectedId}/simulate`, { method: "POST", body: JSON.stringify({ playerLevel }) }).then((r) => r.json()),
    onSuccess: (res) => setSimResult(res),
    onError: () => toast({ title: "Error", description: "Simulation failed", variant: "destructive" }),
  });

  const combatMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${selectedId}/preview-combat`, { method: "POST", body: JSON.stringify({}) }).then((r) => r.json()),
    onSuccess: (res) => setCombatResult(res),
    onError: () => toast({ title: "Error", description: "Combat preview failed", variant: "destructive" }),
  });

  const craftMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${selectedId}/test-crafting`, { method: "POST", body: JSON.stringify({ playerLevel }) }).then((r) => r.json()),
    onSuccess: (res) => setCraftResult(res),
    onError: () => toast({ title: "Error", description: "Crafting test failed", variant: "destructive" }),
  });

  const ResultBlock = ({ data }: { data: unknown }) => (
    <pre className="bg-secondary/30 rounded p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Item Simulator</h1>
      <p className="text-muted-foreground text-sm">Test item behavior in a simulated runtime environment.</p>

      <Card>
        <CardHeader><CardTitle className="text-sm">Configuration</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48"><label className="text-xs text-muted-foreground">Select Item</label>
            <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              value={selectedId} onChange={(e) => { setSelectedId(Number(e.target.value)); setSimResult(null); setCraftResult(null); setCombatResult(null); }}>
              <option value={0}>— choose an item —</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name} (#{i.id})</option>)}
            </select>
          </div>
          <div><label className="text-xs text-muted-foreground">Player Level</label>
            <Input type="number" className="mt-1 w-28" value={playerLevel} onChange={(e) => setPlayerLevel(Number(e.target.value))} min={1} max={100} /></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage"><Wand2 className="w-3 h-3 mr-1" />Usage</TabsTrigger>
          <TabsTrigger value="combat"><Swords className="w-3 h-3 mr-1" />Combat</TabsTrigger>
          <TabsTrigger value="crafting"><Hammer className="w-3 h-3 mr-1" />Crafting</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Simulate Item Usage</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Applies all active on-use effects and returns resolved stats.</p>
              <Button onClick={() => simulateMutation.mutate()} disabled={!selectedId || simulateMutation.isPending}>
                <Play className="w-4 h-4 mr-1" />Run Simulation
              </Button>
              {!!simResult && <ResultBlock data={simResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combat" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Preview Combat Effect</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Simulates one attack roll including critical hit and on-hit effects.</p>
              <Button onClick={() => combatMutation.mutate()} disabled={!selectedId || combatMutation.isPending}>
                <Play className="w-4 h-4 mr-1" />Preview Combat
              </Button>
              {!!combatResult && (
                <div className="space-y-2">
                  {Object.entries(combatResult as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{k.replace(/([A-Z])/g, " $1")}</span>
                      {k === "isCrit" ? (
                        <Badge variant={v ? "destructive" : "secondary"}>{v ? "CRIT!" : "Normal"}</Badge>
                      ) : (
                        <span className="font-medium">{String(v)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crafting" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Test Crafting Result</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Tests whether the item can be crafted at the selected player level.</p>
              <Button onClick={() => craftMutation.mutate()} disabled={!selectedId || craftMutation.isPending}>
                <Play className="w-4 h-4 mr-1" />Test Crafting
              </Button>
              {!!craftResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={(craftResult as Record<string, unknown>)["canCraft"] ? "default" : "secondary"}>
                      {(craftResult as Record<string, unknown>)["canCraft"] ? "✓ Can Craft" : "✗ Cannot Craft"}
                    </Badge>
                    {!!(craftResult as Record<string, unknown>)["reason"] && (
                      <span className="text-xs text-muted-foreground">{String((craftResult as Record<string, unknown>)["reason"])}</span>
                    )}
                  </div>
                  <ResultBlock data={craftResult} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
