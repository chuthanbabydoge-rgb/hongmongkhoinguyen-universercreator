import { useState } from "react";
import { 
  useListPlugins, 
  getListPluginsQueryKey,
} from "@workspace/api-client-react";
import { 
  Blocks, Search, CheckCircle2, PowerOff
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function Plugins() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pluginsData, isLoading } = useListPlugins(
    {}, 
    { query: { queryKey: getListPluginsQueryKey({}) } }
  );

  const filteredPlugins = pluginsData?.items.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col justify-between items-start gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Studio Plugins</h1>
        <p className="text-muted-foreground mt-1">Extend the capabilities of your Universe Creator IDE</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search plugins..." 
          className="pl-9 max-w-md bg-card border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filteredPlugins?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <Blocks className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No plugins found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlugins?.map(plugin => (
            <Card key={plugin.id} className="bg-card/50 border-border overflow-hidden transition-colors hover:bg-card/80">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4">
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Blocks className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold truncate">{plugin.name}</h3>
                      <Badge variant="outline" className="font-mono text-[10px]">v{plugin.version}</Badge>
                      {plugin.isEnabled && (
                        <Badge variant="default" className="bg-chart-5 text-white hover:bg-chart-5 h-5 px-1.5">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plugin.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3 mt-4 sm:mt-0 ml-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {plugin.isEnabled ? "Enabled" : "Disabled"}
                      <Switch checked={plugin.isEnabled} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
