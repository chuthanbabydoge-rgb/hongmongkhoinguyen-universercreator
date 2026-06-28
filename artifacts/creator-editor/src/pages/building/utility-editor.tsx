import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function UtilityEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", utilityType: "electric" });

  const { data: utilities = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/utilities`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/utilities`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/utilities`, {
        method: "POST",
        body: JSON.stringify({ name: form.name || "New Utility", utilityType: form.utilityType, powerDraw: 100, isActive: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setForm({ name: "", utilityType: "electric" }); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/utilities`] }); toast({ title: "Utility added" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (uId: number) => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/utilities/${uId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/utilities`] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Utility Editor</h1></div>
      <Card>
        <CardHeader><CardTitle>Add Utility</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="Utility name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="max-w-xs" />
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Utilities ({utilities.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <div className="text-muted-foreground">Loading...</div> : utilities.map((u: Record<string, unknown>) => (
            <div key={String(u.id)} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {String(u.utilityType).includes("water") ? <Droplets className="w-4 h-4 text-blue-500" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                <div>
                  <div className="font-medium">{String(u.name)}</div>
                  <div className="text-xs text-muted-foreground">{String(u.utilityType)} — {String(u.powerDraw)}W</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.isActive ? "default" : "secondary"}>{u.isActive ? "Active" : "Off"}</Badge>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(Number(u.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {utilities.length === 0 && !isLoading && <div className="text-muted-foreground text-sm">No utilities yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
