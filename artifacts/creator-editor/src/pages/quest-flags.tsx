import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type QuestFlag = { id: number; name: string; defaultValue: boolean; description: string | null };

export default function QuestFlags() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newDefault, setNewDefault] = useState(false);

  const { data: flags = [] } = useQuery<QuestFlag[]>({
    queryKey: [`/api/quest-editor/${qid}/flags`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/flags`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/flags`, { method: "POST", body: JSON.stringify({ name: newName, defaultValue: newDefault }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/flags`] }); setNewName(""); setNewDefault(false); toast({ title: "Flag added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (fId: number) => authFetch(`/api/quest-editor/${qid}/flags/${fId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/flags`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Quest Flags</h1><p className="text-muted-foreground text-sm">Boolean state flags for quest logic</p></div>
      </div>
      <Card><CardContent className="pt-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1"><label className="text-xs text-muted-foreground mb-1 block">Flag Name</label><Input placeholder="isQuestStarted" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div className="flex items-center gap-2"><label className="text-xs text-muted-foreground">Default</label><Switch checked={newDefault} onCheckedChange={setNewDefault} /></div>
          <Button disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
      </CardContent></Card>
      <div className="space-y-2">
        {!flags.length ? (
          <div className="text-center py-12 text-muted-foreground"><Flag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No flags yet.</p></div>
        ) : flags.map((f) => (
          <Card key={f.id}><CardContent className="py-3 flex items-center gap-3">
            <Flag className="w-4 h-4 text-primary shrink-0" />
            <code className="text-sm font-mono flex-1">{f.name}</code>
            <Switch checked={f.defaultValue} disabled />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(f.id)}><Trash2 className="w-3 h-3" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
