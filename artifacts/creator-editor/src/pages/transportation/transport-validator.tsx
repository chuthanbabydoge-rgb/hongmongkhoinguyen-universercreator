import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function TransportValidator() {
  const { id: networkId } = useParams();
  const { toast } = useToast();
  const [result, setResult] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);

  const validate = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/transportation/${networkId}/validate`, { method: "POST" });
      if (!res.ok) throw new Error("Validation failed");
      return res.json();
    },
    onSuccess: (d) => { setResult(d.data); toast({ title: d.data.valid ? "Validation passed" : "Validation issues found" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldAlert className="h-7 w-7 text-yellow-400" />Transport Validator — Network #{networkId}</h1>
        <Button onClick={() => validate.mutate()} disabled={validate.isPending} className="bg-yellow-600 hover:bg-yellow-700"><ShieldAlert className="h-4 w-4 mr-2" />{validate.isPending ? "Validating..." : "Run Validation"}</Button>
      </div>

      {result && (
        <div className="space-y-4">
          <Card className={`border ${result.valid ? "bg-green-900/30 border-green-700" : "bg-red-900/30 border-red-700"}`}>
            <CardContent className="pt-4 flex items-center gap-3">
              {result.valid ? <CheckCircle className="h-8 w-8 text-green-400" /> : <XCircle className="h-8 w-8 text-red-400" />}
              <div>
                <p className="text-white font-bold text-lg">{result.valid ? "Network is valid" : "Validation failed"}</p>
                <p className="text-gray-400 text-sm">{result.errors.length} error(s) · {result.warnings.length} warning(s)</p>
              </div>
            </CardContent>
          </Card>

          {result.errors.length > 0 && (
            <Card className="bg-gray-800 border-red-700">
              <CardHeader><CardTitle className="text-red-400 flex items-center gap-2"><XCircle className="h-5 w-5" />Errors</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{result.errors.map((e, i) => <div key={i} className="flex items-start gap-2 p-2 bg-red-900/20 rounded"><XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" /><span className="text-red-300 text-sm">{e}</span></div>)}</div></CardContent>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card className="bg-gray-800 border-yellow-700">
              <CardHeader><CardTitle className="text-yellow-400 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Warnings</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{result.warnings.map((w, i) => <div key={i} className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded"><AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" /><span className="text-yellow-300 text-sm">{w}</span></div>)}</div></CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-8 pb-8 text-center">
            <ShieldAlert className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Click "Run Validation" to check for disconnected roads, invalid routes, orphan stations, and more.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
