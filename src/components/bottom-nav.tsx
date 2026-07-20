import { useEffect, useState } from "react";
import { LayoutDashboard, FileText, Users, Package, Receipt, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const allItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin"] },
  { icon: FileText,        label: "OSs",       href: "/ordens",     roles: ["admin", "colaborador"] },
  { icon: Users,           label: "Clientes",  href: "/clientes",   roles: ["admin", "colaborador"] },
  { icon: Package,         label: "Produtos",  href: "/produtos",   roles: ["admin", "colaborador"] },
  { icon: Receipt,         label: "Faturas",   href: "/faturas",    roles: ["admin"] },
  { icon: Settings,        label: "Config",    href: "/configuracoes", roles: ["admin"] },
];

export function BottomNav() {
  const [perfil, setPerfil] = useState<string | null>(null);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    async function loadPerfil() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return;
      const { data } = await supabase
        .from("usuarios")
        .select("perfil")
        .eq("auth_user_id", sessionData.session.user.id)
        .maybeSingle();
      if (data?.perfil) setPerfil(data.perfil);
    }
    loadPerfil();
  }, []);

  // Enquanto não carregou o perfil, mostra apenas OSs e Clientes
  const items = perfil
    ? allItems.filter((i) => i.roles.includes(perfil))
    : allItems.filter((i) => i.roles.includes("colaborador"));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16">
      <div className="flex h-full">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors
                ${active
                  ? "text-primary dark:drop-shadow-[0_0_6px_#00B4FF]"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
