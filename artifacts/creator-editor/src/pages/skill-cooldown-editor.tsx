import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Clock, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Cooldown = { id: number; cooldownType: string; duration: number; durationPerLevel: number; globalCooldownDuration: number; canReduceWithStats: boolean; minCooldown: number };

export default function SkillCooldownEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ cooldownType: "local", duration: 5, durationPerLevel: 0, globalCooldownDuration: 1.5, canReduceWithStats: true, minCooldown: 0.5 });

  const { data: cooldowns = [] } = useQuery<Cooldown[]>({
    queryKey: [`/api/skills/${id}/cooldowns`],
    queryFn: () => authFetch(`/api/skills/${id}/cooldowns`).then((r) => r.json()),
    enabled: !!id,
  });

  useEffect(() => { if (cooldowns[0]) setForm(cooldowns[0]); }, [cooldowns]);

  const saveMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/cooldowns`, { method: "POST", body: JSON.stringify(form) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}/cooldowns`] }); toast({ title: "Cooldown saved" }); },
  });

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked
      : e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Skill Editor</span><ChevronRight className="w-3 h-3" /><span className="text-foreground">Cooldowns · Skill #{id}</span>
      </div>
      <h1 className="text-xl font-bold">Cooldown Editor</h1>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Cooldown Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="text-xs text-muted-foreground">Cooldown Type</label>
              <select value={form.cooldownType} onChange={field("cooldownType")}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                <option value="local">Local</option>
                <option value="global">Global</option>
              </select></div>
            <div><label className="text-xs text-muted-foreground">Duration (s)</label>
              <Input type="number" step="0.1" value={form.duration} onChange={field("duration")} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Duration Per Level (s)</label>
              <Input type="number" step="0.1" value={form.durationPerLevel} onChange={field("durationPerLevel")} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">GCD Duration (s)</label>
              <Input type="number" step="0.1" value={form.globalCooldownDuration} onChange={field("globalCooldownDuration")} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Min Cooldown (s)</label>
              <Input type="number" step="0.1" value={form.minCooldown} onChange={field("minCooldown")} className="mt-1" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.canReduceWithStats} onChange={field("canReduceWithStats")} className="rounded" />
            Can be reduced by haste/CDR stats
          </label>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>Effective CD at level 5: <strong>{(form.duration - form.durationPerLevel * 4).toFixed(1)}s</strong> (min {form.minCooldown}s)</span>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />Save Cooldown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
