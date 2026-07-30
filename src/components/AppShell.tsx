import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Scale, LayoutDashboard, Building2, Users, Inbox, Settings, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const links = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard, adminOnly: false },
  { to: "/empresas", label: "Empresas", icon: Building2, adminOnly: false },
  { to: "/advogados", label: "Advogados", icon: Users, adminOnly: false },
  { to: "/distribuicao", label: "Distribuição", icon: Inbox, adminOnly: true },
  { to: "/cadastros", label: "Cadastros", icon: Settings, adminOnly: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, nome } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-sidebar-primary" />
            <span className="font-serif text-base tracking-tight">Gestão Jurídica</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {links
              .filter((l) => !l.adminOnly || isAdmin)
              .map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent",
                    pathname.startsWith(l.to) && "bg-sidebar-accent font-medium",
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-sidebar-foreground/70 sm:block">
              {nome} {isAdmin ? "· Administrador" : "· Advogado"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={signOut}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
