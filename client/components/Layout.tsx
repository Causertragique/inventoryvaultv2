import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ShoppingBag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usei18n } from "@/contexts/I18nContext";
import { signOutUser } from "@/services/auth";
import { toast } from "@/components/ui/use-toast";

type LayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

function useActivePath(pathname: string) {
  return useMemo(() => {
    return (target: string) => {
      if (target === "/") {
        return pathname === "/";
      }
      if (pathname === target) return true;
      return pathname.startsWith(`${target}/`);
    };
  }, [pathname]);
}

function NavLinks({
  items,
  variant,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  variant: "desktop" | "mobile";
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = useActivePath(location.pathname);

  return (
    <nav
      className={cn(
        "gap-1",
        variant === "desktop" ? "hidden md:flex" : "flex flex-col p-2",
        collapsed && "items-center"
      )}
    >
      {items.map((item) => {
        const ItemIcon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground",
              variant === "desktop" ? (collapsed ? "justify-center px-2" : "gap-2 px-3") : "gap-2 px-4",
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <ItemIcon className="h-4 w-4" />
            {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { t } = usei18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = t.Layout.appName;
  }, [t.Layout.appName]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: t.Layout.nav.inventory, path: "/inventory", icon: Boxes },
      { label: t.Layout.nav.sales, path: "/sales", icon: ShoppingBag },
      { label: t.Layout.nav.analytics, path: "/analytics", icon: BarChart3 },
      { label: t.Layout.nav.settings, path: "/settings", icon: Settings },
    ],
    [t.Layout.nav],
  );
  const location = useLocation();
  const isActive = useActivePath(location.pathname);

  const userLabel = user?.displayName || user?.email || "Compte";

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: "D\u00e9connexion r\u00e9ussie",
        description: "Vous avez \u00e9t\u00e9 d\u00e9connect\u00e9.",
      });
      navigate("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur inattendue lors de la d\u00e9connexion.";
      toast({
        title: "Impossible de se d\u00e9connecter",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 md:flex">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-200",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className={cn("flex items-center gap-2", isSidebarCollapsed && "justify-center flex-1")}>
            <img src="/tonneau.png" alt={`${t.Layout.appName} logo`} className="h-8 w-8" />
            {!isSidebarCollapsed && (
              <p className="text-base font-semibold">{t.Layout.appName}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label={
              isSidebarCollapsed
                ? "D\u00e9plier la navigation"
                : "R\u00e9duire la navigation"
            }
            className={cn("ml-2", isSidebarCollapsed && "ml-0")}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 p-2">
          <NavLinks variant="desktop" items={navItems} collapsed={isSidebarCollapsed} />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <Link
              to="/inventory"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground md:hidden"
            >
              <img src="/tonneau.png" alt={`${t.Layout.appName} logo`} className="h-8 w-8" />
              {t.Layout.appName}
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-foreground">
                  {userLabel}
                </p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">D\u00e9connexion</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] flex-1 pb-20 px-4 py-6 sm:px-6 lg:px-10">
          {children}
        </main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background shadow-inner backdrop-blur z-50">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <ItemIcon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
