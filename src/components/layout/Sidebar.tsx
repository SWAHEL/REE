
import {
  LayoutDashboard,
  FileText,
  Gauge,
  Users,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Zap,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Relevés", href: "/readings", icon: FileText },
  { name: "Compteurs", href: "/meters", icon: Gauge },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Rapports", href: "/reports", icon: BarChart3 },
];

const adminNavigation = [{ name: "Utilisateurs", href: "/admin/users", icon: UserCog }];
const userNavigation = [{ name: "Changer mot de passe", href: "/change-password", icon: Key }];

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = user?.role === "SUPERADMIN";
  
  const currentPath = location.pathname;

  console.log("Sidebar - Current path:", currentPath);

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const Icon = item.icon;
    
    // Fix: Check for exact matches and startsWith for nested routes
    const isActive = currentPath === item.href || 
                    currentPath.startsWith(item.href + "/") ||
                    (item.href === "/dashboard" && currentPath === "/");

    return (
      <NavLink
        to={item.href}
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }
          event.preventDefault();
          console.log(`Sidebar NavItem clicked: ${item.href}`);
          navigate(item.href);
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
          "hover:bg-sidebar-accent hover:text-sidebar-foreground",
          "active:scale-95",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
            : "text-sidebar-foreground/70"
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
        {!collapsed && <span className="font-medium">{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-sidebar transition-all duration-300 flex flex-col pointer-events-auto",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => {
          console.log("Logo clicked");
          navigate("/dashboard");
        }}
        className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border w-full",
          "hover:bg-sidebar-accent transition-colors",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded bg-warning flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-warning-foreground" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">SI Relevés</h1>
          </div>
        )}
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 pointer-events-auto">
        <nav className="px-3 space-y-1 pointer-events-auto">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          {isSuperAdmin && (
            <>
              <div className={cn("pt-4 pb-2", !collapsed && "px-3")}>
                {!collapsed && (
                  <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                    Administration
                  </span>
                )}
                {collapsed && <div className="border-t border-sidebar-border" />}
              </div>
              {adminNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </>
          )}

          <div className={cn("pt-4 pb-2", !collapsed && "px-3")}>
            {!collapsed && (
              <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Mon compte
              </span>
            )}
            {collapsed && <div className="border-t border-sidebar-border" />}
          </div>

          {userNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* Toggle Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Réduire
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};
