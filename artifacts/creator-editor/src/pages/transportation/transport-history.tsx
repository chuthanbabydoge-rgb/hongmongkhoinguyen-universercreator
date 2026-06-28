import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export default function TransportHistory() {
  const { id: networkId } = useParams();
  const { data } = useQuery({ queryKey: ["transport-history", networkId], queryFn: async () => { const res = await fetch(`/api/transportation/${networkId}/history`); return res.json(); } });
  const history = data?.data ?? [];

  const actionColor: Record<string, string> = { create: "bg-green-500", update: "bg-blue-500", delete: "bg-red-500", publish: "bg-purple-500", archive: "bg-yellow-500", restore: "bg-teal-500", duplicate: "bg-orange-500", fork: "bg-pink-500" };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><History className="h-7 w-7 text-cyan-400" />Network History — #{networkId}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader><CardTitle className="text-white">Activity Log ({history.length})</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? <p className="text-gray-400">No history recorded yet.</p> : (
            <div className="space-y-2">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                  <div className={`w-2 h-2 rounded-full ${actionColor[h.action] ?? "bg-gray-400"}`} />
                  <div className="flex-1">
                    <span className="text-white text-sm">{h.action.charAt(0).toUpperCase() + h.action.slice(1)} on {h.entityType}</span>
                    {h.entityId && <span className="text-gray-400 text-xs ml-2">#{h.entityId}</span>}
                  </div>
                  <span className="text-gray-400 text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
