import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityPopulationManager() {
  const [, params] = useRoute("/city-population-manager/:id");
  const cityId = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: pop, isLoading } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/cities/${cityId}/population`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/population`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load population");
      return res.json();
    },
    enabled: !!cityId,
  });

  useEffect(() => { if (pop) setForm(pop); }, [pop]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${cityId}/population`, { method: "PATCH", headers: headers(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed to save population");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/cities/${cityId}/population`] }); toast({ title: "Population data saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save population data", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/city-editor/${cityId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Users className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold">Population Manager</h1>
        </div>
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : !pop ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No population data found for this city.</CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total", value: form.totalCount ?? 0, key: "totalCount" },
              { label: "NPCs", value: form.npcCount ?? 0, key: "npcCount" },
              { label: "Players", value: form.playerCount ?? 0, key: "playerCount" },
              { label: "Residents", value: form.residentCount ?? 0, key: "residentCount" },
            ].map(({ label, value, key }) => (
              <Card key={key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
                <CardContent>
                  <Input type="number" value={String(value)} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="text-2xl font-bold" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Demographic Rates</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Birth Rate", key: "birthRate", step: 0.001, min: 0, max: 1 },
                  { label: "Death Rate", key: "deathRate", step: 0.001, min: 0, max: 1 },
                  { label: "Migration Rate", key: "migrationRate", step: 0.001, min: -1, max: 1 },
                  { label: "Employment Rate", key: "employmentRate", step: 0.01, min: 0, max: 1 },
                ].map(({ label, key, step, min, max }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium">{label}</label>
                    <Input type="number" step={step} min={min} max={max} value={String(form[key] ?? 0)} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Happiness & Well-being</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Happiness Score (0-100)</label>
                  <Input type="number" min={0} max={100} value={String(form.happinessScore ?? 75)} onChange={(e) => setForm({ ...form, happinessScore: Number(e.target.value) })} />
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Number(form.happinessScore ?? 75)}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
