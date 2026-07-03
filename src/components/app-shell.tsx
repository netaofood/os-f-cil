import { type ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar sessão
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/auth";
        return;
      }
      setReady(true);
    });

    // Carregar preferência de tema
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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onToggleTheme={toggleTheme} isDark={isDark} />
      <main className="flex-1 p-4 pb-20 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
