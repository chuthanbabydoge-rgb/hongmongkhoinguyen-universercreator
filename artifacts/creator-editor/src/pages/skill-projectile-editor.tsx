import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Swords, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Projectile = { id: number; projectileName: string; speed: number; maxRange: number; hitRadius: number; isPiercing: boolean; isHoming: boolean; count: number };

export default function SkillProjectileEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ projectileName: "Projectile", speed: 15, maxRange: 20, hitRadius: 0.5, isPiercing: false, isHoming: false, homingStrength: 1, count: 1, spreadAngle: 0, gravity: 0 });

  const { data: projectiles = [], isLoading } = useQuery<Projectile[]>({
    queryKey: [`/api/skills/${id}/projectiles`],
    queryFn: () => authFetch(`/api/skills/${id}/projectiles`).then((r) => r.json()),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/projectiles`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/projectiles`] }); toast({ title: "Projectile added" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (pId: number) => authFetch(`/api/skills/projectiles/${pId}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/projectiles`] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Projectiles · Skill #{id}</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Projectile Editor</h1>
        <Badge variant="outline">{projectiles.length} projectiles</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Projectile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Name", key: "projectileName", type: "text" },
              { label: "Speed", key: "speed", type: "number" },
              { label: "Max Range", key: "maxRange", type: "number" },
              { label: "Hit Radius", key: "hitRadius", type: "number" },
              { label: "Count", key: "count", type: "number" },
              { label: "Spread Angle°", key: "spreadAngle", type: "number" },
              { label: "Gravity", key: "gravity", type: "number" },
              { label: "Homing Strength", key: "homingStrength", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type={type} value={String(form[key as keyof typeof form])}
                  onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} className="mt-1" /></div>
            ))}
          </div>
          <div className="flex gap-4">
            {[["isPiercing", "Piercing"], ["isHoming", "Homing"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                {label}
              </label>
            ))}
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />Add Projectile
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <div className="space-y-2">
          {projectiles.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Swords className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">{p.projectileName}</p>
                  <p className="text-xs text-muted-foreground">speed {p.speed} · range {p.maxRange} · radius {p.hitRadius} · ×{p.count}{p.isPiercing ? " · piercing" : ""}{p.isHoming ? " · homing" : ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {projectiles.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No projectiles defined.</div>}
        </div>
      )}
    </div>
  );
}
