import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot, Save, Copy, GitBranch, Archive, Star, CheckCircle,
  User, Sword, Backpack, Shield, Brain, MessageSquare, Calendar,
  MapPin, Route, Users, Flag, History, BarChart2, Eye,
} from "lucide-react";
import { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const NPC_TYPES = ["humanoid","creature","boss","merchant","quest_giver","guard","neutral","companion","enemy","custom"];
const BEHAVIORS = ["aggressive","defensive","passive","cowardly","neutral","friendly","territorial","custom"];
const STATES = ["idle","patrolling","chasing","attacking","fleeing","interacting","dead","sleeping","working","custom"];

export default function NpcEditorPage() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState(false);

  const { data: npc, isLoading } = useQuery({
    queryKey: ["/api/npc-editor", npcId],
    queryFn: () => apiFetch(`/api/npc-editor/${npcId}`),
  });

  useEffect(() => {
    if (npc) {
      const d = npc as any;
      setForm({ name: d.name, description: d.description ?? "", npcType: d.npcType, behavior: d.behavior, state: d.state, level: d.level });
    }
  }, [npc]);

  const { data: stats } = useQuery({
    queryKey: ["/api/npc-editor", npcId, "stats"],
    queryFn: () => apiFetch(`/api/npc-editor/${npcId}/stats`),
  });

  const { data: attributes } = useQuery({
    queryKey: ["/api/npc-editor", npcId, "attributes"],
    queryFn: () => apiFetch(`/api/npc-editor/${npcId}/attributes`),
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["/api/npc-editor", npcId, "skills"],
    queryFn: () => apiFetch(`/api/npc-editor/${npcId}/skills`),
  });

  const updateNpc = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId] }); setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 2000); },
  });

  const publishNpc = useMutation({
    mutationFn: () => apiFetch(`/api/npc-editor/${npcId}/publish`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId] }),
  });

  const duplicateNpc = useMutation({
    mutationFn: () => apiFetch(`/api/npc-editor/${npcId}/duplicate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: (n: any) => nav(`/npc-editor/${n.id}`),
  });

  const validateNpc = useMutation({
    mutationFn: () => apiFetch(`/api/npc-editor/${npcId}/validate`, { method: "POST", body: JSON.stringify({}) }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!npc) return <div className="text-center py-16 text-muted-foreground">NPC not found</div>;

  const handleSave = () => updateNpc.mutate(form);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{npc.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">Lv.{npc.level} {npc.npcType} · {npc.behavior}</p>
          </div>
          {npc.isPublished && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Published</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {saved && <span className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4" /> Saved</span>}
          <Button variant="outline" size="sm" onClick={() => duplicateNpc.mutate()}><Copy className="w-3 h-3 mr-1" /> Duplicate</Button>
          <Button variant="outline" size="sm" onClick={() => nav(`/npc-preview/${npcId}`)}><Eye className="w-3 h-3 mr-1" /> Preview</Button>
          <Button variant="outline" size="sm" onClick={() => validateNpc.mutate()}><CheckCircle className="w-3 h-3 mr-1" /> Validate</Button>
          {!npc.isPublished && <Button variant="outline" size="sm" onClick={() => publishNpc.mutate()}><Star className="w-3 h-3 mr-1" /> Publish</Button>}
          <Button size="sm" onClick={handleSave} disabled={updateNpc.isPending}><Save className="w-3 h-3 mr-1" /> Save</Button>
        </div>
      </div>

      {validateNpc.data && (
        <Card className={validateNpc.data.valid ? "border-emerald-500/40" : "border-red-500/40"}>
          <CardContent className="pt-4 pb-3">
            <p className="font-medium text-sm mb-2">{validateNpc.data.valid ? "✓ Validation passed" : "✗ Validation failed"}</p>
            {validateNpc.data.errors?.map((e: string, i: number) => <p key={i} className="text-xs text-red-400">• {e}</p>)}
            {validateNpc.data.warnings?.map((w: string, i: number) => <p key={i} className="text-xs text-yellow-400">⚠ {w}</p>)}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general"><User className="w-3 h-3 mr-1" />General</TabsTrigger>
          <TabsTrigger value="stats"><BarChart2 className="w-3 h-3 mr-1" />Stats</TabsTrigger>
          <TabsTrigger value="skills" onClick={() => nav(`/npc-skill/${npcId}`)}><Sword className="w-3 h-3 mr-1" />Skills</TabsTrigger>
          <TabsTrigger value="inventory" onClick={() => nav(`/npc-inventory/${npcId}`)}><Backpack className="w-3 h-3 mr-1" />Inventory</TabsTrigger>
          <TabsTrigger value="equipment" onClick={() => nav(`/npc-equipment/${npcId}`)}><Shield className="w-3 h-3 mr-1" />Equipment</TabsTrigger>
          <TabsTrigger value="behavior" onClick={() => nav(`/npc-behavior/${npcId}`)}><Brain className="w-3 h-3 mr-1" />Behavior</TabsTrigger>
          <TabsTrigger value="dialogue" onClick={() => nav(`/npc-dialogue/${npcId}`)}><MessageSquare className="w-3 h-3 mr-1" />Dialogue</TabsTrigger>
          <TabsTrigger value="schedule" onClick={() => nav(`/npc-schedule/${npcId}`)}><Calendar className="w-3 h-3 mr-1" />Schedule</TabsTrigger>
          <TabsTrigger value="spawn" onClick={() => nav(`/npc-spawn-manager/${npcId}`)}><MapPin className="w-3 h-3 mr-1" />Spawn</TabsTrigger>
          <TabsTrigger value="patrol" onClick={() => nav(`/npc-patrol/${npcId}`)}><Route className="w-3 h-3 mr-1" />Patrol</TabsTrigger>
          <TabsTrigger value="relations" onClick={() => nav(`/npc-relation/${npcId}`)}><Users className="w-3 h-3 mr-1" />Relations</TabsTrigger>
          <TabsTrigger value="history" onClick={() => nav(`/npc-history/${npcId}`)}><History className="w-3 h-3 mr-1" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <Input value={String(form.name ?? npc.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Textarea value={String(form.description ?? npc.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={String(form.npcType ?? npc.npcType)} onChange={(e) => setForm({ ...form, npcType: e.target.value })}>
                      {NPC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Level</label>
                    <Input type="number" min={1} max={999} value={String(form.level ?? npc.level)} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Behavior</label>
                    <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={String(form.behavior ?? npc.behavior)} onChange={(e) => setForm({ ...form, behavior: e.target.value })}>
                      {BEHAVIORS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">State</label>
                    <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={String(form.state ?? npc.state)} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={updateNpc.isPending} className="w-full">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Quick Stats</CardTitle></CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[["HP", stats.maxHp], ["MP", stats.maxMp], ["ATK", stats.attackPower], ["DEF", stats.defense], ["SPD", stats.speed], ["RNG", stats.attackRange]].map(([label, val]) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-sm font-mono font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Loading…</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Attributes</CardTitle></CardHeader>
                <CardContent>
                  {attributes ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[["STR", attributes.strength], ["DEX", attributes.dexterity], ["INT", attributes.intelligence], ["WIS", attributes.wisdom], ["CHA", attributes.charisma], ["CON", attributes.constitution]].map(([label, val]) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-sm font-mono font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Loading…</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Skills ({(skills as any[]).length})</CardTitle></CardHeader>
                <CardContent>
                  {(skills as any[]).slice(0, 4).map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm">{s.name}</span>
                      <Badge variant="outline" className="text-xs">{s.skillType}</Badge>
                    </div>
                  ))}
                  {(skills as any[]).length === 0 && <p className="text-sm text-muted-foreground">No skills</p>}
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => nav(`/npc-skill/${npcId}`)}>
                    Manage Skills →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <NpcStatsTab npcId={npcId} stats={stats} qc={qc} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NpcStatsTab({ npcId, stats, qc }: { npcId: number; stats: any; qc: any }) {
  const [form, setForm] = useState<Record<string, unknown>>(stats ?? {});

  const updateStats = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`${BASE}/api/npc-editor/${npcId}/stats`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("creator_token")}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "stats"] }),
  });

  const fields: [string, string][] = [
    ["maxHp","Max HP"],["maxMp","Max MP"],["maxStamina","Max Stamina"],["attackPower","Attack Power"],
    ["defense","Defense"],["magicPower","Magic Power"],["magicDefense","Magic Defense"],
    ["speed","Speed"],["attackRange","Attack Range"],["detectionRange","Detection Range"],
    ["experienceReward","EXP Reward"],["goldReward","Gold Reward"],
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Combat Statistics</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {fields.map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <Input type="number" value={String(form[key] ?? stats?.[key] ?? 0)} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
        <Button onClick={() => updateStats.mutate(form)} disabled={updateStats.isPending}>
          <Save className="w-4 h-4 mr-2" /> Save Stats
        </Button>
      </CardContent>
    </Card>
  );
}
