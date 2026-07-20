import { LayoutDashboard, FileText, Users, Package, Receipt, Settings } from "lucide-react";
import { useCurrentUsuario } from "@/hooks/use-current-user";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "OSs", href: "/ordens" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Receipt, label: "Faturas", href: "/faturas" },
  { icon: Settings, label: "Config", href: "/configuracoes" },
];

export function BottomNav() {
  const { data: usuario, isLoading } = useCurrentUsuario();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  const items = isLoading
    ? navItems.filter((i) => i.href !== "/configuracoes") // esconde enquanto carrega
    : usuario?.perfil === "colaborador"
      ? navItems.filter((i) => i.href !== "/configuracoes" && i.href !== "/faturas")
      : navItems;

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
                  ? "text-primary dark:text-primary dark:drop-shadow-[0_0_6px_#00B4FF]"
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
