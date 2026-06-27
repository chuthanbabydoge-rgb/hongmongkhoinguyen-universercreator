import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type HistoryEntry = { id: number; actionType: string; fieldChanged?: string; oldValue?: string; newValue?: string; performedBy: number; note?: string; createdAt: string };

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-500/20 text-green-400",
  updated: "bg-blue-500/20 text-blue-400",
  published: "bg-primary/20 text-primary",
  archived: "bg-orange-500/20 text-orange-400",
  deleted: "bg-red-500/20 text-red-400",
  restored: "bg-purple-500/20 text-purple-400",
};

export default function ItemHistory() {
  const { id } = useParams<{ id: string }>();

  const { data: history = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: [`/api/item-editor/${id}/history`],
    queryFn: () => authFetch(`/api/item-editor/${id}/history?limit=100`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: versions = [] } = useQuery<Array<{ id: number; version: number; changelog?: string; createdAt: string }>>({
    queryKey: [`/api/item-editor/${id}/versions`],
    queryFn: () => authFetch(`/api/item-editor/${id}/versions`).then((r) => r.json()),
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">History</span>
      </div>
      <h1 className="text-2xl font-bold">Item History <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      {versions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Versions ({versions.length})</h2>
          <div className="flex flex-wrap gap-2">
            {versions.map((v) => (
              <Badge key={v.id} variant="outline" className="text-xs">
                v{v.version} · {new Date(v.createdAt).toLocaleDateString()}
                {v.changelog ? ` — ${v.changelog}` : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Activity Log</h2>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading...</div>
        ) : !history.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No history yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${ACTION_COLORS[entry.actionType] ?? "bg-secondary text-secondary-foreground"}`}>
                    {entry.actionType}
                  </span>
                  <div className="flex-1">
                    {!!entry.fieldChanged && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{entry.fieldChanged}</span>: {entry.oldValue ?? "—"} → {entry.newValue ?? "—"}
                      </p>
                    )}
                    {!!entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
