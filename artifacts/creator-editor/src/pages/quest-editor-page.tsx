import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save, ArrowLeft, Play, GitBranch, Target, Gift, MessageSquare,
  CheckSquare, History, ShieldCheck, Eye, Settings, Zap, Flag, Variable,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Quest = { id: number; name: string; description: string | null; questType: string; status: string; level: number; tags: string[]; isRepeatable: boolean };

export default function QuestEditorPage() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: quest, isLoading } = useQuery<Quest>({
    queryKey: [`/api/quest-editor/${qid}`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}`).then((r) => r.json()),
  });

  const { data: objectives = [] } = useQuery<unknown[]>({ queryKey: [`/api/quest-editor/${qid}/objectives`], queryFn: () => authFetch(`/api/quest-editor/${qid}/objectives`).then(r => r.json()) });
  const { data: rewards = [] } = useQuery<unknown[]>({ queryKey: [`/api/quest-editor/${qid}/rewards`], queryFn: () => authFetch(`/api/quest-editor/${qid}/rewards`).then(r => r.json()) });
  const { data: steps = [] } = useQuery<unknown[]>({ queryKey: [`/api/quest-editor/${qid}/steps`], queryFn: () => authFetch(`/api/quest-editor/${qid}/steps`).then(r => r.json()) });
  const { data: branches = [] } = useQuery<unknown[]>({ queryKey: [`/api/quest-editor/${qid}/branches`], queryFn: () => authFetch(`/api/quest-editor/${qid}/branches`).then(r => r.json()) });

  const [form, setForm] = useState({ name: "", description: "", questType: "side", level: 1, tags: "" });
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (quest) setForm({ name: quest.name, description: quest.description ?? "", questType: quest.questType, level: quest.level, tags: quest.tags.join(", ") });
  }, [quest]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Quest>) => authFetch(`/api/quest-editor/${qid}`, { method: "PATCH", body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}`] }); toast({ title: "Saved" }); },
  });

  const publishMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/publish`, { method: "POST", body: JSON.stringify({}) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}`] }); toast({ title: "Quest published!" }); },
    onError: (e) => toast({ title: "Cannot publish", description: String(e), variant: "destructive" }),
  });

  const handleSave = () => {
    updateMutation.mutate({ name: form.name, description: form.description || null, questType: form.questType as "side", level: form.level, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) });
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const t = setTimeout(handleSave, 2000);
    setAutoSaveTimer(t);
  };

  const handleField = (field: string, value: unknown) => {
    setForm(f => ({ ...f, [field]: value }));
    scheduleAutoSave();
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading quest...</div>;
  if (!quest) return <div className="text-center py-16 text-muted-foreground">Quest not found.</div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button size="sm" variant="ghost" onClick={() => setLocation("/quest-browser")}><ArrowLeft className="w-4 h-4" /></Button>
          <Input className="text-lg font-bold border-0 bg-transparent px-0 focus-visible:ring-0 h-auto" value={form.name} onChange={(e) => handleField("name", e.target.value)} />
          <Badge variant={quest.status === "published" ? "default" : quest.status === "draft" ? "secondary" : "outline"}>{quest.status}</Badge>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending}><Save className="w-4 h-4 mr-1" />Save</Button>
          <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending || quest.status === "published"}><Play className="w-4 h-4 mr-1" />Publish</Button>
        </div>
      </div>

      <Tabs defaultValue="properties" className="flex-1 min-h-0">
        <TabsList className="shrink-0">
          <TabsTrigger value="properties"><Settings className="w-3 h-3 mr-1" />Properties</TabsTrigger>
          <TabsTrigger value="objectives"><Target className="w-3 h-3 mr-1" />Objectives ({objectives.length})</TabsTrigger>
          <TabsTrigger value="rewards"><Gift className="w-3 h-3 mr-1" />Rewards ({rewards.length})</TabsTrigger>
          <TabsTrigger value="branches"><GitBranch className="w-3 h-3 mr-1" />Branches ({branches.length})</TabsTrigger>
          <TabsTrigger value="steps"><CheckSquare className="w-3 h-3 mr-1" />Steps ({steps.length})</TabsTrigger>
          <TabsTrigger value="validation"><ShieldCheck className="w-3 h-3 mr-1" />Validate</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="w-3 h-3 mr-1" />Preview</TabsTrigger>
          <TabsTrigger value="history"><History className="w-3 h-3 mr-1" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Quest Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Type</label>
                  <Select value={form.questType} onValueChange={(v) => handleField("questType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["main","side","daily","weekly","event","story","tutorial","achievement","guild","world"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><label className="text-xs text-muted-foreground">Level</label>
                  <Input type="number" min={1} value={form.level} onChange={e => handleField("level", Number(e.target.value))} /></div>
                <div><label className="text-xs text-muted-foreground">Tags (comma separated)</label>
                  <Input value={form.tags} onChange={e => handleField("tags", e.target.value)} placeholder="combat, story, npc..." /></div>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
              <CardContent>
                <Textarea className="resize-none h-36" value={form.description} onChange={e => handleField("description", e.target.value)} placeholder="Describe this quest..." />
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-3">
            <Link href={`/quest-objectives/${qid}`}><Button variant="outline" size="sm"><Target className="w-3 h-3 mr-1" />Objectives Editor</Button></Link>
            <Link href={`/quest-conditions/${qid}`}><Button variant="outline" size="sm"><ShieldCheck className="w-3 h-3 mr-1" />Conditions Editor</Button></Link>
            <Link href={`/quest-rewards/${qid}`}><Button variant="outline" size="sm"><Gift className="w-3 h-3 mr-1" />Rewards Editor</Button></Link>
            <Link href={`/quest-dialogues/${qid}`}><Button variant="outline" size="sm"><MessageSquare className="w-3 h-3 mr-1" />Dialogues</Button></Link>
            <Link href={`/quest-branches/${qid}`}><Button variant="outline" size="sm"><GitBranch className="w-3 h-3 mr-1" />Branches</Button></Link>
            <Link href={`/quest-variables/${qid}`}><Button variant="outline" size="sm"><Variable className="w-3 h-3 mr-1" />Variables</Button></Link>
            <Link href={`/quest-flags/${qid}`}><Button variant="outline" size="sm"><Flag className="w-3 h-3 mr-1" />Flags</Button></Link>
          </div>
        </TabsContent>

        <TabsContent value="objectives" className="mt-4">
          <SubResourcePanel questId={qid} resource="objectives" label="Objective" />
        </TabsContent>
        <TabsContent value="rewards" className="mt-4">
          <SubResourcePanel questId={qid} resource="rewards" label="Reward" />
        </TabsContent>
        <TabsContent value="branches" className="mt-4">
          <SubResourcePanel questId={qid} resource="branches" label="Branch" />
        </TabsContent>
        <TabsContent value="steps" className="mt-4">
          <SubResourcePanel questId={qid} resource="steps" label="Step" />
        </TabsContent>
        <TabsContent value="validation" className="mt-4">
          <ValidationPanel questId={qid} />
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <PreviewPanel questId={qid} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <HistoryPanel questId={qid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubResourcePanel({ questId, resource, label }: { questId: number; resource: string; label: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data = [], isLoading } = useQuery<Array<Record<string, unknown>>>({
    queryKey: [`/api/quest-editor/${questId}/${resource}`],
    queryFn: () => authFetch(`/api/quest-editor/${questId}/${resource}`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${questId}/${resource}`, { method: "POST", body: JSON.stringify({ name: `New ${label}`, content: `New ${label}`, amount: 1, targetCount: 1 }) }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${questId}/${resource}`] }),
    onError: () => toast({ title: "Error creating", variant: "destructive" }),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm py-4">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => createMutation.mutate()}>+ Add {label}</Button>
      </div>
      {!data.length ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No {resource} yet. Add one to get started.</div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <Card key={String(item["id"])}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{String(item["name"] ?? item["title"] ?? `${label} ${item["id"]}`)}</p>
                  {!!item["description"] && <p className="text-xs text-muted-foreground">{String(item["description"])}</p>}
                  {!!item["objectiveType"] && <Badge variant="outline" className="text-xs mt-1">{String(item["objectiveType"])}</Badge>}
                  {!!item["rewardType"] && <Badge variant="outline" className="text-xs mt-1">{String(item["rewardType"])} × {String(item["amount"] ?? 1)}</Badge>}
                  {!!item["branchType"] && <Badge variant="outline" className="text-xs mt-1">{String(item["branchType"])}</Badge>}
                </div>
                <Zap className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationPanel({ questId }: { questId: number }) {
  const [result, setResult] = useState<{ valid: boolean; errors: Array<{code:string;message:string}>; warnings: Array<{code:string;message:string}> } | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    setLoading(true);
    const r = await authFetch(`/api/quest-editor/${questId}/validate`, { method: "POST", body: JSON.stringify({}) });
    setResult(await r.json());
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={validate} disabled={loading}><ShieldCheck className="w-4 h-4 mr-2" />{loading ? "Validating..." : "Run Validation"}</Button>
      {result && (
        <div className="space-y-3">
          <Badge variant={result.valid ? "default" : "destructive"}>{result.valid ? "✓ Valid" : "✗ Invalid"}</Badge>
          {result.errors.map((e, i) => <div key={i} className="p-3 rounded bg-destructive/10 border border-destructive/30 text-sm"><span className="font-mono text-xs text-destructive mr-2">{e.code}</span>{e.message}</div>)}
          {result.warnings.map((w, i) => <div key={i} className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30 text-sm"><span className="font-mono text-xs text-yellow-500 mr-2">{w.code}</span>{w.message}</div>)}
          {!result.errors.length && !result.warnings.length && <p className="text-sm text-muted-foreground">No issues found.</p>}
        </div>
      )}
    </div>
  );
}

function PreviewPanel({ questId }: { questId: number }) {
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await authFetch(`/api/quest-editor/${questId}/preview`, { method: "POST", body: JSON.stringify({}) });
    setPreview(await r.json());
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={run} disabled={loading}><Eye className="w-4 h-4 mr-2" />{loading ? "Loading..." : "Generate Preview"}</Button>
      {preview && (
        <Card><CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={preview["status"] === "ready" ? "default" : "destructive"}>{String(preview["status"])}</Badge>
            <span className="font-medium">{String(preview["name"] ?? "")}</span>
          </div>
          {(preview["issues"] as string[] ?? []).map((issue, i) => <p key={i} className="text-sm text-yellow-500">⚠ {issue}</p>)}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-secondary"><div className="text-lg font-bold">{(preview["steps"] as unknown[])?.length ?? 0}</div><div className="text-xs text-muted-foreground">Steps</div></div>
            <div className="p-2 rounded bg-secondary"><div className="text-lg font-bold">{(preview["objectives"] as unknown[])?.length ?? 0}</div><div className="text-xs text-muted-foreground">Objectives</div></div>
            <div className="p-2 rounded bg-secondary"><div className="text-lg font-bold">{(preview["rewards"] as unknown[])?.length ?? 0}</div><div className="text-xs text-muted-foreground">Rewards</div></div>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}

function HistoryPanel({ questId }: { questId: number }) {
  const { data = [] } = useQuery<Array<{ id: number; action: string; description: string; createdAt: string }>>({
    queryKey: [`/api/quest-editor/${questId}/history`],
    queryFn: () => authFetch(`/api/quest-editor/${questId}/history`).then(r => r.json()),
  });

  return (
    <div className="space-y-2">
      {!data.length ? <p className="text-muted-foreground text-sm">No history yet.</p> : data.map((h) => (
        <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border text-sm">
          <Badge variant="outline">{h.action}</Badge>
          <span className="flex-1">{h.description}</span>
          <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
