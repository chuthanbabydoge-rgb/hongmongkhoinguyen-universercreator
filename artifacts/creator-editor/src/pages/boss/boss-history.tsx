import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { History, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossHistory() {
  const [, params] = useRoute("/boss-history/:id");
  const id = Number(params?.id);

  const { data: history, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "history"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/history`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">History</span>
      </div>
      <h1 className="text-xl font-bold flex items-center gap-2"><History className="w-5 h-5" />Boss History</h1>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <Card><CardContent className="pt-4 space-y-2">
          {(history ?? []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No history recorded yet.</div>
          ) : (history ?? []).map((h: Record<string, unknown>, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
              <div>
                <span className="font-medium capitalize">{String(h.action).replace(/_/g, " ")}</span>
                {h.field && <span className="text-muted-foreground ml-2">· {String(h.field)}</span>}
                {h.oldValue && h.newValue && <span className="text-muted-foreground ml-2">· {String(h.oldValue)} → {String(h.newValue)}</span>}
              </div>
              <span className="text-muted-foreground text-xs">{new Date(String(h.createdAt)).toLocaleString()}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}
