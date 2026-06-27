import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const actionColor: Record<string, string> = {
  created: "bg-green-500/20 text-green-400",
  updated: "bg-blue-500/20 text-blue-400",
  deleted: "bg-red-500/20 text-red-400",
  published: "bg-purple-500/20 text-purple-400",
  archived: "bg-yellow-500/20 text-yellow-400",
  restored: "bg-cyan-500/20 text-cyan-400",
};

export default function CombatHistory() {
  const [selectedCombat, setSelectedCombat] = useState("");

  const { data: combatList } = useQuery({ queryKey: ["/api/combat"], queryFn: () => apiFetch("/api/combat?limit=50").then(r => r.json()) });
  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/combat", selectedCombat, "history"],
    queryFn: () => apiFetch(`/api/combat/${selectedCombat}/history?limit=50`).then(r => r.json()),
    enabled: !!selectedCombat,
  });

  const items: Array<{ id: number; actionType: string; fieldChanged: string; oldValue: string; newValue: string; performedBy: number; note: string; createdAt: string }> = history?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-red-400" />
        <div><h1 className="text-2xl font-bold">Combat History</h1><p className="text-muted-foreground">Audit trail of all combat changes</p></div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Label>Select Combat</Label>
          <Select value={selectedCombat} onValueChange={setSelectedCombat}>
            <SelectTrigger><SelectValue placeholder="Choose a combat…" /></SelectTrigger>
            <SelectContent>{(combatList?.items ?? []).map((c: { id: number; name: string }) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCombat && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4" />History ({history?.total ?? 0} events)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-muted-foreground">Loading…</p> : !items.length ? (
              <p className="text-muted-foreground">No history for this combat.</p>
            ) : (
              <div className="space-y-2">
                {items.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded border border-border">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${actionColor[h.actionType] ?? "bg-secondary text-foreground"}`}>{h.actionType}</span>
                      <div>
                        {h.fieldChanged && <p className="text-sm">{h.fieldChanged}: <span className="text-muted-foreground">{h.oldValue}</span> → <span className="text-foreground">{h.newValue}</span></p>}
                        {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
