import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Navigation, Save, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function NumField({ label, value, onChange, step = 0.1 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type="number" step={step} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function WorldNavigation() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });
  const { data: navData, isLoading } = useQuery({ queryKey: ["/api/world-editor", worldId, "navigation"], queryFn: () => apiFetch(`/api/world-editor/${worldId}/navigation`), enabled: !!worldId });

  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => { if (navData) setForm(navData); }, [navData]);

  const updateNav = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/world-editor/${worldId}/navigation`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId, "navigation"] }),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Navigation Editor</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => updateNav.mutate(form)} disabled={updateNav.isPending}><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      </div>

      {navData?.isGenerated && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-3 px-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Navigation mesh generated</span>
            <Badge className="ml-auto text-xs bg-emerald-500/20 text-emerald-400">Ready</Badge>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="h-64 rounded-lg bg-muted/30 animate-pulse" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Navigation className="w-4 h-4 text-amber-400" />Agent Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">NavMesh Enabled</span>
                <input type="checkbox" checked={!!form.navMeshEnabled} onChange={(e) => set("navMeshEnabled", e.target.checked)} className="accent-primary w-4 h-4" />
              </div>
              <NumField label="Agent Height" value={Number(form.agentHeight ?? 2)} onChange={(v: number) => set("agentHeight", v)} />
              <NumField label="Agent Radius" value={Number(form.agentRadius ?? 0.5)} onChange={(v: number) => set("agentRadius", v)} />
              <NumField label="Max Slope (°)" value={Number(form.agentMaxSlope ?? 45)} step={1} onChange={(v: number) => set("agentMaxSlope", v)} />
              <NumField label="Step Height" value={Number(form.agentStepHeight ?? 0.4)} onChange={(v: number) => set("agentStepHeight", v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Area Types</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Walkable Areas", key: "walkableAreas", color: "text-emerald-400" },
                { label: "Blocked Areas", key: "blockedAreas", color: "text-red-400" },
                { label: "Jump Areas", key: "jumpAreas", color: "text-yellow-400" },
                { label: "Water Areas", key: "waterAreas", color: "text-blue-400" },
              ].map(({ label, key, color }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className={`text-sm ${color}`}>{label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Array.isArray(form[key]) ? (form[key] as unknown[]).length : 0} zones
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
