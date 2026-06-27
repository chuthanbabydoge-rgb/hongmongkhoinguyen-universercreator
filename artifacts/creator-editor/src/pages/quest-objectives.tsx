import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Trash2, ArrowLeft } from "lucide-react";
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

const OBJECTIVE_TYPES = ["kill","collect","talk","escort","explore","craft","use_item","reach_location","interact","custom"];

type Objective = { id: number; name: string; objectiveType: string; targetName: string | null; targetCount: number; description: string | null };

export default function QuestObjectives() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("kill");
  const [newCount, setNewCount] = useState(1);

  const { data: objectives = [] } = useQuery<Objective[]>({
    queryKey: [`/api/quest-editor/${qid}/objectives`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/objectives`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/objectives`, { method: "POST", body: JSON.stringify({ name: newName, objectiveType: newType, targetCount: newCount }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/objectives`] }); setNewName(""); setNewCount(1); toast({ title: "Objective added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (objId: number) => authFetch(`/api/quest-editor/${qid}/objectives/${objId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/objectives`] }),
  });

  const typeColors: Record<string, string> = { kill: "text-red-400", collect: "text-blue-400", talk: "text-green-400", escort: "text-yellow-400", explore: "text-purple-400", craft: "text-orange-400", use_item: "text-pink-400", reach_location: "text-cyan-400", interact: "text-teal-400", custom: "text-muted-foreground" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Objective Editor</h1><p className="text-muted-foreground text-sm">Define what players must accomplish</p></div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Name</label><Input placeholder="Kill 5 Wolves" value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OBJECTIVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Count</label><Input type="number" min={1} value={newCount} onChange={e => setNewCount(Number(e.target.value))} /></div>
          </div>
          <Button className="mt-3" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Objective</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {!objectives.length ? (
          <div className="text-center py-12 text-muted-foreground"><Target className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No objectives yet.</p></div>
        ) : objectives.map((obj) => (
          <Card key={obj.id}>
            <CardContent className="py-3 flex items-center gap-3">
              <Target className={`w-4 h-4 shrink-0 ${typeColors[obj.objectiveType] ?? "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">{obj.name}</p>
                <div className="flex gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">{obj.objectiveType}</Badge>
                  <Badge variant="outline" className="text-xs">×{obj.targetCount}</Badge>
                  {obj.targetName && <span className="text-xs text-muted-foreground">{obj.targetName}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(obj.id)}><Trash2 className="w-3 h-3" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
