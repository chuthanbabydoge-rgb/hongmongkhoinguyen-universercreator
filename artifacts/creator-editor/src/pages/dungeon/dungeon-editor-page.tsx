import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Shield, Swords, BookOpen, Play, ArrowLeft, History, Settings, AlertCircle, Layers } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Dungeon {
  id: number; name: string; description: string | null; dungeonType: string; difficulty: string;
  status: string; resetType: string; resetIntervalHours: number; minLevel: number; maxLevel: number;
  minPartySize: number; maxPartySize: number; timeLimit: number | null; isPublished: boolean;
  isArchived: boolean; isTemplate: boolean; version: number; worldRef: string | null; regionRef: string | null;
}

interface SubResource { id: number; name?: string; roomType?: string; trapType?: string; rewardType?: string; }

export default function DungeonEditorPage() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Dungeon>>({});
  const [dirty, setDirty] = useState(false);

  const { data: dungeon, isLoading } = useQuery<Dungeon>({
    queryKey: ["/api/dungeons", dungeonId],
    queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}`); return r.json(); },
  });

  useEffect(() => { if (dungeon) { setForm(dungeon); setDirty(false); } }, [dungeon]);

  const { data: rooms } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "rooms"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rooms`); return r.json(); } });
  const { data: connections } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "connections"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/connections`); return r.json(); } });
  const { data: bosses } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "bosses"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/bosses`); return r.json(); } });
  const { data: monsters } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "monsters"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/monsters`); return r.json(); } });
  const { data: traps } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "traps"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/traps`); return r.json(); } });
  const { data: puzzles } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "puzzles"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/puzzles`); return r.json(); } });
  const { data: rewards } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "rewards"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/rewards`); return r.json(); } });
  const { data: checkpoints } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "checkpoints"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/checkpoints`); return r.json(); } });
  const { data: requirements } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "requirements"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/requirements`); return r.json(); } });
  const { data: history } = useQuery<SubResource[]>({ queryKey: ["/api/dungeons", dungeonId, "history"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/history`); return r.json(); } });

  const saveMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}`, { method: "PATCH", body: JSON.stringify(form) }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId] }); toast({ title: "Dungeon saved" }); setDirty(false); },
    onError: () => toast({ title: "Error", description: "Failed to save", variant: "destructive" }),
  });

  const publishMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/publish`, { method: "POST" }); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dungeons", dungeonId] }); toast({ title: "Dungeon published" }); },
    onError: () => toast({ title: "Error", description: "Failed to publish", variant: "destructive" }),
  });

  const snapshotMut = useMutation({
    mutationFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/versions`, { method: "POST", body: JSON.stringify({ label: "Auto snapshot" }) }); return r.json(); },
    onSuccess: () => toast({ title: "Version snapshot saved" }),
  });

  const set = (k: keyof Dungeon, v: unknown) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link href="/dungeon-browser"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
          <div>
            <h1 className="text-xl font-bold">{dungeon?.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="capitalize text-xs">{dungeon?.difficulty}</Badge>
              <Badge variant="outline" className="capitalize text-xs">{dungeon?.dungeonType}</Badge>
              {dungeon?.isPublished && <Badge className="text-xs">Published</Badge>}
              {dirty && <Badge variant="secondary" className="text-xs">Unsaved</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => snapshotMut.mutate()} disabled={snapshotMut.isPending}><History className="w-4 h-4 mr-1" />Snapshot</Button>
          <Button variant="outline" size="sm" onClick={() => publishMut.mutate()} disabled={publishMut.isPending || dungeon?.isPublished}><Globe className="w-4 h-4 mr-1" />Publish</Button>
          <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !dirty}><Save className="w-4 h-4 mr-1" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general"><Settings className="w-3 h-3 mr-1" />General</TabsTrigger>
          <TabsTrigger value="rooms"><Layers className="w-3 h-3 mr-1" />Rooms ({rooms?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="connections"><Globe className="w-3 h-3 mr-1" />Connections ({connections?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="bosses"><Shield className="w-3 h-3 mr-1" />Bosses ({bosses?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="monsters"><Swords className="w-3 h-3 mr-1" />Monsters ({monsters?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="traps"><AlertCircle className="w-3 h-3 mr-1" />Traps ({traps?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="puzzles"><BookOpen className="w-3 h-3 mr-1" />Puzzles ({puzzles?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="rewards"><Play className="w-3 h-3 mr-1" />Rewards ({rewards?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints ({checkpoints?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="requirements">Requirements ({requirements?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="history">History ({(history as unknown[])?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Type</Label>
                  <Select value={form.dungeonType ?? "linear"} onValueChange={(v) => set("dungeonType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["linear","branching","open","procedural","raid","arena","tower","maze"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Difficulty</Label>
                  <Select value={form.difficulty ?? "normal"} onValueChange={(v) => set("difficulty", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["easy","normal","hard","expert","legendary","nightmare"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Min Level</Label><Input type="number" value={form.minLevel ?? 1} onChange={(e) => set("minLevel", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Max Level</Label><Input type="number" value={form.maxLevel ?? 100} onChange={(e) => set("maxLevel", Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Min Party Size</Label><Input type="number" value={form.minPartySize ?? 1} onChange={(e) => set("minPartySize", Number(e.target.value))} /></div>
                <div className="space-y-1"><Label>Max Party Size</Label><Input type="number" value={form.maxPartySize ?? 5} onChange={(e) => set("maxPartySize", Number(e.target.value))} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4 mt-4">
          <Link href={`/dungeon-room-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Room Editor</Button></Link>
          <div className="space-y-2">
            {(rooms ?? []).map((r) => (
              <Card key={r.id}><CardContent className="p-3 flex items-center justify-between">
                <span className="font-medium text-sm">{r.name ?? `Room ${r.id}`}</span>
                <Badge variant="outline" className="capitalize text-xs">{r.roomType}</Badge>
              </CardContent></Card>
            ))}
            {(rooms ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No rooms. Use Room Editor to add rooms.</p>}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4 mt-4">
          <Link href={`/dungeon-connection-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Connection Editor</Button></Link>
          <p className="text-sm text-muted-foreground">{connections?.length ?? 0} connections defined.</p>
        </TabsContent>

        <TabsContent value="bosses" className="space-y-4 mt-4">
          <Link href={`/dungeon-boss-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Boss Editor</Button></Link>
          <div className="space-y-2">
            {(bosses ?? []).map((b) => (
              <Card key={b.id}><CardContent className="p-3"><span className="font-medium text-sm">{b.name ?? `Boss ${b.id}`}</span></CardContent></Card>
            ))}
            {(bosses ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No bosses defined.</p>}
          </div>
        </TabsContent>

        <TabsContent value="monsters" className="space-y-4 mt-4">
          <Link href={`/dungeon-monster-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Monster Editor</Button></Link>
          <p className="text-sm text-muted-foreground">{monsters?.length ?? 0} monsters placed.</p>
        </TabsContent>

        <TabsContent value="traps" className="space-y-4 mt-4">
          <Link href={`/dungeon-trap-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Trap Editor</Button></Link>
          <div className="space-y-2">
            {(traps ?? []).map((t) => (
              <Card key={t.id}><CardContent className="p-3 flex items-center justify-between">
                <span className="font-medium text-sm">{t.name ?? `Trap ${t.id}`}</span>
                <Badge variant="outline" className="capitalize text-xs">{t.trapType}</Badge>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="puzzles" className="space-y-4 mt-4">
          <Link href={`/dungeon-puzzle-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Puzzle Editor</Button></Link>
          <p className="text-sm text-muted-foreground">{puzzles?.length ?? 0} puzzles defined.</p>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 mt-4">
          <Link href={`/dungeon-reward-editor/${dungeonId}`}><Button variant="outline" size="sm">Open Reward Editor</Button></Link>
          <div className="space-y-2">
            {(rewards ?? []).map((r) => (
              <Card key={r.id}><CardContent className="p-3 flex items-center justify-between">
                <span className="font-medium text-sm">{r.name ?? `Reward ${r.id}`}</span>
                <Badge variant="outline" className="capitalize text-xs">{r.rewardType}</Badge>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checkpoints" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{checkpoints?.length ?? 0} checkpoints placed.</p>
          <div className="space-y-2">
            {(checkpoints ?? []).map((c) => <Card key={c.id}><CardContent className="p-3"><span className="font-medium text-sm">{c.name ?? `Checkpoint ${c.id}`}</span></CardContent></Card>)}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{requirements?.length ?? 0} requirements.</p>
          <div className="space-y-2">
            {(requirements ?? []).map((r) => <Card key={r.id}><CardContent className="p-3"><span className="font-medium text-sm">Requirement #{r.id}</span></CardContent></Card>)}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-2">
            {((history as Array<{ id: number; action: string; createdAt: string }>) ?? []).map((h) => (
              <Card key={h.id}><CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm capitalize">{h.action}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="mt-4">
          <Link href={`/dungeon-simulator`}><Button><Play className="w-4 h-4 mr-2" />Open Simulator</Button></Link>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Reset Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>Reset Type</Label>
                <Select value={form.resetType ?? "daily"} onValueChange={(v) => set("resetType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["never","daily","weekly","on_completion","on_party_wipe","manual","timed"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Reset Interval (hours)</Label><Input type="number" value={form.resetIntervalHours ?? 24} onChange={(e) => set("resetIntervalHours", Number(e.target.value))} /></div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isTemplate ?? false} onCheckedChange={(v) => set("isTemplate", v)} />
                <Label>Is Template</Label>
              </div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-sm">Integration References</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>World Reference (CREATOR-07)</Label><Input value={form.worldRef ?? ""} onChange={(e) => set("worldRef", e.target.value)} placeholder="world-slug" /></div>
              <div className="space-y-1"><Label>Region Reference (CREATOR-07)</Label><Input value={form.regionRef ?? ""} onChange={(e) => set("regionRef", e.target.value)} placeholder="region-id" /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
