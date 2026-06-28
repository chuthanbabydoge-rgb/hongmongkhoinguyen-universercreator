import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Heart } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetBreedingEditor() {
  const [, params] = useRoute("/pet-breeding-editor/:id");
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ breedingCooldown: 3600, maxBreeds: 10, currentBreeds: 0, offspringSpeciesId: "", partnerId: "" });

  const { data, isLoading } = useQuery({ queryKey: [`/api/pets/${id}/breeding`], queryFn: () => apiFetch(`/api/pets/${id}/breeding`).then(r => r.json()), enabled: !!id });
  useEffect(() => { if (data) setForm(d => ({ ...d, ...data, offspringSpeciesId: data.offspringSpeciesId?.toString() ?? "", partnerId: data.partnerId?.toString() ?? "" })); }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${id}/breeding`, { method: "PUT", body: JSON.stringify({ ...form, offspringSpeciesId: form.offspringSpeciesId ? Number(form.offspringSpeciesId) : undefined, partnerId: form.partnerId ? Number(form.partnerId) : undefined }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/pets/${id}/breeding`] }); toast({ title: "Breeding config saved" }); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="w-6 h-6 text-pink-500" />Breeding Editor — Pet #{id}</h1>
      <Card>
        <CardHeader><CardTitle>Breeding Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Cooldown (seconds)</Label><Input type="number" value={form.breedingCooldown} onChange={e => setForm(f => ({ ...f, breedingCooldown: Number(e.target.value) }))} /></div>
            <div><Label>Max Breeds</Label><Input type="number" value={form.maxBreeds} onChange={e => setForm(f => ({ ...f, maxBreeds: Number(e.target.value) }))} /></div>
            <div><Label>Current Breeds</Label><Input type="number" value={form.currentBreeds} onChange={e => setForm(f => ({ ...f, currentBreeds: Number(e.target.value) }))} /></div>
            <div><Label>Offspring Species ID (optional)</Label><Input value={form.offspringSpeciesId} onChange={e => setForm(f => ({ ...f, offspringSpeciesId: e.target.value }))} placeholder="Leave empty for auto" /></div>
            <div><Label>Default Partner ID (optional)</Label><Input value={form.partnerId} onChange={e => setForm(f => ({ ...f, partnerId: e.target.value }))} placeholder="Leave empty" /></div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="w-4 h-4 mr-2" />Save Breeding Config</Button>
        </CardContent>
      </Card>
      {data && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Breed progress: <strong>{data.currentBreeds}/{data.maxBreeds}</strong></p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((data.currentBreeds ?? 0) / (data.maxBreeds ?? 10)) * 100)}%` }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
