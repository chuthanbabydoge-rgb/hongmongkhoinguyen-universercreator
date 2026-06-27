import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Plus, Package, Search, Copy, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

const RARITY_COLORS: Record<string, string> = {
  common: "border-gray-500", uncommon: "border-green-500", rare: "border-blue-500",
  epic: "border-purple-500", legendary: "border-orange-500", mythic: "border-red-500",
};

type Item = { id: number; name: string; itemType: string; rarity: string; category: string; level: number; isPublished: boolean; isArchived: boolean };

export default function ItemBrowser() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["/api/item-editor", search],
    queryFn: () => authFetch(`/api/item-editor?limit=100&search=${encodeURIComponent(search)}`).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => authFetch("/api/item-editor", { method: "POST", body: JSON.stringify({ name }) }).then((r) => r.json()),
    onSuccess: (item: { id: number }) => { setLocation(`/item-editor/${item.id}`); },
    onError: () => toast({ title: "Error", description: "Failed to create item", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/item-editor/${id}/duplicate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (item: { id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/item-editor"] });
      setLocation(`/item-editor/${item.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to duplicate item", variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/item-editor/${id}/archive`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/item-editor"] }),
    onError: () => toast({ title: "Error", description: "Failed to archive item", variant: "destructive" }),
  });

  const visible = items.filter((i) => !i.isArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Item Browser</h1><p className="text-muted-foreground text-sm mt-1">{visible.length} items</p></div>
        <Button onClick={() => createMutation.mutate("New Item")} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />New Item</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>
      ) : !visible.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "No items match your search." : "No items yet. Create your first item."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((item) => (
            <Card key={item.id} className={`border-l-4 ${RARITY_COLORS[item.rarity] ?? "border-border"}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/item-editor/${item.id}`}>
                    <h3 className="font-semibold text-sm hover:text-primary cursor-pointer">{item.name}</h3>
                  </Link>
                  <Badge variant={item.isPublished ? "default" : "secondary"} className="text-xs ml-2 shrink-0">
                    {item.isPublished ? "published" : "draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize mb-3">
                  {item.rarity} {item.itemType.replace("_", " ")} · Lv {item.level}
                </p>
                <div className="flex gap-2">
                  <Link href={`/item-editor/${item.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">Edit</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-xs px-2" onClick={() => duplicateMutation.mutate(item.id)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs px-2" onClick={() => archiveMutation.mutate(item.id)}>
                    <Archive className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
