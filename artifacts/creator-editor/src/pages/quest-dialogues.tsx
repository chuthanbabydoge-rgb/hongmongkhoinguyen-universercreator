import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

const DIALOGUE_TYPES = ["start","progress","complete","fail","branch","ambient","custom"];

type Dialogue = { id: number; title: string | null; content: string; dialogueType: string; order: number };

export default function QuestDialogues() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("start");

  const { data: dialogues = [] } = useQuery<Dialogue[]>({
    queryKey: [`/api/quest-editor/${qid}/dialogues`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/dialogues`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/dialogues`, { method: "POST", body: JSON.stringify({ title: newTitle, content: newContent, dialogueType: newType }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/dialogues`] }); setNewTitle(""); setNewContent(""); toast({ title: "Dialogue added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (dlgId: number) => authFetch(`/api/quest-editor/${qid}/dialogues/${dlgId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/dialogues`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Dialogue Editor</h1><p className="text-muted-foreground text-sm">NPC dialogue scripts for this quest</p></div>
      </div>

      <Card><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="text-xs text-muted-foreground mb-1 block">Title (optional)</label><Input placeholder="Quest Start" value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DIALOGUE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Content</label><Textarea className="resize-none h-24" placeholder="Brave adventurer, I need your help..." value={newContent} onChange={e => setNewContent(e.target.value)} /></div>
        <Button disabled={!newContent || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Dialogue</Button>
      </CardContent></Card>

      <div className="space-y-3">
        {!dialogues.length ? (
          <div className="text-center py-12 text-muted-foreground"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No dialogues yet.</p></div>
        ) : dialogues.map((d, i) => (
          <Card key={d.id}><CardContent className="py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground font-mono">{i + 1}</span><Badge variant="outline" className="text-xs">{d.dialogueType}</Badge>{d.title && <span className="font-medium text-sm">{d.title}</span>}</div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(d.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-6 italic">"{d.content}"</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
