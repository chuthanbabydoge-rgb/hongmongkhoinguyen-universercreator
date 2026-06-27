import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Variable, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type QuestVariable = { id: number; name: string; variableType: string; defaultValue: string | null; scope: string };

export default function QuestVariables() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("integer");
  const [newDefault, setNewDefault] = useState("");

  const { data: variables = [] } = useQuery<QuestVariable[]>({
    queryKey: [`/api/quest-editor/${qid}/variables`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/variables`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/variables`, { method: "POST", body: JSON.stringify({ name: newName, variableType: newType, defaultValue: newDefault || null }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/variables`] }); setNewName(""); setNewDefault(""); toast({ title: "Variable added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (vId: number) => authFetch(`/api/quest-editor/${qid}/variables/${vId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/variables`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Quest Variables</h1><p className="text-muted-foreground text-sm">Track state across quest steps</p></div>
      </div>
      <Card><CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><Input placeholder="killCount" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["integer","string","boolean","float","array"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Default</label><Input placeholder="0" value={newDefault} onChange={e => setNewDefault(e.target.value)} /></div>
        </div>
        <Button className="mt-3" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Variable</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {!variables.length ? (
          <div className="text-center py-12 text-muted-foreground"><Variable className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No variables yet.</p></div>
        ) : variables.map((v) => (
          <Card key={v.id}><CardContent className="py-3 flex items-center gap-3">
            <code className="text-primary text-sm font-mono">{v.name}</code>
            <Badge variant="outline" className="text-xs">{v.variableType}</Badge>
            {v.defaultValue !== null && <span className="text-xs text-muted-foreground">= {v.defaultValue}</span>}
            <span className="flex-1" />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(v.id)}><Trash2 className="w-3 h-3" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
