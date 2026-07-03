import { type ReactNode } from "react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { data: usuario, isLoading } = useCurrentUsuario();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    window.location.href = "/auth";
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!usuario || usuario.perfil !== "super_admin") {
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between border-b border-border px-4 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {usuario.nome} · Super Admin
          </span>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
