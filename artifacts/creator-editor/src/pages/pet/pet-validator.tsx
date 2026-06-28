import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function PetValidator() {
  const { toast } = useToast();
  const [petId, setPetId] = useState("");
  const [result, setResult] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);

  const validateMutation = useMutation({
    mutationFn: () => apiFetch(`/api/pets/${petId}/validate`).then(r => r.json()),
    onSuccess: (d) => { setResult(d); toast({ title: d.valid ? "Validation passed" : "Validation failed", variant: d.valid ? "default" : "destructive" }); },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Pet Validator</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Validate Pet Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Pet ID</Label><Input type="number" value={petId} onChange={e => setPetId(e.target.value)} placeholder="Enter pet ID to validate" /></div>
          <Button onClick={() => validateMutation.mutate()} disabled={!petId || validateMutation.isPending}>
            <Shield className="w-4 h-4 mr-2" />Run Validation
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.valid
                ? <><CheckCircle className="w-5 h-5 text-green-500" />Valid</>
                : <><XCircle className="w-5 h-5 text-destructive" />Invalid</>}
              <Badge variant={result.valid ? "default" : "destructive"}>{result.errors.length} errors · {result.warnings.length} warnings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.errors.length > 0 && (
              <div>
                <p className="font-medium text-destructive mb-2 flex items-center gap-1"><XCircle className="w-4 h-4" />Errors</p>
                <ul className="space-y-1">{result.errors.map((e, i) => <li key={i} className="text-sm text-destructive bg-destructive/10 p-2 rounded">{e}</li>)}</ul>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <p className="font-medium text-yellow-600 mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Warnings</p>
                <ul className="space-y-1">{result.warnings.map((w, i) => <li key={i} className="text-sm text-yellow-700 bg-yellow-50 dark:bg-yellow-950 p-2 rounded">{w}</li>)}</ul>
              </div>
            )}
            {result.valid && result.warnings.length === 0 && (
              <p className="text-green-600 text-sm">✓ All checks passed — pet configuration is valid</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
