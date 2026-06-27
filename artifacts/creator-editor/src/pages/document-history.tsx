import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, User, Clock } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-500/20 text-green-400",
  updated: "bg-blue-500/20 text-blue-400",
  restored: "bg-purple-500/20 text-purple-400",
  duplicated: "bg-yellow-500/20 text-yellow-400",
  published: "bg-emerald-500/20 text-emerald-400",
};

interface HistoryItem {
  id: number;
  documentId: number;
  userId: number;
  action: string;
  description: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  createdAt: string;
}

interface DocumentInfo {
  id: number;
  name: string;
  type: string;
}

export default function DocumentHistory() {
  const [, params] = useRoute("/documents/:id/history");
  const id = Number(params?.id);

  const { data: doc } = useQuery<DocumentInfo>({
    queryKey: ["/api/documents", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const { data, isLoading } = useQuery<{ items: HistoryItem[] }>({
    queryKey: ["/api/documents", id, "history"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${id}/history`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center gap-4">
        <Link href={`/documents/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Document History</h1>
          {doc && (
            <p className="text-muted-foreground text-sm capitalize">
              {doc.type} · {doc.name}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No history yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {data.items.map((item) => (
              <div key={item.id} className="flex gap-4 pl-14 relative">
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-border border-2 border-background" />
                <Card className="flex-1 bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${ACTION_COLORS[item.action] ?? "bg-secondary"}`}
                          >
                            {item.action}
                          </Badge>
                          {item.description && (
                            <span className="text-sm">{item.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            User #{item.userId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(item.createdAt), "MMM d, yyyy HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {Object.keys(item.after).length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View changes
                        </summary>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {Object.keys(item.before).length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Before</p>
                              <pre className="text-xs font-mono bg-red-500/5 border border-red-500/20 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(item.before, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">After</p>
                            <pre className="text-xs font-mono bg-green-500/5 border border-green-500/20 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(item.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
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
