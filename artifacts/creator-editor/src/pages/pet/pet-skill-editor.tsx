import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Zap } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetSkillEditor() {
  const [, params] = useRoute("/pet-skill-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ skillRef: "", slotIndex: 0, learnedAtLevel: 1, isActive: true });

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/skills`], queryFn: () => apiFetch(`/api/pets/${id}/skills`).then(r => r.json()), enabled: !!id });

  const addMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/skills`, { method: "POST", body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/skills`] }); toast({ title: "Skill added" }); setForm({ skillRef: "", slotIndex: 0, learnedAtLevel: 1, isActive: true }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (skillId: number) => apiFetch(`/api/pets/${id}/skills/${skillId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/skills`] }); toast({ title: "Skill removed" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (s: any) => apiFetch(`/api/pets/${id}/skills/${s.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !s.isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/pets/${id}/skills`] }),
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-500" />Skill Editor — Pet #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Add Skill</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1"><Label>Skill Ref</Label><Input value={form.skillRef} onChange={e => setForm(f => ({ ...f, skillRef: e.target.value }))} placeholder="skill:123" /></div>
            <div><Label>Slot</Label><Input type="number" min={0} max={7} value={form.slotIndex} onChange={e => setForm(f => ({ ...f, slotIndex: Number(e.target.value) }))} /></div>
            <div><Label>Learn At Level</Label><Input type="number" min={1} value={form.learnedAtLevel} onChange={e => setForm(f => ({ ...f, learnedAtLevel: Number(e.target.value) }))} /></div>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!form.skillRef || addMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Pet Skills ({data?.length ?? 0}/8)</CardTitle></CardHeader>
        <CardContent>
          {!data?.length ? <p className="text-muted-foreground text-sm">No skills assigned</p> : (
            <div className="space-y-2">
              {data.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-mono text-sm font-medium">{s.skillRef}</span>
                    <span className="ml-2 text-xs text-muted-foreground">Slot {s.slotIndex} · Learns at Lv. {s.learnedAtLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleMutation.mutate(s)}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
