import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skull, Plus, Search, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossBrowser() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: Record<string, unknown>[]; total: number }>({
    queryKey: ["/api/bosses", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", offset: "0", ...(search ? { search } : {}) });
      const res = await fetch(`${BASE}/api/bosses?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Boss", level: 1 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (boss) => { qc.invalidateQueries({ queryKey: ["/api/bosses"] }); window.location.href = `${BASE}/boss-editor/${boss.id}`; },
    onError: () => toast({ title: "Error", description: "Failed to create boss", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/duplicate`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses"] }); toast({ title: "Duplicated" }); },
    onError: () => toast({ title: "Error", description: "Failed to duplicate", variant: "destructive" }),
  });

  const rarityColor: Record<string, string> = { common: "secondary", uncommon: "outline", rare: "default", epic: "destructive", legendary: "destructive", mythic: "destructive", unique: "destructive" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Skull className="w-6 h-6 text-red-500" />Boss Browser</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />New Boss</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search bosses..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (data?.items ?? []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No bosses found. Click "New Boss" to create one.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {(data?.items ?? []).map((boss: Record<string, unknown>) => (
            <Card key={String(boss.id)}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="font-medium">{String(boss.name)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {String(boss.bossType ?? "").replace(/_/g, " ")} · Lv.{String(boss.level)} · {String(boss.totalPhases)} phase{Number(boss.totalPhases) !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rarityColor[String(boss.rarity)] as "default" | "secondary" | "outline" | "destructive" ?? "secondary"} className="capitalize">{String(boss.rarity)}</Badge>
                  <Badge variant={boss.isPublished ? "default" : "secondary"}>{boss.isPublished ? "Published" : "Draft"}</Badge>
                  <Link href={`/boss-editor/${boss.id}`}><Button size="sm" variant="outline"><Eye className="w-3 h-3" /></Button></Link>
                  <Button size="sm" variant="outline" onClick={() => duplicateMutation.mutate(Number(boss.id))}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete this boss?")) deleteMutation.mutate(Number(boss.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="text-sm text-muted-foreground">{data?.total ?? 0} bosses total</div>
    </div>
  );
}
