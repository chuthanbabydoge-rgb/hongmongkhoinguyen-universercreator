import { useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

export default function LandImportExport() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: exports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/exports`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/exports`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: imports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/lands/${landId}/imports`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/imports`, { headers: auth() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const exportMut = (format: string) => useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/export/${format}`, { method: "POST", headers: auth() });
      if (!res.ok) throw new Error("Export failed");
      return res.json();
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: [`/api/lands/${landId}/exports`] }); toast({ title: `Exported as ${format}`, description: `Checksum: ${String(d.checksum).slice(0, 16)}…` }); },
    onError: () => toast({ title: "Export failed", variant: "destructive" }),
  });

  const jsonMut = exportMut("json");
  const tplMut = exportMut("template");
  const pkgMut = exportMut("package");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Download className="w-6 h-6 text-emerald-500" /> Import / Export</h1>

      <Card><CardHeader><CardTitle>Export Land</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => jsonMut.mutate()} disabled={jsonMut.isPending}><Download className="w-4 h-4 mr-2" />JSON</Button>
          <Button variant="outline" onClick={() => tplMut.mutate()} disabled={tplMut.isPending}><Download className="w-4 h-4 mr-2" />Template</Button>
          <Button variant="outline" onClick={() => pkgMut.mutate()} disabled={pkgMut.isPending}><Download className="w-4 h-4 mr-2" />Package</Button>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Export History ({exports.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {exports.length === 0 ? <div className="text-muted-foreground text-sm">No exports yet.</div>
            : exports.map((e) => (
              <div key={String(e.id)} className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{String(e.format)}</Badge>
                <span className="text-muted-foreground font-mono text-xs">{String(e.checksum ?? "").slice(0, 16)}…</span>
                <span className="text-muted-foreground">{new Date(String(e.createdAt)).toLocaleDateString()}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Import History ({imports.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {imports.length === 0 ? <div className="text-muted-foreground text-sm">No imports yet.</div>
            : imports.map((i) => (
              <div key={String(i.id)} className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{String(i.format)}</Badge>
                <Badge variant={i.status === "completed" ? "default" : i.status === "failed" ? "destructive" : "secondary"}>{String(i.status)}</Badge>
                <span className="text-muted-foreground">{new Date(String(i.createdAt)).toLocaleDateString()}</span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
