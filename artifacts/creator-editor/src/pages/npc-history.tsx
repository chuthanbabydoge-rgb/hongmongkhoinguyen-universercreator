import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Bot } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { ...auth() } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  update: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delete: "bg-red-500/20 text-red-400 border-red-500/30",
  duplicate: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  import: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  export: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default function NpcHistory() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: history = [], isLoading } = useQuery({ queryKey: ["/api/npc-editor", npcId, "history"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/history`) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6 text-primary" /> Change History</h1>
        <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`} · {(history as any[]).length} events</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />)}</div>
      ) : (history as any[]).length === 0 ? (
        <Card><CardContent className="py-16 text-center"><History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No history yet</p></CardContent></Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {(history as any[]).map((entry: any) => (
              <div key={entry.id} className="flex gap-4 pl-10 relative">
                <div className="absolute left-3.5 top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <Card className="flex-1">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border capitalize ${ACTION_COLORS[entry.action] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>{entry.action}</Badge>
                        {entry.description && <p className="text-sm">{entry.description}</p>}
                      </div>
                      <time className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</time>
                    </div>
                    {Object.keys(entry.after ?? {}).length > 0 && (
                      <pre className="text-xs text-muted-foreground bg-muted/20 rounded p-2 mt-2 overflow-auto max-h-24">{JSON.stringify(entry.after, null, 2)}</pre>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
