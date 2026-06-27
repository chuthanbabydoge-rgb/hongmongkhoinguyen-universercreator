import { Link, useLocation } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Image as ImageIcon, 
  LayoutTemplate, 
  Blocks, 
  PackageSearch, 
  Settings, 
  LogOut,
  Orbit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useAuthMe({
    query: {
      queryKey: ["/api/auth/me"],
      retry: false
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("creator_token");
    setLocation("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    { href: "/assets", label: "Assets", icon: ImageIcon },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/plugins", label: "Plugins", icon: Blocks },
    { href: "/packages", label: "Packages", icon: PackageSearch },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Orbit className="w-6 h-6 text-primary mr-3" />
            <h1 className="font-bold text-lg tracking-tight">Universe Creator</h1>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    className={`w-full justify-start ${isActive ? "bg-secondary/50 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
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
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        {/* Mobile Header */}
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
