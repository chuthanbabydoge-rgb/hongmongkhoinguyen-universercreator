import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Users } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface OrgMembership {
  org: { id: number; name: string; slug: string; description: string | null; avatarUrl: string | null };
  role: string;
}

function useOrganizations() {
  return useQuery<{ items: OrgMembership[]; total: number }>({
    queryKey: ["/api/organizations"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/organizations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

const createSchema = z.object({
  name: z.string().min(2, "Name too short"),
  description: z.string().optional(),
  website: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function Organizations() {
  const { data, isLoading } = useOrganizations();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const form = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const onCreate = async (values: CreateForm) => {
    setCreating(true);
    try {
      const res = await fetch(`${BASE}/api/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      await qc.invalidateQueries({ queryKey: ["/api/organizations"] });
      setOpen(false);
      form.reset();
      toast({ title: "Organization created" });
    } catch {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const roleColor: Record<string, string> = {
    owner: "bg-primary/20 text-primary border-primary/30",
    admin: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    developer: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  };

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1">Collaborate with your team</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />New Organization</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create Organization</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} placeholder="Acme Studios" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...form.register("description")} placeholder="What does your org do?" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input {...form.register("website")} placeholder="https://..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/30">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No organizations yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create one to start collaborating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.items?.map(({ org, role }) => (
            <Link key={org.id} href={`/organizations/${org.id}`}>
              <Card className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/40 hover:bg-card/70 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">{org.name}</CardTitle>
                        {org.description && <p className="text-xs text-muted-foreground mt-0.5">{org.description}</p>}
                      </div>
                    </div>
                    <Badge className={`text-xs border ${roleColor[role] ?? "bg-secondary/50 text-secondary-foreground"}`}>{role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" /><span>View members →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
