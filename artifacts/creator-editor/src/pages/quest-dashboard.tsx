import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Scroll, CheckCircle, FileEdit, BarChart2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

function useQuestDashboard() {
  return useQuery<{ total: number; published: number; drafts: number; recent: unknown[] }>({
    queryKey: ["/api/quest-editor/dashboard"],
    queryFn: () => authFetch("/api/quest-editor/dashboard").then((r) => r.json()),
  });
}

export default function QuestDashboard() {
  const { data, isLoading } = useQuestDashboard();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (name: string) => authFetch("/api/quest-editor", { method: "POST", body: JSON.stringify({ name }) }).then((r) => r.json()),
    onSuccess: (q: { id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quest-editor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quest-editor/dashboard"] });
      setLocation(`/quest-editor/${q.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to create quest", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quest Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Design and manage quests for your Universe</p>
        </div>
        <Button onClick={() => createMutation.mutate("New Quest")} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Quest
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
            <Scroll className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.total ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-500">{data?.published ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileEdit className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-500">{data?.drafts ?? 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Quests</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.recent?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scroll className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No quests yet. Create your first quest to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(data.recent as Array<{ id: number; name: string; questType: string; status: string; level: number }>).map((q) => (
                <Link key={q.id} href={`/quest-editor/${q.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border border-border">
                    <div className="flex items-center gap-3">
                      <Scroll className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{q.name}</p>
                        <p className="text-xs text-muted-foreground">Level {q.level} · {q.questType}</p>
                      </div>
                    </div>
                    <Badge variant={q.status === "published" ? "default" : q.status === "draft" ? "secondary" : "outline"}>
                      {q.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/quest-browser"><Card className="cursor-pointer hover:border-primary/50 transition-colors"><CardContent className="pt-6 flex items-center gap-3"><BarChart2 className="w-5 h-5 text-primary" /><div><p className="font-medium">Quest Browser</p><p className="text-sm text-muted-foreground">Browse and manage all quests</p></div></CardContent></Card></Link>
        <Link href="/quest-templates"><Card className="cursor-pointer hover:border-primary/50 transition-colors"><CardContent className="pt-6 flex items-center gap-3"><RefreshCw className="w-5 h-5 text-primary" /><div><p className="font-medium">Templates</p><p className="text-sm text-muted-foreground">Start from a template</p></div></CardContent></Card></Link>
      </div>
    </div>
  );
}
