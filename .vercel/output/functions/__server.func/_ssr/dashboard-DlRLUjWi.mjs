import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { A as AppShell, C as Card, e as CardHeader, f as CardTitle, a as CardContent } from "./router-CkbN5ys6.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { s as startOfDay, a as subDays, f as format, p as ptBR } from "../_libs/date-fns.mjs";
import { U as Users, g as Package, F as FileText, s as DollarSign, t as TrendingUp } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, P as PieChart, b as Pie, c as Cell, L as Legend } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-Bvapkoxa.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/zod.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const BRL = (v) => v.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
function useCount(table) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const {
        count,
        error
      } = await supabase.from(table).select("*", {
        count: "exact",
        head: true
      });
      if (error) throw error;
      return count ?? 0;
    }
  });
}
function useFaturas() {
  return useQuery({
    queryKey: ["dashboard-faturas"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("faturas").select("id,total,status,created_at,pago_em").order("created_at", {
        ascending: false
      }).limit(500);
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useOS() {
  return useQuery({
    queryKey: ["dashboard-os"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("ordens_servico").select("id,status,total,created_at").order("created_at", {
        ascending: false
      }).limit(500);
      if (error) throw error;
      return data ?? [];
    }
  });
}
const STATUS_COLORS = {
  aberta: "#3b82f6",
  em_andamento: "#f59e0b",
  concluida: "#10b981",
  cancelada: "#ef4444",
  pendente: "#f59e0b",
  pago: "#10b981",
  vencido: "#ef4444",
  cancelado: "#6b7280"
};
function DashboardPage() {
  const clientes = useCount("clientes");
  const produtos = useCount("produtos");
  const ordens = useCount("ordens_servico");
  const faturasCount = useCount("faturas");
  const faturas = useFaturas();
  const ordensData = useOS();
  const totalPago = (faturas.data ?? []).filter((f) => f.status === "pago").reduce((s, f) => s + Number(f.total || 0), 0);
  const totalPendente = (faturas.data ?? []).filter((f) => f.status !== "pago").reduce((s, f) => s + Number(f.total || 0), 0);
  const days = Array.from({
    length: 14
  }).map((_, i) => {
    const d = startOfDay(subDays(/* @__PURE__ */ new Date(), 13 - i));
    return {
      d,
      label: format(d, "dd/MM", {
        locale: ptBR
      }),
      total: 0
    };
  });
  (faturas.data ?? []).forEach((f) => {
    if (f.status !== "pago" || !f.pago_em) return;
    const day = startOfDay(new Date(f.pago_em)).getTime();
    const bucket = days.find((x) => x.d.getTime() === day);
    if (bucket) bucket.total += Number(f.total || 0);
  });
  const statusMap = /* @__PURE__ */ new Map();
  (ordensData.data ?? []).forEach((o) => {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  });
  const statusPie = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] ?? "#6b7280"
  }));
  const cards = [{
    title: "Clientes",
    value: clientes.data,
    icon: Users,
    color: "text-blue-500"
  }, {
    title: "Produtos/Serviços",
    value: produtos.data,
    icon: Package,
    color: "text-purple-500"
  }, {
    title: "Ordens de Serviço",
    value: ordens.data,
    icon: FileText,
    color: "text-amber-500"
  }, {
    title: "Faturas",
    value: faturasCount.data,
    icon: DollarSign,
    color: "text-emerald-500"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: cards.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: `h-4 w-4 ${c.color}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: c.value ?? "—" }) })
    ] }, c.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Recebido" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-emerald-500", children: BRL(totalPago) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "A Receber" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-500", children: BRL(totalPendente) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
          "Faturamento (últimos 14 dias)"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: days, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: {
            fontSize: 11
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
            fontSize: 11
          }, tickFormatter: (v) => `R$${v}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => BRL(v), contentStyle: {
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "total", fill: "#f97316", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "OS por Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-72", children: statusPie.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-sm text-muted-foreground", children: "Sem ordens de serviço" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: statusPie, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 90, label: true, children: statusPie.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: e.color }, e.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8
          } })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as component
};
