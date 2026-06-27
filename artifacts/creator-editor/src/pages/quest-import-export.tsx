import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Download, Upload, FileJson, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Quest = { id: number; name: string };

export default function QuestImportExport() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string>("");
  const [importData, setImportData] = useState("");
  const [exportResult, setExportResult] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ["/api/quest-editor"],
    queryFn: () => authFetch("/api/quest-editor?limit=100").then(r => r.json()),
  });

  const handleExport = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const r = await authFetch(`/api/quest-editor/${selectedId}/export`, { method: "POST", body: JSON.stringify({ format: "json" }) });
      const d = await r.json();
      setExportResult(typeof d.data === "string" ? d.data : JSON.stringify(d, null, 2));
      toast({ title: "Export ready" });
    } catch { toast({ title: "Export failed", variant: "destructive" }); }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!importData.trim()) return;
    setLoading(true);
    try {
      const r = await authFetch("/api/quest-editor/import", { method: "POST", body: JSON.stringify({ data: importData }) });
      const q = await r.json() as { id: number };
      toast({ title: "Quest imported!" });
      setLocation(`/quest-editor/${q.id}`);
    } catch { toast({ title: "Import failed", variant: "destructive" }); }
    setLoading(false);
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(exportResult); toast({ title: "Copied to clipboard" }); };
  const downloadFile = () => {
    const blob = new Blob([exportResult], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quest-export.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Quest Import / Export</h1><p className="text-muted-foreground text-sm">Share and import quests between projects</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4" />Export Quest</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select a quest..." /></SelectTrigger>
              <SelectContent>{quests.map(q => <SelectItem key={q.id} value={String(q.id)}>{q.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={!selectedId || loading} onClick={handleExport}><FileJson className="w-4 h-4 mr-1" />Export JSON</Button>
            </div>
            {exportResult && (
              <div className="space-y-2">
                <Textarea className="font-mono text-xs h-40 resize-none" value={exportResult} readOnly />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>Copy</Button>
                  <Button size="sm" variant="outline" onClick={downloadFile}><Package className="w-3 h-3 mr-1" />Download</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" />Import Quest</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Paste JSON data exported from another quest or project.</p>
            <Textarea className="font-mono text-xs h-40 resize-none" placeholder='{"version":"1.0.0","quest":{...}}' value={importData} onChange={e => setImportData(e.target.value)} />
            <Button className="w-full" disabled={!importData.trim() || loading} onClick={handleImport}><Upload className="w-4 h-4 mr-1" />Import Quest</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
