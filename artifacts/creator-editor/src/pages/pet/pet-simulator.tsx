import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Play, Zap, Heart, TrendingUp, Sword } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetSimulator() {
  const { toast } = useToast();
  const [petId, setPetId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [foodType, setFoodType] = useState("meat");
  const [expAmount, setExpAmount] = useState(100);
  const [growthLevels, setGrowthLevels] = useState(10);
  const [loyaltyActions, setLoyaltyActions] = useState("feed,combat_win,neglect");
  const [partnerId, setPartnerId] = useState("");
  const [combatHp, setCombatHp] = useState(100);
  const [combatAtk, setCombatAtk] = useState(10);
  const [combatDef, setCombatDef] = useState(5);
  const [evolveTarget, setEvolveTarget] = useState("");

  const run = (endpoint: string, body?: object) => {
    apiFetch(`/api/pets/${petId}/simulate/${endpoint}`, { method: "POST", body: body ? JSON.stringify(body) : undefined })
      .then(r => r.json())
      .then(d => { setResult(d); toast({ title: "Simulation complete" }); })
      .catch(() => toast({ title: "Simulation failed", variant: "destructive" }));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Play className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Pet Simulator</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <Label>Pet ID</Label>
          <Input type="number" value={petId} onChange={e => setPetId(e.target.value)} placeholder="Enter pet ID" className="max-w-xs" />
        </CardContent>
      </Card>

      <Tabs defaultValue="lifecycle">
        <TabsList>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="exp">EXP</TabsTrigger>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
          <TabsTrigger value="breed">Breed</TabsTrigger>
          <TabsTrigger value="combat">Combat</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle">
          <Card><CardContent className="p-4 flex flex-wrap gap-2">
            <Button disabled={!petId} onClick={() => run("spawn")}><Play className="w-4 h-4 mr-2" />Spawn</Button>
            <Button disabled={!petId} variant="outline" onClick={() => run("despawn")}>Despawn</Button>
            <Button disabled={!petId} onClick={() => run("summon")}><Zap className="w-4 h-4 mr-2" />Summon</Button>
            <Button disabled={!petId} variant="outline" onClick={() => run("dismiss")}>Dismiss</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="feed">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1"><Label>Food Type</Label>
                <Select value={foodType} onValueChange={setFoodType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["meat","fish","berries","vegetables","candy","special","potion","crystal"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button disabled={!petId} onClick={() => run("feed", { foodType, amount: 20 })}><Heart className="w-4 h-4 mr-2" />Feed</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="exp">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-3">
              <div><Label>EXP Amount</Label><Input type="number" value={expAmount} onChange={e => setExpAmount(Number(e.target.value))} className="w-32" /></div>
              <Button disabled={!petId} onClick={() => run("gain-exp", { amount: expAmount })}><TrendingUp className="w-4 h-4 mr-2" />Gain EXP</Button>
              <Button disabled={!petId} variant="outline" onClick={() => run("level-up")}>Level Up</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-3">
              <div><Label>Target Species ID</Label><Input type="number" value={evolveTarget} onChange={e => setEvolveTarget(e.target.value)} className="w-40" /></div>
              <Button disabled={!petId || !evolveTarget} onClick={() => run("evolve", { targetSpeciesId: Number(evolveTarget) })}>Evolve</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="breed">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-3">
              <div><Label>Partner Pet ID</Label><Input type="number" value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-40" /></div>
              <Button disabled={!petId || !partnerId} onClick={() => run("breed", { partnerId: Number(partnerId) })}><Heart className="w-4 h-4 mr-2" />Breed</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="combat">
          <Card><CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Simulate combat against a custom opponent</p>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Opponent HP</Label><Input type="number" value={combatHp} onChange={e => setCombatHp(Number(e.target.value))} /></div>
              <div><Label>Opponent ATK</Label><Input type="number" value={combatAtk} onChange={e => setCombatAtk(Number(e.target.value))} /></div>
              <div><Label>Opponent DEF</Label><Input type="number" value={combatDef} onChange={e => setCombatDef(Number(e.target.value))} /></div>
            </div>
            <Button disabled={!petId} onClick={() => run("combat", { hp: combatHp, attack: combatAtk, defense: combatDef })}><Sword className="w-4 h-4 mr-2" />Simulate Combat</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-3">
              <div><Label>Simulate Levels</Label><Input type="number" min={1} max={50} value={growthLevels} onChange={e => setGrowthLevels(Number(e.target.value))} className="w-32" /></div>
              <Button disabled={!petId} onClick={() => run("growth", { levels: growthLevels })}><TrendingUp className="w-4 h-4 mr-2" />Simulate Growth</Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <Card><CardContent className="p-4 space-y-3">
            <div><Label>Actions (comma-separated)</Label>
              <p className="text-xs text-muted-foreground mb-1">Options: feed, combat_win, battle_loss, neglect</p>
              <Input value={loyaltyActions} onChange={e => setLoyaltyActions(e.target.value)} />
            </div>
            <Button disabled={!petId} onClick={() => run("loyalty", { actions: loyaltyActions.split(",").map(a => a.trim()) })}><Heart className="w-4 h-4 mr-2" />Simulate Loyalty</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card>
          <CardHeader><CardTitle>Simulation Result</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto bg-muted p-3 rounded max-h-80 overflow-y-auto">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
