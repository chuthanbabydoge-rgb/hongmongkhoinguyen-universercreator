import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Download, Upload, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Skill = { id: number; name: string; skillType: string };

export default function SkillImportExport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [exportPayload, setExportPayload] = useState<string>("");
  const [importJson, setImportJson] = useState<string>("");
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
    queryFn: () => authFetch("/api/skills?limit=200").then((r) => r.json()),
  });

  const exportMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${selectedId}/export`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res: { payload: string }) => { setExportPayload(res.payload); toast({ title: "Exported successfully" }); },
  });

  const importMutation = useMutation({
    mutationFn: () => authFetch("/api/skills/import", { method: "POST", body: JSON.stringify({ data: importJson }) }).then((r) => r.json()),
    onSuccess: (res: { skillId: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setImportResult({ success: true, message: `Skill imported as #${res.skillId}` });
      toast({ title: "Import successful" });
    },
    onError: (err) => setImportResult({ success: false, message: String(err) }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import / Export</h1>
        <p className="text-muted-foreground text-sm mt-1">Backup, migrate, and share skills as JSON</p>
      </div>

      <Tabs defaultValue="export">
        <TabsList><TabsTrigger value="export">Export</TabsTrigger><TabsTrigger value="import">Import</TabsTrigger></TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Select Skill to Export</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <select value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                <option value={0}>— Choose a skill —</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.skillType})</option>)}
              </select>
              <Button onClick={() => exportMutation.mutate()} disabled={!selectedId || exportMutation.isPending}>
                <Download className="w-4 h-4 mr-2" />Export JSON
              </Button>
              {exportPayload && (
                <Textarea value={exportPayload} readOnly rows={10} className="font-mono text-xs" onClick={e => (e.target as HTMLTextAreaElement).select()} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Import from JSON</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder="Paste exported skill JSON here…"
                rows={10}
                className="font-mono text-xs"
              />
              <Button onClick={() => importMutation.mutate()} disabled={!importJson || importMutation.isPending}>
                <Upload className="w-4 h-4 mr-2" />Import Skill
              </Button>
              {importResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${importResult.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {importResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {importResult.message}
                  {importResult.success && (
                    <Button variant="link" size="sm" className="ml-2 text-xs h-auto p-0" onClick={() => setLocation("/skill-browser")}>
                      View in Browser →
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
