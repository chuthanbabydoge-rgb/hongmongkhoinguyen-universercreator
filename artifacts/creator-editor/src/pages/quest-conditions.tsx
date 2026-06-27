import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Plus, Trash2, ArrowLeft } from "lucide-react";
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

const CONDITION_TYPES = ["level","quest","skill","item","reputation","faction","custom"];

type Condition = { id: number; name: string; conditionType: string; targetValue: string | null; operator: string };

export default function QuestConditions() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("level");
  const [newValue, setNewValue] = useState("");

  const { data: conditions = [] } = useQuery<Condition[]>({
    queryKey: [`/api/quest-editor/${qid}/conditions`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/conditions`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/conditions`, { method: "POST", body: JSON.stringify({ name: newName, conditionType: newType, targetValue: newValue }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/conditions`] }); setNewName(""); setNewValue(""); toast({ title: "Condition added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (condId: number) => authFetch(`/api/quest-editor/${qid}/conditions/${condId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/conditions`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Conditions Editor</h1><p className="text-muted-foreground text-sm">Prerequisites for accepting this quest</p></div>
      </div>

      <Card><CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><Input placeholder="Must be Level 10" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONDITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Value</label><Input placeholder="10" value={newValue} onChange={e => setNewValue(e.target.value)} /></div>
        </div>
        <Button className="mt-3" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Condition</Button>
      </CardContent></Card>

      <div className="space-y-2">
        {!conditions.length ? (
          <div className="text-center py-12 text-muted-foreground"><ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No conditions. Quest is available to all.</p></div>
        ) : conditions.map((c) => (
          <Card key={c.id}><CardContent className="py-3 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{c.name}</p>
              <div className="flex gap-2 mt-0.5"><Badge variant="outline" className="text-xs">{c.conditionType}</Badge>{c.targetValue && <span className="text-xs text-muted-foreground">{c.operator} {c.targetValue}</span>}</div>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
