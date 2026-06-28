import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mountain, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function TerrainEditor() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: terrain, isLoading } = useQuery<Record<string, unknown> | null>({
    queryKey: [`/api/lands/${landId}/terrain`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/terrain`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const body = terrain ? { ...terrain, ...form } : { landId, terrainType: "flat", resolution: 64, scaleX: 1, scaleZ: 1, heightScale: 10, baseElevation: 0, roughness: 0.5, fertility: 0.5, ...form };
      const res = await fetch(`${BASE}/api/lands/${landId}/terrain`, { method: "PUT", headers: auth(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/terrain`] }); toast({ title: "Terrain saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mountain className="w-6 h-6 text-emerald-500" /> Terrain Editor</h1>
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
      </div>
      <Card><CardHeader><CardTitle>Terrain Configuration</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            { key: "terrainType", label: "Terrain Type", def: "flat" },
            { key: "resolution", label: "Resolution", def: "64" },
            { key: "scaleX", label: "Scale X", def: "1" },
            { key: "scaleZ", label: "Scale Z", def: "1" },
            { key: "heightScale", label: "Height Scale", def: "10" },
            { key: "baseElevation", label: "Base Elevation", def: "0" },
            { key: "roughness", label: "Roughness (0-1)", def: "0.5" },
            { key: "fertility", label: "Fertility (0-1)", def: "0.5" },
          ].map(({ key, label, def }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium">{label}</label>
              <Input defaultValue={String((terrain as Record<string, unknown> | null)?.[key] ?? def)} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="col-span-2 space-y-1"><label className="text-sm font-medium">Heightmap Ref</label><Input defaultValue={String((terrain as Record<string, unknown> | null)?.heightmapRef ?? "")} onChange={(e) => setForm((f) => ({ ...f, heightmapRef: e.target.value }))} /></div>
          <div className="col-span-2 space-y-1"><label className="text-sm font-medium">Texture Ref</label><Input defaultValue={String((terrain as Record<string, unknown> | null)?.textureRef ?? "")} onChange={(e) => setForm((f) => ({ ...f, textureRef: e.target.value }))} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
