import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Package, FileText, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

function useFaturas() {
  return useQuery({
    queryKey: ["dashboard-faturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("id,total,status,created_at,pago_em")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useOS() {
  return useQuery({
    queryKey: ["dashboard-os"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id,status,total,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

const STATUS_COLORS: Record<string, string> = {
  aberta: "#3b82f6",
  em_andamento: "#f59e0b",
  concluida: "#10b981",
  cancelada: "#ef4444",
  pendente: "#f59e0b",
  paga: "#10b981",
  vencida: "#ef4444",
};

function DashboardPage() {
  const clientes = useCount("clientes");
  const produtos = useCount("produtos");
  const ordens = useCount("ordens_servico");
  const faturasCount = useCount("faturas");
  const faturas = useFaturas();
  const ordensData = useOS();

  const totalPago = (faturas.data ?? [])
    .filter((f) => f.status === "paga")
    .reduce((s, f) => s + Number(f.total || 0), 0);

  const totalPendente = (faturas.data ?? [])
    .filter((f) => f.status !== "paga")
    .reduce((s, f) => s + Number(f.total || 0), 0);

  // Faturamento últimos 14 dias (por pago_em)
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    return { d, label: format(d, "dd/MM", { locale: ptBR }), total: 0 };
  });
  (faturas.data ?? []).forEach((f) => {
    if (f.status !== "paga" || !f.pago_em) return;
    const day = startOfDay(new Date(f.pago_em)).getTime();
    const bucket = days.find((x) => x.d.getTime() === day);
    if (bucket) bucket.total += Number(f.total || 0);
  });

  // OS por status
  const statusMap = new Map<string, number>();
  (ordensData.data ?? []).forEach((o) => {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  });
  const statusPie = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] ?? "#6b7280",
  }));

  const cards = [
    { title: "Clientes", value: clientes.data, icon: Users, color: "text-blue-500" },
    { title: "Produtos/Serviços", value: produtos.data, icon: Package, color: "text-purple-500" },
    { title: "Ordens de Serviço", value: ordens.data, icon: FileText, color: "text-amber-500" },
    { title: "Faturas", value: faturasCount.data, icon: DollarSign, color: "text-emerald-500" },
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
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value ?? "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{BRL(totalPago)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{BRL(totalPendente)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Faturamento (últimos 14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(v: number) => BRL(v)}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">OS por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {statusPie.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Sem ordens de serviço
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {statusPie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
