import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BuildingValidatorPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ valid: boolean; errors: string[]; warnings: string[] }>({
    queryKey: [`/api/buildings/${id}/validate`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/buildings/${id}/validate`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id && run,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ShieldAlert className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Building Validator</h1></div>
        <Button onClick={() => { setRun(true); refetch(); }} disabled={isLoading}>Run Validation</Button>
      </div>

      {isLoading && <div className="text-muted-foreground">Running validation...</div>}

      {data && (
        <div className="space-y-4">
          <Card className={data.valid ? "border-green-500" : "border-destructive"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {data.valid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                {data.valid ? "Building is Valid" : "Validation Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div><span className="font-medium text-destructive">{data.errors.length}</span> error(s)</div>
                <div><span className="font-medium text-yellow-500">{data.warnings.length}</span> warning(s)</div>
              </div>
            </CardContent>
          </Card>

          {data.errors.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><XCircle className="w-4 h-4" />Errors</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm">
                    <Badge variant="destructive" className="text-xs mt-0.5">Error</Badge>
                    <span>{e}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {data.warnings.length > 0 && (
            <Card className="border-yellow-500/50">
              <CardHeader><CardTitle className="text-yellow-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded text-sm">
                    <Badge variant="outline" className="text-xs mt-0.5 border-yellow-500 text-yellow-600">Warn</Badge>
                    <span>{w}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!run && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Click "Run Validation" to check your building for errors and warnings.</CardContent></Card>
      )}
    </div>
  );
}
