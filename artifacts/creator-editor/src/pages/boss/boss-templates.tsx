import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossTemplates() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: globalTemplates, isLoading: loadingGlobal } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses/templates/global"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/templates/global`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: myTemplates, isLoading: loadingMy } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses/templates/my"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/templates/my`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/bosses/templates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses/templates"] }); toast({ title: "Template deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const TemplateList = ({ templates, loading }: { templates?: Record<string, unknown>[]; loading: boolean }) => {
    if (loading) return <div className="text-muted-foreground">Loading...</div>;
    if (!templates || templates.length === 0) return <Card><CardContent className="py-8 text-center text-muted-foreground">No templates yet. Export a boss as a template to get started.</CardContent></Card>;
    return (
      <div className="space-y-3">
        {templates.map((t: Record<string, unknown>) => (
          <Card key={String(t.id)}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {t.isPublic ? <Globe className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  {String(t.name)}
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1">{String(t.description ?? "")}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Used {String(t.usageCount)}×</Badge>
                <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete template?")) deleteMutation.mutate(Number(t.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Category: {String(t.category)} · Created: {new Date(String(t.createdAt)).toLocaleDateString()}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" />Boss Templates</h1>
        <p className="text-muted-foreground">Reusable boss configurations. Export any boss as a template from the Boss Editor.</p>
      </div>
      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">Global Templates</TabsTrigger>
          <TabsTrigger value="my">My Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="global" className="mt-4"><TemplateList templates={globalTemplates} loading={loadingGlobal} /></TabsContent>
        <TabsContent value="my" className="mt-4"><TemplateList templates={myTemplates} loading={loadingMy} /></TabsContent>
      </Tabs>
    </div>
  );
}
