import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

function useNotifications() {
  return useQuery<{ items: Notification[]; total: number; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

export default function Notifications() {
  const { data, isLoading, refetch } = useNotifications();
  const qc = useQueryClient();
  const { toast } = useToast();

  const markRead = async (id: number) => {
    await fetch(`${BASE}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    });
    await refetch();
  };

  const markAllRead = async () => {
    try {
      await fetch(`${BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      await refetch();
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const TYPE_ICON: Record<string, string> = {
    invite_received: "📨",
    invite_accepted: "✅",
    role_changed: "🔑",
    project_published: "🚀",
    asset_uploaded: "📁",
  };

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {data?.unreadCount ? `${data.unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" onClick={markAllRead} className="border-border/50">
            <CheckCheck className="w-4 h-4 mr-2" />Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : data?.items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-card/30">
          <BellOff className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.items?.map(n => (
            <Card
              key={n.id}
              className={`border-border/50 cursor-pointer transition-all hover:border-primary/30 ${
                n.isRead ? "bg-card/30 opacity-70" : "bg-card/60 border-l-4 border-l-primary"
              }`}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {n.title}
                      {!n.isRead && <Badge className="text-xs bg-primary/20 text-primary border-primary/30 border py-0 px-1.5">New</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                    <div className="text-xs text-muted-foreground/50 font-mono mt-1">
                      {format(new Date(n.createdAt), "MMM d, HH:mm")}
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
