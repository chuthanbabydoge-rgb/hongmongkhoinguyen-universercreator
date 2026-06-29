import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skull, Save, Upload, Copy, Archive, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

type Boss = Record<string, unknown>;

export default function BossEditorPage() {
  const [, params] = useRoute("/boss-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Boss>({});
  const [dirty, setDirty] = useState(false);

  const { data: boss, isLoading } = useQuery<Boss>({
    queryKey: ["/api/bosses", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => { if (boss) { setForm(boss); setDirty(false); } }, [boss]);

  const set = (key: string, value: unknown) => { setForm(f => ({ ...f, [key]: value })); setDirty(true); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id] }); setDirty(false); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/publish`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id] }); toast({ title: "Published" }); },
    onError: () => toast({ title: "Error", description: "Failed to publish", variant: "destructive" }),
  });

  const snapshotMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/snapshot`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ label: `Snapshot ${new Date().toLocaleDateString()}` }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "Snapshot saved" }),
  });

  if (isLoading) return <div className="text-muted-foreground p-6">Loading boss...</div>;
  if (!boss) return <div className="p-6 text-destructive">Boss not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/boss-browser"><span className="hover:text-foreground cursor-pointer">Browser</span></Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{String(form.name ?? "")}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skull className="w-6 h-6 text-red-500" />
          <div>
            <div className="font-bold text-xl">{String(form.name ?? "Boss")}</div>
            <div className="flex gap-2 mt-1">
              {(boss.isPublished as boolean) && <Badge>Published</Badge>}
              {(boss.isArchived as boolean) && <Badge variant="secondary">Archived</Badge>}
              {(dirty as boolean) && <Badge variant="outline">Unsaved</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => snapshotMutation.mutate()}><Copy className="w-4 h-4 mr-1" />Snapshot</Button>
          <Button variant="outline" size="sm" onClick={() => publishMutation.mutate()}><Upload className="w-4 h-4 mr-1" />Publish</Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending}><Save className="w-4 h-4 mr-1" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="combat">Combat</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="arena">Arena</TabsTrigger>
          <TabsTrigger value="loot">Loot</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="spawn">Spawn</TabsTrigger>
          <TabsTrigger value="cinematics">Cinematics</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>General Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => set("name", e.target.value)} /></div>
                <div className="space-y-1"><Label>Slug</Label><Input value={String(form.slug ?? "")} onChange={e => set("slug", e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea rows={3} value={String(form.description ?? "")} onChange={e => set("description", e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Boss Type</Label>
                  <Select value={String(form.bossType ?? "dungeon_boss")} onValueChange={v => set("bossType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["world_boss","dungeon_boss","raid_boss","field_boss","event_boss","mini_boss","final_boss","secret_boss","story_boss","challenge_boss"].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g," ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Rarity</Label>
                  <Select value={String(form.rarity ?? "rare")} onValueChange={v => set("rarity", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["common","uncommon","rare","epic","legendary","mythic","unique"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Difficulty</Label>
                  <Select value={String(form.difficulty ?? "normal")} onValueChange={v => set("difficulty", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["easy","normal","hard","expert","legendary","nightmare","ultimate"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Level</Label><Input type="number" value={String(form.level ?? 1)} onChange={e => set("level", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Min Players</Label><Input type="number" value={String(form.minPlayers ?? 1)} onChange={e => set("minPlayers", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Max Players</Label><Input type="number" value={String(form.maxPlayers ?? 10)} onChange={e => set("maxPlayers", Number(e.target.value))} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Base Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[["baseHp","Base HP"],["baseAttack","Base Attack"],["baseDefense","Base Defense"],["baseSpeed","Base Speed"],["baseMagicAttack","Magic Attack"],["baseMagicDefense","Magic Defense"]].map(([k,l]) => (
                  <div key={k} className="space-y-1"><Label>{l}</Label><Input type="number" value={String(form[k] ?? 0)} onChange={e => set(k, Number(e.target.value))} /></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>HP Scaling</Label><Input type="number" step="0.01" value={String(form.hpScaling ?? 1)} onChange={e => set("hpScaling", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Damage Scaling</Label><Input type="number" step="0.01" value={String(form.damageScaling ?? 1)} onChange={e => set("damageScaling", Number(e.target.value))} /></div>
              </div>
              <div className="space-y-1"><Label>Total Phases</Label><Input type="number" value={String(form.totalPhases ?? 1)} onChange={e => set("totalPhases", Number(e.target.value))} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combat" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Combat Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={Boolean(form.hasRageMode)} onCheckedChange={v => set("hasRageMode", v)} />
                  <Label>Rage Mode</Label>
                </div>
              </div>
              {!!(form.hasRageMode as any) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Rage Threshold (HP %)</Label><Input type="number" step="0.01" value={String(form.rageThreshold ?? 0.25)} onChange={e => set("rageThreshold", Number(e.target.value))} /></div>
                  <div className="space-y-1"><Label>Enrage Timer (seconds)</Label><Input type="number" value={String(form.enrageTimer ?? "")} onChange={e => set("enrageTimer", Number(e.target.value))} /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>NPC Reference</Label><Input value={String(form.npcRef ?? "")} onChange={e => set("npcRef", e.target.value)} /></div>
                <div className="space-y-1"><Label>Combat Reference</Label><Input value={String(form.combatRef ?? "")} onChange={e => set("combatRef", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Respawn Cooldown (s)</Label><Input type="number" value={String(form.respawnCooldown ?? 86400)} onChange={e => set("respawnCooldown", Number(e.target.value))} /></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/boss-phase-editor/${id}`}><Button variant="outline" className="w-full">Edit Phases <ChevronRight className="w-4 h-4 ml-auto" /></Button></Link>
            <Link href={`/boss-pattern-editor/${id}`}><Button variant="outline" className="w-full">Edit Patterns <ChevronRight className="w-4 h-4 ml-auto" /></Button></Link>
          </div>
        </TabsContent>

        <TabsContent value="phases" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Manage phases in the dedicated Phase Editor</div>
            <Link href={`/boss-phase-editor/${id}`}><Button>Open Phase Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Manage boss skills in the dedicated Skill Editor</div>
            <Link href={`/boss-skill-editor/${id}`}><Button>Open Skill Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Manage combat patterns in the dedicated Pattern Editor</div>
            <Link href={`/boss-pattern-editor/${id}`}><Button>Open Pattern Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="arena" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Configure the boss arena in the dedicated Arena Editor</div>
            <Link href={`/boss-arena-editor/${id}`}><Button>Open Arena Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="loot" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Configure loot drops in the dedicated Loot Editor</div>
            <Link href={`/boss-loot-editor/${id}`}><Button>Open Loot Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Configure kill rewards in the dedicated Reward Editor</div>
            <Link href={`/boss-reward-editor/${id}`}><Button>Open Reward Editor</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="spawn" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Asset References</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["portraitAssetId","Portrait Asset ID"],["modelAssetId","Model Asset ID"],["animationAssetId","Animation Asset ID"],["audioAssetId","Audio Asset ID"],["cinematicAssetId","Cinematic Asset ID"]].map(([k,l]) => (
                  <div key={k} className="space-y-1"><Label>{l}</Label><Input type="number" value={String(form[k] ?? "")} onChange={e => set(k, e.target.value ? Number(e.target.value) : null)} /></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cinematics" className="mt-4">
          <Card><CardContent className="py-6 text-center text-muted-foreground">Cinematics and dialogues are managed via the API. Configure cinematic asset IDs in the Spawn tab.</CardContent></Card>
        </TabsContent>

        <TabsContent value="runtime" className="mt-4">
          <Card><CardContent className="py-6 text-center space-y-2">
            <div className="text-muted-foreground">Test this boss in the Runtime simulator</div>
            <Link href={`/boss-runtime/${id}`}><Button>Open Runtime</Button></Link>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <BossHistoryTab id={id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Switch checked={Boolean(form.isTemplate)} onCheckedChange={v => set("isTemplate", v)} />
                <Label>Mark as Template</Label>
              </div>
              <div className="pt-2 border-t border-border space-y-2">
                <div className="text-sm font-medium">Danger Zone</div>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => {
                  if (confirm("Archive this boss?")) {
                    fetch(`${BASE}/api/bosses/${id}/archive`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } })
                      .then(() => { qc.invalidateQueries({ queryKey: ["/api/bosses", id] }); toast({ title: "Archived" }); });
                  }
                }}>
                  <Archive className="w-4 h-4 mr-2" />Archive Boss
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BossHistoryTab({ id }: { id: number }) {
  const { data, isLoading } = useQuery<{ action: string; field?: string; newValue?: string; changedBy: number; createdAt: string }[]>({
    queryKey: ["/api/bosses", id, "history"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/history`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  return (
    <Card><CardContent className="space-y-2 pt-4">
      {(data ?? []).length === 0 ? <div className="text-muted-foreground text-center py-4">No history yet</div> : (data ?? []).map((h, i) => (
        <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2">
          <span className="font-medium capitalize">{h.action.replace(/_/g, " ")}{h.field ? ` · ${h.field}` : ""}</span>
          <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </CardContent></Card>
  );
}
