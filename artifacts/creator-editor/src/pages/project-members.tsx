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
import { Users, UserPlus, Trash2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface ProjectMember {
  id: number; userId: number; permission: string;
  username: string; displayName: string | null; email: string; addedAt: string;
}

function useProjectMembers(projectId: number) {
  return useQuery<{ items: ProjectMember[]; total: number }>({
    queryKey: ["/api/projects", projectId, "members"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!projectId,
  });
}

const addSchema = z.object({
  userId: z.string().min(1),
  permission: z.string(),
});
type AddForm = z.infer<typeof addSchema>;

const PERM_COLORS: Record<string, string> = {
  owner: "text-primary", admin: "text-chart-2", publish: "text-chart-3",
  build: "text-chart-4", edit: "text-chart-5", comment: "text-yellow-400", view: "text-muted-foreground",
};

export default function ProjectMembers() {
  const [, params] = useRoute("/projects/:id/members");
  const projectId = Number(params?.id);
  const { data, isLoading, refetch } = useProjectMembers(projectId);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const form = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { permission: "view" },
  });

  const onAdd = async (values: AddForm) => {
    setAdding(true);
    try {
      const res = await fetch(`${BASE}/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId: Number(values.userId), permission: values.permission }),
      });
      if (!res.ok) throw new Error(await res.text());
      await refetch();
      setAddOpen(false);
      form.reset({ permission: "view" });
      toast({ title: "Member added" });
    } catch {
      toast({ title: "Error", description: "Failed to add member", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const onRemove = async (memberId: number) => {
    try {
      await fetch(`${BASE}/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      await refetch();
      toast({ title: "Member removed" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const onChangePermission = async (memberId: number, permission: string) => {
    try {
      await fetch(`${BASE}/api/projects/${projectId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ permission }),
      });
      await refetch();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Members</h1>
          <p className="text-muted-foreground mt-1">Manage who has access to this project</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><UserPlus className="w-4 h-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Add Member</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onAdd)} className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input {...form.register("userId")} placeholder="Enter user ID" />
              </div>
              <div className="space-y-2">
                <Label>Permission</Label>
                <Select onValueChange={(v) => form.setValue("permission", v)} defaultValue="view">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["view","comment","edit","build","publish","admin"].map(p => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={adding} className="bg-primary hover:bg-primary/90">
                  {adding ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Members ({data?.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.items?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {(m.displayName ?? m.username).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{m.displayName ?? m.username}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue={m.permission} onValueChange={(v) => onChangePermission(m.id, v)}>
                    <SelectTrigger className={`h-7 text-xs w-28 border-current/30 ${PERM_COLORS[m.permission] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["view","comment","edit","build","publish","admin"].map(p => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => onRemove(m.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {data?.items?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No members yet. Add collaborators above.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
