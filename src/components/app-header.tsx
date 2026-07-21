import { Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentEmpresa, useCurrentUsuario } from "@/hooks/use-current-user";
import { ManualUsuario } from "@/components/manual-usuario";

interface Props {
  onToggleTheme: () => void;
  isDark: boolean;
}

export function AppHeader({ onToggleTheme, isDark }: Props) {
  const { data: usuario } = useCurrentUsuario();
  const { data: empresa } = useCurrentEmpresa(usuario?.empresa_id);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('perfil');
    toast.success("Até logo!");
    window.location.href = "/auth";
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="OS Fácil" className="h-8 w-8 object-contain" />
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
            OS Fácil
          </p>
          {empresa?.nome && (
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              {empresa.nome}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ManualUsuario />
        <Button size="icon" variant="ghost" onClick={onToggleTheme} className="h-8 w-8">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={handleLogout} className="h-8 w-8 text-muted-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
