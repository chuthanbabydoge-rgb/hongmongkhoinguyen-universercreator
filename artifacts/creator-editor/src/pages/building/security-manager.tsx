import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

const LEVELS = ["none", "basic", "standard", "high", "maximum"];

export default function SecurityManager() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ securityLevel: "basic", hasAlarm: false, hasCameras: false, hasGuards: false });

  const { data: security } = useQuery<Record<string, unknown> | null>({
    queryKey: [`/api/buildings/${id}/security`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/security`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (security) {
      setForm({
        securityLevel: String(security.securityLevel ?? "basic"),
        hasAlarm: Boolean(security.hasAlarm),
        hasCameras: Boolean(security.hasCameras),
        hasGuards: Boolean(security.hasGuards),
      });
    }
  }, [security]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/security`, { method: "PATCH", body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/security`] }); toast({ title: "Security settings saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Shield className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Security Manager</h1></div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Settings</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Security Level</CardTitle></CardHeader>
          <CardContent>
            <Select value={form.securityLevel} onValueChange={v => setForm(f => ({ ...f, securityLevel: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}><Badge variant="outline" className="capitalize">{l}</Badge></SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Systems</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-sm">Alarm System</span></div>
              <Switch checked={form.hasAlarm} onCheckedChange={v => setForm(f => ({ ...f, hasAlarm: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-blue-500" /><span className="text-sm">CCTV Cameras</span></div>
              <Switch checked={form.hasCameras} onCheckedChange={v => setForm(f => ({ ...f, hasCameras: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /><span className="text-sm">Security Guards</span></div>
              <Switch checked={form.hasGuards} onCheckedChange={v => setForm(f => ({ ...f, hasGuards: v }))} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
