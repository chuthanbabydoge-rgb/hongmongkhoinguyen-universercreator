import { useAuthMe } from "@workspace/api-client-react";
import { format } from "date-fns";
import { User, Mail, Calendar, Settings as SettingsIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { data: user, isLoading } = useAuthMe({
    query: {
      queryKey: ["/api/auth/me"],
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your creator profile and preferences</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Creator Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-24 h-24 bg-primary/10 border-2 border-primary/20 text-primary text-2xl">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.username} />
              ) : (
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user.displayName || user.username}</h2>
              <p className="text-muted-foreground font-mono">@{user.username}</p>
              
              {user.bio && (
                <p className="mt-2 text-sm text-foreground max-w-md">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <Mail className="w-4 h-4 mr-2" /> Email Address
              </div>
              <p className="font-mono text-sm">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <Calendar className="w-4 h-4 mr-2" /> Member Since
              </div>
              <p className="font-mono text-sm">{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <SettingsIcon className="w-4 h-4 mr-2" /> Account ID
              </div>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground mt-8">
        Universe Creator Platform v0.1.0-alpha
      </div>
    </div>
  );
}
