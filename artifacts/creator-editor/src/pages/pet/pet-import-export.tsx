import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Package } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetImportExport() {
  const { toast } = useToast();
  const [exportId, setExportId] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [importId, setImportId] = useState("");
  const [result, setResult] = useState<any>(null);

  const exportJsonMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${exportId}/export/json`, { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => { setResult(d); toast({ title: "Exported as JSON" }); },
  });

  const exportTemplateMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${exportId}/export/template`, { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => { setResult(d); toast({ title: "Exported as Template" }); },
  });

  const exportPackageMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${exportId}/export/package`, { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => { setResult(d); toast({ title: "Exported as Package" }); },
  });

  const importJsonMutation = useMutation({
    mutationFn: () => {
      const payload = JSON.parse(importPayload);
      return apiFetch("/api/pets/import", { method: "POST", body: JSON.stringify({ petId: Number(importId), payload }) }).then(r => r.json());
    },
    onSuccess: (d) => { setResult(d); toast({ title: "Import successful" }); },
    onError: () => toast({ title: "Import failed", variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pet Import / Export</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="w-5 h-5" />Export Pet</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Pet ID</Label><Input type="number" value={exportId} onChange={e => setExportId(e.target.value)} placeholder="Enter pet ID" /></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => exportJsonMutation.mutate()} disabled={!exportId || exportJsonMutation.isPending}><Download className="w-4 h-4 mr-2" />JSON</Button>
              <Button variant="outline" onClick={() => exportTemplateMutation.mutate()} disabled={!exportId || exportTemplateMutation.isPending}><Download className="w-4 h-4 mr-2" />Template</Button>
              <Button variant="outline" onClick={() => exportPackageMutation.mutate()} disabled={!exportId || exportPackageMutation.isPending}><Package className="w-4 h-4 mr-2" />Package</Button>
            </div>
            {result?.checksum && <p className="text-xs text-muted-foreground font-mono break-all">SHA256: {result.checksum}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Import Pet</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Target Pet ID</Label><Input type="number" value={importId} onChange={e => setImportId(e.target.value)} placeholder="Enter pet ID" /></div>
            <div><Label>JSON Payload</Label><Textarea rows={6} value={importPayload} onChange={e => setImportPayload(e.target.value)} placeholder='{"format": "json", ...}' /></div>
            <Button onClick={() => importJsonMutation.mutate()} disabled={!importPayload || !importId || importJsonMutation.isPending}><Upload className="w-4 h-4 mr-2" />Import</Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent><pre className="text-xs overflow-x-auto bg-muted p-3 rounded">{JSON.stringify(result, null, 2)}</pre></CardContent>
        </Card>
      )}
    </div>
  );
}
