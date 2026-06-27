import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Upload, CheckCircle, AlertTriangle, FileJson } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WorldImportExport() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [importText, setImportText] = useState("");
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  const { data: world } = useQuery({ queryKey: ["/api/world-editor", worldId], queryFn: () => apiFetch(`/api/world-editor/${worldId}`) });

  const exportWorld = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/export`, { method: "POST", body: JSON.stringify({ format: "json" }) }),
    onSuccess: (result) => setExportResult(result.data),
  });

  const validateWorld = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/validate`, { method: "POST" }),
    onSuccess: (result) => setValidationResult(result),
  });

  const importWorld = useMutation({
    mutationFn: () => apiFetch("/api/world-editor/import", { method: "POST", body: JSON.stringify({ data: importText }) }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["/api/world-editor"] });
      nav(`/world-editor/${result.world.id}`);
    },
  });

  const downloadExport = () => {
    if (!exportResult) return;
    const blob = new Blob([exportResult], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${world?.name ?? "world"}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav(`/world-editor/${worldId}`)}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Import / Export</h1>
          <p className="text-muted-foreground text-sm">{world?.name ?? `World #${worldId}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4 text-emerald-400" />Export World</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Export your world as a JSON package including all regions, layers, spawn points, portals, and environment settings.</p>
            <div className="flex gap-2">
              <Button onClick={() => exportWorld.mutate()} disabled={exportWorld.isPending} className="flex-1">
                <FileJson className="w-4 h-4 mr-2" /> {exportWorld.isPending ? "Exporting…" : "Export as JSON"}
              </Button>
              {exportResult && (
                <Button variant="outline" onClick={downloadExport}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              )}
            </div>
            {exportResult && (
              <div className="bg-muted/30 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Export complete</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{(exportResult.length / 1024).toFixed(1)} KB</Badge>
                </div>
                <pre className="text-xs text-muted-foreground overflow-hidden max-h-32 text-ellipsis">{exportResult.slice(0, 500)}…</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4 text-blue-400" />Import World</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Import a world from a JSON package file. This creates a new world in your workspace.</p>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to select JSON file</span>
              <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
            </label>
            {importText && (
              <div className="bg-muted/30 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-2">File loaded · {(importText.length / 1024).toFixed(1)} KB</p>
                <Button onClick={() => importWorld.mutate()} disabled={importWorld.isPending} className="w-full">
                  {importWorld.isPending ? "Importing…" : "Import World"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" />Validation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Run a validation check to detect issues like missing spawn points, invalid portals, or broken configurations.</p>
          <Button variant="outline" onClick={() => validateWorld.mutate()} disabled={validateWorld.isPending}>
            {validateWorld.isPending ? "Validating…" : "Validate World"}
          </Button>
          {validationResult && (
            <div className={`rounded-md p-4 ${validationResult.valid ? "bg-emerald-500/5 border border-emerald-500/30" : "bg-red-500/5 border border-red-500/30"}`}>
              <div className="flex items-center gap-2 mb-3">
                {validationResult.valid
                  ? <><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400 font-medium">World is valid</span></>
                  : <><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-sm text-red-400 font-medium">{validationResult.errors.length} error(s)</span></>}
              </div>
              {validationResult.errors.map((e: any) => (
                <p key={e.code} className="text-xs text-red-400 mb-1">✗ {e.message}</p>
              ))}
              {validationResult.warnings.map((w: any) => (
                <p key={w.code} className="text-xs text-yellow-400 mb-1">⚠ {w.message}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
