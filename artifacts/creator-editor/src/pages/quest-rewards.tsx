import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Plus, Trash2, ArrowLeft } from "lucide-react";
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

const REWARD_TYPES = ["xp","gold","item","skill","title","reputation","pet","mount","currency"];
const REWARD_COLORS: Record<string, string> = { xp: "text-blue-400", gold: "text-yellow-400", item: "text-purple-400", skill: "text-green-400", title: "text-orange-400", reputation: "text-pink-400", pet: "text-teal-400", mount: "text-cyan-400", currency: "text-yellow-300" };

type Reward = { id: number; name: string; rewardType: string; amount: number; description: string | null };

export default function QuestRewards() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("xp");
  const [newAmount, setNewAmount] = useState(100);

  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: [`/api/quest-editor/${qid}/rewards`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/rewards`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/rewards`, { method: "POST", body: JSON.stringify({ name: newName, rewardType: newType, amount: newAmount }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/rewards`] }); setNewName(""); setNewAmount(100); toast({ title: "Reward added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (rewardId: number) => authFetch(`/api/quest-editor/${qid}/rewards/${rewardId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/rewards`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Reward Editor</h1><p className="text-muted-foreground text-sm">Define what players receive on completion</p></div>
      </div>

      <Card><CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><Input placeholder="Experience Points" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REWARD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Amount</label><Input type="number" min={1} value={newAmount} onChange={e => setNewAmount(Number(e.target.value))} /></div>
        </div>
        <Button className="mt-3" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Reward</Button>
      </CardContent></Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {!rewards.length ? (
          <div className="text-center py-12 text-muted-foreground col-span-2"><Gift className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No rewards yet.</p></div>
        ) : rewards.map((r) => (
          <Card key={r.id}><CardContent className="py-3 flex items-center gap-3">
            <Gift className={`w-5 h-5 shrink-0 ${REWARD_COLORS[r.rewardType] ?? "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className="font-medium text-sm">{r.name}</p>
              <div className="flex gap-2 mt-0.5"><Badge variant="outline" className="text-xs">{r.rewardType}</Badge><span className="text-xs text-muted-foreground">×{r.amount}</span></div>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-3 h-3" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
