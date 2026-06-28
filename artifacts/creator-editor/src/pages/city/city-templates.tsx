import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityTemplates() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: globalTemplates = [], isLoading: loadingGlobal } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/cities/templates/global"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/templates/global`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load global templates");
      return res.json();
    },
  });

  const { data: myTemplates = [], isLoading: loadingMy } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/cities/templates/my"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/templates/my`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load my templates");
      return res.json();
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/cities/templates/${id}`, { method: "DELETE", headers: headers() });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/cities/templates/my"] });
      qc.invalidateQueries({ queryKey: ["/api/cities/templates/global"] });
      toast({ title: "Template deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete template", variant: "destructive" }),
  });

  const TemplateCard = ({ t }: { t: Record<string, unknown> }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm">{String(t.name)}</CardTitle>
          <div className="flex gap-1">
            {t.isPublic && <Badge variant="default"><Globe className="w-3 h-3 mr-1" />Public</Badge>}
            <Badge variant="outline" className="capitalize">{String(t.category)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {t.description && <p className="text-xs text-muted-foreground mb-3">{String(t.description)}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Used {String(t.usageCount ?? 0)} times</span>
          <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(Number(t.id))} disabled={deleteMut.isPending}><Trash2 className="w-3 h-3" /></Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-500" /> City Templates</h1>
      <p className="text-sm text-muted-foreground">Browse and manage reusable city templates. Export a city as a template from the city editor.</p>

      <Tabs defaultValue="global">
        <TabsList><TabsTrigger value="global">Global ({globalTemplates.length})</TabsTrigger><TabsTrigger value="mine">My Templates ({myTemplates.length})</TabsTrigger></TabsList>

        <TabsContent value="global" className="mt-4">
          {loadingGlobal ? <div className="text-muted-foreground">Loading...</div> : globalTemplates.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No global templates yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {globalTemplates.map((t: Record<string, unknown>) => <TemplateCard key={String(t.id)} t={t} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          {loadingMy ? <div className="text-muted-foreground">Loading...</div> : myTemplates.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No templates yet. Export a city as template to create one.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTemplates.map((t: Record<string, unknown>) => <TemplateCard key={String(t.id)} t={t} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
