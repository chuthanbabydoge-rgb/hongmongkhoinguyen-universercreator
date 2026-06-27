import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Swords, Save, CheckCircle, Archive, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

function SubList({ title, items, fields, onCreate, onDelete }: {
  title: string;
  items: Record<string, unknown>[];
  fields: { key: string; label: string; type?: string }[];
  onCreate: (data: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {fields.map(f => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}</Label>
              <Input type={f.type ?? "text"} placeholder={f.label} value={String(form[f.key] ?? "")}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))} />
            </div>
          ))}
        </div>
        <Button size="sm" onClick={() => { onCreate(form); setForm({}); }}>Add {title}</Button>
        <div className="space-y-2 mt-2">
          {items.map((item) => (
            <div key={String(item["id"])} className="flex items-center justify-between p-2 rounded border border-border text-sm">
              <span>{String(item[fields[0]?.key ?? "id"] ?? "—")}</span>
              <Button size="sm" variant="ghost" className="text-destructive h-6 px-2" onClick={() => onDelete(Number(item["id"]))}>Remove</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CombatEditorPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: combat, isLoading } = useQuery({ queryKey: ["/api/combat", id], queryFn: () => apiFetch(`/api/combat/${id}`).then(r => r.json()) });
  const { data: rules = [] } = useQuery({ queryKey: ["/api/combat", id, "rules"], queryFn: () => apiFetch(`/api/combat/${id}/rules`).then(r => r.json()) });
  const { data: formulas = [] } = useQuery({ queryKey: ["/api/combat", id, "formulas"], queryFn: () => apiFetch(`/api/combat/${id}/formulas`).then(r => r.json()) });
  const { data: defense = [] } = useQuery({ queryKey: ["/api/combat", id, "defense"], queryFn: () => apiFetch(`/api/combat/${id}/defense`).then(r => r.json()) });
  const { data: resistances = [] } = useQuery({ queryKey: ["/api/combat", id, "resistances"], queryFn: () => apiFetch(`/api/combat/${id}/resistances`).then(r => r.json()) });
  const { data: crits = [] } = useQuery({ queryKey: ["/api/combat", id, "crits"], queryFn: () => apiFetch(`/api/combat/${id}/crits`).then(r => r.json()) });
  const { data: blocks = [] } = useQuery({ queryKey: ["/api/combat", id, "blocks"], queryFn: () => apiFetch(`/api/combat/${id}/blocks`).then(r => r.json()) });
  const { data: dodges = [] } = useQuery({ queryKey: ["/api/combat", id, "dodges"], queryFn: () => apiFetch(`/api/combat/${id}/dodges`).then(r => r.json()) });
  const { data: parries = [] } = useQuery({ queryKey: ["/api/combat", id, "parries"], queryFn: () => apiFetch(`/api/combat/${id}/parries`).then(r => r.json()) });
  const { data: combos = [] } = useQuery({ queryKey: ["/api/combat", id, "combos"], queryFn: () => apiFetch(`/api/combat/${id}/combos`).then(r => r.json()) });
  const { data: status = [] } = useQuery({ queryKey: ["/api/combat", id, "status"], queryFn: () => apiFetch(`/api/combat/${id}/status`).then(r => r.json()) });
  const { data: threat = [] } = useQuery({ queryKey: ["/api/combat", id, "threat"], queryFn: () => apiFetch(`/api/combat/${id}/threat`).then(r => r.json()) });
  const { data: respawn = [] } = useQuery({ queryKey: ["/api/combat", id, "respawn"], queryFn: () => apiFetch(`/api/combat/${id}/respawn`).then(r => r.json()) });
  const { data: history = { items: [] } } = useQuery({ queryKey: ["/api/combat", id, "history"], queryFn: () => apiFetch(`/api/combat/${id}/history?limit=20`).then(r => r.json()) });

  const [form, setForm] = useState<Record<string, unknown>>({});
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const update = useMutation({
    mutationFn: () => apiFetch(`/api/combat/${id}`, { method: "PATCH", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id] }); toast({ title: "Saved" }); },
  });

  const publish = useMutation({
    mutationFn: () => apiFetch(`/api/combat/${id}/publish`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id] }); toast({ title: "Published" }); },
    onError: (e) => toast({ title: "Publish failed", description: String(e), variant: "destructive" }),
  });

  const archive = useMutation({
    mutationFn: () => apiFetch(`/api/combat/${id}/archive`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/combat", id] }); toast({ title: "Archived" }); },
  });

  const mkCreate = (path: string, qk: string) => (data: Record<string, unknown>) =>
    apiFetch(`/api/combat/${id}/${path}`, { method: "POST", body: JSON.stringify(data) }).then(() => qc.invalidateQueries({ queryKey: ["/api/combat", id, qk] }));

  const mkDelete = (path: string, qk: string) => (itemId: number) =>
    apiFetch(`/api/combat/${path}/${itemId}`, { method: "DELETE" }).then(() => qc.invalidateQueries({ queryKey: ["/api/combat", id, qk] }));

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!combat) return <div className="p-8 text-destructive">Combat not found</div>;

  const cur = { ...combat, ...form };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="w-6 h-6 text-red-400" />
          <div>
            <h1 className="text-xl font-bold">{combat.name}</h1>
            <div className="flex gap-2 mt-1">
              {combat.isPublished && <Badge>Published</Badge>}
              {combat.isArchived && <Badge variant="secondary">Archived</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => archive.mutate()}><Archive className="w-4 h-4 mr-1" />Archive</Button>
          <Button variant="outline" size="sm" onClick={() => publish.mutate()}><Globe className="w-4 h-4 mr-1" />Publish</Button>
          <Button size="sm" onClick={() => update.mutate()} disabled={update.isPending}><Save className="w-4 h-4 mr-1" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          {["general","damage","defense","resistance","critical","block","dodge","parry","combo","status","aggro","respawn","simulation","history","settings"].map(t => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card><CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={String(cur.name ?? "")} onChange={e => set("name", e.target.value)} /></div>
            <div><Label>Combat Mode</Label>
              <Select value={String(cur.combatMode ?? "real_time")} onValueChange={v => set("combatMode", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["real_time","turn_based","action","semi_action","tactical"].map(m => <SelectItem key={m} value={m}>{m.replace(/_/g," ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea value={String(cur.description ?? "")} onChange={e => set("description", e.target.value)} rows={3} /></div>
            <div><Label>Max Participants</Label><Input type="number" value={String(cur.maxParticipants ?? 10)} onChange={e => set("maxParticipants", Number(e.target.value))} /></div>
            <div><Label>Max Rounds (0 = unlimited)</Label><Input type="number" value={String(cur.maxRounds ?? 0)} onChange={e => set("maxRounds", Number(e.target.value))} /></div>
            <div><Label>Turn Duration (s)</Label><Input type="number" value={String(cur.turnDuration ?? 30)} onChange={e => set("turnDuration", Number(e.target.value))} /></div>
            <div><Label>Aggro Radius</Label><Input type="number" value={String(cur.aggroRadius ?? 10)} onChange={e => set("aggroRadius", Number(e.target.value))} /></div>
            <div className="flex items-center gap-3"><Switch checked={Boolean(cur.allowFriendlyFire)} onCheckedChange={v => set("allowFriendlyFire", v)} /><Label>Allow Friendly Fire</Label></div>
            <div className="flex items-center gap-3"><Switch checked={Boolean(cur.allowFlee)} onCheckedChange={v => set("allowFlee", v)} /><Label>Allow Flee</Label></div>
            <div className="flex items-center gap-3"><Switch checked={Boolean(cur.allowRespawn)} onCheckedChange={v => set("allowRespawn", v)} /><Label>Allow Respawn</Label></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="damage" className="space-y-4 mt-4">
          <SubList title="Damage Formula" items={formulas as Record<string, unknown>[]}
            fields={[{ key: "formulaName", label: "Name" }, { key: "formulaType", label: "Type" }, { key: "baseValue", label: "Base Value", type: "number" }, { key: "attackScaling", label: "Attack Scaling", type: "number" }]}
            onCreate={mkCreate("formulas", "formulas")} onDelete={mkDelete("formulas", "formulas")} />
          <SubList title="Damage Modifier" items={formulas as Record<string, unknown>[]}
            fields={[{ key: "modifierName", label: "Name" }, { key: "damageType", label: "Damage Type" }, { key: "modifierValue", label: "Value", type: "number" }]}
            onCreate={mkCreate("modifiers", "modifiers")} onDelete={mkDelete("modifiers", "modifiers")} />
        </TabsContent>

        <TabsContent value="defense" className="space-y-4 mt-4">
          <SubList title="Defense Rule" items={defense as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "armorValue", label: "Armor", type: "number" }, { key: "maxReductionPct", label: "Max Reduction %", type: "number" }, { key: "flatReduction", label: "Flat Reduction", type: "number" }]}
            onCreate={mkCreate("defense", "defense")} onDelete={mkDelete("defense", "defense")} />
        </TabsContent>

        <TabsContent value="resistance" className="space-y-4 mt-4">
          <SubList title="Resistance" items={resistances as Record<string, unknown>[]}
            fields={[{ key: "resistanceName", label: "Name" }, { key: "damageType", label: "Damage Type" }, { key: "resistValue", label: "Resist Value", type: "number" }, { key: "maxResistPct", label: "Max Resist %", type: "number" }]}
            onCreate={mkCreate("resistances", "resistances")} onDelete={mkDelete("resistances", "resistances")} />
        </TabsContent>

        <TabsContent value="critical" className="space-y-4 mt-4">
          <SubList title="Critical Rule" items={crits as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "baseCritChance", label: "Base Crit Chance", type: "number" }, { key: "baseCritMultiplier", label: "Crit Multiplier", type: "number" }, { key: "maxCritChance", label: "Max Crit Chance", type: "number" }]}
            onCreate={mkCreate("crits", "crits")} onDelete={mkDelete("crits", "crits")} />
        </TabsContent>

        <TabsContent value="block" className="space-y-4 mt-4">
          <SubList title="Block Rule" items={blocks as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "baseBlockChance", label: "Block Chance", type: "number" }, { key: "blockDamageReduction", label: "Damage Reduction", type: "number" }, { key: "maxBlockChance", label: "Max Block Chance", type: "number" }]}
            onCreate={mkCreate("blocks", "blocks")} onDelete={mkDelete("blocks", "blocks")} />
        </TabsContent>

        <TabsContent value="dodge" className="space-y-4 mt-4">
          <SubList title="Dodge Rule" items={dodges as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "baseDodgeChance", label: "Dodge Chance", type: "number" }, { key: "maxDodgeChance", label: "Max Dodge Chance", type: "number" }, { key: "agilityScaling", label: "Agility Scaling", type: "number" }]}
            onCreate={mkCreate("dodges", "dodges")} onDelete={mkDelete("dodges", "dodges")} />
        </TabsContent>

        <TabsContent value="parry" className="space-y-4 mt-4">
          <SubList title="Parry Rule" items={parries as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "baseParryChance", label: "Parry Chance", type: "number" }, { key: "counterAttackChance", label: "Counter Chance", type: "number" }, { key: "counterDamageMultiplier", label: "Counter Multiplier", type: "number" }]}
            onCreate={mkCreate("parries", "parries")} onDelete={mkDelete("parries", "parries")} />
        </TabsContent>

        <TabsContent value="combo" className="space-y-4 mt-4">
          <SubList title="Combo Rule" items={combos as Record<string, unknown>[]}
            fields={[{ key: "comboName", label: "Name" }, { key: "requiredHits", label: "Required Hits", type: "number" }, { key: "windowDuration", label: "Window (s)", type: "number" }, { key: "bonusDamageMultiplier", label: "Bonus Multiplier", type: "number" }]}
            onCreate={mkCreate("combos", "combos")} onDelete={mkDelete("combos", "combos")} />
        </TabsContent>

        <TabsContent value="status" className="space-y-4 mt-4">
          <SubList title="Status Effect" items={status as Record<string, unknown>[]}
            fields={[{ key: "effectName", label: "Name" }, { key: "category", label: "Category" }, { key: "duration", label: "Duration (s)", type: "number" }, { key: "tickDamage", label: "Tick Damage", type: "number" }]}
            onCreate={mkCreate("status", "status")} onDelete={mkDelete("status", "status")} />
        </TabsContent>

        <TabsContent value="aggro" className="space-y-4 mt-4">
          <SubList title="Threat Rule" items={threat as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "baseThreatMultiplier", label: "Base Threat", type: "number" }, { key: "healingThreatMultiplier", label: "Healing Threat", type: "number" }, { key: "tankingThreatBonus", label: "Tank Bonus", type: "number" }]}
            onCreate={mkCreate("threat", "threat")} onDelete={mkDelete("threat", "threat")} />
        </TabsContent>

        <TabsContent value="respawn" className="space-y-4 mt-4">
          <SubList title="Respawn Rule" items={respawn as Record<string, unknown>[]}
            fields={[{ key: "ruleName", label: "Name" }, { key: "respawnDelay", label: "Delay (s)", type: "number" }, { key: "hpOnRespawn", label: "HP % on Respawn", type: "number" }, { key: "invulnerabilityDuration", label: "Invuln (s)", type: "number" }]}
            onCreate={mkCreate("respawn", "respawn")} onDelete={mkDelete("respawn", "respawn")} />
        </TabsContent>

        <TabsContent value="simulation" className="mt-4">
          <Card><CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Run quick simulations against this combat config.</p>
            <div className="flex gap-2 flex-wrap">
              {["attack","defense","crit","dodge","block","parry","combo","aggro","status","death","respawn"].map(sim => (
                <Button key={sim} variant="outline" size="sm" className="capitalize"
                  onClick={() => apiFetch(`/api/combat/${id}/simulate/${sim}`, { method: "POST", body: "{}" }).then(r => r.json()).then(d => toast({ title: `Sim: ${sim}`, description: JSON.stringify(d, null, 2).slice(0, 200) }))}>
                  {sim}
                </Button>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card><CardContent className="pt-6 space-y-2">
            {(history as { items: Array<{ id: number; actionType: string; performedBy: number; createdAt: string; note: string }> }).items.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm p-2 border-b border-border">
                <span className="font-medium capitalize">{h.actionType}</span>
                <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {!(history as { items: unknown[] }).items.length && <p className="text-muted-foreground">No history yet.</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card><CardContent className="pt-6 space-y-4">
            <div><Label>Death Penalty</Label><Input value={String(cur.deathPenalty ?? "none")} onChange={e => set("deathPenalty", e.target.value)} /></div>
            <div><Label>Flee Chance (0–1)</Label><Input type="number" value={String(cur.fleeChance ?? 0.5)} onChange={e => set("fleeChance", Number(e.target.value))} /></div>
            <div><Label>Respawn Delay (s)</Label><Input type="number" value={String(cur.respawnDelay ?? 5)} onChange={e => set("respawnDelay", Number(e.target.value))} /></div>
            <div className="flex items-center gap-3"><Switch checked={Boolean(cur.isTemplate)} onCheckedChange={v => set("isTemplate", v)} /><Label>Mark as Template</Label></div>
            <Button onClick={() => update.mutate()} disabled={update.isPending}><Save className="w-4 h-4 mr-2" />Save Settings</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
