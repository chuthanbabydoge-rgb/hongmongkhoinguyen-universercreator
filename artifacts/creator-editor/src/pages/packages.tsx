import { useState } from "react";
import { 
  useListPackages, 
  getListPackagesQueryKey,
} from "@workspace/api-client-react";
import { 
  PackageSearch, Search, Download, Box
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Packages() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: packagesData, isLoading } = useListPackages(
    {}, 
    { query: { queryKey: getListPackagesQueryKey({}) } }
  );

  const filteredPackages = packagesData?.items.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between items-start gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
        <p className="text-muted-foreground mt-1">Exported universe modules ready for game engines</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search packages..." 
          className="pl-9 max-w-md bg-card border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : filteredPackages?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <PackageSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No packages found</h3>
          <p className="text-muted-foreground">Publish a project to generate a package.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages?.map(pkg => (
            <Card key={pkg.id} className="group bg-card/50 hover:bg-card border-border overflow-hidden flex flex-col relative">
              <CardHeader className="pb-3 flex flex-row items-start gap-4">
                <div className="w-10 h-10 rounded bg-chart-4/10 flex items-center justify-center shrink-0 border border-chart-4/20">
                  <Box className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px] mt-1">v{pkg.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pkg.description || "Generated universe package export."}
                </p>
                <div className="mt-4 text-xs font-mono text-muted-foreground">
                  Project ID: {pkg.projectId}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="secondary" className="w-full" asChild disabled={!pkg.downloadUrl}>
                  {pkg.downloadUrl ? (
                    <a href={pkg.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download Package
                    </a>
                  ) : (
                    <span>Processing...</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
