import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Search, Scroll, Copy, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Quest = { id: number; name: string; questType: string; status: string; level: number; description: string | null; tags: string[] };

export default function QuestBrowser() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["/api/quest-editor"],
    queryFn: () => authFetch("/api/quest-editor?limit=100").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch("/api/quest-editor", { method: "POST", body: JSON.stringify({ name: "New Quest" }) }).then((r) => r.json()),
    onSuccess: (q: { id: number }) => { queryClient.invalidateQueries({ queryKey: ["/api/quest-editor"] }); setLocation(`/quest-editor/${q.id}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/quest-editor/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/quest-editor"] }); toast({ title: "Quest deleted" }); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/quest-editor/${id}/duplicate`, { method: "POST", body: JSON.stringify({}) }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quest-editor"] }),
  });

  const filtered = quests.filter((q) => {
    const matchSearch = q.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    const matchType = typeFilter === "all" || q.questType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quest Browser</h1><p className="text-muted-foreground text-sm">All quests in your workspace</p></div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />New Quest</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search quests..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {["main","side","daily","weekly","event","story","tutorial","achievement","guild","world"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground"><Scroll className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No quests found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <Card key={q.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Scroll className="w-4 h-4 text-primary shrink-0" />
                    <p className="font-medium truncate">{q.name}</p>
                  </div>
                  <Badge variant={q.status === "published" ? "default" : "secondary"}>{q.status}</Badge>
                </div>
                {q.description && <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{q.questType}</Badge>
                  <Badge variant="outline" className="text-xs">Lv {q.level}</Badge>
                  {q.tags.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href={`/quest-editor/${q.id}`} className="flex-1">
                    <Button size="sm" variant="secondary" className="w-full"><Eye className="w-3 h-3 mr-1" />Edit</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => duplicateMutation.mutate(q.id)}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(q.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
