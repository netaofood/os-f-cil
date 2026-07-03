import { type ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const { data: usuario, isLoading } = useCurrentUsuario();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/auth";
        return;
      }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (isLoading || checking) return;
    if (!usuario) return;
    if (!usuario.empresa_id && usuario.perfil !== "super_admin") {
      window.location.href = "/setup";
    }
  }, [isLoading, checking, usuario]);

  if (checking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 sticky top-0 bg-background z-10">
            <SidebarTrigger />
            <h1 className="font-semibold text-foreground truncate">{title}</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

