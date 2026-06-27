import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-B56izvNn.mjs";
import { F as Route$1, A as AppShell, B as Button, c as cn, C as Card, a as CardContent, L as Label, S as Select, v as SelectTrigger, w as SelectValue, x as SelectContent, y as SelectItem, D as Dialog, q as DialogContent, r as DialogHeader, t as DialogTitle, I as Input, z as DialogFooter, u as useCurrentUsuario } from "./router-CkbN5ys6.mjs";
import { T as Textarea } from "./textarea-CtYEOiuR.mjs";
import "../_libs/seroval.mjs";
import { p as CircleX, o as CircleCheck, L as LoaderCircle, A as ArrowLeft, y as Send, z as ChevronRight, a as Pencil, X, d as Save, H as History, v as Clock, e as Check, G as Copy, T as Trash2, x as PackagePlus, P as Plus } from "../_libs/lucide-react.mjs";
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
const brl$1 = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
function ItemOSForm({ osId, onItemAdded }) {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();
  const [descricao, setDescricao] = reactExports.useState("");
  const [quantidade, setQuantidade] = reactExports.useState("1");
  const [precoUnitario, setPrecoUnitario] = reactExports.useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = reactExports.useState(null);
  const [showSugestoes, setShowSugestoes] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-min"],
    queryFn: async () => {
      const { data } = await supabase.from("produtos").select("id,nome,preco,unidade,tipo").eq("ativo", true).order("nome");
      return data ?? [];
    }
  });
  const sugestoes = descricao.trim().length === 0 ? produtos.slice(0, 8) : produtos.filter(
    (p) => p.nome.toLowerCase().includes(descricao.toLowerCase())
  ).slice(0, 8);
  reactExports.useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  function selecionarProduto(p) {
    setDescricao(p.nome);
    setPrecoUnitario(String(p.preco));
    setProdutoSelecionadoId(p.id);
    setShowSugestoes(false);
    setTimeout(() => {
      const qtdInput = containerRef.current?.querySelector("[data-qtd]");
      qtdInput?.focus();
      qtdInput?.select();
    }, 50);
  }
  function handleDescricaoChange(v) {
    setDescricao(v);
    setProdutoSelecionadoId(null);
    setShowSugestoes(true);
  }
  async function handleSalvar() {
    const desc = descricao.trim();
    if (!desc) {
      toast.error("Informe a descrição do item");
      inputRef.current?.focus();
      return;
    }
    const qtd = Number(quantidade) || 1;
    const preco = Number(precoUnitario) || 0;
    setSaving(true);
    try {
      if (!produtoSelecionadoId && usuario?.empresa_id) {
        const jaExiste = produtos.find(
          (p) => p.nome.toLowerCase() === desc.toLowerCase()
        );
        if (!jaExiste) {
          const { error: prodErr } = await supabase.from("produtos").insert({
            empresa_id: usuario.empresa_id,
            nome: desc,
            preco,
            unidade: "un",
            tipo: "servico",
            // padrão livre → serviço
            ativo: true
          });
          if (prodErr) {
            console.warn("Aviso: não foi possível cadastrar o produto automaticamente", prodErr.message);
          } else {
            qc.invalidateQueries({ queryKey: ["produtos-min"] });
            qc.invalidateQueries({ queryKey: ["produtos"] });
            toast.info(`"${desc}" adicionado ao catálogo de produtos/serviços`);
          }
        }
      }
      const { error } = await supabase.from("itens_os").insert({
        os_id: osId,
        descricao: desc,
        quantidade: qtd,
        preco_unitario: preco
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["itens_os", osId] });
      qc.invalidateQueries({ queryKey: ["os", osId] });
      qc.invalidateQueries({ queryKey: ["log_os", osId] });
      qc.invalidateQueries({ queryKey: ["ordens"] });
      setDescricao("");
      setQuantidade("1");
      setPrecoUnitario("");
      setProdutoSelecionadoId(null);
      setShowSugestoes(false);
      inputRef.current?.focus();
      onItemAdded?.();
    } catch (err) {
      toast.error(err.message ?? "Erro ao adicionar item");
    } finally {
      setSaving(false);
    }
  }
  const produtoNaoEncontrado = descricao.trim().length > 0 && !produtoSelecionadoId && !produtos.some((p) => p.nome.toLowerCase() === descricao.trim().toLowerCase());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-3 border-t border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Adicionar item" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Produto / Serviço" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          value: descricao,
          onChange: (e) => handleDescricaoChange(e.target.value),
          onFocus: () => setShowSugestoes(true),
          placeholder: "Digite para buscar ou descrever livremente…",
          autoComplete: "off"
        }
      ),
      showSugestoes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto", children: sugestoes.length === 0 && descricao.trim().length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 text-xs text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "h-3.5 w-3.5 shrink-0" }),
        "Novo item — será cadastrado no catálogo ao salvar"
      ] }) : sugestoes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onMouseDown: (e) => {
            e.preventDefault();
            selecionarProduto(p);
          },
          className: cn(
            "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between gap-2",
            produtoSelecionadoId === p.id && "bg-accent"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 min-w-0", children: [
              produtoSelecionadoId === p.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: p.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: p.tipo === "servico" ? "serviço" : "produto" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium tabular-nums shrink-0", children: brl$1(p.preco) })
          ]
        },
        p.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-qtd": true,
            type: "number",
            min: "0.001",
            step: "0.01",
            value: quantidade,
            onChange: (e) => setQuantidade(e.target.value),
            onFocus: (e) => e.target.select()
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Preço unitário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: "0",
            step: "0.01",
            value: precoUnitario,
            onChange: (e) => setPrecoUnitario(e.target.value),
            onFocus: (e) => e.target.select(),
            placeholder: "0,00"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block text-transparent select-none", children: "ação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "w-full",
            onClick: handleSalvar,
            disabled: saving || !descricao.trim(),
            children: [
              saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              "Salvar item"
            ]
          }
        )
      ] })
    ] }),
    produtoNaoEncontrado && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { className: "h-3 w-3 shrink-0" }),
      "Este item não está no catálogo e será cadastrado automaticamente ao salvar."
    ] })
  ] });
}
const brl = (n) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(n || 0);
function ItemRow({
  item,
  osId
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = reactExports.useState(false);
  const [desc, setDesc] = reactExports.useState(item.descricao);
  const [qtd, setQtd] = reactExports.useState(String(item.quantidade));
  const [preco, setPreco] = reactExports.useState(String(item.preco_unitario));
  const [saving, setSaving] = reactExports.useState(false);
  async function handleSave() {
    setSaving(true);
    const {
      error
    } = await supabase.from("itens_os").update({
      descricao: desc.trim() || item.descricao,
      quantidade: Number(qtd) || 1,
      preco_unitario: Number(preco) || 0
    }).eq("id", item.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setEditing(false);
      qc.invalidateQueries({
        queryKey: ["itens_os", osId]
      });
      qc.invalidateQueries({
        queryKey: ["os", osId]
      });
    }
  }
  async function handleDelete() {
    const {
      error
    } = await supabase.from("itens_os").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({
        queryKey: ["itens_os", osId]
      });
      qc.invalidateQueries({
        queryKey: ["os", osId]
      });
    }
  }
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 border-b border-border/50 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: desc, onChange: (e) => setDesc(e.target.value), placeholder: "Descrição", className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "col-span-3 text-sm", type: "number", step: "0.01", min: "0.001", value: qtd, onChange: (e) => setQtd(e.target.value), onFocus: (e) => e.target.select(), placeholder: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "col-span-4 text-sm", type: "number", step: "0.01", min: "0", value: preco, onChange: (e) => setPreco(e.target.value), onFocus: (e) => e.target.select(), placeholder: "Preço unit." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5 flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(false), disabled: saving, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSave, disabled: saving, children: [
            saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 mr-1" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm border-b border-border/50 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: item.descricao }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        Number(item.quantidade),
        " × ",
        brl(Number(item.preco_unitario))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium tabular-nums shrink-0", children: brl(Number(item.total)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
      setDesc(item.descricao);
      setQtd(String(item.quantidade));
      setPreco(String(item.preco_unitario));
      setEditing(true);
    }, className: "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: handleDelete, className: "h-8 w-8 shrink-0 text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
  ] });
}
function OrdemDetailPage() {
  const {
    id
  } = Route$1.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [shareModal, setShareModal] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const {
    data: os,
    isLoading
  } = useQuery({
    queryKey: ["os", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("ordens_servico").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: clientes = []
  } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("clientes").select("id,nome").order("nome");
      return data ?? [];
    }
  });
  const {
    data: statuses = []
  } = useQuery({
    queryKey: ["status_os"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("status_os").select("*").order("ordem");
      return data ?? [];
    }
  });
  const {
    data: formas = []
  } = useQuery({
    queryKey: ["formas_pagamento"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("formas_pagamento").select("*").eq("ativo", true).order("nome");
      return data ?? [];
    }
  });
  const {
    data: itens = []
  } = useQuery({
    queryKey: ["itens_os", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("itens_os").select("*").eq("os_id", id);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: logs = []
  } = useQuery({
    queryKey: ["log_os", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("log_os").select("*, usuario:usuarios(nome)").eq("os_id", id).order("created_at", {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  const [form, setForm] = reactExports.useState({
    cliente_id: "",
    status: "",
    forma_pagamento: "",
    diagnostico: "",
    observacoes: ""
  });
  reactExports.useEffect(() => {
    if (os) {
      setForm({
        cliente_id: os.cliente_id ?? "",
        status: os.status,
        forma_pagamento: os.forma_pagamento ?? "",
        diagnostico: os.diagnostico ?? "",
        observacoes: os.observacoes ?? ""
      });
    }
  }, [os]);
  function handleCancelEdit() {
    if (!os) return;
    setForm({
      cliente_id: os.cliente_id ?? "",
      status: os.status,
      forma_pagamento: os.forma_pagamento ?? "",
      diagnostico: os.diagnostico ?? "",
      observacoes: os.observacoes ?? ""
    });
    setEditing(false);
  }
  async function handleSave() {
    if (!os) return;
    setSaving(true);
    const {
      error
    } = await supabase.from("ordens_servico").update({
      cliente_id: form.cliente_id || null,
      status: form.status,
      forma_pagamento: form.forma_pagamento || null,
      diagnostico: form.diagnostico || null,
      observacoes: form.observacoes || null
    }).eq("id", os.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("OS atualizada");
      setEditing(false);
      qc.invalidateQueries({
        queryKey: ["os", id]
      });
      qc.invalidateQueries({
        queryKey: ["log_os", id]
      });
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
    }
  }
  async function handleStatusRapido(novoStatus) {
    if (!os || os.status === novoStatus) return;
    const {
      error
    } = await supabase.from("ordens_servico").update({
      status: novoStatus
    }).eq("id", os.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({
        queryKey: ["os", id]
      });
      qc.invalidateQueries({
        queryKey: ["log_os", id]
      });
      qc.invalidateQueries({
        queryKey: ["ordens"]
      });
    }
  }
  const publicUrl = os?.link_publico_token ? `${window.location.origin}/os/${os.link_publico_token}?v=2` : null;
  const clienteNomeMsg = clientes.find((c) => c.id === os?.cliente_id)?.nome ?? "";
  const shareMessage = publicUrl ? `Olá ${clienteNomeMsg}, segue seu orçamento ${publicUrl}` : "";
  function copyLink() {
    if (!shareMessage) return;
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    toast.success("Mensagem copiada!");
    setTimeout(() => setCopied(false), 2e3);
  }
  function openWhatsApp() {
    if (!shareMessage) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  }
  const clienteNome = clientes.find((c) => c.id === os?.cliente_id)?.nome ?? "Sem cliente";
  statuses.find((s) => s.nome === os?.status)?.cor ?? "#6b7280";
  const aprovacaoIcon = {
    aprovada: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-500" }),
    rejeitada: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" })
  }[os?.aprovacao ?? ""] ?? null;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "OS", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) });
  if (!os) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "OS", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "OS não encontrada." }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: `OS #${os.numero}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({
        to: "/ordens"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
        " Voltar"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShareModal(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1" }),
        "Enviar orçamento"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: "Status:" }),
      statuses.map((s, i) => {
        const ativo = os.status === s.nome;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleStatusRapido(s.nome), className: cn("flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all", ativo ? "text-white border-transparent shadow-sm" : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"), style: ativo ? {
          backgroundColor: s.cor
        } : {}, children: [
          i > 0 && !ativo && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 opacity-40" }),
          s.nome
        ] }, s.id);
      }),
      os.aprovacao && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs ml-2", children: [
        aprovacaoIcon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-medium", os.aprovacao === "aprovada" ? "text-green-600" : "text-red-600"), children: os.aprovacao === "aprovada" ? "Aprovado pelo cliente" : "Recusado pelo cliente" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-base", children: "Dados gerais" }),
            !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
              " Editar"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleCancelEdit, disabled: saving, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 mr-1" }),
                " Cancelar"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSave, disabled: saving, children: [
                saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5 mr-1" }),
                "Salvar"
              ] })
            ] })
          ] }),
          !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Cliente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: clienteNome })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Forma de pagamento" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: os.forma_pagamento || "—" })
              ] })
            ] }),
            os.diagnostico && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Diagnóstico" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: os.diagnostico })
            ] }),
            os.observacoes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Observações" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: os.observacoes })
            ] }),
            !os.diagnostico && !os.observacoes && !os.forma_pagamento && !os.cliente_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs italic", children: 'Nenhum dado preenchido. Clique em "Editar" para preencher.' })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cliente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cliente_id || "_none", onValueChange: (v) => setForm({
                  ...form,
                  cliente_id: v === "_none" ? "" : v
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Sem cliente —" }),
                    clientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.nome }, c.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Forma de pagamento" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.forma_pagamento || "_none", onValueChange: (v) => setForm({
                  ...form,
                  forma_pagamento: v === "_none" ? "" : v
                }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecionar" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "— Não definida —" }),
                    formas.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.nome, children: f.nome }, f.id))
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Diagnóstico ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.diagnostico, onChange: (e) => setForm({
                ...form,
                diagnostico: e.target.value
              }), rows: 3, maxLength: 2e3, placeholder: "Descreva o problema ou serviço…" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Observações ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(opcional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.observacoes, onChange: (e) => setForm({
                ...form,
                observacoes: e.target.value
              }), rows: 2, maxLength: 2e3, placeholder: "Informações adicionais…" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-base", children: "Itens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              "Total: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: brl(Number(os.total)) })
            ] })
          ] }),
          itens.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-3", children: "Nenhum item adicionado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: itens.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(ItemRow, { item: it, osId: os.id }, it.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ItemOSForm, { osId: os.id })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        os.aprovacao && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: cn("border-2", os.aprovacao === "aprovada" ? "border-green-500/40" : "border-red-500/40"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 font-semibold text-sm mb-2", os.aprovacao === "aprovada" ? "text-green-600" : "text-red-600"), children: [
            aprovacaoIcon,
            os.aprovacao === "aprovada" ? "Orçamento aprovado" : "Orçamento recusado"
          ] }),
          os.aprovacao_em && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(os.aprovacao_em).toLocaleString("pt-BR") }),
          os.aprovacao_obs && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 italic", children: [
            '"',
            os.aprovacao_obs,
            '"'
          ] }),
          os.assinatura_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: os.assinatura_url, alt: "Assinatura", className: "mt-3 max-h-20 border border-border rounded bg-white" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Histórico" })
          ] }),
          logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nenhuma alteração registrada." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l border-border/60 space-y-4 ml-2", children: logs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "ml-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-primary/70" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-foreground", children: l.campo_alterado }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              l.valor_anterior ?? "—",
              " → ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: l.valor_novo ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
              l.usuario?.nome ?? "Sistema",
              " · ",
              new Date(l.created_at).toLocaleString("pt-BR")
            ] })
          ] }, l.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: shareModal, onOpenChange: setShareModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enviar orçamento ao cliente" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Compartilhe o link abaixo com o cliente. Ele poderá visualizar o orçamento e aprovar ou recusar sem precisar de login." }),
        publicUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: shareMessage, readOnly: true, className: "text-xs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: copyLink, children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full bg-green-600 hover:bg-green-700 text-white", onClick: openWhatsApp, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
            "Enviar pelo WhatsApp"
          ] }),
          os.aprovacao && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 text-sm p-3 rounded-lg", os.aprovacao === "aprovada" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"), children: [
            aprovacaoIcon,
            "Cliente já ",
            os.aprovacao === "aprovada" ? "aprovou" : "recusou",
            " este orçamento."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "Link público não disponível. Atualize a página ou contate o suporte." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShareModal(false), children: "Fechar" }) })
    ] }) })
  ] });
}
export {
  OrdemDetailPage as component
};
