import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetEditorPage() {
  const [, params] = useRoute("/pet-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>({});
  const [statsForm, setStatsForm] = useState<Record<string, any>>({});
  const [growthForm, setGrowthForm] = useState<Record<string, any>>({});

  const { data: pet, isLoading } = useQuery({
    queryKey: [`/api/pets/${id}`],
    queryFn: () => apiFetch(`/api/pets/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/pets/${id}/stats`],
    queryFn: () => apiFetch(`/api/pets/${id}/stats`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: growth } = useQuery({
    queryKey: [`/api/pets/${id}/growth`],
    queryFn: () => apiFetch(`/api/pets/${id}/growth`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: skills } = useQuery({
    queryKey: [`/api/pets/${id}/skills`],
    queryFn: () => apiFetch(`/api/pets/${id}/skills`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: equipment } = useQuery({
    queryKey: [`/api/pets/${id}/equipment`],
    queryFn: () => apiFetch(`/api/pets/${id}/equipment`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: evolutions } = useQuery({
    queryKey: [`/api/pets/${id}/evolutions`],
    queryFn: () => apiFetch(`/api/pets/${id}/evolutions`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: breeding } = useQuery({
    queryKey: [`/api/pets/${id}/breeding`],
    queryFn: () => apiFetch(`/api/pets/${id}/breeding`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: runtime } = useQuery({
    queryKey: [`/api/pets/${id}/full`],
    queryFn: () => apiFetch(`/api/pets/${id}/full`).then(r => r.json()),
    enabled: !!id,
  });

  useEffect(() => { if (pet) setForm(pet); }, [pet]);
  useEffect(() => { if (stats) setStatsForm(stats); }, [stats]);
  useEffect(() => { if (growth) setGrowthForm(growth); }, [growth]);

  const saveMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}`, { method: "PATCH", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}`] }); toast({ title: "Pet saved" }); },
  });

  const saveStatsMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/stats`, { method: "PUT", body: JSON.stringify(statsForm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/stats`] }); toast({ title: "Stats saved" }); },
  });

  const saveGrowthMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/growth`, { method: "PUT", body: JSON.stringify(growthForm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/growth`] }); toast({ title: "Growth saved" }); },
  });

  const publishMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/publish`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}`] }); toast({ title: "Pet published" }); },
  });

  if (isLoading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (!pet) return <div className="p-6"><p className="text-destructive">Pet not found</p></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pet-browser"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">{pet.name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{pet.petType}</Badge>
              <Badge variant="secondary">{pet.rarity}</Badge>
              {pet.isPublished && <Badge>Published</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>Publish</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Level</Label><Input type="number" value={form.level ?? 1} onChange={e => setForm(f => ({ ...f, level: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Type</Label>
                <Select value={form.petType ?? "beast"} onValueChange={v => setForm(f => ({ ...f, petType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["beast","dragon","elemental","mechanical","undead","spirit","aquatic","flying","insect","plant","humanoid","demon"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Rarity</Label>
                <Select value={form.rarity ?? "common"} onValueChange={v => setForm(f => ({ ...f, rarity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["common","uncommon","rare","epic","legendary","mythic"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Size</Label>
                <Select value={form.size ?? "medium"} onValueChange={v => setForm(f => ({ ...f, size: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["tiny","small","medium","large","huge","gigantic"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Loyalty ({form.loyalty ?? 50})</Label><Input type="number" min={0} max={100} value={form.loyalty ?? 50} onChange={e => setForm(f => ({ ...f, loyalty: Number(e.target.value) }))} /></div>
              <div><Label>Hunger ({form.hunger ?? 100})</Label><Input type="number" min={0} max={100} value={form.hunger ?? 100} onChange={e => setForm(f => ({ ...f, hunger: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Icon Asset ID</Label><Input value={form.iconAssetId ?? ""} onChange={e => setForm(f => ({ ...f, iconAssetId: e.target.value }))} /></div>
            <div><Label>Portrait Asset ID</Label><Input value={form.portraitAssetId ?? ""} onChange={e => setForm(f => ({ ...f, portraitAssetId: e.target.value }))} /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {["hp","maxHp","attack","defense","speed","specialAttack","specialDefense"].map(stat => (
                <div key={stat}><Label className="capitalize">{stat.replace(/([A-Z])/g, " $1")}</Label>
                  <Input type="number" value={statsForm[stat] ?? 0} onChange={e => setStatsForm(f => ({ ...f, [stat]: Number(e.target.value) }))} /></div>
              ))}
              {["critRate","evasion","accuracy"].map(stat => (
                <div key={stat}><Label className="capitalize">{stat.replace(/([A-Z])/g, " $1")} (0–1)</Label>
                  <Input type="number" step="0.01" min={0} max={1} value={statsForm[stat] ?? 0} onChange={e => setStatsForm(f => ({ ...f, [stat]: Number(e.target.value) }))} /></div>
              ))}
            </div>
            <Button onClick={() => saveStatsMutation.mutate()} disabled={saveStatsMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Stats</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Growth Type</Label>
                <Select value={growthForm.growthType ?? "normal"} onValueChange={v => setGrowthForm(f => ({ ...f, growthType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["fast","normal","slow","erratic","fluctuating","medium_fast"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Max Level</Label><Input type="number" value={growthForm.maxLevel ?? 100} onChange={e => setGrowthForm(f => ({ ...f, maxLevel: Number(e.target.value) }))} /></div>
              <div><Label>EXP Multiplier</Label><Input type="number" step="0.1" value={growthForm.expMultiplier ?? 1.0} onChange={e => setGrowthForm(f => ({ ...f, expMultiplier: Number(e.target.value) }))} /></div>
              <div><Label>Stat Multiplier</Label><Input type="number" step="0.1" value={growthForm.statMultiplier ?? 1.0} onChange={e => setGrowthForm(f => ({ ...f, statMultiplier: Number(e.target.value) }))} /></div>
              <div><Label>Loyalty Growth</Label><Input type="number" step="0.1" value={growthForm.loyaltyGrowth ?? 1.0} onChange={e => setGrowthForm(f => ({ ...f, loyaltyGrowth: Number(e.target.value) }))} /></div>
              <div><Label>Hunger Rate</Label><Input type="number" step="0.1" value={growthForm.hungerRate ?? 1.0} onChange={e => setGrowthForm(f => ({ ...f, hungerRate: Number(e.target.value) }))} /></div>
            </div>
            <Button onClick={() => saveGrowthMutation.mutate()} disabled={saveGrowthMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Growth</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Skills assigned to this pet (by skill ref ID)</p>
            {!skills?.length ? <p className="text-muted-foreground text-sm">No skills assigned</p> : (
              <div className="space-y-2">
                {skills.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                    <div><span className="font-mono text-sm">{s.skillRef}</span><span className="ml-2 text-xs text-muted-foreground">Slot {s.slotIndex} · Lv. {s.learnedAtLevel}</span></div>
                    <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/pet-skill-editor/${id}`}><Button className="mt-3" variant="outline">Manage Skills</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card><CardContent className="p-4">
            {!equipment?.length ? <p className="text-muted-foreground text-sm">No equipment equipped</p> : (
              <div className="space-y-2">
                {equipment.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-2 border rounded">
                    <div><span className="font-medium capitalize">{e.slot}</span>{e.itemRef && <span className="ml-2 text-xs text-muted-foreground">{e.itemRef}</span>}</div>
                    <div className="text-xs text-muted-foreground">ATK+{e.attackBonus} DEF+{e.defenseBonus} SPD+{e.speedBonus}</div>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/pet-equipment-editor/${id}`}><Button className="mt-3" variant="outline">Manage Equipment</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card><CardContent className="p-4">
            {!evolutions?.length ? <p className="text-muted-foreground text-sm">No evolution paths defined</p> : (
              <div className="space-y-2">
                {evolutions.map((e: any) => (
                  <div key={e.id} className="p-2 border rounded">
                    <p className="font-medium">→ Species {e.targetSpeciesId}</p>
                    <p className="text-xs text-muted-foreground">Required Lv. {e.requiredLevel}{e.requiredItem ? ` · Item: ${e.requiredItem}` : ""}{e.requiredLoyalty ? ` · Loyalty ≥ ${e.requiredLoyalty}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/pet-evolution-editor/${id}`}><Button className="mt-3" variant="outline">Manage Evolution</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="breeding">
          <Card><CardContent className="p-4 space-y-3">
            {breeding ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Max Breeds</p><p className="font-medium">{breeding.maxBreeds}</p></div>
                <div><p className="text-muted-foreground">Current Breeds</p><p className="font-medium">{breeding.currentBreeds}</p></div>
                <div><p className="text-muted-foreground">Cooldown</p><p className="font-medium">{breeding.breedingCooldown}s</p></div>
                <div><p className="text-muted-foreground">Offspring</p><p className="font-medium">{breeding.offspringSpeciesId ?? "Auto"}</p></div>
              </div>
            ) : <p className="text-muted-foreground text-sm">No breeding configuration</p>}
            <Link href={`/pet-breeding-editor/${id}`}><Button variant="outline">Configure Breeding</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Personality</Label>
                <Select value={form.personality ?? "quirky"} onValueChange={v => setForm(f => ({ ...f, personality: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["brave","timid","jolly","modest","bold","calm","gentle","hasty","impish","lax","lonely","mild","naive","naughty","quiet","quirky","rash","relaxed","sassy","serious"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>State</Label>
                <Select value={form.state ?? "idle"} onValueChange={v => setForm(f => ({ ...f, state: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["idle","following","fighting","resting","hungry","happy","evolving","breeding","sleeping","exploring"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Behavior</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="runtime">
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Live runtime state</p>
            {runtime ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">HP</p><p className="font-medium">{runtime.pet?.level}</p></div>
                <div><p className="text-muted-foreground">EXP</p><p className="font-medium">{runtime.pet?.experience}</p></div>
              </div>
            ) : <p className="text-muted-foreground text-sm">No runtime data</p>}
            <Link href={`/pet-simulator`}><Button className="mt-3" variant="outline">Open Simulator</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history">
          <Card><CardContent className="p-4">
            <Link href={`/pet-history/${id}`}><Button variant="outline">View Full History</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>NPC Ref</Label><Input value={form.npcRef ?? ""} onChange={e => setForm(f => ({ ...f, npcRef: e.target.value }))} /></div>
              <div><Label>World Ref</Label><Input value={form.worldRef ?? ""} onChange={e => setForm(f => ({ ...f, worldRef: e.target.value }))} /></div>
              <div><Label>Combat Ref</Label><Input value={form.combatRef ?? ""} onChange={e => setForm(f => ({ ...f, combatRef: e.target.value }))} /></div>
              <div><Label>Model Asset ID</Label><Input value={form.modelAssetId ?? ""} onChange={e => setForm(f => ({ ...f, modelAssetId: e.target.value }))} /></div>
              <div><Label>Animation Asset ID</Label><Input value={form.animationAssetId ?? ""} onChange={e => setForm(f => ({ ...f, animationAssetId: e.target.value }))} /></div>
              <div><Label>Audio Asset ID</Label><Input value={form.audioAssetId ?? ""} onChange={e => setForm(f => ({ ...f, audioAssetId: e.target.value }))} /></div>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Settings</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
