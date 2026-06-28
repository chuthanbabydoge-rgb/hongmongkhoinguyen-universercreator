import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const auth = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

type ValidationResult = { valid: boolean; errors: string[]; warnings: string[]; stats: Record<string, number> };

export default function LandValidatorPage() {
  const { id } = useParams<{ id: string }>();
  const landId = Number(id);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/lands/${landId}/validate`, { method: "POST", headers: auth() });
      if (!res.ok) throw new Error("Validation failed");
      return res.json() as Promise<ValidationResult>;
    },
    onSuccess: (d) => setResult(d),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-emerald-500" /> Land Validator</h1>
        <Button onClick={() => validateMut.mutate()} disabled={validateMut.isPending}>
          {validateMut.isPending ? "Validating…" : "Run Validation"}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <Card className={result.valid ? "border-green-500" : "border-destructive"}>
            <CardHeader><CardTitle className="flex items-center gap-2">
              {result.valid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
              {result.valid ? "Validation Passed" : "Validation Failed"}
            </CardTitle></CardHeader>
            <CardContent>
              {result.stats && <div className="grid grid-cols-3 gap-3 mb-4">{Object.entries(result.stats).map(([k, v]) => (<div key={k} className="text-center"><div className="text-lg font-bold">{v}</div><div className="text-xs text-muted-foreground capitalize">{k}</div></div>))}</div>}
            </CardContent>
          </Card>

          {result.errors.length > 0 && <Card className="border-destructive"><CardHeader><CardTitle className="text-destructive flex items-center gap-2"><XCircle className="w-4 h-4" />Errors ({result.errors.length})</CardTitle></CardHeader>
            <CardContent className="space-y-1">{result.errors.map((e, i) => <div key={i} className="text-sm text-destructive flex items-start gap-2"><XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{e}</div>)}</CardContent>
          </Card>}

          {result.warnings.length > 0 && <Card className="border-yellow-500"><CardHeader><CardTitle className="text-yellow-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings ({result.warnings.length})</CardTitle></CardHeader>
            <CardContent className="space-y-1">{result.warnings.map((w, i) => <div key={i} className="text-sm text-yellow-600 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{w}</div>)}</CardContent>
          </Card>}
        </div>
      )}

      {!result && !validateMut.isPending && <Card><CardContent className="py-10 text-center text-muted-foreground">Click "Run Validation" to check this land for errors.</CardContent></Card>}
    </div>
  );
}
