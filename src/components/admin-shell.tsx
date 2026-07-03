import { type ReactNode, useState, useEffect } from "react";
import { ShieldCheck, LogOut, Sun, Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [nome, setNome] = useState("Super Admin");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/auth";
        return;
      }
      const n = data.session.user?.user_metadata?.nome;
      if (n) setNome(n);
      setReady(true);
    });

    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    window.location.href = "/auth";
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="OS Fácil" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
              OS Fácil
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Super Admin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{nome}</span>
          <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-8 w-8">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleLogout} className="h-8 w-8 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
