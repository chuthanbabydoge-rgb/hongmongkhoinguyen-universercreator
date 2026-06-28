import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

export default function TransportImportExport() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const [format, setFormat] = useState<"json" | "template" | "package">("json");
  const [importPayload, setImportPayload] = useState("");
  const [exportResult, setExportResult] = useState("");

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format, exportedBy: 1 }) });
      if (!res.ok) throw new Error("Export failed");
      return res.json();
    },
    onSuccess: (d) => { setExportResult(JSON.stringify(d.data?.data ?? d.data, null, 2)); toast({ title: "Export complete", description: `Checksum: ${d.data?.checksum?.slice(0, 8)}...` }); },
    onError: (e: any) => toast({ title: "Export failed", description: e.message, variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const payload = JSON.parse(importPayload);
      const res = await fetch("/api/transportation/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, importedBy: 1 }) });
      if (!res.ok) throw new Error("Import failed");
      return res.json();
    },
    onSuccess: (d) => { toast({ title: "Import complete", description: `Network #${d.data?.networkId} created. Errors: ${d.data?.errors?.length ?? 0}` }); setImportPayload(""); },
    onError: (e: any) => toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Download className="h-7 w-7 text-cyan-400" />Import / Export — Network #{networkId}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Download className="h-5 w-5" />Export</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-gray-300 text-sm">Format</label><Select value={format} onValueChange={v => setFormat(v as any)}><SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="template">Template</SelectItem><SelectItem value="package">Package</SelectItem></SelectContent></Select></div>
            <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 w-full"><Download className="h-4 w-4 mr-2" />Export Network</Button>
            {exportResult && <Textarea value={exportResult} readOnly className="bg-gray-900 border-gray-600 text-gray-300 text-xs font-mono h-48" />}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Upload className="h-5 w-5" />Import</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-gray-300 text-sm">Paste export JSON</label><Textarea value={importPayload} onChange={e => setImportPayload(e.target.value)} className="bg-gray-700 border-gray-600 text-white mt-1 h-48 font-mono text-xs" placeholder='{"network": {...}, "roads": [...]}' /></div>
            <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending || !importPayload} className="bg-green-600 hover:bg-green-700 w-full"><Upload className="h-4 w-4 mr-2" />Import Network</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
