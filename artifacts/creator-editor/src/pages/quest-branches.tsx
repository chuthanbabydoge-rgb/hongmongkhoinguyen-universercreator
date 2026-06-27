import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Plus, Trash2, ArrowLeft, ArrowDown } from "lucide-react";
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

const BRANCH_TYPES = ["linear","choice","conditional","parallel","loop","custom"];

type Branch = { id: number; name: string; branchType: string; parentId: number | null; label: string | null; order: number };

export default function QuestBranches() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("choice");

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: [`/api/quest-editor/${qid}/branches`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/branches`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/quest-editor/${qid}/branches`, { method: "POST", body: JSON.stringify({ name: newName, branchType: newType }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/branches`] }); setNewName(""); toast({ title: "Branch added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (bId: number) => authFetch(`/api/quest-editor/${qid}/branches/${bId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/quest-editor/${qid}/branches`] }),
  });

  const roots = branches.filter(b => !b.parentId);
  const getChildren = (pid: number) => branches.filter(b => b.parentId === pid);

  const BranchNode = ({ branch, depth = 0 }: { branch: Branch; depth?: number }) => (
    <div style={{ marginLeft: depth * 24 }}>
      <Card className="mb-2 hover:border-primary/40 transition-colors">
        <CardContent className="py-2 flex items-center gap-3">
          {depth > 0 && <ArrowDown className="w-3 h-3 text-muted-foreground shrink-0" />}
          <GitBranch className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1"><p className="text-sm font-medium">{branch.name}</p>{branch.label && <p className="text-xs text-muted-foreground">{branch.label}</p>}</div>
          <Badge variant="outline" className="text-xs">{branch.branchType}</Badge>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(branch.id)}><Trash2 className="w-3 h-3" /></Button>
        </CardContent>
      </Card>
      {getChildren(branch.id).map(child => <BranchNode key={child.id} branch={child} depth={depth + 1} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Branch Editor</h1><p className="text-muted-foreground text-sm">Visual quest flow tree</p></div>
      </div>

      <Card><CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div><label className="text-xs text-muted-foreground mb-1 block">Branch Name</label><Input placeholder="Accept Quest" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={newType} onValueChange={setNewType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BRANCH_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button className="mt-3" disabled={!newName || createMutation.isPending} onClick={() => createMutation.mutate()}><Plus className="w-4 h-4 mr-1" />Add Branch</Button>
      </CardContent></Card>

      <div>
        {!branches.length ? (
          <div className="text-center py-12 text-muted-foreground"><GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No branches yet. Add a Start branch.</p></div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Flow Tree</p>
            {roots.map(b => <BranchNode key={b.id} branch={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
