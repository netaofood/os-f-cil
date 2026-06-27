import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { u as useCurrentUsuario, A as AppShell, I as Input, S as Select, v as SelectTrigger, w as SelectValue, x as SelectContent, y as SelectItem, B as Button, i as AlertDialog, j as AlertDialogContent, k as AlertDialogHeader, l as AlertDialogTitle, m as AlertDialogDescription, n as AlertDialogFooter, o as AlertDialogCancel, p as AlertDialogAction, D as Dialog, q as DialogContent, r as DialogHeader, t as DialogTitle, L as Label, z as DialogFooter } from "./router-CkbN5ys6.mjs";
import "../_libs/seroval.mjs";
import { r as Search, P as Plus, L as LoaderCircle, R as Receipt, T as Trash2 } from "../_libs/lucide-react.mjs";
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
const brl = (n) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(n || 0);
const statusColor = {
  pendente: "#f59e0b",
  pago: "#10b981",
  vencido: "#ef4444",
  cancelado: "#6b7280"
};
function FaturasPage() {
  const {
    data: usuario
  } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("todos");
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [toDelete, setToDelete] = reactExports.useState(null);
  const {
    data: faturas = [],
    isLoading
  } = useQuery({
    queryKey: ["faturas"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("faturas").select("*, cliente:clientes(nome)").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const filtered = faturas.filter((f) => {
    if (statusFilter !== "todos" && f.status !== statusFilter) return false;
    const s = search.toLowerCase();
    if (!s) return true;
    return f.numero.toLowerCase().includes(s) || (f.cliente?.nome ?? "").toLowerCase().includes(s) || (f.cliente_nome ?? "").toLowerCase().includes(s);
  });
  async function handleDelete() {
    if (!toDelete) return;
    const {
      error
    } = await supabase.from("faturas").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Fatura removida");
      qc.invalidateQueries({
        queryKey: ["faturas"]
      });
    }
    setToDelete(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Faturas", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar por número ou cliente…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pendente", children: "Pendentes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pago", children: "Pagas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vencido", children: "Vencidas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelado", children: "Canceladas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setNewOpen(true), disabled: !usuario?.empresa_id, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Nova fatura"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-8 w-8 opacity-40" }),
      faturas.length === 0 ? "Nenhuma fatura ainda. Gere uma a partir de uma OS." : "Nenhum resultado."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: filtered.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/faturas/$id", params: {
        id: f.id
      }, className: "flex-1 min-w-0 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-semibold w-20 shrink-0", children: f.numero }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: f.cliente?.nome ?? f.cliente_nome ?? "Sem cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
            new Date(f.created_at).toLocaleDateString("pt-BR"),
            " ·",
            " ",
            brl(Number(f.total))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-1 rounded-full text-white shrink-0 capitalize", style: {
          backgroundColor: statusColor[f.status] ?? "#6b7280"
        }, children: f.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setToDelete(f), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, f.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NovaFaturaDialog, { open: newOpen, onOpenChange: setNewOpen, empresaId: usuario?.empresa_id ?? null, onCreated: () => qc.invalidateQueries({
      queryKey: ["faturas"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!toDelete, onOpenChange: (o) => !o && setToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Remover fatura ",
          toDelete?.numero,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Esta ação não pode ser desfeita." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, children: "Remover" })
      ] })
    ] }) })
  ] });
}
function NovaFaturaDialog({
  open,
  onOpenChange,
  empresaId,
  onCreated
}) {
  const [saving, setSaving] = reactExports.useState(false);
  const [osId, setOsId] = reactExports.useState("_none");
  const [vencimento, setVencimento] = reactExports.useState("");
  const {
    data: ordens = []
  } = useQuery({
    queryKey: ["ordens-para-fatura"],
    enabled: open,
    queryFn: async () => {
      const {
        data
      } = await supabase.from("ordens_servico").select("id, numero, total, cliente_id, cliente:clientes(nome)").order("created_at", {
        ascending: false
      }).limit(100);
      return data ?? [];
    }
  });
  async function handleCreate() {
    if (!empresaId) return;
    setSaving(true);
    const {
      data: numero,
      error: e1
    } = await supabase.rpc("next_fatura_numero", {
      _empresa_id: empresaId
    });
    if (e1 || !numero) {
      setSaving(false);
      toast.error(e1?.message ?? "Erro ao gerar número");
      return;
    }
    let itens = [];
    let total = 0;
    let cliente_id = null;
    let cliente_nome = null;
    const fromOs = osId !== "_none" ? ordens.find((o) => o.id === osId) : null;
    if (fromOs) {
      cliente_id = fromOs.cliente_id;
      cliente_nome = fromOs.cliente?.nome ?? null;
      const {
        data: its
      } = await supabase.from("itens_os").select("descricao, quantidade, preco_unitario, total").eq("os_id", fromOs.id);
      itens = (its ?? []).map((i) => ({
        descricao: i.descricao,
        quantidade: Number(i.quantidade),
        preco_unitario: Number(i.preco_unitario),
        total: Number(i.total)
      }));
      total = Number(fromOs.total) || 0;
    }
    const {
      error
    } = await supabase.from("faturas").insert({
      empresa_id: empresaId,
      numero,
      os_id: fromOs?.id ?? null,
      cliente_id,
      cliente_nome,
      itens,
      total,
      vencimento: vencimento || null
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Fatura criada");
    onCreated();
    onOpenChange(false);
    setOsId("_none");
    setVencimento("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Nova fatura" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "A partir de OS (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: osId, onValueChange: setOsId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Fatura em branco —" }),
            ordens.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: o.id, children: [
              "#",
              o.numero,
              " — ",
              o.cliente?.nome ?? "sem cliente",
              " ·",
              " ",
              brl(Number(o.total))
            ] }, o.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "venc", children: "Vencimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "venc", type: "date", value: vencimento, onChange: (e) => setVencimento(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleCreate, disabled: saving, children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
        "Criar"
      ] })
    ] })
  ] }) });
}
export {
  FaturasPage as component
};
