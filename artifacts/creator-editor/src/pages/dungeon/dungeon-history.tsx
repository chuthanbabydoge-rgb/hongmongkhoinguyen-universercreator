import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, History } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string) {
  return fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token()}` } });
}

interface HistoryEntry { id: number; action: string; field: string | null; oldValue: string | null; newValue: string | null; changedBy: number; createdAt: string; }
interface Version { id: number; version: number; label: string | null; changelog: string | null; createdAt: string; }

export default function DungeonHistory() {
  const { id } = useParams<{ id: string }>();
  const dungeonId = Number(id);

  const { data: history, isLoading: hLoad } = useQuery<HistoryEntry[]>({ queryKey: ["/api/dungeons", dungeonId, "history"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/history?limit=100`); return r.json(); } });
  const { data: versions, isLoading: vLoad } = useQuery<Version[]>({ queryKey: ["/api/dungeons", dungeonId, "versions"], queryFn: async () => { const r = await apiFetch(`/api/dungeons/${dungeonId}/versions`); return r.json(); } });

  const actionColors: Record<string, string> = { created: "bg-green-600", updated: "bg-blue-600", published: "bg-primary", archived: "bg-muted-foreground", restored: "bg-yellow-600", duplicated_from: "bg-purple-600" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dungeon-editor/${dungeonId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-xl font-bold">Dungeon History</h1><p className="text-sm text-muted-foreground">Dungeon #{dungeonId}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-semibold mb-3">Version Snapshots</h2>
          {vLoad ? <Skeleton className="h-40" /> : (versions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No snapshots yet. Use the Snapshot button in the editor.</p>
          ) : (
            <div className="space-y-2">
              {(versions ?? []).map((v) => (
                <Card key={v.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">v{v.version}</Badge>
                        <span className="font-medium text-sm">{v.label ?? `Version ${v.version}`}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    {v.changelog && <p className="text-xs text-muted-foreground mt-1">{v.changelog}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3">Change Log</h2>
          {hLoad ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div> : (history ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No change history yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(history ?? []).map((h) => (
                <Card key={h.id}>
                  <CardContent className="p-3 flex items-start gap-2">
                    <History className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${actionColors[h.action] ?? "bg-muted-foreground"}`}>{h.action}</Badge>
                        {h.field && <span className="text-xs text-muted-foreground">{h.field}</span>}
                      </div>
                      {h.oldValue && h.newValue && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{h.oldValue} → {h.newValue}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
