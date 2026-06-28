import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossSkillEditor() {
  const [, params] = useRoute("/boss-skill-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: skills, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["/api/bosses", id, "skills"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/skills`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/bosses/${id}/skills`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Skill", skillRef: "skill_001", cooldown: 10, priority: 5 }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "skills"] }); toast({ title: "Skill added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ skillId, data }: { skillId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/skills/${skillId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "skills"] }); setEditingId(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const res = await fetch(`${BASE}/api/bosses/${id}/skills/${skillId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/bosses", id, "skills"] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/boss-dashboard"><span className="hover:text-foreground cursor-pointer">Boss Editor</span></Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/boss-editor/${id}`}><span className="hover:text-foreground cursor-pointer">Editor</span></Link>
        <ChevronRight className="w-3 h-3" /><span className="text-foreground">Skills</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />Skill Editor</h1>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (skills ?? []).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No skills. Click "Add Skill" to link a skill.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(skills ?? []).map((s: Record<string, unknown>) => (
            <Card key={String(s.id)}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{String(s.name)}</CardTitle>
                  {s.isUltimate && <Badge variant="destructive">Ultimate</Badge>}
                  {s.isSignatureMove && <Badge>Signature</Badge>}
                  {s.isPassive && <Badge variant="secondary">Passive</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(Number(s.id)); setForm({ ...s }); }}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Remove skill?")) deleteMutation.mutate(Number(s.id)); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ref: {String(s.skillRef)} · CD: {String(s.cooldown)}s · Unlock Phase: {String(s.phaseUnlock)} · Priority: {String(s.priority)}
              </CardContent>
              {editingId === Number(s.id) && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>Name</Label><Input value={String(form.name ?? "")} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Skill Ref</Label><Input value={String(form.skillRef ?? "")} onChange={e => setForm(f => ({ ...f, skillRef: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Cooldown (s)</Label><Input type="number" value={String(form.cooldown ?? 10)} onChange={e => setForm(f => ({ ...f, cooldown: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Phase Unlock</Label><Input type="number" value={String(form.phaseUnlock ?? 1)} onChange={e => setForm(f => ({ ...f, phaseUnlock: Number(e.target.value) }))} /></div>
                    <div className="space-y-1"><Label>Priority</Label><Input type="number" value={String(form.priority ?? 5)} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["isUltimate","Ultimate"],["isSignatureMove","Signature Move"],["isPassive","Passive"]].map(([k,l]) => (
                      <div key={k} className="flex items-center gap-2"><Switch checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: v }))} /><Label>{l}</Label></div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate({ skillId: editingId, data: form })} disabled={saveMutation.isPending}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
