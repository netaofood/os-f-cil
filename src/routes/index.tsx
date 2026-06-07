import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/os-facil-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OS Fácil — Gestão de Ordens de Serviço" },
      { name: "description", content: "OS Fácil: gestão simples e rápida de ordens de serviço." },
      { property: "og:title", content: "OS Fácil" },
      { property: "og:description", content: "Gestão simples e rápida de ordens de serviço." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-lg font-bold leading-tight">OS Fácil</h1>
            <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut className="h-4 w-4 mr-1" /> Sair
        </Button>
      </header>

      <section className="max-w-md mx-auto px-5 py-8 space-y-4">
        <h2 className="text-xl font-semibold">Bem-vindo 👋</h2>
        <p className="text-sm text-muted-foreground">
          A base do OS Fácil está pronta — autenticação, multi-tenant e banco de dados configurados.
          Nas próximas fases construiremos: Clientes, Produtos, OS, Faturas, Agenda, Dashboard,
          Relatórios e PWA.
        </p>

        <div className="rounded-lg border border-border p-4 bg-card space-y-2">
          <h3 className="font-medium">Próximas fases</h3>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
            <li>Cadastro de empresa, clientes, produtos e config</li>
            <li>OS com log de alterações + autocomplete</li>
            <li>Faturas + PDF + assinatura + link público</li>
            <li>Agenda Dia/Semana/Mês</li>
            <li>Dashboard + Relatórios</li>
            <li>PWA instalável + push</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
