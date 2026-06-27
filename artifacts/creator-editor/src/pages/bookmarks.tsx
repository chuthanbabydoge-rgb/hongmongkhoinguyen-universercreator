import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkMinus, Bookmark, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const TYPE_EMOJIS: Record<string, string> = {
  world: "🌍", npc: "👤", quest: "📜", boss: "🐉", dungeon: "🏰",
  item: "⚔️", skill: "✨", pet: "🐾", mount: "🐴", dialogue: "💬",
  company: "🏢", course: "📚", tournament: "🏆", city: "🏙️", building: "🏗️",
  education: "🎓", sports: "⚽", land: "🗺️", nation: "🚩",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  review: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  published: "bg-green-500/20 text-green-400",
  archived: "bg-muted text-muted-foreground",
};

interface BookmarkedDoc {
  id: number;
  type: string;
  name: string;
  description: string | null;
  status: string;
  version: number;
  tags: string[];
  updatedAt: string;
  bookmarkedAt: string;
}

export default function Bookmarks() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: BookmarkedDoc[] }>({
    queryKey: ["/api/documents/bookmarks/me"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/bookmarks/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/${id}/bookmark`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents/bookmarks/me"] });
      toast({ title: "Bookmark removed" });
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">
          {data?.items.length ?? 0} bookmarked documents
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-1">No bookmarks yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Bookmark documents to access them quickly
          </p>
          <Link href="/documents">
            <Button>
              <FileText className="w-4 h-4 mr-2" />Browse Documents
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((doc) => (
            <Card key={doc.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      {TYPE_EMOJIS[doc.type] ?? "📄"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/documents/${doc.id}`}>
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors truncate cursor-pointer">
                          {doc.name}
                        </h3>
                      </Link>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${STATUS_COLORS[doc.status]}`}
                        >
                          {doc.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{doc.type}</span>
                        <span className="text-xs text-muted-foreground font-mono">v{doc.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Bookmarked</p>
                      <p className="text-xs font-mono">
                        {format(new Date(doc.bookmarkedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeMutation.mutate(doc.id)}
                    >
                      <BookmarkMinus className="w-4 h-4" />
                    </Button>
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
