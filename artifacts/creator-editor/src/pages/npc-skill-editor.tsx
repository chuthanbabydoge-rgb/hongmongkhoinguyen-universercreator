import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sword, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const SKILL_TYPES = ["active","passive","aura","toggle","reaction","ultimate"];
const TARGET_TYPES = ["single","aoe","self","ally","all_enemies","all_allies","random"];

export default function NpcSkillEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", skillType: "active", targetType: "single", damage: 0, healAmount: 0, mpCost: 0, cooldownSeconds: 0, range: 1.5, level: 1, isPassive: false });

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: skills = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "skills"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/skills`) });

  const createSkill = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/skills`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "skills"] }); setCreating(false); setForm({ name: "", description: "", skillType: "active", targetType: "single", damage: 0, healAmount: 0, mpCost: 0, cooldownSeconds: 0, range: 1.5, level: 1, isPassive: false }); },
  });

  const deleteSkill = useMutation({
    mutationFn: (skillId: number) => apiFetch(`/api/npc-editor/${npcId}/skills/${skillId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "skills"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sword className="w-6 h-6 text-primary" /> Skill Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`} · {(skills as any[]).length} skills</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> Add Skill</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardHeader><CardTitle className="text-base">New Skill</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Skill name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="number" placeholder="Level" min={1} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.skillType} onChange={(e) => setForm({ ...form, skillType: e.target.value })}>
                  {SKILL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Target</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}>
                  {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Damage</label>
                <Input type="number" value={form.damage} onChange={(e) => setForm({ ...form, damage: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">MP Cost</label>
                <Input type="number" value={form.mpCost} onChange={(e) => setForm({ ...form, mpCost: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cooldown (s)</label>
                <Input type="number" step={0.1} value={form.cooldownSeconds} onChange={(e) => setForm({ ...form, cooldownSeconds: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Range</label>
                <Input type="number" step={0.1} value={form.range} onChange={(e) => setForm({ ...form, range: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Heal Amount</label>
                <Input type="number" value={form.healAmount} onChange={(e) => setForm({ ...form, healAmount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createSkill.mutate(form)} disabled={!form.name || createSkill.isPending}>Create Skill</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(skills as any[]).length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Sword className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No skills yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(skills as any[]).map((skill: any) => (
            <Card key={skill.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">Lv.{skill.level} · {skill.skillType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{skill.targetType}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSkill.mutate(skill.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                {skill.description && <p className="text-xs text-muted-foreground mb-3">{skill.description}</p>}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[["DMG", skill.damage], ["HEAL", skill.healAmount], ["MP", skill.mpCost], ["CD", `${skill.cooldownSeconds}s`]].map(([label, val]) => (
                    <div key={label} className="bg-muted/20 rounded p-1">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-mono font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
