import { Link, useLocation } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Image as ImageIcon, 
  LayoutTemplate, 
  Blocks, 
  PackageSearch, 
  Settings, 
  LogOut,
  Orbit,
  User,
  Building2,
  Mail,
  Bell,
  Activity,
  FileText,
  Folder,
  Bookmark,
  Layers,
  Upload,
  Cpu,
  Library,
  FolderOpen,
  GitBranch,
  Play,
  Code2,
  BookOpen,
  Terminal,
  Monitor,
  Server,
  Gauge,
  Zap,
  Bug,
  Camera,
  Component,
  Box,
  Radio,
  Globe,
  MapPin,
  Sun,
  Cloud,
  Navigation,
  BarChart2,
  Download,
  Users,
  Smile,
  MessageSquare,
  Shield,
  Swords,
  Scroll,
  CheckSquare,
  ShieldAlert,
  Package,
  Hammer,
  Dices,
  Grid3X3,
  Coins,
  ShieldOff,
  Palette,
  Wand2,
  Skull,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

function useUnreadCount() {
  return useQuery<{ unreadCount: number }>({
    queryKey: ["/api/notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/notifications?limit=1`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });
}

function usePendingInvites() {
  return useQuery<{ total: number }>({
    queryKey: ["/api/invitations", "pending-count"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/invitations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { total: 0 };
      const data = await res.json();
      const pending = (data.items ?? []).filter((i: { status: string }) => i.status === "pending").length;
      return { total: pending };
    },
    refetchInterval: 60000,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useAuthMe({
    query: { queryKey: ["/api/auth/me"], retry: false }
  });
  const { data: notifData } = useUnreadCount();
  const { data: inviteData } = usePendingInvites();

  const unread = notifData?.unreadCount ?? 0;
  const pendingInvites = inviteData?.total ?? 0;

  const handleLogout = () => {
    localStorage.removeItem("creator_token");
    setLocation("/login");
  };

  const navSections = [
    {
      label: "Studio",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Projects", icon: FolderGit2 },
        { href: "/assets", label: "Assets", icon: ImageIcon },
        { href: "/templates", label: "Templates", icon: LayoutTemplate },
        { href: "/plugins", label: "Plugins", icon: Blocks },
        { href: "/packages", label: "Packages", icon: PackageSearch },
      ],
    },
    {
      label: "World Editor",
      items: [
        { href: "/world-editor-dashboard", label: "World Editor", icon: Globe },
        { href: "/world-browser", label: "World Browser", icon: Library },
        { href: "/world-templates", label: "World Templates", icon: BookOpen },
      ],
    },
    {
      label: "NPC Editor",
      items: [
        { href: "/npc-dashboard", label: "NPC Dashboard", icon: Users },
        { href: "/npc-browser", label: "NPC Browser", icon: Smile },
        { href: "/npc-templates", label: "NPC Templates", icon: BookOpen },
        { href: "/npc-faction-manager", label: "Factions", icon: Shield },
        { href: "/npc-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Quest Editor",
      items: [
        { href: "/quest-dashboard", label: "Dashboard", icon: Scroll },
        { href: "/quest-browser", label: "Browser", icon: CheckSquare },
        { href: "/quest-templates", label: "Templates", icon: BookOpen },
        { href: "/quest-validator", label: "Validator", icon: ShieldAlert },
        { href: "/quest-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Item Editor",
      items: [
        { href: "/item-dashboard", label: "Dashboard", icon: Package },
        { href: "/item-browser", label: "Browser", icon: CheckSquare },
        { href: "/item-templates", label: "Templates", icon: BookOpen },
        { href: "/item-loot-tables", label: "Loot Tables", icon: Dices },
        { href: "/item-inventory", label: "Inventory", icon: Grid3X3 },
        { href: "/item-simulator", label: "Simulator", icon: Wand2 },
        { href: "/item-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Skill Editor",
      items: [
        { href: "/skill-dashboard", label: "Dashboard", icon: Zap },
        { href: "/skill-browser", label: "Browser", icon: Swords },
        { href: "/skill-templates", label: "Templates", icon: BookOpen },
        { href: "/skill-validator", label: "Validator", icon: ShieldAlert },
        { href: "/skill-simulator", label: "Simulator", icon: Play },
        { href: "/skill-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Combat Editor",
      items: [
        { href: "/combat-dashboard", label: "Dashboard", icon: Swords },
        { href: "/combat-browser", label: "Browser", icon: Shield },
        { href: "/combat-templates", label: "Templates", icon: BookOpen },
        { href: "/combat-validator", label: "Validator", icon: ShieldAlert },
        { href: "/combat-simulator", label: "Simulator", icon: Play },
        { href: "/combat-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Pet Editor",
      items: [
        { href: "/pet-dashboard", label: "Dashboard", icon: Layers },
        { href: "/pet-browser", label: "Browser", icon: Globe },
        { href: "/pet-templates", label: "Templates", icon: BookOpen },
        { href: "/pet-simulator", label: "Simulator", icon: Play },
        { href: "/pet-validator", label: "Validator", icon: ShieldAlert },
        { href: "/pet-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Dungeon Editor",
      items: [
        { href: "/dungeon-dashboard", label: "Dashboard", icon: Layers },
        { href: "/dungeon-browser", label: "Browser", icon: Globe },
        { href: "/dungeon-templates", label: "Templates", icon: BookOpen },
        { href: "/dungeon-simulator", label: "Simulator", icon: Play },
        { href: "/dungeon-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Boss Editor",
      items: [
        { href: "/boss-dashboard", label: "Dashboard", icon: Skull },
        { href: "/boss-browser", label: "Browser", icon: Swords },
        { href: "/boss-templates", label: "Templates", icon: BookOpen },
        { href: "/boss-simulator", label: "Simulator", icon: Play },
        { href: "/boss-validator", label: "Validator", icon: ShieldAlert },
        { href: "/boss-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "City Editor",
      items: [
        { href: "/city-dashboard", label: "Dashboard", icon: Building2 },
        { href: "/city-browser", label: "Browser", icon: Globe },
        { href: "/city-templates", label: "Templates", icon: BookOpen },
        { href: "/city-simulator", label: "Simulator", icon: Play },
        { href: "/city-statistics", label: "Statistics", icon: BarChart2 },
        { href: "/city-validator", label: "Validator", icon: ShieldAlert },
        { href: "/city-import-export", label: "Import / Export", icon: Download },
      ],
    },
    {
      label: "Visual Scripting",
      items: [
        { href: "/visual-scripting", label: "Visual Scripting", icon: GitBranch },
        { href: "/graph-browser", label: "Graph Browser", icon: Library },
        { href: "/graph-templates", label: "Graph Templates", icon: BookOpen },
        { href: "/macro-library", label: "Macro Library", icon: Code2 },
        { href: "/execution-console", label: "Execution Console", icon: Terminal },
        { href: "/compiler-panel", label: "Compiler", icon: Play },
        { href: "/runtime-monitor", label: "Runtime Monitor", icon: Monitor },
      ],
    },
    {
      label: "Runtime",
      items: [
        { href: "/runtime", label: "Runtime Engine", icon: Server },
        { href: "/simulation-center", label: "Simulation", icon: Radio },
      ],
    },
    {
      label: "Documents",
      items: [
        { href: "/documents", label: "All Documents", icon: FileText },
        { href: "/folders", label: "Folders", icon: Folder },
        { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      ],
    },
    {
      label: "Assets",
      items: [
        { href: "/asset-pipeline", label: "Asset Pipeline", icon: Layers },
        { href: "/asset-browser", label: "Browser", icon: Library },
        { href: "/upload-center", label: "Upload Center", icon: Upload },
        { href: "/asset-collections", label: "Collections", icon: ImageIcon },
        { href: "/asset-folders", label: "Asset Folders", icon: FolderOpen },
        { href: "/processing-queue", label: "Processing", icon: Cpu },
      ],
    },
    {
      label: "Identity",
      items: [
        { href: "/profile", label: "Profile", icon: User },
        { href: "/organizations", label: "Organizations", icon: Building2 },
        { href: "/invitations", label: "Invitations", icon: Mail, badge: pendingInvites },
      ],
    },
    {
      label: "Feed",
      items: [
        { href: "/activity", label: "Activity", icon: Activity },
        { href: "/notifications", label: "Notifications", icon: Bell, badge: unread },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col justify-between hidden md:flex shrink-0">
        <div className="overflow-y-auto">
          <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
            <Orbit className="w-6 h-6 text-primary mr-3" />
            <h1 className="font-bold text-lg tracking-tight">Universe Creator</h1>
          </div>
          <nav className="p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 mb-2">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.startsWith(item.href);
                    const Icon = item.icon;
                    const badge = "badge" in item ? item.badge : 0;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button 
                          variant={isActive ? "secondary" : "ghost"} 
                          className={`w-full justify-start ${isActive ? "bg-secondary/50 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Icon className="w-4 h-4 mr-3 shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {badge !== undefined && badge > 0 && (
                            <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground rounded-full">
                              {badge > 9 ? "9+" : badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 mb-2">
                Config
              </p>
              <Link href="/settings">
                <Button
                  variant={location.startsWith("/settings") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${location.startsWith("/settings") ? "bg-secondary/50 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Settings className="w-4 h-4 mr-3" />Settings
                </Button>
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="p-4 border-t border-border shrink-0">
          <Link href="/profile">
            <div className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9 bg-primary/20 text-primary">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : (
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{user?.displayName || user?.username || "Creator"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email || "Studio Mode"}</span>
              </div>
            </div>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        <div className="md:hidden h-16 border-b border-border flex items-center px-4 shrink-0 bg-sidebar/50 backdrop-blur">
          <Orbit className="w-5 h-5 text-primary mr-2" />
          <h1 className="font-bold text-base">Universe Creator</h1>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
