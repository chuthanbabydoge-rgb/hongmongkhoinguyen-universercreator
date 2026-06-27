import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Plus, Globe, Lock, Boxes } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface Collection {
  id: number; name: string; description: string | null; thumbnail: string | null;
  isPublic: boolean; assetCount: number; createdAt: string; updatedAt: string;
}

function useCollections() {
  return useQuery<{ items: Collection[] }>({
    queryKey: ["/api/pipeline/collections"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/collections`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

export default function AssetCollections() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useCollections();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/collections`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, isPublic }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline/collections"] });
      toast({ title: "Collection created" });
      setOpen(false);
      setName("");
      setDescription("");
      setIsPublic(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const collections = data?.items ?? [];

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1">Organize assets into curated groups</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />New Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !collections.length ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No collections yet</p>
          <p className="text-sm mt-1">Create collections to organize your assets</p>
          <Button className="mt-4" size="sm" onClick={() => setOpen(true)}>Create First Collection</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Card key={col.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer">
              <div className="h-32 bg-secondary/20 rounded-t-xl flex items-center justify-center">
                {col.thumbnail ? (
                  <img src={col.thumbnail} alt={col.name} className="w-full h-full object-cover rounded-t-xl" />
                ) : (
                  <Boxes className="w-10 h-10 text-muted-foreground/30" />
                )}
              </div>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{col.name}</CardTitle>
                  {col.isPublic
                    ? <Globe className="w-4 h-4 text-chart-2 shrink-0" />
                    : <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
                {col.description && <p className="text-xs text-muted-foreground line-clamp-2">{col.description}</p>}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{col.assetCount} assets</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{format(new Date(col.updatedAt), "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="My Collection" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">Make collection public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
