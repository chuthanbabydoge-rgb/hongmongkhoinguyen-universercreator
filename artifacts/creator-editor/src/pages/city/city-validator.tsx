import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: Record<string, number>;
}

export default function CityValidatorPage() {
  const { toast } = useToast();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const { data: citiesData } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load cities");
      return res.json();
    },
  });

  const validateMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/validate`, { headers: headers() });
      if (!res.ok) throw new Error("Validation failed");
      return res.json() as Promise<ValidationResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.valid) toast({ title: "Validation passed!" });
      else toast({ title: `Validation failed — ${data.errors.length} error(s)`, variant: "destructive" });
    },
    onError: () => toast({ title: "Error", description: "Validation request failed", variant: "destructive" }),
  });

  const cities = citiesData?.items ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-blue-500" /> City Validator</h1>

      <Card>
        <CardHeader><CardTitle>Select City to Validate</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <select className="flex-1 border rounded px-3 py-2 text-sm bg-background" value={selectedCityId ?? ""} onChange={(e) => { setSelectedCityId(Number(e.target.value)); setResult(null); }}>
            <option value="">-- Select a city --</option>
            {cities.map((c: Record<string, unknown>) => (
              <option key={String(c.id)} value={String(c.id)}>{String(c.name)} ({String(c.cityType).replace(/_/g, " ")})</option>
            ))}
          </select>
          <Button onClick={() => validateMut.mutate()} disabled={validateMut.isPending || !selectedCityId}><ShieldAlert className="w-4 h-4 mr-2" />Validate</Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className={result.valid ? "border-green-500" : "border-red-500"}>
            <CardContent className="py-4 flex items-center gap-3">
              {result.valid ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
              <div>
                <div className="text-lg font-bold">{result.valid ? "Validation Passed" : "Validation Failed"}</div>
                <div className="text-sm text-muted-foreground">{result.errors.length} error(s) · {result.warnings.length} warning(s)</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(result.summary).map(([key, val]) => (
              <Card key={key}>
                <CardContent className="py-3 text-center">
                  <div className="text-2xl font-bold">{val}</div>
                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.errors.length > 0 && (
            <Card className="border-red-400">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-500"><XCircle className="w-4 h-4" />Errors ({result.errors.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{e}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card className="border-yellow-400">
              <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-500"><AlertTriangle className="w-4 h-4" />Warnings ({result.warnings.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.valid && result.warnings.length === 0 && (
            <Card className="border-green-500">
              <CardContent className="py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-green-600">City is fully valid — no issues found!</div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
