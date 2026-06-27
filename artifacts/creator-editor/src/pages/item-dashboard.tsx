import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Package, CheckCircle, FileEdit, Archive, BarChart2, Layers, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

interface DashboardData {
  total: number; published: number; drafts: number; archived: number;
  byType: Record<string, number>; byRarity: Record<string, number>;
  recent: Array<{ id: number; name: string; itemType: string; rarity: string; isPublished: boolean }>;
}

const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400", uncommon: "text-green-400", rare: "text-blue-400",
  epic: "text-purple-400", legendary: "text-orange-400", mythic: "text-red-400", unique: "text-yellow-400",
};

export default function ItemDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/item-editor/dashboard"],
    queryFn: () => authFetch("/api/item-editor/dashboard").then((r) => r.json()),
  });
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (name: string) => authFetch("/api/item-editor", { method: "POST", body: JSON.stringify({ name }) }).then((r) => r.json()),
    onSuccess: (item: { id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/item-editor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/item-editor/dashboard"] });
      setLocation(`/item-editor/${item.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to create item", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Item Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage items for your Universe</p>
        </div>
        <Button onClick={() => createMutation.mutate("New Item")} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />New Item
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: data?.total ?? 0, icon: Package, color: "text-primary" },
          { label: "Published", value: data?.published ?? 0, icon: CheckCircle, color: "text-green-500" },
          { label: "Drafts", value: data?.drafts ?? 0, icon: FileEdit, color: "text-yellow-500" },
          { label: "Archived", value: data?.archived ?? 0, icon: Archive, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div></CardContent>
          </Card>
        ))}
      </div>

      {data?.byType && Object.keys(data.byType).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">By Type</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.byType).map(([type, count]) => (
                <Badge key={type} variant="outline" className="capitalize">{type.replace("_", " ")} · {count}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Items</CardTitle></CardHeader>
        <CardContent>
          {!data?.recent?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No items yet. Create your first item to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent.map((item) => (
                <Link key={item.id} href={`/item-editor/${item.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border border-border">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className={`text-xs capitalize ${RARITY_COLORS[item.rarity] ?? "text-muted-foreground"}`}>
                          {item.rarity} · {item.itemType.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? "published" : "draft"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/item-browser", label: "Item Browser", desc: "Browse and manage all items", icon: BarChart2 },
          { href: "/item-templates", label: "Templates", desc: "Start from a template", icon: Layers },
          { href: "/item-simulator", label: "Simulator", desc: "Test item behavior", icon: Wand2 },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
