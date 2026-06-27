import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  projectId: number | null;
  projectName: string | null;
  organizationId: number | null;
  createdAt: string;
}

function useActivity() {
  return useQuery<{ items: ActivityItem[]; total: number }>({
    queryKey: ["/api/activity"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/activity?limit=100`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

const TYPE_EMOJI: Record<string, string> = {
  project_created: "🌍",
  project_deleted: "🗑️",
  joined: "👋",
  forked: "🍴",
  published: "🚀",
  commented: "💬",
  asset_uploaded: "📁",
  permission_changed: "🔑",
  starred: "⭐",
  watched: "👁️",
};

const TYPE_COLOR: Record<string, string> = {
  project_created: "bg-primary/20 text-primary border-primary/30",
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  starred: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  joined: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  asset_uploaded: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export default function ActivityPage() {
  const { data, isLoading } = useActivity();

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground mt-1">Your recent actions across all projects</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : data?.items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-card/30">
          <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Start creating projects to see your activity</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:inset-y-0 before:left-[13px] before:w-px before:bg-border">
          {data?.items?.map(item => (
            <div key={item.id} className="relative">
              <div className="absolute -left-[30px] mt-2 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs">
                {TYPE_EMOJI[item.type] ?? "·"}
              </div>
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{item.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.projectName && (
                        <span className="text-xs text-muted-foreground font-mono">📂 {item.projectName}</span>
                      )}
                      <span className="text-xs text-muted-foreground/50 font-mono">
                        {format(new Date(item.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  </div>
                  <Badge className={`text-xs border shrink-0 ${TYPE_COLOR[item.type] ?? "bg-secondary/50 text-muted-foreground border-border"}`}>
                    {item.type.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
