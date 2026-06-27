import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Hammer, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Recipe = { id: number; recipeName: string; craftingStation?: string; craftingTime: number; outputQuantity: number; requiredLevel: number; experienceGained: number };
type Component = { id: number; componentItemId: number; quantity: number; isOptional: boolean };

function RecipeCard({ recipe, itemId }: { recipe: Recipe; itemId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const qk = [`/api/item-editor/recipes/${recipe.id}/components`];

  const { data: components = [] } = useQuery<Component[]>({
    queryKey: qk,
    queryFn: () => authFetch(`/api/item-editor/recipes/${recipe.id}/components`).then((r) => r.json()),
    enabled: open,
  });

  const [compForm, setCompForm] = useState({ componentItemId: 0, quantity: 1, isOptional: false });

  const addCompMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/recipes/${recipe.id}/components`, { method: "POST", body: JSON.stringify(compForm) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setCompForm({ componentItemId: 0, quantity: 1, isOptional: false }); },
    onError: () => toast({ title: "Error", description: "Failed to add component", variant: "destructive" }),
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/recipes/${recipe.id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/item-editor/${itemId}/recipes`] }),
  });

  const deleteCompMutation = useMutation({
    mutationFn: (cid: number) => authFetch(`/api/item-editor/components/${cid}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{recipe.recipeName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Station: {recipe.craftingStation ?? "Any"} · Time: {recipe.craftingTime}s · Out: {recipe.outputQuantity}× · Lv {recipe.requiredLevel} · {recipe.experienceGained} XP</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
            <Button variant="ghost" size="sm" onClick={() => deleteRecipeMutation.mutate()}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-3 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">Components</p>
          {components.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span>Item #{c.componentItemId} × {c.quantity}{c.isOptional ? " (optional)" : ""}</span>
              <Button variant="ghost" size="sm" onClick={() => deleteCompMutation.mutate(c.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap">
            <div><label className="text-xs text-muted-foreground">Item ID</label>
              <Input type="number" className="w-28 mt-1" value={compForm.componentItemId} onChange={(e) => setCompForm((f) => ({ ...f, componentItemId: Number(e.target.value) }))} /></div>
            <div><label className="text-xs text-muted-foreground">Qty</label>
              <Input type="number" className="w-20 mt-1" value={compForm.quantity} onChange={(e) => setCompForm((f) => ({ ...f, quantity: Number(e.target.value) }))} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input type="checkbox" checked={compForm.isOptional} onChange={(e) => setCompForm((f) => ({ ...f, isOptional: e.target.checked }))} />Optional
              </label>
            </div>
            <div className="flex items-end pb-1">
              <Button size="sm" onClick={() => addCompMutation.mutate()} disabled={!compForm.componentItemId}><Plus className="w-3 h-3 mr-1" />Add</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ItemCraftingEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qk = [`/api/item-editor/${id}/recipes`];

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({ queryKey: qk, queryFn: () => authFetch(`/api/item-editor/${id}/recipes`).then((r) => r.json()), enabled: !!id });

  const [form, setForm] = useState({ recipeName: "", craftingStation: "", craftingTime: 0, outputQuantity: 1, requiredLevel: 1, experienceGained: 0 });

  const addMutation = useMutation({
    mutationFn: () => authFetch(`/api/item-editor/${id}/recipes`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); setForm({ recipeName: "", craftingStation: "", craftingTime: 0, outputQuantity: 1, requiredLevel: 1, experienceGained: 0 }); },
    onError: () => toast({ title: "Error", description: "Failed to add recipe", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Item Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Crafting</span>
      </div>
      <h1 className="text-2xl font-bold">Crafting Recipes <span className="text-muted-foreground text-base font-normal">· Item #{id}</span></h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">New Recipe</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[["Recipe Name","recipeName","text"],["Station","craftingStation","text"],["Craft Time (s)","craftingTime","number"],["Output Qty","outputQuantity","number"],["Req Level","requiredLevel","number"],["XP Gained","experienceGained","number"]].map(([label, key, type]) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type={type} className="mt-1" value={String(form[key as keyof typeof form])}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} /></div>
            ))}
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.recipeName || addMutation.isPending}>
            <Plus className="w-4 h-4 mr-1" />Add Recipe
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading...</div> : !recipes.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Hammer className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No crafting recipes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} itemId={id ?? ""} />)}
        </div>
      )}
    </div>
  );
}
