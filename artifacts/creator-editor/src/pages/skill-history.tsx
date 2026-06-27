import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { History, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type HistoryEntry = { id: number; actionType: string; fieldChanged?: string; oldValue?: string; newValue?: string; note?: string; createdAt: string };

const ACTION_COLORS: Record<string, string> = {
  created: "text-green-400", updated: "text-blue-400", deleted: "text-red-400",
  published: "text-yellow-400", archived: "text-gray-400", restored: "text-cyan-400",
};

export default function SkillHistory() {
  const { id } = useParams<{ id: string }>();
  const [offset, setOffset] = useState(0);
  const limit = 25;

  const { data: history = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: [`/api/skills/${id}/history`, offset],
    queryFn: () => authFetch(`/api/skills/${id}/history?limit=${limit}&offset=${offset}`).then((r) => r.json()),
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">History · Skill #{id}</span>
      </div>
      <h1 className="text-xl font-bold">History</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading…</div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No history yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-current ${ACTION_COLORS[entry.actionType] ?? "text-muted-foreground"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs capitalize ${ACTION_COLORS[entry.actionType] ?? ""}`}>{entry.actionType}</Badge>
                    {entry.fieldChanged && <span className="text-xs text-muted-foreground font-mono">{entry.fieldChanged}</span>}
                  </div>
                  {(entry.oldValue || entry.newValue) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.oldValue && <span className="line-through opacity-60 mr-2">{entry.oldValue}</span>}
                      {entry.newValue && <span className="text-foreground">{entry.newValue}</span>}
                    </p>
                  )}
                  {entry.note && <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>}
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={history.length < limit} onClick={() => setOffset(o => o + limit)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
