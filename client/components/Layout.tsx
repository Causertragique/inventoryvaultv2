import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Boxes,
  ShoppingBag,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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

const NAV_ITEMS: NavItem[] = [
  { label: "Inventaire", path: "/inventory", icon: Boxes },
  { label: "Ventes", path: "/sales", icon: ShoppingBag },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Paramètres", path: "/settings", icon: Settings },
  { label: "Audit logs", path: "/audit-logs", icon: ShieldCheck },
  { label: "Utilisateurs", path: "/users", icon: Users },
];

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
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = useActivePath(location.pathname);

  return (
    <nav
      className={cn(
        "gap-1",
        variant === "desktop" ? "hidden md:flex" : "flex flex-col p-2"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted hover:text-foreground",
              variant === "desktop" ? "" : "px-4",
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <ItemIcon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const userLabel = user?.displayName || user?.email || "Compte";

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
      navigate("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur inattendue lors de la déconnexion.";
      toast({
        title: "Impossible de se déconnecter",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-10">
          <div className="flex flex-1 items-center gap-3">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Ouvrir la navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="border-b p-4">
                  <p className="text-base font-semibold">InventoryVault</p>
                  <p className="text-xs text-muted-foreground">{userLabel}</p>
                </div>
                <NavLinks
                  variant="mobile"
                  onNavigate={() => setMobileNavOpen(false)}
                />
                <div className="border-t p-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Link
              to="/inventory"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              InventoryVault
            </Link>
            <NavLinks variant="desktop" />
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
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
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
