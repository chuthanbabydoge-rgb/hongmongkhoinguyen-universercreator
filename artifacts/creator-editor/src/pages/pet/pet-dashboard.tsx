import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Layers, BookOpen, Globe, Play, Shield } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetDashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/pets/dashboard"],
    queryFn: () => apiFetch("/api/pets/dashboard").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/pets", { method: "POST", body: JSON.stringify({ name: "New Pet" }) }).then(r => r.json()),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["/api/pets/dashboard"] });
      toast({ title: "Pet created" });
      window.location.href = `${BASE}/pet-editor/${p.id}`;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pet Editor</h1>
          <p className="text-muted-foreground mt-1">Design, manage and simulate game pets</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" /> New Pet
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pets", value: data?.total, icon: Layers },
          { label: "Published", value: data?.published, icon: Globe },
          { label: "Templates", value: data?.templates, icon: BookOpen },
          { label: "Species", value: data?.species, icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {isLoading ? <Skeleton className="h-6 w-10" /> : <p className="text-2xl font-bold">{value ?? 0}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: "/pet-browser", label: "Browse Pets", icon: Globe, desc: "View all pets" },
          { href: "/pet-templates", label: "Templates", icon: BookOpen, desc: "Pre-built templates" },
          { href: "/pet-simulator", label: "Simulator", icon: Play, desc: "Run simulations" },
          { href: "/pet-validator", label: "Validator", icon: Shield, desc: "Validate configurations" },
          { href: "/pet-species-editor", label: "Species", icon: Layers, desc: "Manage species" },
          { href: "/pet-import-export", label: "Import / Export", icon: Plus, desc: "Transfer data" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Pets</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.recent?.length ? (
            <p className="text-muted-foreground text-sm">No pets yet. Create your first pet!</p>
          ) : (
            <div className="space-y-2">
              {data.recent.map((p: any) => (
                <Link key={p.id} href={`/pet-editor/${p.id}`}>
                  <div className="flex items-center justify-between p-3 rounded hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant="outline">{p.petType}</Badge>
                      <Badge variant="secondary">{p.rarity}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Lv. {p.level}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
