import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Code2, CheckCircle2, XCircle, AlertTriangle, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options?.headers } });

interface Graph { id: number; name: string; type: string; }
interface ValidationError { type: "error" | "warning"; code: string; message: string; nodeId?: number; }
interface CompileResult { validation: { valid: boolean; errors: ValidationError[]; warnings: ValidationError[] }; result?: { checksum: string; compiledAt: string; instructions: unknown[] } }

export default function CompilerPanel() {
  const { toast } = useToast();
  const [selectedGraph, setSelectedGraph] = useState<string>("");
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);

  const { data: graphsData, isLoading } = useQuery<{ items: Graph[] }>({
    queryKey: ["/api/graphs"],
    queryFn: () => apiFetch("/api/graphs").then((r) => r.json()),
  });

  const compileMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/graphs/${id}/compile`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res: CompileResult) => {
      setCompileResult(res);
      if (res.validation.valid) toast({ title: "Compilation successful" });
      else toast({ title: "Compilation failed", description: `${res.validation.errors.length} errors`, variant: "destructive" });
    },
    onError: () => toast({ title: "Compile request failed", variant: "destructive" }),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/graphs/${id}/validate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res) => {
      setCompileResult({ validation: res });
      toast({ title: res.valid ? "Validation passed" : "Validation issues found" });
    },
    onError: () => toast({ title: "Validation failed", variant: "destructive" }),
  });

  const graphs = graphsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compiler Panel</h1>
        <p className="text-muted-foreground">Validate and compile graphs into runtime instructions.</p>
      </div>

      <div className="flex gap-3">
        <Select value={selectedGraph} onValueChange={setSelectedGraph}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={isLoading ? "Loading…" : "Select a graph"} />
          </SelectTrigger>
          <SelectContent>
            {graphs.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => selectedGraph && validateMutation.mutate(selectedGraph)} disabled={!selectedGraph || validateMutation.isPending}>
          {validateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
          Validate
        </Button>
        <Button onClick={() => selectedGraph && compileMutation.mutate(selectedGraph)} disabled={!selectedGraph || compileMutation.isPending}>
          {compileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Compile
        </Button>
      </div>

      {compileResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {compileResult.validation.valid
                  ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                  : <XCircle className="h-4 w-4 text-destructive" />}
                Validation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-sm">{compileResult.validation.errors.length} errors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-sm">{compileResult.validation.warnings.length} warnings</span>
                </div>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {compileResult.validation.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-xs">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <Badge variant="destructive" className="text-[9px] mb-1">{e.code}</Badge>
                        <p>{e.message}</p>
                      </div>
                    </div>
                  ))}
                  {compileResult.validation.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-yellow-400/10 text-xs">
                      <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-1">{w.code}</Badge>
                        <p>{w.message}</p>
                      </div>
                    </div>
                  ))}
                  {compileResult.validation.valid && compileResult.validation.warnings.length === 0 && (
                    <p className="text-xs text-green-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />All checks passed
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {compileResult.result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />Compiled Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div><p className="text-muted-foreground">Instructions</p><p className="font-mono font-bold">{(compileResult.result.instructions as unknown[]).length}</p></div>
                  <div><p className="text-muted-foreground">Checksum</p><p className="font-mono truncate">{compileResult.result.checksum}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground">Compiled at</p><p className="font-mono">{new Date(compileResult.result.compiledAt).toLocaleString()}</p></div>
                </div>
                <ScrollArea className="h-32 bg-black/30 rounded p-2">
                  <pre className="text-[10px] font-mono text-muted-foreground">{JSON.stringify(compileResult.result.instructions, null, 2)}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!compileResult && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <Code2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Select a graph and run Validate or Compile.</p>
        </div>
      )}
    </div>
  );
}
