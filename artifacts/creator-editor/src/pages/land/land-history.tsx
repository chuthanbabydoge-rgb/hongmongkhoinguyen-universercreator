import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}` });

export default function LandHistory() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);

  const { data: history = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/history`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/history`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6 text-emerald-500" /> Land History</h1>
      {isLoading ? <div className="text-muted-foreground">Loading…</div>
        : history.length === 0
          ? <Card><CardContent className="py-10 text-center text-muted-foreground">No history entries yet.</CardContent></Card>
          : <div className="space-y-2">{history.map((h) => (
            <Card key={String(h.id)}>
              <CardContent className="py-3 flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{String(h.action)}</Badge>
                    <span className="text-sm text-muted-foreground">{String(h.entityType)}{h.entityId ? ` #${h.entityId}` : ""}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(String(h.createdAt)).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}</div>}
    </div>
  );
}
