import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, TrendingUp } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const STAT_FIELDS = [
  { key: "hp", label: "HP", type: "number" },
  { key: "maxHp", label: "Max HP", type: "number" },
  { key: "attack", label: "Attack", type: "number" },
  { key: "defense", label: "Defense", type: "number" },
  { key: "speed", label: "Speed", type: "number" },
  { key: "specialAttack", label: "Sp. Attack", type: "number" },
  { key: "specialDefense", label: "Sp. Defense", type: "number" },
  { key: "critRate", label: "Crit Rate (0–1)", type: "float" },
  { key: "evasion", label: "Evasion (0–1)", type: "float" },
  { key: "accuracy", label: "Accuracy (0–1)", type: "float" },
];

export default function PetStatsEditor() {
  const [, params] = useRoute("/pet-stats-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>({});

  const { data: stats, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/stats`], queryFn: () => apiFetch(`/api/pets/${id}/stats`).then(r => r.json()), enabled: !!id });
  useEffect(() => { if (stats) setForm(stats); }, [stats]);

  const saveMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/stats`, { method: "PUT", body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/stats`] }); toast({ title: "Stats saved" }); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stats Editor — Pet #{id}</h1>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Stats</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Base Stats</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STAT_FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step={type === "float" ? "0.01" : "1"}
                    min={0}
                    max={type === "float" ? 1 : undefined}
                    value={form[key] ?? (type === "float" ? 0.05 : 0)}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  />
                </div>
                {type === "float" && (
                  <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (form[key] ?? 0) * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
