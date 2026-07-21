import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Package, FileText, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_OS, getStatusCor } from "@/lib/status-os";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
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
        .select("id,total,status,created_at,pago_em,vencimento")
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

function DashboardPage() {
  const clientes = useCount("clientes");
  const produtos = useCount("produtos");
  const ordens = useCount("ordens_servico");
  const faturasCount = useCount("faturas");
  const faturas = useFaturas();
  const ordensData = useOS();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const totalPago = (faturas.data ?? [])
    .filter((f) => f.status === "pago")
    .reduce((s, f) => s + Number(f.total || 0), 0);

  const totalAReceber = (faturas.data ?? [])
    .filter((f) => ["pendente", "aceita"].includes(f.status))
    .reduce((s, f) => s + Number(f.total || 0), 0);

  const totalVencido = (faturas.data ?? [])
    .filter((f) => {
      if (f.status === "pago" || f.status === "cancelado") return false;
      if (!f.vencimento) return false;
      return new Date(f.vencimento) < hoje;
    })
    .reduce((s, f) => s + Number(f.total || 0), 0);

  const faturasVencidas = (faturas.data ?? []).filter((f) => {
    if (f.status === "pago" || f.status === "cancelado") return false;
    if (!f.vencimento) return false;
    return new Date(f.vencimento) < hoje;
  }).length;

  // Faturamento últimos 14 dias
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    return { d, label: format(d, "dd/MM", { locale: ptBR }), total: 0 };
  });
  (faturas.data ?? []).forEach((f) => {
    if (f.status !== "pago" || !f.pago_em) return;
    const day = startOfDay(new Date(f.pago_em)).getTime();
    const bucket = days.find((x) => x.d.getTime() === day);
    if (bucket) bucket.total += Number(f.total || 0);
  });

  // OS por status — usando STATUS_OS global
  const statusMap = new Map<string, number>();
  (ordensData.data ?? []).forEach((o) => {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  });
  const statusPie = STATUS_OS
    .map((s) => ({
      name: s.nome,
      value: statusMap.get(s.nome) ?? 0,
      color: s.cor,
    }))
    .filter((s) => s.value > 0);

  const cards = [
    { title: "Clientes", value: clientes.data, icon: Users, color: "text-blue-500" },
    { title: "Produtos/Serviços", value: produtos.data, icon: Package, color: "text-purple-500" },
    { title: "Ordens de Serviço", value: ordens.data, icon: FileText, color: "text-amber-500" },
    { title: "Faturas", value: faturasCount.data, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <AppShell title="Dashboard">
      {/* Contadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold font-mono">{c.value ?? "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Card className="border-green-500/30">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">Recebido</p>
            </div>
            <div className="text-xl font-bold text-green-500 font-mono">{BRL(totalPago)}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground font-medium">A receber</p>
            </div>
            <div className="text-xl font-bold text-blue-500 font-mono">{BRL(totalAReceber)}</div>
          </CardContent>
        </Card>
        <Card className={`${faturasVencidas > 0 ? "border-red-500/50" : "border-border"}`}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${faturasVencidas > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              <p className="text-xs text-muted-foreground font-medium">
                Vencido {faturasVencidas > 0 && `(${faturasVencidas})`}
              </p>
            </div>
            <div className={`text-xl font-bold font-mono ${faturasVencidas > 0 ? "text-red-500" : "text-muted-foreground"}`}>
              {BRL(totalVencido)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Faturamento — últimos 14 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} width={55} />
                <Tooltip
                  formatter={(v: number) => BRL(v)}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="#00B4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OS por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {statusPie.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Sem ordens de serviço
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} label={({ name, value }) => `${value}`}>
                    {statusPie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
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
