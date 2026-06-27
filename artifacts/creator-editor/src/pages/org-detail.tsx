import { useState } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building2, UserPlus, Crown, Shield, Code, Pen, BookOpen, TestTube, Eye } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface OrgDetail {
  id: number; name: string; slug: string; description: string | null;
  members: Array<{ id: number; userId: number; role: string; username: string; displayName: string | null; email: string; joinedAt: string }>;
  memberCount: number;
}

function useOrgDetail(id: number) {
  return useQuery<OrgDetail>({
    queryKey: ["/api/organizations", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});
type InviteForm = z.infer<typeof inviteSchema>;

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown, admin: Shield, developer: Code, designer: Pen,
  writer: BookOpen, tester: TestTube, viewer: Eye,
};

const ROLE_COLORS: Record<string, string> = {
  owner: "text-primary", admin: "text-chart-2", developer: "text-chart-3",
  designer: "text-chart-4", writer: "text-chart-5", tester: "text-yellow-400", viewer: "text-muted-foreground",
};

export default function OrgDetail() {
  const [, params] = useRoute("/organizations/:id");
  const orgId = Number(params?.id);
  const { data: org, isLoading } = useOrgDetail(orgId);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "viewer" },
  });

  const onInvite = async (values: InviteForm) => {
    setInviting(true);
    try {
      const res = await fetch(`${BASE}/api/organizations/${orgId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      await qc.invalidateQueries({ queryKey: ["/api/organizations", orgId] });
      setInviteOpen(false);
      form.reset({ role: "viewer" });
      toast({ title: "Invitation sent" });
    } catch {
      toast({ title: "Error", description: "Failed to send invite", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  if (isLoading) return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );

  if (!org) return <div className="text-center py-24 text-muted-foreground">Organization not found</div>;

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
            {org.description && <p className="text-muted-foreground mt-0.5">{org.description}</p>}
          </div>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><UserPlus className="w-4 h-4 mr-2" />Invite</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...form.register("email")} placeholder="user@example.com" type="email" />
                {form.formState.errors.email && <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select onValueChange={(v) => form.setValue("role", v)} defaultValue="viewer">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["viewer","tester","writer","designer","developer","admin"].map(r => (
                      <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={inviting} className="bg-primary hover:bg-primary/90">
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Members ({org.memberCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {org.members.map((m) => {
            const Icon = ROLE_ICONS[m.role] ?? Eye;
            const colorClass = ROLE_COLORS[m.role] ?? "text-muted-foreground";
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {(m.displayName ?? m.username).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{m.displayName ?? m.username}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                <Badge variant="outline" className={`flex items-center gap-1 text-xs ${colorClass} border-current/30`}>
                  <Icon className="w-3 h-3" />{m.role}
                </Badge>
              </div>
            );
          })}
          {org.members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No members yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
