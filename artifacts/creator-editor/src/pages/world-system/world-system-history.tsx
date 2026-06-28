import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const actionColor: Record<string, string> = {
  created: "text-green-500", world_started: "text-blue-500", world_stopped: "text-gray-500",
  published: "text-yellow-500", archived: "text-orange-500", rollback_to_checkpoint: "text-red-500",
};

export default function WorldSystemHistory() {
  const [worldId, setWorldId] = useState("");

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: history, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/world-system", worldId, "history"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/history`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!worldId,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6 text-muted-foreground" />World History</h1>
        <p className="text-muted-foreground">Action log for world system operations.</p>
      </div>
      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {worldId && (
        <Card><CardContent className="pt-4">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : (history ?? []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No history recorded.</div>
          ) : (history ?? []).map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
              <div className="flex items-center gap-2">
                <span className={`font-medium capitalize ${actionColor[String(h.action)] ?? ""}`}>{String(h.action).replace(/_/g, " ")}</span>
                {h.field && <Badge variant="secondary" className="text-xs">{String(h.field)}</Badge>}
                {h.newValue && <span className="text-muted-foreground text-xs">→ {String(h.newValue)}</span>}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(String(h.createdAt)).toLocaleString()}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}
