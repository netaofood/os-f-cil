import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Package, FileText, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function useCount(table: "clientes" | "produtos" | "ordens_servico" | "faturas") {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function DashboardPage() {
  const clientes = useCount("clientes");
  const produtos = useCount("produtos");
  const ordens = useCount("ordens_servico");
  const faturas = useCount("faturas");

  const cards = [
    { title: "Clientes", value: clientes.data, icon: Users },
    { title: "Produtos/Serviços", value: produtos.data, icon: Package },
    { title: "Ordens de Serviço", value: ordens.data, icon: FileText },
    { title: "Faturas", value: faturas.data, icon: DollarSign },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value ?? "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border p-4 bg-card">
        <h2 className="font-semibold mb-2">Próximos passos</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Cadastre seus <strong>clientes</strong> e <strong>produtos/serviços</strong></li>
          <li>Em breve: criação de Ordens de Serviço e Faturas</li>
          <li>Configure dados da empresa em <strong>Configurações</strong></li>
        </ul>
      </div>
    </AppShell>
  );
}
