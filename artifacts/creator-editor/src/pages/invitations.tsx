import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, X, Clock, Building2 } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface Invitation {
  id: number;
  organizationId: number | null;
  projectId: number | null;
  inviterEmail: string;
  inviteeEmail: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: string;
  createdAt: string;
}

function useInvitations() {
  return useQuery<{ items: Invitation[]; total: number }>({
    queryKey: ["/api/invitations"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/invitations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

const STATUS_CONFIG = {
  pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  accepted: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Check },
  rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: X },
  expired: { color: "bg-secondary/50 text-muted-foreground border-border", icon: Clock },
};

export default function Invitations() {
  const { data, isLoading, refetch } = useInvitations();
  const qc = useQueryClient();
  const { toast } = useToast();

  const respond = async (id: number, action: "accept" | "reject") => {
    try {
      const res = await fetch(`${BASE}/api/invitations/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await refetch();
      await qc.invalidateQueries({ queryKey: ["/api/organizations"] });
      await qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: action === "accept" ? "Joined!" : "Invitation declined" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const pending = data?.items?.filter(i => i.status === "pending") ?? [];
  const past = data?.items?.filter(i => i.status !== "pending") ?? [];

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground mt-1">Manage your pending invites</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending ({pending.length})</h2>
              {pending.map(inv => (
                <Card key={inv.id} className="bg-card/50 border-border/50 border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {inv.organizationId ? <Building2 className="w-4 h-4 text-primary" /> : <Mail className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {inv.organizationId ? "Organization invitation" : "Project collaboration"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Role: <span className="font-mono text-primary">{inv.role}</span> · Expires {format(new Date(inv.expiresAt), "MMM d")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => respond(inv.id, "reject")} className="text-destructive border-destructive/50 hover:bg-destructive/10">
                          <X className="w-3 h-3 mr-1" />Decline
                        </Button>
                        <Button size="sm" onClick={() => respond(inv.id, "accept")} className="bg-primary hover:bg-primary/90">
                          <Check className="w-3 h-3 mr-1" />Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Past</h2>
              {past.map(inv => {
                const cfg = STATUS_CONFIG[inv.status];
                const Icon = cfg.icon;
                return (
                  <Card key={inv.id} className="bg-card/30 border-border/30 opacity-70">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {inv.organizationId ? "Organization invitation" : "Project collaboration"}
                          </div>
                          <div className="text-xs text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs border ${cfg.color}`}><Icon className="w-3 h-3 mr-1" />{inv.status}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {data?.items?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-card/30">
              <Mail className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No invitations</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
