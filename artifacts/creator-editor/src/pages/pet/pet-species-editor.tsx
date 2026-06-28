import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

const defaultForm = { name: "", petType: "beast", rarity: "common", size: "medium", foodType: "meat", growthType: "normal", baseHp: 100, baseAttack: 10, baseDefense: 5, baseSpeed: 10, baseSpecialAttack: 5, baseSpecialDefense: 5, captureRate: 45, projectId: 0 };

export default function PetSpeciesEditor() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>(defaultForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/pets/species"],
    queryFn: () => apiFetch("/api/pets/species?projectId=0").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/pets/species", { method: "POST", body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/pets/species"] }); toast({ title: "Species created" }); setShowForm(false); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/species/${editing}`, { method: "PATCH", body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/pets/species"] }); toast({ title: "Species updated" }); setEditing(null); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/pets/species/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/pets/species"] }); toast({ title: "Species deleted" }); },
  });

  const startEdit = (s: any) => { setForm(s); setEditing(s.id); setShowForm(true); };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pet Species Editor</h1>
        <Button onClick={() => { setForm(defaultForm); setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />New Species</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="flex items-center justify-between">{editing ? "Edit Species" : "New Species"}<Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Capture Rate</Label><Input type="number" value={form.captureRate} onChange={e => setForm(f => ({ ...f, captureRate: Number(e.target.value) }))} /></div>
              {[["petType","Type",["beast","dragon","elemental","mechanical","undead","spirit","aquatic","flying","insect","plant","humanoid","demon"]],["rarity","Rarity",["common","uncommon","rare","epic","legendary","mythic"]],["size","Size",["tiny","small","medium","large","huge","gigantic"]],["foodType","Food",["meat","fish","berries","vegetables","candy","special","potion","crystal","none"]],["growthType","Growth",["fast","normal","slow","erratic","fluctuating","medium_fast"]]].map(([k, label, opts]) => (
                <div key={k as string}><Label>{label as string}</Label>
                  <Select value={form[k as string]} onValueChange={v => setForm(f => ({ ...f, [k as string]: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(opts as string[]).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              {["baseHp","baseAttack","baseDefense","baseSpeed","baseSpecialAttack","baseSpecialDefense"].map(stat => (
                <div key={stat}><Label className="capitalize">{stat.replace("base","Base ").replace(/([A-Z])/g," $1")}</Label>
                  <Input type="number" value={form[stat]} onChange={e => setForm(f => ({ ...f, [stat]: Number(e.target.value) }))} /></div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="space-y-2">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : !data?.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No species defined yet</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {data.map((s: any) => (
            <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <div className="flex gap-2 mt-1"><Badge variant="outline">{s.petType}</Badge><Badge variant="secondary">{s.rarity}</Badge><Badge variant="outline">{s.growthType}</Badge></div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
