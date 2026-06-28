import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navigation, Search, Plus } from "lucide-react";

export default function TransportBrowser() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["transport-networks", search],
    queryFn: async () => {
      const url = search ? `/api/transportation/search?q=${encodeURIComponent(search)}` : "/api/transportation";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const networks = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Navigation className="h-7 w-7 text-cyan-400" />Transport Browser</h1>
        <Link href="/transport-editor/new"><Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" />New Network</Button></Link>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search networks..." className="pl-10 bg-gray-800 border-gray-600 text-white" /></div>

      {isLoading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networks.map((n: any) => (
            <Card key={n.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><p className="text-white font-semibold">{n.name}</p><p className="text-gray-400 text-xs">{n.transportType} · v{n.version}</p></div>
                  <Badge variant={n.transportStatus === "active" ? "default" : "secondary"}>{n.transportStatus}</Badge>
                </div>
                {n.description && <p className="text-gray-400 text-sm line-clamp-2">{n.description}</p>}
                <div className="flex gap-2">
                  <Link href={`/transport-editor/${n.id}`}><Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">Edit</Button></Link>
                  <Link href={`/transport-simulator/${n.id}`}><Button size="sm" variant="outline">Simulate</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {networks.length === 0 && <p className="text-gray-400 col-span-3">No networks found.</p>}
        </div>
      )}
    </div>
  );
}
