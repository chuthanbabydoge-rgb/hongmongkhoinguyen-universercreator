import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Globe, MapPin, Star, Shield } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Profile() {
  const { data: user, refetch } = useAuthMe({ query: { queryKey: ["/api/auth/me"], retry: false } });
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      bio: user?.bio ?? "",
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("creator_token");
      const res = await fetch(`${BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      await refetch();
      toast({ title: "Profile updated", description: "Your changes were saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your creator identity</p>
      </div>

      <div className="flex items-center gap-6 p-6 rounded-xl border border-border/50 bg-card/50">
        <Avatar className="h-20 w-20">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} />
          ) : (
            <AvatarFallback className="text-2xl bg-primary/20 text-primary">
              {user?.username?.substring(0, 2).toUpperCase() ?? "CR"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1">
          <div className="text-xl font-bold">{user?.displayName || user?.username}</div>
          <div className="text-muted-foreground text-sm">{user?.email}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs"><Shield className="w-3 h-3 mr-1" />Level 1</Badge>
            <Badge variant="outline" className="text-xs"><Star className="w-3 h-3 mr-1" />0 rep</Badge>
          </div>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" />Edit Profile</CardTitle>
          <CardDescription>Update your public creator profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input {...form.register("displayName")} placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input {...form.register("username")} placeholder="handle" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea {...form.register("bio")} placeholder="Tell the world about yourself..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Globe className="w-3 h-3" />Website</Label>
                <Input {...form.register("website")} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" />Location</Label>
                <Input {...form.register("location")} placeholder="City, Country" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input {...form.register("avatar")} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
