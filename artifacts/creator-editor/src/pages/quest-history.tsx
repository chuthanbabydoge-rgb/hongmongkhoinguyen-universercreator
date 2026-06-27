import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Save, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type HistoryRow = { id: number; action: string; description: string | null; createdAt: string };
type Version = { id: number; version: number; label: string | null; changelog: string | null; createdAt: string };

export default function QuestHistory() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: history = [] } = useQuery<HistoryRow[]>({
    queryKey: [`/api/quest-editor/${qid}/history`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/history`).then(r => r.json()),
  });

  const { data: versions = [] } = useQuery<Version[]>({
    queryKey: [`/api/quest-editor/${qid}/versions`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/versions`).then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/versions`, { method: "POST", body: JSON.stringify({ label: "Manual save" }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/versions`] }); toast({ title: "Version saved" }); },
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: number) => authFetch(`/api/quest-editor/${qid}/restore-version`, { method: "POST", body: JSON.stringify({ versionId }) }).then(r => r.json()),
    onSuccess: () => toast({ title: "Version restored" }),
  });

  const actionColors: Record<string, string> = { create: "bg-green-500", update: "bg-blue-500", publish: "bg-primary", archive: "bg-gray-500", restore: "bg-yellow-500", import: "bg-purple-500", simulate: "bg-cyan-500", test: "bg-orange-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1"><h1 className="text-2xl font-bold">Quest History</h1><p className="text-muted-foreground text-sm">Activity log and version snapshots</p></div>
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-1" />Save Version</Button>
      </div>

      {versions.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Versions</p>
          <div className="space-y-2">
            {versions.map((v) => (
              <Card key={v.id}><CardContent className="py-3 flex items-center gap-3">
                <Badge variant="outline">v{v.version}</Badge>
                <div className="flex-1"><p className="text-sm font-medium">{v.label ?? `Version ${v.version}`}</p>{v.changelog && <p className="text-xs text-muted-foreground">{v.changelog}</p>}</div>
                <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</span>
                <Button size="sm" variant="ghost" onClick={() => restoreMutation.mutate(v.id)}><RotateCcw className="w-3 h-3" /></Button>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Activity Log</p>
        {!history.length ? (
          <div className="text-center py-12 text-muted-foreground"><History className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No history yet.</p></div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border text-sm">
                <div className={`w-2 h-2 rounded-full shrink-0 ${actionColors[h.action] ?? "bg-muted"}`} />
                <Badge variant="outline" className="text-xs">{h.action}</Badge>
                <span className="flex-1 text-muted-foreground">{h.description}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
