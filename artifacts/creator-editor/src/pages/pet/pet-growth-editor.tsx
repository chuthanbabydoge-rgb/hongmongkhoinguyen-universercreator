import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetGrowthEditor() {
  const [, params] = useRoute("/pet-growth-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>({ growthType: "normal", expMultiplier: 1.0, statMultiplier: 1.0, loyaltyGrowth: 1.0, hungerRate: 1.0, maxLevel: 100 });
  const [levels, setLevels] = useState<any[]>([]);

  const { data: growth, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/growth`], queryFn: () => apiFetch(`/api/pets/${id}/growth`).then(r => r.json()), enabled: !!id });
  const { data: lvlData } = useQuery({ queryKey: [`/api/pets/${id}/levels`], queryFn: () => apiFetch(`/api/pets/${id}/levels`).then(r => r.json()), enabled: !!id });

  useEffect(() => { if (growth) setForm(growth); }, [growth]);
  useEffect(() => { if (lvlData) setLevels(lvlData); }, [lvlData]);

  const saveMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/growth`, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/growth`] }); toast({ title: "Growth saved" }); },
  });

  const addLevelMutation = useMutation({
    mutationFn: (data: object) => apiFetch(`/api/pets/${id}/levels`, { method: "POST", body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/levels`] }); toast({ title: "Level added" }); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Growth Editor — Pet #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Growth Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Growth Type</Label>
              <Select value={form.growthType ?? "normal"} onValueChange={v => setForm(f => ({ ...f, growthType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["fast","normal","slow","erratic","fluctuating","medium_fast"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Max Level</Label><Input type="number" value={form.maxLevel ?? 100} onChange={e => setForm(f => ({ ...f, maxLevel: Number(e.target.value) }))} /></div>
            {["expMultiplier","statMultiplier","loyaltyGrowth","hungerRate"].map(k => (
              <div key={k}><Label className="capitalize">{k.replace(/([A-Z])/g, " $1")}</Label>
                <Input type="number" step="0.1" value={form[k] ?? 1.0} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} /></div>
            ))}
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Growth</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Level Milestones ({levels.length})</CardTitle>
            <Button size="sm" onClick={() => addLevelMutation.mutate({ level: (levels.length || 0) + 1, expRequired: ((levels.length || 0) + 1) * 100, hpBonus: 5, attackBonus: 1, defenseBonus: 1, speedBonus: 1 })}>Add Level</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {levels.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <span className="font-mono">Lv. {l.level}</span>
                <span>EXP: {l.expRequired}</span>
                <span>HP+{l.hpBonus} ATK+{l.attackBonus} DEF+{l.defenseBonus}</span>
                {l.skillUnlocked && <span className="text-primary text-xs">Skill: {l.skillUnlocked}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
