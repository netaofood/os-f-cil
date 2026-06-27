import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { u as useCurrentUsuario, A as AppShell, I as Input, B as Button, i as AlertDialog, j as AlertDialogContent, k as AlertDialogHeader, l as AlertDialogTitle, m as AlertDialogDescription, n as AlertDialogFooter, o as AlertDialogCancel, p as AlertDialogAction, D as Dialog, q as DialogContent, r as DialogHeader, t as DialogTitle, L as Label, S as Select, v as SelectTrigger, w as SelectValue, x as SelectContent, y as SelectItem, z as DialogFooter } from "./router-CkbN5ys6.mjs";
import { B as Badge } from "./badge-CtW5P91g.mjs";
import "../_libs/seroval.mjs";
import { r as Search, P as Plus, L as LoaderCircle, a as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
function brl(n) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function ProdutosPage() {
  const {
    data: usuario
  } = useCurrentUsuario();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [toDelete, setToDelete] = reactExports.useState(null);
  const {
    data: produtos = [],
    isLoading
  } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("produtos").select("*").order("nome");
      if (error) throw error;
      return data;
    }
  });
  const filtered = produtos.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()));
  async function handleDelete() {
    if (!toDelete) return;
    const {
      error
    } = await supabase.from("produtos").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Item removido");
      qc.invalidateQueries({
        queryKey: ["produtos"]
      });
    }
    setToDelete(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Produtos & Serviços", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Novo item"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: produtos.length === 0 ? "Nenhum item cadastrado." : "Nenhum resultado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: p.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: p.tipo === "servico" ? "secondary" : "outline", children: p.tipo === "servico" ? "Serviço" : "Produto" }),
          !p.ativo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Inativo" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          brl(Number(p.preco)),
          " / ",
          p.unidade
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
          setEditing(p);
          setOpen(true);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setToDelete(p), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProdutoDialog, { open, onOpenChange: setOpen, editing, empresaId: usuario?.empresa_id ?? null, onSaved: () => qc.invalidateQueries({
      queryKey: ["produtos"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!toDelete, onOpenChange: (o) => !o && setToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remover item?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "Esta ação não pode ser desfeita. Item: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: toDelete?.nome })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, children: "Remover" })
      ] })
    ] }) })
  ] });
}
function ProdutoDialog({
  open,
  onOpenChange,
  editing,
  empresaId,
  onSaved
}) {
  const [saving, setSaving] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    nome: "",
    tipo: "servico",
    preco: "",
    unidade: "un",
    ativo: true
  });
  reactExports.useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          nome: editing.nome,
          tipo: editing.tipo,
          preco: String(editing.preco),
          unidade: editing.unidade,
          ativo: editing.ativo
        });
      } else {
        setForm({
          nome: "",
          tipo: "servico",
          preco: "",
          unidade: "un",
          ativo: true
        });
      }
    }
  }, [open, editing]);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!empresaId) return toast.error("Empresa não configurada");
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    const preco = Number(form.preco.replace(",", "."));
    if (isNaN(preco) || preco < 0) return toast.error("Preço inválido");
    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      preco,
      unidade: form.unidade.trim() || "un",
      ativo: form.ativo
    };
    const {
      error
    } = editing ? await supabase.from("produtos").update(payload).eq("id", editing.id) : await supabase.from("produtos").insert({
      ...payload,
      empresa_id: empresaId
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Item atualizado" : "Item cadastrado");
    onSaved();
    onOpenChange(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar item" : "Novo item" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "p-nome", children: "Nome *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "p-nome", value: form.nome, onChange: (e) => setForm({
          ...form,
          nome: e.target.value
        }), maxLength: 120, required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tipo, onValueChange: (v) => setForm({
            ...form,
            tipo: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "servico", children: "Serviço" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "produto", children: "Produto" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "p-un", children: "Unidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "p-un", value: form.unidade, onChange: (e) => setForm({
            ...form,
            unidade: e.target.value
          }), maxLength: 10, placeholder: "un, h, kg…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "p-preco", children: "Preço (R$)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "p-preco", inputMode: "decimal", value: form.preco, onChange: (e) => setForm({
          ...form,
          preco: e.target.value
        }), placeholder: "0,00" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.ativo, onChange: (e) => setForm({
          ...form,
          ativo: e.target.checked
        }) }),
        "Ativo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
          "Salvar"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ProdutosPage as component
};
