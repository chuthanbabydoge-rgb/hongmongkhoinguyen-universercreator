import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Save, Package, Globe, Archive, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Item = {
  id: number; name: string; description?: string; flavorText?: string;
  itemType: string; rarity: string; category: string; quality: string;
  bindingType: string; stackType: string; maxStack: number;
  level: number; requiredLevel: number; weight: number;
  baseValue: number; sellValue: number; isPublished: boolean; isArchived: boolean;
  isQuestItem: boolean; isTradeable: boolean; isDroppable: boolean; isDestroyable: boolean;
};

const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400", uncommon: "text-green-400", rare: "text-blue-400",
  epic: "text-purple-400", legendary: "text-orange-400", mythic: "text-red-400",
};

function SubPanel({ label, endpoint }: { label: string; endpoint: string }) {
  const { data = [], isLoading } = useQuery<unknown[]>({
    queryKey: [endpoint],
    queryFn: () => authFetch(endpoint).then((r) => r.json()),
  });
  if (isLoading) return <div className="text-xs text-muted-foreground py-4">Loading...</div>;
  if (!data.length) return <div className="text-xs text-muted-foreground py-4">No {label.toLowerCase()} defined yet.</div>;
  return (
    <div className="space-y-2">
      {(data as Array<Record<string, unknown>>).map((row, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded border border-border text-sm">
          <span>{String(row["statName"] ?? row["effectName"] ?? row["attributeKey"] ?? row["slotName"] ?? row["ruleName"] ?? row["restrictionType"] ?? row["visualType"] ?? `${label} ${i + 1}`)}</span>
          <span className="text-muted-foreground text-xs">{String(row["baseValue"] ?? row["magnitude"] ?? row["attributeValue"] ?? row["ruleType"] ?? "")}</span>
        </div>
      ))}
    </div>
  );
}

export default function ItemEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: [`/api/item-editor/${id}`],
    queryFn: () => authFetch(`/api/item-editor/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const [form, setForm] = useState<Partial<Item>>({});

  useEffect(() => { if (item) setForm(item); }, [item]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Item>) => authFetch(`/api/item-editor/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/item-editor/${id}`] });
      toast({ title: "Saved", description: "Item updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save item", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/publish`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/item-editor/${id}`] }); toast({ title: "Published" }); },
  });

  const archiveMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/archive`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/item-editor/${id}`] }); setLocation("/item-browser"); },
  });

  const field = (key: keyof Item) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked
      : e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!item) return <div className="text-center py-16 text-muted-foreground">Item not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/item-dashboard")}>Item Editor</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{item.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">{item.name}</h1>
            <p className={`text-sm capitalize ${RARITY_COLORS[item.rarity] ?? "text-muted-foreground"}`}>
              {item.rarity} {item.itemType.replace("_", " ")} · Level {item.level}
            </p>
          </div>
          <Badge variant={item.isPublished ? "default" : "secondary"}>{item.isPublished ? "Published" : "Draft"}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1" />Save
          </Button>
          {!item.isPublished && (
            <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
              <Globe className="w-4 h-4 mr-1" />Publish
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
            <Archive className="w-4 h-4 mr-1" />Archive
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="crafting">Crafting</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Name</label>
                <Input value={form.name ?? ""} onChange={field("name")} className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Description</label>
                <Textarea value={form.description ?? ""} onChange={field("description")} className="mt-1 resize-none" rows={3} /></div>
              <div><label className="text-xs text-muted-foreground">Flavor Text</label>
                <Textarea value={form.flavorText ?? ""} onChange={field("flavorText")} className="mt-1 resize-none italic" rows={2} /></div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Item Type", key: "itemType", opts: ["weapon","armor","consumable","material","currency","quest_item","crafting","accessory","tool","cosmetic"] },
              { label: "Rarity", key: "rarity", opts: ["common","uncommon","rare","epic","legendary","mythic","unique"] },
              { label: "Category", key: "category", opts: ["melee","ranged","magic","shield","helmet","chest","legs","boots","gloves","ring","amulet","potion","food","ore","gem","cloth","wood","metal","coin","token","misc"] },
              { label: "Quality", key: "quality", opts: ["poor","normal","fine","superior","masterwork","artifact"] },
              { label: "Binding", key: "bindingType", opts: ["none","bind_on_pickup","bind_on_equip","bind_on_use","account_bound"] },
              { label: "Stack Type", key: "stackType", opts: ["non_stackable","stackable","limited_stack"] },
            ].map(({ label, key, opts }) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <select value={String(form[key as keyof Item] ?? "")} onChange={field(key as keyof Item)}
                  className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                  {opts.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Level", key: "level" }, { label: "Required Level", key: "requiredLevel" },
              { label: "Max Stack", key: "maxStack" }, { label: "Weight", key: "weight" },
              { label: "Base Value", key: "baseValue" }, { label: "Sell Value", key: "sellValue" },
            ].map(({ label, key }) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type="number" value={Number(form[key as keyof Item] ?? 0)} onChange={field(key as keyof Item)} className="mt-1" />
              </div>
            ))}
          </div>
          <Card><CardHeader><CardTitle className="text-sm">Flags</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([["isQuestItem","Quest Item"],["isTradeable","Tradeable"],["isDroppable","Droppable"],["isDestroyable","Destroyable"]] as [keyof Item, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={field(key)} className="rounded" />
                    {label}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {[
          { value: "stats", label: "Stats", endpoint: `/api/item-editor/${id}/stats` },
          { value: "effects", label: "Effects", endpoint: `/api/item-editor/${id}/effects` },
          { value: "equipment", label: "Equipment Slots", endpoint: `/api/item-editor/${id}/equipment-slots` },
          { value: "crafting", label: "Crafting Recipes", endpoint: `/api/item-editor/${id}/recipes` },
          { value: "pricing", label: "Pricing", endpoint: `/api/item-editor/${id}/pricing` },
          { value: "restrictions", label: "Restrictions", endpoint: `/api/item-editor/${id}/restrictions` },
          { value: "visuals", label: "Visuals", endpoint: `/api/item-editor/${id}/visuals` },
        ].map(({ value, label, endpoint }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Card><CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{label}</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setLocation(`/item-${value}/${id}`)}>
                  Manage {label}
                </Button>
              </div>
            </CardHeader>
              <CardContent><SubPanel label={label} endpoint={endpoint} /></CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
